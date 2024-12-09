"use strict";
import * as Common from "../../core/common/common.js";
import * as Host from "../../core/host/host.js";
import * as Coordinator from "../components/render_coordinator/render_coordinator.js";
import { processForDebugging, processStartLoggingForDebugging } from "./Debugging.js";
import { getDomState, visibleOverlap } from "./DomState.js";
import { getLoggingConfig } from "./LoggingConfig.js";
import { logChange, logClick, logDrag, logHover, logImpressions, logKeyDown, logResize } from "./LoggingEvents.js";
import { getLoggingState, getOrCreateLoggingState } from "./LoggingState.js";
import { getNonDomLoggables, hasNonDomLoggables, unregisterAllLoggables, unregisterLoggables } from "./NonDomState.js";
const PROCESS_DOM_INTERVAL = 500;
const KEYBOARD_LOG_INTERVAL = 3e3;
const HOVER_LOG_INTERVAL = 1e3;
const DRAG_LOG_INTERVAL = 1250;
const DRAG_REPORT_THRESHOLD = 50;
const CLICK_LOG_INTERVAL = 500;
const RESIZE_LOG_INTERVAL = 200;
const RESIZE_REPORT_THRESHOLD = 50;
const noOpThrottler = {
  schedule: async () => {
  }
};
let processingThrottler = noOpThrottler;
export let keyboardLogThrottler = noOpThrottler;
let hoverLogThrottler = noOpThrottler;
let dragLogThrottler = noOpThrottler;
export let clickLogThrottler = noOpThrottler;
export let resizeLogThrottler = noOpThrottler;
const mutationObserver = new MutationObserver(scheduleProcessing);
const resizeObserver = new ResizeObserver(onResizeOrIntersection);
const intersectionObserver = new IntersectionObserver(onResizeOrIntersection);
const documents = [];
const pendingResize = /* @__PURE__ */ new Map();
const pendingChange = /* @__PURE__ */ new Set();
function observeMutations(roots) {
  for (const root of roots) {
    mutationObserver.observe(root, { attributes: true, childList: true, subtree: true });
  }
}
let logging = false;
export function isLogging() {
  return logging;
}
export async function startLogging(options) {
  logging = true;
  processingThrottler = options?.processingThrottler || new Common.Throttler.Throttler(PROCESS_DOM_INTERVAL);
  keyboardLogThrottler = options?.keyboardLogThrottler || new Common.Throttler.Throttler(KEYBOARD_LOG_INTERVAL);
  hoverLogThrottler = options?.hoverLogThrottler || new Common.Throttler.Throttler(HOVER_LOG_INTERVAL);
  dragLogThrottler = options?.dragLogThrottler || new Common.Throttler.Throttler(DRAG_LOG_INTERVAL);
  clickLogThrottler = options?.clickLogThrottler || new Common.Throttler.Throttler(CLICK_LOG_INTERVAL);
  resizeLogThrottler = options?.resizeLogThrottler || new Common.Throttler.Throttler(RESIZE_LOG_INTERVAL);
  processStartLoggingForDebugging();
  await addDocument(document);
}
export async function addDocument(document2) {
  documents.push(document2);
  if (["interactive", "complete"].includes(document2.readyState)) {
    await process();
  }
  document2.addEventListener("visibilitychange", scheduleProcessing);
  document2.addEventListener("scroll", scheduleProcessing);
  observeMutations([document2.body]);
}
export async function stopLogging() {
  await keyboardLogThrottler.schedule(async () => {
  }, Common.Throttler.Scheduling.AS_SOON_AS_POSSIBLE);
  logging = false;
  unregisterAllLoggables();
  for (const document2 of documents) {
    document2.removeEventListener("visibilitychange", scheduleProcessing);
    document2.removeEventListener("scroll", scheduleProcessing);
  }
  mutationObserver.disconnect();
  resizeObserver.disconnect();
  intersectionObserver.disconnect();
  documents.length = 0;
  viewportRects.clear();
  processingThrottler = noOpThrottler;
  pendingResize.clear();
  pendingChange.clear();
}
export function pendingWorkComplete() {
  return Promise.all([
    processingThrottler,
    keyboardLogThrottler,
    hoverLogThrottler,
    dragLogThrottler,
    clickLogThrottler,
    resizeLogThrottler
  ].map(async (throttler) => {
    for (let i = 0; throttler.process && i < 3; ++i) {
      await throttler.processCompleted;
    }
  })).then(() => {
  });
}
async function yieldToResize() {
  while (resizeLogThrottler.process) {
    await resizeLogThrottler.processCompleted;
  }
}
async function yieldToInteractions() {
  while (clickLogThrottler.process) {
    await clickLogThrottler.processCompleted;
  }
  while (keyboardLogThrottler.process) {
    await keyboardLogThrottler.processCompleted;
  }
}
function flushPendingChangeEvents() {
  for (const element of pendingChange) {
    logPendingChange(element);
  }
}
export async function scheduleProcessing() {
  if (!processingThrottler) {
    return;
  }
  void processingThrottler.schedule(
    () => Coordinator.RenderCoordinator.RenderCoordinator.instance().read("processForLogging", process)
  );
}
const viewportRects = /* @__PURE__ */ new Map();
const viewportRectFor = (element) => {
  const ownerDocument = element.ownerDocument;
  const viewportRect = viewportRects.get(ownerDocument) || new DOMRect(0, 0, ownerDocument.defaultView?.innerWidth || 0, ownerDocument.defaultView?.innerHeight || 0);
  viewportRects.set(ownerDocument, viewportRect);
  return viewportRect;
};
async function process() {
  if (document.hidden) {
    return;
  }
  const startTime = performance.now();
  const { loggables, shadowRoots } = getDomState(documents);
  const visibleLoggables = [];
  observeMutations(shadowRoots);
  const nonDomRoots = [void 0];
  for (const { element, parent } of loggables) {
    const loggingState = getOrCreateLoggingState(element, getLoggingConfig(element), parent);
    if (!loggingState.impressionLogged) {
      const overlap = visibleOverlap(element, viewportRectFor(element));
      const visibleSelectOption = element.tagName === "OPTION" && loggingState.parent?.selectOpen;
      const visible = overlap && (!parent || loggingState.parent?.impressionLogged);
      if (visible || visibleSelectOption) {
        if (overlap) {
          loggingState.size = overlap;
        }
        visibleLoggables.push(element);
        loggingState.impressionLogged = true;
      }
    }
    if (loggingState.impressionLogged && hasNonDomLoggables(element)) {
      nonDomRoots.push(element);
    }
    if (!loggingState.processed) {
      const clickLikeHandler = (doubleClick) => (e) => {
        const loggable = e.currentTarget;
        maybeCancelDrag(e);
        logClick(clickLogThrottler)(loggable, e, { doubleClick });
      };
      if (loggingState.config.track?.click) {
        element.addEventListener("click", clickLikeHandler(false), { capture: true });
        element.addEventListener("auxclick", clickLikeHandler(false), { capture: true });
        element.addEventListener("contextmenu", clickLikeHandler(false), { capture: true });
      }
      if (loggingState.config.track?.dblclick) {
        element.addEventListener("dblclick", clickLikeHandler(true), { capture: true });
      }
      const trackHover = loggingState.config.track?.hover;
      if (trackHover) {
        element.addEventListener("mouseover", logHover(hoverLogThrottler), { capture: true });
        element.addEventListener(
          "mouseout",
          () => hoverLogThrottler.schedule(cancelLogging, Common.Throttler.Scheduling.AS_SOON_AS_POSSIBLE),
          { capture: true }
        );
      }
      const trackDrag = loggingState.config.track?.drag;
      if (trackDrag) {
        element.addEventListener("pointerdown", onDragStart, { capture: true });
        document.addEventListener("pointerup", maybeCancelDrag, { capture: true });
        document.addEventListener("dragend", maybeCancelDrag, { capture: true });
      }
      if (loggingState.config.track?.change) {
        element.addEventListener("input", (event) => {
          if (!(event instanceof InputEvent)) {
            return;
          }
          if (loggingState.pendingChangeContext && loggingState.pendingChangeContext !== event.inputType) {
            void logPendingChange(element);
          }
          loggingState.pendingChangeContext = event.inputType;
          pendingChange.add(element);
        }, { capture: true });
        element.addEventListener("change", (event) => {
          const target = event?.target ?? element;
          if (["checkbox", "radio"].includes(target.type)) {
            loggingState.pendingChangeContext = target.checked ? "on" : "off";
          }
          logPendingChange(element);
        }, { capture: true });
        element.addEventListener("focusout", () => {
          if (loggingState.pendingChangeContext) {
            void logPendingChange(element);
          }
        }, { capture: true });
      }
      const trackKeyDown = loggingState.config.track?.keydown;
      if (trackKeyDown) {
        element.addEventListener("keydown", (e) => logKeyDown(keyboardLogThrottler)(e.currentTarget, e), { capture: true });
      }
      if (loggingState.config.track?.resize) {
        resizeObserver.observe(element);
        intersectionObserver.observe(element);
      }
      if (element.tagName === "SELECT") {
        const onSelectOpen = (e) => {
          void logClick(clickLogThrottler)(element, e);
          if (loggingState.selectOpen) {
            return;
          }
          loggingState.selectOpen = true;
          void scheduleProcessing();
        };
        element.addEventListener("click", onSelectOpen, { capture: true });
        element.addEventListener("keydown", (event) => {
          const e = event;
          if ((Host.Platform.isMac() || e.altKey) && (e.code === "ArrowDown" || e.code === "ArrowUp") || !e.altKey && !e.ctrlKey && e.code === "F4") {
            onSelectOpen(event);
          }
        }, { capture: true });
        element.addEventListener("keypress", (event) => {
          const e = event;
          if (e.key === " " || !Host.Platform.isMac() && e.key === "\r") {
            onSelectOpen(event);
          }
        }, { capture: true });
        element.addEventListener("change", (e) => {
          for (const option of element.selectedOptions) {
            if (getLoggingState(option)?.config.track?.click) {
              void logClick(clickLogThrottler)(option, e);
            }
          }
        }, { capture: true });
      }
      loggingState.processed = true;
    }
    processForDebugging(element);
  }
  for (let i = 0; i < nonDomRoots.length; ++i) {
    const root = nonDomRoots[i];
    for (const { loggable, config, parent } of getNonDomLoggables(root)) {
      const loggingState = getOrCreateLoggingState(loggable, config, parent);
      processForDebugging(loggable);
      visibleLoggables.push(loggable);
      loggingState.impressionLogged = true;
      if (hasNonDomLoggables(loggable)) {
        nonDomRoots.push(loggable);
      }
    }
    unregisterLoggables(root);
  }
  if (visibleLoggables.length) {
    await yieldToInteractions();
    await yieldToResize();
    flushPendingChangeEvents();
    await logImpressions(visibleLoggables);
  }
  Host.userMetrics.visualLoggingProcessingDone(performance.now() - startTime);
}
function logPendingChange(element) {
  const loggingState = getLoggingState(element);
  if (!loggingState) {
    return;
  }
  void logChange(element);
  delete loggingState.pendingChangeContext;
  pendingChange.delete(element);
}
async function cancelLogging() {
}
let dragStartX = 0, dragStartY = 0;
function onDragStart(event) {
  if (!(event instanceof MouseEvent)) {
    return;
  }
  dragStartX = event.screenX;
  dragStartY = event.screenY;
  void logDrag(dragLogThrottler)(event);
}
function maybeCancelDrag(event) {
  if (!(event instanceof MouseEvent)) {
    return;
  }
  if (Math.abs(event.screenX - dragStartX) >= DRAG_REPORT_THRESHOLD || Math.abs(event.screenY - dragStartY) >= DRAG_REPORT_THRESHOLD) {
    return;
  }
  void dragLogThrottler.schedule(cancelLogging, Common.Throttler.Scheduling.AS_SOON_AS_POSSIBLE);
}
function isAncestorOf(state1, state2) {
  while (state2) {
    if (state2 === state1) {
      return true;
    }
    state2 = state2.parent;
  }
  return false;
}
async function onResizeOrIntersection(entries) {
  for (const entry of entries) {
    const element = entry.target;
    const loggingState = getLoggingState(element);
    const overlap = visibleOverlap(element, viewportRectFor(element)) || new DOMRect(0, 0, 0, 0);
    if (!loggingState?.size) {
      continue;
    }
    let hasPendingParent = false;
    for (const pendingElement of pendingResize.keys()) {
      if (pendingElement === element) {
        continue;
      }
      const pendingState = getLoggingState(pendingElement);
      if (isAncestorOf(pendingState, loggingState)) {
        hasPendingParent = true;
        break;
      }
      if (isAncestorOf(loggingState, pendingState)) {
        pendingResize.delete(pendingElement);
      }
    }
    if (hasPendingParent) {
      continue;
    }
    pendingResize.set(element, overlap);
    void resizeLogThrottler.schedule(async () => {
      if (pendingResize.size) {
        await yieldToInteractions();
        flushPendingChangeEvents();
      }
      for (const [element2, overlap2] of pendingResize.entries()) {
        const loggingState2 = getLoggingState(element2);
        if (!loggingState2) {
          continue;
        }
        if (Math.abs(overlap2.width - loggingState2.size.width) >= RESIZE_REPORT_THRESHOLD || Math.abs(overlap2.height - loggingState2.size.height) >= RESIZE_REPORT_THRESHOLD) {
          logResize(element2, overlap2);
        }
      }
      pendingResize.clear();
    }, Common.Throttler.Scheduling.DELAYED);
  }
}
//# sourceMappingURL=LoggingDriver.js.map

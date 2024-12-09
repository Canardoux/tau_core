"use strict";
import * as Platform from "../../../core/platform/platform.js";
import * as Helpers from "../helpers/helpers.js";
import * as Types from "../types/types.js";
const rendererProcessesByFrameId = /* @__PURE__ */ new Map();
let mainFrameId = "";
let mainFrameURL = "";
const framesByProcessId = /* @__PURE__ */ new Map();
let browserProcessId = Types.Events.ProcessID(-1);
let browserThreadId = Types.Events.ThreadID(-1);
let gpuProcessId = Types.Events.ProcessID(-1);
let gpuThreadId = Types.Events.ThreadID(-1);
let viewportRect = null;
let devicePixelRatio = null;
const processNames = /* @__PURE__ */ new Map();
const topLevelRendererIds = /* @__PURE__ */ new Set();
const traceBounds = {
  min: Types.Timing.MicroSeconds(Number.POSITIVE_INFINITY),
  max: Types.Timing.MicroSeconds(Number.NEGATIVE_INFINITY),
  range: Types.Timing.MicroSeconds(Number.POSITIVE_INFINITY)
};
const navigationsByFrameId = /* @__PURE__ */ new Map();
const navigationsByNavigationId = /* @__PURE__ */ new Map();
const mainFrameNavigations = [];
const threadsInProcess = /* @__PURE__ */ new Map();
let traceStartedTimeFromTracingStartedEvent = Types.Timing.MicroSeconds(-1);
const eventPhasesOfInterestForTraceBounds = /* @__PURE__ */ new Set([
  Types.Events.Phase.BEGIN,
  Types.Events.Phase.END,
  Types.Events.Phase.COMPLETE,
  Types.Events.Phase.INSTANT
]);
let traceIsGeneric = true;
const CHROME_WEB_TRACE_EVENTS = /* @__PURE__ */ new Set([
  Types.Events.Name.TRACING_STARTED_IN_PAGE,
  Types.Events.Name.TRACING_SESSION_ID_FOR_WORKER,
  Types.Events.Name.TRACING_STARTED_IN_BROWSER
]);
export function reset() {
  navigationsByFrameId.clear();
  navigationsByNavigationId.clear();
  processNames.clear();
  mainFrameNavigations.length = 0;
  browserProcessId = Types.Events.ProcessID(-1);
  browserThreadId = Types.Events.ThreadID(-1);
  gpuProcessId = Types.Events.ProcessID(-1);
  gpuThreadId = Types.Events.ThreadID(-1);
  viewportRect = null;
  topLevelRendererIds.clear();
  threadsInProcess.clear();
  rendererProcessesByFrameId.clear();
  framesByProcessId.clear();
  traceBounds.min = Types.Timing.MicroSeconds(Number.POSITIVE_INFINITY);
  traceBounds.max = Types.Timing.MicroSeconds(Number.NEGATIVE_INFINITY);
  traceBounds.range = Types.Timing.MicroSeconds(Number.POSITIVE_INFINITY);
  traceStartedTimeFromTracingStartedEvent = Types.Timing.MicroSeconds(-1);
  traceIsGeneric = true;
}
function updateRendererProcessByFrame(event, frame) {
  const framesInProcessById = Platform.MapUtilities.getWithDefault(framesByProcessId, frame.processId, () => /* @__PURE__ */ new Map());
  framesInProcessById.set(frame.frame, frame);
  const rendererProcessInFrame = Platform.MapUtilities.getWithDefault(
    rendererProcessesByFrameId,
    frame.frame,
    () => /* @__PURE__ */ new Map()
  );
  const rendererProcessInfo = Platform.MapUtilities.getWithDefault(rendererProcessInFrame, frame.processId, () => {
    return [];
  });
  const lastProcessData = rendererProcessInfo.at(-1);
  if (lastProcessData && lastProcessData.frame.url === frame.url) {
    return;
  }
  rendererProcessInfo.push({
    frame,
    window: {
      min: event.ts,
      max: Types.Timing.MicroSeconds(0),
      range: Types.Timing.MicroSeconds(0)
    }
  });
}
export function handleEvent(event) {
  if (traceIsGeneric && CHROME_WEB_TRACE_EVENTS.has(event.name)) {
    traceIsGeneric = false;
  }
  if (Types.Events.isProcessName(event)) {
    processNames.set(event.pid, event);
  }
  if (event.ts !== 0 && !event.name.endsWith("::UMA") && eventPhasesOfInterestForTraceBounds.has(event.ph)) {
    traceBounds.min = Types.Timing.MicroSeconds(Math.min(event.ts, traceBounds.min));
    const eventDuration = event.dur ?? Types.Timing.MicroSeconds(0);
    traceBounds.max = Types.Timing.MicroSeconds(Math.max(event.ts + eventDuration, traceBounds.max));
  }
  if (Types.Events.isProcessName(event) && (event.args.name === "Browser" || event.args.name === "HeadlessBrowser")) {
    browserProcessId = event.pid;
    return;
  }
  if (Types.Events.isProcessName(event) && (event.args.name === "Gpu" || event.args.name === "GPU Process")) {
    gpuProcessId = event.pid;
    return;
  }
  if (Types.Events.isThreadName(event) && event.args.name === "CrGpuMain") {
    gpuThreadId = event.tid;
    return;
  }
  if (Types.Events.isThreadName(event) && event.args.name === "CrBrowserMain") {
    browserThreadId = event.tid;
  }
  if (Types.Events.isMainFrameViewport(event) && viewportRect === null) {
    const rectAsArray = event.args.data.viewport_rect;
    const viewportX = rectAsArray[0];
    const viewportY = rectAsArray[1];
    const viewportWidth = rectAsArray[2];
    const viewportHeight = rectAsArray[5];
    viewportRect = new DOMRect(viewportX, viewportY, viewportWidth, viewportHeight);
    devicePixelRatio = event.args.data.dpr;
  }
  if (Types.Events.isTracingStartedInBrowser(event)) {
    traceStartedTimeFromTracingStartedEvent = event.ts;
    if (!event.args.data) {
      throw new Error("No frames found in trace data");
    }
    for (const frame of event.args.data.frames ?? []) {
      updateRendererProcessByFrame(event, frame);
      if (!frame.parent) {
        topLevelRendererIds.add(frame.processId);
      }
      const traceHasPrimaryMainFrameFlag = "isInPrimaryMainFrame" in frame;
      const traceHasOutermostMainFrameFlag = "isOutermostMainFrame" in frame;
      if (traceHasPrimaryMainFrameFlag && traceHasOutermostMainFrameFlag) {
        if (frame.isInPrimaryMainFrame && frame.isOutermostMainFrame) {
          mainFrameId = frame.frame;
          mainFrameURL = frame.url;
        }
      } else if (traceHasOutermostMainFrameFlag) {
        if (frame.isOutermostMainFrame) {
          mainFrameId = frame.frame;
          mainFrameURL = frame.url;
        }
      } else {
        if (!frame.parent && frame.url) {
          mainFrameId = frame.frame;
          mainFrameURL = frame.url;
        }
      }
    }
    return;
  }
  if (Types.Events.isFrameCommittedInBrowser(event)) {
    const frame = event.args.data;
    if (!frame) {
      return;
    }
    updateRendererProcessByFrame(event, frame);
    if (frame.parent) {
      return;
    }
    topLevelRendererIds.add(frame.processId);
    return;
  }
  if (Types.Events.isCommitLoad(event)) {
    const frameData = event.args.data;
    if (!frameData) {
      return;
    }
    const { frame, name, url } = frameData;
    updateRendererProcessByFrame(event, { processId: event.pid, frame, name, url });
    return;
  }
  if (Types.Events.isThreadName(event)) {
    const threads = Platform.MapUtilities.getWithDefault(threadsInProcess, event.pid, () => /* @__PURE__ */ new Map());
    threads.set(event.tid, event);
    return;
  }
  if (Types.Events.isNavigationStart(event) && event.args.data) {
    const navigationId = event.args.data.navigationId;
    if (navigationsByNavigationId.has(navigationId)) {
      return;
    }
    navigationsByNavigationId.set(navigationId, event);
    const frameId = event.args.frame;
    const existingFrameNavigations = navigationsByFrameId.get(frameId) || [];
    existingFrameNavigations.push(event);
    navigationsByFrameId.set(frameId, existingFrameNavigations);
    if (frameId === mainFrameId) {
      mainFrameNavigations.push(event);
    }
    return;
  }
}
export async function finalize() {
  if (traceStartedTimeFromTracingStartedEvent >= 0) {
    traceBounds.min = traceStartedTimeFromTracingStartedEvent;
  }
  traceBounds.range = Types.Timing.MicroSeconds(traceBounds.max - traceBounds.min);
  for (const [, processWindows] of rendererProcessesByFrameId) {
    const processWindowValues = [...processWindows.values()].flat();
    for (let i = 0; i < processWindowValues.length; i++) {
      const currentWindow = processWindowValues[i];
      const nextWindow = processWindowValues[i + 1];
      if (!nextWindow) {
        currentWindow.window.max = Types.Timing.MicroSeconds(traceBounds.max);
        currentWindow.window.range = Types.Timing.MicroSeconds(traceBounds.max - currentWindow.window.min);
      } else {
        currentWindow.window.max = Types.Timing.MicroSeconds(nextWindow.window.min - 1);
        currentWindow.window.range = Types.Timing.MicroSeconds(currentWindow.window.max - currentWindow.window.min);
      }
    }
  }
  for (const [frameId, navigations] of navigationsByFrameId) {
    if (rendererProcessesByFrameId.has(frameId)) {
      continue;
    }
    navigationsByFrameId.delete(frameId);
    for (const navigation of navigations) {
      if (!navigation.args.data) {
        continue;
      }
      navigationsByNavigationId.delete(navigation.args.data.navigationId);
    }
  }
  const firstMainFrameNav = mainFrameNavigations.at(0);
  const firstNavTimeThreshold = Helpers.Timing.secondsToMicroseconds(Types.Timing.Seconds(0.5));
  if (firstMainFrameNav) {
    const navigationIsWithinThreshold = firstMainFrameNav.ts - traceBounds.min < firstNavTimeThreshold;
    if (firstMainFrameNav.args.data?.isOutermostMainFrame && firstMainFrameNav.args.data?.documentLoaderURL && navigationIsWithinThreshold) {
      mainFrameURL = firstMainFrameNav.args.data.documentLoaderURL;
    }
  }
}
export function data() {
  return {
    traceBounds: { ...traceBounds },
    browserProcessId,
    browserThreadId,
    processNames,
    gpuProcessId,
    gpuThreadId: gpuThreadId === Types.Events.ThreadID(-1) ? void 0 : gpuThreadId,
    viewportRect: viewportRect || void 0,
    devicePixelRatio: devicePixelRatio ?? void 0,
    mainFrameId,
    mainFrameURL,
    navigationsByFrameId,
    navigationsByNavigationId,
    threadsInProcess,
    rendererProcessesByFrame: rendererProcessesByFrameId,
    topLevelRendererIds,
    frameByProcessId: framesByProcessId,
    mainFrameNavigations,
    traceIsGeneric
  };
}
//# sourceMappingURL=MetaHandler.js.map

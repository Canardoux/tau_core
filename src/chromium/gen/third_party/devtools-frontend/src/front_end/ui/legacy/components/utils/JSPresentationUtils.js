"use strict";
import * as Common from "../../../../core/common/common.js";
import * as i18n from "../../../../core/i18n/i18n.js";
import * as SDK from "../../../../core/sdk/sdk.js";
import * as Bindings from "../../../../models/bindings/bindings.js";
import * as VisualLogging from "../../../visual_logging/visual_logging.js";
import * as UI from "../../legacy.js";
import jsUtilsStyles from "./jsUtils.css.js";
import { Events as LinkifierEvents, Linkifier } from "./Linkifier.js";
const UIStrings = {
  /**
   *@description Text to stop preventing the debugger from stepping into library code
   */
  removeFromIgnore: "Remove from ignore list",
  /**
   *@description Text for scripts that should not be stepped into when debugging
   */
  addToIgnore: "Add script to ignore list",
  /**
   * @description A link to show more frames when they are available.
   */
  showMoreFrames: "Show ignore-listed frames",
  /**
   * @description A link to rehide frames that are by default hidden.
   */
  showLess: "Show less",
  /**
   *@description Text indicating that source url of a link is currently unknown
   */
  unknownSource: "unknown"
};
const str_ = i18n.i18n.registerUIStrings("ui/legacy/components/utils/JSPresentationUtils.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
function populateContextMenu(link, event) {
  const contextMenu = new UI.ContextMenu.ContextMenu(event);
  event.consume(true);
  const uiLocation = Linkifier.uiLocation(link);
  if (uiLocation && Bindings.IgnoreListManager.IgnoreListManager.instance().canIgnoreListUISourceCode(uiLocation.uiSourceCode)) {
    if (Bindings.IgnoreListManager.IgnoreListManager.instance().isUserIgnoreListedURL(uiLocation.uiSourceCode.url())) {
      contextMenu.debugSection().appendItem(
        i18nString(UIStrings.removeFromIgnore),
        () => Bindings.IgnoreListManager.IgnoreListManager.instance().unIgnoreListUISourceCode(uiLocation.uiSourceCode),
        { jslogContext: "remove-from-ignore-list" }
      );
    } else {
      contextMenu.debugSection().appendItem(
        i18nString(UIStrings.addToIgnore),
        () => Bindings.IgnoreListManager.IgnoreListManager.instance().ignoreListUISourceCode(uiLocation.uiSourceCode),
        { jslogContext: "add-to-ignore-list" }
      );
    }
  }
  contextMenu.appendApplicableItems(event);
  void contextMenu.show();
}
export function buildStackTraceRows(stackTrace, target, linkifier, tabStops, updateCallback, showColumnNumber) {
  const stackTraceRows = [];
  if (updateCallback) {
    const throttler = new Common.Throttler.Throttler(100);
    linkifier.addEventListener(LinkifierEvents.LIVE_LOCATION_UPDATED, () => {
      void throttler.schedule(async () => updateCallback(stackTraceRows));
    });
  }
  function buildStackTraceRowsHelper(stackTrace2, previousCallFrames2 = void 0) {
    let asyncRow = null;
    if (previousCallFrames2) {
      asyncRow = {
        asyncDescription: UI.UIUtils.asyncStackTraceLabel(stackTrace2.description, previousCallFrames2)
      };
      stackTraceRows.push(asyncRow);
    }
    let previousStackFrameWasBreakpointCondition = false;
    for (const stackFrame of stackTrace2.callFrames) {
      const functionName = UI.UIUtils.beautifyFunctionName(stackFrame.functionName);
      const link = linkifier.maybeLinkifyConsoleCallFrame(target, stackFrame, {
        showColumnNumber,
        tabStop: Boolean(tabStops),
        inlineFrameIndex: 0,
        revealBreakpoint: previousStackFrameWasBreakpointCondition
      });
      if (link) {
        link.setAttribute("jslog", `${VisualLogging.link("stack-trace").track({ click: true })}`);
        link.addEventListener("contextmenu", populateContextMenu.bind(null, link));
        if (!link.textContent) {
          link.textContent = i18nString(UIStrings.unknownSource);
        }
      }
      stackTraceRows.push({ functionName, link });
      previousStackFrameWasBreakpointCondition = [
        SDK.DebuggerModel.COND_BREAKPOINT_SOURCE_URL,
        SDK.DebuggerModel.LOGPOINT_SOURCE_URL
      ].includes(stackFrame.url);
    }
  }
  buildStackTraceRowsHelper(stackTrace);
  let previousCallFrames = stackTrace.callFrames;
  for (let asyncStackTrace = stackTrace.parent; asyncStackTrace; asyncStackTrace = asyncStackTrace.parent) {
    if (asyncStackTrace.callFrames.length) {
      buildStackTraceRowsHelper(asyncStackTrace, previousCallFrames);
    }
    previousCallFrames = asyncStackTrace.callFrames;
  }
  return stackTraceRows;
}
export function buildStackTracePreviewContents(target, linkifier, options = {
  widthConstrained: false,
  stackTrace: void 0,
  tabStops: void 0
}) {
  const { stackTrace, tabStops } = options;
  const element = document.createElement("span");
  element.classList.add("monospace");
  element.classList.add("stack-preview-container");
  element.classList.toggle("width-constrained", options.widthConstrained);
  element.style.display = "inline-block";
  const shadowRoot = UI.UIUtils.createShadowRootWithCoreStyles(element, { cssFile: [jsUtilsStyles], delegatesFocus: void 0 });
  const contentElement = shadowRoot.createChild("table", "stack-preview-container");
  contentElement.classList.toggle("width-constrained", options.widthConstrained);
  const updateCallback = renderStackTraceTable.bind(null, contentElement, element);
  const stackTraceRows = buildStackTraceRows(
    stackTrace ?? { callFrames: [] },
    target,
    linkifier,
    tabStops,
    updateCallback,
    options.showColumnNumber
  );
  const links = renderStackTraceTable(contentElement, element, stackTraceRows);
  return { element, links };
}
function renderStackTraceTable(container, parent, stackTraceRows) {
  container.removeChildren();
  const links = [];
  let tableSection = null;
  for (const item of stackTraceRows) {
    if (!tableSection || "asyncDescription" in item) {
      tableSection = container.createChild("tbody");
    }
    const row = tableSection.createChild("tr");
    if ("asyncDescription" in item) {
      row.createChild("td").textContent = "\n";
      row.createChild("td", "stack-preview-async-description").textContent = item.asyncDescription;
      row.createChild("td");
      row.createChild("td");
      row.classList.add("stack-preview-async-row");
    } else {
      row.createChild("td").textContent = "\n";
      row.createChild("td", "function-name").textContent = item.functionName;
      row.createChild("td").textContent = " @ ";
      if (item.link) {
        row.createChild("td", "link").appendChild(item.link);
        links.push(item.link);
      }
    }
  }
  tableSection = container.createChild("tfoot");
  const showAllRow = tableSection.createChild("tr", "show-all-link");
  showAllRow.createChild("td");
  const cell = showAllRow.createChild("td");
  cell.colSpan = 4;
  const showAllLink = cell.createChild("span", "link");
  showAllLink.createChild("span", "css-inserted-text").setAttribute("data-inserted-text", i18nString(UIStrings.showMoreFrames));
  showAllLink.addEventListener("click", () => {
    container.classList.add("show-hidden-rows");
    parent.classList.add("show-hidden-rows");
    UI.GlassPane.GlassPane.containerMoved(container);
  }, false);
  const showLessRow = tableSection.createChild("tr", "show-less-link");
  showLessRow.createChild("td");
  const showLesscell = showLessRow.createChild("td");
  showLesscell.colSpan = 4;
  const showLessLink = showLesscell.createChild("span", "link");
  showLessLink.createChild("span", "css-inserted-text").setAttribute("data-inserted-text", i18nString(UIStrings.showLess));
  showLessLink.addEventListener("click", () => {
    container.classList.remove("show-hidden-rows");
    parent.classList.remove("show-hidden-rows");
    UI.GlassPane.GlassPane.containerMoved(container);
  }, false);
  return links;
}
//# sourceMappingURL=JSPresentationUtils.js.map

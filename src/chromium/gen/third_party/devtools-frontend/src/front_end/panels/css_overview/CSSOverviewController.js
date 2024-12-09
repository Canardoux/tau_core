"use strict";
import * as Common from "../../core/common/common.js";
import * as SDK from "../../core/sdk/sdk.js";
export class OverviewController extends Common.ObjectWrapper.ObjectWrapper {
  currentUrl;
  constructor() {
    super();
    this.currentUrl = SDK.TargetManager.TargetManager.instance().inspectedURL();
    SDK.TargetManager.TargetManager.instance().addEventListener(
      SDK.TargetManager.Events.INSPECTED_URL_CHANGED,
      this.#checkUrlAndResetIfChanged,
      this
    );
  }
  #checkUrlAndResetIfChanged() {
    if (this.currentUrl === SDK.TargetManager.TargetManager.instance().inspectedURL()) {
      return;
    }
    this.currentUrl = SDK.TargetManager.TargetManager.instance().inspectedURL();
    this.dispatchEventToListeners("Reset" /* RESET */);
  }
}
export var Events = /* @__PURE__ */ ((Events2) => {
  Events2["REQUEST_OVERVIEW_START"] = "RequestOverviewStart";
  Events2["REQUEST_NODE_HIGHLIGHT"] = "RequestNodeHighlight";
  Events2["POPULATE_NODES"] = "PopulateNodes";
  Events2["REQUEST_OVERVIEW_CANCEL"] = "RequestOverviewCancel";
  Events2["OVERVIEW_COMPLETED"] = "OverviewCompleted";
  Events2["RESET"] = "Reset";
  return Events2;
})(Events || {});
//# sourceMappingURL=CSSOverviewController.js.map

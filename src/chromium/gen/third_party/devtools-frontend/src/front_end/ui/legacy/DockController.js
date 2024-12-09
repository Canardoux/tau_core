"use strict";
import * as Common from "../../core/common/common.js";
import * as Host from "../../core/host/host.js";
import * as i18n from "../../core/i18n/i18n.js";
import * as Platform from "../../core/platform/platform.js";
import * as VisualLogging from "../../ui/visual_logging/visual_logging.js";
import { alert } from "./ARIAUtils.js";
import { ToolbarButton } from "./Toolbar.js";
const UIStrings = {
  /**
   *@description Text to close something
   */
  close: "Close",
  /**
   *@description Text to dock the DevTools to the right of the browser tab
   */
  dockToRight: "Dock to right",
  /**
   *@description Text to dock the DevTools to the bottom of the browser tab
   */
  dockToBottom: "Dock to bottom",
  /**
   *@description Text to dock the DevTools to the left of the browser tab
   */
  dockToLeft: "Dock to left",
  /**
   *@description Text to undock the DevTools
   */
  undockIntoSeparateWindow: "Undock into separate window",
  /**
   *@description Text announced when the DevTools are undocked
   */
  devtoolsUndocked: "DevTools is undocked",
  /**
   *@description Text announced when the DevTools are docked to the left, right, or bottom of the browser tab
   *@example {bottom} PH1
   */
  devToolsDockedTo: "DevTools is docked to {PH1}"
};
const str_ = i18n.i18n.registerUIStrings("ui/legacy/DockController.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
let dockControllerInstance;
export class DockController extends Common.ObjectWrapper.ObjectWrapper {
  canDockInternal;
  closeButton;
  currentDockStateSetting;
  lastDockStateSetting;
  dockSideInternal = void 0;
  titles;
  savedFocus;
  constructor(canDock) {
    super();
    this.canDockInternal = canDock;
    this.closeButton = new ToolbarButton(i18nString(UIStrings.close), "cross");
    this.closeButton.element.setAttribute("jslog", `${VisualLogging.close().track({ click: true })}`);
    this.closeButton.element.classList.add("close-devtools");
    this.closeButton.addEventListener(
      ToolbarButton.Events.CLICK,
      Host.InspectorFrontendHost.InspectorFrontendHostInstance.closeWindow.bind(
        Host.InspectorFrontendHost.InspectorFrontendHostInstance
      )
    );
    this.currentDockStateSetting = Common.Settings.Settings.instance().moduleSetting("currentDockState");
    this.lastDockStateSetting = Common.Settings.Settings.instance().createSetting("last-dock-state", "bottom" /* BOTTOM */);
    if (!canDock) {
      this.dockSideInternal = "undocked" /* UNDOCKED */;
      this.closeButton.setVisible(false);
      return;
    }
    this.currentDockStateSetting.addChangeListener(this.dockSideChanged, this);
    if (states.indexOf(this.currentDockStateSetting.get()) === -1) {
      this.currentDockStateSetting.set("right" /* RIGHT */);
    }
    if (states.indexOf(this.lastDockStateSetting.get()) === -1) {
      this.currentDockStateSetting.set("bottom" /* BOTTOM */);
    }
  }
  static instance(opts = { forceNew: null, canDock: false }) {
    const { forceNew, canDock } = opts;
    if (!dockControllerInstance || forceNew) {
      dockControllerInstance = new DockController(canDock);
    }
    return dockControllerInstance;
  }
  initialize() {
    if (!this.canDockInternal) {
      return;
    }
    this.titles = [
      i18nString(UIStrings.dockToRight),
      i18nString(UIStrings.dockToBottom),
      i18nString(UIStrings.dockToLeft),
      i18nString(UIStrings.undockIntoSeparateWindow)
    ];
    this.dockSideChanged();
  }
  dockSideChanged() {
    this.setDockSide(this.currentDockStateSetting.get());
    setTimeout(this.announceDockLocation.bind(this), 2e3);
  }
  dockSide() {
    return this.dockSideInternal;
  }
  canDock() {
    return this.canDockInternal;
  }
  isVertical() {
    return this.dockSideInternal === "right" /* RIGHT */ || this.dockSideInternal === "left" /* LEFT */;
  }
  setDockSide(dockSide) {
    if (states.indexOf(dockSide) === -1) {
      dockSide = states[0];
    }
    if (this.dockSideInternal === dockSide) {
      return;
    }
    if (this.dockSideInternal !== void 0) {
      document.body.classList.remove(this.dockSideInternal);
    }
    document.body.classList.add(dockSide);
    if (this.dockSideInternal) {
      this.lastDockStateSetting.set(this.dockSideInternal);
    }
    this.savedFocus = Platform.DOMUtilities.deepActiveElement(document);
    const eventData = { from: this.dockSideInternal, to: dockSide };
    this.dispatchEventToListeners("BeforeDockSideChanged" /* BEFORE_DOCK_SIDE_CHANGED */, eventData);
    console.timeStamp("DockController.setIsDocked");
    this.dockSideInternal = dockSide;
    this.currentDockStateSetting.set(dockSide);
    Host.InspectorFrontendHost.InspectorFrontendHostInstance.setIsDocked(
      dockSide !== "undocked" /* UNDOCKED */,
      this.setIsDockedResponse.bind(this, eventData)
    );
    this.closeButton.setVisible(this.dockSideInternal !== "undocked" /* UNDOCKED */);
    this.dispatchEventToListeners("DockSideChanged" /* DOCK_SIDE_CHANGED */, eventData);
  }
  setIsDockedResponse(eventData) {
    this.dispatchEventToListeners("AfterDockSideChanged" /* AFTER_DOCK_SIDE_CHANGED */, eventData);
    if (this.savedFocus) {
      this.savedFocus.focus();
      this.savedFocus = null;
    }
  }
  toggleDockSide() {
    if (this.lastDockStateSetting.get() === this.currentDockStateSetting.get()) {
      const index = states.indexOf(this.currentDockStateSetting.get()) || 0;
      this.lastDockStateSetting.set(states[(index + 1) % states.length]);
    }
    this.setDockSide(this.lastDockStateSetting.get());
  }
  announceDockLocation() {
    if (this.dockSideInternal === "undocked" /* UNDOCKED */) {
      alert(i18nString(UIStrings.devtoolsUndocked));
    } else {
      alert(i18nString(UIStrings.devToolsDockedTo, { PH1: this.dockSideInternal || "" }));
    }
  }
}
export var DockState = /* @__PURE__ */ ((DockState2) => {
  DockState2["BOTTOM"] = "bottom";
  DockState2["RIGHT"] = "right";
  DockState2["LEFT"] = "left";
  DockState2["UNDOCKED"] = "undocked";
  return DockState2;
})(DockState || {});
const states = ["right" /* RIGHT */, "bottom" /* BOTTOM */, "left" /* LEFT */, "undocked" /* UNDOCKED */];
export var Events = /* @__PURE__ */ ((Events2) => {
  Events2["BEFORE_DOCK_SIDE_CHANGED"] = "BeforeDockSideChanged";
  Events2["DOCK_SIDE_CHANGED"] = "DockSideChanged";
  Events2["AFTER_DOCK_SIDE_CHANGED"] = "AfterDockSideChanged";
  return Events2;
})(Events || {});
export class ToggleDockActionDelegate {
  handleAction(_context, _actionId) {
    DockController.instance().toggleDockSide();
    return true;
  }
}
let closeButtonProviderInstance;
export class CloseButtonProvider {
  static instance(opts = { forceNew: null }) {
    const { forceNew } = opts;
    if (!closeButtonProviderInstance || forceNew) {
      closeButtonProviderInstance = new CloseButtonProvider();
    }
    return closeButtonProviderInstance;
  }
  item() {
    return DockController.instance().closeButton;
  }
}
//# sourceMappingURL=DockController.js.map

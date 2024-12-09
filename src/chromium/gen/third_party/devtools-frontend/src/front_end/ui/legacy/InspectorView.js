"use strict";
import * as Common from "../../core/common/common.js";
import * as Host from "../../core/host/host.js";
import * as i18n from "../../core/i18n/i18n.js";
import * as Root from "../../core/root/root.js";
import * as Buttons from "../../ui/components/buttons/buttons.js";
import * as IconButton from "../components/icon_button/icon_button.js";
import * as VisualLogging from "../visual_logging/visual_logging.js";
import { ActionRegistry } from "./ActionRegistry.js";
import * as ARIAUtils from "./ARIAUtils.js";
import { Dialog } from "./Dialog.js";
import { DockController, DockState } from "./DockController.js";
import { GlassPane } from "./GlassPane.js";
import { Infobar, Type as InfobarType } from "./Infobar.js";
import inspectorViewTabbedPaneStyles from "./inspectorViewTabbedPane.css.legacy.js";
import { KeyboardShortcut } from "./KeyboardShortcut.js";
import { ShowMode, SplitWidget } from "./SplitWidget.js";
import { Events as TabbedPaneEvents } from "./TabbedPane.js";
import { ToolbarButton } from "./Toolbar.js";
import { Tooltip } from "./Tooltip.js";
import { ViewManager } from "./ViewManager.js";
import { VBox, WidgetFocusRestorer } from "./Widget.js";
const UIStrings = {
  /**
   *@description Title of more tabs button in inspector view
   */
  moreTools: "More Tools",
  /**
   *@description Text that appears when hovor over the close button on the drawer view
   */
  closeDrawer: "Close drawer",
  /**
   *@description The aria label for main tabbed pane that contains Panels
   */
  panels: "Panels",
  /**
   *@description Title of an action that reloads the tab currently being debugged by DevTools
   */
  reloadDebuggedTab: "Reload",
  /**
   *@description Title of an action that reloads the DevTools
   */
  reloadDevtools: "Reload DevTools",
  /**
   *@description Text for context menu action to move a tab to the main panel
   */
  moveToTop: "Move to top",
  /**
   *@description Text for context menu action to move a tab to the drawer
   */
  moveToBottom: "Move to bottom",
  /**
   * @description Text shown in a prompt to the user when DevTools is started and the
   * currently selected DevTools locale does not match Chrome's locale.
   * The placeholder is the current Chrome language.
   * @example {German} PH1
   */
  devToolsLanguageMissmatch: "DevTools is now available in {PH1}!",
  /**
   * @description An option the user can select when we notice that DevTools
   * is configured with a different locale than Chrome. This option means DevTools will
   * always try and display the DevTools UI in the same language as Chrome.
   */
  setToBrowserLanguage: "Always match Chrome's language",
  /**
   * @description An option the user can select when DevTools notices that DevTools
   * is configured with a different locale than Chrome. This option means DevTools UI
   * will be switched to the language specified in the placeholder.
   * @example {German} PH1
   */
  setToSpecificLanguage: "Switch DevTools to {PH1}",
  /**
   *@description The aria label for main toolbar
   */
  mainToolbar: "Main toolbar",
  /**
   *@description The aria label for the drawer.
   */
  drawer: "Tool drawer",
  /**
   *@description The aria label for the drawer shown.
   */
  drawerShown: "Drawer shown",
  /**
   *@description The aria label for the drawer hidden.
   */
  drawerHidden: "Drawer hidden",
  /**
   * @description Request for the user to select a local file system folder for DevTools
   * to store local overrides in.
   */
  selectOverrideFolder: "Select a folder to store override files in.",
  /**
   *@description Label for a button which opens a file picker.
   */
  selectFolder: "Select folder"
};
const str_ = i18n.i18n.registerUIStrings("ui/legacy/InspectorView.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
let inspectorViewInstance = null;
export class InspectorView extends VBox {
  drawerSplitWidget;
  tabDelegate;
  drawerTabbedLocation;
  drawerTabbedPane;
  infoBarDiv;
  tabbedLocation;
  tabbedPane;
  keyDownBound;
  currentPanelLocked;
  focusRestorer;
  ownerSplitWidget;
  reloadRequiredInfobar;
  #selectOverrideFolderInfobar;
  constructor() {
    super();
    GlassPane.setContainer(this.element);
    this.setMinimumSize(250, 72);
    this.drawerSplitWidget = new SplitWidget(false, true, "inspector.drawer-split-view-state", 200, 200);
    this.drawerSplitWidget.hideSidebar();
    this.drawerSplitWidget.enableShowModeSaving();
    this.drawerSplitWidget.show(this.element);
    this.tabDelegate = new InspectorViewTabDelegate();
    this.drawerTabbedLocation = ViewManager.instance().createTabbedLocation(
      this.showDrawer.bind(this, {
        focus: false,
        hasTargetDrawer: true
      }),
      "drawer-view",
      true,
      true
    );
    const moreTabsButton = this.drawerTabbedLocation.enableMoreTabsButton();
    moreTabsButton.setTitle(i18nString(UIStrings.moreTools));
    this.drawerTabbedPane = this.drawerTabbedLocation.tabbedPane();
    this.drawerTabbedPane.setMinimumSize(0, 27);
    this.drawerTabbedPane.element.classList.add("drawer-tabbed-pane");
    this.drawerTabbedPane.element.setAttribute("jslog", `${VisualLogging.drawer()}`);
    const closeDrawerButton = new ToolbarButton(i18nString(UIStrings.closeDrawer), "cross");
    closeDrawerButton.element.setAttribute("jslog", `${VisualLogging.close().track({ click: true })}`);
    closeDrawerButton.addEventListener(ToolbarButton.Events.CLICK, this.closeDrawer, this);
    this.drawerTabbedPane.addEventListener(
      TabbedPaneEvents.TabSelected,
      (event) => this.tabSelected(event.data.tabId, "drawer"),
      this
    );
    const selectedDrawerTab = this.drawerTabbedPane.selectedTabId;
    if (this.drawerSplitWidget.showMode() !== ShowMode.ONLY_MAIN && selectedDrawerTab) {
      Host.userMetrics.panelShown(selectedDrawerTab, true);
      Host.userMetrics.panelShownInLocation(selectedDrawerTab, "drawer");
    }
    this.drawerTabbedPane.setTabDelegate(this.tabDelegate);
    const drawerElement = this.drawerTabbedPane.element;
    ARIAUtils.markAsComplementary(drawerElement);
    ARIAUtils.setLabel(drawerElement, i18nString(UIStrings.drawer));
    this.drawerSplitWidget.installResizer(this.drawerTabbedPane.headerElement());
    this.drawerSplitWidget.setSidebarWidget(this.drawerTabbedPane);
    this.drawerTabbedPane.rightToolbar().appendToolbarItem(closeDrawerButton);
    this.drawerTabbedPane.headerElement().setAttribute("jslog", `${VisualLogging.toolbar("drawer").track({
      drag: true,
      keydown: "ArrowUp|ArrowLeft|ArrowDown|ArrowRight|Enter|Space"
    })}`);
    this.tabbedLocation = ViewManager.instance().createTabbedLocation(
      Host.InspectorFrontendHost.InspectorFrontendHostInstance.bringToFront.bind(
        Host.InspectorFrontendHost.InspectorFrontendHostInstance
      ),
      "panel",
      true,
      true,
      Root.Runtime.Runtime.queryParam("panel")
    );
    this.tabbedPane = this.tabbedLocation.tabbedPane();
    this.tabbedPane.element.classList.add("main-tabbed-pane");
    const allocatedSpace = Root.Runtime.conditions.canDock() ? "69px" : "41px";
    this.tabbedPane.leftToolbar().element.style.minWidth = allocatedSpace;
    this.tabbedPane.registerRequiredCSS(inspectorViewTabbedPaneStyles);
    this.tabbedPane.addEventListener(
      TabbedPaneEvents.TabSelected,
      (event) => this.tabSelected(event.data.tabId, "main"),
      this
    );
    const selectedTab = this.tabbedPane.selectedTabId;
    if (selectedTab) {
      Host.userMetrics.panelShown(selectedTab, true);
      Host.userMetrics.panelShownInLocation(selectedTab, "main");
    }
    this.tabbedPane.setAccessibleName(i18nString(UIStrings.panels));
    this.tabbedPane.setTabDelegate(this.tabDelegate);
    const mainHeaderElement = this.tabbedPane.headerElement();
    ARIAUtils.markAsNavigation(mainHeaderElement);
    ARIAUtils.setLabel(mainHeaderElement, i18nString(UIStrings.mainToolbar));
    mainHeaderElement.setAttribute("jslog", `${VisualLogging.toolbar("main").track({
      drag: true,
      keydown: "ArrowUp|ArrowLeft|ArrowDown|ArrowRight|Enter|Space"
    })}`);
    Host.userMetrics.setLaunchPanel(this.tabbedPane.selectedTabId);
    if (Host.InspectorFrontendHost.isUnderTest()) {
      this.tabbedPane.setAutoSelectFirstItemOnShow(false);
    }
    this.drawerSplitWidget.setMainWidget(this.tabbedPane);
    this.keyDownBound = this.keyDown.bind(this);
    Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(
      Host.InspectorFrontendHostAPI.Events.ShowPanel,
      showPanel.bind(this)
    );
    function showPanel({ data: panelName }) {
      void this.showPanel(panelName);
    }
    if (shouldShowLocaleInfobar()) {
      const infobar = createLocaleInfobar();
      infobar.setParentView(this);
      this.attachInfobar(infobar);
    }
  }
  static instance(opts = { forceNew: null }) {
    const { forceNew } = opts;
    if (!inspectorViewInstance || forceNew) {
      inspectorViewInstance = new InspectorView();
    }
    return inspectorViewInstance;
  }
  static maybeGetInspectorViewInstance() {
    return inspectorViewInstance;
  }
  static removeInstance() {
    inspectorViewInstance = null;
  }
  wasShown() {
    this.element.ownerDocument.addEventListener("keydown", this.keyDownBound, false);
  }
  willHide() {
    this.element.ownerDocument.removeEventListener("keydown", this.keyDownBound, false);
  }
  resolveLocation(locationName) {
    if (locationName === "drawer-view") {
      return this.drawerTabbedLocation;
    }
    if (locationName === "panel") {
      return this.tabbedLocation;
    }
    return null;
  }
  async createToolbars() {
    await this.tabbedPane.leftToolbar().appendItemsAtLocation("main-toolbar-left");
    await this.tabbedPane.rightToolbar().appendItemsAtLocation("main-toolbar-right");
  }
  addPanel(view) {
    this.tabbedLocation.appendView(view);
  }
  hasPanel(panelName) {
    return this.tabbedPane.hasTab(panelName);
  }
  async panel(panelName) {
    const view = ViewManager.instance().view(panelName);
    if (!view) {
      throw new Error(`Expected view for panel '${panelName}'`);
    }
    return view.widget();
  }
  onSuspendStateChanged(allTargetsSuspended) {
    this.currentPanelLocked = allTargetsSuspended;
    this.tabbedPane.setCurrentTabLocked(this.currentPanelLocked);
    this.tabbedPane.leftToolbar().setEnabled(!this.currentPanelLocked);
    this.tabbedPane.rightToolbar().setEnabled(!this.currentPanelLocked);
  }
  canSelectPanel(panelName) {
    return !this.currentPanelLocked || this.tabbedPane.selectedTabId === panelName;
  }
  async showPanel(panelName) {
    await ViewManager.instance().showView(panelName);
  }
  setPanelWarnings(tabId, warnings) {
    const tabbedPane = this.getTabbedPaneForTabId(tabId);
    if (tabbedPane) {
      let icon = null;
      if (warnings.length !== 0) {
        const warning = warnings.length === 1 ? warnings[0] : "\xB7 " + warnings.join("\n\xB7 ");
        icon = IconButton.Icon.create("warning-filled");
        Tooltip.install(icon, warning);
      }
      tabbedPane.setTabIcon(tabId, icon);
    }
  }
  emitDrawerChangeEvent(isDrawerOpen) {
    const evt = new CustomEvent("drawerchange" /* DRAWER_CHANGE */, { bubbles: true, cancelable: true, detail: { isDrawerOpen } });
    document.body.dispatchEvent(evt);
  }
  getTabbedPaneForTabId(tabId) {
    if (this.tabbedPane.hasTab(tabId)) {
      return this.tabbedPane;
    }
    if (this.drawerTabbedPane.hasTab(tabId)) {
      return this.drawerTabbedPane;
    }
    return null;
  }
  currentPanelDeprecated() {
    return ViewManager.instance().materializedWidget(this.tabbedPane.selectedTabId || "");
  }
  showDrawer({ focus, hasTargetDrawer }) {
    if (this.drawerTabbedPane.isShowing()) {
      return;
    }
    this.drawerTabbedPane.setAutoSelectFirstItemOnShow(!hasTargetDrawer);
    this.drawerSplitWidget.showBoth();
    if (focus) {
      this.focusRestorer = new WidgetFocusRestorer(this.drawerTabbedPane);
    } else {
      this.focusRestorer = null;
    }
    this.emitDrawerChangeEvent(true);
    ARIAUtils.alert(i18nString(UIStrings.drawerShown));
  }
  drawerVisible() {
    return this.drawerTabbedPane.isShowing();
  }
  closeDrawer() {
    if (!this.drawerTabbedPane.isShowing()) {
      return;
    }
    if (this.focusRestorer) {
      this.focusRestorer.restore();
    }
    this.drawerSplitWidget.hideSidebar(true);
    this.emitDrawerChangeEvent(false);
    ARIAUtils.alert(i18nString(UIStrings.drawerHidden));
  }
  setDrawerMinimized(minimized) {
    this.drawerSplitWidget.setSidebarMinimized(minimized);
    this.drawerSplitWidget.setResizable(!minimized);
  }
  isDrawerMinimized() {
    return this.drawerSplitWidget.isSidebarMinimized();
  }
  closeDrawerTab(id, userGesture) {
    this.drawerTabbedPane.closeTab(id, userGesture);
  }
  keyDown(event) {
    const keyboardEvent = event;
    if (!KeyboardShortcut.eventHasCtrlEquivalentKey(keyboardEvent) || keyboardEvent.altKey || keyboardEvent.shiftKey) {
      return;
    }
    const panelShortcutEnabled = Common.Settings.moduleSetting("shortcut-panel-switch").get();
    if (panelShortcutEnabled) {
      let panelIndex = -1;
      if (keyboardEvent.keyCode > 48 && keyboardEvent.keyCode < 58) {
        panelIndex = keyboardEvent.keyCode - 49;
      } else if (keyboardEvent.keyCode > 96 && keyboardEvent.keyCode < 106 && keyboardEvent.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD) {
        panelIndex = keyboardEvent.keyCode - 97;
      }
      if (panelIndex !== -1) {
        const panelName = this.tabbedPane.tabIds()[panelIndex];
        if (panelName) {
          if (!Dialog.hasInstance() && !this.currentPanelLocked) {
            void this.showPanel(panelName);
            void VisualLogging.logKeyDown(null, event, `panel-by-index-${panelName}`);
          }
          event.consume(true);
        }
      }
    }
  }
  onResize() {
    GlassPane.containerMoved(this.element);
  }
  topResizerElement() {
    return this.tabbedPane.headerElement();
  }
  toolbarItemResized() {
    this.tabbedPane.headerResized();
  }
  tabSelected(tabId, location) {
    Host.userMetrics.panelShown(tabId);
    Host.userMetrics.panelShownInLocation(tabId, location);
  }
  setOwnerSplit(splitWidget) {
    this.ownerSplitWidget = splitWidget;
  }
  ownerSplit() {
    return this.ownerSplitWidget || null;
  }
  minimize() {
    if (this.ownerSplitWidget) {
      this.ownerSplitWidget.setSidebarMinimized(true);
    }
  }
  restore() {
    if (this.ownerSplitWidget) {
      this.ownerSplitWidget.setSidebarMinimized(false);
    }
  }
  displayDebuggedTabReloadRequiredWarning(message) {
    if (!this.reloadRequiredInfobar) {
      const infobar = new Infobar(
        InfobarType.INFO,
        message,
        [
          {
            text: i18nString(UIStrings.reloadDebuggedTab),
            highlight: true,
            delegate: () => {
              reloadDebuggedTab();
              if (this.reloadRequiredInfobar) {
                this.reloadRequiredInfobar.dispose();
              }
            },
            dismiss: false,
            buttonVariant: Buttons.Button.Variant.PRIMARY,
            icon: "refresh",
            jslogContext: "main.debug-reload"
          }
        ],
        void 0,
        void 0,
        "reload-required"
      );
      infobar.setParentView(this);
      this.attachInfobar(infobar);
      this.reloadRequiredInfobar = infobar;
      infobar.setCloseCallback(() => {
        delete this.reloadRequiredInfobar;
      });
    }
  }
  displayReloadRequiredWarning(message) {
    if (!this.reloadRequiredInfobar) {
      const infobar = new Infobar(
        InfobarType.INFO,
        message,
        [
          {
            text: i18nString(UIStrings.reloadDevtools),
            highlight: true,
            delegate: () => reloadDevTools(),
            dismiss: false,
            jslogContext: "main.debug-reload"
          }
        ],
        void 0,
        void 0,
        "reload-required"
      );
      infobar.setParentView(this);
      this.attachInfobar(infobar);
      this.reloadRequiredInfobar = infobar;
      infobar.setCloseCallback(() => {
        delete this.reloadRequiredInfobar;
      });
    }
  }
  displaySelectOverrideFolderInfobar(callback) {
    if (!this.#selectOverrideFolderInfobar) {
      const infobar = new Infobar(
        InfobarType.INFO,
        i18nString(UIStrings.selectOverrideFolder),
        [
          {
            text: i18nString(UIStrings.selectFolder),
            highlight: true,
            delegate: () => callback(),
            dismiss: true,
            jslogContext: "select-folder"
          }
        ],
        void 0,
        void 0,
        "select-override-folder"
      );
      infobar.setParentView(this);
      this.attachInfobar(infobar);
      this.#selectOverrideFolderInfobar = infobar;
      infobar.setCloseCallback(() => {
        this.#selectOverrideFolderInfobar = void 0;
      });
    }
  }
  createInfoBarDiv() {
    if (!this.infoBarDiv) {
      this.infoBarDiv = document.createElement("div");
      this.infoBarDiv.classList.add("flex-none");
      this.contentElement.insertBefore(this.infoBarDiv, this.contentElement.firstChild);
    }
  }
  attachInfobar(infobar) {
    this.createInfoBarDiv();
    this.infoBarDiv?.appendChild(infobar.element);
  }
}
function getDisableLocaleInfoBarSetting() {
  return Common.Settings.Settings.instance().createSetting("disable-locale-info-bar", false);
}
function shouldShowLocaleInfobar() {
  if (getDisableLocaleInfoBarSetting().get()) {
    return false;
  }
  const languageSettingValue = Common.Settings.Settings.instance().moduleSetting("language").get();
  if (languageSettingValue !== "en-US") {
    return false;
  }
  return !i18n.DevToolsLocale.localeLanguagesMatch(navigator.language, languageSettingValue) && i18n.DevToolsLocale.DevToolsLocale.instance().languageIsSupportedByDevTools(navigator.language);
}
function createLocaleInfobar() {
  const devtoolsLocale = i18n.DevToolsLocale.DevToolsLocale.instance();
  const closestSupportedLocale = devtoolsLocale.lookupClosestDevToolsLocale(navigator.language);
  const locale = new Intl.Locale(closestSupportedLocale);
  const closestSupportedLanguageInCurrentLocale = new Intl.DisplayNames([devtoolsLocale.locale], { type: "language" }).of(locale.language || "en") || "English";
  const languageSetting = Common.Settings.Settings.instance().moduleSetting("language");
  return new Infobar(
    InfobarType.INFO,
    i18nString(UIStrings.devToolsLanguageMissmatch, { PH1: closestSupportedLanguageInCurrentLocale }),
    [
      {
        text: i18nString(UIStrings.setToBrowserLanguage),
        highlight: true,
        delegate: () => {
          languageSetting.set("browserLanguage");
          getDisableLocaleInfoBarSetting().set(true);
          reloadDevTools();
        },
        dismiss: true,
        jslogContext: "set-to-browser-language"
      },
      {
        text: i18nString(UIStrings.setToSpecificLanguage, { PH1: closestSupportedLanguageInCurrentLocale }),
        highlight: true,
        delegate: () => {
          languageSetting.set(closestSupportedLocale);
          getDisableLocaleInfoBarSetting().set(true);
          reloadDevTools();
        },
        dismiss: true,
        jslogContext: "set-to-specific-language"
      }
    ],
    getDisableLocaleInfoBarSetting(),
    void 0,
    "language-mismatch"
  );
}
function reloadDevTools() {
  if (DockController.instance().canDock() && DockController.instance().dockSide() === DockState.UNDOCKED) {
    Host.InspectorFrontendHost.InspectorFrontendHostInstance.setIsDocked(true, function() {
    });
  }
  Host.InspectorFrontendHost.InspectorFrontendHostInstance.reattach(() => window.location.reload());
}
function reloadDebuggedTab() {
  void ActionRegistry.instance().getAction("inspector-main.reload").execute();
}
export class ActionDelegate {
  handleAction(context, actionId) {
    switch (actionId) {
      case "main.toggle-drawer":
        if (InspectorView.instance().drawerVisible()) {
          InspectorView.instance().closeDrawer();
        } else {
          InspectorView.instance().showDrawer({
            focus: true,
            hasTargetDrawer: false
          });
        }
        return true;
      case "main.next-tab":
        InspectorView.instance().tabbedPane.selectNextTab();
        InspectorView.instance().tabbedPane.focus();
        return true;
      case "main.previous-tab":
        InspectorView.instance().tabbedPane.selectPrevTab();
        InspectorView.instance().tabbedPane.focus();
        return true;
    }
    return false;
  }
}
export class InspectorViewTabDelegate {
  closeTabs(tabbedPane, ids) {
    tabbedPane.closeTabs(ids, true);
  }
  moveToDrawer(tabId) {
    Host.userMetrics.actionTaken(Host.UserMetrics.Action.TabMovedToDrawer);
    ViewManager.instance().moveView(tabId, "drawer-view");
  }
  moveToMainPanel(tabId) {
    Host.userMetrics.actionTaken(Host.UserMetrics.Action.TabMovedToMainPanel);
    ViewManager.instance().moveView(tabId, "panel");
  }
  onContextMenu(tabId, contextMenu) {
    if (tabId === "console" || tabId === "console-view") {
      return;
    }
    const locationName = ViewManager.instance().locationNameForViewId(tabId);
    if (locationName === "drawer-view") {
      contextMenu.defaultSection().appendItem(
        i18nString(UIStrings.moveToTop),
        this.moveToMainPanel.bind(this, tabId),
        { jslogContext: "move-to-top" }
      );
    } else {
      contextMenu.defaultSection().appendItem(
        i18nString(UIStrings.moveToBottom),
        this.moveToDrawer.bind(this, tabId),
        { jslogContext: "move-to-bottom" }
      );
    }
  }
}
export var Events = /* @__PURE__ */ ((Events2) => {
  Events2["DRAWER_CHANGE"] = "drawerchange";
  return Events2;
})(Events || {});
//# sourceMappingURL=InspectorView.js.map

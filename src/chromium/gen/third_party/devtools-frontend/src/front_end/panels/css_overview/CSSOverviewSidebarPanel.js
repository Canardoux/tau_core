"use strict";
import * as Common from "../../core/common/common.js";
import * as i18n from "../../core/i18n/i18n.js";
import * as UI from "../../ui/legacy/legacy.js";
import * as VisualLogging from "../../ui/visual_logging/visual_logging.js";
import cssOverviewSidebarPanelStyles from "./cssOverviewSidebarPanel.css.js";
const UIStrings = {
  /**
   *@description Label for the 'Clear overview' button in the CSS overview report
   */
  clearOverview: "Clear overview",
  /**
   * @description Accessible label for the CSS overview panel sidebar
   */
  cssOverviewPanelSidebar: "CSS overview panel sidebar"
};
const str_ = i18n.i18n.registerUIStrings("panels/css_overview/CSSOverviewSidebarPanel.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
const ITEM_CLASS_NAME = "overview-sidebar-panel-item";
const SELECTED_CLASS_NAME = "selected";
export class CSSOverviewSidebarPanel extends Common.ObjectWrapper.eventMixin(
  UI.Widget.VBox
) {
  containerElement;
  constructor() {
    super(true);
    this.contentElement.classList.add("overview-sidebar-panel");
    this.contentElement.addEventListener("click", this.#onItemClick.bind(this));
    this.contentElement.addEventListener("keydown", this.#onItemKeyDown.bind(this));
    this.containerElement = this.contentElement.createChild("div", "overview-sidebar-panel-container");
    UI.ARIAUtils.setLabel(this.containerElement, i18nString(UIStrings.cssOverviewPanelSidebar));
    UI.ARIAUtils.markAsTree(this.containerElement);
    const clearResultsButton = new UI.Toolbar.ToolbarButton(
      i18nString(UIStrings.clearOverview),
      "clear",
      void 0,
      "css-overview.clear-overview"
    );
    clearResultsButton.addEventListener(UI.Toolbar.ToolbarButton.Events.CLICK, this.#reset, this);
    const toolbarElement = this.containerElement.createChild("div", "overview-toolbar");
    const toolbar = new UI.Toolbar.Toolbar("", toolbarElement);
    toolbar.appendToolbarItem(clearResultsButton);
  }
  addItem(name, id) {
    const item = this.containerElement.createChild("div", ITEM_CLASS_NAME);
    item.setAttribute(
      "jslog",
      `${VisualLogging.item().track({ click: true, keydown: "Enter|ArrowUp|ArrowDown" }).context(`css-overview.${id}`)}`
    );
    UI.ARIAUtils.markAsTreeitem(item);
    item.textContent = name;
    item.dataset.id = id;
    item.tabIndex = 0;
  }
  #reset() {
    this.dispatchEventToListeners("Reset" /* RESET */);
  }
  #deselectAllItems() {
    const items = this.containerElement.querySelectorAll(`.${ITEM_CLASS_NAME}`);
    items.forEach((item) => {
      item.classList.remove(SELECTED_CLASS_NAME);
    });
  }
  #onItemClick(event) {
    const target = event.composedPath()[0];
    if (!target.classList.contains(ITEM_CLASS_NAME)) {
      return;
    }
    const { id } = target.dataset;
    if (!id) {
      return;
    }
    this.select(id, false);
    this.dispatchEventToListeners("ItemSelected" /* ITEM_SELECTED */, { id, isMouseEvent: true, key: void 0 });
  }
  #onItemKeyDown(event) {
    if (event.key !== "Enter" && event.key !== "ArrowUp" && event.key !== "ArrowDown") {
      return;
    }
    const target = event.composedPath()[0];
    if (!target.classList.contains(ITEM_CLASS_NAME)) {
      return;
    }
    const { id } = target.dataset;
    if (!id) {
      return;
    }
    if (event.key === "Enter") {
      this.select(id, false);
      this.dispatchEventToListeners("ItemSelected" /* ITEM_SELECTED */, { id, isMouseEvent: false, key: event.key });
    } else {
      const items = this.containerElement.querySelectorAll(`.${ITEM_CLASS_NAME}`);
      let currItemIndex = -1;
      for (let idx = 0; idx < items.length; idx++) {
        if (items[idx].dataset.id === id) {
          currItemIndex = idx;
          break;
        }
      }
      if (currItemIndex < 0) {
        return;
      }
      const moveTo = event.key === "ArrowDown" ? 1 : -1;
      const nextItemIndex = (currItemIndex + moveTo) % items.length;
      const nextItemId = items[nextItemIndex].dataset.id;
      if (!nextItemId) {
        return;
      }
      this.select(nextItemId, true);
      this.dispatchEventToListeners("ItemSelected" /* ITEM_SELECTED */, { id: nextItemId, isMouseEvent: false, key: event.key });
    }
    event.consume(true);
  }
  select(id, focus) {
    const target = this.containerElement.querySelector(`[data-id=${CSS.escape(id)}]`);
    if (!target) {
      return;
    }
    if (target.classList.contains(SELECTED_CLASS_NAME)) {
      return;
    }
    this.#deselectAllItems();
    target.classList.add(SELECTED_CLASS_NAME);
    if (focus) {
      target.contentEditable = "true";
      target.focus();
      target.contentEditable = "false";
    }
  }
  wasShown() {
    super.wasShown();
    this.registerCSSFiles([cssOverviewSidebarPanelStyles]);
  }
}
export var SidebarEvents = /* @__PURE__ */ ((SidebarEvents2) => {
  SidebarEvents2["ITEM_SELECTED"] = "ItemSelected";
  SidebarEvents2["RESET"] = "Reset";
  return SidebarEvents2;
})(SidebarEvents || {});
//# sourceMappingURL=CSSOverviewSidebarPanel.js.map

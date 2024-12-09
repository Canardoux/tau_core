"use strict";
import * as Common from "../../core/common/common.js";
import * as Host from "../../core/host/host.js";
import * as i18n from "../../core/i18n/i18n.js";
import * as Platform from "../../core/platform/platform.js";
import * as VisualLogging from "../../ui/visual_logging/visual_logging.js";
import * as ARIAUtils from "./ARIAUtils.js";
import filterStyles from "./filter.css.legacy.js";
import { KeyboardShortcut, Modifiers } from "./KeyboardShortcut.js";
import { bindCheckbox } from "./SettingsUI.js";
import * as ThemeSupport from "./theme_support/theme_support.js";
import { Toolbar, ToolbarFilter, ToolbarInput, ToolbarSettingToggle } from "./Toolbar.js";
import { Tooltip } from "./Tooltip.js";
import { CheckboxLabel, createTextChild } from "./UIUtils.js";
import { HBox } from "./Widget.js";
const UIStrings = {
  /**
   *@description Text to filter result items
   */
  filter: "Filter",
  /**
   *@description Text that appears when hover over the filter bar in the Network tool
   */
  egSmalldUrlacomb: "e.g. `/small[d]+/ url:a.com/b`",
  /**
   *@description Text that appears when hover over the All button in the Network tool
   *@example {Ctrl + } PH1
   */
  sclickToSelectMultipleTypes: "{PH1}Click to select multiple types",
  /**
   *@description Text for everything
   */
  allStrings: "All"
};
const str_ = i18n.i18n.registerUIStrings("ui/legacy/FilterBar.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
export class FilterBar extends Common.ObjectWrapper.eventMixin(HBox) {
  enabled;
  stateSetting;
  filterButtonInternal;
  filters;
  alwaysShowFilters;
  showingWidget;
  constructor(name, visibleByDefault) {
    super();
    this.registerRequiredCSS(filterStyles);
    this.enabled = true;
    this.element.classList.add("filter-bar");
    this.element.setAttribute("jslog", `${VisualLogging.toolbar("filter-bar")}`);
    this.stateSetting = Common.Settings.Settings.instance().createSetting("filter-bar-" + name + "-toggled", Boolean(visibleByDefault));
    this.filterButtonInternal = new ToolbarSettingToggle(this.stateSetting, "filter", i18nString(UIStrings.filter), "filter-filled", "filter");
    this.filterButtonInternal.element.style.setProperty("--dot-toggle-top", "13px");
    this.filterButtonInternal.element.style.setProperty("--dot-toggle-left", "14px");
    this.filters = [];
    this.updateFilterBar();
    this.stateSetting.addChangeListener(this.updateFilterBar.bind(this));
  }
  filterButton() {
    return this.filterButtonInternal;
  }
  addDivider() {
    const element = document.createElement("div");
    element.classList.add("filter-divider");
    this.element.appendChild(element);
  }
  addFilter(filter) {
    this.filters.push(filter);
    this.element.appendChild(filter.element());
    filter.addEventListener("FilterChanged" /* FILTER_CHANGED */, this.filterChanged, this);
    this.updateFilterButton();
  }
  setEnabled(enabled) {
    this.enabled = enabled;
    this.filterButtonInternal.setEnabled(enabled);
    this.updateFilterBar();
  }
  forceShowFilterBar() {
    this.alwaysShowFilters = true;
    this.updateFilterBar();
  }
  showOnce() {
    this.stateSetting.set(true);
  }
  filterChanged() {
    this.updateFilterButton();
    this.dispatchEventToListeners("Changed" /* CHANGED */);
  }
  wasShown() {
    super.wasShown();
    this.updateFilterBar();
  }
  updateFilterBar() {
    if (!this.parentWidget() || this.showingWidget) {
      return;
    }
    if (this.visible()) {
      this.showingWidget = true;
      this.showWidget();
      this.showingWidget = false;
    } else {
      this.hideWidget();
    }
  }
  focus() {
    for (let i = 0; i < this.filters.length; ++i) {
      if (this.filters[i] instanceof TextFilterUI) {
        const textFilterUI = this.filters[i];
        textFilterUI.focus();
        break;
      }
    }
  }
  hasActiveFilter() {
    for (const filter of this.filters) {
      if (filter.isActive()) {
        return true;
      }
    }
    return false;
  }
  updateFilterButton() {
    const isActive = this.hasActiveFilter();
    this.filterButtonInternal.setChecked(isActive);
  }
  clear() {
    this.element.removeChildren();
    this.filters = [];
    this.updateFilterButton();
  }
  setting() {
    return this.stateSetting;
  }
  visible() {
    return this.alwaysShowFilters || this.stateSetting.get() && this.enabled;
  }
}
export var FilterBarEvents = /* @__PURE__ */ ((FilterBarEvents2) => {
  FilterBarEvents2["CHANGED"] = "Changed";
  return FilterBarEvents2;
})(FilterBarEvents || {});
export var FilterUIEvents = /* @__PURE__ */ ((FilterUIEvents2) => {
  FilterUIEvents2["FILTER_CHANGED"] = "FilterChanged";
  return FilterUIEvents2;
})(FilterUIEvents || {});
export class TextFilterUI extends Common.ObjectWrapper.ObjectWrapper {
  filterElement;
  #filter;
  suggestionProvider;
  constructor() {
    super();
    this.filterElement = document.createElement("div");
    const filterToolbar = new Toolbar("text-filter", this.filterElement);
    filterToolbar.element.style.borderBottom = "none";
    this.#filter = new ToolbarFilter(void 0, 1, 1, UIStrings.egSmalldUrlacomb, this.completions.bind(this));
    filterToolbar.appendToolbarItem(this.#filter);
    this.#filter.addEventListener(ToolbarInput.Event.TEXT_CHANGED, () => this.valueChanged());
    this.suggestionProvider = null;
  }
  completions(expression, prefix, force) {
    if (this.suggestionProvider) {
      return this.suggestionProvider(expression, prefix, force);
    }
    return Promise.resolve([]);
  }
  isActive() {
    return Boolean(this.#filter.valueWithoutSuggestion());
  }
  element() {
    return this.filterElement;
  }
  value() {
    return this.#filter.valueWithoutSuggestion();
  }
  setValue(value) {
    this.#filter.setValue(value);
    this.valueChanged();
  }
  focus() {
    this.#filter.focus();
  }
  setSuggestionProvider(suggestionProvider) {
    this.#filter.clearAutocomplete();
    this.suggestionProvider = suggestionProvider;
  }
  valueChanged() {
    this.dispatchEventToListeners("FilterChanged" /* FILTER_CHANGED */);
  }
  clear() {
    this.setValue("");
  }
}
export class NamedBitSetFilterUIElement extends HTMLElement {
  #options = { items: [] };
  #shadow = this.attachShadow({ mode: "open" });
  #namedBitSetFilterUI;
  set options(options) {
    this.#options = options;
  }
  getOrCreateNamedBitSetFilterUI() {
    if (this.#namedBitSetFilterUI) {
      return this.#namedBitSetFilterUI;
    }
    const namedBitSetFilterUI = new NamedBitSetFilterUI(this.#options.items, this.#options.setting);
    namedBitSetFilterUI.element().classList.add("named-bitset-filter");
    const disclosureElement = this.#shadow.createChild("div", "named-bit-set-filter-disclosure");
    disclosureElement.appendChild(namedBitSetFilterUI.element());
    namedBitSetFilterUI.addEventListener("FilterChanged" /* FILTER_CHANGED */, this.#filterChanged.bind(this));
    this.#namedBitSetFilterUI = namedBitSetFilterUI;
    return this.#namedBitSetFilterUI;
  }
  connectedCallback() {
    ThemeSupport.ThemeSupport.instance().appendStyle(this.#shadow, filterStyles);
  }
  #filterChanged() {
    const domEvent = new CustomEvent("filterChanged");
    this.dispatchEvent(domEvent);
  }
}
customElements.define("devtools-named-bit-set-filter", NamedBitSetFilterUIElement);
export class NamedBitSetFilterUI extends Common.ObjectWrapper.ObjectWrapper {
  filtersElement;
  typeFilterElementTypeNames;
  allowedTypes;
  typeFilterElements;
  setting;
  constructor(items, setting) {
    super();
    this.filtersElement = document.createElement("div");
    this.filtersElement.classList.add("filter-bitset-filter");
    this.filtersElement.setAttribute("jslog", `${VisualLogging.section("filter-bitset")}`);
    ARIAUtils.markAsListBox(this.filtersElement);
    ARIAUtils.markAsMultiSelectable(this.filtersElement);
    Tooltip.install(this.filtersElement, i18nString(UIStrings.sclickToSelectMultipleTypes, {
      PH1: KeyboardShortcut.shortcutToString("", Modifiers.CtrlOrMeta.value)
    }));
    this.typeFilterElementTypeNames = /* @__PURE__ */ new WeakMap();
    this.allowedTypes = /* @__PURE__ */ new Set();
    this.typeFilterElements = [];
    this.addBit(NamedBitSetFilterUI.ALL_TYPES, i18nString(UIStrings.allStrings));
    this.typeFilterElements[0].tabIndex = 0;
    this.filtersElement.createChild("div", "filter-bitset-filter-divider");
    for (let i = 0; i < items.length; ++i) {
      this.addBit(items[i].name, items[i].label(), items[i].title);
    }
    if (setting) {
      this.setting = setting;
      setting.addChangeListener(this.settingChanged.bind(this));
      this.settingChanged();
    } else {
      this.toggleTypeFilter(
        NamedBitSetFilterUI.ALL_TYPES,
        false
        /* allowMultiSelect */
      );
    }
  }
  reset() {
    this.toggleTypeFilter(
      NamedBitSetFilterUI.ALL_TYPES,
      false
      /* allowMultiSelect */
    );
  }
  isActive() {
    return !this.allowedTypes.has(NamedBitSetFilterUI.ALL_TYPES);
  }
  element() {
    return this.filtersElement;
  }
  accept(typeName) {
    return this.allowedTypes.has(NamedBitSetFilterUI.ALL_TYPES) || this.allowedTypes.has(typeName);
  }
  settingChanged() {
    const allowedTypesFromSetting = this.setting.get();
    this.allowedTypes = /* @__PURE__ */ new Set();
    for (const element of this.typeFilterElements) {
      const typeName = this.typeFilterElementTypeNames.get(element);
      if (typeName && allowedTypesFromSetting[typeName]) {
        this.allowedTypes.add(typeName);
      }
    }
    this.update();
  }
  update() {
    if (this.allowedTypes.size === 0 || this.allowedTypes.has(NamedBitSetFilterUI.ALL_TYPES)) {
      this.allowedTypes = /* @__PURE__ */ new Set();
      this.allowedTypes.add(NamedBitSetFilterUI.ALL_TYPES);
    }
    for (const element of this.typeFilterElements) {
      const typeName = this.typeFilterElementTypeNames.get(element);
      const active = this.allowedTypes.has(typeName || "");
      element.classList.toggle("selected", active);
      ARIAUtils.setSelected(element, active);
    }
    this.dispatchEventToListeners("FilterChanged" /* FILTER_CHANGED */);
  }
  addBit(name, label, title) {
    const typeFilterElement = this.filtersElement.createChild("span", name);
    typeFilterElement.tabIndex = -1;
    this.typeFilterElementTypeNames.set(typeFilterElement, name);
    createTextChild(typeFilterElement, label);
    ARIAUtils.markAsOption(typeFilterElement);
    if (title) {
      typeFilterElement.title = title;
    }
    typeFilterElement.addEventListener("click", this.onTypeFilterClicked.bind(this), false);
    typeFilterElement.addEventListener("keydown", this.onTypeFilterKeydown.bind(this), false);
    typeFilterElement.setAttribute("jslog", `${VisualLogging.item(name).track({ click: true })}`);
    this.typeFilterElements.push(typeFilterElement);
  }
  onTypeFilterClicked(event) {
    const e = event;
    let toggle;
    if (Host.Platform.isMac()) {
      toggle = e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey;
    } else {
      toggle = e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey;
    }
    if (e.target) {
      const element = e.target;
      const typeName = this.typeFilterElementTypeNames.get(element);
      this.toggleTypeFilter(typeName, toggle);
    }
  }
  onTypeFilterKeydown(ev) {
    const event = ev;
    const element = event.target;
    if (!element) {
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      if (this.keyFocusNextBit(
        element,
        true
        /* selectPrevious */
      )) {
        event.consume(true);
      }
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      if (this.keyFocusNextBit(
        element,
        false
        /* selectPrevious */
      )) {
        event.consume(true);
      }
    } else if (Platform.KeyboardUtilities.isEnterOrSpaceKey(event)) {
      this.onTypeFilterClicked(event);
    }
  }
  keyFocusNextBit(target, selectPrevious) {
    const index = this.typeFilterElements.indexOf(target);
    if (index === -1) {
      return false;
    }
    const nextIndex = selectPrevious ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= this.typeFilterElements.length) {
      return false;
    }
    const nextElement = this.typeFilterElements[nextIndex];
    nextElement.tabIndex = 0;
    target.tabIndex = -1;
    nextElement.focus();
    return true;
  }
  toggleTypeFilter(typeName, allowMultiSelect) {
    if (allowMultiSelect && typeName !== NamedBitSetFilterUI.ALL_TYPES) {
      this.allowedTypes.delete(NamedBitSetFilterUI.ALL_TYPES);
    } else {
      this.allowedTypes = /* @__PURE__ */ new Set();
    }
    if (this.allowedTypes.has(typeName)) {
      this.allowedTypes.delete(typeName);
    } else {
      this.allowedTypes.add(typeName);
    }
    if (this.allowedTypes.size === 0) {
      this.allowedTypes.add(NamedBitSetFilterUI.ALL_TYPES);
    }
    if (this.setting) {
      const updatedSetting = {};
      for (const type of this.allowedTypes) {
        updatedSetting[type] = true;
      }
      this.setting.set(updatedSetting);
    } else {
      this.update();
    }
  }
  static ALL_TYPES = "all";
}
export class CheckboxFilterUI extends Common.ObjectWrapper.ObjectWrapper {
  filterElement;
  activeWhenChecked;
  label;
  checkboxElement;
  constructor(className, title, activeWhenChecked, setting, jslogContext) {
    super();
    this.filterElement = document.createElement("div");
    this.filterElement.classList.add("filter-checkbox-filter");
    this.activeWhenChecked = Boolean(activeWhenChecked);
    this.label = CheckboxLabel.create(title);
    this.filterElement.appendChild(this.label);
    this.checkboxElement = this.label.checkboxElement;
    if (setting) {
      bindCheckbox(this.checkboxElement, setting);
    } else {
      this.checkboxElement.checked = true;
    }
    this.checkboxElement.addEventListener("change", this.fireUpdated.bind(this), false);
    if (jslogContext) {
      this.checkboxElement.setAttribute(
        "jslog",
        `${VisualLogging.toggle().track({ change: true }).context(jslogContext)}`
      );
    }
  }
  isActive() {
    return this.activeWhenChecked === this.checkboxElement.checked;
  }
  checked() {
    return this.checkboxElement.checked;
  }
  setChecked(checked) {
    this.checkboxElement.checked = checked;
  }
  element() {
    return this.filterElement;
  }
  labelElement() {
    return this.label;
  }
  fireUpdated() {
    this.dispatchEventToListeners("FilterChanged" /* FILTER_CHANGED */);
  }
}
//# sourceMappingURL=FilterBar.js.map

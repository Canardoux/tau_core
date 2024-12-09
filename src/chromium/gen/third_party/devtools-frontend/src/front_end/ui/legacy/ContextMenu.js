"use strict";
import * as Host from "../../core/host/host.js";
import * as Root from "../../core/root/root.js";
import * as VisualLogging from "../visual_logging/visual_logging.js";
import { ActionRegistry } from "./ActionRegistry.js";
import { ShortcutRegistry } from "./ShortcutRegistry.js";
import { SoftContextMenu } from "./SoftContextMenu.js";
import { deepElementFromEvent } from "./UIUtils.js";
export class Item {
  typeInternal;
  label;
  accelerator;
  previewFeature;
  disabled;
  checked;
  isDevToolsPerformanceMenuItem;
  contextMenu;
  idInternal;
  customElement;
  shortcut;
  #tooltip;
  jslogContext;
  constructor(contextMenu, type, label, isPreviewFeature, disabled, checked, accelerator, tooltip, jslogContext) {
    this.typeInternal = type;
    this.label = label;
    this.previewFeature = Boolean(isPreviewFeature);
    this.accelerator = accelerator;
    this.disabled = disabled;
    this.checked = checked;
    this.isDevToolsPerformanceMenuItem = false;
    this.contextMenu = contextMenu;
    this.idInternal = void 0;
    this.#tooltip = tooltip;
    if (type === "item" || type === "checkbox") {
      this.idInternal = contextMenu ? contextMenu.nextId() : 0;
    }
    this.jslogContext = jslogContext;
  }
  id() {
    if (this.idInternal === void 0) {
      throw new Error("Tried to access a ContextMenu Item ID but none was set.");
    }
    return this.idInternal;
  }
  type() {
    return this.typeInternal;
  }
  isPreviewFeature() {
    return this.previewFeature;
  }
  isEnabled() {
    return !this.disabled;
  }
  setEnabled(enabled) {
    this.disabled = !enabled;
  }
  buildDescriptor() {
    switch (this.typeInternal) {
      case "item": {
        const result = {
          type: "item",
          id: this.idInternal,
          label: this.label,
          isExperimentalFeature: this.previewFeature,
          enabled: !this.disabled,
          checked: void 0,
          subItems: void 0,
          tooltip: this.#tooltip,
          jslogContext: this.jslogContext
        };
        if (this.customElement) {
          result.element = this.customElement;
        }
        if (this.shortcut) {
          result.shortcut = this.shortcut;
        }
        if (this.accelerator) {
          result.accelerator = this.accelerator;
          if (this.isDevToolsPerformanceMenuItem) {
            result.isDevToolsPerformanceMenuItem = true;
          }
        }
        return result;
      }
      case "separator": {
        return {
          type: "separator",
          id: void 0,
          label: void 0,
          enabled: void 0,
          checked: void 0,
          subItems: void 0
        };
      }
      case "checkbox": {
        const result = {
          type: "checkbox",
          id: this.idInternal,
          label: this.label,
          checked: Boolean(this.checked),
          enabled: !this.disabled,
          subItems: void 0,
          tooltip: this.#tooltip,
          jslogContext: this.jslogContext
        };
        if (this.customElement) {
          result.element = this.customElement;
        }
        return result;
      }
    }
    throw new Error("Invalid item type:" + this.typeInternal);
  }
  setAccelerator(key, modifiers) {
    const modifierSum = modifiers.reduce((result, modifier) => result + modifier.value, 0);
    this.accelerator = { keyCode: key.code, modifiers: modifierSum };
  }
  // This influences whether accelerators will be shown for native menus on Mac.
  // Use this ONLY for performance menus and ONLY where accelerators are critical
  // for a smooth user journey and heavily context dependent.
  setIsDevToolsPerformanceMenuItem(isDevToolsPerformanceMenuItem) {
    this.isDevToolsPerformanceMenuItem = isDevToolsPerformanceMenuItem;
  }
  setShortcut(shortcut) {
    this.shortcut = shortcut;
  }
}
export class Section {
  contextMenu;
  items;
  constructor(contextMenu) {
    this.contextMenu = contextMenu;
    this.items = [];
  }
  appendItem(label, handler, options) {
    const item = new Item(
      this.contextMenu,
      "item",
      label,
      options?.isPreviewFeature,
      options?.disabled,
      void 0,
      options?.accelerator,
      options?.tooltip,
      options?.jslogContext
    );
    if (options?.additionalElement) {
      item.customElement = options?.additionalElement;
    }
    this.items.push(item);
    if (this.contextMenu) {
      this.contextMenu.setHandler(item.id(), handler);
    }
    return item;
  }
  appendCustomItem(element, jslogContext) {
    const item = new Item(
      this.contextMenu,
      "item",
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      jslogContext
    );
    item.customElement = element;
    this.items.push(item);
    return item;
  }
  appendSeparator() {
    const item = new Item(this.contextMenu, "separator");
    this.items.push(item);
    return item;
  }
  appendAction(actionId, label, optional) {
    if (optional && !ActionRegistry.instance().hasAction(actionId)) {
      return;
    }
    const action = ActionRegistry.instance().getAction(actionId);
    if (!label) {
      label = action.title();
    }
    const result = this.appendItem(label, action.execute.bind(action), {
      disabled: !action.enabled(),
      jslogContext: actionId
    });
    const shortcut = ShortcutRegistry.instance().shortcutTitleForAction(actionId);
    if (shortcut) {
      result.setShortcut(shortcut);
    }
  }
  appendSubMenuItem(label, disabled, jslogContext) {
    const item = new SubMenu(this.contextMenu, label, disabled, jslogContext);
    item.init();
    this.items.push(item);
    return item;
  }
  appendCheckboxItem(label, handler, options) {
    const item = new Item(
      this.contextMenu,
      "checkbox",
      label,
      void 0,
      options?.disabled,
      options?.checked,
      void 0,
      options?.tooltip,
      options?.jslogContext
    );
    this.items.push(item);
    if (this.contextMenu) {
      this.contextMenu.setHandler(item.id(), handler);
    }
    if (options?.additionalElement) {
      item.customElement = options.additionalElement;
    }
    return item;
  }
}
export class SubMenu extends Item {
  sections;
  sectionList;
  constructor(contextMenu, label, disabled, jslogContext) {
    super(contextMenu, "subMenu", label, void 0, disabled, void 0, void 0, void 0, jslogContext);
    this.sections = /* @__PURE__ */ new Map();
    this.sectionList = [];
  }
  init() {
    ContextMenu.groupWeights.forEach((name) => this.section(name));
  }
  section(name) {
    if (!name) {
      name = "default";
    }
    let section = name ? this.sections.get(name) : null;
    if (!section) {
      section = new Section(this.contextMenu);
      if (name) {
        this.sections.set(name, section);
        this.sectionList.push(section);
      } else {
        this.sectionList.splice(ContextMenu.groupWeights.indexOf("default"), 0, section);
      }
    }
    return section;
  }
  headerSection() {
    return this.section("header");
  }
  newSection() {
    return this.section("new");
  }
  revealSection() {
    return this.section("reveal");
  }
  clipboardSection() {
    return this.section("clipboard");
  }
  editSection() {
    return this.section("edit");
  }
  debugSection() {
    return this.section("debug");
  }
  viewSection() {
    return this.section("view");
  }
  defaultSection() {
    return this.section("default");
  }
  overrideSection() {
    return this.section("override");
  }
  saveSection() {
    return this.section("save");
  }
  footerSection() {
    return this.section("footer");
  }
  buildDescriptor() {
    const result = {
      type: "subMenu",
      label: this.label,
      accelerator: this.accelerator,
      isDevToolsPerformanceMenuItem: this.accelerator ? this.isDevToolsPerformanceMenuItem : void 0,
      isExperimentalFeature: this.previewFeature,
      enabled: !this.disabled,
      subItems: [],
      id: void 0,
      checked: void 0,
      jslogContext: this.jslogContext
    };
    const nonEmptySections = this.sectionList.filter((section) => Boolean(section.items.length));
    for (const section of nonEmptySections) {
      for (const item of section.items) {
        if (!result.subItems) {
          result.subItems = [];
        }
        result.subItems.push(item.buildDescriptor());
      }
      if (section !== nonEmptySections[nonEmptySections.length - 1]) {
        if (!result.subItems) {
          result.subItems = [];
        }
        result.subItems.push({
          type: "separator",
          id: void 0,
          subItems: void 0,
          checked: void 0,
          enabled: void 0,
          label: void 0
        });
      }
    }
    return result;
  }
  appendItemsAtLocation(location) {
    const items = getRegisteredItems();
    items.sort((firstItem, secondItem) => {
      const order1 = firstItem.order || 0;
      const order2 = secondItem.order || 0;
      return order1 - order2;
    });
    for (const item of items) {
      if (item.experiment && !Root.Runtime.experiments.isEnabled(item.experiment)) {
        continue;
      }
      const itemLocation = item.location;
      const actionId = item.actionId;
      if (!itemLocation || !itemLocation.startsWith(location + "/")) {
        continue;
      }
      const section = itemLocation.substr(location.length + 1);
      if (!section || section.includes("/")) {
        continue;
      }
      if (actionId) {
        this.section(section).appendAction(actionId);
      }
    }
  }
  static uniqueSectionName = 0;
}
export class ContextMenu extends SubMenu {
  contextMenu;
  pendingTargets;
  event;
  useSoftMenu;
  keepOpen;
  x;
  y;
  onSoftMenuClosed;
  jsLogContext;
  handlers;
  idInternal;
  softMenu;
  contextMenuLabel;
  openHostedMenu;
  eventTarget;
  loggableParent = null;
  constructor(event, options = {}) {
    super(null);
    const mouseEvent = event;
    this.contextMenu = this;
    super.init();
    this.pendingTargets = [];
    this.event = mouseEvent;
    this.eventTarget = this.event.target;
    this.useSoftMenu = Boolean(options.useSoftMenu);
    this.keepOpen = Boolean(options.keepOpen);
    this.x = options.x === void 0 ? mouseEvent.x : options.x;
    this.y = options.y === void 0 ? mouseEvent.y : options.y;
    this.onSoftMenuClosed = options.onSoftMenuClosed;
    this.handlers = /* @__PURE__ */ new Map();
    this.idInternal = 0;
    this.openHostedMenu = null;
    let target = deepElementFromEvent(event) || event.target;
    if (target) {
      this.appendApplicableItems(target);
      while (target instanceof Element && !target.hasAttribute("jslog")) {
        target = target.parentElementOrShadowHost() ?? null;
      }
      if (target instanceof Element) {
        this.loggableParent = target;
      }
    }
  }
  static initialize() {
    Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(
      Host.InspectorFrontendHostAPI.Events.SetUseSoftMenu,
      setUseSoftMenu
    );
    function setUseSoftMenu(event) {
      ContextMenu.useSoftMenu = event.data;
    }
  }
  static installHandler(doc) {
    doc.body.addEventListener("contextmenu", handler, false);
    function handler(event) {
      const contextMenu = new ContextMenu(event);
      void contextMenu.show();
    }
  }
  nextId() {
    return this.idInternal++;
  }
  isHostedMenuOpen() {
    return Boolean(this.openHostedMenu);
  }
  getItems() {
    return this.softMenu?.getItems() || [];
  }
  setChecked(item, checked) {
    this.softMenu?.setChecked(item, checked);
  }
  async show() {
    ContextMenu.pendingMenu = this;
    this.event.consume(true);
    const loadedProviders = await Promise.all(this.pendingTargets.map(async (target) => {
      const providers = await loadApplicableRegisteredProviders(target);
      return { target, providers };
    }));
    if (ContextMenu.pendingMenu !== this) {
      return;
    }
    ContextMenu.pendingMenu = null;
    for (const { target, providers } of loadedProviders) {
      for (const provider of providers) {
        provider.appendApplicableItems(this.event, this, target);
      }
    }
    this.pendingTargets = [];
    this.innerShow();
  }
  discard() {
    if (this.softMenu) {
      this.softMenu.discard();
    }
  }
  registerLoggablesWithin(descriptors, parent) {
    for (const descriptor of descriptors) {
      if (descriptor.jslogContext) {
        if (descriptor.type === "checkbox") {
          VisualLogging.registerLoggable(
            descriptor,
            `${VisualLogging.toggle().track({ click: true }).context(descriptor.jslogContext)}`,
            parent || descriptors
          );
        } else if (descriptor.type === "item") {
          VisualLogging.registerLoggable(
            descriptor,
            `${VisualLogging.action().track({ click: true }).context(descriptor.jslogContext)}`,
            parent || descriptors
          );
        } else if (descriptor.type === "subMenu") {
          VisualLogging.registerLoggable(
            descriptor,
            `${VisualLogging.item().context(descriptor.jslogContext)}`,
            parent || descriptors
          );
        }
        if (descriptor.subItems) {
          this.registerLoggablesWithin(descriptor.subItems, descriptor);
        }
      }
    }
  }
  innerShow() {
    if (!this.eventTarget) {
      return;
    }
    const menuObject = this.buildMenuDescriptors();
    const ownerDocument = this.eventTarget.ownerDocument;
    if (this.useSoftMenu || ContextMenu.useSoftMenu || Host.InspectorFrontendHost.InspectorFrontendHostInstance.isHostedMode()) {
      this.softMenu = new SoftContextMenu(
        menuObject,
        this.itemSelected.bind(this),
        this.keepOpen,
        void 0,
        this.onSoftMenuClosed,
        this.loggableParent
      );
      const isMouseEvent = this.event.pointerType === "mouse" && this.event.button >= 0;
      this.softMenu.setFocusOnTheFirstItem(!isMouseEvent);
      this.softMenu.show(ownerDocument, new AnchorBox(this.x, this.y, 0, 0));
      if (this.contextMenuLabel) {
        this.softMenu.setContextMenuElementLabel(this.contextMenuLabel);
      }
    } else {
      let listenToEvents2 = function() {
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(
          Host.InspectorFrontendHostAPI.Events.ContextMenuCleared,
          this.menuCleared,
          this
        );
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(
          Host.InspectorFrontendHostAPI.Events.ContextMenuItemSelected,
          this.onItemSelected,
          this
        );
      };
      var listenToEvents = listenToEvents2;
      Host.InspectorFrontendHost.InspectorFrontendHostInstance.showContextMenuAtPoint(
        this.x,
        this.y,
        menuObject,
        ownerDocument
      );
      VisualLogging.registerLoggable(menuObject, `${VisualLogging.menu()}`, this.loggableParent);
      this.registerLoggablesWithin(menuObject);
      this.openHostedMenu = menuObject;
      queueMicrotask(listenToEvents2.bind(this));
    }
  }
  setContextMenuLabel(label) {
    this.contextMenuLabel = label;
  }
  setX(x) {
    this.x = x;
  }
  setY(y) {
    this.y = y;
  }
  setHandler(id, handler) {
    if (handler) {
      this.handlers.set(id, handler);
    }
  }
  invokeHandler(id) {
    const handler = this.handlers.get(id);
    if (handler) {
      handler.call(this);
    }
  }
  buildMenuDescriptors() {
    return super.buildDescriptor().subItems;
  }
  onItemSelected(event) {
    this.itemSelected(event.data);
  }
  itemSelected(id) {
    this.invokeHandler(id);
    if (this.openHostedMenu) {
      const itemWithId = (items, id2) => {
        for (const item2 of items) {
          if (item2.id === id2) {
            return item2;
          }
          const subitem = item2.subItems && itemWithId(item2.subItems, id2);
          if (subitem) {
            return subitem;
          }
        }
        return null;
      };
      const item = itemWithId(this.openHostedMenu, id);
      if (item && item.jslogContext) {
        void VisualLogging.logClick(item, new MouseEvent("click"));
      }
    }
    this.menuCleared();
  }
  menuCleared() {
    Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.removeEventListener(
      Host.InspectorFrontendHostAPI.Events.ContextMenuCleared,
      this.menuCleared,
      this
    );
    Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.removeEventListener(
      Host.InspectorFrontendHostAPI.Events.ContextMenuItemSelected,
      this.onItemSelected,
      this
    );
    if (this.openHostedMenu) {
      void VisualLogging.logResize(this.openHostedMenu, new DOMRect(0, 0, 0, 0));
    }
    this.openHostedMenu = null;
    if (!this.keepOpen) {
      this.onSoftMenuClosed?.();
    }
  }
  /**
   * Appends the `target` to the list of pending targets for which context menu providers
   * will be loaded when showing the context menu. If the `target` was already appended
   * before, it just ignores this call.
   *
   * @param target an object for which we can have registered menu item providers.
   */
  appendApplicableItems(target) {
    if (this.pendingTargets.includes(target)) {
      return;
    }
    this.pendingTargets.push(target);
  }
  markAsMenuItemCheckBox() {
    if (this.softMenu) {
      this.softMenu.markAsMenuItemCheckBox();
    }
  }
  static pendingMenu = null;
  static useSoftMenu = false;
  static groupWeights = ["header", "new", "reveal", "edit", "clipboard", "debug", "view", "default", "override", "save", "footer"];
}
const registeredProviders = [];
export function registerProvider(registration) {
  registeredProviders.push(registration);
}
async function loadApplicableRegisteredProviders(target) {
  const providers = [];
  for (const providerRegistration of registeredProviders) {
    if (!Root.Runtime.Runtime.isDescriptorEnabled(
      { experiment: providerRegistration.experiment, condition: void 0 }
    )) {
      continue;
    }
    if (providerRegistration.contextTypes) {
      for (const contextType of providerRegistration.contextTypes()) {
        if (target instanceof contextType) {
          providers.push(await providerRegistration.loadProvider());
        }
      }
    }
  }
  return providers;
}
const registeredItemsProviders = [];
export function registerItem(registration) {
  registeredItemsProviders.push(registration);
}
export function maybeRemoveItem(registration) {
  const itemIndex = registeredItemsProviders.findIndex(
    (item) => item.actionId === registration.actionId && item.location === registration.location
  );
  if (itemIndex < 0) {
    return false;
  }
  registeredItemsProviders.splice(itemIndex, 1);
  return true;
}
function getRegisteredItems() {
  return registeredItemsProviders;
}
export var ItemLocation = /* @__PURE__ */ ((ItemLocation2) => {
  ItemLocation2["DEVICE_MODE_MENU_SAVE"] = "deviceModeMenu/save";
  ItemLocation2["MAIN_MENU"] = "mainMenu";
  ItemLocation2["MAIN_MENU_DEFAULT"] = "mainMenu/default";
  ItemLocation2["MAIN_MENU_FOOTER"] = "mainMenu/footer";
  ItemLocation2["MAIN_MENU_HELP_DEFAULT"] = "mainMenuHelp/default";
  ItemLocation2["NAVIGATOR_MENU_DEFAULT"] = "navigatorMenu/default";
  ItemLocation2["PROFILER_MENU_DEFAULT"] = "profilerMenu/default";
  ItemLocation2["TIMELINE_MENU_OPEN"] = "timelineMenu/open";
  return ItemLocation2;
})(ItemLocation || {});
//# sourceMappingURL=ContextMenu.js.map

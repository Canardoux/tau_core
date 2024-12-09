"use strict";
import "../../../ui/components/icon_button/icon_button.js";
import * as i18n from "../../../core/i18n/i18n.js";
import * as LitHtml from "../../../ui/lit-html/lit-html.js";
import * as VisualLogging from "../../../ui/visual_logging/visual_logging.js";
import linearMemoryNavigatorStyles from "./linearMemoryNavigator.css.js";
const UIStrings = {
  /**
   *@description Tooltip text that appears when hovering over a valid memory address (e.g. 0x0) in the address line in the Linear memory inspector.
   */
  enterAddress: "Enter address",
  /**
   *@description Tooltip text that appears when hovering over the button to go back in history in the Linear Memory Navigator
   */
  goBackInAddressHistory: "Go back in address history",
  /**
   *@description Tooltip text that appears when hovering over the button to go forward in history in the Linear Memory Navigator
   */
  goForwardInAddressHistory: "Go forward in address history",
  /**
   *@description Tooltip text that appears when hovering over the page back icon in the Linear Memory Navigator
   */
  previousPage: "Previous page",
  /**
   *@description Tooltip text that appears when hovering over the next page icon in the Linear Memory Navigator
   */
  nextPage: "Next page",
  /**
   *@description Text to refresh the page
   */
  refresh: "Refresh"
};
const str_ = i18n.i18n.registerUIStrings("panels/linear_memory_inspector/components/LinearMemoryNavigator.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
const { render, html, Directives: { ifDefined } } = LitHtml;
export var Navigation = /* @__PURE__ */ ((Navigation2) => {
  Navigation2["BACKWARD"] = "Backward";
  Navigation2["FORWARD"] = "Forward";
  return Navigation2;
})(Navigation || {});
export class AddressInputChangedEvent extends Event {
  static eventName = "addressinputchanged";
  data;
  constructor(address, mode) {
    super(AddressInputChangedEvent.eventName);
    this.data = { address, mode };
  }
}
export class PageNavigationEvent extends Event {
  static eventName = "pagenavigation";
  data;
  constructor(navigation) {
    super(PageNavigationEvent.eventName, {});
    this.data = navigation;
  }
}
export class HistoryNavigationEvent extends Event {
  static eventName = "historynavigation";
  data;
  constructor(navigation) {
    super(HistoryNavigationEvent.eventName, {});
    this.data = navigation;
  }
}
export class RefreshRequestedEvent extends Event {
  static eventName = "refreshrequested";
  constructor() {
    super(RefreshRequestedEvent.eventName, {});
  }
}
export var Mode = /* @__PURE__ */ ((Mode2) => {
  Mode2["EDIT"] = "Edit";
  Mode2["SUBMITTED"] = "Submitted";
  Mode2["INVALID_SUBMIT"] = "InvalidSubmit";
  return Mode2;
})(Mode || {});
export class LinearMemoryNavigator extends HTMLElement {
  #shadow = this.attachShadow({ mode: "open" });
  #address = "0";
  #error = void 0;
  #valid = true;
  #canGoBackInHistory = false;
  #canGoForwardInHistory = false;
  connectedCallback() {
    this.#shadow.adoptedStyleSheets = [linearMemoryNavigatorStyles];
  }
  set data(data) {
    this.#address = data.address;
    this.#error = data.error;
    this.#valid = data.valid;
    this.#canGoBackInHistory = data.canGoBackInHistory;
    this.#canGoForwardInHistory = data.canGoForwardInHistory;
    this.#render();
    const addressInput = this.#shadow.querySelector(".address-input");
    if (addressInput) {
      if (data.mode === "Submitted" /* SUBMITTED */) {
        addressInput.blur();
      } else if (data.mode === "InvalidSubmit" /* INVALID_SUBMIT */) {
        addressInput.select();
      }
    }
  }
  #render() {
    const result = html`
      <div class="navigator">
        <div class="navigator-item">
          ${this.#createButton({
      icon: "undo",
      title: i18nString(UIStrings.goBackInAddressHistory),
      event: new HistoryNavigationEvent("Backward" /* BACKWARD */),
      enabled: this.#canGoBackInHistory,
      jslogContext: "linear-memory-inspector.history-back"
    })}
          ${this.#createButton({
      icon: "redo",
      title: i18nString(UIStrings.goForwardInAddressHistory),
      event: new HistoryNavigationEvent("Forward" /* FORWARD */),
      enabled: this.#canGoForwardInHistory,
      jslogContext: "linear-memory-inspector.history-forward"
    })}
        </div>
        <div class="navigator-item">
          ${this.#createButton({
      icon: "chevron-left",
      title: i18nString(UIStrings.previousPage),
      event: new PageNavigationEvent("Backward" /* BACKWARD */),
      enabled: true,
      jslogContext: "linear-memory-inspector.previous-page"
    })}
          ${this.#createAddressInput()}
          ${this.#createButton({
      icon: "chevron-right",
      title: i18nString(UIStrings.nextPage),
      event: new PageNavigationEvent("Forward" /* FORWARD */),
      enabled: true,
      jslogContext: "linear-memory-inspector.next-page"
    })}
        </div>
        ${this.#createButton({
      icon: "refresh",
      title: i18nString(UIStrings.refresh),
      event: new RefreshRequestedEvent(),
      enabled: true,
      jslogContext: "linear-memory-inspector.refresh"
    })}
      </div>
      `;
    render(result, this.#shadow, { host: this });
  }
  #createAddressInput() {
    const classMap = {
      "address-input": true,
      invalid: !this.#valid
    };
    return html`
      <input class=${LitHtml.Directives.classMap(classMap)} data-input="true" .value=${this.#address}
        jslog=${VisualLogging.textField("linear-memory-inspector.address").track({
      change: true
    })}
        title=${ifDefined(this.#valid ? i18nString(UIStrings.enterAddress) : this.#error)} @change=${this.#onAddressChange.bind(this, "Submitted" /* SUBMITTED */)} @input=${this.#onAddressChange.bind(this, "Edit" /* EDIT */)}/>`;
  }
  #onAddressChange(mode, event) {
    const addressInput = event.target;
    this.dispatchEvent(new AddressInputChangedEvent(addressInput.value, mode));
  }
  #createButton(data) {
    return html`
      <button class="navigator-button" ?disabled=${!data.enabled}
        jslog=${VisualLogging.action().track({ click: true, keydown: "Enter" }).context(data.jslogContext)}
        data-button=${data.event.type} title=${data.title}
        @click=${this.dispatchEvent.bind(this, data.event)}>
        <devtools-icon name=${data.icon}></devtools-icon>
      </button>`;
  }
}
customElements.define("devtools-linear-memory-inspector-navigator", LinearMemoryNavigator);
//# sourceMappingURL=LinearMemoryNavigator.js.map

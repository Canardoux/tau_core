"use strict";
import * as i18n from "../../../core/i18n/i18n.js";
import * as Platform from "../../../core/platform/platform.js";
import * as Protocol from "../../../generated/protocol.js";
import * as Coordinator from "../../../ui/components/render_coordinator/render_coordinator.js";
import * as LitHtml from "../../../ui/lit-html/lit-html.js";
import accessibilityTreeNodeStyles from "./accessibilityTreeNode.css.js";
const { html } = LitHtml;
const UIStrings = {
  /**
   *@description Ignored node element text content in Accessibility Tree View of the Elements panel
   */
  ignored: "Ignored"
};
const str_ = i18n.i18n.registerUIStrings("panels/elements/components/AccessibilityTreeNode.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
function truncateTextIfNeeded(text) {
  const maxTextContentLength = 1e4;
  if (text.length > maxTextContentLength) {
    return Platform.StringUtilities.trimMiddle(text, maxTextContentLength);
  }
  return text;
}
function isPrintable(valueType) {
  switch (valueType) {
    case Protocol.Accessibility.AXValueType.Boolean:
    case Protocol.Accessibility.AXValueType.BooleanOrUndefined:
    case Protocol.Accessibility.AXValueType.String:
    case Protocol.Accessibility.AXValueType.Number:
      return true;
    default:
      return false;
  }
}
export class AccessibilityTreeNode extends HTMLElement {
  #shadow = this.attachShadow({ mode: "open" });
  #ignored = true;
  #name = "";
  #role = "";
  #properties = [];
  #id = "";
  set data(data) {
    this.#ignored = data.ignored;
    this.#name = data.name;
    this.#role = data.role;
    this.#properties = data.properties;
    this.#id = data.id;
    void this.#render();
  }
  connectedCallback() {
    this.#shadow.adoptedStyleSheets = [accessibilityTreeNodeStyles];
  }
  async #render() {
    const role = html`<span class='role-value'>${truncateTextIfNeeded(this.#role)}</span>`;
    const name = html`"<span class='attribute-value'>${this.#name}</span>"`;
    const properties = this.#properties.map(
      ({ name: name2, value }) => isPrintable(value.type) ? html` <span class='attribute-name'>${name2}</span>:&nbsp;<span class='attribute-value'>${value.value}</span>` : LitHtml.nothing
    );
    const content = this.#ignored ? html`<span>${i18nString(UIStrings.ignored)}</span>` : html`${role}&nbsp;${name}${properties}`;
    await Coordinator.RenderCoordinator.RenderCoordinator.instance().write(
      `Accessibility node ${this.#id} render`,
      () => {
        LitHtml.render(
          html`<div class='container'>${content}</div>`,
          this.#shadow,
          { host: this }
        );
      }
    );
  }
}
customElements.define("devtools-accessibility-tree-node", AccessibilityTreeNode);
//# sourceMappingURL=AccessibilityTreeNode.js.map

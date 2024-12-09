"use strict";
import "../icon_button/icon_button.js";
import * as LitHtml from "../../lit-html/lit-html.js";
import floatingButtonStyles from "./floatingButton.css.js";
const { html, Directives: { ifDefined } } = LitHtml;
export class FloatingButton extends HTMLElement {
  #shadow = this.attachShadow({ mode: "open" });
  #data;
  constructor(data) {
    super();
    this.#data = data;
  }
  connectedCallback() {
    this.#shadow.adoptedStyleSheets = [floatingButtonStyles];
    this.#render();
  }
  set data(floatingButtonData) {
    this.#data = floatingButtonData;
  }
  #render() {
    LitHtml.render(html`<button class="floating-button" title=${ifDefined(this.#data.title)} .disabled=${Boolean(this.#data.disabled)}><devtools-icon class="icon" name=${this.#data.iconName}></devtools-icon></button>`, this.#shadow, { host: this });
  }
}
customElements.define("devtools-floating-button", FloatingButton);
//# sourceMappingURL=FloatingButton.js.map

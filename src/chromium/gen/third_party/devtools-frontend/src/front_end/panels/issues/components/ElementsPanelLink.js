"use strict";
import * as LitHtml from "../../../ui/lit-html/lit-html.js";
import * as VisualLogging from "../../../ui/visual_logging/visual_logging.js";
import elementsPanelLinkStyles from "./elementsPanelLink.css.js";
const { html } = LitHtml;
export class ElementsPanelLink extends HTMLElement {
  #shadow = this.attachShadow({ mode: "open" });
  #onElementRevealIconClick = () => {
  };
  #onElementRevealIconMouseEnter = () => {
  };
  #onElementRevealIconMouseLeave = () => {
  };
  set data(data) {
    this.#onElementRevealIconClick = data.onElementRevealIconClick;
    this.#onElementRevealIconMouseEnter = data.onElementRevealIconMouseEnter;
    this.#onElementRevealIconMouseLeave = data.onElementRevealIconMouseLeave;
    this.#update();
  }
  #update() {
    this.#render();
  }
  connectedCallback() {
    this.#shadow.adoptedStyleSheets = [elementsPanelLinkStyles];
  }
  #render() {
    LitHtml.render(html`
      <span
        class="element-reveal-icon"
        jslog=${VisualLogging.link("elements-panel").track({ click: true })}
        @click=${this.#onElementRevealIconClick}
        @mouseenter=${this.#onElementRevealIconMouseEnter}
        @mouseleave=${this.#onElementRevealIconMouseLeave}></span>
      `, this.#shadow, { host: this });
  }
}
customElements.define("devtools-elements-panel-link", ElementsPanelLink);
//# sourceMappingURL=ElementsPanelLink.js.map

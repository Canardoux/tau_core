"use strict";
import "../../legacy/legacy.js";
import * as LitHtml from "../../lit-html/lit-html.js";
import * as VisualLogging from "../../visual_logging/visual_logging.js";
import markdownLinkStyles from "./markdownLink.css.js";
import { getMarkdownLink } from "./MarkdownLinksMap.js";
const { html } = LitHtml;
export class MarkdownLink extends HTMLElement {
  #shadow = this.attachShadow({ mode: "open" });
  #linkText = "";
  #linkUrl = "";
  connectedCallback() {
    this.#shadow.adoptedStyleSheets = [markdownLinkStyles];
  }
  set data(data) {
    const { key, title } = data;
    const markdownLink = getMarkdownLink(key);
    this.#linkText = title;
    this.#linkUrl = markdownLink;
    this.#render();
  }
  #render() {
    const output = html`<x-link class="devtools-link" href=${this.#linkUrl} jslog=${VisualLogging.link().track({ click: true })}
    >${this.#linkText}</x-link>`;
    LitHtml.render(output, this.#shadow, { host: this });
  }
}
customElements.define("devtools-markdown-link", MarkdownLink);
//# sourceMappingURL=MarkdownLink.js.map

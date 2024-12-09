"use strict";
import inspectorCommonStyles from "../../../ui/legacy/inspectorCommon.css.js";
import * as LitHtml from "../../../ui/lit-html/lit-html.js";
import * as VisualLogging from "../../../ui/visual_logging/visual_logging.js";
import cssQueryStyles from "./cssQuery.css.js";
const { render, html } = LitHtml;
export class CSSQuery extends HTMLElement {
  #shadow = this.attachShadow({ mode: "open" });
  #queryPrefix = "";
  #queryName;
  #queryText = "";
  #onQueryTextClick;
  #jslogContext;
  set data(data) {
    this.#queryPrefix = data.queryPrefix;
    this.#queryName = data.queryName;
    this.#queryText = data.queryText;
    this.#onQueryTextClick = data.onQueryTextClick;
    this.#jslogContext = data.jslogContext;
    this.#render();
  }
  connectedCallback() {
    this.#shadow.adoptedStyleSheets = [
      cssQueryStyles,
      inspectorCommonStyles
    ];
  }
  #render() {
    const queryClasses = LitHtml.Directives.classMap({
      query: true,
      editable: Boolean(this.#onQueryTextClick)
    });
    const queryText = html`
      <span class="query-text" @click=${this.#onQueryTextClick}>${this.#queryText}</span>
    `;
    render(html`
      <div class=${queryClasses} jslog=${VisualLogging.cssRuleHeader(this.#jslogContext).track({ click: true, change: true })}>
        <slot name="indent"></slot>${this.#queryPrefix ? html`<span>${this.#queryPrefix + " "}</span>` : LitHtml.nothing}${this.#queryName ? html`<span>${this.#queryName + " "}</span>` : LitHtml.nothing}${queryText} {
      </div>
    `, this.#shadow, {
      host: this
    });
  }
}
customElements.define("devtools-css-query", CSSQuery);
//# sourceMappingURL=CSSQuery.js.map

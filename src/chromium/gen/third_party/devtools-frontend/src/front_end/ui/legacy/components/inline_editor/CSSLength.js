"use strict";
import * as Host from "../../../../core/host/host.js";
import * as UI from "../../../legacy/legacy.js";
import * as LitHtml from "../../../lit-html/lit-html.js";
import cssLengthStyles from "./cssLength.css.js";
import { ValueChangedEvent } from "./InlineEditorUtils.js";
const { render, html } = LitHtml;
export class DraggingFinishedEvent extends Event {
  static eventName = "draggingfinished";
  constructor() {
    super(DraggingFinishedEvent.eventName, {});
  }
}
export var CSSLengthUnit = /* @__PURE__ */ ((CSSLengthUnit2) => {
  CSSLengthUnit2["PIXEL"] = "px";
  CSSLengthUnit2["CENTIMETER"] = "cm";
  CSSLengthUnit2["MILLIMETER"] = "mm";
  CSSLengthUnit2["QUARTERMILLIMETER"] = "Q";
  CSSLengthUnit2["INCH"] = "in";
  CSSLengthUnit2["PICA"] = "pc";
  CSSLengthUnit2["POINT"] = "pt";
  CSSLengthUnit2["CAP"] = "cap";
  CSSLengthUnit2["CH"] = "ch";
  CSSLengthUnit2["EM"] = "em";
  CSSLengthUnit2["EX"] = "ex";
  CSSLengthUnit2["IC"] = "ic";
  CSSLengthUnit2["LH"] = "lh";
  CSSLengthUnit2["RCAP"] = "rcap";
  CSSLengthUnit2["RCH"] = "rch";
  CSSLengthUnit2["REM"] = "rem";
  CSSLengthUnit2["REX"] = "rex";
  CSSLengthUnit2["RIC"] = "ric";
  CSSLengthUnit2["RLH"] = "rlh";
  CSSLengthUnit2["VB"] = "vb";
  CSSLengthUnit2["VH"] = "vh";
  CSSLengthUnit2["VI"] = "vi";
  CSSLengthUnit2["VW"] = "vw";
  CSSLengthUnit2["VMIN"] = "vmin";
  CSSLengthUnit2["VMAX"] = "vmax";
  return CSSLengthUnit2;
})(CSSLengthUnit || {});
export const CSS_LENGTH_REGEX = new RegExp(`(?<value>[+-]?\\d*\\.?\\d+([Ee][+-]?\\d+)?)(?<unit>${Object.values(CSSLengthUnit).join("|")})`);
export class CSSLength extends HTMLElement {
  shadow = this.attachShadow({ mode: "open" });
  onDraggingValue = this.dragValue.bind(this);
  value = "";
  unit = "px" /* PIXEL */;
  isEditingSlot = false;
  isDraggingValue = false;
  #valueMousedownTime = 0;
  set data({ lengthText }) {
    const groups = lengthText.match(CSS_LENGTH_REGEX)?.groups;
    if (!groups) {
      throw new Error();
    }
    this.value = groups.value;
    this.unit = groups.unit;
    this.render();
  }
  connectedCallback() {
    this.shadow.adoptedStyleSheets = [cssLengthStyles];
  }
  dragValue(event) {
    event.preventDefault();
    event.stopPropagation();
    if (Date.now() - this.#valueMousedownTime <= 300) {
      return;
    }
    this.isDraggingValue = true;
    const newValue = UI.UIUtils.createReplacementString(this.value, event);
    if (newValue) {
      this.value = newValue;
      this.dispatchEvent(new ValueChangedEvent(`${this.value}${this.unit}`));
      Host.userMetrics.swatchActivated(Host.UserMetrics.SwatchType.LENGTH);
      this.render();
    }
  }
  onValueMousedown(event) {
    if (event.button !== 0) {
      return;
    }
    this.#valueMousedownTime = Date.now();
    const targetDocument = event.target instanceof Node && event.target.ownerDocument;
    if (targetDocument) {
      targetDocument.addEventListener("mousemove", this.onDraggingValue, { capture: true });
      targetDocument.addEventListener("mouseup", (event2) => {
        targetDocument.removeEventListener("mousemove", this.onDraggingValue, { capture: true });
        if (!this.isDraggingValue) {
          return;
        }
        event2.preventDefault();
        event2.stopPropagation();
        this.isDraggingValue = false;
        this.dispatchEvent(new DraggingFinishedEvent());
      }, { once: true, capture: true });
    }
  }
  onValueMouseup() {
    if (!this.isDraggingValue) {
      this.isEditingSlot = true;
      this.render();
    }
  }
  render() {
    render(this.renderContent(), this.shadow, {
      host: this
    });
  }
  renderContent() {
    if (this.isEditingSlot) {
      return html`<slot></slot>`;
    }
    return html`<span class="value" @mousedown=${this.onValueMousedown} @mouseup=${this.onValueMouseup}>${this.value}</span><span class="unit">${this.unit}</span>`;
  }
}
customElements.define("devtools-css-length", CSSLength);
//# sourceMappingURL=CSSLength.js.map

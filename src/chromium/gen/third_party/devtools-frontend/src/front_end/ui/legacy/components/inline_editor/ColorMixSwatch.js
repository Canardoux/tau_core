"use strict";
import * as Common from "../../../../core/common/common.js";
import * as Platform from "../../../../core/platform/platform.js";
import * as LitHtml from "../../../lit-html/lit-html.js";
import * as VisualLogging from "../../../visual_logging/visual_logging.js";
import colorMixSwatchStyles from "./colorMixSwatch.css.js";
const { html } = LitHtml;
export var Events = /* @__PURE__ */ ((Events2) => {
  Events2["COLOR_CHANGED"] = "colorChanged";
  return Events2;
})(Events || {});
export class ColorMixSwatch extends Common.ObjectWrapper.eventMixin(HTMLElement) {
  shadow = this.attachShadow({ mode: "open" });
  colorMixText = "";
  // color-mix(in srgb, hotpink, white)
  firstColorText = "";
  // hotpink
  secondColorText = "";
  // white
  #registerPopoverCallback;
  constructor() {
    super();
    this.shadow.adoptedStyleSheets = [
      colorMixSwatchStyles
    ];
  }
  get icon() {
    return this.shadow.firstElementChild;
  }
  mixedColor() {
    const colorText = this.icon?.computedStyleMap().get("color")?.toString() ?? null;
    return colorText ? Common.Color.parse(colorText) : null;
  }
  setFirstColor(text) {
    if (this.firstColorText) {
      this.colorMixText = this.colorMixText.replace(this.firstColorText, text);
    }
    this.firstColorText = text;
    this.dispatchEventToListeners("colorChanged" /* COLOR_CHANGED */, { text: this.colorMixText });
    this.#render();
  }
  setSecondColor(text) {
    if (this.secondColorText) {
      this.colorMixText = Platform.StringUtilities.replaceLast(this.colorMixText, this.secondColorText, text);
    }
    this.secondColorText = text;
    this.dispatchEventToListeners("colorChanged" /* COLOR_CHANGED */, { text: this.colorMixText });
    this.#render();
  }
  setColorMixText(text) {
    this.colorMixText = text;
    this.dispatchEventToListeners("colorChanged" /* COLOR_CHANGED */, { text: this.colorMixText });
    this.#render();
  }
  setRegisterPopoverCallback(callback) {
    this.#registerPopoverCallback = callback;
    callback(this);
  }
  getText() {
    return this.colorMixText;
  }
  #render() {
    if (!this.colorMixText || !this.firstColorText || !this.secondColorText) {
      LitHtml.render(this.colorMixText, this.shadow, { host: this });
      return;
    }
    LitHtml.render(
      html`<div class="swatch-icon" jslog=${VisualLogging.cssColorMix()} style="--color: ${this.colorMixText}">
        <span class="swatch swatch-left" id="swatch-1" style="--color: ${this.firstColorText}"></span>
        <span class="swatch swatch-right" id="swatch-2" style="--color: ${this.secondColorText}"></span>
        <span class="swatch swatch-mix" id="mix-result" style="--color: ${this.colorMixText}"></span>
      </div><slot>${this.colorMixText}</slot>`,
      this.shadow,
      { host: this }
    );
    this.#registerPopoverCallback && this.#registerPopoverCallback(this);
  }
}
customElements.define("devtools-color-mix-swatch", ColorMixSwatch);
//# sourceMappingURL=ColorMixSwatch.js.map

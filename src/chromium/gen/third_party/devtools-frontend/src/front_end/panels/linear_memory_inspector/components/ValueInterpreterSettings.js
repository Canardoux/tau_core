"use strict";
import * as i18n from "../../../core/i18n/i18n.js";
import * as Platform from "../../../core/platform/platform.js";
import * as Input from "../../../ui/components/input/input.js";
import * as LitHtml from "../../../ui/lit-html/lit-html.js";
import * as VisualLogging from "../../../ui/visual_logging/visual_logging.js";
import { ValueType, valueTypeToLocalizedString } from "./ValueInterpreterDisplayUtils.js";
import valueInterpreterSettingsStyles from "./valueInterpreterSettings.css.js";
const { render, html } = LitHtml;
const UIStrings = {
  /**
   *@description Name of a group of selectable value types that do not fall under integer and floating point value types, e.g. Pointer32. The group appears name appears under the Value Interpreter Settings.
   */
  otherGroup: "Other"
};
const str_ = i18n.i18n.registerUIStrings("panels/linear_memory_inspector/components/ValueInterpreterSettings.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
var ValueTypeGroup = /* @__PURE__ */ ((ValueTypeGroup2) => {
  ValueTypeGroup2["INTEGER"] = "Integer";
  ValueTypeGroup2["FLOAT"] = "Floating point";
  ValueTypeGroup2["OTHER"] = "Other";
  return ValueTypeGroup2;
})(ValueTypeGroup || {});
const GROUP_TO_TYPES = /* @__PURE__ */ new Map(
  [
    ["Integer" /* INTEGER */, [ValueType.INT8, ValueType.INT16, ValueType.INT32, ValueType.INT64]],
    ["Floating point" /* FLOAT */, [ValueType.FLOAT32, ValueType.FLOAT64]],
    ["Other" /* OTHER */, [ValueType.POINTER32, ValueType.POINTER64]]
  ]
);
function valueTypeGroupToLocalizedString(group) {
  if (group === "Other" /* OTHER */) {
    return i18nString(UIStrings.otherGroup);
  }
  return group;
}
export class TypeToggleEvent extends Event {
  static eventName = "typetoggle";
  data;
  constructor(type, checked) {
    super(TypeToggleEvent.eventName);
    this.data = { type, checked };
  }
}
export class ValueInterpreterSettings extends HTMLElement {
  #shadow = this.attachShadow({ mode: "open" });
  #valueTypes = /* @__PURE__ */ new Set();
  connectedCallback() {
    this.#shadow.adoptedStyleSheets = [Input.checkboxStyles, valueInterpreterSettingsStyles];
  }
  set data(data) {
    this.#valueTypes = data.valueTypes;
    this.#render();
  }
  #render() {
    render(html`
      <div class="settings" jslog=${VisualLogging.pane("settings")}>
       ${[...GROUP_TO_TYPES.keys()].map((group) => {
      return html`
          <div class="value-types-selection">
            <span class="group">${valueTypeGroupToLocalizedString(group)}</span>
            ${this.#plotTypeSelections(group)}
          </div>
        `;
    })}
      </div>
      `, this.#shadow, { host: this });
  }
  #plotTypeSelections(group) {
    const types = GROUP_TO_TYPES.get(group);
    if (!types) {
      throw new Error(`Unknown group ${group}`);
    }
    return html`
      ${types.map((type) => {
      return html`
          <label class="type-label" title=${valueTypeToLocalizedString(type)}>
            <input data-input="true" type="checkbox" .checked=${this.#valueTypes.has(type)} @change=${(e) => this.#onTypeToggle(type, e)} jslog=${VisualLogging.toggle().track({ change: true }).context(Platform.StringUtilities.toKebabCase(type))}>
            <span data-title="true">${valueTypeToLocalizedString(type)}</span>
          </label>
     `;
    })}`;
  }
  #onTypeToggle(type, event) {
    const checkbox = event.target;
    this.dispatchEvent(new TypeToggleEvent(type, checkbox.checked));
  }
}
customElements.define("devtools-linear-memory-inspector-interpreter-settings", ValueInterpreterSettings);
//# sourceMappingURL=ValueInterpreterSettings.js.map

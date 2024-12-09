"use strict";
import "./SettingDeprecationWarning.js";
import * as Host from "../../../core/host/host.js";
import * as i18n from "../../../core/i18n/i18n.js";
import * as LitHtml from "../../lit-html/lit-html.js";
import * as VisualLogging from "../../visual_logging/visual_logging.js";
import * as Buttons from "../buttons/buttons.js";
import * as Input from "../input/input.js";
import settingCheckboxStyles from "./settingCheckbox.css.js";
const { html, Directives: { ifDefined } } = LitHtml;
const UIStrings = {
  /**
   *@description Text that is usually a hyperlink to more documentation
   */
  learnMore: "Learn more"
};
const str_ = i18n.i18n.registerUIStrings("ui/components/settings/SettingCheckbox.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
export class SettingCheckbox extends HTMLElement {
  #shadow = this.attachShadow({ mode: "open" });
  #setting;
  #changeListenerDescriptor;
  #textOverride;
  connectedCallback() {
    this.#shadow.adoptedStyleSheets = [Input.checkboxStyles, settingCheckboxStyles];
  }
  set data(data) {
    if (this.#changeListenerDescriptor && this.#setting) {
      this.#setting.removeChangeListener(this.#changeListenerDescriptor.listener);
    }
    this.#setting = data.setting;
    this.#textOverride = data.textOverride;
    this.#changeListenerDescriptor = this.#setting.addChangeListener(() => {
      this.#render();
    });
    this.#render();
  }
  icon() {
    if (!this.#setting) {
      return void 0;
    }
    if (this.#setting.deprecation) {
      return html`<devtools-setting-deprecation-warning .data=${this.#setting.deprecation}></devtools-setting-deprecation-warning>`;
    }
    const learnMore = this.#setting.learnMore();
    if (learnMore && learnMore.url) {
      const url = learnMore.url;
      const data = {
        iconName: "help",
        variant: Buttons.Button.Variant.ICON,
        size: Buttons.Button.Size.SMALL,
        jslogContext: `${this.#setting.name}-documentation`,
        title: i18nString(UIStrings.learnMore)
      };
      const handleClick = (event) => {
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab(url);
        event.consume();
      };
      return html`<devtools-button
                    class=learn-more
                    @click=${handleClick}
                    .data=${data}></devtools-button>`;
    }
    return void 0;
  }
  #render() {
    if (!this.#setting) {
      throw new Error('No "Setting" object provided for rendering');
    }
    const icon = this.icon();
    const title = `${this.#setting.learnMore() ? this.#setting.learnMore()?.tooltip() : ""}`;
    const reason = this.#setting.disabledReason() ? html`
      <devtools-button class="disabled-reason" .iconName=${"info"} .variant=${Buttons.Button.Variant.ICON} .size=${Buttons.Button.Size.SMALL} title=${ifDefined(this.#setting.disabledReason())} @click=${onclick}></devtools-button>
    ` : LitHtml.nothing;
    LitHtml.render(
      html`
      <p>
        <label title=${title}>
          <input
            type="checkbox"
            .checked=${this.#setting.disabledReason() ? false : this.#setting.get()}
            ?disabled=${this.#setting.disabled()}
            @change=${this.#checkboxChanged}
            jslog=${VisualLogging.toggle().track({ click: true }).context(this.#setting.name)}
            aria-label=${this.#setting.title()}
          />
          ${this.#textOverride || this.#setting.title()}${reason}
        </label>
        ${icon}
      </p>`,
      this.#shadow,
      { host: this }
    );
  }
  #checkboxChanged(e) {
    this.#setting?.set(e.target.checked);
    this.dispatchEvent(new CustomEvent("change", {
      bubbles: true,
      composed: false
    }));
  }
}
customElements.define("setting-checkbox", SettingCheckbox);
//# sourceMappingURL=SettingCheckbox.js.map

"use strict";
import * as ComponentHelpers from "../../../ui/components/helpers/helpers.js";
import * as LitHtml from "../../../ui/lit-html/lit-html.js";
import buttonDialogStyles from "./buttonDialog.css.js";
import {
  DialogHorizontalAlignment,
  DialogVerticalPosition
} from "./Dialog.js";
const { html } = LitHtml;
export class ButtonDialog extends HTMLElement {
  #shadow = this.attachShadow({ mode: "open" });
  #renderBound = this.#render.bind(this);
  #dialog = null;
  #showButton = null;
  #data = null;
  connectedCallback() {
    this.#shadow.adoptedStyleSheets = [buttonDialogStyles];
  }
  set data(data) {
    this.#data = data;
    void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#renderBound);
  }
  #showDialog() {
    if (!this.#dialog) {
      throw new Error("Dialog not found");
    }
    void this.#dialog.setDialogVisible(true);
    void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#renderBound);
  }
  #closeDialog(evt) {
    if (!this.#dialog) {
      throw new Error("Dialog not found");
    }
    void this.#dialog.setDialogVisible(false);
    if (evt) {
      evt.stopImmediatePropagation();
    }
    void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#renderBound);
  }
  #render() {
    if (!this.#data) {
      throw new Error("ButtonDialog.data is not set");
    }
    if (!ComponentHelpers.ScheduledRender.isScheduledRender(this)) {
      throw new Error("Button dialog render was not scheduled");
    }
    LitHtml.render(
      html`
      <devtools-button
        @click=${this.#showDialog}
        on-render=${ComponentHelpers.Directives.nodeRenderedCallback((node) => {
        this.#showButton = node;
      })}
        .data=${{
        variant: this.#data.variant,
        iconName: this.#data.iconName,
        disabled: this.#data.disabled,
        title: this.#data.iconTitle,
        jslogContext: this.#data.jslogContext
      }}
      ></devtools-button>
      <devtools-dialog
        @clickoutsidedialog=${this.#closeDialog}
        .origin=${() => {
        if (!this.#showButton) {
          throw new Error("Button not found");
        }
        return this.#showButton;
      }}
        .position=${this.#data.position ?? DialogVerticalPosition.BOTTOM}
        .horizontalAlignment=${this.#data.horizontalAlignment ?? DialogHorizontalAlignment.RIGHT}
        .closeOnESC=${this.#data.closeOnESC ?? false}
        .closeOnScroll=${this.#data.closeOnScroll ?? false}
        .closeButton=${this.#data.closeButton ?? false}
        .dialogTitle=${this.#data.dialogTitle}
        .jslogContext=${this.#data.jslogContext ?? ""}
        on-render=${ComponentHelpers.Directives.nodeRenderedCallback((node) => {
        this.#dialog = node;
      })}
      >
        <slot></slot>
      </devtools-dialog>
      `,
      this.#shadow,
      { host: this }
    );
    if (this.#data.openOnRender) {
      this.#showDialog();
      this.#data.openOnRender = false;
    }
  }
}
customElements.define("devtools-button-dialog", ButtonDialog);
//# sourceMappingURL=ButtonDialog.js.map

"use strict";
import * as i18n from "../../../core/i18n/i18n.js";
import * as Platform from "../../../core/platform/platform.js";
import * as WindowBoundsService from "../../../services/window_bounds/window_bounds.js";
import * as ComponentHelpers from "../../../ui/components/helpers/helpers.js";
import * as Coordinator from "../../../ui/components/render_coordinator/render_coordinator.js";
import * as LitHtml from "../../../ui/lit-html/lit-html.js";
import * as VisualLogging from "../../../ui/visual_logging/visual_logging.js";
import * as Buttons from "../buttons/buttons.js";
import dialogStyles from "./dialog.css.js";
const { html } = LitHtml;
const UIStrings = {
  /**
   * @description Title of close button for the shortcuts dialog.
   */
  close: "Close"
};
const str_ = i18n.i18n.registerUIStrings("ui/components/dialogs/Dialog.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
const coordinator = Coordinator.RenderCoordinator.RenderCoordinator.instance();
const IS_DIALOG_SUPPORTED = "HTMLDialogElement" in globalThis;
export const CONNECTOR_HEIGHT = 10;
const CONNECTOR_WIDTH = 2 * CONNECTOR_HEIGHT;
const DIALOG_ANIMATION_OFFSET = 20;
export const DIALOG_SIDE_PADDING = 5;
export const DIALOG_VERTICAL_PADDING = 3;
export const DIALOG_PADDING_FROM_WINDOW = 3 * CONNECTOR_HEIGHT;
export const MODAL = "MODAL";
export class Dialog extends HTMLElement {
  #shadow = this.attachShadow({ mode: "open" });
  #renderBound = this.#render.bind(this);
  #forceDialogCloseInDevToolsBound = this.#forceDialogCloseInDevToolsMutation.bind(this);
  #handleScrollAttemptBound = this.#handleScrollAttempt.bind(this);
  #props = {
    origin: MODAL,
    position: "bottom" /* BOTTOM */,
    horizontalAlignment: "center" /* CENTER */,
    showConnector: false,
    getConnectorCustomXPosition: null,
    dialogShownCallback: null,
    windowBoundsService: WindowBoundsService.WindowBoundsService.WindowBoundsServiceImpl.instance(),
    closeOnESC: true,
    closeOnScroll: true,
    closeButton: false,
    dialogTitle: "",
    jslogContext: ""
  };
  #dialog = null;
  #isPendingShowDialog = false;
  #isPendingCloseDialog = false;
  #hitArea = new DOMRect(0, 0, 0, 0);
  #dialogClientRect = new DOMRect(0, 0, 0, 0);
  #bestVerticalPositionInternal = null;
  #bestHorizontalAlignment = null;
  #devtoolsMutationObserver = new MutationObserver(this.#forceDialogCloseInDevToolsBound);
  #dialogResizeObserver = new ResizeObserver(this.#updateDialogBounds.bind(this));
  #devToolsBoundingElement = this.windowBoundsService.getDevToolsBoundingElement();
  // We bind here because we have to listen to keydowns on the entire window,
  // not on the Dialog element itself. This is because if the user has the
  // dialog open, but their focus is elsewhere, and they hit ESC, we should
  // still close the dialog.
  #onKeyDownBound = this.#onKeyDown.bind(this);
  get showConnector() {
    return this.#props.showConnector;
  }
  set showConnector(showConnector) {
    this.#props.showConnector = showConnector;
    this.#onStateChange();
  }
  get origin() {
    return this.#props.origin;
  }
  set origin(origin) {
    this.#props.origin = origin;
    this.#onStateChange();
  }
  get position() {
    return this.#props.position;
  }
  set position(position) {
    this.#props.position = position;
    this.#onStateChange();
  }
  get horizontalAlignment() {
    return this.#props.horizontalAlignment;
  }
  set horizontalAlignment(alignment) {
    this.#props.horizontalAlignment = alignment;
    this.#onStateChange();
  }
  get windowBoundsService() {
    return this.#props.windowBoundsService;
  }
  set windowBoundsService(windowBoundsService) {
    this.#props.windowBoundsService = windowBoundsService;
    this.#devToolsBoundingElement = this.windowBoundsService.getDevToolsBoundingElement();
    this.#onStateChange();
  }
  get bestVerticalPosition() {
    return this.#bestVerticalPositionInternal;
  }
  get bestHorizontalAlignment() {
    return this.#bestHorizontalAlignment;
  }
  get getConnectorCustomXPosition() {
    return this.#props.getConnectorCustomXPosition;
  }
  set getConnectorCustomXPosition(connectorXPosition) {
    this.#props.getConnectorCustomXPosition = connectorXPosition;
    this.#onStateChange();
  }
  get dialogShownCallback() {
    return this.#props.dialogShownCallback;
  }
  get jslogContext() {
    return this.#props.jslogContext;
  }
  set dialogShownCallback(dialogShownCallback) {
    this.#props.dialogShownCallback = dialogShownCallback;
    this.#onStateChange();
  }
  set closeOnESC(closeOnESC) {
    this.#props.closeOnESC = closeOnESC;
    this.#onStateChange();
  }
  set closeOnScroll(closeOnScroll) {
    this.#props.closeOnScroll = closeOnScroll;
    this.#onStateChange();
  }
  set closeButton(closeButton) {
    this.#props.closeButton = closeButton;
    this.#onStateChange();
  }
  set dialogTitle(dialogTitle) {
    this.#props.dialogTitle = dialogTitle;
    this.#onStateChange();
  }
  set jslogContext(jslogContext) {
    this.#props.jslogContext = jslogContext;
    this.#onStateChange();
  }
  #updateDialogBounds() {
    this.#dialogClientRect = this.#getDialog().getBoundingClientRect();
  }
  #onStateChange() {
    void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#renderBound);
  }
  connectedCallback() {
    this.#shadow.adoptedStyleSheets = [dialogStyles];
    window.addEventListener("resize", this.#forceDialogCloseInDevToolsBound);
    this.#devtoolsMutationObserver.observe(this.#devToolsBoundingElement, { childList: true, subtree: true });
    this.#devToolsBoundingElement.addEventListener("wheel", this.#handleScrollAttemptBound);
    this.style.setProperty("--dialog-padding", "0");
    this.style.setProperty("--override-content-box-shadow", "none");
    this.style.setProperty("--dialog-display", IS_DIALOG_SUPPORTED ? "block" : "none");
    this.style.setProperty("--override-dialog-content-border", `${CONNECTOR_HEIGHT}px solid transparent`);
    this.style.setProperty("--dialog-padding", `${DIALOG_VERTICAL_PADDING}px ${DIALOG_SIDE_PADDING}px`);
  }
  disconnectedCallback() {
    window.removeEventListener("resize", this.#forceDialogCloseInDevToolsBound);
    this.#devToolsBoundingElement.removeEventListener("wheel", this.#handleScrollAttemptBound);
    this.#devtoolsMutationObserver.disconnect();
    this.#dialogResizeObserver.disconnect();
  }
  #getDialog() {
    if (!this.#dialog) {
      this.#dialog = this.#shadow.querySelector("dialog");
      if (!this.#dialog) {
        throw new Error("Dialog not found");
      }
      this.#dialogResizeObserver.observe(this.#dialog);
    }
    return this.#dialog;
  }
  getHitArea() {
    return this.#hitArea;
  }
  async setDialogVisible(show) {
    if (show) {
      await this.#showDialog();
      return;
    }
    this.#closeDialog();
  }
  async #handlePointerEvent(evt) {
    evt.stopPropagation();
    if (evt instanceof PointerEvent && evt.pointerType === "") {
      return;
    }
    const eventWasInDialogContent = this.#mouseEventWasInDialogContent(evt);
    const eventWasInHitArea = this.#mouseEventWasInHitArea(evt);
    if (eventWasInDialogContent) {
      return;
    }
    if (evt.type === "pointermove") {
      if (eventWasInHitArea) {
        return;
      }
      this.dispatchEvent(new PointerLeftDialogEvent());
      return;
    }
    this.dispatchEvent(new ClickOutsideDialogEvent());
  }
  #mouseEventWasInDialogContent(evt) {
    const dialogBounds = this.#dialogClientRect;
    let animationOffSetValue = this.bestVerticalPosition === "bottom" /* BOTTOM */ ? DIALOG_ANIMATION_OFFSET : -1 * DIALOG_ANIMATION_OFFSET;
    if (this.#props.origin === MODAL) {
      animationOffSetValue = 0;
    }
    const eventWasDialogContentX = evt.pageX >= dialogBounds.left && evt.pageX <= dialogBounds.left + dialogBounds.width;
    const eventWasDialogContentY = evt.pageY >= dialogBounds.top + animationOffSetValue && evt.pageY <= dialogBounds.top + dialogBounds.height + animationOffSetValue;
    return eventWasDialogContentX && eventWasDialogContentY;
  }
  #mouseEventWasInHitArea(evt) {
    const hitAreaBounds = this.#hitArea;
    const eventWasInHitAreaX = evt.pageX >= hitAreaBounds.left && evt.pageX <= hitAreaBounds.left + hitAreaBounds.width;
    const eventWasInHitAreaY = evt.pageY >= hitAreaBounds.top && evt.pageY <= hitAreaBounds.top + hitAreaBounds.height;
    return eventWasInHitAreaX && eventWasInHitAreaY;
  }
  #getCoordinatesFromDialogOrigin(origin) {
    if (!origin || origin === MODAL) {
      throw new Error("Dialog origin is null");
    }
    const anchor = origin instanceof Function ? origin() : origin;
    if (anchor instanceof DOMPoint) {
      return { top: anchor.y, bottom: anchor.y, left: anchor.x, right: anchor.x };
    }
    if (anchor instanceof HTMLElement) {
      return anchor.getBoundingClientRect();
    }
    return anchor;
  }
  #getBestHorizontalAlignment(anchorBounds, devtoolsBounds) {
    if (devtoolsBounds.right - anchorBounds.left > anchorBounds.right - devtoolsBounds.left) {
      return "left" /* LEFT */;
    }
    return "right" /* RIGHT */;
  }
  #getBestVerticalPosition(originBounds, dialogHeight, devtoolsBounds) {
    if (originBounds.bottom + dialogHeight > devtoolsBounds.height && originBounds.top - dialogHeight > devtoolsBounds.top) {
      return "top" /* TOP */;
    }
    return "bottom" /* BOTTOM */;
  }
  #positionDialog() {
    if (!this.#props.origin) {
      return;
    }
    this.#isPendingShowDialog = true;
    void coordinator.read(() => {
      const devtoolsBounds = this.#devToolsBoundingElement.getBoundingClientRect();
      const devToolsWidth = devtoolsBounds.width;
      const devToolsHeight = devtoolsBounds.height;
      const devToolsLeft = devtoolsBounds.left;
      const devToolsTop = devtoolsBounds.top;
      const devToolsRight = devtoolsBounds.right;
      if (this.#props.origin === MODAL) {
        void coordinator.write(() => {
          this.style.setProperty("--dialog-top", `${devToolsTop}px`);
          this.style.setProperty("--dialog-left", `${devToolsLeft}px`);
          this.style.setProperty("--dialog-margin", "auto");
          this.style.setProperty("--dialog-margin-left", "auto");
          this.style.setProperty("--dialog-margin-bottom", "auto");
          this.style.setProperty("--dialog-max-height", `${devToolsHeight - DIALOG_PADDING_FROM_WINDOW}px`);
          this.style.setProperty("--dialog-max-width", `${devToolsWidth - DIALOG_PADDING_FROM_WINDOW}px`);
          this.style.setProperty("--dialog-right", `${document.body.clientWidth - devToolsRight}px`);
        });
        return;
      }
      const anchor = this.#props.origin;
      const absoluteAnchorBounds = this.#getCoordinatesFromDialogOrigin(anchor);
      const { top: anchorTop, right: anchorRight, bottom: anchorBottom, left: anchorLeft } = absoluteAnchorBounds;
      const originCenterX = (anchorLeft + anchorRight) / 2;
      const hitAreaWidth = anchorRight - anchorLeft + CONNECTOR_HEIGHT;
      const windowWidth = document.body.clientWidth;
      const connectorFixedXValue = this.#props.getConnectorCustomXPosition ? this.#props.getConnectorCustomXPosition() : originCenterX;
      void coordinator.write(() => {
        this.style.setProperty("--dialog-top", "0");
        const dialog = this.#getDialog();
        dialog.style.visibility = "hidden";
        if (this.#isPendingShowDialog && !dialog.hasAttribute("open")) {
          dialog.showModal();
          this.setAttribute("open", "");
          this.#isPendingShowDialog = false;
        }
        const { width: dialogWidth, height: dialogHeight } = dialog.getBoundingClientRect();
        this.#bestHorizontalAlignment = this.#props.horizontalAlignment === "auto" /* AUTO */ ? this.#getBestHorizontalAlignment(absoluteAnchorBounds, devtoolsBounds) : this.#props.horizontalAlignment;
        this.#bestVerticalPositionInternal = this.#props.position === "auto" /* AUTO */ ? this.#getBestVerticalPosition(absoluteAnchorBounds, dialogHeight, devtoolsBounds) : this.#props.position;
        if (this.#bestHorizontalAlignment === "auto" /* AUTO */ || this.#bestVerticalPositionInternal === "auto" /* AUTO */) {
          return;
        }
        this.#hitArea.height = anchorBottom - anchorTop + CONNECTOR_HEIGHT * (this.showConnector ? 2 : 1);
        this.#hitArea.width = hitAreaWidth;
        let connectorRelativeXValue = 0;
        this.style.setProperty(
          "--content-min-width",
          `${connectorFixedXValue - anchorLeft + CONNECTOR_WIDTH + DIALOG_SIDE_PADDING * 2}px`
        );
        this.style.setProperty("--dialog-left", "auto");
        this.style.setProperty("--dialog-right", "auto");
        this.style.setProperty("--dialog-margin", "0");
        const offsetToCoverConnector = this.showConnector ? CONNECTOR_WIDTH * 3 / 4 : 0;
        switch (this.#bestHorizontalAlignment) {
          case "left" /* LEFT */: {
            const dialogLeft = Math.max(anchorLeft - offsetToCoverConnector, devToolsLeft);
            const devtoolsRightBorderToDialogLeft = devToolsRight - dialogLeft;
            const dialogMaxWidth = devtoolsRightBorderToDialogLeft - DIALOG_PADDING_FROM_WINDOW;
            connectorRelativeXValue = connectorFixedXValue - dialogLeft - DIALOG_SIDE_PADDING;
            this.style.setProperty("--dialog-left", `${dialogLeft}px`);
            this.#hitArea.x = anchorLeft;
            this.style.setProperty("--dialog-max-width", `${dialogMaxWidth}px`);
            break;
          }
          case "right" /* RIGHT */: {
            const windowRightBorderToAnchorRight = windowWidth - anchorRight;
            const windowRightBorderToDevToolsRight = windowWidth - devToolsRight;
            const windowRightBorderToDialogRight = Math.max(windowRightBorderToAnchorRight - offsetToCoverConnector, windowRightBorderToDevToolsRight);
            const dialogRight = windowWidth - windowRightBorderToDialogRight;
            const devtoolsLeftBorderToDialogRight = dialogRight - devToolsLeft;
            const dialogMaxWidth = devtoolsLeftBorderToDialogRight - DIALOG_PADDING_FROM_WINDOW;
            const dialogCappedWidth = Math.min(dialogMaxWidth, dialogWidth);
            const dialogLeft = dialogRight - dialogCappedWidth;
            connectorRelativeXValue = connectorFixedXValue - dialogLeft;
            this.#hitArea.x = windowWidth - windowRightBorderToDialogRight - hitAreaWidth;
            this.style.setProperty("--dialog-right", `${windowRightBorderToDialogRight}px`);
            this.style.setProperty("--dialog-max-width", `${dialogMaxWidth}px`);
            break;
          }
          case "center" /* CENTER */: {
            const dialogCappedWidth = Math.min(devToolsWidth - DIALOG_PADDING_FROM_WINDOW, dialogWidth);
            let dialogLeft = Math.max(originCenterX - dialogCappedWidth * 0.5, devToolsLeft);
            dialogLeft = Math.min(dialogLeft, devToolsRight - dialogCappedWidth);
            connectorRelativeXValue = connectorFixedXValue - dialogLeft - DIALOG_SIDE_PADDING;
            this.style.setProperty("--dialog-left", `${dialogLeft}px`);
            this.#hitArea.x = originCenterX - hitAreaWidth * 0.5;
            this.style.setProperty("--dialog-max-width", `${devToolsWidth - DIALOG_PADDING_FROM_WINDOW}px`);
            break;
          }
          default:
            Platform.assertNever(
              this.#bestHorizontalAlignment,
              `Unknown alignment type: ${this.#bestHorizontalAlignment}`
            );
        }
        const visibleConnectorHeight = this.showConnector ? CONNECTOR_HEIGHT : 0;
        const clipPathConnectorStartX = connectorRelativeXValue - CONNECTOR_WIDTH / 2;
        const clipPathConnectorEndX = connectorRelativeXValue + CONNECTOR_WIDTH / 2;
        let [p1, p2, p3, p4, p5, p6, p7, p8, p9] = ["", "", "", "", "", "", "", "", "", ""];
        const PSEUDO_BORDER_RADIUS = 2;
        switch (this.#bestVerticalPositionInternal) {
          case "top" /* TOP */: {
            const clipPathBottom = `calc(100% - ${CONNECTOR_HEIGHT}px)`;
            if (this.#props.showConnector) {
              p1 = "0 0";
              p2 = "100% 0";
              p3 = `100% calc(${clipPathBottom} - ${PSEUDO_BORDER_RADIUS}px)`;
              p4 = `calc(100% - ${PSEUDO_BORDER_RADIUS}px) ${clipPathBottom}`;
              p5 = `${clipPathConnectorStartX}px ${clipPathBottom}`;
              p6 = `${connectorRelativeXValue}px 100%`;
              p7 = `${clipPathConnectorEndX}px ${clipPathBottom}`;
              p8 = `${PSEUDO_BORDER_RADIUS}px ${clipPathBottom}`;
              p9 = `0 calc(${clipPathBottom} - ${PSEUDO_BORDER_RADIUS}px)`;
            }
            this.style.setProperty(
              "--content-padding-bottom",
              `${CONNECTOR_HEIGHT + (this.#props.showConnector ? CONNECTOR_HEIGHT : 0)}px`
            );
            this.style.setProperty("--content-padding-top", `${CONNECTOR_HEIGHT}px`);
            this.style.setProperty("--dialog-top", "0");
            this.style.setProperty("--dialog-margin", "auto");
            this.style.setProperty("--dialog-margin-bottom", `${innerHeight - anchorTop}px`);
            this.#hitArea.y = anchorTop - 2 * CONNECTOR_HEIGHT;
            this.style.setProperty("--dialog-offset-y", `${DIALOG_ANIMATION_OFFSET}px`);
            this.style.setProperty(
              "--dialog-max-height",
              `${devToolsHeight - (innerHeight - anchorTop) - DIALOG_PADDING_FROM_WINDOW - visibleConnectorHeight}px`
            );
            break;
          }
          case "bottom" /* BOTTOM */: {
            if (this.#props.showConnector) {
              p1 = `0 ${CONNECTOR_HEIGHT + PSEUDO_BORDER_RADIUS}px`;
              p2 = `${PSEUDO_BORDER_RADIUS}px ${CONNECTOR_HEIGHT}px`;
              p3 = `${clipPathConnectorStartX}px ${CONNECTOR_HEIGHT}px`;
              p4 = `${connectorRelativeXValue}px 0`;
              p5 = `${clipPathConnectorEndX}px ${CONNECTOR_HEIGHT}px`;
              p6 = `calc(100% - ${PSEUDO_BORDER_RADIUS}px) ${CONNECTOR_HEIGHT}px`;
              p7 = `100% ${CONNECTOR_HEIGHT + PSEUDO_BORDER_RADIUS}px`;
              p8 = "100% 100%";
              p9 = "0 100%";
            }
            this.style.setProperty(
              "--content-padding-top",
              `${CONNECTOR_HEIGHT + (this.#props.showConnector ? CONNECTOR_HEIGHT : 0)}px`
            );
            this.style.setProperty("--content-padding-bottom", `${CONNECTOR_HEIGHT}px`);
            this.style.setProperty("--dialog-top", `${anchorBottom}px`);
            this.#hitArea.y = anchorTop;
            this.style.setProperty("--dialog-offset-y", `-${DIALOG_ANIMATION_OFFSET}px`);
            this.style.setProperty(
              "--dialog-max-height",
              `${devToolsHeight - (anchorBottom - devToolsTop) - DIALOG_PADDING_FROM_WINDOW - visibleConnectorHeight}px`
            );
            break;
          }
          default:
            Platform.assertNever(
              this.#bestVerticalPositionInternal,
              `Unknown position type: ${this.#bestVerticalPositionInternal}`
            );
        }
        const clipPath = [p1, p2, p3, p4, p5, p6, p7, p8, p9].join();
        this.style.setProperty("--content-clip-path", clipPath);
        dialog.close();
        dialog.style.visibility = "";
      });
    });
  }
  async #showDialog() {
    if (!IS_DIALOG_SUPPORTED) {
      return;
    }
    if (this.#isPendingShowDialog || this.hasAttribute("open")) {
      return;
    }
    this.#isPendingShowDialog = true;
    this.#positionDialog();
    await coordinator.done();
    this.#isPendingShowDialog = false;
    const dialog = this.#getDialog();
    if (!dialog.hasAttribute("open")) {
      dialog.showModal();
    }
    if (this.#props.dialogShownCallback) {
      await this.#props.dialogShownCallback();
    }
    this.#updateDialogBounds();
    document.body.addEventListener("keydown", this.#onKeyDownBound);
  }
  #handleScrollAttempt(event) {
    if (this.#mouseEventWasInDialogContent(event) || !this.#props.closeOnScroll || !this.#getDialog().hasAttribute("open")) {
      return;
    }
    this.#closeDialog();
    this.dispatchEvent(new ForcedDialogClose());
  }
  #onKeyDown(event) {
    if (!this.#getDialog().hasAttribute("open") || !this.#props.closeOnESC) {
      return;
    }
    if (event.key !== Platform.KeyboardUtilities.ESCAPE_KEY) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    this.#closeDialog();
    this.dispatchEvent(new ForcedDialogClose());
  }
  #onCancel(event) {
    event.stopPropagation();
    event.preventDefault();
    if (!this.#getDialog().hasAttribute("open") || !this.#props.closeOnESC) {
      return;
    }
    this.dispatchEvent(new ForcedDialogClose());
  }
  #forceDialogCloseInDevToolsMutation() {
    if (!this.#dialog?.hasAttribute("open")) {
      return;
    }
    if (this.#devToolsBoundingElement === document.body) {
      return;
    }
    this.#closeDialog();
    this.dispatchEvent(new ForcedDialogClose());
  }
  #closeDialog() {
    if (this.#isPendingCloseDialog || !this.#getDialog().hasAttribute("open")) {
      return;
    }
    this.#isPendingCloseDialog = true;
    void coordinator.write(() => {
      this.#hitArea.width = 0;
      this.removeAttribute("open");
      this.#getDialog().close();
      this.#isPendingCloseDialog = false;
      document.body.removeEventListener("keydown", this.#onKeyDownBound);
    });
  }
  getDialogBounds() {
    return this.#dialogClientRect;
  }
  #renderHeaderRow() {
    if (!this.#props.dialogTitle && !this.#props.closeButton) {
      return null;
    }
    return html`
      <div class="dialog-header">
        <span class="dialog-header-text">${this.#props.dialogTitle}</span>
        ${this.#props.closeButton ? html`
          <devtools-button
            @click=${this.#closeDialog}
            .data=${{
      variant: Buttons.Button.Variant.TOOLBAR,
      iconName: "cross",
      title: i18nString(UIStrings.close)
    }}
            jslog=${VisualLogging.close().track({ click: true })}
          ></devtools-button>
        ` : LitHtml.nothing}
      </div>
    `;
  }
  #render() {
    if (!ComponentHelpers.ScheduledRender.isScheduledRender(this)) {
      throw new Error("Dialog render was not scheduled");
    }
    if (!IS_DIALOG_SUPPORTED) {
      LitHtml.render(
        // clang-format off
        html`
        <slot></slot>
      `,
        this.#shadow,
        { host: this }
      );
      return;
    }
    LitHtml.render(html`
      <dialog @click=${this.#handlePointerEvent} @pointermove=${this.#handlePointerEvent} @cancel=${this.#onCancel}
              jslog=${VisualLogging.dialog(this.#props.jslogContext).track({ resize: true, keydown: "Escape" }).parent("mapped")}>
        <div id="content">
          ${this.#renderHeaderRow()}
          <div class='dialog-content'>
            <slot></slot>
          </div>
        </div>
      </dialog>
    `, this.#shadow, { host: this });
    VisualLogging.setMappedParent(this.#getDialog(), this.parentElementOrShadowHost());
  }
}
customElements.define("devtools-dialog", Dialog);
export class PointerLeftDialogEvent extends Event {
  static eventName = "pointerleftdialog";
  constructor() {
    super(PointerLeftDialogEvent.eventName, { bubbles: true, composed: true });
  }
}
export class ClickOutsideDialogEvent extends Event {
  static eventName = "clickoutsidedialog";
  constructor() {
    super(ClickOutsideDialogEvent.eventName, { bubbles: true, composed: true });
  }
}
export class ForcedDialogClose extends Event {
  static eventName = "forceddialogclose";
  constructor() {
    super(ForcedDialogClose.eventName, { bubbles: true, composed: true });
  }
}
export var DialogVerticalPosition = /* @__PURE__ */ ((DialogVerticalPosition2) => {
  DialogVerticalPosition2["TOP"] = "top";
  DialogVerticalPosition2["BOTTOM"] = "bottom";
  DialogVerticalPosition2["AUTO"] = "auto";
  return DialogVerticalPosition2;
})(DialogVerticalPosition || {});
export var DialogHorizontalAlignment = /* @__PURE__ */ ((DialogHorizontalAlignment2) => {
  DialogHorizontalAlignment2["LEFT"] = "left";
  DialogHorizontalAlignment2["RIGHT"] = "right";
  DialogHorizontalAlignment2["CENTER"] = "center";
  DialogHorizontalAlignment2["AUTO"] = "auto";
  return DialogHorizontalAlignment2;
})(DialogHorizontalAlignment || {});
//# sourceMappingURL=Dialog.js.map

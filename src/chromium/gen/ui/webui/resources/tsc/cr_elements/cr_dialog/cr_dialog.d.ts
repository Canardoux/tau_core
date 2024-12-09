/**
 * @fileoverview 'cr-dialog' is a component for showing a modal dialog. If the
 * dialog is closed via close(), a 'close' event is fired. If the dialog is
 * canceled via cancel(), a 'cancel' event is fired followed by a 'close' event.
 *
 * Additionally clients can get a reference to the internal native <dialog> via
 * calling getNative() and inspecting the |returnValue| property inside
 * the 'close' event listener to determine whether it was canceled or just
 * closed, where a truthy value means success, and a falsy value means it was
 * canceled.
 *
 * Note that <cr-dialog> wrapper itself always has 0x0 dimensions, and
 * specifying width/height on <cr-dialog> directly will have no effect on the
 * internal native <dialog>. Instead use cr-dialog::part(dialog) to specify
 * width/height (as well as other available mixins to style other parts of the
 * dialog contents).
 */
import '../cr_icon_button/cr_icon_button.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
declare const CrDialogElementBase: typeof CrLitElement & (new (...args: any[]) => import("../cr_scroll_observer_mixin_lit.js").CrScrollObserverMixinLitInterface) & (new (...args: any[]) => import("../cr_container_shadow_mixin_lit.js").CrContainerShadowMixinLitInterface);
export interface CrDialogElement {
    $: {
        dialog: HTMLDialogElement;
    };
}
export declare class CrDialogElement extends CrDialogElementBase {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        open: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        /**
         * Alt-text for the dialog close button.
         */
        closeText: {
            type: StringConstructor;
        };
        /**
         * True if the dialog should remain open on 'popstate' events. This is
         * used for navigable dialogs that have their separate navigation handling
         * code.
         */
        ignorePopstate: {
            type: BooleanConstructor;
        };
        /**
         * True if the dialog should ignore 'Enter' keypresses.
         */
        ignoreEnterKey: {
            type: BooleanConstructor;
        };
        /**
         * True if the dialog should consume 'keydown' events. If ignoreEnterKey
         * is true, 'Enter' key won't be consumed.
         */
        consumeKeydownEvent: {
            type: BooleanConstructor;
        };
        /**
         * True if the dialog should not be able to be cancelled, which will
         * prevent 'Escape' key presses from closing the dialog.
         */
        noCancel: {
            type: BooleanConstructor;
        };
        showCloseButton: {
            type: BooleanConstructor;
        };
        showOnAttach: {
            type: BooleanConstructor;
        };
        /**
         * Text for the aria description.
         */
        ariaDescriptionText: {
            type: StringConstructor;
        };
    };
    closeText?: string;
    consumeKeydownEvent: boolean;
    ignoreEnterKey: boolean;
    ignorePopstate: boolean;
    noCancel: boolean;
    open: boolean;
    showCloseButton: boolean;
    showOnAttach: boolean;
    ariaDescriptionText?: string;
    private mutationObserver_;
    private boundKeydown_;
    firstUpdated(): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private addKeydownListener_;
    private removeKeydownListener_;
    showModal(): Promise<void>;
    cancel(): void;
    close(): void;
    /**
     * Set the title of the dialog for a11y reader.
     * @param title Title of the dialog.
     */
    setTitleAriaLabel(title: string): void;
    protected onCloseKeypress_(e: Event): void;
    protected onNativeDialogClose_(e: Event): void;
    protected onNativeDialogCancel_(e: Event): Promise<void>;
    /**
     * Expose the inner native <dialog> for some rare cases where it needs to be
     * directly accessed (for example to programmatically setheight/width, which
     * would not work on the wrapper).
     */
    getNative(): HTMLDialogElement;
    private onKeypress_;
    private onKeydown_;
    private onPointerdown_;
    focus(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-dialog': CrDialogElement;
    }
}
export {};

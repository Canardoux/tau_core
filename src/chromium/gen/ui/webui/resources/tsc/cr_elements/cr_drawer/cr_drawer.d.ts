import '../cr_shared_vars.css.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
export interface CrDrawerElement {
    $: {
        dialog: HTMLDialogElement;
    };
}
export declare class CrDrawerElement extends CrLitElement {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        heading: {
            type: StringConstructor;
        };
        show_: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        /** The alignment of the drawer on the screen ('ltr' or 'rtl'). */
        align: {
            type: StringConstructor;
            reflect: boolean;
        };
    };
    heading: string;
    align: 'ltr' | 'rtl';
    protected show_: boolean;
    get open(): boolean;
    set open(_value: boolean);
    /** Toggles the drawer open and close. */
    toggle(): void;
    /** Shows drawer and slides it into view. */
    openDrawer(): Promise<void>;
    /**
     * Slides the drawer away, then closes it after the transition has ended. It
     * is up to the owner of this component to differentiate between close and
     * cancel.
     */
    private dismiss_;
    cancel(): void;
    close(): void;
    wasCanceled(): boolean;
    /**
     * Stop propagation of a tap event inside the container. This will allow
     * |onDialogClick_| to only be called when clicked outside the container.
     */
    protected onContainerClick_(event: Event): void;
    /**
     * Close the dialog when tapped outside the container.
     */
    protected onDialogClick_(): void;
    /**
     * Overrides the default cancel machanism to allow for a close animation.
     */
    protected onDialogCancel_(event: Event): void;
    protected onDialogClose_(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-drawer': CrDrawerElement;
    }
}

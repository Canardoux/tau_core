import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { PropertyValues } from '//resources/lit/v3_0/lit.rollup.js';
export interface CrButtonElement {
    $: {
        prefixIcon: HTMLSlotElement;
        suffixIcon: HTMLSlotElement;
    };
}
declare const CrButtonElementBase: typeof CrLitElement & (new (...args: any[]) => import("../cr_ripple/cr_ripple_mixin.js").CrRippleMixinInterface);
export declare class CrButtonElement extends CrButtonElementBase {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        disabled: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        hasPrefixIcon_: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        hasSuffixIcon_: {
            type: BooleanConstructor;
            reflect: boolean;
        };
    };
    disabled: boolean;
    protected hasPrefixIcon_: boolean;
    protected hasSuffixIcon_: boolean;
    /**
     * It is possible to activate a tab when the space key is pressed down. When
     * this element has focus, the keyup event for the space key should not
     * perform a 'click'. |spaceKeyDown_| tracks when a space pressed and
     * handled by this element. Space keyup will only result in a 'click' when
     * |spaceKeyDown_| is true. |spaceKeyDown_| is set to false when element
     * loses focus.
     */
    private spaceKeyDown_;
    private timeoutIds_;
    constructor();
    firstUpdated(): void;
    updated(changedProperties: PropertyValues<this>): void;
    disconnectedCallback(): void;
    private setTimeout_;
    private disabledChanged_;
    private onBlur_;
    private onClick_;
    protected onPrefixIconSlotChanged_(): void;
    protected onSuffixIconSlotChanged_(): void;
    private onKeyDown_;
    private onKeyUp_;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-button': CrButtonElement;
    }
}
export {};

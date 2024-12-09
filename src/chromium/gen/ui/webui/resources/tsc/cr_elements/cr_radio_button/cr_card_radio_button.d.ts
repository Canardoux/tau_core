/**
 * @fileoverview
 * 'cr-card-radio-button' is a radio button in the style of a card. A checkmark
 * is displayed in the upper right hand corner if the radio button is selected.
 */
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import '../cr_icon/cr_icon.js';
declare const CrCardRadioButtonElementBase: typeof CrLitElement & (new (...args: any[]) => import("./cr_radio_button_mixin_lit.js").CrRadioButtonMixinLitInterface) & (new (...args: any[]) => import("../cr_ripple/cr_ripple_mixin.js").CrRippleMixinInterface);
export interface CrCardRadioButtonElement {
    $: {
        button: HTMLElement;
    };
}
export declare class CrCardRadioButtonElement extends CrCardRadioButtonElementBase {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    createRipple(): import("../cr_ripple/cr_ripple.js").CrRippleElement;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-card-radio-button': CrCardRadioButtonElement;
    }
}
export {};

import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
declare const CrRadioButtonElementBase: typeof CrLitElement & (new (...args: any[]) => import("./cr_radio_button_mixin_lit.js").CrRadioButtonMixinLitInterface) & (new (...args: any[]) => import("../cr_ripple/cr_ripple_mixin.js").CrRippleMixinInterface);
export interface CrRadioButtonElement {
    $: {
        button: HTMLElement;
    };
}
export declare class CrRadioButtonElement extends CrRadioButtonElementBase {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    createRipple(): import("../cr_ripple/cr_ripple.js").CrRippleElement;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-radio-button': CrRadioButtonElement;
    }
}
export {};

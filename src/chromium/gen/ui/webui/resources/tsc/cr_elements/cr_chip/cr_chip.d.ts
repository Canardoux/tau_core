import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
declare const CrChipElementBase: typeof CrLitElement & (new (...args: any[]) => import("../cr_ripple/cr_ripple_mixin.js").CrRippleMixinInterface);
export interface CrChipElement {
    $: {
        button: HTMLButtonElement;
    };
}
export declare class CrChipElement extends CrChipElementBase {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        disabled: {
            type: BooleanConstructor;
        };
        chipAriaLabel: {
            type: StringConstructor;
        };
        chipRole: {
            type: StringConstructor;
        };
        selected: {
            type: BooleanConstructor;
        };
    };
    disabled: boolean;
    chipAriaLabel: string;
    chipRole: string;
    selected: boolean;
    constructor();
    createRipple(): import("../cr_ripple/cr_ripple.js").CrRippleElement;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-chip': CrChipElement;
    }
}
export {};

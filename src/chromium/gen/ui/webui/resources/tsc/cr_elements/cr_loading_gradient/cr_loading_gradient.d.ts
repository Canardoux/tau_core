import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
export declare class CrLoadingGradientElement extends CrLitElement {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    protected onSlotchange_(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-loading-gradient': CrLoadingGradientElement;
    }
}

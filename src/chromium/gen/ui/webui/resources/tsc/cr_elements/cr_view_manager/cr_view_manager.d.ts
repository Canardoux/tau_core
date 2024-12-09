import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
export declare class CrViewManagerElement extends CrLitElement {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    private exit_;
    private enter_;
    switchView(newViewId: string, enterAnimation?: string, exitAnimation?: string): Promise<void>;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-view-manager': CrViewManagerElement;
    }
}

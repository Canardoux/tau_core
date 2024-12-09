import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
/**
 * cr-page-selector is a simple implementation of CrSelectableMixin which by
 * default hides any slotted element that is not currently marked as 'selected',
 * since this is usually leveraged to implement a page selector where only the
 * currently selected page is visible.
 *
 * A 'show-all' attribute is exposed which when set causes all slotted
 * elements (selected and non-selected) to be visible at all times, which makes
 * this element useful for more UI use cases, besides the 'page selector' case.
 */
declare const CrPageSelectorElementBase: typeof CrLitElement & (new (...args: any[]) => import("../cr_selectable_mixin.js").CrSelectableMixinInterface);
export declare class CrPageSelectorElement extends CrPageSelectorElementBase {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    static get properties(): {
        hasNestedSlots: {
            type: BooleanConstructor;
        };
    };
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    hasNestedSlots: boolean;
    constructor();
    queryItems(): Element[];
    queryMatchingItem(selector: string): HTMLElement | null;
    observeItems(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-page-selector': CrPageSelectorElement;
    }
}
export {};

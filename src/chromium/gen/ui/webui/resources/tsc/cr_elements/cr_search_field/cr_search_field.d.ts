/**
 * @fileoverview
 * 'cr-search-field' is a simple implementation of a polymer component that
 * uses CrSearchFieldMixin.
 */
import '../cr_icon_button/cr_icon_button.js';
import '../cr_input/cr_input.js';
import '../cr_icon/cr_icon.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { CrInputElement } from '../cr_input/cr_input.js';
declare const CrSearchFieldElementBase: typeof CrLitElement & (new (...args: any[]) => import("./cr_search_field_mixin_lit.js").CrSearchFieldMixinLitInterface);
export interface CrSearchFieldElement {
    $: {
        clearSearch: HTMLElement;
        searchInput: CrInputElement;
    };
}
export declare class CrSearchFieldElement extends CrSearchFieldElementBase {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        autofocus: {
            type: BooleanConstructor;
        };
    };
    autofocus: boolean;
    getSearchInput(): CrInputElement;
    protected onClearSearchClick_(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-search-field': CrSearchFieldElement;
    }
}
export {};

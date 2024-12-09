/**
 * @fileoverview 'cr-infinite-list' is a thin wrapper around 'cr-lazy-list' that
 * emulates some of the behavior of 'iron-list'.
 */
import '../cr_lazy_list/cr_lazy_list.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { PropertyValues, TemplateResult } from '//resources/lit/v3_0/lit.rollup.js';
export declare class CrInfiniteListElement<T = object> extends CrLitElement {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): TemplateResult<1>;
    static get properties(): {
        scrollOffset: {
            type: NumberConstructor;
        };
        scrollTarget: {
            type: ObjectConstructor;
        };
        usingDefaultScrollTarget: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        items: {
            type: ArrayConstructor;
        };
        focusedIndex: {
            type: NumberConstructor;
        };
        itemSize: {
            type: NumberConstructor;
        };
        template: {
            type: ObjectConstructor;
        };
        focusedItem_: {
            type: ObjectConstructor;
        };
    };
    scrollOffset: number;
    scrollTarget: HTMLElement;
    usingDefaultScrollTarget: boolean;
    items: T[];
    itemSize: number;
    template: (item: T, index: number, tabindex: number) => TemplateResult;
    focusedIndex: number;
    private focusedItem_;
    willUpdate(changedProperties: PropertyValues<this>): void;
    updated(changedProperties: PropertyValues<this>): void;
    private updateFocusedItem_;
    private onItemFocus_;
    /**
     * Handles key events when list item elements have focus.
     */
    private onKeyDown_;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-infinite-list': CrInfiniteListElement;
    }
}

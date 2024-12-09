import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { PropertyValues, TemplateResult } from '//resources/lit/v3_0/lit.rollup.js';
export interface CrLazyListElement {
    $: {
        container: HTMLElement;
        slot: HTMLSlotElement;
    };
}
export declare class CrLazyListElement<T = object> extends CrLitElement {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): TemplateResult<1>;
    static get properties(): {
        items: {
            type: ArrayConstructor;
        };
        itemSize: {
            type: NumberConstructor;
        };
        listItemHost: {
            type: ObjectConstructor;
        };
        minViewportHeight: {
            type: NumberConstructor;
        };
        scrollOffset: {
            type: NumberConstructor;
        };
        scrollTarget: {
            type: ObjectConstructor;
        };
        restoreFocusElement: {
            type: ObjectConstructor;
        };
        template: {
            type: ObjectConstructor;
        };
        numItemsDisplayed_: {
            state: boolean;
            type: NumberConstructor;
        };
    };
    items: T[];
    itemSize: number;
    listItemHost?: Node;
    minViewportHeight?: number;
    scrollOffset: number;
    scrollTarget: HTMLElement;
    restoreFocusElement: Element | null;
    template: (item: T, index: number) => TemplateResult;
    private numItemsDisplayed_;
    private lastItemsLength_;
    private lastRenderedHeight_;
    private resizeObserver_;
    private scrollListener_;
    willUpdate(changedProperties: PropertyValues<this>): void;
    updated(changedProperties: PropertyValues<this>): void;
    fillCurrentViewport(): Promise<void>;
    ensureItemRendered(index: number): Promise<HTMLElement>;
    private addRemoveScrollTargetListeners_;
    private shouldRestoreFocus_;
    private onItemsChanged_;
    private getScrollTop_;
    private getViewHeight_;
    private update_;
    /**
     * @return Whether DOM items were created or not.
     */
    private fillViewHeight_;
    private updateNumItemsDisplayed_;
    /**
     * @return The average DOM item height.
     */
    private domItemAverageHeight_;
    /**
     * Sets the height of the component based on an estimated average DOM item
     * height and the total number of items.
     */
    private updateHeight_;
    /**
     * Adds additional DOM items as needed to fill the view based on user scroll
     * interactions.
     */
    private onScroll_;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-lazy-list': CrLazyListElement;
    }
}

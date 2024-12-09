import type { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
/**
 * CrSelectableMixin maintains a collection of selectable elements. The
 * elements are queried from the light DOM, and are identified using a
 * |selectable| CSS selector, if specified.
 *
 * The mixin observes click events on its children, and selects an item when
 * clicked. Items can also be selected using the select* methods, or by
 * updating the |selected| property. The mixin sets the 'selected' CSS
 * class on the selected item, if any, and also sets the |selectedAttribute|
 * boolean attribute on the selected item if it is specified.
 *
 * Events fired:
 * iron-activate: Fired when an item is activated by a "click" event, before
 * the item is selected (see below).
 * iron-select: Fired when an item is selected.
 * iron-deselect: Fired when an item is deselected.
 * iron-items-changed: Fired when the list of selectable items changes.
 * TODO (rbpotter): Rename these events, now that they are not fired by an
 * "iron-" behavior.
 */
type Constructor<T> = new (...args: any[]) => T;
export declare const CrSelectableMixin: <T extends Constructor<CrLitElement>>(superClass: T) => T & Constructor<CrSelectableMixinInterface>;
export interface CrSelectableMixinInterface {
    attrForSelected: string | null;
    selected?: string | number;
    selectable?: string;
    readonly selectedItem: Element | null;
    selectOnClick: boolean;
    getItemsForTest(): Element[];
    getSlot(): HTMLSlotElement;
    itemsChanged(): void;
    selectNext(): void;
    selectPrevious(): void;
    select(value: string | number): void;
    observeItems(): void;
    queryItems(): Element[];
    queryMatchingItem(selector: string): HTMLElement | null;
}
export {};

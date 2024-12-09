import type { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import { FocusRow } from '//resources/js/focus_row.js';
/**
 * Any element that is being used as an iron-list or infinite-list row item can
 * extend this mixin, which encapsulates focus controls of mouse and keyboards.
 * To use this mixin:
 *    - The parent element should pass a "last-focused" attribute double-bound
 *      to the row items, to track the last-focused element across rows, and
 *      a "list-blurred" attribute double-bound to the row items, to track
 *      whether the list of row items has been blurred.
 *    - There must be a container in the extending element with the
 *      [focus-row-container] attribute that contains all focusable controls.
 *    - On each of the focusable controls, there must be a [focus-row-control]
 *      attribute, and a [focus-type=] attribute unique for each control.
 *
 */
type Constructor<T> = new (...args: any[]) => T;
export declare const FocusRowMixinLit: <T extends Constructor<CrLitElement>>(superClass: T) => T & Constructor<FocusRowMixinLitInterface>;
export interface FocusRowMixinLitInterface {
    id: string;
    isFocused: boolean;
    focusRowIndex?: number;
    lastFocused: HTMLElement | null;
    listTabIndex?: number;
    listBlurred: boolean;
    overrideCustomEquivalent?: boolean;
    getCustomEquivalent?(el: HTMLElement): HTMLElement | null;
    getFocusRow(): FocusRow;
}
export {};

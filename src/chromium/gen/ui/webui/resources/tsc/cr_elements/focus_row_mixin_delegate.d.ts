import { FocusRow } from '//resources/js/focus_row.js';
import type { FocusRowDelegate } from '//resources/js/focus_row.js';
interface ListItem {
    lastFocused: HTMLElement | null;
    overrideCustomEquivalent?: boolean;
    getCustomEquivalent?: (el: HTMLElement) => HTMLElement | null;
}
export declare class FocusRowMixinDelegate implements FocusRowDelegate {
    private listItem_;
    constructor(listItem: ListItem);
    /**
     * This function gets called when the [focus-row-control] element receives
     * the focus event.
     */
    onFocus(_row: FocusRow, e: Event): void;
    /**
     * @param row The row that detected a keydown.
     * @return Whether the event was handled.
     */
    onKeydown(_row: FocusRow, e: KeyboardEvent): boolean;
    getCustomEquivalent(sampleElement: HTMLElement): HTMLElement | null;
}
export {};

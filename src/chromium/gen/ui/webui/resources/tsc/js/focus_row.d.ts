import { EventTracker } from './event_tracker.js';
/**
 * A class to manage focus between given horizontally arranged elements.
 *
 * Pressing left cycles backward and pressing right cycles forward in item
 * order. Pressing Home goes to the beginning of the list and End goes to the
 * end of the list.
 *
 * If an item in this row is focused, it'll stay active (accessible via tab).
 * If no items in this row are focused, the row can stay active until focus
 * changes to a node inside |this.boundary_|. If |boundary| isn't specified,
 * any focus change deactivates the row.
 */
export declare class FocusRow {
    root: HTMLElement;
    delegate: FocusRowDelegate | undefined;
    protected eventTracker: EventTracker;
    private boundary_;
    /**
     * @param root The root of this focus row. Focus classes are
     *     applied to |root| and all added elements must live within |root|.
     * @param boundary Focus events are ignored outside of this element.
     * @param delegate An optional event delegate.
     */
    constructor(root: HTMLElement, boundary: Element | null, delegate?: FocusRowDelegate);
    /**
     * Whether it's possible that |element| can be focused.
     */
    static isFocusable(element: Element): boolean;
    /**
     * A focus override is a function that returns an element that should gain
     * focus. The element may not be directly selectable for example the element
     * that can gain focus is in a shadow DOM. Allowing an override via a
     * function leaves the details of how the element is retrieved to the
     * component.
     */
    static getFocusableElement(element: HTMLElement): HTMLElement;
    /**
     * Register a new type of focusable element (or add to an existing one).
     *
     * Example: an (X) button might be 'delete' or 'close'.
     *
     * When FocusRow is used within a FocusGrid, these types are used to
     * determine equivalent controls when Up/Down are pressed to change rows.
     *
     * Another example: mutually exclusive controls that hide each other on
     * activation (i.e. Play/Pause) could use the same type (i.e. 'play-pause')
     * to indicate they're equivalent.
     *
     * @param type The type of element to track focus of.
     * @param selectorOrElement The selector of the element
     *    from this row's root, or the element itself.
     * @return Whether a new item was added.
     */
    addItem(type: string, selectorOrElement: string | HTMLElement): boolean;
    /** Dereferences nodes and removes event handlers. */
    destroy(): void;
    /**
     * @param sampleElement An element for to find an equivalent
     *     for.
     * @return An equivalent element to focus for
     *     |sampleElement|.
     */
    protected getCustomEquivalent(_sampleElement: HTMLElement): HTMLElement;
    /**
     * @return All registered elements (regardless of focusability).
     */
    getElements(): HTMLElement[];
    /**
     * Find the element that best matches |sampleElement|.
     * @param sampleElement An element from a row of the same
     *     type which previously held focus.
     * @return The element that best matches sampleElement.
     */
    getEquivalentElement(sampleElement: HTMLElement): HTMLElement;
    /**
     * @param type An optional type to search for.
     * @return The first focusable element with |type|.
     */
    getFirstFocusable(type?: string): HTMLElement | null;
    /** @return Registered, focusable elements. */
    getFocusableElements(): HTMLElement[];
    /**
     * @param element An element to determine a focus type for.
     * @return The focus type for |element| or '' if none.
     */
    getTypeForElement(element: Element): string;
    /** @return Whether this row is currently active. */
    isActive(): boolean;
    /**
     * Enables/disables the tabIndex of the focusable elements in the FocusRow.
     * tabIndex can be set properly.
     * @param active True if tab is allowed for this row.
     */
    makeActive(active: boolean): void;
    private onBlur_;
    private onFocus_;
    private onMousedown_;
    private onKeydown_;
}
export interface FocusRowDelegate {
    /**
     * Called when a key is pressed while on a FocusRow's item. If true is
     * returned, further processing is skipped.
     * @param row The row that detected a keydown.
     * @return Whether the event was handled.
     */
    onKeydown(row: FocusRow, e: KeyboardEvent): boolean;
    onFocus(row: FocusRow, e: Event): void;
    /**
     * @param sampleElement An element to find an equivalent for.
     * @return An equivalent element to focus, or null to use the
     *     default FocusRow element.
     */
    getCustomEquivalent(sampleElement: HTMLElement): HTMLElement | null;
}
export declare class VirtualFocusRow extends FocusRow {
    constructor(root: HTMLElement, delegate: FocusRowDelegate);
    getCustomEquivalent(sampleElement: HTMLElement): HTMLElement;
}

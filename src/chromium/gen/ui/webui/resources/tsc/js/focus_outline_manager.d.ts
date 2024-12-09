/**
 * This class sets a CSS class name on the HTML element of |doc| when the user
 * presses a key. It removes the class name when the user clicks anywhere.
 *
 * This allows you to write CSS like this:
 *
 * html.focus-outline-visible my-element:focus {
 *   outline: 5px auto -webkit-focus-ring-color;
 * }
 *
 * And the outline will only be shown if the user uses the keyboard to get to
 * it.
 *
 */
export declare class FocusOutlineManager {
    private focusByKeyboard_;
    private classList_;
    /**
     * @param doc The document to attach the focus outline manager to.
     */
    constructor(doc: Document);
    private onEvent_;
    updateVisibility(): void;
    /**
     * Whether the focus outline should be visible.
     */
    set visible(visible: boolean);
    get visible(): boolean;
    /**
     * Gets a per document singleton focus outline manager.
     * @param doc The document to get the |FocusOutlineManager| for.
     * @return The per document singleton focus outline manager.
     */
    static forDocument(doc: Document): FocusOutlineManager;
}

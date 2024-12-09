export interface Range {
    start: number;
    length: number;
}
/**
 * Replaces the the highlight wrappers given in |wrappers| with the original
 * search nodes.
 */
export declare function removeHighlights(wrappers: HTMLElement[]): void;
/**
 * Finds all previous highlighted nodes under |node| and replaces the
 * highlights (yellow rectangles) with the original search node. Searches only
 * within the same shadowRoot and assumes that only one highlight wrapper
 * exists under |node|.
 */
export declare function findAndRemoveHighlights(node: Node): void;
/**
 * Applies the highlight UI (yellow rectangle) around all matches in |node|.
 * @param node The text node to be highlighted. |node| ends up
 *     being hidden.
 * @return The new highlight wrapper.
 */
export declare function highlight(node: Node, ranges: Range[]): HTMLElement;
/**
 * Creates an empty search bubble (styled HTML element without text).
 * |node| should already be visible or the bubble will render incorrectly.
 * @param node The node to be highlighted.
 * @param horizontallyCenter Whether or not to horizontally center
 *     the shown search bubble (if any) based on |node|'s left and width.
 * @return The search bubble that was added, or null if no new
 *     bubble was added.
 */
export declare function createEmptySearchBubble(node: Node, horizontallyCenter?: boolean): HTMLElement;
export declare function stripDiacritics(text: string): string;

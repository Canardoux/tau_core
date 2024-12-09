import type { FocusRow, FocusRowDelegate } from './focus_row.js';
/**
 * A class to manage grid of focusable elements in a 2D grid. For example,
 * given this grid:
 *
 *   focusable  [focused]  focusable  (row: 0, col: 1)
 *   focusable  focusable  focusable
 *   focusable  focusable  focusable
 *
 * Pressing the down arrow would result in the focus moving down 1 row and
 * keeping the same column:
 *
 *   focusable  focusable  focusable
 *   focusable  [focused]  focusable  (row: 1, col: 1)
 *   focusable  focusable  focusable
 *
 * And pressing right or tab at this point would move the focus to:
 *
 *   focusable  focusable  focusable
 *   focusable  focusable  [focused]  (row: 1, col: 2)
 *   focusable  focusable  focusable
 */
export declare class FocusGrid implements FocusRowDelegate {
    rows: FocusRow[];
    private ignoreFocusChange_;
    private lastFocused_;
    onFocus(row: FocusRow, e: Event): void;
    onKeydown(row: FocusRow, e: KeyboardEvent): boolean;
    getCustomEquivalent(_sampleElement: HTMLElement): null;
    /**
     * Unregisters event handlers and removes all |this.rows|.
     */
    destroy(): void;
    /**
     * @param target A target item to find in this grid.
     * @return The row index. -1 if not found.
     */
    getRowIndexForTarget(target: HTMLElement): number;
    /**
     * @param root An element to search for.
     * @return The row with root of |root| or null.
     */
    getRowForRoot(root: HTMLElement): FocusRow | null;
    /**
     * Adds |row| to the end of this list.
     * @param row The row that needs to be added to this grid.
     */
    addRow(row: FocusRow): void;
    /**
     * Adds |row| before |nextRow|. If |nextRow| is not in the list or it's
     * null, |row| is added to the end.
     * @param row The row that needs to be added to this grid.
     * @param nextRow The row that should follow |row|.
     */
    addRowBefore(row: FocusRow, nextRow: FocusRow | null): void;
    /**
     * Removes a row from the focus row. No-op if row is not in the grid.
     * @param row The row that needs to be removed.
     */
    removeRow(row: FocusRow | null): void;
    /**
     * Makes sure that at least one row is active. Should be called once, after
     * adding all rows to FocusGrid.
     * @param preferredRow The row to select if no other row is
     *     active. Selects the first item if this is beyond the range of the
     *     grid.
     */
    ensureRowActive(preferredRow?: number): void;
}

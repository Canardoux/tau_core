/** A list of keyboard shortcuts which all perform one command. */
export declare class KeyboardShortcutList {
    private shortcuts_;
    /**
     * @param shortcuts Text-based representation of one or more
     *     keyboard shortcuts, separated by spaces.
     */
    constructor(shortcuts: string);
    /**
     * Returns true if any of the keyboard shortcuts in the list matches a
     * keyboard event.
     */
    matchesEvent(e: KeyboardEvent): boolean;
}

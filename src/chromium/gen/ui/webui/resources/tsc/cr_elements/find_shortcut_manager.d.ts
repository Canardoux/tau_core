export interface FindShortcutListener {
    findShortcutListenOnAttach: boolean;
    becomeActiveFindShortcutListener(): void;
    /** If handled, return true. */
    handleFindShortcut(modalContextOpen: boolean): boolean;
    removeSelfAsFindShortcutListener(): void;
    searchInputHasFocus(): boolean;
}
/**
 * @fileoverview Listens for a find keyboard shortcut (i.e. Ctrl/Cmd+f or /)
 * and keeps track of an stack of potential listeners. Only the listener at the
 * top of the stack will be notified that a find shortcut has been invoked.
 */
export declare const FindShortcutManager: Readonly<{
    listeners: FindShortcutListener[];
}>;

/**
 * @fileoverview DragWrapper
 * A class for simplifying HTML5 drag and drop. Classes should use this to
 * handle the details of nested drag enters and leaves.
 */
export interface DragWrapperDelegate {
    /**
     * @return Whether the drag should be accepted. If false,
     *     subsequent methods (doDrag*) will not be called.
     */
    shouldAcceptDrag(e: MouseEvent): boolean;
    doDragEnter(e: MouseEvent): void;
    doDragLeave(e: MouseEvent): void;
    doDragOver(e: MouseEvent): void;
    doDrop(e: MouseEvent): void;
}
/**
 * Creates a DragWrapper which listens for drag target events on |target| and
 * delegates event handling to |delegate|.
 */
export declare class DragWrapper {
    /**
     * The number of un-paired dragenter events that have fired on |this|.
     * This is incremented by |onDragEnter_| and decremented by
     * |onDragLeave_|. This is necessary because dragging over child widgets
     * will fire additional enter and leave events on |this|. A non-zero value
     * does not necessarily indicate that |isCurrentDragTarget()| is true.
     */
    private dragEnters_;
    private target_;
    private delegate_;
    constructor(target: HTMLElement, delegate: DragWrapperDelegate);
    /**
     * Whether the tile page is currently being dragged over with data it can
     * accept.
     */
    get isCurrentDragTarget(): boolean;
    /**
     * Delegate for dragenter events fired on |target_|.
     */
    private onDragEnter_;
    /**
     * Thunk for dragover events fired on |target_|.
     */
    private onDragOver_;
    /**
     * Thunk for drop events fired on |target_|.
     */
    private onDrop_;
    /**
     * Thunk for dragleave events fired on |target_|.
     */
    private onDragLeave_;
}

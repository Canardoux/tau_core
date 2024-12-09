export declare class CrSplitterElement extends HTMLElement {
    static get is(): string;
    private handlers_;
    private startX_;
    private startWidth_;
    resizeNextElement: boolean;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    /**
     * Starts the dragging of the splitter. Adds listeners for mouse or touch
     * events and calls splitter drag start handler.
     * @param clientX X position of the mouse or touch event that started the
     *     drag.
     * @param isTouchEvent True if the drag started by touch event.
     */
    startDrag(clientX: number, isTouchEvent: boolean): void;
    private removeAllHandlers_;
    /**
     * Ends the dragging of the splitter. Removes listeners set in startDrag
     * and calls splitter drag end handler.
     */
    private endDrag_;
    private getResizeTarget_;
    /**
     * Calculate width to resize target element.
     * @param deltaX horizontal drag amount
     */
    private calcDeltaX_;
    /**
     * Handles the mousedown event which starts the dragging of the splitter.
     */
    private onMouseDown_;
    /**
     * Handles the touchstart event which starts the dragging of the splitter.
     */
    private onTouchStart_;
    /**
     * Handles the mousemove event which moves the splitter as the user moves
     * the mouse.
     */
    private handleMouseMove_;
    /**
     * Handles the touch move event.
     */
    private handleTouchMove_;
    /**
     * Common part of handling mousemove and touchmove. Calls splitter drag
     * move handler.
     * @param clientX X position of the mouse or touch event.
     */
    private handleMove_;
    /**
     * Handles the mouse up event which ends the dragging of the splitter.
     */
    private handleMouseUp_;
    /**
     * Handles start of the splitter dragging. Saves current width of the
     * element being resized.
     */
    private handleSplitterDragStart_;
    /**
     * Handles splitter moves. Updates width of the element being resized.
     * @param deltaX The change of splitter horizontal position.
     */
    private handleSplitterDragMove_;
    /**
     * Handles end of the splitter dragging. This fires a 'resize' event if the
     * size changed.
     */
    private handleSplitterDragEnd_;
}

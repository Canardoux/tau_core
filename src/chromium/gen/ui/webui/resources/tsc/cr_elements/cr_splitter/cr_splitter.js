// Copyright 2019 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { assert } from '//resources/js/assert.js';
export class CrSplitterElement extends HTMLElement {
    static get is() {
        return 'cr-splitter';
    }
    constructor() {
        super();
        this.handlers_ = null;
        this.startX_ = 0;
        this.startWidth_ = -1;
        this.resizeNextElement = false;
        this.addEventListener('mousedown', e => this.onMouseDown_(e));
        this.addEventListener('touchstart', e => this.onTouchStart_(e));
    }
    connectedCallback() {
        this.handlers_ = new Map();
    }
    disconnectedCallback() {
        this.removeAllHandlers_();
        this.handlers_ = null;
    }
    /**
     * Starts the dragging of the splitter. Adds listeners for mouse or touch
     * events and calls splitter drag start handler.
     * @param clientX X position of the mouse or touch event that started the
     *     drag.
     * @param isTouchEvent True if the drag started by touch event.
     */
    startDrag(clientX, isTouchEvent) {
        assert(!!this.handlers_);
        if (this.handlers_.size > 0) {
            // Concurrent drags
            this.endDrag_();
        }
        if (isTouchEvent) {
            const endDragBound = this.endDrag_.bind(this);
            this.handlers_.set('touchmove', this.handleTouchMove_.bind(this));
            this.handlers_.set('touchend', endDragBound);
            this.handlers_.set('touchcancel', endDragBound);
            // Another touch start (we somehow missed touchend or touchcancel).
            this.handlers_.set('touchstart', endDragBound);
        }
        else {
            this.handlers_.set('mousemove', this.handleMouseMove_.bind(this));
            this.handlers_.set('mouseup', this.handleMouseUp_.bind(this));
        }
        const doc = this.ownerDocument;
        // Use capturing events on the document to get events when the mouse
        // leaves the document.
        for (const [eventType, handler] of this.handlers_) {
            doc.addEventListener(
            /** @type {string} */ (eventType), 
            /** @type {Function} */ (handler), true);
        }
        this.startX_ = clientX;
        this.handleSplitterDragStart_();
    }
    removeAllHandlers_() {
        const doc = this.ownerDocument;
        assert(!!this.handlers_);
        for (const [eventType, handler] of this.handlers_) {
            doc.removeEventListener(
            /** @type {string} */ (eventType), 
            /** @type {Function} */ (handler), true);
        }
        this.handlers_.clear();
    }
    /**
     * Ends the dragging of the splitter. Removes listeners set in startDrag
     * and calls splitter drag end handler.
     */
    endDrag_() {
        this.removeAllHandlers_();
        this.handleSplitterDragEnd_();
    }
    getResizeTarget_() {
        const target = this.resizeNextElement ? this.nextElementSibling :
            this.previousElementSibling;
        return target;
    }
    /**
     * Calculate width to resize target element.
     * @param deltaX horizontal drag amount
     */
    calcDeltaX_(deltaX) {
        return this.resizeNextElement ? -deltaX : deltaX;
    }
    /**
     * Handles the mousedown event which starts the dragging of the splitter.
     */
    onMouseDown_(e) {
        if (e.button) {
            return;
        }
        this.startDrag(e.clientX, false);
        // Default action is to start selection and to move focus.
        e.preventDefault();
    }
    /**
     * Handles the touchstart event which starts the dragging of the splitter.
     */
    onTouchStart_(e) {
        if (e.touches.length === 1) {
            this.startDrag(e.touches[0].clientX, true);
            e.preventDefault();
        }
    }
    /**
     * Handles the mousemove event which moves the splitter as the user moves
     * the mouse.
     */
    handleMouseMove_(e) {
        this.handleMove_(e.clientX);
    }
    /**
     * Handles the touch move event.
     */
    handleTouchMove_(e) {
        if (e.touches.length === 1) {
            this.handleMove_(e.touches[0].clientX);
        }
    }
    /**
     * Common part of handling mousemove and touchmove. Calls splitter drag
     * move handler.
     * @param clientX X position of the mouse or touch event.
     */
    handleMove_(clientX) {
        const deltaX = this.matches(':host-context([dir=rtl]) cr-splitter') ?
            this.startX_ - clientX :
            clientX - this.startX_;
        this.handleSplitterDragMove_(deltaX);
    }
    /**
     * Handles the mouse up event which ends the dragging of the splitter.
     */
    handleMouseUp_(_e) {
        this.endDrag_();
    }
    /**
     * Handles start of the splitter dragging. Saves current width of the
     * element being resized.
     */
    handleSplitterDragStart_() {
        // Use the computed width style as the base so that we can ignore what
        // box sizing the element has. Add the difference between offset and
        // client widths to account for any scrollbars.
        const targetElement = this.getResizeTarget_();
        const doc = targetElement.ownerDocument;
        this.startWidth_ =
            parseFloat(doc.defaultView.getComputedStyle(targetElement).width) +
                targetElement.offsetWidth - targetElement.clientWidth;
        this.classList.add('splitter-active');
    }
    /**
     * Handles splitter moves. Updates width of the element being resized.
     * @param deltaX The change of splitter horizontal position.
     */
    handleSplitterDragMove_(deltaX) {
        const targetElement = this.getResizeTarget_();
        const newWidth = this.startWidth_ + this.calcDeltaX_(deltaX);
        targetElement.style.width = newWidth + 'px';
        this.dispatchEvent(new CustomEvent('dragmove'));
    }
    /**
     * Handles end of the splitter dragging. This fires a 'resize' event if the
     * size changed.
     */
    handleSplitterDragEnd_() {
        // Check if the size changed.
        const targetElement = this.getResizeTarget_();
        const doc = targetElement.ownerDocument;
        const computedWidth = parseFloat(doc.defaultView.getComputedStyle(targetElement).width);
        if (this.startWidth_ !== computedWidth) {
            this.dispatchEvent(new CustomEvent('resize'));
        }
        this.classList.remove('splitter-active');
    }
}
customElements.define(CrSplitterElement.is, CrSplitterElement);

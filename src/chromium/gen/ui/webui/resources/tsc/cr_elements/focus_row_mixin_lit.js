// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { assert } from '//resources/js/assert.js';
import { focusWithoutInk } from '//resources/js/focus_without_ink.js';
import { FocusRow, VirtualFocusRow } from '//resources/js/focus_row.js';
import { FocusRowMixinDelegate } from './focus_row_mixin_delegate.js';
export const FocusRowMixinLit = (superClass) => {
    class FocusRowMixinLit extends superClass {
        constructor() {
            super(...arguments);
            this.row_ = null;
            this.mouseFocused_ = false;
            // For notifying when the row is in focus.
            this.isFocused = false;
            this.lastFocused = null;
            this.listBlurred = false;
            this.firstControl_ = null;
            this.controlObservers_ = [];
            this.subtreeObserver_ = null;
            this.boundOnFirstControlKeydown_ = null;
        }
        static get properties() {
            return {
                row_: { type: Object },
                mouseFocused_: { type: Boolean },
                // Will be updated when |index| is set, unless specified elsewhere.
                id: {
                    type: String,
                    reflect: true,
                },
                isFocused: {
                    type: Boolean,
                    notify: true,
                },
                focusRowIndex: { type: Number },
                lastFocused: {
                    type: Object,
                    notify: true,
                },
                listTabIndex: { type: Number },
                listBlurred: {
                    type: Boolean,
                    notify: true,
                },
            };
        }
        connectedCallback() {
            super.connectedCallback();
            this.classList.add('no-outline');
            this.boundOnFirstControlKeydown_ = this.onFirstControlKeydown_.bind(this);
            this.updateComplete.then(() => {
                const rowContainer = this.shadowRoot.querySelector('[focus-row-container]');
                assert(rowContainer);
                this.row_ =
                    new VirtualFocusRow(rowContainer, new FocusRowMixinDelegate(this));
                this.addItems_();
                // Adding listeners asynchronously to reduce blocking time, since
                // this behavior will be used by items in potentially long lists.
                this.addEventListener('focus', this.onFocus_);
                this.subtreeObserver_ = new MutationObserver(() => this.addItems_());
                this.subtreeObserver_.observe(this.shadowRoot, { childList: true, subtree: true });
                this.addEventListener('mousedown', this.onMouseDown_);
                this.addEventListener('blur', this.onBlur_);
            });
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            this.removeEventListener('focus', this.onFocus_);
            if (this.subtreeObserver_) {
                this.subtreeObserver_.disconnect();
                this.subtreeObserver_ = null;
            }
            this.removeEventListener('mousedown', this.onMouseDown_);
            this.removeEventListener('blur', this.onBlur_);
            this.removeObservers_();
            if (this.firstControl_ && this.boundOnFirstControlKeydown_) {
                this.firstControl_.removeEventListener('keydown', this.boundOnFirstControlKeydown_);
                this.boundOnFirstControlKeydown_ = null;
            }
            if (this.row_) {
                this.row_.destroy();
            }
        }
        willUpdate(changedProperties) {
            super.willUpdate(changedProperties);
            if (changedProperties.has('focusRowIndex') &&
                this.focusRowIndex !== undefined) {
                // focusRowIndex is 0-based where aria-rowindex is 1-based.
                this.setAttribute('aria-rowindex', (this.focusRowIndex + 1).toString());
                // Only set ID if it matches what was previously set. This prevents
                // overriding the ID value if it's set elsewhere.
                const oldIndex = changedProperties.get('focusRowIndex');
                if (this.id === this.computeId_(oldIndex)) {
                    this.id = this.computeId_(this.focusRowIndex) || '';
                }
            }
        }
        updated(changedProperties) {
            super.updated(changedProperties);
            if (changedProperties.has('listTabIndex')) {
                this.listTabIndexChanged_();
            }
        }
        /**
         * Returns an ID based on the index that was passed in.
         */
        computeId_(index) {
            return index !== undefined ? `frb${index}` : undefined;
        }
        getFocusRow() {
            assert(this.row_);
            return this.row_;
        }
        updateFirstControl_() {
            assert(this.row_);
            const newFirstControl = this.row_.getFirstFocusable();
            if (newFirstControl === this.firstControl_) {
                return;
            }
            if (this.firstControl_) {
                this.firstControl_.removeEventListener('keydown', this.boundOnFirstControlKeydown_);
            }
            this.firstControl_ = newFirstControl;
            if (this.firstControl_) {
                this.firstControl_.addEventListener('keydown', this.boundOnFirstControlKeydown_);
            }
        }
        removeObservers_() {
            if (this.controlObservers_.length > 0) {
                this.controlObservers_.forEach(observer => {
                    observer.disconnect();
                });
            }
            this.controlObservers_ = [];
        }
        addItems_() {
            this.listTabIndexChanged_();
            if (this.row_) {
                this.removeObservers_();
                this.row_.destroy();
                const controls = this.shadowRoot.querySelectorAll('[focus-row-control]');
                controls.forEach(control => {
                    assert(control);
                    assert(this.row_);
                    this.row_.addItem(control.getAttribute('focus-type'), FocusRow.getFocusableElement(control));
                    this.addMutationObservers_(control);
                });
                this.updateFirstControl_();
            }
        }
        createObserver_() {
            return new MutationObserver(mutations => {
                const mutation = mutations[0];
                if (mutation.attributeName === 'style' && mutation.oldValue) {
                    const newStyle = window.getComputedStyle(mutation.target);
                    const oldDisplayValue = mutation.oldValue.match(/^display:(.*)(?=;)/);
                    const oldVisibilityValue = mutation.oldValue.match(/^visibility:(.*)(?=;)/);
                    // Return early if display and visibility have not changed.
                    if (oldDisplayValue &&
                        newStyle.display === oldDisplayValue[1].trim() &&
                        oldVisibilityValue &&
                        newStyle.visibility === oldVisibilityValue[1].trim()) {
                        return;
                    }
                }
                this.updateFirstControl_();
            });
        }
        /**
         * The first focusable control changes if hidden, disabled, or
         * style.display changes for the control or any of its ancestors. Add
         * mutation observers to watch for these changes in order to ensure the
         * first control keydown listener is always on the correct element.
         */
        addMutationObservers_(control) {
            let current = control;
            while (current && current !== this.shadowRoot) {
                const currentObserver = this.createObserver_();
                currentObserver.observe(current, {
                    attributes: true,
                    attributeFilter: ['hidden', 'disabled', 'style'],
                    attributeOldValue: true,
                });
                this.controlObservers_.push(currentObserver);
                current = current.parentNode;
            }
        }
        /**
         * This function gets called when the row itself receives the focus
         * event.
         */
        onFocus_(e) {
            if (this.mouseFocused_) {
                this.mouseFocused_ = false; // Consume and reset flag.
                return;
            }
            // If focus is being restored from outside the item and the event is
            // fired by the list item itself, focus the first control so that the
            // user can tab through all the controls. When the user shift-tabs
            // back to the row, or focus is restored to the row from a dropdown on
            // the last item, the last child item will be focused before the row
            // itself. Since this is the desired behavior, do not shift focus to
            // the first item in these cases.
            const restoreFocusToFirst = this.listBlurred && e.composedPath()[0] === this;
            if (this.lastFocused && !restoreFocusToFirst) {
                assert(this.row_);
                focusWithoutInk(this.row_.getEquivalentElement(this.lastFocused));
            }
            else {
                assert(this.firstControl_);
                const firstFocusable = this.firstControl_;
                focusWithoutInk(firstFocusable);
            }
            this.listBlurred = false;
            this.isFocused = true;
        }
        onFirstControlKeydown_(e) {
            const keyEvent = e;
            if (keyEvent.shiftKey && keyEvent.key === 'Tab') {
                this.focus();
            }
        }
        listTabIndexChanged_() {
            if (this.row_) {
                this.row_.makeActive(this.listTabIndex === 0);
            }
            // If a new row is being focused, reset listBlurred. This means an
            // item has been removed and iron-list is about to focus the next
            // item.
            if (this.listTabIndex === 0) {
                this.listBlurred = false;
            }
        }
        onMouseDown_() {
            this.mouseFocused_ = true; // Set flag to not do any control-focusing.
        }
        onBlur_(e) {
            // Reset focused flags since it's not active anymore.
            this.mouseFocused_ = false;
            this.isFocused = false;
            const node = e.relatedTarget ? e.relatedTarget : null;
            if (!this.parentNode.contains(node)) {
                this.listBlurred = true;
            }
        }
    }
    return FocusRowMixinLit;
};

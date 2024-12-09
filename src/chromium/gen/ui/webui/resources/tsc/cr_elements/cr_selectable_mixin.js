// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { assert } from '//resources/js/assert.js';
export const CrSelectableMixin = (superClass) => {
    class CrSelectableMixin extends superClass {
        constructor() {
            super(...arguments);
            this.attrForSelected = null;
            this.selectedAttribute = null;
            // Whether to select items when they or their children are clicked. Note:
            // value is only checked in firstUpdated().
            this.selectOnClick = true;
            this.items_ = [];
            this.selectedItem_ = null;
        }
        static get properties() {
            return {
                /**
                 * To use an attribute value of an element for determining `selected`
                 * instead of using the index, set this property to the name of the HTML
                 * attribute.
                 */
                attrForSelected: { type: String },
                /**
                 * Gets or sets the selected value. The default is to use the index of
                 * the selected item. If attrForSelected is set, this is instead the
                 * value of the |attrForSelected| attribute of the selected item.
                 */
                selected: {
                    type: String,
                    notify: true,
                },
                /** Boolean attribute name to set on items that are selected. */
                selectedAttribute: { type: String },
                /**
                 * This is a CSS selector string.  If this is set, only items that match
                 * the CSS selector are selectable.
                 */
                selectable: { type: String },
            };
        }
        firstUpdated(changedProperties) {
            super.firstUpdated(changedProperties);
            if (this.selectOnClick) {
                this.addEventListener('click', e => this.onClick_(e));
            }
            this.observeItems();
        }
        // Override this method in client code to modify the observation logic,
        // or to turn it off completely. By default it listens for any changes on
        // the first <slot> node in this shadowRoot.
        observeItems() {
            this.getSlot().addEventListener('slotchange', () => this.itemsChanged());
        }
        connectedCallback() {
            super.connectedCallback();
            this.updateItems_();
        }
        willUpdate(changedProperties) {
            super.willUpdate(changedProperties);
            if (changedProperties.has('attrForSelected')) {
                if (this.selectedItem_) {
                    assert(this.attrForSelected);
                    const value = this.selectedItem_.getAttribute(this.attrForSelected);
                    assert(value !== null);
                    this.selected = value;
                }
            }
        }
        updated(changedProperties) {
            super.updated(changedProperties);
            if (changedProperties.has('selected')) {
                this.updateSelectedItem_();
            }
        }
        /**
         * Selects the given value.
         */
        select(value) {
            this.selected = value;
        }
        /**
         * Selects the previous item.
         */
        selectPrevious() {
            const length = this.items_.length;
            let index = length - 1;
            if (this.selected !== undefined) {
                index = ((this.valueToIndex_(this.selected)) - 1 + length) % length;
            }
            this.selected = this.indexToValue_(index);
        }
        /**
         * Selects the next item.
         */
        selectNext() {
            const index = this.selected === undefined ?
                0 :
                (this.valueToIndex_(this.selected) + 1) % this.items_.length;
            this.selected = this.indexToValue_(index);
        }
        getItemsForTest() {
            return this.items_;
        }
        getSlot() {
            const slot = this.shadowRoot.querySelector('slot');
            assert(slot);
            return slot;
        }
        // Override this method in client code to modify this logic, for example to
        // grab children that don't reside in a <slot>.
        queryItems() {
            const selectable = this.selectable === undefined ? '*' : this.selectable;
            return Array.from(this.querySelectorAll(`:scope > ${selectable}`));
        }
        // If overriding queryItems(), override this method to return the list item
        // element matching the CSS selector string |selector|.
        queryMatchingItem(selector) {
            const selectable = this.selectable || '*';
            return this.querySelector(`:scope > :is(${selectable})${selector}`);
        }
        updateItems_() {
            this.items_ = this.queryItems();
            this.items_.forEach((item, index) => item.setAttribute('data-selection-index', index.toString()));
        }
        get selectedItem() {
            return this.selectedItem_;
        }
        updateSelectedItem_() {
            if (!this.items_) {
                return;
            }
            const item = this.selected == null ?
                null :
                this.items_[this.valueToIndex_(this.selected)];
            if (!!item && this.selectedItem_ !== item) {
                this.setItemSelected_(this.selectedItem_, false);
                this.setItemSelected_(item, true);
            }
            else if (!item) {
                this.setItemSelected_(this.selectedItem_, false);
            }
        }
        setItemSelected_(item, isSelected) {
            if (!item) {
                return;
            }
            item.classList.toggle('selected', isSelected);
            if (this.selectedAttribute) {
                item.toggleAttribute(this.selectedAttribute, isSelected);
            }
            this.selectedItem_ = isSelected ? item : null;
            this.fire('iron-' + (isSelected ? 'select' : 'deselect'), { item: item });
        }
        valueToIndex_(value) {
            if (!this.attrForSelected) {
                return Number(value);
            }
            const match = this.queryMatchingItem(`[${this.attrForSelected}="${value}"]`);
            return match ? Number(match.dataset['selectionIndex']) : -1;
        }
        indexToValue_(index) {
            if (!this.attrForSelected) {
                return index;
            }
            const item = this.items_[index];
            if (!item) {
                return index;
            }
            return item.getAttribute(this.attrForSelected) || index;
        }
        itemsChanged() {
            this.updateItems_();
            this.updateSelectedItem_();
            // Let other interested parties know about the change.
            this.fire('iron-items-changed');
        }
        onClick_(e) {
            let element = e.target;
            while (element && element !== this) {
                const idx = this.items_.indexOf(element);
                if (idx >= 0) {
                    const value = this.indexToValue_(idx);
                    assert(value !== null);
                    this.fire('iron-activate', { item: element, selected: value });
                    this.select(value);
                    return;
                }
                element = element.parentNode;
            }
        }
    }
    return CrSelectableMixin;
};

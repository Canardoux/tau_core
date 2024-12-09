// Copyright 2020 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { assert } from '//resources/js/assert.js';
import { FocusOutlineManager } from '//resources/js/focus_outline_manager.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import { getHtml } from './cr_menu_selector.html.js';
import { CrSelectableMixin } from '../cr_selectable_mixin.js';
const CrMenuSelectorBase = CrSelectableMixin(CrLitElement);
export class CrMenuSelector extends CrMenuSelectorBase {
    static get is() {
        return 'cr-menu-selector';
    }
    render() {
        return getHtml.bind(this)();
    }
    connectedCallback() {
        super.connectedCallback();
        FocusOutlineManager.forDocument(document);
    }
    firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties);
        this.setAttribute('role', 'menu');
        this.addEventListener('focusin', this.onFocusin_.bind(this));
        this.addEventListener('keydown', this.onKeydown_.bind(this));
        this.addEventListener('iron-deselect', e => this.onIronDeselected_(e));
        this.addEventListener('iron-select', e => this.onIronSelected_(e));
    }
    getAllFocusableItems_() {
        // Note that this is different from IronSelectableBehavior's items property
        // as some items are focusable and actionable but not selectable (eg. an
        // external link).
        return Array.from(this.querySelectorAll('[role=menuitem]:not([disabled]):not([hidden])'));
    }
    onFocusin_(e) {
        // If the focus was moved by keyboard and is coming in from a relatedTarget
        // that is not within this menu, move the focus to the first menu item. This
        // ensures that the first menu item is always the first focused item when
        // focusing into the menu. A null relatedTarget means the focus was moved
        // from outside the WebContents.
        const focusMovedWithKeyboard = FocusOutlineManager.forDocument(document).visible;
        const focusMovedFromOutside = e.relatedTarget === null ||
            !this.contains(e.relatedTarget);
        if (focusMovedWithKeyboard && focusMovedFromOutside) {
            this.getAllFocusableItems_()[0].focus();
        }
    }
    onIronDeselected_(e) {
        e.detail.item.removeAttribute('aria-current');
    }
    onIronSelected_(e) {
        e.detail.item.setAttribute('aria-current', 'page');
    }
    onKeydown_(event) {
        const items = this.getAllFocusableItems_();
        assert(items.length >= 1);
        const currentFocusedIndex = items.indexOf(this.querySelector(':focus'));
        let newFocusedIndex = currentFocusedIndex;
        switch (event.key) {
            case 'Tab':
                if (event.shiftKey) {
                    // If pressing Shift+Tab, immediately focus the first element so that
                    // when the event is finished processing, the browser automatically
                    // focuses the previous focusable element outside of the menu.
                    items[0].focus();
                }
                else {
                    // If pressing Tab, immediately focus the last element so that when
                    // the event is finished processing, the browser automatically focuses
                    // the next focusable element outside of the menu.
                    items[items.length - 1].focus({ preventScroll: true });
                }
                return;
            case 'ArrowDown':
                newFocusedIndex = (currentFocusedIndex + 1) % items.length;
                break;
            case 'ArrowUp':
                newFocusedIndex =
                    (currentFocusedIndex + items.length - 1) % items.length;
                break;
            case 'Home':
                newFocusedIndex = 0;
                break;
            case 'End':
                newFocusedIndex = items.length - 1;
                break;
        }
        if (newFocusedIndex === currentFocusedIndex) {
            return;
        }
        event.preventDefault();
        items[newFocusedIndex].focus();
    }
}
customElements.define(CrMenuSelector.is, CrMenuSelector);

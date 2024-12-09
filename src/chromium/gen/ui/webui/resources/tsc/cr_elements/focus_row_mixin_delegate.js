// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { FocusRow } from '//resources/js/focus_row.js';
export class FocusRowMixinDelegate {
    constructor(listItem) {
        this.listItem_ = listItem;
    }
    /**
     * This function gets called when the [focus-row-control] element receives
     * the focus event.
     */
    onFocus(_row, e) {
        const element = e.composedPath()[0];
        const focusableElement = FocusRow.getFocusableElement(element);
        if (element !== focusableElement) {
            focusableElement.focus();
        }
        this.listItem_.lastFocused = focusableElement;
    }
    /**
     * @param row The row that detected a keydown.
     * @return Whether the event was handled.
     */
    onKeydown(_row, e) {
        // Prevent iron-list from changing the focus on enter.
        if (e.key === 'Enter') {
            e.stopPropagation();
        }
        return false;
    }
    getCustomEquivalent(sampleElement) {
        return this.listItem_.overrideCustomEquivalent ?
            this.listItem_.getCustomEquivalent(sampleElement) :
            null;
    }
}

// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { assert, assertNotReached } from '//resources/js/assert.js';
import { FindShortcutManager } from './find_shortcut_manager.js';
/**
 * Used to determine how to handle find shortcut invocations.
 */
export const FindShortcutMixinLit = (superClass) => {
    class FindShortcutMixinLit extends superClass {
        constructor() {
            super(...arguments);
            this.findShortcutListenOnAttach = true;
        }
        connectedCallback() {
            super.connectedCallback();
            if (this.findShortcutListenOnAttach) {
                this.becomeActiveFindShortcutListener();
            }
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            if (this.findShortcutListenOnAttach) {
                this.removeSelfAsFindShortcutListener();
            }
        }
        becomeActiveFindShortcutListener() {
            const listeners = FindShortcutManager.listeners;
            assert(!listeners.includes(this), 'Already listening for find shortcuts.');
            listeners.push(this);
        }
        handleFindShortcutInternal_() {
            assertNotReached('Must override handleFindShortcut()');
        }
        handleFindShortcut(_modalContextOpen) {
            this.handleFindShortcutInternal_();
            return false;
        }
        removeSelfAsFindShortcutListener() {
            const listeners = FindShortcutManager.listeners;
            const index = listeners.indexOf(this);
            assert(listeners.includes(this), 'Find shortcut listener not found.');
            listeners.splice(index, 1);
        }
        searchInputHasFocusInternal_() {
            assertNotReached('Must override searchInputHasFocus()');
        }
        searchInputHasFocus() {
            this.searchInputHasFocusInternal_();
            return false;
        }
    }
    return FindShortcutMixinLit;
};

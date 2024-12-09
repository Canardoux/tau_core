// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { assert } from '//resources/js/assert.js';
import { CustomElement } from '//resources/js/custom_element.js';
export const EXPANDED_ATTR = 'expanded';
// Encapuslates shared behavior of cr-trees and the cr-tree-items that they
// contain. This reduces code duplication for e.g. adding/removing children and
// facilitates writing methods navigating the full tree structure (cr-tree and
// all cr-tree-item descendants), without introducing circular dependencies.
export class CrTreeBaseElement extends CustomElement {
    constructor() {
        super(...arguments);
        this.detail = {};
        this.parent_ = null;
    }
    static get template() {
        return window.trustedTypes ? window.trustedTypes.emptyHTML : '';
    }
    static get observedAttributes() {
        return ['icon-visibility'];
    }
    attributeChangedCallback(name, _oldValue, newValue) {
        assert(name === 'icon-visibility');
        this.items.forEach(item => item.setAttribute(name, newValue));
    }
    setParent(parent) {
        this.parent_ = parent;
    }
    get items() {
        return Array.from(this.itemsRoot.querySelectorAll('cr-tree-item'));
    }
    /**
     * Adds a tree item as a child.
     */
    add(child) {
        this.addAt(child, -1);
    }
    /**
     * Adds a tree item as a child at a given index.
     */
    addAt(child, index) {
        assert(child.tagName === 'CR-TREE-ITEM');
        child.setParent(this);
        if (index === -1 || index >= this.items.length) {
            this.itemsRoot.appendChild(child);
        }
        else {
            this.itemsRoot.insertBefore(child, this.items[index] || null);
        }
        if (this.items.length === 1) {
            this.setHasChildren(true);
        }
        child.depth = this.depth + 1;
        child.setAttribute('icon-visibility', this.getAttribute('icon-visibility') || '');
    }
    removeTreeItem(child) {
        this.itemsRoot.removeChild(child);
        if (this.items.length === 0) {
            this.setHasChildren(false);
        }
    }
    get parentItem() {
        return this.parent_;
    }
    /**
     * The tree that the tree item belongs to or null of no added to a tree.
     */
    get tree() {
        if (this.tagName === 'CR-TREE') {
            return this;
        }
        if (!this.parent_) {
            return null;
        }
        return this.parent_.tree;
    }
    get hasChildren() {
        return !!this.items[0];
    }
    setHasChildren(b) {
        this.toggleAttribute('has-children', b);
    }
    get expanded() {
        return this.hasAttribute(EXPANDED_ATTR);
    }
    set expanded(expanded) {
        this.toggleAttribute(EXPANDED_ATTR, expanded);
    }
}

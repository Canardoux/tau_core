// Copyright 2019 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview 'cr-tabs' is a control used for selecting different sections or
 * tabs. cr-tabs was created to replace paper-tabs and paper-tab. cr-tabs
 * displays the name of each tab provided by |tabs|. A 'selected-changed' event
 * is fired any time |selected| is changed.
 *
 * cr-tabs takes its #selectionBar animation from paper-tabs.
 *
 * Keyboard behavior
 *   - Home, End, ArrowLeft and ArrowRight changes the tab selection
 *
 * Known limitations
 *   - no "disabled" state for the cr-tabs as a whole or individual tabs
 *   - cr-tabs does not accept any <slot> (not necessary as of this writing)
 *   - no horizontal scrolling, it is assumed that tabs always fit in the
 *     available space
 */
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import { getCss } from './cr_tabs.css.js';
import { getHtml } from './cr_tabs.html.js';
export const NONE_SELECTED = -1;
export class CrTabsElement extends CrLitElement {
    constructor() {
        super(...arguments);
        this.tabIcons = [];
        this.tabNames = [];
        this.selected = NONE_SELECTED;
        this.isRtl_ = false;
    }
    static get is() {
        return 'cr-tabs';
    }
    static get styles() {
        return getCss();
    }
    render() {
        return getHtml.bind(this)();
    }
    static get properties() {
        return {
            // Optional icon urls displayed in each tab.
            tabIcons: {
                type: Array,
            },
            // Tab names displayed in each tab.
            tabNames: {
                type: Array,
            },
            /** Index of the selected tab. */
            selected: {
                type: Number,
                notify: true,
            },
        };
    }
    connectedCallback() {
        super.connectedCallback();
        this.isRtl_ = this.matches(':host-context([dir=rtl]) cr-tabs');
    }
    firstUpdated() {
        this.setAttribute('role', 'tablist');
        this.addEventListener('keydown', this.onKeyDown_.bind(this));
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has('selected')) {
            this.onSelectedChanged_(this.selected, changedProperties.get('selected'));
        }
    }
    getAriaSelected_(index) {
        return index === this.selected ? 'true' : 'false';
    }
    getIconStyle_(index) {
        const icon = this.tabIcons[index];
        return icon ? `-webkit-mask-image: url(${icon}); display: block;` : '';
    }
    getTabindex_(index) {
        return index === this.selected ? '0' : '-1';
    }
    getSelectedClass_(index) {
        return index === this.selected ? 'selected' : '';
    }
    onSelectedChanged_(newSelected, oldSelected) {
        if (newSelected === NONE_SELECTED || oldSelected === NONE_SELECTED ||
            oldSelected === undefined) {
            return;
        }
        const tabs = this.shadowRoot.querySelectorAll('.tab');
        if (tabs.length <= oldSelected) {
            return;
        }
        const oldTabRect = tabs[oldSelected].getBoundingClientRect();
        const newTabRect = tabs[newSelected].getBoundingClientRect();
        const newIndicator = tabs[newSelected].querySelector('.tab-indicator');
        newIndicator.classList.remove('expand', 'contract');
        // Make new indicator look like it is the old indicator.
        this.updateIndicator_(newIndicator, newTabRect, oldTabRect.left, oldTabRect.width);
        newIndicator.getBoundingClientRect(); // Force repaint.
        // Expand to cover both the previous selected tab, the newly selected tab,
        // and everything in between.
        newIndicator.classList.add('expand');
        newIndicator.addEventListener('transitionend', e => this.onIndicatorTransitionEnd_(e), { once: true });
        const leftmostEdge = Math.min(oldTabRect.left, newTabRect.left);
        const fullWidth = newTabRect.left > oldTabRect.left ?
            newTabRect.right - oldTabRect.left :
            oldTabRect.right - newTabRect.left;
        this.updateIndicator_(newIndicator, newTabRect, leftmostEdge, fullWidth);
    }
    async onKeyDown_(e) {
        const count = this.tabNames.length;
        let newSelection;
        if (e.key === 'Home') {
            newSelection = 0;
        }
        else if (e.key === 'End') {
            newSelection = count - 1;
        }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            const delta = e.key === 'ArrowLeft' ? (this.isRtl_ ? 1 : -1) :
                (this.isRtl_ ? -1 : 1);
            newSelection = (count + this.selected + delta) % count;
        }
        else {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        this.selected = newSelection;
        await this.updateComplete;
        this.shadowRoot.querySelector('.tab.selected').focus();
    }
    onIndicatorTransitionEnd_(event) {
        const indicator = event.target;
        indicator.classList.replace('expand', 'contract');
        indicator.style.transform = `translateX(0) scaleX(1)`;
    }
    onTabClick_(e) {
        const target = e.currentTarget;
        this.selected = Number(target.dataset['index']);
    }
    updateIndicator_(indicator, originRect, newLeft, newWidth) {
        const leftDiff = 100 * (newLeft - originRect.left) / originRect.width;
        const widthRatio = newWidth / originRect.width;
        const transform = `translateX(${leftDiff}%) scaleX(${widthRatio})`;
        indicator.style.transform = transform;
    }
}
customElements.define(CrTabsElement.is, CrTabsElement);

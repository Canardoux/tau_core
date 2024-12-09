// Copyright 2015 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview
 * 'cr-expand-button' is a chrome-specific wrapper around a button that toggles
 * between an opened (expanded) and closed state.
 */
import '../cr_icon_button/cr_icon_button.js';
import '../icons.html.js';
import { focusWithoutInk } from '//resources/js/focus_without_ink.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import { getCss } from './cr_expand_button.css.js';
import { getHtml } from './cr_expand_button.html.js';
export class CrExpandButtonElement extends CrLitElement {
    constructor() {
        super(...arguments);
        this.expanded = false;
        this.disabled = false;
        this.expandIcon = 'cr:expand-more';
        this.collapseIcon = 'cr:expand-less';
        this.tabIndex = 0;
    }
    static get is() {
        return 'cr-expand-button';
    }
    static get styles() {
        return getCss();
    }
    render() {
        return getHtml.bind(this)();
    }
    static get properties() {
        return {
            /**
             * If true, the button is in the expanded state and will show the icon
             * specified in the `collapseIcon` property. If false, the button shows
             * the icon specified in the `expandIcon` property.
             */
            expanded: {
                type: Boolean,
                notify: true,
            },
            /**
             * If true, the button will be disabled and grayed out.
             */
            disabled: {
                type: Boolean,
                reflect: true,
            },
            /** A11y text descriptor for this control. */
            ariaLabel: { type: String },
            tabIndex: { type: Number },
            expandIcon: { type: String },
            collapseIcon: { type: String },
            expandTitle: { type: String },
            collapseTitle: { type: String },
        };
    }
    firstUpdated() {
        this.addEventListener('click', this.toggleExpand_);
    }
    willUpdate(changedProperties) {
        super.willUpdate(changedProperties);
        if (changedProperties.has('expanded') ||
            changedProperties.has('collapseTitle') ||
            changedProperties.has('expandTitle')) {
            this.title =
                (this.expanded ? this.collapseTitle : this.expandTitle) || '';
        }
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has('ariaLabel')) {
            this.onAriaLabelChange_();
        }
    }
    focus() {
        this.$.icon.focus();
    }
    getIcon_() {
        return this.expanded ? this.collapseIcon : this.expandIcon;
    }
    getAriaExpanded_() {
        return this.expanded ? 'true' : 'false';
    }
    onAriaLabelChange_() {
        if (this.ariaLabel) {
            this.$.icon.removeAttribute('aria-labelledby');
            this.$.icon.setAttribute('aria-label', this.ariaLabel);
        }
        else {
            this.$.icon.removeAttribute('aria-label');
            this.$.icon.setAttribute('aria-labelledby', 'label');
        }
    }
    toggleExpand_(event) {
        // Prevent |click| event from bubbling. It can cause parents of this
        // elements to erroneously re-toggle this control.
        event.stopPropagation();
        event.preventDefault();
        this.scrollIntoViewIfNeeded();
        this.expanded = !this.expanded;
        focusWithoutInk(this.$.icon);
    }
}
customElements.define(CrExpandButtonElement.is, CrExpandButtonElement);

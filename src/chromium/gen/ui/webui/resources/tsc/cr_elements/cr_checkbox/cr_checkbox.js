// Copyright 2018 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview 'cr-checkbox' is a component similar to native checkbox. It
 * fires a 'change' event *only* when its state changes as a result of a user
 * interaction. By default it assumes there will be child(ren) passed in to be
 * used as labels. If no label will be provided, a .no-label class should be
 * added to hide the spacing between the checkbox and the label container.
 *
 * If a label is provided, it will be shown by default after the checkbox. A
 * .label-first CSS class can be added to show the label before the checkbox.
 *
 * List of customizable styles:
 *  --cr-checkbox-border-size
 *  --cr-checkbox-checked-box-background-color
 *  --cr-checkbox-checked-box-color
 *  --cr-checkbox-label-color
 *  --cr-checkbox-label-padding-start
 *  --cr-checkbox-mark-color
 *  --cr-checkbox-ripple-checked-color
 *  --cr-checkbox-ripple-size
 *  --cr-checkbox-ripple-unchecked-color
 *  --cr-checkbox-size
 *  --cr-checkbox-unchecked-box-color
 */
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import { CrRippleMixin } from '../cr_ripple/cr_ripple_mixin.js';
import { getCss } from './cr_checkbox.css.js';
import { getHtml } from './cr_checkbox.html.js';
const CrCheckboxElementBase = CrRippleMixin(CrLitElement);
export class CrCheckboxElement extends CrCheckboxElementBase {
    constructor() {
        super(...arguments);
        this.checked = false;
        this.disabled = false;
        this.ariaDescription = null;
        this.tabIndex = 0;
    }
    static get is() {
        return 'cr-checkbox';
    }
    static get styles() {
        return getCss();
    }
    render() {
        return getHtml.bind(this)();
    }
    static get properties() {
        return {
            checked: {
                type: Boolean,
                reflect: true,
                notify: true,
            },
            disabled: {
                type: Boolean,
                reflect: true,
            },
            ariaDescription: { type: String },
            ariaLabelOverride: { type: String },
            tabIndex: { type: Number },
        };
    }
    firstUpdated() {
        this.addEventListener('click', this.onClick_.bind(this));
        this.addEventListener('pointerup', this.hideRipple_.bind(this));
        this.$.labelContainer.addEventListener('pointerdown', this.showRipple_.bind(this));
        this.$.labelContainer.addEventListener('pointerleave', this.hideRipple_.bind(this));
    }
    willUpdate(changedProperties) {
        super.willUpdate(changedProperties);
        if (changedProperties.has('disabled')) {
            const previousTabIndex = changedProperties.get('disabled');
            // During initialization, don't alter tabIndex if not disabled. During
            // subsequent 'disabled' changes, always update tabIndex.
            if (previousTabIndex !== undefined || this.disabled) {
                this.tabIndex = this.disabled ? -1 : 0;
            }
        }
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has('tabIndex')) {
            // :host shouldn't have a tabindex because it's set on #checkbox.
            this.removeAttribute('tabindex');
        }
    }
    focus() {
        this.$.checkbox.focus();
    }
    getFocusableElement() {
        return this.$.checkbox;
    }
    getAriaDisabled_() {
        return this.disabled ? 'true' : 'false';
    }
    getAriaChecked_() {
        return this.checked ? 'true' : 'false';
    }
    showRipple_() {
        if (this.noink) {
            return;
        }
        this.getRipple().showAndHoldDown();
    }
    hideRipple_() {
        this.getRipple().clear();
    }
    async onClick_(e) {
        if (this.disabled || e.target.tagName === 'A') {
            return;
        }
        // Prevent |click| event from bubbling. It can cause parents of this
        // elements to erroneously re-toggle this control.
        e.stopPropagation();
        e.preventDefault();
        this.checked = !this.checked;
        await this.updateComplete;
        this.fire('change', this.checked);
    }
    onKeyDown_(e) {
        if (e.key !== ' ' && e.key !== 'Enter') {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (e.repeat) {
            return;
        }
        if (e.key === 'Enter') {
            this.click();
        }
    }
    onKeyUp_(e) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
        }
        if (e.key === ' ') {
            this.click();
        }
    }
    // Overridden from CrRippleMixin
    createRipple() {
        this.rippleContainer = this.$.checkbox;
        const ripple = super.createRipple();
        ripple.setAttribute('recenters', '');
        ripple.classList.add('circle');
        return ripple;
    }
}
customElements.define(CrCheckboxElement.is, CrCheckboxElement);

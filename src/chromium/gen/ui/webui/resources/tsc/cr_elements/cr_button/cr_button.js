// Copyright 2019 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview 'cr-button' is a button which displays slotted elements. It can
 * be interacted with like a normal button using click as well as space and
 * enter to effectively click the button and fire a 'click' event. It can also
 * style an icon inside of the button with the [has-icon] attribute.
 */
import { FocusOutlineManager } from '//resources/js/focus_outline_manager.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import { CrRippleMixin } from '../cr_ripple/cr_ripple_mixin.js';
import { getCss } from './cr_button.css.js';
import { getHtml } from './cr_button.html.js';
const CrButtonElementBase = CrRippleMixin(CrLitElement);
export class CrButtonElement extends CrButtonElementBase {
    static get is() {
        return 'cr-button';
    }
    static get styles() {
        return getCss();
    }
    render() {
        return getHtml.bind(this)();
    }
    static get properties() {
        return {
            disabled: {
                type: Boolean,
                reflect: true,
            },
            hasPrefixIcon_: {
                type: Boolean,
                reflect: true,
            },
            hasSuffixIcon_: {
                type: Boolean,
                reflect: true,
            },
        };
    }
    constructor() {
        super();
        this.disabled = false;
        this.hasPrefixIcon_ = false;
        this.hasSuffixIcon_ = false;
        /**
         * It is possible to activate a tab when the space key is pressed down. When
         * this element has focus, the keyup event for the space key should not
         * perform a 'click'. |spaceKeyDown_| tracks when a space pressed and
         * handled by this element. Space keyup will only result in a 'click' when
         * |spaceKeyDown_| is true. |spaceKeyDown_| is set to false when element
         * loses focus.
         */
        this.spaceKeyDown_ = false;
        this.timeoutIds_ = new Set();
        this.addEventListener('blur', this.onBlur_.bind(this));
        // Must be added in constructor so that stopImmediatePropagation() works as
        // expected.
        this.addEventListener('click', this.onClick_.bind(this));
        this.addEventListener('keydown', this.onKeyDown_.bind(this));
        this.addEventListener('keyup', this.onKeyUp_.bind(this));
        this.ensureRippleOnPointerdown();
    }
    firstUpdated() {
        if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'button');
        }
        if (!this.hasAttribute('tabindex')) {
            this.setAttribute('tabindex', '0');
        }
        FocusOutlineManager.forDocument(document);
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has('disabled')) {
            this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
            this.disabledChanged_(this.disabled, changedProperties.get('disabled'));
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.timeoutIds_.forEach(clearTimeout);
        this.timeoutIds_.clear();
    }
    setTimeout_(fn, delay) {
        if (!this.isConnected) {
            return;
        }
        const id = setTimeout(() => {
            this.timeoutIds_.delete(id);
            fn();
        }, delay);
        this.timeoutIds_.add(id);
    }
    disabledChanged_(newValue, oldValue) {
        if (!newValue && oldValue === undefined) {
            return;
        }
        if (this.disabled) {
            this.blur();
        }
        this.setAttribute('tabindex', String(this.disabled ? -1 : 0));
    }
    onBlur_() {
        this.spaceKeyDown_ = false;
        // If a keyup event is never fired (e.g. after keydown the focus is moved to
        // another element), we need to clear the ripple here. 100ms delay was
        // chosen manually as a good time period for the ripple to be visible.
        this.setTimeout_(() => this.getRipple().uiUpAction(), 100);
    }
    onClick_(e) {
        if (this.disabled) {
            e.stopImmediatePropagation();
        }
    }
    onPrefixIconSlotChanged_() {
        this.hasPrefixIcon_ = this.$.prefixIcon.assignedElements().length > 0;
    }
    onSuffixIconSlotChanged_() {
        this.hasSuffixIcon_ = this.$.suffixIcon.assignedElements().length > 0;
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
        this.getRipple().uiDownAction();
        if (e.key === 'Enter') {
            this.click();
            // Delay was chosen manually as a good time period for the ripple to be
            // visible.
            this.setTimeout_(() => this.getRipple().uiUpAction(), 100);
        }
        else if (e.key === ' ') {
            this.spaceKeyDown_ = true;
        }
    }
    onKeyUp_(e) {
        if (e.key !== ' ' && e.key !== 'Enter') {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (this.spaceKeyDown_ && e.key === ' ') {
            this.spaceKeyDown_ = false;
            this.click();
            this.getRipple().uiUpAction();
        }
    }
}
customElements.define(CrButtonElement.is, CrButtonElement);

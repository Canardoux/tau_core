// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { assert, assertNotReached } from '//resources/js/assert.js';
export const CrRadioButtonMixinLit = (superClass) => {
    class CrRadioButtonMixinLit extends superClass {
        constructor() {
            super(...arguments);
            this.checked = false;
            this.disabled = false;
            this.focusable = false;
            this.hideLabelText = false;
            this.label = '';
            this.ariaCheckedString = 'false';
            this.ariaDisabledString = 'false';
        }
        static get properties() {
            return {
                checked: {
                    type: Boolean,
                    reflect: true,
                },
                disabled: {
                    type: Boolean,
                    reflect: true,
                    notify: true,
                },
                /**
                 * Whether the radio button should be focusable or not. Toggling
                 * this property sets the corresponding tabindex of the button
                 * itself as well as any links in the button description.
                 */
                focusable: {
                    type: Boolean,
                },
                hideLabelText: {
                    type: Boolean,
                    reflect: true,
                },
                label: {
                    type: String,
                },
                name: {
                    type: String,
                    notify: true,
                    reflect: true,
                },
                /**
                 * Holds the tabIndex for the radio button.
                 */
                ariaCheckedString: { type: String },
                ariaDisabledString: { type: String },
            };
        }
        connectedCallback() {
            super.connectedCallback();
            this.addEventListener('blur', this.hideRipple_.bind(this));
            this.addEventListener('up', this.hideRipple_.bind(this));
        }
        updated(changedProperties) {
            super.updated(changedProperties);
            if (changedProperties.has('focusable')) {
                const links = this.querySelectorAll('a');
                links.forEach(link => {
                    // Remove the tab stop on any links when the row is unchecked.
                    // Since the row is not tabbable, any links within the row
                    // should not be either.
                    link.tabIndex = this.checked ? 0 : -1;
                });
            }
        }
        getAriaDisabled() {
            return this.disabled ? 'true' : 'false';
        }
        getAriaChecked() {
            return this.checked ? 'true' : 'false';
        }
        getButtonTabIndex() {
            return this.focusable ? 0 : -1;
        }
        focus() {
            const button = this.shadowRoot.querySelector('#button');
            assert(button);
            button.focus();
        }
        getRipple() {
            assertNotReached();
        }
        hideRipple_() {
            this.getRipple().clear();
        }
        /**
         * When shift-tab is pressed, first bring the focus to the host
         * element. This accomplishes 2 things:
         * 1) Host doesn't get focused when the browser moves the focus
         *    backward.
         * 2) focus now escaped the shadow-dom of this element, so that
         *    it'll correctly obey non-zero tabindex ordering of the
         *    containing document.
         */
        onInputKeydown(e) {
            if (e.shiftKey && e.key === 'Tab') {
                this.focus();
            }
        }
    }
    return CrRadioButtonMixinLit;
};

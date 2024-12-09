// Copyright 2018 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { dedupingMixin } from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';
import { assert, assertNotReached } from '//resources/js/assert.js';
export const CrRadioButtonMixin = dedupingMixin((superClass) => {
    class CrRadioButtonMixin extends superClass {
        constructor() {
            super(...arguments);
            this.checked = false;
            this.disabled = false;
            this.focusable = false;
            this.hideLabelText = false;
            this.label = ''; // Allows hidden$= binding to run without being set.
            this.buttonTabIndex_ = 0;
        }
        static get properties() {
            return {
                checked: {
                    type: Boolean,
                    reflectToAttribute: true,
                },
                disabled: {
                    type: Boolean,
                    reflectToAttribute: true,
                    notify: true,
                },
                /**
                 * Whether the radio button should be focusable or not. Toggling
                 * this property sets the corresponding tabindex of the button
                 * itself as well as any links in the button description.
                 */
                focusable: {
                    type: Boolean,
                    observer: 'onFocusableChanged_',
                },
                hideLabelText: {
                    type: Boolean,
                    reflectToAttribute: true,
                },
                label: {
                    type: String,
                },
                name: {
                    type: String,
                    notify: true,
                    reflectToAttribute: true,
                },
                /**
                 * Holds the tabIndex for the radio button.
                 */
                buttonTabIndex_: {
                    type: Number,
                    computed: 'getTabIndex_(focusable)',
                },
            };
        }
        connectedCallback() {
            super.connectedCallback();
            this.addEventListener('blur', this.hideRipple_.bind(this));
            this.addEventListener('up', this.hideRipple_.bind(this));
        }
        focus() {
            const button = this.shadowRoot.querySelector('#button');
            assert(button);
            button.focus();
        }
        getPaperRipple() {
            assertNotReached();
        }
        hideRipple_() {
            this.getPaperRipple().clear();
        }
        onFocusableChanged_() {
            const links = this.querySelectorAll('a');
            links.forEach((link) => {
                // Remove the tab stop on any links when the row is unchecked.
                // Since the row is not tabbable, any links within the row
                // should not be either.
                link.tabIndex = this.checked ? 0 : -1;
            });
        }
        getAriaChecked_() {
            return this.checked ? 'true' : 'false';
        }
        getAriaDisabled_() {
            return this.disabled ? 'true' : 'false';
        }
        getTabIndex_() {
            return this.focusable ? 0 : -1;
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
        onInputKeydown_(e) {
            if (e.shiftKey && e.key === 'Tab') {
                this.focus();
            }
        }
    }
    return CrRadioButtonMixin;
});

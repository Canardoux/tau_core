// Copyright 2017 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview
 * A link row is a UI element similar to a button, though usually wider than a
 * button (taking up the whole 'row'). The name link comes from the intended use
 * of this element to take the user to another page in the app or to an external
 * page (somewhat like an HTML link).
 */
import '../cr_icon_button/cr_icon_button.js';
import '../cr_icon/cr_icon.js';
import '../icons.html.js';
import { loadTimeData } from '//resources/js/load_time_data.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import { getCss } from './cr_link_row.css.js';
import { getHtml } from './cr_link_row.html.js';
export class CrLinkRowElement extends CrLitElement {
    constructor() {
        super(...arguments);
        this.ariaShowLabel = false;
        this.ariaShowSublabel = false;
        this.startIcon = '';
        this.label = '';
        this.subLabel = '';
        this.disabled = false;
        this.external = false;
        this.usingSlottedLabel = false;
    }
    static get is() {
        return 'cr-link-row';
    }
    static get styles() {
        return getCss();
    }
    render() {
        return getHtml.bind(this)();
    }
    static get properties() {
        return {
            ariaShowLabel: {
                type: Boolean,
                reflect: true,
            },
            ariaShowSublabel: {
                type: Boolean,
                reflect: true,
            },
            startIcon: { type: String },
            label: { type: String },
            subLabel: { type: String },
            disabled: {
                type: Boolean,
                reflect: true,
            },
            external: { type: Boolean },
            usingSlottedLabel: { type: Boolean },
            roleDescription: { type: String },
            buttonAriaDescription: { type: String },
        };
    }
    focus() {
        this.$.icon.focus();
    }
    shouldHideLabelWrapper_() {
        return !(this.label || this.usingSlottedLabel);
    }
    getIcon_() {
        return this.external ? 'cr:open-in-new' : 'cr:chevron-right';
    }
    getButtonAriaDescription_() {
        return this.buttonAriaDescription ??
            (this.external ? loadTimeData.getString('opensInNewTab') : '');
    }
}
customElements.define(CrLinkRowElement.is, CrLinkRowElement);

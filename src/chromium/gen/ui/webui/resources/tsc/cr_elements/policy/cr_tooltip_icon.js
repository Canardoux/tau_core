// Copyright 2017 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import '../icons.html.js';
import '../cr_icon/cr_icon.js';
import '../cr_tooltip/cr_tooltip.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import { getCss } from './cr_tooltip_icon.css.js';
import { getHtml } from './cr_tooltip_icon.html.js';
export class CrTooltipIconElement extends CrLitElement {
    constructor() {
        super(...arguments);
        this.iconAriaLabel = '';
        this.iconClass = '';
        this.tooltipText = '';
        this.tooltipPosition = 'top';
    }
    static get is() {
        return 'cr-tooltip-icon';
    }
    static get styles() {
        return getCss();
    }
    render() {
        return getHtml.bind(this)();
    }
    static get properties() {
        return {
            iconAriaLabel: { type: String },
            iconClass: { type: String },
            tooltipText: { type: String },
            /** Position of tooltip popup related to the icon. */
            tooltipPosition: { type: String },
        };
    }
    getFocusableElement() {
        return this.$.indicator;
    }
}
customElements.define(CrTooltipIconElement.is, CrTooltipIconElement);

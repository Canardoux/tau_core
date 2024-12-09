// Copyright 2023 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import { CrRippleMixin } from '../cr_ripple/cr_ripple_mixin.js';
import { getCss } from './cr_chip.css.js';
import { getHtml } from './cr_chip.html.js';
const CrChipElementBase = CrRippleMixin(CrLitElement);
export class CrChipElement extends CrChipElementBase {
    static get is() {
        return 'cr-chip';
    }
    static get styles() {
        return getCss();
    }
    render() {
        return getHtml.bind(this)();
    }
    static get properties() {
        return {
            disabled: { type: Boolean },
            chipAriaLabel: { type: String },
            chipRole: { type: String },
            selected: { type: Boolean },
        };
    }
    constructor() {
        super();
        this.disabled = false;
        this.chipAriaLabel = '';
        this.chipRole = '';
        this.selected = false;
        this.ensureRippleOnPointerdown();
    }
    // Overridden from CrRippleMixin
    createRipple() {
        this.rippleContainer = this.shadowRoot.querySelector('button');
        return super.createRipple();
    }
}
customElements.define(CrChipElement.is, CrChipElement);

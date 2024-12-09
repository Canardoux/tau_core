// Copyright 2016 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview
 * 'cr-search-field' is a simple implementation of a polymer component that
 * uses CrSearchFieldMixin.
 */
import '../cr_icon_button/cr_icon_button.js';
import '../cr_input/cr_input.js';
import '../cr_icon/cr_icon.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import { getCss } from './cr_search_field.css.js';
import { getHtml } from './cr_search_field.html.js';
import { CrSearchFieldMixinLit } from './cr_search_field_mixin_lit.js';
const CrSearchFieldElementBase = CrSearchFieldMixinLit(CrLitElement);
export class CrSearchFieldElement extends CrSearchFieldElementBase {
    constructor() {
        super(...arguments);
        this.autofocus = false;
    }
    static get is() {
        return 'cr-search-field';
    }
    static get styles() {
        return getCss();
    }
    render() {
        return getHtml.bind(this)();
    }
    static get properties() {
        return {
            autofocus: {
                type: Boolean,
            },
        };
    }
    getSearchInput() {
        return this.$.searchInput;
    }
    onClearSearchClick_() {
        this.setValue('');
        setTimeout(() => {
            this.$.searchInput.focus();
        });
    }
}
customElements.define(CrSearchFieldElement.is, CrSearchFieldElement);

// Copyright 2016 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import '../cr_icon_button/cr_icon_button.js';
import '../icons.html.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import { CrSearchFieldMixinLit } from '../cr_search_field/cr_search_field_mixin_lit.js';
import { getCss } from './cr_toolbar_search_field.css.js';
import { getHtml } from './cr_toolbar_search_field.html.js';
const CrToolbarSearchFieldElementBase = CrSearchFieldMixinLit(CrLitElement);
export class CrToolbarSearchFieldElement extends CrToolbarSearchFieldElementBase {
    constructor() {
        super(...arguments);
        this.narrow = false;
        this.showingSearch = false;
        this.disabled = false;
        this.autofocus = false;
        this.spinnerActive = false;
        this.searchFocused_ = false;
        this.inputAriaDescription = '';
    }
    static get is() {
        return 'cr-toolbar-search-field';
    }
    static get styles() {
        return getCss();
    }
    render() {
        return getHtml.bind(this)();
    }
    static get properties() {
        return {
            narrow: {
                type: Boolean,
                reflect: true,
            },
            showingSearch: {
                type: Boolean,
                notify: true,
                reflect: true,
            },
            disabled: {
                type: Boolean,
                reflect: true,
            },
            autofocus: {
                type: Boolean,
                reflect: true,
            },
            // When true, show a loading spinner to indicate that the backend is
            // processing the search. Will only show if the search field is open.
            spinnerActive: {
                type: Boolean,
                reflect: true,
            },
            searchFocused_: {
                type: Boolean,
                reflect: true,
            },
            iconOverride: { type: String },
            inputAriaDescription: { type: String },
        };
    }
    firstUpdated() {
        this.addEventListener('click', e => this.showSearch_(e));
    }
    getSearchInput() {
        return this.$.searchInput;
    }
    isSearchFocused() {
        return this.searchFocused_;
    }
    async showAndFocus() {
        this.showingSearch = true;
        await this.updateComplete;
        this.focus_();
    }
    onSearchTermNativeBeforeInput(e) {
        this.fire('search-term-native-before-input', { e });
    }
    onSearchTermInput() {
        super.onSearchTermInput();
        this.showingSearch = this.hasSearchText || this.isSearchFocused();
    }
    onSearchTermNativeInput(e) {
        this.onSearchTermInput();
        this.fire('search-term-native-input', { e, inputValue: this.getValue() });
    }
    getIconTabIndex_() {
        return this.narrow && !this.hasSearchText ? 0 : -1;
    }
    getIconAriaHidden_() {
        return Boolean(!this.narrow || this.hasSearchText).toString();
    }
    shouldShowSpinner_() {
        return this.spinnerActive && this.showingSearch;
    }
    onSearchIconClicked_() {
        this.fire('search-icon-clicked');
    }
    focus_() {
        this.getSearchInput().focus();
    }
    onInputFocus_() {
        this.searchFocused_ = true;
    }
    onInputBlur_() {
        this.searchFocused_ = false;
        if (!this.hasSearchText) {
            this.showingSearch = false;
        }
    }
    onSearchTermKeydown_(e) {
        if (e.key === 'Escape') {
            this.showingSearch = false;
            this.setValue('');
            this.getSearchInput().blur();
        }
    }
    async showSearch_(e) {
        if (e.target !== this.shadowRoot.querySelector('#clearSearch')) {
            this.showingSearch = true;
        }
        if (this.narrow) {
            await this.updateComplete; // Wait for input to become focusable.
            this.focus_();
        }
    }
    clearSearch_() {
        this.setValue('');
        this.focus_();
        this.spinnerActive = false;
        this.fire('search-term-cleared');
    }
}
customElements.define(CrToolbarSearchFieldElement.is, CrToolbarSearchFieldElement);

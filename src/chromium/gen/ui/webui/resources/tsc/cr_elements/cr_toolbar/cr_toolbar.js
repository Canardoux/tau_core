// Copyright 2016 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import '../cr_icon_button/cr_icon_button.js';
import '../icons.html.js';
import './cr_toolbar_search_field.js';
import { assert } from '//resources/js/assert.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import { getCss } from './cr_toolbar.css.js';
import { getHtml } from './cr_toolbar.html.js';
export class CrToolbarElement extends CrLitElement {
    constructor() {
        super(...arguments);
        this.pageName = '';
        this.searchPrompt = '';
        this.clearLabel = '';
        this.spinnerActive = false;
        this.showMenu = false;
        this.showSearch = true;
        this.autofocus = false;
        this.narrow = false;
        this.narrowThreshold = 900;
        this.alwaysShowLogo = false;
        this.showingSearch_ = false;
        this.searchInputAriaDescription = '';
        this.narrowQuery_ = null;
    }
    static get is() {
        return 'cr-toolbar';
    }
    static get styles() {
        return getCss();
    }
    render() {
        return getHtml.bind(this)();
    }
    static get properties() {
        return {
            // Name to display in the toolbar, in titlecase.
            pageName: { type: String },
            // Prompt text to display in the search field.
            searchPrompt: { type: String },
            // Tooltip to display on the clear search button.
            clearLabel: { type: String },
            // Tooltip to display on the menu button.
            menuLabel: { type: String },
            // Value is proxied through to cr-toolbar-search-field. When true,
            // the search field will show a processing spinner.
            spinnerActive: { type: Boolean },
            // Controls whether the menu button is shown at the start of the menu.
            showMenu: { type: Boolean },
            // Controls whether the search field is shown.
            showSearch: { type: Boolean },
            // Controls whether the search field is autofocused.
            autofocus: {
                type: Boolean,
                reflect: true,
            },
            // True when the toolbar is displaying in narrow mode.
            narrow: {
                type: Boolean,
                reflect: true,
                notify: true,
            },
            /**
             * The threshold at which the toolbar will change from normal to narrow
             * mode, in px.
             */
            narrowThreshold: {
                type: Number,
            },
            alwaysShowLogo: {
                type: Boolean,
                reflect: true,
            },
            showingSearch_: {
                type: Boolean,
                reflect: true,
            },
            searchIconOverride: { type: String },
            searchInputAriaDescription: { type: String },
        };
    }
    willUpdate(changedProperties) {
        super.willUpdate(changedProperties);
        if (changedProperties.has('narrowThreshold')) {
            this.narrowQuery_ =
                window.matchMedia(`(max-width: ${this.narrowThreshold}px)`);
            this.narrow = this.narrowQuery_.matches;
            this.narrowQuery_.addListener(() => this.onQueryChanged_());
        }
    }
    getSearchField() {
        return this.$.search;
    }
    onMenuClick_() {
        this.fire('cr-toolbar-menu-click');
    }
    async focusMenuButton() {
        assert(this.showMenu);
        // Wait for rendering to finish to ensure menuButton exists on the DOM.
        await this.updateComplete;
        const menuButton = this.shadowRoot.querySelector('#menuButton');
        assert(!!menuButton);
        menuButton.focus();
    }
    isMenuFocused() {
        return !!this.shadowRoot.activeElement &&
            this.shadowRoot.activeElement.id === 'menuButton';
    }
    onShowingSearchChanged_(e) {
        this.showingSearch_ = e.detail.value;
    }
    onQueryChanged_() {
        assert(this.narrowQuery_);
        this.narrow = this.narrowQuery_.matches;
    }
}
customElements.define(CrToolbarElement.is, CrToolbarElement);

// Copyright 2023 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import '../cr_auto_img/cr_auto_img.js';
import { assert } from '//resources/js/assert.js';
import { FocusOutlineManager } from '//resources/js/focus_outline_manager.js';
import { getFaviconForPageURL } from '//resources/js/icon.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import { MouseHoverableMixinLit } from '../mouse_hoverable_mixin_lit.js';
import { getCss } from './cr_url_list_item.css.js';
import { getHtml } from './cr_url_list_item.html.js';
export var CrUrlListItemSize;
(function (CrUrlListItemSize) {
    CrUrlListItemSize["COMPACT"] = "compact";
    CrUrlListItemSize["MEDIUM"] = "medium";
    CrUrlListItemSize["LARGE"] = "large";
})(CrUrlListItemSize || (CrUrlListItemSize = {}));
const CrUrlListItemElementBase = MouseHoverableMixinLit(CrLitElement);
export class CrUrlListItemElement extends CrUrlListItemElementBase {
    constructor() {
        super(...arguments);
        this.alwaysShowSuffix = false;
        this.asAnchor = false;
        this.asAnchorTarget = '_self';
        this.reverseElideDescription = false;
        this.hasBadges = false;
        this.hasDescriptions_ = false;
        this.hasSlottedContent_ = false;
        this.isFolder_ = false;
        this.size = CrUrlListItemSize.MEDIUM;
        this.title = '';
        this.imageUrls = [];
        this.firstImageLoaded_ = false;
        this.forceHover = false;
        this.descriptionMeta = '';
    }
    static get is() {
        return 'cr-url-list-item';
    }
    static get styles() {
        return getCss();
    }
    render() {
        return getHtml.bind(this)();
    }
    static get properties() {
        return {
            alwaysShowSuffix: {
                type: Boolean,
                reflect: true,
            },
            itemAriaLabel: { type: String },
            itemAriaDescription: { type: String },
            count: { type: Number },
            description: { type: String },
            url: { type: String },
            title: {
                reflect: true,
                type: String,
            },
            hasBadges: {
                type: Boolean,
                reflect: true,
            },
            hasDescriptions_: {
                type: Boolean,
                reflect: true,
            },
            hasSlottedContent_: {
                type: Boolean,
                reflect: true,
            },
            reverseElideDescription: {
                type: Boolean,
                reflect: true,
            },
            isFolder_: {
                type: Boolean,
                reflect: true,
            },
            size: {
                type: String,
                reflect: true,
            },
            imageUrls: { type: Array },
            firstImageLoaded_: {
                type: Boolean,
                state: true,
            },
            forceHover: {
                reflect: true,
                type: Boolean,
            },
            descriptionMeta: { type: String },
            /**
             * Flag that determines if the element should use an anchor tag or a
             * button element as its focusable item. An anchor provides the native
             * context menu and browser interactions for links, while a button
             * provides its own unique functionality, such as pressing space to
             * activate.
             */
            asAnchor: { type: Boolean },
            asAnchorTarget: { type: String },
        };
    }
    firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties);
        FocusOutlineManager.forDocument(document);
        this.addEventListener('pointerdown', () => this.setActiveState_(true));
        this.addEventListener('pointerup', () => this.setActiveState_(false));
        this.addEventListener('pointerleave', () => this.setActiveState_(false));
    }
    willUpdate(changedProperties) {
        super.willUpdate(changedProperties);
        if (changedProperties.has('hasBadges') ||
            changedProperties.has('description')) {
            this.hasDescriptions_ =
                !!this.description || this.hasBadges || !!this.descriptionMeta;
        }
        if (changedProperties.has('count')) {
            this.isFolder_ = this.count !== undefined;
        }
        if (changedProperties.has('size')) {
            assert(Object.values(CrUrlListItemSize).includes(this.size));
        }
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has('imageUrls')) {
            this.resetFirstImageLoaded_();
        }
    }
    connectedCallback() {
        super.connectedCallback();
        this.resetFirstImageLoaded_();
    }
    focus() {
        this.getFocusableElement().focus();
    }
    getFocusableElement() {
        if (this.asAnchor) {
            return this.$.anchor;
        }
        else {
            return this.$.button;
        }
    }
    resetFirstImageLoaded_() {
        this.firstImageLoaded_ = false;
        const image = this.shadowRoot.querySelector('img');
        if (!image) {
            return;
        }
        if (image.complete) {
            this.firstImageLoaded_ = true;
            return;
        }
        image.addEventListener('load', () => {
            this.firstImageLoaded_ = true;
        }, { once: true });
    }
    getItemAriaDescription_() {
        return this.itemAriaDescription || this.description;
    }
    getItemAriaLabel_() {
        return this.itemAriaLabel || this.title;
    }
    getDisplayedCount_() {
        if (this.count && this.count > 999) {
            // The square to display the count only fits 3 characters.
            return '99+';
        }
        return this.count === undefined ? '' : this.count.toString();
    }
    getFavicon_() {
        return getFaviconForPageURL(this.url || '', false);
    }
    shouldShowImageUrl_(_url, index) {
        return index <= 1;
    }
    onBadgesSlotChange_() {
        this.hasBadges = this.$.badges.assignedElements({ flatten: true }).length > 0;
    }
    onContentSlotChange_() {
        this.hasSlottedContent_ =
            this.$.content.assignedElements({ flatten: true }).length > 0;
    }
    setActiveState_(active) {
        this.classList.toggle('active', active);
    }
    shouldShowFavicon_() {
        return this.url !== undefined &&
            (this.size === CrUrlListItemSize.COMPACT ||
                this.imageUrls.length === 0);
    }
    shouldShowUrlImage_() {
        return this.url !== undefined &&
            !(this.size === CrUrlListItemSize.COMPACT ||
                this.imageUrls.length === 0) &&
            this.firstImageLoaded_;
    }
    shouldShowFolderImages_() {
        return this.size !== CrUrlListItemSize.COMPACT;
    }
    shouldShowFolderIcon_() {
        return this.size === CrUrlListItemSize.COMPACT ||
            this.imageUrls.length === 0;
    }
    shouldShowFolderCount_() {
        return this.url === undefined;
    }
}
customElements.define(CrUrlListItemElement.is, CrUrlListItemElement);

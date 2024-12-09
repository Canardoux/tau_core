// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import { getCss } from './cr_collapse.css.js';
import { getHtml } from './cr_collapse.html.js';
export class CrCollapseElement extends CrLitElement {
    constructor() {
        super(...arguments);
        this.opened = false;
        this.noAnimation = false;
    }
    static get is() {
        return 'cr-collapse';
    }
    static get styles() {
        return getCss();
    }
    render() {
        return getHtml.bind(this)();
    }
    static get properties() {
        return {
            opened: {
                type: Boolean,
                notify: true,
            },
            noAnimation: {
                type: Boolean,
                reflect: true,
            },
        };
    }
    toggle() {
        this.opened = !this.opened;
    }
    show() {
        this.opened = true;
    }
    hide() {
        this.opened = false;
    }
    firstUpdated() {
        if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'group');
        }
        this.setAttribute('aria-hidden', 'true');
        this.addEventListener('transitionend', (e) => this.onTransitionEnd_(e));
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        if (!changedProperties.has('opened')) {
            return;
        }
        this.setAttribute('aria-hidden', this.opened ? 'false' : 'true');
        this.classList.toggle('collapse-closed', false);
        this.classList.toggle('collapse-opened', false);
        this.updateHeight_(this.opened, changedProperties.get('opened'));
        // Focus the current collapse.
        if (this.opened) {
            this.focus();
        }
    }
    updateHeight_(opening, lastOpened) {
        const finalMaxHeight = opening ? '' : '0px';
        const animationStartSize = `${this.getBoundingClientRect().height}px`;
        const animationEndSize = opening ? `${this.scrollHeight}px` : '0px';
        const willAnimate = lastOpened !== undefined && !this.noAnimation &&
            this.style.maxHeight !== finalMaxHeight &&
            animationStartSize !== animationEndSize;
        if (willAnimate && !opening) {
            // Force layout to ensure transition will go. Set maxHeight to a px
            // value and scrollTop to itself.
            this.style.maxHeight = animationStartSize;
            this.scrollTop = this.scrollTop;
        }
        // Set the final size.
        this.style.maxHeight = animationEndSize;
        // If it won't animate, set correct classes. Otherwise these are set in
        // onTransitionEnd_().
        if (!willAnimate) {
            this.updateStyles_();
        }
    }
    onTransitionEnd_(e) {
        if (e.composedPath()[0] === this) {
            this.updateStyles_();
        }
    }
    updateStyles_() {
        this.style.maxHeight = this.opened ? '' : '0px';
        this.classList.toggle('collapse-closed', !this.opened);
        this.classList.toggle('collapse-opened', this.opened);
    }
}
customElements.define(CrCollapseElement.is, CrCollapseElement);

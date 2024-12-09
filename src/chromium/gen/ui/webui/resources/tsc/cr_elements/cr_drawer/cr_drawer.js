// Copyright 2016 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import '../cr_shared_vars.css.js';
import { assertNotReached } from '//resources/js/assert.js';
import { listenOnce } from '//resources/js/util.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import { getCss } from './cr_drawer.css.js';
import { getHtml } from './cr_drawer.html.js';
export class CrDrawerElement extends CrLitElement {
    constructor() {
        super(...arguments);
        this.heading = '';
        this.align = 'ltr';
        this.show_ = false;
    }
    static get is() {
        return 'cr-drawer';
    }
    static get styles() {
        return getCss();
    }
    render() {
        return getHtml.bind(this)();
    }
    static get properties() {
        return {
            heading: { type: String },
            show_: {
                type: Boolean,
                reflect: true,
            },
            /** The alignment of the drawer on the screen ('ltr' or 'rtl'). */
            align: {
                type: String,
                reflect: true,
            },
        };
    }
    get open() {
        return this.$.dialog.open;
    }
    set open(_value) {
        assertNotReached('Cannot set |open|.');
    }
    /** Toggles the drawer open and close. */
    toggle() {
        if (this.open) {
            this.cancel();
        }
        else {
            this.openDrawer();
        }
    }
    /** Shows drawer and slides it into view. */
    async openDrawer() {
        if (this.open) {
            return;
        }
        this.$.dialog.showModal();
        this.show_ = true;
        await this.updateComplete;
        this.fire('cr-drawer-opening');
        listenOnce(this.$.dialog, 'transitionend', () => {
            this.fire('cr-drawer-opened');
        });
    }
    /**
     * Slides the drawer away, then closes it after the transition has ended. It
     * is up to the owner of this component to differentiate between close and
     * cancel.
     */
    async dismiss_(cancel) {
        if (!this.open) {
            return;
        }
        this.show_ = false;
        listenOnce(this.$.dialog, 'transitionend', () => {
            this.$.dialog.close(cancel ? 'canceled' : 'closed');
        });
    }
    cancel() {
        this.dismiss_(true);
    }
    close() {
        this.dismiss_(false);
    }
    wasCanceled() {
        return !this.open && this.$.dialog.returnValue === 'canceled';
    }
    /**
     * Stop propagation of a tap event inside the container. This will allow
     * |onDialogClick_| to only be called when clicked outside the container.
     */
    onContainerClick_(event) {
        event.stopPropagation();
    }
    /**
     * Close the dialog when tapped outside the container.
     */
    onDialogClick_() {
        this.cancel();
    }
    /**
     * Overrides the default cancel machanism to allow for a close animation.
     */
    onDialogCancel_(event) {
        event.preventDefault();
        this.cancel();
    }
    onDialogClose_() {
        // Catch and re-fire the 'close' event such that it bubbles across Shadow
        // DOM v1.
        this.fire('close');
    }
}
customElements.define(CrDrawerElement.is, CrDrawerElement);

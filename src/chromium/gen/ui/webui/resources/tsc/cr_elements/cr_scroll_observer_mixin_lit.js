// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview CrScrollObserverMixinLit has logic to add CSS classes based
 * on the scroll state of a scrolling container element specified by a
 * #container ID.
 *
 * Elements using this mixin are expected to define a #container element, which
 * is the element being scrolled. There should only be one such element in the
 * DOM.
 * <div id="container">...</div>
 * Alternatively, clients can set a container element by overriding the
 * getContainer() method. This method should always return the same element
 * throughout the life of the client. It is first called in connectedCallback().
 *
 * The mixin will toggles CSS classes on #container indicating the current
 * scroll state.
 * can-scroll: Has content to scroll to
 * scrolled-to-top: Scrolled all the way to the top
 * scrolled-to-bottom: Scrolled all the way to the bottom
 *
 * Clients can use these classes to define styles.
 */
import { assert } from '//resources/js/assert.js';
export const CrScrollObserverMixinLit = (superClass) => {
    class CrScrollObserverMixinLit extends superClass {
        constructor() {
            super(...arguments);
            this.intersectionObserver_ = null;
            this.topProbe_ = null;
            this.bottomProbe_ = null;
        }
        connectedCallback() {
            super.connectedCallback();
            const container = this.getContainer();
            this.topProbe_ = document.createElement('div');
            this.bottomProbe_ = document.createElement('div');
            container.prepend(this.topProbe_);
            container.append(this.bottomProbe_);
            this.enableScrollObservation(true);
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            this.enableScrollObservation(false);
        }
        getContainer() {
            const container = this.shadowRoot.querySelector('#container');
            assert(container);
            return container;
        }
        getIntersectionObserver_() {
            const callback = (entries) => {
                // In some rare cases, there could be more than one entry per
                // observed element, in which case the last entry's result
                // stands.
                const container = this.getContainer();
                for (const entry of entries) {
                    const target = entry.target;
                    if (target === this.topProbe_) {
                        container.classList.toggle('scrolled-to-top', entry.intersectionRatio !== 0);
                        const canScroll = entry.intersectionRatio === 0 ||
                            !container.classList.contains('scrolled-to-bottom');
                        container.classList.toggle('can-scroll', canScroll);
                    }
                    if (target === this.bottomProbe_) {
                        container.classList.toggle('scrolled-to-bottom', entry.intersectionRatio !== 0);
                        const canScroll = entry.intersectionRatio === 0 ||
                            !container.classList.contains('scrolled-to-top');
                        container.classList.toggle('can-scroll', canScroll);
                    }
                }
            };
            return new IntersectionObserver(callback, { root: this.getContainer(), threshold: 0 });
        }
        /**
         * @param enable Whether to enable the mixin or disable it.
         *     This function does nothing if the mixin is already in the
         *     requested state.
         */
        enableScrollObservation(enable) {
            // Behavior is already enabled/disabled. Return early.
            if (enable === !!this.intersectionObserver_) {
                return;
            }
            if (!enable) {
                this.intersectionObserver_.disconnect();
                this.intersectionObserver_ = null;
                return;
            }
            this.intersectionObserver_ = this.getIntersectionObserver_();
            // Need to register the observer within a setTimeout() callback,
            // otherwise the drop shadow flashes once on startup, because of the
            // DOM modifications earlier in this function causing a relayout.
            window.setTimeout(() => {
                // In case this is already detached.
                if (!this.isConnected) {
                    return;
                }
                if (this.intersectionObserver_) {
                    assert(this.topProbe_);
                    assert(this.bottomProbe_);
                    this.intersectionObserver_.observe(this.topProbe_);
                    this.intersectionObserver_.observe(this.bottomProbe_);
                }
            });
        }
    }
    return CrScrollObserverMixinLit;
};

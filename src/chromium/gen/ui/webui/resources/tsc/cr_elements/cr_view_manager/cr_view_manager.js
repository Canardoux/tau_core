// Copyright 2018 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { assert } from '//resources/js/assert.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import { getCss } from './cr_view_manager.css.js';
import { getHtml } from './cr_view_manager.html.js';
function getEffectiveView(element) {
    return element.matches('cr-lazy-render, cr-lazy-render-lit') ?
        element.get() :
        element;
}
function dispatchCustomEvent(element, eventType) {
    element.dispatchEvent(new CustomEvent(eventType, { bubbles: true, composed: true }));
}
const viewAnimations = new Map();
viewAnimations.set('fade-in', element => {
    const animation = element.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 180,
        easing: 'ease-in-out',
        iterations: 1,
    });
    return animation.finished;
});
viewAnimations.set('fade-out', element => {
    const animation = element.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 180,
        easing: 'ease-in-out',
        iterations: 1,
    });
    return animation.finished;
});
viewAnimations.set('slide-in-fade-in-ltr', element => {
    const animation = element.animate([
        { transform: 'translateX(-8px)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 },
    ], {
        duration: 300,
        easing: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        fill: 'forwards',
        iterations: 1,
    });
    return animation.finished;
});
viewAnimations.set('slide-in-fade-in-rtl', element => {
    const animation = element.animate([
        { transform: 'translateX(8px)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 },
    ], {
        duration: 300,
        easing: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        fill: 'forwards',
        iterations: 1,
    });
    return animation.finished;
});
export class CrViewManagerElement extends CrLitElement {
    static get is() {
        return 'cr-view-manager';
    }
    static get styles() {
        return getCss();
    }
    render() {
        return getHtml.bind(this)();
    }
    exit_(element, animation) {
        const animationFunction = viewAnimations.get(animation);
        element.classList.remove('active');
        element.classList.add('closing');
        dispatchCustomEvent(element, 'view-exit-start');
        if (!animationFunction) {
            // Nothing to animate. Immediately resolve.
            element.classList.remove('closing');
            dispatchCustomEvent(element, 'view-exit-finish');
            return Promise.resolve();
        }
        return animationFunction(element).then(() => {
            element.classList.remove('closing');
            dispatchCustomEvent(element, 'view-exit-finish');
        });
    }
    enter_(view, animation) {
        const animationFunction = viewAnimations.get(animation);
        const effectiveView = getEffectiveView(view);
        effectiveView.classList.add('active');
        dispatchCustomEvent(effectiveView, 'view-enter-start');
        if (!animationFunction) {
            // Nothing to animate. Immediately resolve.
            dispatchCustomEvent(effectiveView, 'view-enter-finish');
            return Promise.resolve();
        }
        return animationFunction(effectiveView).then(() => {
            dispatchCustomEvent(effectiveView, 'view-enter-finish');
        });
    }
    switchView(newViewId, enterAnimation, exitAnimation) {
        const previousView = this.querySelector('.active');
        const newView = this.querySelector('#' + newViewId);
        assert(!!newView);
        const promises = [];
        if (previousView) {
            promises.push(this.exit_(previousView, exitAnimation || 'fade-out'));
            promises.push(this.enter_(newView, enterAnimation || 'fade-in'));
        }
        else {
            promises.push(this.enter_(newView, 'no-animation'));
        }
        return Promise.all(promises).then(() => { });
    }
}
customElements.define(CrViewManagerElement.is, CrViewManagerElement);

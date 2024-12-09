// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import { assert } from '//resources/js/assert.js';
import { IconsetMap } from './iconset_map.js';
import { getCss } from './cr_iconset.css.js';
import { getHtml } from './cr_iconset.html.js';
const APPLIED_ICON_CLASS = 'cr-iconset-svg-icon_';
export class CrIconsetElement extends CrLitElement {
    constructor() {
        super(...arguments);
        this.name = '';
        this.size = 24;
    }
    static get is() {
        return 'cr-iconset';
    }
    static get styles() {
        return getCss();
    }
    render() {
        return getHtml.bind(this)();
    }
    static get properties() {
        return {
            /**
             * The name of the iconset.
             */
            name: { type: String },
            /**
             * The size of an individual icon. Note that icons must be square.
             */
            size: { type: Number },
        };
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has('name')) {
            assert(changedProperties.get('name') === undefined);
            IconsetMap.getInstance().set(this.name, this);
        }
    }
    /**
     * Applies an icon to the given element.
     *
     * An svg icon is prepended to the element's shadowRoot, which should always
     * exist.
     * @param element Element to which the icon is applied.
     * @param iconName Name of the icon to apply.
     * @return The svg element which renders the icon.
     */
    applyIcon(element, iconName) {
        // Remove old svg element
        this.removeIcon(element);
        // install new svg element
        const svg = this.cloneIcon_(iconName);
        if (svg) {
            // Add special class so we can identify it in remove.
            svg.classList.add(APPLIED_ICON_CLASS);
            // insert svg element into shadow root
            element.shadowRoot.insertBefore(svg, element.shadowRoot.childNodes[0]);
            return svg;
        }
        return null;
    }
    /**
     * Produce installable clone of the SVG element matching `id` in this
     * iconset, or null if there is no matching element.
     * @param iconName Name of the icon to apply.
     */
    createIcon(iconName) {
        return this.cloneIcon_(iconName);
    }
    /**
     * Remove an icon from the given element by undoing the changes effected
     * by `applyIcon`.
     */
    removeIcon(element) {
        // Remove old svg element
        const oldSvg = element.shadowRoot.querySelector(`.${APPLIED_ICON_CLASS}`);
        if (oldSvg) {
            oldSvg.remove();
        }
    }
    /**
     * Produce installable clone of the SVG element matching `id` in this
     * iconset, or `undefined` if there is no matching element.
     *
     * Returns an installable clone of the SVG element matching `id` or null if
     * no such element exists.
     */
    cloneIcon_(id) {
        const sourceSvg = this.querySelector(`g[id="${id}"]`);
        if (!sourceSvg) {
            return null;
        }
        const svgClone = this.$.baseSvg.cloneNode(true);
        const content = sourceSvg.cloneNode(true);
        content.removeAttribute('id');
        const contentViewBox = content.getAttribute('viewBox');
        if (contentViewBox) {
            svgClone.setAttribute('viewBox', contentViewBox);
        }
        svgClone.appendChild(content);
        return svgClone;
    }
}
customElements.define(CrIconsetElement.is, CrIconsetElement);

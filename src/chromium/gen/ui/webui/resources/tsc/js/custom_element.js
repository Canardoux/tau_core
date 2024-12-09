// Copyright 2019 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { assert } from './assert.js';
/**
 * @fileoverview Base class for Web Components that don't use Polymer.
 * See the following file for usage:
 * chrome/test/data/webui/js/custom_element_test.js
 */
function emptyHTML() {
    return window.trustedTypes ? window.trustedTypes.emptyHTML : '';
}
export class CustomElement extends HTMLElement {
    static get template() {
        return emptyHTML();
    }
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const template = document.createElement('template');
        template.innerHTML =
            this.constructor.template || emptyHTML();
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    $(query) {
        return this.shadowRoot.querySelector(query);
    }
    $all(query) {
        return this.shadowRoot.querySelectorAll(query);
    }
    getRequiredElement(query) {
        const el = this.shadowRoot.querySelector(query);
        assert(el);
        assert(el instanceof HTMLElement);
        return el;
    }
}

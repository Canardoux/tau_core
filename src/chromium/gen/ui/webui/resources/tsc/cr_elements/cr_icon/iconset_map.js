// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { assert } from '//resources/js/assert.js';
let iconsetMap = null;
export class IconsetMap extends EventTarget {
    constructor() {
        super(...arguments);
        this.iconsets_ = new Map();
    }
    static getInstance() {
        return iconsetMap || (iconsetMap = new IconsetMap());
    }
    static resetInstanceForTesting(instance) {
        iconsetMap = instance;
    }
    get(id) {
        return this.iconsets_.get(id) || null;
    }
    set(id, iconset) {
        assert(!this.iconsets_.has(id), `Tried to add a second iconset with id '${id}'`);
        this.iconsets_.set(id, iconset);
        this.dispatchEvent(new CustomEvent('cr-iconset-added', { detail: id }));
    }
}

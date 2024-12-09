// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { html } from '//resources/lit/v3_0/lit.rollup.js';
export function getHtml() {
    return html `
<div id="grid" @keydown="${this.onKeyDown_}">
  <slot id="items"></slot>
</div>`;
}

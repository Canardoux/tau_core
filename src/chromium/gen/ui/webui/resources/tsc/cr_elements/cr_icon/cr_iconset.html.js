// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { html } from '//resources/lit/v3_0/lit.rollup.js';
export function getHtml() {
    return html `
<svg id="baseSvg" xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 ${this.size} ${this.size}"
     preserveAspectRatio="xMidYMid meet" focusable="false"
     style="pointer-events: none; display: block; width: 100%; height: 100%;">
 </svg>
<slot></slot>
`;
}

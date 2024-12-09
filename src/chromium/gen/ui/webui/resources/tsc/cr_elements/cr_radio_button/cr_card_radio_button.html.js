// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { html } from '//resources/lit/v3_0/lit.rollup.js';
export function getHtml() {
    return html `
<div id="button" role="radio"
    aria-checked="${this.getAriaChecked()}"
    aria-describedby="slotted-content"
    aria-disabled="${this.getAriaDisabled()}"
    class="disc-wrapper"
    tabindex="${this.getButtonTabIndex()}"
    aria-labelledby="slotted-content"
    @keydown="${this.onInputKeydown}">
  <cr-icon id="checkMark" icon="cr:check-circle"></cr-icon>
  <span id="slottedContent">
    <slot></slot>
  </span>
</div>`;
}

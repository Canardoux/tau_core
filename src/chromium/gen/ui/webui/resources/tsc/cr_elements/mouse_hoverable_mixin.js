// Copyright 2021 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { dedupingMixin } from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';
const HOVERED_STYLE = 'hovered';
export const MouseHoverableMixin = dedupingMixin((superClass) => {
    class MouseHoverableMixin extends superClass {
        ready() {
            super.ready();
            this.addEventListener('pointerenter', (e) => {
                const hostElement = e.currentTarget;
                hostElement.classList.toggle(HOVERED_STYLE, e.pointerType === 'mouse');
            });
            this.addEventListener('pointerleave', (e) => {
                if (e.pointerType !== 'mouse') {
                    return;
                }
                const hostElement = e.currentTarget;
                hostElement.classList.remove(HOVERED_STYLE);
            });
        }
    }
    return MouseHoverableMixin;
});

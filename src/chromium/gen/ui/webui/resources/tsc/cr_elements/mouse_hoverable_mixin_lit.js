// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const HOVERED_STYLE = 'hovered';
export const MouseHoverableMixinLit = (superClass) => {
    class MouseHoverableMixinLit extends superClass {
        firstUpdated(changedProperties) {
            super.firstUpdated(changedProperties);
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
    return MouseHoverableMixinLit;
};

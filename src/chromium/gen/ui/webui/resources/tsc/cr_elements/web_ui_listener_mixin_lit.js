// Copyright 2021 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { addWebUiListener, removeWebUiListener } from '//resources/js/cr.js';
export const WebUiListenerMixinLit = (superClass) => {
    class WebUiListenerMixinLit extends superClass {
        constructor() {
            super(...arguments);
            /**
             * Holds WebUI listeners that need to be removed when this element is
             * destroyed.
             */
            this.webUiListeners_ = [];
        }
        /**
         * Adds a WebUI listener and registers it for automatic removal when
         * this element is detached. Note: Do not use this method if you intend
         * to remove this listener manually (use addWebUiListener directly
         * instead).
         *
         * @param eventName The event to listen to.
         * @param callback The callback run when the event is fired.
         */
        addWebUiListener(eventName, callback) {
            this.webUiListeners_.push(addWebUiListener(eventName, callback));
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            while (this.webUiListeners_.length > 0) {
                removeWebUiListener(this.webUiListeners_.pop());
            }
        }
    }
    return WebUiListenerMixinLit;
};

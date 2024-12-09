// Copyright 2023 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export class OpenWindowProxyImpl {
    openUrl(url) {
        window.open(url);
    }
    static getInstance() {
        return instance || (instance = new OpenWindowProxyImpl());
    }
    static setInstance(obj) {
        instance = obj;
    }
}
let instance = null;

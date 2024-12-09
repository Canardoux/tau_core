// Copyright 2023 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { PageImageServiceHandler } from './page_image_service.mojom-webui.js';
export class PageImageServiceBrowserProxy {
    handler;
    constructor(handler) {
        this.handler = handler;
    }
    static getInstance() {
        return instance ||
            (instance = new PageImageServiceBrowserProxy(PageImageServiceHandler.getRemote()));
    }
    static setInstance(obj) {
        instance = obj;
    }
}
let instance = null;

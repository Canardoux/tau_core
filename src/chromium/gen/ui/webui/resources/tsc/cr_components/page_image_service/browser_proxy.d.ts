/**
 * @fileoverview The browser proxy used to access `PageImageService` from WebUI.
 */
import type { PageImageServiceHandlerRemote } from './page_image_service.mojom-webui.js';
export declare class PageImageServiceBrowserProxy {
    handler: PageImageServiceHandlerRemote;
    constructor(handler: PageImageServiceHandlerRemote);
    static getInstance(): PageImageServiceBrowserProxy;
    static setInstance(obj: PageImageServiceBrowserProxy): void;
}

/**
 * @fileoverview A helper object used to open a URL in a new tab.
 * the browser.
 */
export interface OpenWindowProxy {
    /**
     * Opens the specified URL in a new tab.
     */
    openUrl(url: string): void;
}
export declare class OpenWindowProxyImpl implements OpenWindowProxy {
    openUrl(url: string): void;
    static getInstance(): OpenWindowProxy;
    static setInstance(obj: OpenWindowProxy): void;
}

/**
 * Generates a CSS url string.
 * @param s The URL to generate the CSS url for.
 * @return The CSS url string.
 */
export declare function getUrlForCss(s: string): string;
/**
 * A URL for the filetype icon for |filePath|. OS and theme dependent.
 */
export declare function getFileIconUrl(filePath: string): string;
/**
 * Returns the URL of the image, or an image set of URLs for the provided
 * path.  Resources in chrome://theme have multiple supported scale factors.
 *
 * @param path The path of the image.
 * @return The url, or an image set of URLs.
 */
export declare function getImage(path: string): string;
/**
 * Creates a CSS image-set for a favicon.
 *
 * @param url URL of the favicon
 * @return image-set for the favicon
 */
export declare function getFavicon(url: string): string;
/**
 * Creates a CSS image-set for a favicon request based on a page URL.
 *
 * @param url URL of the original page
 * @param isSyncedUrlForHistoryUi Should be set to true only if the
 *     caller is an UI aimed at displaying user history, and the requested url
 *     is known to be present in Chrome sync data.
 * @param remoteIconUrlForUma In case the entry is contained in sync
 *     data, we can pass the associated icon url.
 * @param size The favicon size.
 * @param forceLightMode Flag to force the service to show the light
 *     mode version of the default favicon.
 *
 * @return image-set for the favicon.
 */
export declare function getFaviconForPageURL(url: string, isSyncedUrlForHistoryUi: boolean, remoteIconUrlForUma?: string, size?: number, forceLightMode?: boolean): string;

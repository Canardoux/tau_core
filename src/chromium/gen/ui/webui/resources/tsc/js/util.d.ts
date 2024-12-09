/**
 * Alias for document.getElementById. Found elements must be HTMLElements.
 */
export declare function $<T extends HTMLElement = HTMLElement>(id: string): (T | null);
/**
 * Alias for document.getElementById. Found elements must be HTMLElements.
 */
export declare function getRequiredElement<T extends HTMLElement = HTMLElement>(id: string): T;
/**
 * @return The currently focused element (including elements that are
 *     behind a shadow root), or null if nothing is focused.
 */
export declare function getDeepActiveElement(): (Element | null);
/**
 * Check the directionality of the page.
 * @return True if Chrome is running an RTL UI.
 */
export declare function isRTL(): boolean;
/**
 * Creates a new URL which is the old URL with a GET param of key=value.
 * @param url The base URL. There is no validation checking on the URL
 *     so it must be passed in a proper format.
 * @param key The key of the param.
 * @param value The value of the param.
 * @return The new URL.
 */
export declare function appendParam(url: string, key: string, value: string): string;
/**
 * transitionend does not always fire (e.g. when animation is aborted
 * or when no paint happens during the animation). This function sets up
 * a timer and emulate the event if it is not fired when the timer expires.
 * @param el The element to watch for transitionend.
 * @param timeOut The maximum wait time in milliseconds for the transitionend
 *     to happen. If not specified, it is fetched from |el| using the
 *     transitionDuration style value.
 */
export declare function ensureTransitionEndEvent(el: HTMLElement, timeOut: number): void;
/**
 * Replaces '&', '<', '>', '"', and ''' characters with their HTML encoding.
 * @param original The original string.
 * @return The string with all the characters mentioned above replaced.
 */
export declare function htmlEscape(original: string): string;
/**
 * Quote a string so it can be used in a regular expression.
 * @param str The source string.
 * @return The escaped string.
 */
export declare function quoteString(str: string): string;
/**
 * Calls |callback| and stops listening the first time any event in |eventNames|
 * is triggered on |target|.
 * @param eventNames Array or space-delimited string of event names to listen to
 *     (e.g. 'click mousedown').
 * @param callback Called at most once. The optional return value is passed on
 *     by the listener.
 */
export declare function listenOnce(target: EventTarget, eventNames: string[] | string, callback: (e: Event) => any): void;
/**
 * @return Whether a modifier key was down when processing |e|.
 */
export declare function hasKeyModifiers(e: KeyboardEvent): boolean;
/**
 * @return Whether a given KeyboardEvent resembles an undo action, on different
 * platforms.
 */
export declare function isUndoKeyboardEvent(event: KeyboardEvent): boolean;

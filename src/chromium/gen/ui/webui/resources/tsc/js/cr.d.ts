export interface WebUiListener {
    eventName: string;
    uid: number;
}
/**
 * The named method the WebUI handler calls directly in response to a
 * chrome.send call that expects a response. The handler requires no knowledge
 * of the specific name of this method, as the name is passed to the handler
 * as the first argument in the arguments list of chrome.send. The handler
 * must pass the ID, also sent via the chrome.send arguments list, as the
 * first argument of the JS invocation; additionally, the handler may
 * supply any number of other arguments that will be included in the response.
 * @param id The unique ID identifying the Promise this response is
 *     tied to.
 * @param isSuccess Whether the request was successful.
 * @param response The response as sent from C++.
 */
export declare function webUIResponse(id: string, isSuccess: boolean, response: any): void;
/**
 * A variation of chrome.send, suitable for messages that expect a single
 * response from C++.
 * @param methodName The name of the WebUI handler API.
 * @param args Variable number of arguments to be forwarded to the
 *     C++ call.
 */
export declare function sendWithPromise(methodName: string, ...args: any[]): Promise<any>;
/**
 * The named method the WebUI handler calls directly when an event occurs.
 * The WebUI handler must supply the name of the event as the first argument
 * of the JS invocation; additionally, the handler may supply any number of
 * other arguments that will be forwarded to the listener callbacks.
 * @param event The name of the event that has occurred.
 * @param args Additional arguments passed from C++.
 */
export declare function webUIListenerCallback(event: string, ...args: any[]): void;
/**
 * Registers a listener for an event fired from WebUI handlers. Any number of
 * listeners may register for a single event.
 * @param eventName The event to listen to.
 * @param callback The callback run when the event is fired.
 * @return An object to be used for removing a listener via
 *     removeWebUiListener. Should be treated as read-only.
 */
export declare function addWebUiListener(eventName: string, callback: Function): WebUiListener;
/**
 * Removes a listener. Does nothing if the specified listener is not found.
 * @param listener The listener to be removed (as returned by addWebUiListener).
 * @return Whether the given listener was found and actually removed.
 */
export declare function removeWebUiListener(listener: WebUiListener): boolean;

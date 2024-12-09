import { mojo } from '//resources/mojo/mojo/public/js/bindings.js';
import { TimeDelta as mojoBase_mojom_TimeDelta } from '//resources/mojo/mojo/public/mojom/base/time.mojom-webui.js';
export declare class PageMetricsHostPendingReceiver implements mojo.internal.interfaceSupport.PendingReceiver {
    handle: mojo.internal.interfaceSupport.Endpoint;
    constructor(handle: MojoHandle | mojo.internal.interfaceSupport.Endpoint);
    bindInBrowser(scope?: string): void;
}
export interface PageMetricsHostInterface {
    onPageRemoteCreated(page: PageMetricsRemote): void;
    onGetMark(name: string): Promise<{
        markedTime: (mojoBase_mojom_TimeDelta | null);
    }>;
    onClearMark(name: string): void;
    onUmaReportTime(name: string, time: mojoBase_mojom_TimeDelta): void;
}
export declare class PageMetricsHostRemote implements PageMetricsHostInterface {
    private proxy;
    $: mojo.internal.interfaceSupport.InterfaceRemoteBaseWrapper<PageMetricsHostPendingReceiver>;
    onConnectionError: mojo.internal.interfaceSupport.ConnectionErrorEventRouter;
    constructor(handle?: MojoHandle | mojo.internal.interfaceSupport.Endpoint);
    onPageRemoteCreated(page: PageMetricsRemote): void;
    onGetMark(name: string): Promise<{
        markedTime: (mojoBase_mojom_TimeDelta | null);
    }>;
    onClearMark(name: string): void;
    onUmaReportTime(name: string, time: mojoBase_mojom_TimeDelta): void;
}
/**
 * An object which receives request messages for the PageMetricsHost
 * mojom interface. Must be constructed over an object which implements that
 * interface.
 */
export declare class PageMetricsHostReceiver {
    private helper_internal_;
    $: mojo.internal.interfaceSupport.InterfaceReceiverHelper<PageMetricsHostRemote>;
    onConnectionError: mojo.internal.interfaceSupport.ConnectionErrorEventRouter;
    constructor(impl: PageMetricsHostInterface);
}
export declare class PageMetricsHost {
    static get $interfaceName(): string;
    /**
     * Returns a remote for this interface which sends messages to the browser.
     * The browser must have an interface request binder registered for this
     * interface and accessible to the calling document's frame.
     */
    static getRemote(): PageMetricsHostRemote;
}
/**
 * An object which receives request messages for the PageMetricsHost
 * mojom interface and dispatches them as callbacks. One callback receiver exists
 * on this object for each message defined in the mojom interface, and each
 * receiver can have any number of listeners added to it.
 */
export declare class PageMetricsHostCallbackRouter {
    private helper_internal_;
    $: mojo.internal.interfaceSupport.InterfaceReceiverHelper<PageMetricsHostRemote>;
    router_: mojo.internal.interfaceSupport.CallbackRouter;
    onPageRemoteCreated: mojo.internal.interfaceSupport.InterfaceCallbackReceiver;
    onGetMark: mojo.internal.interfaceSupport.InterfaceCallbackReceiver;
    onClearMark: mojo.internal.interfaceSupport.InterfaceCallbackReceiver;
    onUmaReportTime: mojo.internal.interfaceSupport.InterfaceCallbackReceiver;
    onConnectionError: mojo.internal.interfaceSupport.ConnectionErrorEventRouter;
    constructor();
    /**
     * @param id An ID returned by a prior call to addListener.
     * @return True iff the identified listener was found and removed.
     */
    removeListener(id: number): boolean;
}
export declare class PageMetricsPendingReceiver implements mojo.internal.interfaceSupport.PendingReceiver {
    handle: mojo.internal.interfaceSupport.Endpoint;
    constructor(handle: MojoHandle | mojo.internal.interfaceSupport.Endpoint);
    bindInBrowser(scope?: string): void;
}
export interface PageMetricsInterface {
    onGetMark(name: string): Promise<{
        markedTime: (mojoBase_mojom_TimeDelta | null);
    }>;
    onClearMark(name: string): void;
}
export declare class PageMetricsRemote implements PageMetricsInterface {
    private proxy;
    $: mojo.internal.interfaceSupport.InterfaceRemoteBaseWrapper<PageMetricsPendingReceiver>;
    onConnectionError: mojo.internal.interfaceSupport.ConnectionErrorEventRouter;
    constructor(handle?: MojoHandle | mojo.internal.interfaceSupport.Endpoint);
    onGetMark(name: string): Promise<{
        markedTime: (mojoBase_mojom_TimeDelta | null);
    }>;
    onClearMark(name: string): void;
}
/**
 * An object which receives request messages for the PageMetrics
 * mojom interface. Must be constructed over an object which implements that
 * interface.
 */
export declare class PageMetricsReceiver {
    private helper_internal_;
    $: mojo.internal.interfaceSupport.InterfaceReceiverHelper<PageMetricsRemote>;
    onConnectionError: mojo.internal.interfaceSupport.ConnectionErrorEventRouter;
    constructor(impl: PageMetricsInterface);
}
export declare class PageMetrics {
    static get $interfaceName(): string;
    /**
     * Returns a remote for this interface which sends messages to the browser.
     * The browser must have an interface request binder registered for this
     * interface and accessible to the calling document's frame.
     */
    static getRemote(): PageMetricsRemote;
}
/**
 * An object which receives request messages for the PageMetrics
 * mojom interface and dispatches them as callbacks. One callback receiver exists
 * on this object for each message defined in the mojom interface, and each
 * receiver can have any number of listeners added to it.
 */
export declare class PageMetricsCallbackRouter {
    private helper_internal_;
    $: mojo.internal.interfaceSupport.InterfaceReceiverHelper<PageMetricsRemote>;
    router_: mojo.internal.interfaceSupport.CallbackRouter;
    onGetMark: mojo.internal.interfaceSupport.InterfaceCallbackReceiver;
    onClearMark: mojo.internal.interfaceSupport.InterfaceCallbackReceiver;
    onConnectionError: mojo.internal.interfaceSupport.ConnectionErrorEventRouter;
    constructor();
    /**
     * @param id An ID returned by a prior call to addListener.
     * @return True iff the identified listener was found and removed.
     */
    removeListener(id: number): boolean;
}
export declare const PageMetricsHost_OnPageRemoteCreated_ParamsSpec: {
    $: mojo.internal.MojomType;
};
export declare const PageMetricsHost_OnGetMark_ParamsSpec: {
    $: mojo.internal.MojomType;
};
export declare const PageMetricsHost_OnGetMark_ResponseParamsSpec: {
    $: mojo.internal.MojomType;
};
export declare const PageMetricsHost_OnClearMark_ParamsSpec: {
    $: mojo.internal.MojomType;
};
export declare const PageMetricsHost_OnUmaReportTime_ParamsSpec: {
    $: mojo.internal.MojomType;
};
export declare const PageMetrics_OnGetMark_ParamsSpec: {
    $: mojo.internal.MojomType;
};
export declare const PageMetrics_OnGetMark_ResponseParamsSpec: {
    $: mojo.internal.MojomType;
};
export declare const PageMetrics_OnClearMark_ParamsSpec: {
    $: mojo.internal.MojomType;
};
export interface PageMetricsHost_OnPageRemoteCreated_ParamsMojoType {
    page: PageMetricsRemote;
}
export type PageMetricsHost_OnPageRemoteCreated_Params = PageMetricsHost_OnPageRemoteCreated_ParamsMojoType;
export interface PageMetricsHost_OnGetMark_ParamsMojoType {
    name: string;
}
export type PageMetricsHost_OnGetMark_Params = PageMetricsHost_OnGetMark_ParamsMojoType;
export interface PageMetricsHost_OnGetMark_ResponseParamsMojoType {
    markedTime: (mojoBase_mojom_TimeDelta | null);
}
export type PageMetricsHost_OnGetMark_ResponseParams = PageMetricsHost_OnGetMark_ResponseParamsMojoType;
export interface PageMetricsHost_OnClearMark_ParamsMojoType {
    name: string;
}
export type PageMetricsHost_OnClearMark_Params = PageMetricsHost_OnClearMark_ParamsMojoType;
export interface PageMetricsHost_OnUmaReportTime_ParamsMojoType {
    name: string;
    time: mojoBase_mojom_TimeDelta;
}
export type PageMetricsHost_OnUmaReportTime_Params = PageMetricsHost_OnUmaReportTime_ParamsMojoType;
export interface PageMetrics_OnGetMark_ParamsMojoType {
    name: string;
}
export type PageMetrics_OnGetMark_Params = PageMetrics_OnGetMark_ParamsMojoType;
export interface PageMetrics_OnGetMark_ResponseParamsMojoType {
    markedTime: (mojoBase_mojom_TimeDelta | null);
}
export type PageMetrics_OnGetMark_ResponseParams = PageMetrics_OnGetMark_ResponseParamsMojoType;
export interface PageMetrics_OnClearMark_ParamsMojoType {
    name: string;
}
export type PageMetrics_OnClearMark_Params = PageMetrics_OnClearMark_ParamsMojoType;

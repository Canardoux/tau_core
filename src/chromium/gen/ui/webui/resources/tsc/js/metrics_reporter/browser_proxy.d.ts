import type { TimeDelta } from '//resources/mojo/mojo/public/mojom/base/time.mojom-webui.js';
import type { PageMetricsHostRemote } from '../metrics_reporter.mojom-webui.js';
import { PageMetricsCallbackRouter } from '../metrics_reporter.mojom-webui.js';
export interface BrowserProxy {
    getMark(name: string): Promise<{
        markedTime: TimeDelta | null;
    }>;
    clearMark(name: string): void;
    umaReportTime(name: string, time: TimeDelta): void;
    getCallbackRouter(): PageMetricsCallbackRouter;
    now(): bigint;
}
export declare class BrowserProxyImpl implements BrowserProxy {
    callbackRouter: PageMetricsCallbackRouter;
    host: PageMetricsHostRemote;
    constructor();
    getMark(name: string): Promise<{
        markedTime: (TimeDelta | null);
    }>;
    clearMark(name: string): void;
    umaReportTime(name: string, time: TimeDelta): void;
    now(): bigint;
    getCallbackRouter(): PageMetricsCallbackRouter;
    static getInstance(): BrowserProxy;
    static setInstance(obj: BrowserProxy): void;
}

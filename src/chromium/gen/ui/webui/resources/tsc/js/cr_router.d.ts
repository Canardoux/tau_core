export declare class CrRouter extends EventTarget {
    private path_;
    private query_;
    private hash_;
    /**
     * If the user was on a URL for less than `dwellTime_` milliseconds, it
     * won't be added to the browser's history, but instead will be replaced
     * by the next entry.
     *
     * This is to prevent large numbers of entries from clogging up the user's
     * browser history. Disable by setting to a negative number.
     */
    private dwellTime_;
    private lastChangedAt_;
    constructor();
    setDwellTime(dwellTime: number): void;
    getPath(): string;
    getQueryParams(): URLSearchParams;
    getHash(): string;
    setHash(hash: string): void;
    setQueryParams(params: URLSearchParams): void;
    setPath(path: string): void;
    private hashChanged_;
    private urlChanged_;
    private updateState_;
    static getInstance(): CrRouter;
    static resetForTesting(): void;
}

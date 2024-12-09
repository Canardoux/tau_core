export interface MetricsReporter {
    mark(name: string): void;
    measure(startMark: string, endMark?: string): Promise<bigint>;
    hasMark(name: string): Promise<boolean>;
    hasLocalMark(name: string): boolean;
    clearMark(name: string): void;
    umaReportTime(histogram: string, time: bigint): void;
}
export declare class MetricsReporterImpl implements MetricsReporter {
    private marks_;
    private browserProxy_;
    constructor();
    static getInstance(): MetricsReporter;
    static setInstanceForTest(newInstance: MetricsReporter): void;
    mark(name: string): void;
    measure(startMark: string, endMark?: string): Promise<bigint>;
    hasMark(name: string): Promise<boolean>;
    hasLocalMark(name: string): boolean;
    clearMark(name: string): void;
    umaReportTime(histogram: string, time: bigint): void;
}

import { mojo } from '//resources/mojo/mojo/public/js/bindings.js';
export declare const TimeSpec: {
    $: mojo.internal.MojomType;
};
export declare const JSTimeSpec: {
    $: mojo.internal.MojomType;
};
export declare const TimeDeltaSpec: {
    $: mojo.internal.MojomType;
};
export declare const TimeTicksSpec: {
    $: mojo.internal.MojomType;
};
export interface TimeMojoType {
    internalValue: bigint;
}
export type Time = TimeMojoType;
export interface JSTimeMojoType {
    msec: number;
}
export type JSTime = JSTimeMojoType;
export interface TimeDeltaMojoType {
    microseconds: bigint;
}
export type TimeDelta = TimeDeltaMojoType;
export interface TimeTicksMojoType {
    internalValue: bigint;
}
export type TimeTicks = TimeTicksMojoType;

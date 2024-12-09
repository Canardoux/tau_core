import { mojo } from '//resources/mojo/mojo/public/js/bindings.js';
export declare const Int128Spec: {
    $: mojo.internal.MojomType;
};
export declare const Uint128Spec: {
    $: mojo.internal.MojomType;
};
export interface Int128MojoType {
    high: bigint;
    low: bigint;
}
export type Int128 = Int128MojoType;
export interface Uint128MojoType {
    high: bigint;
    low: bigint;
}
export type Uint128 = Uint128MojoType;

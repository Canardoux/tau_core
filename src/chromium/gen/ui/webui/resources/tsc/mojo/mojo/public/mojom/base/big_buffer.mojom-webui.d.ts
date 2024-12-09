import { mojo } from '//resources/mojo/mojo/public/js/bindings.js';
export declare const BigBufferSharedMemoryRegionSpec: {
    $: mojo.internal.MojomType;
};
export declare const BigBufferSpec: {
    $: mojo.internal.MojomType;
};
export interface BigBufferSharedMemoryRegionMojoType {
    bufferHandle: MojoHandle;
    size: number;
}
export type BigBufferSharedMemoryRegion = BigBufferSharedMemoryRegionMojoType;
export interface BigBuffer {
    bytes?: number[];
    sharedMemory?: BigBufferSharedMemoryRegion;
    invalidBuffer?: boolean;
}

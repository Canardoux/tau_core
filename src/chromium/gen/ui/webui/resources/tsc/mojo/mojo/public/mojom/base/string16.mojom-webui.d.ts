import { mojo } from '//resources/mojo/mojo/public/js/bindings.js';
import { BigBuffer as mojoBase_mojom_BigBuffer } from './big_buffer.mojom-webui.js';
export declare const String16Spec: {
    $: mojo.internal.MojomType;
};
export declare const BigString16Spec: {
    $: mojo.internal.MojomType;
};
export interface String16MojoType {
    data: number[];
}
export type String16 = String16MojoType;
export interface BigString16MojoType {
    data: mojoBase_mojom_BigBuffer;
}
export type BigString16 = BigString16MojoType;

import { mojo } from '//resources/mojo/mojo/public/js/bindings.js';
import { BigBuffer as mojoBase_mojom_BigBuffer } from './big_buffer.mojom-webui.js';
export declare const BigStringSpec: {
    $: mojo.internal.MojomType;
};
export interface BigStringMojoType {
    data: mojoBase_mojom_BigBuffer;
}
export type BigString = BigStringMojoType;

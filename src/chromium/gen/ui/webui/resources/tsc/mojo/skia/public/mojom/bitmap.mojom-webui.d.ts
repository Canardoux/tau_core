import { mojo } from '//resources/mojo/mojo/public/js/bindings.js';
import { BigBuffer as mojoBase_mojom_BigBuffer } from '../../../mojo/public/mojom/base/big_buffer.mojom-webui.js';
import { BitmapN32ImageInfo as skia_mojom_BitmapN32ImageInfo, ImageInfo as skia_mojom_ImageInfo } from './image_info.mojom-webui.js';
export declare const BitmapN32Spec: {
    $: mojo.internal.MojomType;
};
export declare const BitmapWithArbitraryBppSpec: {
    $: mojo.internal.MojomType;
};
export declare const BitmapMappedFromTrustedProcessSpec: {
    $: mojo.internal.MojomType;
};
export declare const InlineBitmapSpec: {
    $: mojo.internal.MojomType;
};
export interface BitmapN32MojoType {
    imageInfo: skia_mojom_BitmapN32ImageInfo;
    pixelData: mojoBase_mojom_BigBuffer;
}
export type BitmapN32 = BitmapN32MojoType;
export interface BitmapWithArbitraryBppMojoType {
    imageInfo: skia_mojom_ImageInfo;
    uNUSEDRowBytes: bigint;
    pixelData: mojoBase_mojom_BigBuffer;
}
export type BitmapWithArbitraryBpp = BitmapWithArbitraryBppMojoType;
export interface BitmapMappedFromTrustedProcessMojoType {
    imageInfo: skia_mojom_ImageInfo;
    uNUSEDRowBytes: bigint;
    pixelData: mojoBase_mojom_BigBuffer;
}
export type BitmapMappedFromTrustedProcess = BitmapMappedFromTrustedProcessMojoType;
export interface InlineBitmapMojoType {
    imageInfo: skia_mojom_BitmapN32ImageInfo;
    pixelData: number[];
}
export type InlineBitmap = InlineBitmapMojoType;

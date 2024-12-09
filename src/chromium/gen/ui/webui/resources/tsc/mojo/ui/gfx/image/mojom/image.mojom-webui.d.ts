import { mojo } from '//resources/mojo/mojo/public/js/bindings.js';
import { BitmapWithArbitraryBpp as skia_mojom_BitmapWithArbitraryBpp } from '../../../../skia/public/mojom/bitmap.mojom-webui.js';
export declare const ImageSkiaRepSpec: {
    $: mojo.internal.MojomType;
};
export declare const ImageSkiaSpec: {
    $: mojo.internal.MojomType;
};
export interface ImageSkiaRepMojoType {
    bitmap: skia_mojom_BitmapWithArbitraryBpp;
    scale: number;
}
export type ImageSkiaRep = ImageSkiaRepMojoType;
export interface ImageSkiaMojoType {
    imageReps: ImageSkiaRep[];
}
export type ImageSkia = ImageSkiaMojoType;

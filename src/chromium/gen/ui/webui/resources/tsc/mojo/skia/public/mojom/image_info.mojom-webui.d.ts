import { mojo } from '//resources/mojo/mojo/public/js/bindings.js';
export declare const ColorTypeSpec: {
    $: mojo.internal.MojomType;
};
export declare enum ColorType {
    MIN_VALUE = 0,
    MAX_VALUE = 7,
    UNKNOWN = 0,
    ALPHA_8 = 1,
    RGB_565 = 2,
    ARGB_4444 = 3,
    RGBA_8888 = 4,
    BGRA_8888 = 5,
    DEPRECATED_INDEX_8 = 6,
    GRAY_8 = 7
}
export declare const AlphaTypeSpec: {
    $: mojo.internal.MojomType;
};
export declare enum AlphaType {
    MIN_VALUE = 0,
    MAX_VALUE = 3,
    UNKNOWN = 0,
    ALPHA_TYPE_OPAQUE = 1,
    PREMUL = 2,
    UNPREMUL = 3
}
export declare const ImageInfoSpec: {
    $: mojo.internal.MojomType;
};
export declare const BitmapN32ImageInfoSpec: {
    $: mojo.internal.MojomType;
};
export interface ImageInfoMojoType {
    colorType: ColorType;
    alphaType: AlphaType;
    width: number;
    height: number;
    colorTransferFunction: (number[] | null);
    colorToXyzMatrix: (number[] | null);
}
export type ImageInfo = ImageInfoMojoType;
export interface BitmapN32ImageInfoMojoType {
    alphaType: AlphaType;
    width: number;
    height: number;
    colorTransferFunction: (number[] | null);
    colorToXyzMatrix: (number[] | null);
}
export type BitmapN32ImageInfo = BitmapN32ImageInfoMojoType;

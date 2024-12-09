/**
 * @fileoverview Helper functions for color manipulations.
 */
import type { SkColor } from '//resources/mojo/skia/public/mojom/skcolor.mojom-webui.js';
/**
 * Converts an SkColor object to a string in the form
 * "rgba(<red>, <green>, <blue>, <alpha>)".
 * @param skColor The input color.
 * @return The rgba string.
 */
export declare function skColorToRgba(skColor: SkColor): string;
/**
 * Converts an SkColor object to a string in the the form "#rrggbb".
 * @param skColor The input color.
 * @return The hex color string,
 */
export declare function skColorToHexColor(skColor: SkColor): string;
/**
 * Converts a string of the form "#rrggbb" to an SkColor object.
 * @param hexColor The color string.
 * @return The SkColor object,
 */
export declare function hexColorToSkColor(hexColor: string): SkColor;
/**
 * Converts a string of the form "<red>, <green>, <blue>" to an SkColor
 * object.
 * @param rgb The rgb color string.
 * @return The SkColor object,
 */
export declare function rgbToSkColor(rgb: string): SkColor;

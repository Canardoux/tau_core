/**
 * @fileoverview Mixin for cr-radio-button-like elements.
 */
import type { PolymerElement } from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';
interface PaperRippleElement {
    clear(): void;
    showAndHoldDown(): void;
}
type Constructor<T> = new (...args: any[]) => T;
export declare const CrRadioButtonMixin: <T extends Constructor<PolymerElement>>(superClass: T) => T & Constructor<CrRadioButtonMixinInterface>;
export interface CrRadioButtonMixinInterface {
    checked: boolean;
    disabled: boolean;
    focusable: boolean;
    hideLabelText: boolean;
    label: string;
    name?: string;
    getPaperRipple(): PaperRippleElement;
}
export {};

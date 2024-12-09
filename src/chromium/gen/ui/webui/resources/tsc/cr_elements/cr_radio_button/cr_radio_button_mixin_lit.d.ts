/**
 * @fileoverview Mixin for cr-radio-button-like elements.
 */
import type { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { CrRippleElement } from '../cr_ripple/cr_ripple.js';
type Constructor<T> = new (...args: any[]) => T;
export declare const CrRadioButtonMixinLit: <T extends Constructor<CrLitElement>>(superClass: T) => T & Constructor<CrRadioButtonMixinLitInterface>;
export interface CrRadioButtonMixinLitInterface {
    checked: boolean;
    disabled: boolean;
    focusable: boolean;
    hideLabelText: boolean;
    label: string;
    name?: string;
    getButtonTabIndex(): number;
    getAriaDisabled(): string;
    getAriaChecked(): string;
    onInputKeydown(e: KeyboardEvent): void;
    getRipple(): CrRippleElement;
}
export {};

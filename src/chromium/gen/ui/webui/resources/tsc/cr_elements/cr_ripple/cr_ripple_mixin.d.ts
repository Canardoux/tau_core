import './cr_ripple.js';
import type { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { CrRippleElement } from './cr_ripple.js';
/**
 * `CrRippleMixin` exposes methods to dynamically create a cr-ripple
 * when needed.
 */
type Constructor<T> = new (...args: any[]) => T;
export declare const CrRippleMixin: <T extends Constructor<CrLitElement>>(superClass: T) => T & Constructor<CrRippleMixinInterface>;
export interface CrRippleMixinInterface {
    noink: boolean;
    rippleContainer: HTMLElement | null;
    createRipple(): CrRippleElement;
    ensureRipple(): void;
    ensureRippleOnPointerdown(): void;
    getRipple(): CrRippleElement;
    hasRipple(): boolean;
}
export {};

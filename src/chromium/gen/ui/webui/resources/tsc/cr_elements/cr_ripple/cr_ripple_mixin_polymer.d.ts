import './cr_ripple.js';
import type { PolymerElement } from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';
import type { CrRippleElement } from './cr_ripple.js';
/**
 * `CrRippleMixinPolymer` exposes methods to dynamically create a cr-ripple
 * when needed.
 * Note: This is a port of CrRippleMixin to Polymer.
 */
type Constructor<T> = new (...args: any[]) => T;
export declare const CrRippleMixinPolymer: <T extends Constructor<PolymerElement>>(superClass: T) => T & Constructor<CrRippleMixinPolymerInterface>;
export interface CrRippleMixinPolymerInterface {
    noink: boolean;
    rippleContainer: HTMLElement | null;
    createRipple(): CrRippleElement;
    ensureRipple(): void;
    ensureRippleOnPointerdown(): void;
    getRipple(): CrRippleElement;
    hasRipple(): boolean;
}
export {};

import type { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { CrScrollObserverMixinLitInterface } from './cr_scroll_observer_mixin_lit.js';
export declare enum CrContainerShadowSide {
    TOP = "top",
    BOTTOM = "bottom"
}
type Constructor<T> = new (...args: any[]) => T;
export declare const CrContainerShadowMixinLit: <T extends Constructor<CrLitElement>>(superClass: T) => T & Constructor<CrContainerShadowMixinLitInterface>;
export interface CrContainerShadowMixinLitInterface extends CrScrollObserverMixinLitInterface {
    setForceDropShadows(enabled: boolean): void;
}
export {};

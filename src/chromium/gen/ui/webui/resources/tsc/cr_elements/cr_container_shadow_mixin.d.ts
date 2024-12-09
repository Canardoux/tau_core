import type { PolymerElement } from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';
import type { CrScrollObserverMixinInterface } from './cr_scroll_observer_mixin.js';
export declare enum CrContainerShadowSide {
    TOP = "top",
    BOTTOM = "bottom"
}
type Constructor<T> = new (...args: any[]) => T;
export declare const CrContainerShadowMixin: <T extends Constructor<PolymerElement>>(superClass: T) => T & Constructor<CrContainerShadowMixinInterface>;
export interface CrContainerShadowMixinInterface extends CrScrollObserverMixinInterface {
    setForceDropShadows(enabled: boolean): void;
}
export {};

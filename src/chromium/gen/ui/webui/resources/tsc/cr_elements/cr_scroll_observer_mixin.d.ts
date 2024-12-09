import type { PolymerElement } from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';
type Constructor<T> = new (...args: any[]) => T;
export declare const CrScrollObserverMixin: <T extends Constructor<PolymerElement>>(superClass: T) => T & Constructor<CrScrollObserverMixinInterface>;
export interface CrScrollObserverMixinInterface {
    enableScrollObservation(enable: boolean): void;
    getContainer(): HTMLElement;
}
export {};

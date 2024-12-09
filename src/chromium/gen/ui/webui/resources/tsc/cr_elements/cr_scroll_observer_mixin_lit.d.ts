import type { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
type Constructor<T> = new (...args: any[]) => T;
export declare const CrScrollObserverMixinLit: <T extends Constructor<CrLitElement>>(superClass: T) => T & Constructor<CrScrollObserverMixinLitInterface>;
export interface CrScrollObserverMixinLitInterface {
    enableScrollObservation(enable: boolean): void;
    getContainer(): HTMLElement;
}
export {};

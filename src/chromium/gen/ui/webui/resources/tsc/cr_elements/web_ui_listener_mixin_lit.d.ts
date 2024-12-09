import type { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
type Constructor<T> = new (...args: any[]) => T;
export declare const WebUiListenerMixinLit: <T extends Constructor<CrLitElement>>(superClass: T) => T & Constructor<WebUiListenerMixinLitInterface>;
export interface WebUiListenerMixinLitInterface {
    addWebUiListener(eventName: string, callback: Function): void;
}
export {};

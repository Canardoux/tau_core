import type { PolymerElement } from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';
type Constructor<T> = new (...args: any[]) => T;
export declare const WebUiListenerMixin: <T extends Constructor<PolymerElement>>(superClass: T) => T & Constructor<WebUiListenerMixinInterface>;
export interface WebUiListenerMixinInterface {
    addWebUiListener(eventName: string, callback: Function): void;
}
export {};

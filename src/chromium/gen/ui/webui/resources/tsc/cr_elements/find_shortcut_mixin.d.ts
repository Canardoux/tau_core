import type { PolymerElement } from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';
import type { FindShortcutListener } from './find_shortcut_manager.js';
type Constructor<T> = new (...args: any[]) => T;
/**
 * Used to determine how to handle find shortcut invocations.
 */
export declare const FindShortcutMixin: <T extends Constructor<PolymerElement>>(superClass: T) => T & Constructor<FindShortcutListener>;
export {};

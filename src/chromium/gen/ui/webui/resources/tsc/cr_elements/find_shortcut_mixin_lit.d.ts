import type { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { FindShortcutListener } from './find_shortcut_manager.js';
type Constructor<T> = new (...args: any[]) => T;
/**
 * Used to determine how to handle find shortcut invocations.
 */
export declare const FindShortcutMixinLit: <T extends Constructor<CrLitElement>>(superClass: T) => T & Constructor<FindShortcutListener>;
export {};

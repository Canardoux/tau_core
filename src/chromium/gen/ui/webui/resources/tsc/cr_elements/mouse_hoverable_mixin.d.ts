/**
 * @fileoverview This file provides a mixin to manage a `hovered` style on mouse
 * events. Relies on listening for pointer events as touch devices may fire
 * mouse events too.
 */
import type { PolymerElement } from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';
type Constructor<T> = new (...args: any[]) => T;
export declare const MouseHoverableMixin: <T extends Constructor<PolymerElement>>(superClass: T) => T;
export {};

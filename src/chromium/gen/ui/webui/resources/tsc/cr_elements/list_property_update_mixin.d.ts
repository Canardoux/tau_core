/**
 * @fileoverview |ListPropertyUpdateMixin| is used to update an existing
 * polymer list property given the list after all the edits were made while
 * maintaining the reference to the original list. This allows
 * dom-repeat/iron-list elements bound to this list property to not fully
 * re-rendered from scratch.
 *
 * The minimal splices needed to transform the original list to the edited list
 * are calculated using |Polymer.ArraySplice.calculateSplices|. All the edits
 * are then applied to the original list. Once completed, a single notification
 * containing information about all the edits is sent to the polyer object.
 */
import type { PolymerElement } from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';
type Constructor<T> = new (...args: any[]) => T;
export declare const ListPropertyUpdateMixin: <T extends Constructor<PolymerElement>>(superClass: T) => T & Constructor<ListPropertyUpdateMixinInterface>;
export interface ListPropertyUpdateMixinInterface {
    /** @return Whether notifySplices was called. */
    updateList<T>(propertyPath: string, identityGetter: (item: T) => (T | string), updatedList: T[], identityBasedUpdate?: boolean): boolean;
}
export {};

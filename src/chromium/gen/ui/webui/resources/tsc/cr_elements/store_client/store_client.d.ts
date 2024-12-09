import type { Action, DeferredAction, Store } from '//resources/js/store.js';
import type { PolymerElement } from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';
/**
 * @fileoverview defines a helper function `makeStoreClientMixin` to create a
 * Polymer mixin that binds Polymer elements to a specific instance of `Store`.
 * The mixin provides utility functions for Polymer elements to dispatch actions
 * that change state, and to react to Store state changes.
 */
/**
 * A callback function that runs when the store state has been updated.
 * Returning `undefined` will skip updating the local property.
 * @see StoreClientInterface.watch
 */
export interface ValueGetter<S, V> {
    (state: S): V | undefined;
}
export interface StoreClientInterface<S, A extends Action> {
    /**
     * Helper to dispatch an action to the store, which will update the store data
     * and then (possibly) flow through to the UI.
     */
    dispatch(action: A | null): void;
    /**
     * Helper to dispatch an asynchronous action to the store.
     * TODO(b/296440261) remove `dispatchAsync` in favor of promises.
     */
    dispatchAsync(action: DeferredAction<A>): void;
    onStateChanged(state: S): void;
    /**
     * Call this when the element is connected and has called `watch` for its
     * properties. This will populate the element with the initial
     * data from the store if the store has been initialized.
     */
    updateFromStore(): void;
    /**
     * Watches a particular part of the state tree, updating `localProperty` to
     * the return value of `valueGetter` whenever the state changes.
     *
     * Note that object identity is used to determine if the value has changed
     * before updating, rather than deep equality. If the getter function
     * returns `undefined`, no changes will be propagated.
     */
    watch<V>(localProperty: string, valueGetter: ValueGetter<S, V>): void;
    getState(): S;
    getStore(): Store<S, A>;
}
type Constructor<T> = new (...args: any[]) => T;
/**
 * Create a store client mixin for the store instance returned by
 * `storeGetter()`. An app, such as Personalization App, will have one central
 * store to bind to. Example:
 *
 * class MyStore extends Store {
 *   static getInstance(): MyStore {
 *     ....
 *   }
 * }
 *
 * const MyStoreClientMixin = makeStoreClientMixin(MyStore.getInstance);
 *
 * const MyElement extends MyStoreClientMixin(PolymerElement) {
 *   ....
 * }
 */
export declare function makeStoreClientMixin<S, A extends Action>(storeGetter: () => Store<S, A>): <T extends Constructor<PolymerElement>>(superClass: T) => T & Constructor<StoreClientInterface<S, A>>;
export {};

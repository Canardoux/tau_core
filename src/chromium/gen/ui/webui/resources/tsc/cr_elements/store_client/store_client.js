// Copyright 2023 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { dedupingMixin } from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';
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
export function makeStoreClientMixin(storeGetter) {
    function storeClientMixin(superClass) {
        class StoreClientMixin extends superClass {
            constructor() {
                super(...arguments);
                this.propertyWatches_ = new Map();
            }
            connectedCallback() {
                super.connectedCallback();
                this.getStore().addObserver(this);
            }
            disconnectedCallback() {
                super.disconnectedCallback();
                this.getStore().removeObserver(this);
            }
            dispatch(action) {
                this.getStore().dispatch(action);
            }
            dispatchAsync(action) {
                this.getStore().dispatchAsync(action);
            }
            onStateChanged(state) {
                this.propertyWatches_.forEach((valueGetter, localProperty) => {
                    const oldValue = this.get(localProperty);
                    const newValue = valueGetter(state);
                    // Avoid poking Polymer unless something has actually changed.
                    // Reducers must return new objects rather than mutating existing
                    // objects, so any real changes will pass through correctly.
                    if (oldValue === newValue || newValue === undefined) {
                        return;
                    }
                    this.set(localProperty, newValue);
                });
            }
            updateFromStore() {
                // TODO(b/296282541) assert that store is initialized instead of
                // performing a runtime check.
                if (this.getStore().isInitialized()) {
                    this.onStateChanged(this.getStore().data);
                }
            }
            watch(localProperty, valueGetter) {
                if (this.propertyWatches_.has(localProperty)) {
                    console.warn(`Overwriting watch for property ${localProperty}`);
                }
                this.propertyWatches_.set(localProperty, valueGetter);
            }
            getState() {
                return this.getStore().data;
            }
            getStore() {
                return storeGetter();
            }
        }
        return StoreClientMixin;
    }
    return dedupingMixin(storeClientMixin);
}

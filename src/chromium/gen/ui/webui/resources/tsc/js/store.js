// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * A generic datastore for the state of a page, where the state is publicly
 * readable but can only be modified by dispatching an Action.
 * The Store should be extended by specifying S, the page state type
 * associated with the store.
 */
export class Store {
    data;
    reducer_;
    initialized_ = false;
    queuedActions_ = [];
    observers_ = new Set();
    batchMode_ = false;
    constructor(emptyState, reducer) {
        this.data = emptyState;
        this.reducer_ = reducer;
    }
    init(initialState) {
        this.data = initialState;
        this.queuedActions_.forEach((action) => {
            this.dispatchInternal_(action);
        });
        this.queuedActions_ = [];
        this.initialized_ = true;
        this.notifyObservers_(this.data);
    }
    isInitialized() {
        return this.initialized_;
    }
    addObserver(observer) {
        this.observers_.add(observer);
    }
    removeObserver(observer) {
        this.observers_.delete(observer);
    }
    hasObserver(observer) {
        return this.observers_.has(observer);
    }
    /**
     * Begin a batch update to store data, which will disable updates to the
     * UI until `endBatchUpdate` is called. This is useful when a single UI
     * operation is likely to cause many sequential model updates (eg, deleting
     * 100 bookmarks).
     */
    beginBatchUpdate() {
        this.batchMode_ = true;
    }
    /**
     * End a batch update to the store data, notifying the UI of any changes
     * which occurred while batch mode was enabled.
     */
    endBatchUpdate() {
        this.batchMode_ = false;
        this.notifyObservers_(this.data);
    }
    /**
     * Handles a 'deferred' action, which can asynchronously dispatch actions
     * to the Store in order to reach a new UI state. DeferredActions have the
     * form `dispatchAsync(function(dispatch) { ... })`). Inside that function,
     * the |dispatch| callback can be called asynchronously to dispatch Actions
     * directly to the Store.
     */
    dispatchAsync(action) {
        if (!this.initialized_) {
            this.queuedActions_.push(action);
            return;
        }
        this.dispatchInternal_(action);
    }
    /**
     * Transition to a new UI state based on the supplied |action|, and notify
     * observers of the change. If the Store has not yet been initialized, the
     * action will be queued and performed upon initialization.
     */
    dispatch(action) {
        this.dispatchAsync(function (dispatch) {
            dispatch(action);
        });
    }
    dispatchInternal_(action) {
        action(this.reduce.bind(this));
    }
    reduce(action) {
        if (!action) {
            return;
        }
        this.data = this.reducer_(this.data, action);
        // Batch notifications until after all initialization queuedActions are
        // resolved.
        if (this.isInitialized() && !this.batchMode_) {
            this.notifyObservers_(this.data);
        }
    }
    notifyObservers_(state) {
        this.observers_.forEach(function (o) {
            o.onStateChanged(state);
        });
    }
}

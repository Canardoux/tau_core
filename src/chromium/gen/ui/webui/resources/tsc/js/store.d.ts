/**
 * @fileoverview a base class and utility types for managing javascript WebUI
 * state in a redux-like fashion.
 */
export interface Action {
    name: string;
}
export type DeferredAction<A extends Action = Action> = (callback: (p: A | null) => void) => void;
export type Reducer<S, A extends Action = Action> = (state: S, action: A) => S;
export interface StoreObserver<S> {
    onStateChanged(newState: S): void;
}
/**
 * A generic datastore for the state of a page, where the state is publicly
 * readable but can only be modified by dispatching an Action.
 * The Store should be extended by specifying S, the page state type
 * associated with the store.
 */
export declare class Store<S, A extends Action = Action> {
    data: S;
    private reducer_;
    protected initialized_: boolean;
    private queuedActions_;
    private observers_;
    private batchMode_;
    constructor(emptyState: S, reducer: Reducer<S, A>);
    init(initialState: S): void;
    isInitialized(): boolean;
    addObserver(observer: StoreObserver<S>): void;
    removeObserver(observer: StoreObserver<S>): void;
    hasObserver(observer: StoreObserver<S>): boolean;
    /**
     * Begin a batch update to store data, which will disable updates to the
     * UI until `endBatchUpdate` is called. This is useful when a single UI
     * operation is likely to cause many sequential model updates (eg, deleting
     * 100 bookmarks).
     */
    beginBatchUpdate(): void;
    /**
     * End a batch update to the store data, notifying the UI of any changes
     * which occurred while batch mode was enabled.
     */
    endBatchUpdate(): void;
    /**
     * Handles a 'deferred' action, which can asynchronously dispatch actions
     * to the Store in order to reach a new UI state. DeferredActions have the
     * form `dispatchAsync(function(dispatch) { ... })`). Inside that function,
     * the |dispatch| callback can be called asynchronously to dispatch Actions
     * directly to the Store.
     */
    dispatchAsync(action: DeferredAction<A>): void;
    /**
     * Transition to a new UI state based on the supplied |action|, and notify
     * observers of the change. If the Store has not yet been initialized, the
     * action will be queued and performed upon initialization.
     */
    dispatch(action: A | null): void;
    private dispatchInternal_;
    protected reduce(action: A | null): void;
    protected notifyObservers_(state: S): void;
}

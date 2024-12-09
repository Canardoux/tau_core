/**
 * @return Whether a test module was loaded.
 *   - In case where a module was not specified, returns false (used for
 *     providing a way for UIs to wait for any test initialization, if run
 *     within the context of a test).
 *   - In case where loading failed (probably incorrect URL) a rejected Promise
 *     is returned.
 */
export declare function loadTestModule(): Promise<boolean>;
export declare function loadMochaAdapter(): Promise<boolean>;

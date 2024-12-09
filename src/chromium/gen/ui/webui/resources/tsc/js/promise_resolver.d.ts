/**
 * @fileoverview PromiseResolver is a helper class that allows creating a
 * Promise that will be fulfilled (resolved or rejected) some time later.
 *
 * Example:
 *  const resolver = new PromiseResolver();
 *  resolver.promise.then(function(result) {
 *    console.log('resolved with', result);
 *  });
 *  ...
 *  ...
 *  resolver.resolve({hello: 'world'});
 */
export declare class PromiseResolver<T> {
    private resolve_;
    private reject_;
    private isFulfilled_;
    private promise_;
    constructor();
    /** Whether this resolver has been resolved or rejected. */
    get isFulfilled(): boolean;
    get promise(): Promise<T>;
    get resolve(): ((arg: T) => void);
    get reject(): ((arg?: any) => void);
}

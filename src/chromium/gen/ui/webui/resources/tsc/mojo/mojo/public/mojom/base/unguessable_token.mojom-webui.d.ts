import { mojo } from '//resources/mojo/mojo/public/js/bindings.js';
export declare const UnguessableTokenSpec: {
    $: mojo.internal.MojomType;
};
export interface UnguessableTokenMojoType {
    high: bigint;
    low: bigint;
}
export type UnguessableToken = UnguessableTokenMojoType;

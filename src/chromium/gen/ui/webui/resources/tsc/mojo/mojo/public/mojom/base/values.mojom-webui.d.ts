import { mojo } from '//resources/mojo/mojo/public/js/bindings.js';
export declare const DictionaryValueSpec: {
    $: mojo.internal.MojomType;
};
export declare const ListValueSpec: {
    $: mojo.internal.MojomType;
};
export declare const ValueSpec: {
    $: mojo.internal.MojomType;
};
export interface DictionaryValueMojoType {
    storage: {
        [key: string]: Value;
    };
}
export type DictionaryValue = DictionaryValueMojoType;
export interface ListValueMojoType {
    storage: Value[];
}
export type ListValue = ListValueMojoType;
export interface Value {
    nullValue?: number;
    boolValue?: boolean;
    intValue?: number;
    doubleValue?: number;
    stringValue?: string;
    binaryValue?: number[];
    dictionaryValue?: DictionaryValue;
    listValue?: ListValue;
}

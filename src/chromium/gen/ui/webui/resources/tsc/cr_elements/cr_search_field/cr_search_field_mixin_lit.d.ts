import type { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { CrInputElement } from '../cr_input/cr_input.js';
type Constructor<T> = new (...args: any[]) => T;
export declare const CrSearchFieldMixinLit: <T extends Constructor<CrLitElement>>(superClass: T) => T & Constructor<CrSearchFieldMixinLitInterface>;
export interface CrSearchFieldMixinLitInterface {
    label: string;
    clearLabel: string;
    hasSearchText: boolean;
    getSearchInput(): HTMLInputElement | CrInputElement;
    getValue(): string;
    setValue(value: string, noEvent?: boolean): void;
    onSearchTermSearch(): void;
    onSearchTermInput(): void;
}
export {};

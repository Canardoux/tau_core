import type { PolymerElement } from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';
import type { CrInputElement } from '../cr_input/cr_input.js';
type Constructor<T> = new (...args: any[]) => T;
export declare const CrSearchFieldMixin: <T extends Constructor<PolymerElement>>(superClass: T) => T & Constructor<CrSearchFieldMixinInterface>;
export interface CrSearchFieldMixinInterface {
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

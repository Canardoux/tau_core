import type { CrIconsetElement } from './cr_iconset.js';
export declare class IconsetMap extends EventTarget {
    private iconsets_;
    static getInstance(): IconsetMap;
    static resetInstanceForTesting(instance: IconsetMap): void;
    get(id: string): CrIconsetElement | null;
    set(id: string, iconset: CrIconsetElement): void;
}

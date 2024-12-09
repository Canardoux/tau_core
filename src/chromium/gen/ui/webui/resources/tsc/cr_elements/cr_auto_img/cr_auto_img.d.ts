export declare class CrAutoImgElement extends HTMLImageElement {
    static get observedAttributes(): string[];
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
    set autoSrc(src: string);
    get autoSrc(): string;
    set clearSrc(_: string);
    get clearSrc(): string;
    set isGooglePhotos(enabled: boolean);
    get isGooglePhotos(): boolean;
    set staticEncode(enabled: boolean);
    get staticEncode(): boolean;
    set encodeType(type: string);
    get encodeType(): string;
}

import { LitElement, PropertyValues } from 'lit/index.js';
type ElementCache = Record<string, HTMLElement | SVGElement>;
export declare class CrLitElement extends LitElement {
    $: ElementCache;
    private willUpdatePending_;
    private static notifyProps_;
    constructor();
    ensureInitialRender(): void;
    connectedCallback(): void;
    willUpdate(_changedProperties: PropertyValues<this>): void;
    updated(changedProperties: PropertyValues<this>): void;
    focus(options?: {
        preventScroll?: boolean;
        focusVisible?: boolean;
    }): void;
    fire(eventName: string, detail?: any): void;
    private static patchPropertiesObject;
    private static populateNotifyProps;
    protected static finalize(): void;
}
export {};

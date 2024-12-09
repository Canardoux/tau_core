import { PolymerElement } from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';
export declare class CrLazyRenderElement<T extends HTMLElement> extends PolymerElement {
    static get is(): string;
    static get template(): HTMLTemplateElement;
    private child_;
    private instance_;
    /**
     * Stamp the template into the DOM tree synchronously
     * @return Child element which has been stamped into the DOM tree.
     */
    get(): T;
    /**
     * @return The element contained in the template, if it has
     *   already been stamped.
     */
    getIfExists(): (T | null);
    private render_;
    _forwardHostPropV2(prop: string, value: object): void;
}

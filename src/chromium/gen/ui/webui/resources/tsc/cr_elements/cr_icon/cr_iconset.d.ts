import type { PropertyValues } from '//resources/lit/v3_0/lit.rollup.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
export interface CrIconsetElement {
    $: {
        baseSvg: SVGElement;
    };
}
export declare class CrIconsetElement extends CrLitElement {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        /**
         * The name of the iconset.
         */
        name: {
            type: StringConstructor;
        };
        /**
         * The size of an individual icon. Note that icons must be square.
         */
        size: {
            type: NumberConstructor;
        };
    };
    name: string;
    size: number;
    updated(changedProperties: PropertyValues<this>): void;
    /**
     * Applies an icon to the given element.
     *
     * An svg icon is prepended to the element's shadowRoot, which should always
     * exist.
     * @param element Element to which the icon is applied.
     * @param iconName Name of the icon to apply.
     * @return The svg element which renders the icon.
     */
    applyIcon(element: HTMLElement, iconName: string): SVGElement | null;
    /**
     * Produce installable clone of the SVG element matching `id` in this
     * iconset, or null if there is no matching element.
     * @param iconName Name of the icon to apply.
     */
    createIcon(iconName: string): SVGElement | null;
    /**
     * Remove an icon from the given element by undoing the changes effected
     * by `applyIcon`.
     */
    removeIcon(element: HTMLElement): void;
    /**
     * Produce installable clone of the SVG element matching `id` in this
     * iconset, or `undefined` if there is no matching element.
     *
     * Returns an installable clone of the SVG element matching `id` or null if
     * no such element exists.
     */
    private cloneIcon_;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-iconset': CrIconsetElement;
    }
}

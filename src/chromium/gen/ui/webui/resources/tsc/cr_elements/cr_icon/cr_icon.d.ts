import type { PropertyValues } from '//resources/lit/v3_0/lit.rollup.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
export declare class CrIconElement extends CrLitElement {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    static get properties(): {
        /**
         * The name of the icon to use. The name should be of the form:
         * `iconset_name:icon_name`.
         */
        icon: {
            type: StringConstructor;
        };
    };
    icon: string;
    private iconsetName_;
    private iconName_;
    private iconset_;
    updated(changedProperties: PropertyValues<this>): void;
    private updateIcon_;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-icon': CrIconElement;
    }
}

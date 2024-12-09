import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { PropertyValues } from '//resources/lit/v3_0/lit.rollup.js';
export interface CrGridElement {
    $: {
        items: HTMLSlotElement;
    };
}
export declare class CrGridElement extends CrLitElement {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        columns: {
            type: NumberConstructor;
        };
        disableArrowNavigation: {
            type: BooleanConstructor;
        };
        focusSelector: {
            type: StringConstructor;
        };
        ignoreModifiedKeyEvents: {
            type: BooleanConstructor;
        };
    };
    columns: number;
    disableArrowNavigation: boolean;
    focusSelector?: string;
    ignoreModifiedKeyEvents: boolean;
    updated(changedProperties: PropertyValues<this>): void;
    private getSlottedParent_;
    protected onKeyDown_(e: KeyboardEvent): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-grid': CrGridElement;
    }
}

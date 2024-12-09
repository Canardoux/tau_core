/**
 * @fileoverview
 * 'cr-expand-button' is a chrome-specific wrapper around a button that toggles
 * between an opened (expanded) and closed state.
 */
import '../cr_icon_button/cr_icon_button.js';
import '../icons.html.js';
import type { PropertyValues } from '//resources/lit/v3_0/lit.rollup.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { CrIconButtonElement } from '../cr_icon_button/cr_icon_button.js';
export interface CrExpandButtonElement {
    $: {
        icon: CrIconButtonElement;
    };
}
export declare class CrExpandButtonElement extends CrLitElement {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        /**
         * If true, the button is in the expanded state and will show the icon
         * specified in the `collapseIcon` property. If false, the button shows
         * the icon specified in the `expandIcon` property.
         */
        expanded: {
            type: BooleanConstructor;
            notify: boolean;
        };
        /**
         * If true, the button will be disabled and grayed out.
         */
        disabled: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        /** A11y text descriptor for this control. */
        ariaLabel: {
            type: StringConstructor;
        };
        tabIndex: {
            type: NumberConstructor;
        };
        expandIcon: {
            type: StringConstructor;
        };
        collapseIcon: {
            type: StringConstructor;
        };
        expandTitle: {
            type: StringConstructor;
        };
        collapseTitle: {
            type: StringConstructor;
        };
    };
    expanded: boolean;
    disabled: boolean;
    expandIcon: string;
    collapseIcon: string;
    expandTitle?: string;
    collapseTitle?: string;
    tabIndex: number;
    firstUpdated(): void;
    willUpdate(changedProperties: PropertyValues<this>): void;
    updated(changedProperties: PropertyValues<this>): void;
    focus(): void;
    protected getIcon_(): string;
    protected getAriaExpanded_(): string;
    private onAriaLabelChange_;
    private toggleExpand_;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-expand-button': CrExpandButtonElement;
    }
}

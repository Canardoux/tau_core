/**
 * @fileoverview 'cr-checkbox' is a component similar to native checkbox. It
 * fires a 'change' event *only* when its state changes as a result of a user
 * interaction. By default it assumes there will be child(ren) passed in to be
 * used as labels. If no label will be provided, a .no-label class should be
 * added to hide the spacing between the checkbox and the label container.
 *
 * If a label is provided, it will be shown by default after the checkbox. A
 * .label-first CSS class can be added to show the label before the checkbox.
 *
 * List of customizable styles:
 *  --cr-checkbox-border-size
 *  --cr-checkbox-checked-box-background-color
 *  --cr-checkbox-checked-box-color
 *  --cr-checkbox-label-color
 *  --cr-checkbox-label-padding-start
 *  --cr-checkbox-mark-color
 *  --cr-checkbox-ripple-checked-color
 *  --cr-checkbox-ripple-size
 *  --cr-checkbox-ripple-unchecked-color
 *  --cr-checkbox-size
 *  --cr-checkbox-unchecked-box-color
 */
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { PropertyValues } from '//resources/lit/v3_0/lit.rollup.js';
declare const CrCheckboxElementBase: typeof CrLitElement & (new (...args: any[]) => import("../cr_ripple/cr_ripple_mixin.js").CrRippleMixinInterface);
export interface CrCheckboxElement {
    $: {
        checkbox: HTMLElement;
        labelContainer: HTMLElement;
    };
}
export declare class CrCheckboxElement extends CrCheckboxElementBase {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        checked: {
            type: BooleanConstructor;
            reflect: boolean;
            notify: boolean;
        };
        disabled: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        ariaDescription: {
            type: StringConstructor;
        };
        ariaLabelOverride: {
            type: StringConstructor;
        };
        tabIndex: {
            type: NumberConstructor;
        };
    };
    checked: boolean;
    disabled: boolean;
    ariaDescription: string | null;
    ariaLabelOverride?: string;
    tabIndex: number;
    firstUpdated(): void;
    willUpdate(changedProperties: PropertyValues<this>): void;
    updated(changedProperties: PropertyValues<this>): void;
    focus(): void;
    getFocusableElement(): HTMLElement;
    protected getAriaDisabled_(): string;
    protected getAriaChecked_(): string;
    private showRipple_;
    private hideRipple_;
    private onClick_;
    protected onKeyDown_(e: KeyboardEvent): void;
    protected onKeyUp_(e: KeyboardEvent): void;
    createRipple(): import("../cr_ripple/cr_ripple.js").CrRippleElement;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-checkbox': CrCheckboxElement;
    }
}
export {};

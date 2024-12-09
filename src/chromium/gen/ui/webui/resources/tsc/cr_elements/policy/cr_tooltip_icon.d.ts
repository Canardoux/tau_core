import '../icons.html.js';
import '../cr_icon/cr_icon.js';
import '../cr_tooltip/cr_tooltip.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
export interface CrTooltipIconElement {
    $: {
        indicator: HTMLElement;
    };
}
export declare class CrTooltipIconElement extends CrLitElement {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        iconAriaLabel: {
            type: StringConstructor;
        };
        iconClass: {
            type: StringConstructor;
        };
        tooltipText: {
            type: StringConstructor;
        };
        /** Position of tooltip popup related to the icon. */
        tooltipPosition: {
            type: StringConstructor;
        };
    };
    iconAriaLabel: string;
    iconClass: string;
    tooltipText: string;
    tooltipPosition: string;
    getFocusableElement(): HTMLElement;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-tooltip-icon': CrTooltipIconElement;
    }
}

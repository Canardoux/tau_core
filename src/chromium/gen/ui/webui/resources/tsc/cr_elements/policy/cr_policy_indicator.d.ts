/** @fileoverview Lit element for indicating policies by type. */
import './cr_tooltip_icon.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import { CrPolicyIndicatorType } from './cr_policy_types.js';
export declare class CrPolicyIndicatorElement extends CrLitElement {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        iconAriaLabel: {
            type: StringConstructor;
        };
        /**
         * Which indicator type to show (or NONE).
         */
        indicatorType: {
            type: StringConstructor;
        };
        /**
         * The name associated with the policy source. See
         * chrome.settingsPrivate.PrefObject.controlledByName.
         */
        indicatorSourceName: {
            type: StringConstructor;
        };
    };
    iconAriaLabel: string;
    indicatorType: CrPolicyIndicatorType;
    indicatorSourceName: string;
    /**
     * @return True if the indicator should be shown.
     */
    protected getIndicatorVisible_(): boolean;
    /**
     * @return The iron-icon icon name.
     */
    protected getIndicatorIcon_(): string;
    /**
     * @param indicatorSourceName The name associated with the indicator.
     *     See chrome.settingsPrivate.PrefObject.controlledByName
     * @return The tooltip text for |type|.
     */
    protected getIndicatorTooltip_(): string;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-policy-indicator': CrPolicyIndicatorElement;
    }
}

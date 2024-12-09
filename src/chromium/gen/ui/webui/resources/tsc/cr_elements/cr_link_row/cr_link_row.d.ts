/**
 * @fileoverview
 * A link row is a UI element similar to a button, though usually wider than a
 * button (taking up the whole 'row'). The name link comes from the intended use
 * of this element to take the user to another page in the app or to an external
 * page (somewhat like an HTML link).
 */
import '../cr_icon_button/cr_icon_button.js';
import '../cr_icon/cr_icon.js';
import '../icons.html.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { CrIconButtonElement } from '../cr_icon_button/cr_icon_button.js';
export interface CrLinkRowElement {
    $: {
        icon: CrIconButtonElement;
        buttonAriaDescription: HTMLElement;
    };
}
export declare class CrLinkRowElement extends CrLitElement {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        ariaShowLabel: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        ariaShowSublabel: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        startIcon: {
            type: StringConstructor;
        };
        label: {
            type: StringConstructor;
        };
        subLabel: {
            type: StringConstructor;
        };
        disabled: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        external: {
            type: BooleanConstructor;
        };
        usingSlottedLabel: {
            type: BooleanConstructor;
        };
        roleDescription: {
            type: StringConstructor;
        };
        buttonAriaDescription: {
            type: StringConstructor;
        };
    };
    ariaShowLabel: boolean;
    ariaShowSublabel: boolean;
    startIcon: string;
    label: string;
    subLabel: string;
    disabled: boolean;
    external: boolean;
    usingSlottedLabel: boolean;
    roleDescription?: string;
    buttonAriaDescription?: string;
    focus(): void;
    protected shouldHideLabelWrapper_(): boolean;
    protected getIcon_(): string;
    protected getButtonAriaDescription_(): string;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-link-row': CrLinkRowElement;
    }
}

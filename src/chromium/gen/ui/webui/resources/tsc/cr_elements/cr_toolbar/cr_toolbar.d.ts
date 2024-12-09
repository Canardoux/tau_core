import '../cr_icon_button/cr_icon_button.js';
import '../icons.html.js';
import './cr_toolbar_search_field.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { PropertyValues } from '//resources/lit/v3_0/lit.rollup.js';
import type { CrToolbarSearchFieldElement } from './cr_toolbar_search_field.js';
export interface CrToolbarElement {
    $: {
        search: CrToolbarSearchFieldElement;
    };
}
export declare class CrToolbarElement extends CrLitElement {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        pageName: {
            type: StringConstructor;
        };
        searchPrompt: {
            type: StringConstructor;
        };
        clearLabel: {
            type: StringConstructor;
        };
        menuLabel: {
            type: StringConstructor;
        };
        spinnerActive: {
            type: BooleanConstructor;
        };
        showMenu: {
            type: BooleanConstructor;
        };
        showSearch: {
            type: BooleanConstructor;
        };
        autofocus: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        narrow: {
            type: BooleanConstructor;
            reflect: boolean;
            notify: boolean;
        };
        /**
         * The threshold at which the toolbar will change from normal to narrow
         * mode, in px.
         */
        narrowThreshold: {
            type: NumberConstructor;
        };
        alwaysShowLogo: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        showingSearch_: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        searchIconOverride: {
            type: StringConstructor;
        };
        searchInputAriaDescription: {
            type: StringConstructor;
        };
    };
    pageName: string;
    searchPrompt: string;
    clearLabel: string;
    menuLabel?: string;
    spinnerActive: boolean;
    showMenu: boolean;
    showSearch: boolean;
    autofocus: boolean;
    narrow: boolean;
    narrowThreshold: number;
    alwaysShowLogo: boolean;
    protected showingSearch_: boolean;
    searchIconOverride?: string;
    searchInputAriaDescription: string;
    private narrowQuery_;
    willUpdate(changedProperties: PropertyValues<this>): void;
    getSearchField(): CrToolbarSearchFieldElement;
    protected onMenuClick_(): void;
    focusMenuButton(): Promise<void>;
    isMenuFocused(): boolean;
    protected onShowingSearchChanged_(e: CustomEvent<{
        value: boolean;
    }>): void;
    private onQueryChanged_;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-toolbar': CrToolbarElement;
    }
}

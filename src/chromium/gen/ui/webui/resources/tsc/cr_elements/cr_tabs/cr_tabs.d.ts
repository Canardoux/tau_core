/**
 * @fileoverview 'cr-tabs' is a control used for selecting different sections or
 * tabs. cr-tabs was created to replace paper-tabs and paper-tab. cr-tabs
 * displays the name of each tab provided by |tabs|. A 'selected-changed' event
 * is fired any time |selected| is changed.
 *
 * cr-tabs takes its #selectionBar animation from paper-tabs.
 *
 * Keyboard behavior
 *   - Home, End, ArrowLeft and ArrowRight changes the tab selection
 *
 * Known limitations
 *   - no "disabled" state for the cr-tabs as a whole or individual tabs
 *   - cr-tabs does not accept any <slot> (not necessary as of this writing)
 *   - no horizontal scrolling, it is assumed that tabs always fit in the
 *     available space
 */
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { PropertyValues } from '//resources/lit/v3_0/lit.rollup.js';
export declare const NONE_SELECTED: number;
export declare class CrTabsElement extends CrLitElement {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        tabIcons: {
            type: ArrayConstructor;
        };
        tabNames: {
            type: ArrayConstructor;
        };
        /** Index of the selected tab. */
        selected: {
            type: NumberConstructor;
            notify: boolean;
        };
    };
    tabIcons: string[];
    tabNames: string[];
    selected: number;
    private isRtl_;
    connectedCallback(): void;
    firstUpdated(): void;
    updated(changedProperties: PropertyValues<this>): void;
    protected getAriaSelected_(index: number): string;
    protected getIconStyle_(index: number): string;
    protected getTabindex_(index: number): string;
    protected getSelectedClass_(index: number): string;
    private onSelectedChanged_;
    private onKeyDown_;
    private onIndicatorTransitionEnd_;
    protected onTabClick_(e: Event): void;
    private updateIndicator_;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-tabs': CrTabsElement;
    }
}

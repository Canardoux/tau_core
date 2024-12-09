/**
 * @fileoverview 'cr-textarea' is a component similar to native textarea,
 * and inherits styling from cr-input.
 */
import type { PropertyValues } from '//resources/lit/v3_0/lit.rollup.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
export interface CrTextareaElement {
    $: {
        firstFooter: HTMLElement;
        footerContainer: HTMLElement;
        input: HTMLTextAreaElement;
        label: HTMLElement;
        mirror: HTMLElement;
        secondFooter: HTMLElement;
        underline: HTMLElement;
    };
}
export declare class CrTextareaElement extends CrLitElement {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        /**
         * Whether the text area should automatically get focus when the page
         * loads.
         */
        autofocus: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        /**
         * Whether the text area is disabled. When disabled, the text area loses
         * focus and is not reachable by tabbing.
         */
        disabled: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        /** Whether the text area is required. */
        required: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        /** Maximum length (in characters) of the text area. */
        maxlength: {
            type: NumberConstructor;
        };
        /**
         * Whether the text area is read only. If read-only, content cannot be
         * changed.
         */
        readonly: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        /** Number of rows (lines) of the text area. */
        rows: {
            type: NumberConstructor;
            reflect: boolean;
        };
        /** Caption of the text area. */
        label: {
            type: StringConstructor;
        };
        /**
         * Text inside the text area. If the text exceeds the bounds of the text
         * area, i.e. if it has more than |rows| lines, a scrollbar is shown by
         * default when autogrow is not set.
         */
        value: {
            type: StringConstructor;
            notify: boolean;
        };
        internalValue_: {
            type: StringConstructor;
            state: boolean;
        };
        /**
         * Placeholder text that is shown when no value is present.
         */
        placeholder: {
            type: StringConstructor;
        };
        /** Whether the textarea can auto-grow vertically or not. */
        autogrow: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        /**
         * Attribute to enable limiting the maximum height of a autogrow textarea.
         * Use --cr-textarea-autogrow-max-height to set the height.
         */
        hasMaxHeight: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        /** Whether the textarea is invalid or not. */
        invalid: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        /**
         * First footer text below the text area. Can be used to warn user about
         * character limits.
         */
        firstFooter: {
            type: StringConstructor;
        };
        /**
         * Second footer text below the text area. Can be used to show current
         * character count.
         */
        secondFooter: {
            type: StringConstructor;
        };
    };
    autofocus: boolean;
    disabled: boolean;
    readonly: boolean;
    required: boolean;
    rows: number;
    label: string;
    maxlength?: number;
    value: string;
    placeholder: string;
    autogrow: boolean;
    hasMaxHeight: boolean;
    invalid: boolean;
    firstFooter: string;
    secondFooter: string;
    protected internalValue_: string;
    willUpdate(changedProperties: PropertyValues<this>): void;
    updated(changedProperties: PropertyValues<this>): void;
    focusInput(): void;
    /**
     * 'change' event fires when <input> value changes and user presses 'Enter'.
     * This function helps propagate it to host since change events don't
     * propagate across Shadow DOM boundary by default.
     */
    protected onInputChange_(e: Event): Promise<void>;
    protected calculateMirror_(): string;
    protected onInput_(e: Event): void;
    protected onInputFocusChange_(): void;
    protected getFooterAria_(): string;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-textarea': CrTextareaElement;
    }
}

/** @fileoverview Element which shows toasts with optional undo button. */
import './cr_toast.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { CrToastElement } from './cr_toast.js';
export declare function getToastManager(): CrToastManagerElement;
export interface CrToastManagerElement {
    $: {
        content: HTMLElement;
        slotted: HTMLSlotElement;
        toast: CrToastElement;
    };
}
export declare class CrToastManagerElement extends CrLitElement {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        duration: {
            type: NumberConstructor;
        };
    };
    duration: number;
    get isToastOpen(): boolean;
    get slottedHidden(): boolean;
    connectedCallback(): void;
    disconnectedCallback(): void;
    /**
     * @param label The label to display inside the toast.
     */
    show(label: string, hideSlotted?: boolean): void;
    /**
     * Shows the toast, making certain text fragments collapsible.
     */
    showForStringPieces(pieces: Array<{
        value: string;
        collapsible: boolean;
    }>, hideSlotted?: boolean): void;
    private showInternal_;
    hide(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-toast-manager': CrToastManagerElement;
    }
}

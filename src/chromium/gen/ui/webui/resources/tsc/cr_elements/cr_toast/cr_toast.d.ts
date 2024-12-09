/**
 * @fileoverview A lightweight toast.
 */
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { PropertyValues } from '//resources/lit/v3_0/lit.rollup.js';
export declare class CrToastElement extends CrLitElement {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        duration: {
            type: NumberConstructor;
        };
        open: {
            type: BooleanConstructor;
            reflect: boolean;
        };
    };
    duration: number;
    open: boolean;
    private hideTimeoutId_;
    willUpdate(changedProperties: PropertyValues<this>): void;
    /**
     * Cancels existing auto-hide, and sets up new auto-hide.
     */
    private resetAutoHide_;
    /**
     * Shows the toast and auto-hides after |this.duration| milliseconds has
     * passed. If the toast is currently being shown, any preexisting auto-hide
     * is cancelled and replaced with a new auto-hide.
     */
    show(): Promise<void>;
    /**
     * Hides the toast and ensures that screen readers cannot its contents while
     * hidden.
     */
    hide(): Promise<void>;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-toast': CrToastElement;
    }
}

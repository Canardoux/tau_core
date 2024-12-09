import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { PropertyValues } from '//resources/lit/v3_0/lit.rollup.js';
export declare class CrRippleElement extends CrLitElement {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    static get properties(): {
        holdDown: {
            type: BooleanConstructor;
        };
        recenters: {
            type: BooleanConstructor;
        };
        noink: {
            type: BooleanConstructor;
        };
    };
    holdDown: boolean;
    recenters: boolean;
    noink: boolean;
    private ripples_;
    private eventTracker_;
    connectedCallback(): void;
    disconnectedCallback(): void;
    updated(changedProperties: PropertyValues<this>): void;
    uiDownAction(e?: PointerEvent): boolean;
    private downAction_;
    clear(): void;
    showAndHoldDown(): void;
    private showRipple_;
    uiUpAction(e?: PointerEvent): void;
    private upAction_;
    private hideRipple_;
    private onEnterKeydown_;
    private onSpaceKeydown_;
    private onSpaceKeyup_;
    private holdDownChanged_;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-ripple': CrRippleElement;
    }
}

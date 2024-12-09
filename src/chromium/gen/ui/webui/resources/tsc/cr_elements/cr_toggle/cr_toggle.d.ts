/**
 * Number of pixels required to move to consider the pointermove event as
 * intentional.
 */
export declare const MOVE_THRESHOLD_PX: number;
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { PropertyValues } from '//resources/lit/v3_0/lit.rollup.js';
declare const CrToggleElementBase: typeof CrLitElement & (new (...args: any[]) => import("../cr_ripple/cr_ripple_mixin.js").CrRippleMixinInterface);
export interface CrToggleElement {
    $: {
        knob: HTMLElement;
    };
}
export declare class CrToggleElement extends CrToggleElementBase {
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
    };
    checked: boolean;
    disabled: boolean;
    private boundPointerMove_;
    /**
     * Whether the state of the toggle has already taken into account by
     * |pointeremove| handlers. Used in the 'click' handler.
     */
    private handledInPointerMove_;
    private pointerDownX_;
    firstUpdated(): void;
    connectedCallback(): void;
    updated(changedProperties: PropertyValues<this>): void;
    private hideRipple_;
    private onPointerUp_;
    private onPointerDown_;
    private onClick_;
    private toggleState_;
    private onKeyDown_;
    private onKeyUp_;
    createRipple(): import("../cr_ripple/cr_ripple.js").CrRippleElement;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-toggle': CrToggleElement;
    }
}
export {};

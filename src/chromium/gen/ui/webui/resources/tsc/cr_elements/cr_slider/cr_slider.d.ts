import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { PropertyValues } from '//resources/lit/v3_0/lit.rollup.js';
/**
 * The |value| is the corresponding value that the current slider tick is
 * associated with. The string |label| is shown in the UI as the label for the
 * current slider value. The |ariaValue| number is used for aria-valuemin,
 * aria-valuemax, and aria-valuenow, and is optional. If missing, |value| will
 * be used instead.
 */
export interface SliderTick {
    value: number;
    label: string;
    ariaValue?: number;
}
declare const CrSliderElementBase: typeof CrLitElement & (new (...args: any[]) => import("../cr_ripple/cr_ripple_mixin.js").CrRippleMixinInterface);
/**
 * The following are the events emitted from cr-slider.
 *
 * cr-slider-value-changed: fired when updating slider via the UI.
 * dragging-changed: fired on pointer down and on pointer up.
 */
export interface CrSliderElement {
    $: {
        bar: HTMLElement;
        container: HTMLElement;
        knobAndLabel: HTMLElement;
        knob: HTMLElement;
    };
}
export declare class CrSliderElement extends CrSliderElementBase {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        disabled: {
            type: BooleanConstructor;
        };
        /**
         * Internal representation of disabled depending on |disabled| and
         * |ticks|.
         */
        disabled_: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        dragging: {
            type: BooleanConstructor;
            notify: boolean;
        };
        updatingFromKey: {
            type: BooleanConstructor;
            notify: boolean;
        };
        /**
         * The amount the slider value increments by when pressing any of the keys
         * from `deltaKeyMap_`. Defaults to 1.
         */
        keyPressSliderIncrement: {
            type: NumberConstructor;
        };
        markerCount: {
            type: NumberConstructor;
        };
        max: {
            type: NumberConstructor;
        };
        min: {
            type: NumberConstructor;
        };
        /**
         * When set to false, the keybindings are not handled by this component,
         * for example when the owner of the component wants to set up its own
         * keybindings.
         */
        noKeybindings: {
            type: BooleanConstructor;
        };
        snaps: {
            type: BooleanConstructor;
        };
        /**
         * The data associated with each tick on the slider. Each element in the
         * array contains a value and the label corresponding to that value.
         */
        ticks: {
            type: ArrayConstructor;
        };
        value: {
            type: NumberConstructor;
        };
        label_: {
            type: StringConstructor;
            state: boolean;
        };
        showLabel_: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        /**
         * |transiting_| is set to true when bar is touched or clicked. This
         * triggers a single position transition effect to take place for the
         * knob, bar and label. When the transition is complete, |transiting_| is
         * set to false resulting in no transition effect during dragging, manual
         * value updates and keyboard events.
         */
        transiting_: {
            type: BooleanConstructor;
            reflect: boolean;
        };
    };
    disabled: boolean;
    dragging: boolean;
    updatingFromKey: boolean;
    keyPressSliderIncrement: number;
    markerCount: number;
    max: number;
    min: number;
    noKeybindings: boolean;
    snaps: boolean;
    ticks: SliderTick[] | number[];
    value: number;
    protected disabled_: boolean;
    protected label_: string;
    protected showLabel_: boolean;
    protected transiting_: boolean;
    private deltaKeyMap_;
    private draggingEventTracker_;
    firstUpdated(): void;
    connectedCallback(): void;
    willUpdate(changedProperties: PropertyValues<this>): void;
    updated(changedProperties: PropertyValues<this>): void;
    /**
     * When markers are displayed on the slider, they are evenly spaced across
     * the entire slider bar container and are rendered on top of the bar and
     * bar container. The location of the marks correspond to the discrete
     * values that the slider can have.
     */
    protected getMarkers_(): number[];
    protected getMarkerClass_(index: number): string;
    /**
     * The ratio is a value from 0 to 1.0 corresponding to a location along the
     * slider bar where 0 is the minimum value and 1.0 is the maximum value.
     * This is a helper function used to calculate the bar width, knob location
     * and label location.
     */
    getRatio(): number;
    /**
     * Removes all event listeners related to dragging, and cancels ripple.
     */
    private stopDragging_;
    private hideRipple_;
    private showRipple_;
    private onKeyDown_;
    private onKeyUp_;
    /**
     * When the left-mouse button is pressed, the knob location is updated and
     * dragging starts.
     */
    private onPointerDown_;
    protected onTransitionEnd_(): void;
    private updateUi_;
    private updateValue_;
    private isRtl_;
    private updateValueFromClientX_;
    private onKeyPressSliderIncrementChanged_;
    createRipple(): import("../cr_ripple/cr_ripple.js").CrRippleElement;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-slider': CrSliderElement;
    }
}
export {};

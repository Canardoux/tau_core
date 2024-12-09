// Copyright 2018 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview 'cr-slider' is a slider component used to select a number from
 * a continuous or discrete range of numbers.
 */
import { assert } from '//resources/js/assert.js';
import { EventTracker } from '//resources/js/event_tracker.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import { CrRippleMixin } from '../cr_ripple/cr_ripple_mixin.js';
import { getCss } from './cr_slider.css.js';
import { getHtml } from './cr_slider.html.js';
function clamp(min, max, value) {
    return Math.min(max, Math.max(min, value));
}
function getAriaValue(tick) {
    if (Number.isFinite(tick)) {
        return tick;
    }
    const sliderTick = tick;
    return sliderTick.ariaValue !== undefined ? sliderTick.ariaValue :
        sliderTick.value;
}
const CrSliderElementBase = CrRippleMixin(CrLitElement);
export class CrSliderElement extends CrSliderElementBase {
    constructor() {
        super(...arguments);
        this.disabled = false;
        this.dragging = false;
        this.updatingFromKey = false;
        this.keyPressSliderIncrement = 1;
        this.markerCount = 0;
        this.max = 100;
        this.min = 0;
        this.noKeybindings = false;
        this.snaps = false;
        this.ticks = [];
        this.value = 0;
        this.disabled_ = false;
        this.label_ = '';
        this.showLabel_ = false;
        this.transiting_ = false;
        this.deltaKeyMap_ = null;
        this.draggingEventTracker_ = null;
    }
    static get is() {
        return 'cr-slider';
    }
    static get styles() {
        return getCss();
    }
    render() {
        return getHtml.bind(this)();
    }
    static get properties() {
        return {
            disabled: {
                type: Boolean,
            },
            /**
             * Internal representation of disabled depending on |disabled| and
             * |ticks|.
             */
            disabled_: {
                type: Boolean,
                reflect: true,
            },
            dragging: {
                type: Boolean,
                notify: true,
            },
            updatingFromKey: {
                type: Boolean,
                notify: true,
            },
            /**
             * The amount the slider value increments by when pressing any of the keys
             * from `deltaKeyMap_`. Defaults to 1.
             */
            keyPressSliderIncrement: {
                type: Number,
            },
            markerCount: {
                type: Number,
            },
            max: {
                type: Number,
            },
            min: {
                type: Number,
            },
            /**
             * When set to false, the keybindings are not handled by this component,
             * for example when the owner of the component wants to set up its own
             * keybindings.
             */
            noKeybindings: {
                type: Boolean,
            },
            snaps: {
                type: Boolean,
            },
            /**
             * The data associated with each tick on the slider. Each element in the
             * array contains a value and the label corresponding to that value.
             */
            ticks: {
                type: Array,
            },
            value: {
                type: Number,
            },
            label_: {
                type: String,
                state: true,
            },
            showLabel_: {
                type: Boolean,
                reflect: true,
            },
            /**
             * |transiting_| is set to true when bar is touched or clicked. This
             * triggers a single position transition effect to take place for the
             * knob, bar and label. When the transition is complete, |transiting_| is
             * set to false resulting in no transition effect during dragging, manual
             * value updates and keyboard events.
             */
            transiting_: {
                type: Boolean,
                reflect: true,
            },
        };
    }
    firstUpdated() {
        this.setAttribute('role', 'slider');
        this.addEventListener('blur', this.hideRipple_);
        this.addEventListener('focus', this.showRipple_);
        this.addEventListener('keydown', this.onKeyDown_);
        this.addEventListener('keyup', this.onKeyUp_);
        this.addEventListener('pointerdown', this.onPointerDown_.bind(this));
    }
    connectedCallback() {
        super.connectedCallback();
        this.draggingEventTracker_ = new EventTracker();
    }
    willUpdate(changedProperties) {
        super.willUpdate(changedProperties);
        if (changedProperties.has('keyPressSliderIncrement')) {
            this.onKeyPressSliderIncrementChanged_();
        }
        if (changedProperties.has('value') || changedProperties.has('min') ||
            changedProperties.has('max')) {
            if (this.value !== undefined) {
                this.updateValue_(this.value);
            }
        }
        if (changedProperties.has('disabled') || changedProperties.has('ticks')) {
            this.disabled_ = this.disabled || this.ticks.length === 1;
        }
        if (changedProperties.has('ticks')) {
            if (this.ticks.length > 1) {
                this.snaps = true;
                this.max = this.ticks.length - 1;
                this.min = 0;
            }
        }
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has('disabled_')) {
            this.setAttribute('tabindex', this.disabled_ ? '-1' : '0');
            this.blur();
        }
        if (changedProperties.has('ticks')) {
            if (this.value !== undefined) {
                this.updateValue_(this.value);
            }
        }
        if (changedProperties.has('value') || changedProperties.has('min') ||
            changedProperties.has('max') || changedProperties.has('ticks')) {
            this.updateUi_();
        }
    }
    /**
     * When markers are displayed on the slider, they are evenly spaced across
     * the entire slider bar container and are rendered on top of the bar and
     * bar container. The location of the marks correspond to the discrete
     * values that the slider can have.
     */
    getMarkers_() {
        const array = Array.from({ length: Math.max(0, this.markerCount - 1) });
        // Fill with dummy data so that Array#map() actually works in the template.
        array.fill(0);
        return array;
    }
    getMarkerClass_(index) {
        const currentStep = (this.markerCount - 1) * this.getRatio();
        return index < currentStep ? 'active-marker' : 'inactive-marker';
    }
    /**
     * The ratio is a value from 0 to 1.0 corresponding to a location along the
     * slider bar where 0 is the minimum value and 1.0 is the maximum value.
     * This is a helper function used to calculate the bar width, knob location
     * and label location.
     */
    getRatio() {
        return (this.value - this.min) / (this.max - this.min);
    }
    /**
     * Removes all event listeners related to dragging, and cancels ripple.
     */
    stopDragging_(pointerId) {
        this.draggingEventTracker_.removeAll();
        this.releasePointerCapture(pointerId);
        this.dragging = false;
        this.hideRipple_();
    }
    hideRipple_() {
        if (this.noink) {
            return;
        }
        this.getRipple().clear();
        this.showLabel_ = false;
    }
    showRipple_() {
        if (this.noink) {
            return;
        }
        if (!this.getRipple().holdDown) {
            this.getRipple().showAndHoldDown();
        }
        this.showLabel_ = true;
    }
    onKeyDown_(event) {
        if (this.disabled_ || this.noKeybindings) {
            return;
        }
        if (event.metaKey || event.shiftKey || event.altKey || event.ctrlKey) {
            return;
        }
        let newValue;
        if (event.key === 'Home') {
            newValue = this.min;
        }
        else if (event.key === 'End') {
            newValue = this.max;
        }
        else if (this.deltaKeyMap_.has(event.key)) {
            newValue = this.value + this.deltaKeyMap_.get(event.key);
        }
        if (newValue === undefined) {
            return;
        }
        this.updatingFromKey = true;
        if (this.updateValue_(newValue)) {
            this.fire('cr-slider-value-changed');
        }
        event.preventDefault();
        event.stopPropagation();
        this.showRipple_();
    }
    onKeyUp_(event) {
        if (event.key === 'Home' || event.key === 'End' ||
            this.deltaKeyMap_.has(event.key)) {
            setTimeout(() => {
                this.updatingFromKey = false;
            });
        }
    }
    /**
     * When the left-mouse button is pressed, the knob location is updated and
     * dragging starts.
     */
    onPointerDown_(event) {
        if (this.disabled_ ||
            event.buttons !== 1 && event.pointerType === 'mouse') {
            return;
        }
        this.dragging = true;
        this.transiting_ = true;
        this.updateValueFromClientX_(event.clientX);
        this.showRipple_();
        this.setPointerCapture(event.pointerId);
        const stopDragging = this.stopDragging_.bind(this, event.pointerId);
        assert(!!this.draggingEventTracker_);
        this.draggingEventTracker_.add(this, 'pointermove', (e) => {
            // Prevent unwanted text selection to occur while moving the pointer,
            // this is important.
            e.preventDefault();
            // If the left-button on the mouse is pressed by itself, then update.
            // Otherwise stop capturing the mouse events because the drag operation
            // is complete.
            if (e.buttons !== 1 && e.pointerType === 'mouse') {
                stopDragging();
                return;
            }
            this.updateValueFromClientX_(e.clientX);
        });
        this.draggingEventTracker_.add(this, 'pointercancel', stopDragging);
        this.draggingEventTracker_.add(this, 'pointerdown', stopDragging);
        this.draggingEventTracker_.add(this, 'pointerup', stopDragging);
        this.draggingEventTracker_.add(this, 'keydown', (e) => {
            if (e.key === 'Escape' || e.key === 'Tab' || e.key === 'Home' ||
                e.key === 'End' || this.deltaKeyMap_.has(e.key)) {
                stopDragging();
            }
        });
    }
    onTransitionEnd_() {
        this.transiting_ = false;
    }
    updateUi_() {
        const percent = `${this.getRatio() * 100}%`;
        this.$.bar.style.width = percent;
        this.$.knobAndLabel.style.marginInlineStart = percent;
        const ticks = this.ticks;
        const value = this.value;
        if (ticks && ticks.length > 0 && Number.isInteger(value) && value >= 0 &&
            value < ticks.length) {
            const tick = ticks[this.value];
            this.label_ = Number.isFinite(tick) ? '' : tick.label;
            const ariaValueNow = getAriaValue(tick);
            this.setAttribute('aria-valuetext', String(this.label_ || ariaValueNow));
            this.setAttribute('aria-valuenow', ariaValueNow.toString());
            this.setAttribute('aria-valuemin', getAriaValue(ticks[0]).toString());
            this.setAttribute('aria-valuemax', getAriaValue(ticks.slice(-1)[0]).toString());
        }
        else {
            this.setAttribute('aria-valuetext', value !== undefined ? value.toString() : '');
            this.setAttribute('aria-valuenow', value !== undefined ? value.toString() : '');
            this.setAttribute('aria-valuemin', this.min.toString());
            this.setAttribute('aria-valuemax', this.max.toString());
        }
    }
    updateValue_(value) {
        if (this.snaps) {
            // Skip update if |value| has not passed the next value .8 units away.
            // The value will update as the drag approaches the next value.
            if (Math.abs(this.value - value) < .8) {
                return false;
            }
            value = Math.round(value);
        }
        value = clamp(this.min, this.max, value);
        if (this.value === value) {
            return false;
        }
        this.value = value;
        return true;
    }
    isRtl_() {
        return this.matches(':host-context([dir=rtl]) cr-slider');
    }
    updateValueFromClientX_(clientX) {
        const rect = this.$.container.getBoundingClientRect();
        let ratio = (clientX - rect.left) / rect.width;
        if (this.isRtl_()) {
            ratio = 1 - ratio;
        }
        if (this.updateValue_(ratio * (this.max - this.min) + this.min)) {
            this.fire('cr-slider-value-changed');
        }
    }
    onKeyPressSliderIncrementChanged_() {
        const isRtl = this.isRtl_();
        const increment = this.keyPressSliderIncrement;
        const decrement = -this.keyPressSliderIncrement;
        this.deltaKeyMap_ = new Map([
            ['ArrowDown', decrement],
            ['ArrowUp', increment],
            ['PageDown', decrement],
            ['PageUp', increment],
            ['ArrowLeft', isRtl ? increment : decrement],
            ['ArrowRight', isRtl ? decrement : increment],
        ]);
    }
    // Overridden from CrRippleMixin
    createRipple() {
        this.rippleContainer = this.$.knob;
        const ripple = super.createRipple();
        ripple.setAttribute('recenters', '');
        ripple.classList.add('circle');
        return ripple;
    }
}
customElements.define(CrSliderElement.is, CrSliderElement);

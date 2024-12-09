// Copyright 2023 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import '../cr_icon_button/cr_icon_button.js';
import { loadTimeData } from '//resources/js/load_time_data.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import { getCss } from './cr_feedback_buttons.css.js';
import { getHtml } from './cr_feedback_buttons.html.js';
export var CrFeedbackOption;
(function (CrFeedbackOption) {
    CrFeedbackOption[CrFeedbackOption["THUMBS_DOWN"] = 0] = "THUMBS_DOWN";
    CrFeedbackOption[CrFeedbackOption["THUMBS_UP"] = 1] = "THUMBS_UP";
    CrFeedbackOption[CrFeedbackOption["UNSPECIFIED"] = 2] = "UNSPECIFIED";
})(CrFeedbackOption || (CrFeedbackOption = {}));
export class CrFeedbackButtonsElement extends CrLitElement {
    constructor() {
        super(...arguments);
        this.selectedOption = CrFeedbackOption.UNSPECIFIED;
        this.thumbsDownLabel_ = loadTimeData.getString('thumbsDown');
        this.thumbsUpLabel_ = loadTimeData.getString('thumbsUp');
        this.disabled = false;
    }
    static get is() {
        return 'cr-feedback-buttons';
    }
    static get styles() {
        return getCss();
    }
    render() {
        return getHtml.bind(this)();
    }
    static get properties() {
        return {
            selectedOption: { type: Number },
            thumbsDownLabel_: { type: String },
            thumbsUpLabel_: { type: String },
            disabled: { type: Boolean },
        };
    }
    getThumbsDownAriaPressed_() {
        return this.selectedOption === CrFeedbackOption.THUMBS_DOWN;
    }
    getThumbsDownIcon_() {
        return this.selectedOption === CrFeedbackOption.THUMBS_DOWN ?
            'cr:thumbs-down-filled' :
            'cr:thumbs-down';
    }
    getThumbsUpAriaPressed_() {
        return this.selectedOption === CrFeedbackOption.THUMBS_UP;
    }
    getThumbsUpIcon_() {
        return this.selectedOption === CrFeedbackOption.THUMBS_UP ?
            'cr:thumbs-up-filled' :
            'cr:thumbs-up';
    }
    async notifySelectedOptionChanged_() {
        // Wait for the element's DOM to be updated before dispatching
        // selected-option-changed event.
        await this.updateComplete;
        this.dispatchEvent(new CustomEvent('selected-option-changed', {
            bubbles: true,
            composed: true,
            detail: { value: this.selectedOption },
        }));
    }
    onThumbsDownClick_() {
        this.selectedOption = this.selectedOption === CrFeedbackOption.THUMBS_DOWN ?
            CrFeedbackOption.UNSPECIFIED :
            CrFeedbackOption.THUMBS_DOWN;
        this.notifySelectedOptionChanged_();
    }
    onThumbsUpClick_() {
        this.selectedOption = this.selectedOption === CrFeedbackOption.THUMBS_UP ?
            CrFeedbackOption.UNSPECIFIED :
            CrFeedbackOption.THUMBS_UP;
        this.notifySelectedOptionChanged_();
    }
}
customElements.define(CrFeedbackButtonsElement.is, CrFeedbackButtonsElement);

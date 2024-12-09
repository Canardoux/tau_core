import '../cr_icon_button/cr_icon_button.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { CrIconButtonElement } from '../cr_icon_button/cr_icon_button.js';
export declare enum CrFeedbackOption {
    THUMBS_DOWN = 0,
    THUMBS_UP = 1,
    UNSPECIFIED = 2
}
export interface CrFeedbackButtonsElement {
    $: {
        thumbsDown: CrIconButtonElement;
        thumbsUp: CrIconButtonElement;
    };
}
export declare class CrFeedbackButtonsElement extends CrLitElement {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        selectedOption: {
            type: NumberConstructor;
        };
        thumbsDownLabel_: {
            type: StringConstructor;
        };
        thumbsUpLabel_: {
            type: StringConstructor;
        };
        disabled: {
            type: BooleanConstructor;
        };
    };
    selectedOption: CrFeedbackOption;
    protected thumbsDownLabel_: string;
    protected thumbsUpLabel_: string;
    disabled: boolean;
    protected getThumbsDownAriaPressed_(): boolean;
    protected getThumbsDownIcon_(): string;
    protected getThumbsUpAriaPressed_(): boolean;
    protected getThumbsUpIcon_(): string;
    private notifySelectedOptionChanged_;
    protected onThumbsDownClick_(): void;
    protected onThumbsUpClick_(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-feedback-buttons': CrFeedbackButtonsElement;
    }
}

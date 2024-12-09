import { CustomElement } from '//resources/js/custom_element.js';
declare global {
    interface HTMLElementEventMap {
        'selected-index-change': CustomEvent<number>;
    }
}
export declare class CrTabBoxElement extends CustomElement {
    static get template(): string | TrustedHTML;
    static get observedAttributes(): string[];
    private tabs_;
    private panels_;
    private focusOutlineManager_;
    constructor();
    connectedCallback(): void;
    attributeChangedCallback(name: string, _oldValue: string, newValue: string): void;
    private getTabs_;
    private getPanels_;
    private onKeydown_;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-tab-box': CrTabBoxElement;
    }
}

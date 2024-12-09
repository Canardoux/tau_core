declare class ActionLink extends HTMLAnchorElement {
    private boundOnKeyDown_;
    private boundOnMouseDown_;
    private boundOnBlur_;
    connectedCallback(): void;
    disconnectedCallback(): void;
    set disabled(disabled: boolean);
    get disabled(): boolean;
    setAttribute(attr: string, val: string): void;
    removeAttribute(attr: string): void;
}

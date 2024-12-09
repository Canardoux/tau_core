export declare class CustomElement extends HTMLElement {
    static get template(): string | TrustedHTML;
    constructor();
    $<K extends keyof HTMLElementTagNameMap>(query: K): HTMLElementTagNameMap[K] | null;
    $<E extends HTMLElement = HTMLElement>(query: string): E | null;
    $all<K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;
    $all<E extends Element = Element>(selectors: string): NodeListOf<E>;
    getRequiredElement<K extends keyof HTMLElementTagNameMap>(query: K): HTMLElementTagNameMap[K];
    getRequiredElement<E extends HTMLElement = HTMLElement>(query: string): E;
}

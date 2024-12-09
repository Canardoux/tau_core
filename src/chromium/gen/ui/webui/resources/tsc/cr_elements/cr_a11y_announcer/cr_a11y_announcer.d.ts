import { CustomElement } from '//resources/js/custom_element.js';
/**
 * The CrA11yAnnouncerElement is a visually hidden element that reads out
 * messages to a screen reader. This is preferred over IronA11yAnnouncer.
 * @fileoverview
 */
type CrA11yAnnouncerMessagesSentEvent = CustomEvent<{
    messages: string[];
}>;
declare global {
    interface HTMLElementEventMap {
        'cr-a11y-announcer-messages-sent': CrA11yAnnouncerMessagesSentEvent;
    }
}
/**
 * 150ms seems to be around the minimum time required for screen readers to
 * read out consecutively queued messages.
 */
export declare const TIMEOUT_MS: number;
export declare function getInstance(container?: HTMLElement): CrA11yAnnouncerElement;
export declare class CrA11yAnnouncerElement extends CustomElement {
    static get is(): string;
    static get template(): string | TrustedHTML;
    private currentTimeout_;
    private messages_;
    disconnectedCallback(): void;
    announce(message: string, timeout?: number): void;
}
export {};

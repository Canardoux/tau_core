import '../cr_auto_img/cr_auto_img.js';
import type { PropertyValues } from '//resources/lit/v3_0/lit.rollup.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
export declare enum CrUrlListItemSize {
    COMPACT = "compact",
    MEDIUM = "medium",
    LARGE = "large"
}
export interface CrUrlListItemElement {
    $: {
        anchor: HTMLAnchorElement;
        badgesContainer: HTMLElement;
        badges: HTMLSlotElement;
        button: HTMLElement;
        content: HTMLSlotElement;
        description: HTMLSlotElement;
        metadata: HTMLElement;
    };
}
declare const CrUrlListItemElementBase: typeof CrLitElement;
export declare class CrUrlListItemElement extends CrUrlListItemElementBase {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        alwaysShowSuffix: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        itemAriaLabel: {
            type: StringConstructor;
        };
        itemAriaDescription: {
            type: StringConstructor;
        };
        count: {
            type: NumberConstructor;
        };
        description: {
            type: StringConstructor;
        };
        url: {
            type: StringConstructor;
        };
        title: {
            reflect: boolean;
            type: StringConstructor;
        };
        hasBadges: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        hasDescriptions_: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        hasSlottedContent_: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        reverseElideDescription: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        isFolder_: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        size: {
            type: StringConstructor;
            reflect: boolean;
        };
        imageUrls: {
            type: ArrayConstructor;
        };
        firstImageLoaded_: {
            type: BooleanConstructor;
            state: boolean;
        };
        forceHover: {
            reflect: boolean;
            type: BooleanConstructor;
        };
        descriptionMeta: {
            type: StringConstructor;
        };
        /**
         * Flag that determines if the element should use an anchor tag or a
         * button element as its focusable item. An anchor provides the native
         * context menu and browser interactions for links, while a button
         * provides its own unique functionality, such as pressing space to
         * activate.
         */
        asAnchor: {
            type: BooleanConstructor;
        };
        asAnchorTarget: {
            type: StringConstructor;
        };
    };
    alwaysShowSuffix: boolean;
    asAnchor: boolean;
    asAnchorTarget: string;
    itemAriaLabel?: string;
    itemAriaDescription?: string;
    count?: number;
    description?: string;
    reverseElideDescription: boolean;
    hasBadges: boolean;
    protected hasDescriptions_: boolean;
    protected hasSlottedContent_: boolean;
    protected isFolder_: boolean;
    size: CrUrlListItemSize;
    title: string;
    url?: string;
    imageUrls: string[];
    protected firstImageLoaded_: boolean;
    forceHover: boolean;
    descriptionMeta: string;
    firstUpdated(changedProperties: PropertyValues<this>): void;
    willUpdate(changedProperties: PropertyValues<this>): void;
    updated(changedProperties: PropertyValues<this>): void;
    connectedCallback(): void;
    focus(): void;
    getFocusableElement(): HTMLElement;
    private resetFirstImageLoaded_;
    protected getItemAriaDescription_(): string | undefined;
    protected getItemAriaLabel_(): string;
    protected getDisplayedCount_(): string;
    protected getFavicon_(): string;
    protected shouldShowImageUrl_(_url: string, index: number): boolean;
    protected onBadgesSlotChange_(): void;
    protected onContentSlotChange_(): void;
    private setActiveState_;
    protected shouldShowFavicon_(): boolean;
    protected shouldShowUrlImage_(): boolean;
    protected shouldShowFolderImages_(): boolean;
    protected shouldShowFolderIcon_(): boolean;
    protected shouldShowFolderCount_(): boolean;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-url-list-item': CrUrlListItemElement;
    }
}
export {};

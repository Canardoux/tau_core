import '../cr_shared_vars.css.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
interface ShowAtConfig {
    top?: number;
    left?: number;
    width?: number;
    height?: number;
    anchorAlignmentX?: AnchorAlignment;
    anchorAlignmentY?: AnchorAlignment;
    minX?: number;
    minY?: number;
    maxX?: number;
    maxY?: number;
    noOffset?: boolean;
}
export interface ShowAtPositionConfig {
    top: number;
    left: number;
    width?: number;
    height?: number;
    anchorAlignmentX?: AnchorAlignment;
    anchorAlignmentY?: AnchorAlignment;
    minX?: number;
    minY?: number;
    maxX?: number;
    maxY?: number;
}
export declare enum AnchorAlignment {
    BEFORE_START = -2,
    AFTER_START = -1,
    CENTER = 0,
    BEFORE_END = 1,
    AFTER_END = 2
}
export interface CrActionMenuElement {
    $: {
        contentNode: HTMLSlotElement;
        dialog: HTMLDialogElement;
        wrapper: HTMLElement;
    };
}
export declare class CrActionMenuElement extends CrLitElement {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        accessibilityLabel: {
            type: StringConstructor;
        };
        autoReposition: {
            type: BooleanConstructor;
        };
        open: {
            type: BooleanConstructor;
            notify: boolean;
        };
        roleDescription: {
            type: StringConstructor;
        };
    };
    accessibilityLabel?: string;
    autoReposition: boolean;
    open: boolean;
    roleDescription?: string;
    private boundClose_;
    private resizeObserver_;
    private hasMousemoveListener_;
    private anchorElement_;
    private lastConfig_;
    firstUpdated(): void;
    disconnectedCallback(): void;
    /**
     * Exposing internal <dialog> elements for tests.
     */
    getDialog(): HTMLDialogElement;
    private removeListeners_;
    protected onNativeDialogClose_(e: Event): void;
    private onClick_;
    private onKeyDown_;
    private onMouseover_;
    private updateFocus_;
    close(): void;
    /**
     * Shows the menu anchored to the given element.
     */
    showAt(anchorElement: HTMLElement, config?: ShowAtConfig): void;
    /**
     * Shows the menu anchored to the given box. The anchor alignment is
     * specified as an X and Y alignment which represents a point in the anchor
     * where the menu will align to, which can have the menu either before or
     * after the given point in each axis. Center alignment places the center of
     * the menu in line with the center of the anchor. Coordinates are relative to
     * the top-left of the viewport.
     *
     *            y-start
     *         _____________
     *         |           |
     *         |           |
     *         |   CENTER  |
     * x-start |     x     | x-end
     *         |           |
     *         |anchor box |
     *         |___________|
     *
     *             y-end
     *
     * For example, aligning the menu to the inside of the top-right edge of
     * the anchor, extending towards the bottom-left would use a alignment of
     * (BEFORE_END, AFTER_START), whereas centering the menu below the bottom
     * edge of the anchor would use (CENTER, AFTER_END).
     */
    showAtPosition(config: ShowAtPositionConfig): void;
    private resetStyle_;
    /**
     * Position the dialog using the coordinates in config. Coordinates are
     * relative to the top-left of the viewport when scrolled to (0, 0).
     */
    private positionDialog_;
    protected onSlotchange_(): void;
    private addListeners_;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-action-menu': CrActionMenuElement;
    }
}
export {};

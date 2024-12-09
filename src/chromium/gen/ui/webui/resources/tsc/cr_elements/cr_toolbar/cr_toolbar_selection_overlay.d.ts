/**
 * @fileoverview Element which displays the number of selected items, designed
 * to be used as an overlay on top of <cr-toolbar>. See <history-toolbar> for an
 * example usage.
 *
 * Note that the embedder is expected to set position: relative to make the
 * absolute positioning of this element work, and the cr-toolbar should have the
 * has-overlay attribute set when its overlay is shown to prevent access through
 * tab-traversal.
 */
import '../cr_icon_button/cr_icon_button.js';
import '../icons.html.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { PropertyValues } from '//resources/lit/v3_0/lit.rollup.js';
export declare class CrToolbarSelectionOverlayElement extends CrLitElement {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        show: {
            type: BooleanConstructor;
            reflect: boolean;
        };
        cancelLabel: {
            type: StringConstructor;
        };
        selectionLabel: {
            type: StringConstructor;
        };
    };
    show: boolean;
    cancelLabel: string;
    selectionLabel: string;
    firstUpdated(): void;
    updated(changedProperties: PropertyValues<this>): void;
    protected onClearSelectionClick_(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-toolbar-selection-overlay': CrToolbarSelectionOverlayElement;
    }
}

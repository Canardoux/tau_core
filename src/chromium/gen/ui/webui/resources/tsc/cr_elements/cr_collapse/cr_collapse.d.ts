import type { PropertyValues } from '//resources/lit/v3_0/lit.rollup.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
export declare class CrCollapseElement extends CrLitElement {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        opened: {
            type: BooleanConstructor;
            notify: boolean;
        };
        noAnimation: {
            type: BooleanConstructor;
            reflect: boolean;
        };
    };
    opened: boolean;
    noAnimation: boolean;
    toggle(): void;
    show(): void;
    hide(): void;
    firstUpdated(): void;
    updated(changedProperties: PropertyValues<this>): void;
    private updateHeight_;
    private onTransitionEnd_;
    private updateStyles_;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-collapse': CrCollapseElement;
    }
}

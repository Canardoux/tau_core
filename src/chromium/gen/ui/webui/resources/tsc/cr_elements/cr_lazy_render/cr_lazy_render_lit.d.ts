import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { TemplateResult } from '//resources/lit/v3_0/lit.rollup.js';
export declare class CrLazyRenderLitElement<T extends HTMLElement> extends CrLitElement {
    static get is(): string;
    static get properties(): {
        template: {
            type: ObjectConstructor;
        };
        rendered_: {
            type: BooleanConstructor;
            state: boolean;
        };
    };
    private rendered_;
    template: () => TemplateResult;
    private child_;
    render(): TemplateResult<1>;
    /**
     * Stamp the template into the DOM tree synchronously
     * @return Child element which has been stamped into the DOM tree.
     */
    get(): T;
    /**
     * @return The element contained in the template, if it has
     *   already been stamped.
     */
    getIfExists(): (T | null);
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-lazy-render-lit': CrLazyRenderLitElement<HTMLElement>;
    }
}

import type { SanitizeInnerHtmlOpts } from '//resources/js/parse_html_subset.js';
import type { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
type Constructor<T> = new (...args: any[]) => T;
export declare const I18nMixinLit: <T extends Constructor<CrLitElement>>(superClass: T) => T & Constructor<I18nMixinLitInterface>;
export interface I18nMixinLitInterface {
    i18n(id: string, ...varArgs: Array<string | number>): string;
    i18nAdvanced(id: string, opts?: SanitizeInnerHtmlOpts): TrustedHTML;
    i18nDynamic(locale: string, id: string, ...varArgs: string[]): string;
    i18nRecursive(locale: string, id: string, ...varArgs: string[]): string;
    i18nExists(id: string): boolean;
}
export {};

import type { SanitizeInnerHtmlOpts } from '//resources/js/parse_html_subset.js';
import type { PolymerElement } from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';
type Constructor<T> = new (...args: any[]) => T;
export declare const I18nMixin: <T extends Constructor<PolymerElement>>(superClass: T) => T & Constructor<I18nMixinInterface>;
export interface I18nMixinInterface {
    i18n(id: string, ...varArgs: Array<string | number>): string;
    i18nAdvanced(id: string, opts?: SanitizeInnerHtmlOpts): TrustedHTML;
    i18nDynamic(locale: string, id: string, ...varArgs: string[]): string;
    i18nRecursive(locale: string, id: string, ...varArgs: string[]): string;
    i18nExists(id: string): boolean;
}
export {};

export interface SanitizeInnerHtmlOpts {
    substitutions?: string[];
    attrs?: string[];
    tags?: string[];
}
/**
 * Same as |sanitizeInnerHtmlInternal|, but it passes through sanitizedPolicy
 * to create a TrustedHTML.
 */
export declare function sanitizeInnerHtml(rawString: string, opts?: SanitizeInnerHtmlOpts): TrustedHTML;
/**
 * Parses a very small subset of HTML. This ensures that insecure HTML /
 * javascript cannot be injected into WebUI.
 * @param s The string to parse.
 * @param extraTags Optional extra allowed tags.
 * @param extraAttrs
 *     Optional extra allowed attributes (all tags are run through these).
 * @throws an Error in case of non supported markup.
 * @return A document fragment containing the DOM tree.
 */
export declare function parseHtmlSubset(s: string, extraTags?: string[], extraAttrs?: string[]): DocumentFragment;

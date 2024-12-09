/**
 * Returns TrustedHTML if the passed literal is static.
 */
export declare function getTrustedHTML(literal: TemplateStringsArray): (TrustedHTML | string);
/**
 * Returns TrustedScript if the passed literal is static.
 */
export declare function getTrustedScript(literal: TemplateStringsArray): (TrustedScript | string);
/**
 * Returns TrustedScriptURL if the passed literal is static.
 */
export declare function getTrustedScriptURL(literal: TemplateStringsArray): (TrustedScriptURL | string);

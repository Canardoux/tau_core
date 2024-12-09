"use strict";
export var FormatterActions = /* @__PURE__ */ ((FormatterActions2) => {
  FormatterActions2["FORMAT"] = "format";
  FormatterActions2["PARSE_CSS"] = "parseCSS";
  FormatterActions2["JAVASCRIPT_SUBSTITUTE"] = "javaScriptSubstitute";
  FormatterActions2["JAVASCRIPT_SCOPE_TREE"] = "javaScriptScopeTree";
  FormatterActions2["EVALUATE_JAVASCRIPT_SUBSTRING"] = "evaluatableJavaScriptSubstring";
  return FormatterActions2;
})(FormatterActions || {});
export var FormattableMediaTypes = /* @__PURE__ */ ((FormattableMediaTypes2) => {
  FormattableMediaTypes2["APPLICATION_JAVASCRIPT"] = "application/javascript";
  FormattableMediaTypes2["APPLICATION_JSON"] = "application/json";
  FormattableMediaTypes2["APPLICATION_MANIFEST_JSON"] = "application/manifest+json";
  FormattableMediaTypes2["TEXT_CSS"] = "text/css";
  FormattableMediaTypes2["TEXT_HTML"] = "text/html";
  FormattableMediaTypes2["TEXT_JAVASCRIPT"] = "text/javascript";
  return FormattableMediaTypes2;
})(FormattableMediaTypes || {});
export const FORMATTABLE_MEDIA_TYPES = [
  "application/javascript" /* APPLICATION_JAVASCRIPT */,
  "application/json" /* APPLICATION_JSON */,
  "application/manifest+json" /* APPLICATION_MANIFEST_JSON */,
  "text/css" /* TEXT_CSS */,
  "text/html" /* TEXT_HTML */,
  "text/javascript" /* TEXT_JAVASCRIPT */
];
export var DefinitionKind = /* @__PURE__ */ ((DefinitionKind2) => {
  DefinitionKind2[DefinitionKind2["NONE"] = 0] = "NONE";
  DefinitionKind2[DefinitionKind2["LET"] = 1] = "LET";
  DefinitionKind2[DefinitionKind2["VAR"] = 2] = "VAR";
  DefinitionKind2[DefinitionKind2["FIXED"] = 3] = "FIXED";
  return DefinitionKind2;
})(DefinitionKind || {});
//# sourceMappingURL=FormatterActions.js.map

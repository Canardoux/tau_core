"use strict";
import * as i18n from "../../core/i18n/i18n.js";
import * as Lit from "../../third_party/lit/lit.js";
export function flattenTemplate(strings, ...values) {
  const valueMap = [];
  const newStrings = [];
  let buffer = "";
  for (let v = 0; v < values.length; v++) {
    const possibleStatic = values[v];
    if (isStaticLiteral(possibleStatic)) {
      buffer += strings[v] + possibleStatic.value;
      valueMap.push(false);
    } else {
      buffer += strings[v];
      newStrings.push(buffer);
      buffer = "";
      valueMap.push(true);
    }
  }
  newStrings.push(buffer + strings[values.length]);
  newStrings.raw = [...newStrings];
  return { strings: newStrings, valueMap };
}
export function html(strings, ...values) {
  const staticValues = values.filter((value) => isStaticLiteral(value));
  if (staticValues.length) {
    const key = staticValues.map((v) => v.value).join(" ");
    return htmlWithStatics(strings, values, key);
  }
  return Lit.html(strings, ...values);
}
export function literal(value) {
  return {
    value: value[0],
    $$static$$: true
  };
}
function isStaticLiteral(item) {
  return typeof item === "object" && (item !== null && "$$static$$" in item);
}
const flattenedTemplates = /* @__PURE__ */ new WeakMap();
function htmlWithStatics(strings, values, staticValuesKey) {
  let flattened;
  let secondaryMap = flattenedTemplates.get(strings);
  if (!secondaryMap) {
    secondaryMap = /* @__PURE__ */ new Map();
    flattenedTemplates.set(strings, secondaryMap);
  }
  flattened = secondaryMap.get(staticValuesKey);
  if (!flattened) {
    flattened = flattenTemplate(strings, ...values);
    secondaryMap.set(staticValuesKey, flattened);
  }
  const filteredValues = values.filter((_, index) => flattened.valueMap[index]);
  return Lit.html(flattened.strings, ...filteredValues);
}
export function i18nTemplate(registeredStrings, stringId, placeholders) {
  const formatter = registeredStrings.getLocalizedStringSetFor(i18n.DevToolsLocale.DevToolsLocale.instance().locale).getMessageFormatterFor(stringId);
  let result = html``;
  for (const icuElement of formatter.getAst()) {
    if (icuElement.type === /* argumentElement */
    1) {
      const placeholderValue = placeholders[icuElement.value];
      if (placeholderValue) {
        result = html`${result}${placeholderValue}`;
      }
    } else if ("value" in icuElement) {
      result = html`${result}${icuElement.value}`;
    }
  }
  return result;
}
//# sourceMappingURL=static.js.map

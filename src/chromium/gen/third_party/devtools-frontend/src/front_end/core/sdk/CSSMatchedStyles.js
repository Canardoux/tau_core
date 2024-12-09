"use strict";
import * as Protocol from "../../generated/protocol.js";
import * as Platform from "../platform/platform.js";
import { CSSMetadata, cssMetadata, CSSWideKeyword } from "./CSSMetadata.js";
import { CSSProperty } from "./CSSProperty.js";
import * as PropertyParser from "./CSSPropertyParser.js";
import {
  CSSFontPaletteValuesRule,
  CSSKeyframesRule,
  CSSPositionTryRule,
  CSSPropertyRule,
  CSSStyleRule
} from "./CSSRule.js";
import { CSSStyleDeclaration, Type } from "./CSSStyleDeclaration.js";
function containsStyle(styles, query) {
  if (!query.styleSheetId || !query.range) {
    return false;
  }
  for (const style of styles) {
    if (query.styleSheetId === style.styleSheetId && style.range && query.range.equal(style.range)) {
      return true;
    }
  }
  return false;
}
function containsCustomProperties(style) {
  const properties = style.allProperties();
  return properties.some((property) => cssMetadata().isCustomProperty(property.name));
}
function containsInherited(style) {
  const properties = style.allProperties();
  for (let i = 0; i < properties.length; ++i) {
    const property = properties[i];
    if (property.activeInStyle() && cssMetadata().isPropertyInherited(property.name)) {
      return true;
    }
  }
  return false;
}
function cleanUserAgentPayload(payload) {
  for (const ruleMatch of payload) {
    cleanUserAgentSelectors(ruleMatch);
  }
  const cleanMatchedPayload = [];
  for (const ruleMatch of payload) {
    const lastMatch = cleanMatchedPayload[cleanMatchedPayload.length - 1];
    if (!lastMatch || ruleMatch.rule.origin !== "user-agent" || lastMatch.rule.origin !== "user-agent" || ruleMatch.rule.selectorList.text !== lastMatch.rule.selectorList.text || mediaText(ruleMatch) !== mediaText(lastMatch)) {
      cleanMatchedPayload.push(ruleMatch);
      continue;
    }
    mergeRule(ruleMatch, lastMatch);
  }
  return cleanMatchedPayload;
  function mergeRule(from, to) {
    const shorthands = /* @__PURE__ */ new Map();
    const properties = /* @__PURE__ */ new Map();
    for (const entry of to.rule.style.shorthandEntries) {
      shorthands.set(entry.name, entry.value);
    }
    for (const entry of to.rule.style.cssProperties) {
      properties.set(entry.name, entry.value);
    }
    for (const entry of from.rule.style.shorthandEntries) {
      shorthands.set(entry.name, entry.value);
    }
    for (const entry of from.rule.style.cssProperties) {
      properties.set(entry.name, entry.value);
    }
    to.rule.style.shorthandEntries = [...shorthands.entries()].map(([name, value]) => ({ name, value }));
    to.rule.style.cssProperties = [...properties.entries()].map(([name, value]) => ({ name, value }));
  }
  function mediaText(ruleMatch) {
    if (!ruleMatch.rule.media) {
      return null;
    }
    return ruleMatch.rule.media.map((media) => media.text).join(", ");
  }
  function cleanUserAgentSelectors(ruleMatch) {
    const { matchingSelectors, rule } = ruleMatch;
    if (rule.origin !== "user-agent" || !matchingSelectors.length) {
      return;
    }
    rule.selectorList.selectors = rule.selectorList.selectors.filter((item, i) => matchingSelectors.includes(i));
    rule.selectorList.text = rule.selectorList.selectors.map((item) => item.text).join(", ");
    ruleMatch.matchingSelectors = matchingSelectors.map((item, i) => i);
  }
}
function customHighlightNamesToMatchingSelectorIndices(ruleMatch) {
  const highlightNamesToMatchingSelectors = /* @__PURE__ */ new Map();
  for (let i = 0; i < ruleMatch.matchingSelectors.length; i++) {
    const matchingSelectorIndex = ruleMatch.matchingSelectors[i];
    const selectorText = ruleMatch.rule.selectorList.selectors[matchingSelectorIndex].text;
    const highlightNameMatch = selectorText.match(/::highlight\((.*)\)/);
    if (highlightNameMatch) {
      const highlightName = highlightNameMatch[1];
      const selectorsForName = highlightNamesToMatchingSelectors.get(highlightName);
      if (selectorsForName) {
        selectorsForName.push(matchingSelectorIndex);
      } else {
        highlightNamesToMatchingSelectors.set(highlightName, [matchingSelectorIndex]);
      }
    }
  }
  return highlightNamesToMatchingSelectors;
}
function queryMatches(style) {
  if (!style.parentRule) {
    return true;
  }
  const parentRule = style.parentRule;
  const queries = [...parentRule.media, ...parentRule.containerQueries, ...parentRule.supports, ...parentRule.scopes];
  for (const query of queries) {
    if (!query.active()) {
      return false;
    }
  }
  return true;
}
export class CSSRegisteredProperty {
  #registration;
  #cssModel;
  #style;
  constructor(cssModel, registration) {
    this.#cssModel = cssModel;
    this.#registration = registration;
  }
  isAtProperty() {
    return this.#registration instanceof CSSPropertyRule;
  }
  propertyName() {
    return this.#registration instanceof CSSPropertyRule ? this.#registration.propertyName().text : this.#registration.propertyName;
  }
  initialValue() {
    return this.#registration instanceof CSSPropertyRule ? this.#registration.initialValue() : this.#registration.initialValue?.text ?? null;
  }
  inherits() {
    return this.#registration instanceof CSSPropertyRule ? this.#registration.inherits() : this.#registration.inherits;
  }
  syntax() {
    return this.#registration instanceof CSSPropertyRule ? this.#registration.syntax() : `"${this.#registration.syntax}"`;
  }
  #asCSSProperties() {
    if (this.#registration instanceof CSSPropertyRule) {
      return [];
    }
    const { inherits, initialValue, syntax } = this.#registration;
    const properties = [
      { name: "inherits", value: `${inherits}` },
      { name: "syntax", value: `"${syntax}"` }
    ];
    if (initialValue !== void 0) {
      properties.push({ name: "initial-value", value: initialValue.text });
    }
    return properties;
  }
  style() {
    if (!this.#style) {
      this.#style = this.#registration instanceof CSSPropertyRule ? this.#registration.style : new CSSStyleDeclaration(
        this.#cssModel,
        null,
        { cssProperties: this.#asCSSProperties(), shorthandEntries: [] },
        Type.Pseudo
      );
    }
    return this.#style;
  }
}
export class CSSMatchedStyles {
  #cssModelInternal;
  #nodeInternal;
  #addedStyles;
  #matchingSelectors;
  #keyframesInternal;
  #registeredProperties;
  #registeredPropertyMap = /* @__PURE__ */ new Map();
  #nodeForStyleInternal;
  #inheritedStyles;
  #styleToDOMCascade;
  #parentLayoutNodeId;
  #positionTryRules;
  #activePositionFallbackIndex;
  #mainDOMCascade;
  #pseudoDOMCascades;
  #customHighlightPseudoDOMCascades;
  #fontPaletteValuesRule;
  static async create(payload) {
    const cssMatchedStyles = new CSSMatchedStyles(payload);
    await cssMatchedStyles.init(payload);
    return cssMatchedStyles;
  }
  constructor({
    cssModel,
    node,
    animationsPayload,
    parentLayoutNodeId,
    positionTryRules,
    propertyRules,
    cssPropertyRegistrations,
    fontPaletteValuesRule,
    activePositionFallbackIndex
  }) {
    this.#cssModelInternal = cssModel;
    this.#nodeInternal = node;
    this.#addedStyles = /* @__PURE__ */ new Map();
    this.#matchingSelectors = /* @__PURE__ */ new Map();
    this.#registeredProperties = [
      ...propertyRules.map((rule) => new CSSPropertyRule(cssModel, rule)),
      ...cssPropertyRegistrations
    ].map((r) => new CSSRegisteredProperty(cssModel, r));
    this.#keyframesInternal = [];
    if (animationsPayload) {
      this.#keyframesInternal = animationsPayload.map((rule) => new CSSKeyframesRule(cssModel, rule));
    }
    this.#positionTryRules = positionTryRules.map((rule) => new CSSPositionTryRule(cssModel, rule));
    this.#parentLayoutNodeId = parentLayoutNodeId;
    this.#fontPaletteValuesRule = fontPaletteValuesRule ? new CSSFontPaletteValuesRule(cssModel, fontPaletteValuesRule) : void 0;
    this.#nodeForStyleInternal = /* @__PURE__ */ new Map();
    this.#inheritedStyles = /* @__PURE__ */ new Set();
    this.#styleToDOMCascade = /* @__PURE__ */ new Map();
    this.#registeredPropertyMap = /* @__PURE__ */ new Map();
    this.#activePositionFallbackIndex = activePositionFallbackIndex;
  }
  async init({
    matchedPayload,
    inheritedPayload,
    inlinePayload,
    attributesPayload,
    pseudoPayload,
    inheritedPseudoPayload
  }) {
    matchedPayload = cleanUserAgentPayload(matchedPayload);
    for (const inheritedResult of inheritedPayload) {
      inheritedResult.matchedCSSRules = cleanUserAgentPayload(inheritedResult.matchedCSSRules);
    }
    this.#mainDOMCascade = await this.buildMainCascade(inlinePayload, attributesPayload, matchedPayload, inheritedPayload);
    [this.#pseudoDOMCascades, this.#customHighlightPseudoDOMCascades] = this.buildPseudoCascades(pseudoPayload, inheritedPseudoPayload);
    for (const domCascade of Array.from(this.#customHighlightPseudoDOMCascades.values()).concat(Array.from(this.#pseudoDOMCascades.values())).concat(this.#mainDOMCascade)) {
      for (const style of domCascade.styles()) {
        this.#styleToDOMCascade.set(style, domCascade);
      }
    }
    for (const prop of this.#registeredProperties) {
      this.#registeredPropertyMap.set(prop.propertyName(), prop);
    }
  }
  async buildMainCascade(inlinePayload, attributesPayload, matchedPayload, inheritedPayload) {
    const nodeCascades = [];
    const nodeStyles = [];
    function addAttributesStyle() {
      if (!attributesPayload) {
        return;
      }
      const style = new CSSStyleDeclaration(this.#cssModelInternal, null, attributesPayload, Type.Attributes);
      this.#nodeForStyleInternal.set(style, this.#nodeInternal);
      nodeStyles.push(style);
    }
    if (inlinePayload && this.#nodeInternal.nodeType() === Node.ELEMENT_NODE) {
      const style = new CSSStyleDeclaration(this.#cssModelInternal, null, inlinePayload, Type.Inline);
      this.#nodeForStyleInternal.set(style, this.#nodeInternal);
      nodeStyles.push(style);
    }
    let addedAttributesStyle;
    for (let i = matchedPayload.length - 1; i >= 0; --i) {
      const rule = new CSSStyleRule(this.#cssModelInternal, matchedPayload[i].rule);
      if ((rule.isInjected() || rule.isUserAgent()) && !addedAttributesStyle) {
        addedAttributesStyle = true;
        addAttributesStyle.call(this);
      }
      this.#nodeForStyleInternal.set(rule.style, this.#nodeInternal);
      nodeStyles.push(rule.style);
      this.addMatchingSelectors(this.#nodeInternal, rule, matchedPayload[i].matchingSelectors);
    }
    if (!addedAttributesStyle) {
      addAttributesStyle.call(this);
    }
    nodeCascades.push(new NodeCascade(
      this,
      nodeStyles,
      false
      /* #isInherited */
    ));
    let parentNode = this.#nodeInternal.parentNode;
    const traverseParentInFlatTree = async (node) => {
      if (node.hasAssignedSlot()) {
        return await node.assignedSlot?.deferredNode.resolvePromise() ?? null;
      }
      return node.parentNode;
    };
    for (let i = 0; parentNode && inheritedPayload && i < inheritedPayload.length; ++i) {
      const inheritedStyles = [];
      const entryPayload = inheritedPayload[i];
      const inheritedInlineStyle = entryPayload.inlineStyle ? new CSSStyleDeclaration(this.#cssModelInternal, null, entryPayload.inlineStyle, Type.Inline) : null;
      if (inheritedInlineStyle && containsInherited(inheritedInlineStyle)) {
        this.#nodeForStyleInternal.set(inheritedInlineStyle, parentNode);
        inheritedStyles.push(inheritedInlineStyle);
        this.#inheritedStyles.add(inheritedInlineStyle);
      }
      const inheritedMatchedCSSRules = entryPayload.matchedCSSRules || [];
      for (let j = inheritedMatchedCSSRules.length - 1; j >= 0; --j) {
        const inheritedRule = new CSSStyleRule(this.#cssModelInternal, inheritedMatchedCSSRules[j].rule);
        this.addMatchingSelectors(parentNode, inheritedRule, inheritedMatchedCSSRules[j].matchingSelectors);
        if (!containsInherited(inheritedRule.style)) {
          continue;
        }
        if (!containsCustomProperties(inheritedRule.style)) {
          if (containsStyle(nodeStyles, inheritedRule.style) || containsStyle(this.#inheritedStyles, inheritedRule.style)) {
            continue;
          }
        }
        this.#nodeForStyleInternal.set(inheritedRule.style, parentNode);
        inheritedStyles.push(inheritedRule.style);
        this.#inheritedStyles.add(inheritedRule.style);
      }
      parentNode = await traverseParentInFlatTree(parentNode);
      nodeCascades.push(new NodeCascade(
        this,
        inheritedStyles,
        true
        /* #isInherited */
      ));
    }
    return new DOMInheritanceCascade(nodeCascades, this.#registeredProperties);
  }
  /**
   * Pseudo rule matches received via the inspector protocol are grouped by pseudo type.
   * For custom highlight pseudos, we need to instead group the rule matches by highlight
   * name in order to produce separate cascades for each highlight name. This is necessary
   * so that styles of ::highlight(foo) are not shown as overriding styles of ::highlight(bar).
   *
   * This helper function takes a list of rule matches and generates separate NodeCascades
   * for each custom highlight name that was matched.
   */
  buildSplitCustomHighlightCascades(rules, node, isInherited, pseudoCascades) {
    const splitHighlightRules = /* @__PURE__ */ new Map();
    for (let j = rules.length - 1; j >= 0; --j) {
      const highlightNamesToMatchingSelectorIndices = customHighlightNamesToMatchingSelectorIndices(rules[j]);
      for (const [highlightName, matchingSelectors] of highlightNamesToMatchingSelectorIndices) {
        const pseudoRule = new CSSStyleRule(this.#cssModelInternal, rules[j].rule);
        this.#nodeForStyleInternal.set(pseudoRule.style, node);
        if (isInherited) {
          this.#inheritedStyles.add(pseudoRule.style);
        }
        this.addMatchingSelectors(node, pseudoRule, matchingSelectors);
        const ruleListForHighlightName = splitHighlightRules.get(highlightName);
        if (ruleListForHighlightName) {
          ruleListForHighlightName.push(pseudoRule.style);
        } else {
          splitHighlightRules.set(highlightName, [pseudoRule.style]);
        }
      }
    }
    for (const [highlightName, highlightStyles] of splitHighlightRules) {
      const nodeCascade = new NodeCascade(
        this,
        highlightStyles,
        isInherited,
        true
        /* #isHighlightPseudoCascade*/
      );
      const cascadeListForHighlightName = pseudoCascades.get(highlightName);
      if (cascadeListForHighlightName) {
        cascadeListForHighlightName.push(nodeCascade);
      } else {
        pseudoCascades.set(highlightName, [nodeCascade]);
      }
    }
  }
  buildPseudoCascades(pseudoPayload, inheritedPseudoPayload) {
    const pseudoInheritanceCascades = /* @__PURE__ */ new Map();
    const customHighlightPseudoInheritanceCascades = /* @__PURE__ */ new Map();
    if (!pseudoPayload) {
      return [pseudoInheritanceCascades, customHighlightPseudoInheritanceCascades];
    }
    const pseudoCascades = /* @__PURE__ */ new Map();
    const customHighlightPseudoCascades = /* @__PURE__ */ new Map();
    for (let i = 0; i < pseudoPayload.length; ++i) {
      const entryPayload = pseudoPayload[i];
      const pseudoElement = this.#nodeInternal.pseudoElements().get(entryPayload.pseudoType)?.at(-1) || null;
      const pseudoStyles = [];
      const rules = entryPayload.matches || [];
      if (entryPayload.pseudoType === Protocol.DOM.PseudoType.Highlight) {
        this.buildSplitCustomHighlightCascades(
          rules,
          this.#nodeInternal,
          false,
          customHighlightPseudoCascades
        );
      } else {
        for (let j = rules.length - 1; j >= 0; --j) {
          const pseudoRule = new CSSStyleRule(this.#cssModelInternal, rules[j].rule);
          pseudoStyles.push(pseudoRule.style);
          const nodeForStyle = cssMetadata().isHighlightPseudoType(entryPayload.pseudoType) ? this.#nodeInternal : pseudoElement;
          this.#nodeForStyleInternal.set(pseudoRule.style, nodeForStyle);
          if (nodeForStyle) {
            this.addMatchingSelectors(nodeForStyle, pseudoRule, rules[j].matchingSelectors);
          }
        }
        const isHighlightPseudoCascade = cssMetadata().isHighlightPseudoType(entryPayload.pseudoType);
        const nodeCascade = new NodeCascade(
          this,
          pseudoStyles,
          false,
          isHighlightPseudoCascade
          /* #isHighlightPseudoCascade*/
        );
        pseudoCascades.set(entryPayload.pseudoType, [nodeCascade]);
      }
    }
    if (inheritedPseudoPayload) {
      let parentNode = this.#nodeInternal.parentNode;
      for (let i = 0; parentNode && i < inheritedPseudoPayload.length; ++i) {
        const inheritedPseudoMatches = inheritedPseudoPayload[i].pseudoElements;
        for (let j = 0; j < inheritedPseudoMatches.length; ++j) {
          const inheritedEntryPayload = inheritedPseudoMatches[j];
          const rules = inheritedEntryPayload.matches || [];
          if (inheritedEntryPayload.pseudoType === Protocol.DOM.PseudoType.Highlight) {
            this.buildSplitCustomHighlightCascades(
              rules,
              parentNode,
              true,
              customHighlightPseudoCascades
            );
          } else {
            const pseudoStyles = [];
            for (let k = rules.length - 1; k >= 0; --k) {
              const pseudoRule = new CSSStyleRule(this.#cssModelInternal, rules[k].rule);
              pseudoStyles.push(pseudoRule.style);
              this.#nodeForStyleInternal.set(pseudoRule.style, parentNode);
              this.#inheritedStyles.add(pseudoRule.style);
              this.addMatchingSelectors(parentNode, pseudoRule, rules[k].matchingSelectors);
            }
            const isHighlightPseudoCascade = cssMetadata().isHighlightPseudoType(inheritedEntryPayload.pseudoType);
            const nodeCascade = new NodeCascade(
              this,
              pseudoStyles,
              true,
              isHighlightPseudoCascade
              /* #isHighlightPseudoCascade*/
            );
            const cascadeListForPseudoType = pseudoCascades.get(inheritedEntryPayload.pseudoType);
            if (cascadeListForPseudoType) {
              cascadeListForPseudoType.push(nodeCascade);
            } else {
              pseudoCascades.set(inheritedEntryPayload.pseudoType, [nodeCascade]);
            }
          }
        }
        parentNode = parentNode.parentNode;
      }
    }
    for (const [pseudoType, nodeCascade] of pseudoCascades.entries()) {
      pseudoInheritanceCascades.set(pseudoType, new DOMInheritanceCascade(nodeCascade, this.#registeredProperties));
    }
    for (const [highlightName, nodeCascade] of customHighlightPseudoCascades.entries()) {
      customHighlightPseudoInheritanceCascades.set(
        highlightName,
        new DOMInheritanceCascade(nodeCascade, this.#registeredProperties)
      );
    }
    return [pseudoInheritanceCascades, customHighlightPseudoInheritanceCascades];
  }
  addMatchingSelectors(node, rule, matchingSelectorIndices) {
    for (const matchingSelectorIndex of matchingSelectorIndices) {
      const selector = rule.selectors[matchingSelectorIndex];
      if (selector) {
        this.setSelectorMatches(node, selector.text, true);
      }
    }
  }
  node() {
    return this.#nodeInternal;
  }
  cssModel() {
    return this.#cssModelInternal;
  }
  hasMatchingSelectors(rule) {
    return (rule.selectors.length === 0 || this.getMatchingSelectors(rule).length > 0) && queryMatches(rule.style);
  }
  getParentLayoutNodeId() {
    return this.#parentLayoutNodeId;
  }
  getMatchingSelectors(rule) {
    const node = this.nodeForStyle(rule.style);
    if (!node || typeof node.id !== "number") {
      return [];
    }
    const map = this.#matchingSelectors.get(node.id);
    if (!map) {
      return [];
    }
    const result = [];
    for (let i = 0; i < rule.selectors.length; ++i) {
      if (map.get(rule.selectors[i].text)) {
        result.push(i);
      }
    }
    return result;
  }
  async recomputeMatchingSelectors(rule) {
    const node = this.nodeForStyle(rule.style);
    if (!node) {
      return;
    }
    const promises = [];
    for (const selector of rule.selectors) {
      promises.push(querySelector.call(this, node, selector.text));
    }
    await Promise.all(promises);
    async function querySelector(node2, selectorText) {
      const ownerDocument = node2.ownerDocument;
      if (!ownerDocument) {
        return;
      }
      if (typeof node2.id === "number") {
        const map = this.#matchingSelectors.get(node2.id);
        if (map && map.has(selectorText)) {
          return;
        }
      }
      if (typeof ownerDocument.id !== "number") {
        return;
      }
      const matchingNodeIds = await this.#nodeInternal.domModel().querySelectorAll(ownerDocument.id, selectorText);
      if (matchingNodeIds) {
        if (typeof node2.id === "number") {
          this.setSelectorMatches(node2, selectorText, matchingNodeIds.indexOf(node2.id) !== -1);
        } else {
          this.setSelectorMatches(node2, selectorText, false);
        }
      }
    }
  }
  addNewRule(rule, node) {
    this.#addedStyles.set(rule.style, node);
    return this.recomputeMatchingSelectors(rule);
  }
  setSelectorMatches(node, selectorText, value) {
    if (typeof node.id !== "number") {
      return;
    }
    let map = this.#matchingSelectors.get(node.id);
    if (!map) {
      map = /* @__PURE__ */ new Map();
      this.#matchingSelectors.set(node.id, map);
    }
    map.set(selectorText, value);
  }
  nodeStyles() {
    Platform.assertNotNullOrUndefined(this.#mainDOMCascade);
    return this.#mainDOMCascade.styles();
  }
  registeredProperties() {
    return this.#registeredProperties;
  }
  getRegisteredProperty(name) {
    return this.#registeredPropertyMap.get(name);
  }
  fontPaletteValuesRule() {
    return this.#fontPaletteValuesRule;
  }
  keyframes() {
    return this.#keyframesInternal;
  }
  positionTryRules() {
    return this.#positionTryRules;
  }
  activePositionFallbackIndex() {
    return this.#activePositionFallbackIndex;
  }
  pseudoStyles(pseudoType) {
    Platform.assertNotNullOrUndefined(this.#pseudoDOMCascades);
    const domCascade = this.#pseudoDOMCascades.get(pseudoType);
    return domCascade ? domCascade.styles() : [];
  }
  pseudoTypes() {
    Platform.assertNotNullOrUndefined(this.#pseudoDOMCascades);
    return new Set(this.#pseudoDOMCascades.keys());
  }
  customHighlightPseudoStyles(highlightName) {
    Platform.assertNotNullOrUndefined(this.#customHighlightPseudoDOMCascades);
    const domCascade = this.#customHighlightPseudoDOMCascades.get(highlightName);
    return domCascade ? domCascade.styles() : [];
  }
  customHighlightPseudoNames() {
    Platform.assertNotNullOrUndefined(this.#customHighlightPseudoDOMCascades);
    return new Set(this.#customHighlightPseudoDOMCascades.keys());
  }
  nodeForStyle(style) {
    return this.#addedStyles.get(style) || this.#nodeForStyleInternal.get(style) || null;
  }
  availableCSSVariables(style) {
    const domCascade = this.#styleToDOMCascade.get(style);
    return domCascade ? domCascade.findAvailableCSSVariables(style) : [];
  }
  computeCSSVariable(style, variableName) {
    const domCascade = this.#styleToDOMCascade.get(style);
    return domCascade ? domCascade.computeCSSVariable(style, variableName) : null;
  }
  resolveGlobalKeyword(property, keyword) {
    const resolved = this.#styleToDOMCascade.get(property.ownerStyle)?.resolveGlobalKeyword(property, keyword);
    return resolved ? new CSSValueSource(resolved) : null;
  }
  isInherited(style) {
    return this.#inheritedStyles.has(style);
  }
  propertyState(property) {
    const domCascade = this.#styleToDOMCascade.get(property.ownerStyle);
    return domCascade ? domCascade.propertyState(property) : null;
  }
  resetActiveProperties() {
    Platform.assertNotNullOrUndefined(this.#mainDOMCascade);
    Platform.assertNotNullOrUndefined(this.#pseudoDOMCascades);
    Platform.assertNotNullOrUndefined(this.#customHighlightPseudoDOMCascades);
    this.#mainDOMCascade.reset();
    for (const domCascade of this.#pseudoDOMCascades.values()) {
      domCascade.reset();
    }
    for (const domCascade of this.#customHighlightPseudoDOMCascades.values()) {
      domCascade.reset();
    }
  }
}
class NodeCascade {
  #matchedStyles;
  styles;
  #isInherited;
  #isHighlightPseudoCascade;
  propertiesState;
  activeProperties;
  constructor(matchedStyles, styles, isInherited, isHighlightPseudoCascade = false) {
    this.#matchedStyles = matchedStyles;
    this.styles = styles;
    this.#isInherited = isInherited;
    this.#isHighlightPseudoCascade = isHighlightPseudoCascade;
    this.propertiesState = /* @__PURE__ */ new Map();
    this.activeProperties = /* @__PURE__ */ new Map();
  }
  computeActiveProperties() {
    this.propertiesState.clear();
    this.activeProperties.clear();
    for (let i = this.styles.length - 1; i >= 0; i--) {
      const style = this.styles[i];
      const rule = style.parentRule;
      if (rule && !(rule instanceof CSSStyleRule)) {
        continue;
      }
      if (rule && !this.#matchedStyles.hasMatchingSelectors(rule)) {
        continue;
      }
      for (const property of style.allProperties()) {
        const metadata = cssMetadata();
        if (this.#isInherited && !this.#isHighlightPseudoCascade && !metadata.isPropertyInherited(property.name)) {
          continue;
        }
        if (style.range && !property.range) {
          continue;
        }
        if (!property.activeInStyle()) {
          this.propertiesState.set(property, "Overloaded" /* OVERLOADED */);
          continue;
        }
        if (this.#isInherited) {
          const registration = this.#matchedStyles.getRegisteredProperty(property.name);
          if (registration && !registration.inherits()) {
            this.propertiesState.set(property, "Overloaded" /* OVERLOADED */);
            continue;
          }
        }
        const canonicalName = metadata.canonicalPropertyName(property.name);
        this.updatePropertyState(property, canonicalName);
        for (const longhand of property.getLonghandProperties()) {
          if (metadata.isCSSPropertyName(longhand.name)) {
            this.updatePropertyState(longhand, longhand.name);
          }
        }
      }
    }
  }
  updatePropertyState(propertyWithHigherSpecificity, canonicalName) {
    const activeProperty = this.activeProperties.get(canonicalName);
    if (activeProperty?.important && !propertyWithHigherSpecificity.important) {
      this.propertiesState.set(propertyWithHigherSpecificity, "Overloaded" /* OVERLOADED */);
      return;
    }
    if (activeProperty) {
      this.propertiesState.set(activeProperty, "Overloaded" /* OVERLOADED */);
    }
    this.propertiesState.set(propertyWithHigherSpecificity, "Active" /* ACTIVE */);
    this.activeProperties.set(canonicalName, propertyWithHigherSpecificity);
  }
}
function isRegular(declaration) {
  return "ownerStyle" in declaration;
}
export class CSSValueSource {
  declaration;
  constructor(declaration) {
    this.declaration = declaration;
  }
  get value() {
    return isRegular(this.declaration) ? this.declaration.value : this.declaration.initialValue();
  }
  get style() {
    return isRegular(this.declaration) ? this.declaration.ownerStyle : this.declaration.style();
  }
  get name() {
    return isRegular(this.declaration) ? this.declaration.name : this.declaration.propertyName();
  }
}
class SCCRecordEntry {
  constructor(nodeCascade, name, discoveryTime) {
    this.nodeCascade = nodeCascade;
    this.name = name;
    this.discoveryTime = discoveryTime;
    this.rootDiscoveryTime = discoveryTime;
  }
  rootDiscoveryTime;
  get isRootEntry() {
    return this.rootDiscoveryTime === this.discoveryTime;
  }
  updateRoot(neighbor) {
    this.rootDiscoveryTime = Math.min(this.rootDiscoveryTime, neighbor.rootDiscoveryTime);
  }
}
class SCCRecord {
  #time = 0;
  #stack = [];
  #entries = /* @__PURE__ */ new Map();
  get(nodeCascade, variable) {
    return this.#entries.get(nodeCascade)?.get(variable);
  }
  add(nodeCascade, variable) {
    const existing = this.get(nodeCascade, variable);
    if (existing) {
      return existing;
    }
    const entry = new SCCRecordEntry(nodeCascade, variable, this.#time++);
    this.#stack.push(entry);
    let map = this.#entries.get(nodeCascade);
    if (!map) {
      map = /* @__PURE__ */ new Map();
      this.#entries.set(nodeCascade, map);
    }
    map.set(variable, entry);
    return entry;
  }
  isInInProgressSCC(childRecord) {
    return this.#stack.includes(childRecord);
  }
  finishSCC(root) {
    const startIndex = this.#stack.lastIndexOf(root);
    console.assert(startIndex >= 0, "Root is not an in-progress scc");
    return this.#stack.splice(startIndex);
  }
}
function* forEach(array, startAfter) {
  const startIdx = startAfter !== void 0 ? array.indexOf(startAfter) + 1 : 0;
  for (let i = startIdx; i < array.length; ++i) {
    yield array[i];
  }
}
class DOMInheritanceCascade {
  #nodeCascades;
  #propertiesState;
  #availableCSSVariables;
  #computedCSSVariables;
  #initialized;
  #styleToNodeCascade;
  #registeredProperties;
  constructor(nodeCascades, registeredProperties) {
    this.#nodeCascades = nodeCascades;
    this.#propertiesState = /* @__PURE__ */ new Map();
    this.#availableCSSVariables = /* @__PURE__ */ new Map();
    this.#computedCSSVariables = /* @__PURE__ */ new Map();
    this.#initialized = false;
    this.#registeredProperties = registeredProperties;
    this.#styleToNodeCascade = /* @__PURE__ */ new Map();
    for (const nodeCascade of nodeCascades) {
      for (const style of nodeCascade.styles) {
        this.#styleToNodeCascade.set(style, nodeCascade);
      }
    }
  }
  findAvailableCSSVariables(style) {
    const nodeCascade = this.#styleToNodeCascade.get(style);
    if (!nodeCascade) {
      return [];
    }
    this.ensureInitialized();
    const availableCSSVariables = this.#availableCSSVariables.get(nodeCascade);
    if (!availableCSSVariables) {
      return [];
    }
    return Array.from(availableCSSVariables.keys());
  }
  #findPropertyInPreviousStyle(property, filter) {
    const cascade = this.#styleToNodeCascade.get(property.ownerStyle);
    if (!cascade) {
      return null;
    }
    for (const style of forEach(cascade.styles, property.ownerStyle)) {
      const candidate = style.allProperties().findLast((candidate2) => candidate2.name === property.name && filter(candidate2));
      if (candidate) {
        return candidate;
      }
    }
    return null;
  }
  #findPropertyInParentCascade(property) {
    const nodeCascade = this.#styleToNodeCascade.get(property.ownerStyle);
    if (!nodeCascade) {
      return null;
    }
    for (const cascade of forEach(this.#nodeCascades, nodeCascade)) {
      for (const style of cascade.styles) {
        const inheritedProperty = style.allProperties().findLast((inheritedProperty2) => inheritedProperty2.name === property.name);
        if (inheritedProperty) {
          return inheritedProperty;
        }
      }
    }
    return null;
  }
  #findPropertyInParentCascadeIfInherited(property) {
    if (!cssMetadata().isPropertyInherited(property.name) || !(this.#findCustomPropertyRegistration(property)?.inherits() ?? true)) {
      return null;
    }
    return this.#findPropertyInParentCascade(property);
  }
  #findCustomPropertyRegistration(property) {
    const registration = this.#registeredProperties.find((registration2) => registration2.propertyName() === property.name);
    return registration ? registration : null;
  }
  resolveGlobalKeyword(property, keyword) {
    const isPreviousLayer = (other) => {
      if (!(other.ownerStyle.parentRule instanceof CSSStyleRule)) {
        return false;
      }
      if (property.ownerStyle.type === Type.Inline) {
        return true;
      }
      if (property.ownerStyle.parentRule instanceof CSSStyleRule && other.ownerStyle.parentRule?.origin === Protocol.CSS.StyleSheetOrigin.Regular) {
        return JSON.stringify(other.ownerStyle.parentRule.layers) !== JSON.stringify(property.ownerStyle.parentRule.layers);
      }
      return false;
    };
    switch (keyword) {
      case CSSWideKeyword.INITIAL:
        return this.#findCustomPropertyRegistration(property);
      case CSSWideKeyword.INHERIT:
        return this.#findPropertyInParentCascade(property) ?? this.#findCustomPropertyRegistration(property);
      case CSSWideKeyword.REVERT:
        return this.#findPropertyInPreviousStyle(
          property,
          (other) => other.ownerStyle.parentRule !== null && other.ownerStyle.parentRule.origin !== (property.ownerStyle.parentRule?.origin ?? Protocol.CSS.StyleSheetOrigin.Regular)
        ) ?? this.resolveGlobalKeyword(property, CSSWideKeyword.UNSET);
      case CSSWideKeyword.REVERT_LAYER:
        return this.#findPropertyInPreviousStyle(property, isPreviousLayer) ?? this.resolveGlobalKeyword(property, CSSWideKeyword.REVERT);
      case CSSWideKeyword.UNSET:
        return this.#findPropertyInParentCascadeIfInherited(property) ?? this.#findCustomPropertyRegistration(property);
    }
  }
  computeCSSVariable(style, variableName) {
    const nodeCascade = this.#styleToNodeCascade.get(style);
    if (!nodeCascade) {
      return null;
    }
    this.ensureInitialized();
    return this.innerComputeCSSVariable(nodeCascade, variableName);
  }
  innerComputeCSSVariable(nodeCascade, variableName, sccRecord = new SCCRecord()) {
    const availableCSSVariables = this.#availableCSSVariables.get(nodeCascade);
    const computedCSSVariables = this.#computedCSSVariables.get(nodeCascade);
    if (!computedCSSVariables || !availableCSSVariables?.has(variableName)) {
      return null;
    }
    if (computedCSSVariables?.has(variableName)) {
      return computedCSSVariables.get(variableName) || null;
    }
    let definedValue = availableCSSVariables.get(variableName);
    if (definedValue === void 0 || definedValue === null) {
      return null;
    }
    if (definedValue.declaration.declaration instanceof CSSProperty && definedValue.declaration.value && CSSMetadata.isCSSWideKeyword(definedValue.declaration.value)) {
      const resolvedProperty = this.resolveGlobalKeyword(definedValue.declaration.declaration, definedValue.declaration.value);
      if (!resolvedProperty) {
        return definedValue;
      }
      const declaration = new CSSValueSource(resolvedProperty);
      const { value } = declaration;
      if (!value) {
        return definedValue;
      }
      definedValue = { declaration, value };
    }
    const ast = PropertyParser.tokenizeDeclaration(`--${variableName}`, definedValue.value);
    if (!ast) {
      return null;
    }
    const record = sccRecord.add(nodeCascade, variableName);
    const matching = PropertyParser.BottomUpTreeMatching.walk(
      ast,
      [new PropertyParser.VariableMatcher((match) => {
        const parentStyle = definedValue.declaration.style;
        const nodeCascade2 = this.#styleToNodeCascade.get(parentStyle);
        if (!nodeCascade2) {
          return null;
        }
        const childRecord = sccRecord.get(nodeCascade2, match.name);
        if (childRecord) {
          if (sccRecord.isInInProgressSCC(childRecord)) {
            record.updateRoot(childRecord);
            return null;
          }
          return this.#computedCSSVariables.get(nodeCascade2)?.get(match.name)?.value ?? null;
        }
        const cssVariableValue2 = this.innerComputeCSSVariable(nodeCascade2, match.name, sccRecord);
        const newChildRecord = sccRecord.get(nodeCascade2, match.name);
        newChildRecord && record.updateRoot(newChildRecord);
        if (cssVariableValue2?.value !== void 0) {
          return cssVariableValue2.value;
        }
        if (match.fallback.length === 0 || match.matching.hasUnresolvedVarsRange(match.fallback[0], match.fallback[match.fallback.length - 1])) {
          return null;
        }
        return match.matching.getComputedTextRange(match.fallback[0], match.fallback[match.fallback.length - 1]);
      })]
    );
    const decl = PropertyParser.ASTUtils.siblings(PropertyParser.ASTUtils.declValue(matching.ast.tree));
    const computedText = decl.length > 0 ? matching.getComputedTextRange(decl[0], decl[decl.length - 1]) : "";
    if (record.isRootEntry) {
      const scc = sccRecord.finishSCC(record);
      if (scc.length > 1) {
        for (const entry of scc) {
          console.assert(entry.nodeCascade === nodeCascade, "Circles should be within the cascade");
          computedCSSVariables.set(entry.name, null);
        }
        return null;
      }
    }
    if (decl.length > 0 && matching.hasUnresolvedVarsRange(decl[0], decl[decl.length - 1])) {
      computedCSSVariables.set(variableName, null);
      return null;
    }
    const cssVariableValue = { value: computedText, declaration: definedValue.declaration };
    computedCSSVariables.set(variableName, cssVariableValue);
    return cssVariableValue;
  }
  styles() {
    return Array.from(this.#styleToNodeCascade.keys());
  }
  propertyState(property) {
    this.ensureInitialized();
    return this.#propertiesState.get(property) || null;
  }
  reset() {
    this.#initialized = false;
    this.#propertiesState.clear();
    this.#availableCSSVariables.clear();
    this.#computedCSSVariables.clear();
  }
  ensureInitialized() {
    if (this.#initialized) {
      return;
    }
    this.#initialized = true;
    const activeProperties = /* @__PURE__ */ new Map();
    for (const nodeCascade of this.#nodeCascades) {
      nodeCascade.computeActiveProperties();
      for (const [property, state] of nodeCascade.propertiesState) {
        if (state === "Overloaded" /* OVERLOADED */) {
          this.#propertiesState.set(property, "Overloaded" /* OVERLOADED */);
          continue;
        }
        const canonicalName = cssMetadata().canonicalPropertyName(property.name);
        if (activeProperties.has(canonicalName)) {
          this.#propertiesState.set(property, "Overloaded" /* OVERLOADED */);
          continue;
        }
        activeProperties.set(canonicalName, property);
        this.#propertiesState.set(property, "Active" /* ACTIVE */);
      }
    }
    for (const [canonicalName, shorthandProperty] of activeProperties) {
      const shorthandStyle = shorthandProperty.ownerStyle;
      const longhands = shorthandProperty.getLonghandProperties();
      if (!longhands.length) {
        continue;
      }
      let hasActiveLonghands = false;
      for (const longhand of longhands) {
        const longhandCanonicalName = cssMetadata().canonicalPropertyName(longhand.name);
        const longhandActiveProperty = activeProperties.get(longhandCanonicalName);
        if (!longhandActiveProperty) {
          continue;
        }
        if (longhandActiveProperty.ownerStyle === shorthandStyle) {
          hasActiveLonghands = true;
          break;
        }
      }
      if (hasActiveLonghands) {
        continue;
      }
      activeProperties.delete(canonicalName);
      this.#propertiesState.set(shorthandProperty, "Overloaded" /* OVERLOADED */);
    }
    const accumulatedCSSVariables = /* @__PURE__ */ new Map();
    for (const rule of this.#registeredProperties) {
      const initialValue = rule.initialValue();
      accumulatedCSSVariables.set(
        rule.propertyName(),
        initialValue !== null ? { value: initialValue, declaration: new CSSValueSource(rule) } : null
      );
    }
    for (let i = this.#nodeCascades.length - 1; i >= 0; --i) {
      const nodeCascade = this.#nodeCascades[i];
      const variableNames = [];
      for (const entry of nodeCascade.activeProperties.entries()) {
        const propertyName = entry[0];
        const property = entry[1];
        if (propertyName.startsWith("--")) {
          accumulatedCSSVariables.set(propertyName, { value: property.value, declaration: new CSSValueSource(property) });
          variableNames.push(propertyName);
        }
      }
      const availableCSSVariablesMap = new Map(accumulatedCSSVariables);
      const computedVariablesMap = /* @__PURE__ */ new Map();
      this.#availableCSSVariables.set(nodeCascade, availableCSSVariablesMap);
      this.#computedCSSVariables.set(nodeCascade, computedVariablesMap);
      for (const variableName of variableNames) {
        const prevValue = accumulatedCSSVariables.get(variableName);
        accumulatedCSSVariables.delete(variableName);
        const computedValue = this.innerComputeCSSVariable(nodeCascade, variableName);
        if (prevValue && computedValue?.value === prevValue.value) {
          computedValue.declaration = prevValue.declaration;
        }
        accumulatedCSSVariables.set(variableName, computedValue);
      }
    }
  }
}
export var PropertyState = /* @__PURE__ */ ((PropertyState2) => {
  PropertyState2["ACTIVE"] = "Active";
  PropertyState2["OVERLOADED"] = "Overloaded";
  return PropertyState2;
})(PropertyState || {});
//# sourceMappingURL=CSSMatchedStyles.js.map

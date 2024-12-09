"use strict";
import * as Common from "../../core/common/common.js";
import * as i18n from "../../core/i18n/i18n.js";
import * as Formatter from "../../models/formatter/formatter.js";
import * as Persistence from "../../models/persistence/persistence.js";
import * as DiffView from "../../ui/components/diff_view/diff_view.js";
import * as IconButton from "../../ui/components/icon_button/icon_button.js";
import * as UI from "../../ui/legacy/legacy.js";
import * as Snippets from "../snippets/snippets.js";
const UIStrings = {
  /**
   *@description Tooltip to explain the resource's overridden status
   */
  requestContentHeadersOverridden: "Both request content and headers are overridden",
  /**
   *@description Tooltip to explain the resource's overridden status
   */
  requestContentOverridden: "Request content is overridden",
  /**
   *@description Tooltip to explain the resource's overridden status
   */
  requestHeadersOverridden: "Request headers are overridden",
  /**
   *@description Tooltip to explain why the request has warning icon
   */
  thirdPartyPhaseout: "Cookies for this request are blocked either because of Chrome flags or browser configuration. Learn more in the Issues panel."
};
const str_ = i18n.i18n.registerUIStrings("panels/utils/utils.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
export class PanelUtils {
  static isFailedNetworkRequest(request) {
    if (!request) {
      return false;
    }
    if (request.failed && !request.statusCode) {
      return true;
    }
    if (request.statusCode >= 400) {
      return true;
    }
    const signedExchangeInfo = request.signedExchangeInfo();
    if (signedExchangeInfo !== null && Boolean(signedExchangeInfo.errors)) {
      return true;
    }
    if (request.webBundleInfo()?.errorMessage || request.webBundleInnerRequestInfo()?.errorMessage) {
      return true;
    }
    if (request.corsErrorStatus()) {
      return true;
    }
    return false;
  }
  static createIconElement(iconData, title) {
    const iconElement = document.createElement("div");
    iconElement.title = title;
    const url = new URL(`../../Images/${iconData.iconName}.svg`, import.meta.url).toString();
    iconElement.style.setProperty("mask", `url('${url}')  no-repeat center /99%`);
    iconElement.style.setProperty("background-color", iconData.color);
    return iconElement;
  }
  static getIconForNetworkRequest(request) {
    let type = request.resourceType();
    let iconElement;
    if (PanelUtils.isFailedNetworkRequest(request)) {
      let iconData2 = void 0;
      if (request.resourceType() === Common.ResourceType.resourceTypes.Prefetch) {
        iconData2 = {
          iconName: "warning-filled",
          color: "var(--icon-warning)"
        };
      } else {
        iconData2 = {
          iconName: "cross-circle-filled",
          color: "var(--icon-error)"
        };
      }
      iconElement = PanelUtils.createIconElement(iconData2, type.title());
      iconElement.classList.add("icon");
      return iconElement;
    }
    if (request.hasThirdPartyCookiePhaseoutIssue()) {
      const iconData2 = {
        iconName: "warning-filled",
        color: "var(--icon-warning)"
      };
      iconElement = this.createIconElement(iconData2, i18nString(UIStrings.thirdPartyPhaseout));
      iconElement.classList.add("icon");
      return iconElement;
    }
    const isHeaderOverriden = request.hasOverriddenHeaders();
    const isContentOverriden = request.hasOverriddenContent;
    if (isHeaderOverriden || isContentOverriden) {
      const iconData2 = {
        iconName: "document",
        color: "var(--icon-default)"
      };
      let title;
      if (isHeaderOverriden && isContentOverriden) {
        title = i18nString(UIStrings.requestContentHeadersOverridden);
      } else if (isContentOverriden) {
        title = i18nString(UIStrings.requestContentOverridden);
      } else {
        title = i18nString(UIStrings.requestHeadersOverridden);
      }
      const iconChildElement = this.createIconElement(iconData2, title);
      iconChildElement.classList.add("icon");
      iconElement = document.createElement("div");
      iconElement.classList.add("network-override-marker");
      iconElement.appendChild(iconChildElement);
      return iconElement;
    }
    const typeFromMime = Common.ResourceType.ResourceType.fromMimeType(request.mimeType);
    if (typeFromMime !== type && typeFromMime !== Common.ResourceType.resourceTypes.Other) {
      if (type === Common.ResourceType.resourceTypes.Fetch) {
        type = typeFromMime;
      } else if (typeFromMime === Common.ResourceType.resourceTypes.Image) {
        type = typeFromMime;
      } else if (type === Common.ResourceType.resourceTypes.Other && typeFromMime === Common.ResourceType.resourceTypes.Script) {
        type = typeFromMime;
      }
    }
    if (type === Common.ResourceType.resourceTypes.Image) {
      const previewImage = document.createElement("img");
      previewImage.classList.add("image-network-icon-preview");
      previewImage.alt = request.resourceType().title();
      void request.populateImageSource(previewImage);
      iconElement = document.createElement("div");
      iconElement.classList.add("image", "icon");
      iconElement.appendChild(previewImage);
      return iconElement;
    }
    if (type !== Common.ResourceType.resourceTypes.Manifest && Common.ResourceType.ResourceType.simplifyContentType(request.mimeType) === "application/json") {
      const iconData2 = {
        iconName: "file-json",
        color: "var(--icon-file-script)"
      };
      iconElement = this.createIconElement(iconData2, request.resourceType().title());
      iconElement.classList.add("icon");
      return iconElement;
    }
    const iconData = PanelUtils.iconDataForResourceType(type);
    iconElement = this.createIconElement(iconData, request.resourceType().title());
    iconElement.classList.add("icon");
    return iconElement;
  }
  static iconDataForResourceType(resourceType) {
    if (resourceType.isDocument()) {
      return { iconName: "file-document", color: "var(--icon-file-document)" };
    }
    if (resourceType.isImage()) {
      return { iconName: "file-image", color: "var(--icon-file-image)" };
    }
    if (resourceType.isFont()) {
      return { iconName: "file-font", color: "var(--icon-file-font)" };
    }
    if (resourceType.isScript()) {
      return { iconName: "file-script", color: "var(--icon-file-script)" };
    }
    if (resourceType.isStyleSheet()) {
      return { iconName: "file-stylesheet", color: "var(--icon-file-styles)" };
    }
    if (resourceType.name() === Common.ResourceType.resourceTypes.Manifest.name()) {
      return { iconName: "file-manifest", color: "var(--icon-default)" };
    }
    if (resourceType.name() === Common.ResourceType.resourceTypes.Wasm.name()) {
      return { iconName: "file-wasm", color: "var(--icon-default)" };
    }
    if (resourceType.name() === Common.ResourceType.resourceTypes.WebSocket.name()) {
      return { iconName: "file-websocket", color: "var(--icon-default)" };
    }
    if (resourceType.name() === Common.ResourceType.resourceTypes.Media.name()) {
      return { iconName: "file-media", color: "var(--icon-file-media)" };
    }
    if (resourceType.isWebbundle()) {
      return { iconName: "bundle", color: "var(--icon-default)" };
    }
    if (resourceType.name() === Common.ResourceType.resourceTypes.Fetch.name() || resourceType.name() === Common.ResourceType.resourceTypes.XHR.name()) {
      return { iconName: "file-fetch-xhr", color: "var(--icon-default)" };
    }
    return { iconName: "file-generic", color: "var(--icon-default)" };
  }
  static getIconForSourceFile(uiSourceCode) {
    const binding = Persistence.Persistence.PersistenceImpl.instance().binding(uiSourceCode);
    const networkPersistenceManager = Persistence.NetworkPersistenceManager.NetworkPersistenceManager.instance();
    let iconType = "document";
    let hasDotBadge = false;
    let isDotPurple = false;
    if (binding) {
      if (Snippets.ScriptSnippetFileSystem.isSnippetsUISourceCode(binding.fileSystem)) {
        iconType = "snippet";
      }
      hasDotBadge = true;
      isDotPurple = networkPersistenceManager.project() === binding.fileSystem.project();
    } else if (networkPersistenceManager.isActiveHeaderOverrides(uiSourceCode)) {
      hasDotBadge = true;
      isDotPurple = true;
    } else {
      if (Snippets.ScriptSnippetFileSystem.isSnippetsUISourceCode(uiSourceCode)) {
        iconType = "snippet";
      }
    }
    const icon = new IconButton.FileSourceIcon.FileSourceIcon(iconType);
    icon.data = {
      contentType: uiSourceCode.contentType().name(),
      hasDotBadge,
      isDotPurple
    };
    if (binding) {
      UI.Tooltip.Tooltip.install(
        icon,
        Persistence.PersistenceUtils.PersistenceUtils.tooltipForUISourceCode(uiSourceCode)
      );
    }
    return icon;
  }
  static async formatCSSChangesFromDiff(diff) {
    const indent = "  ";
    const { originalLines, currentLines, rows } = DiffView.DiffView.buildDiffRows(diff);
    const originalRuleMaps = await buildStyleRuleMaps(originalLines.join("\n"));
    const currentRuleMaps = await buildStyleRuleMaps(currentLines.join("\n"));
    let changes = "";
    let recordedOriginalSelector, recordedCurrentSelector;
    let hasOpenDeclarationBlock = false;
    for (const { currentLineNumber, originalLineNumber, type } of rows) {
      if (type !== DiffView.DiffView.RowType.DELETION && type !== DiffView.DiffView.RowType.ADDITION) {
        continue;
      }
      const isDeletion = type === DiffView.DiffView.RowType.DELETION;
      const lines = isDeletion ? originalLines : currentLines;
      const lineIndex = isDeletion ? originalLineNumber - 1 : currentLineNumber - 1;
      const line = lines[lineIndex].trim();
      const { declarationIDToStyleRule, styleRuleIDToStyleRule } = isDeletion ? originalRuleMaps : currentRuleMaps;
      let styleRule;
      let prefix = "";
      if (declarationIDToStyleRule.has(lineIndex)) {
        styleRule = declarationIDToStyleRule.get(lineIndex);
        const selector = styleRule.selector;
        if (selector !== recordedOriginalSelector && selector !== recordedCurrentSelector) {
          prefix += `${selector} {
`;
        }
        prefix += indent;
        hasOpenDeclarationBlock = true;
      } else {
        if (hasOpenDeclarationBlock) {
          prefix = "}\n\n";
          hasOpenDeclarationBlock = false;
        }
        if (styleRuleIDToStyleRule.has(lineIndex)) {
          styleRule = styleRuleIDToStyleRule.get(lineIndex);
        }
      }
      const processedLine = isDeletion ? `/* ${line} */` : line;
      changes += prefix + processedLine + "\n";
      if (isDeletion) {
        recordedOriginalSelector = styleRule?.selector;
      } else {
        recordedCurrentSelector = styleRule?.selector;
      }
    }
    if (changes.length > 0) {
      changes += "}";
    }
    return changes;
  }
  static highlightElement(element) {
    element.scrollIntoViewIfNeeded();
    element.animate(
      [
        { offset: 0, backgroundColor: "rgba(255, 255, 0, 0.2)" },
        { offset: 0.1, backgroundColor: "rgba(255, 255, 0, 0.7)" },
        { offset: 1, backgroundColor: "transparent" }
      ],
      { duration: 2e3, easing: "cubic-bezier(0, 0, 0.2, 1)" }
    );
  }
}
async function buildStyleRuleMaps(content) {
  const rules = await new Promise((res) => {
    const rules2 = [];
    Formatter.FormatterWorkerPool.formatterWorkerPool().parseCSS(content, (isLastChunk, currentRules) => {
      rules2.push(...currentRules);
      if (isLastChunk) {
        res(rules2);
      }
    });
  });
  const declarationIDToStyleRule = /* @__PURE__ */ new Map();
  const styleRuleIDToStyleRule = /* @__PURE__ */ new Map();
  for (const rule of rules) {
    if ("styleRange" in rule) {
      const selector = rule.selectorText.split("\n").pop()?.trim();
      if (!selector) {
        continue;
      }
      const styleRule = { rule, selector };
      styleRuleIDToStyleRule.set(rule.styleRange.startLine, styleRule);
      for (const property of rule.properties) {
        declarationIDToStyleRule.set(property.range.startLine, styleRule);
      }
    }
  }
  return { declarationIDToStyleRule, styleRuleIDToStyleRule };
}
//# sourceMappingURL=utils.js.map

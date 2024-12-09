"use strict";
import * as i18n from "../../core/i18n/i18n.js";
import * as Protocol from "../../generated/protocol.js";
import { Issue, IssueCategory, IssueKind } from "./Issue.js";
const UIStrings = {
  /**
   *@description Label for the link for CORS private network issues
   */
  corsPrivateNetworkAccess: "Private Network Access",
  /**
   *@description Label for the link for CORS network issues
   */
  CORS: "Cross-Origin Resource Sharing (`CORS`)"
};
const str_ = i18n.i18n.registerUIStrings("models/issues_manager/CorsIssue.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
export var IssueCode = /* @__PURE__ */ ((IssueCode2) => {
  IssueCode2["INSECURE_PRIVATE_NETWORK"] = "CorsIssue::InsecurePrivateNetwork";
  IssueCode2["INVALID_HEADER_VALUES"] = "CorsIssue::InvalidHeaders";
  IssueCode2["WILDCARD_ORIGN_NOT_ALLOWED"] = "CorsIssue::WildcardOriginWithCredentials";
  IssueCode2["PREFLIGHT_RESPONSE_INVALID"] = "CorsIssue::PreflightResponseInvalid";
  IssueCode2["ORIGIN_MISMATCH"] = "CorsIssue::OriginMismatch";
  IssueCode2["ALLOW_CREDENTIALS_REQUIRED"] = "CorsIssue::AllowCredentialsRequired";
  IssueCode2["METHOD_DISALLOWED_BY_PREFLIGHT_RESPONSE"] = "CorsIssue::MethodDisallowedByPreflightResponse";
  IssueCode2["HEADER_DISALLOWED_BY_PREFLIGHT_RESPONSE"] = "CorsIssue::HeaderDisallowedByPreflightResponse";
  IssueCode2["REDIRECT_CONTAINS_CREDENTIALS"] = "CorsIssue::RedirectContainsCredentials";
  IssueCode2["DISALLOWED_BY_MODE"] = "CorsIssue::DisallowedByMode";
  IssueCode2["CORS_DISABLED_SCHEME"] = "CorsIssue::CorsDisabledScheme";
  IssueCode2["PREFLIGHT_MISSING_ALLOW_EXTERNAL"] = "CorsIssue::PreflightMissingAllowExternal";
  IssueCode2["PREFLIGHT_INVALID_ALLOW_EXTERNAL"] = "CorsIssue::PreflightInvalidAllowExternal";
  IssueCode2["NO_CORS_REDIRECT_MODE_NOT_FOLLOW"] = "CorsIssue::NoCorsRedirectModeNotFollow";
  IssueCode2["INVALID_PRIVATE_NETWORK_ACCESS"] = "CorsIssue::InvalidPrivateNetworkAccess";
  IssueCode2["UNEXPECTED_PRIVATE_NETWORK_ACCESS"] = "CorsIssue::UnexpectedPrivateNetworkAccess";
  IssueCode2["PREFLIGHT_ALLOW_PRIVATE_NETWORK_ERROR"] = "CorsIssue::PreflightAllowPrivateNetworkError";
  IssueCode2["PREFLIGHT_MISSING_PRIVATE_NETWORK_ACCESS_ID"] = "CorsIssue::PreflightMissingPrivateNetworkAccessId";
  IssueCode2["PREFLIGHT_MISSING_PRIVATE_NETWORK_ACCESS_NAME"] = "CorsIssue::PreflightMissingPrivateNetworkAccessName";
  IssueCode2["PRIVATE_NETWORK_ACCESS_PERMISSION_UNAVAILABLE"] = "CorsIssue::PrivateNetworkAccessPermissionUnavailable";
  IssueCode2["PRIVATE_NETWORK_ACCESS_PERMISSION_DENIED"] = "CorsIssue::PrivateNetworkAccessPermissionDenied";
  return IssueCode2;
})(IssueCode || {});
function getIssueCode(details) {
  switch (details.corsErrorStatus.corsError) {
    case Protocol.Network.CorsError.InvalidAllowMethodsPreflightResponse:
    case Protocol.Network.CorsError.InvalidAllowHeadersPreflightResponse:
    case Protocol.Network.CorsError.PreflightMissingAllowOriginHeader:
    case Protocol.Network.CorsError.PreflightMultipleAllowOriginValues:
    case Protocol.Network.CorsError.PreflightInvalidAllowOriginValue:
    case Protocol.Network.CorsError.MissingAllowOriginHeader:
    case Protocol.Network.CorsError.MultipleAllowOriginValues:
    case Protocol.Network.CorsError.InvalidAllowOriginValue:
      return "CorsIssue::InvalidHeaders" /* INVALID_HEADER_VALUES */;
    case Protocol.Network.CorsError.PreflightWildcardOriginNotAllowed:
    case Protocol.Network.CorsError.WildcardOriginNotAllowed:
      return "CorsIssue::WildcardOriginWithCredentials" /* WILDCARD_ORIGN_NOT_ALLOWED */;
    case Protocol.Network.CorsError.PreflightInvalidStatus:
    case Protocol.Network.CorsError.PreflightDisallowedRedirect:
    case Protocol.Network.CorsError.InvalidResponse:
      return "CorsIssue::PreflightResponseInvalid" /* PREFLIGHT_RESPONSE_INVALID */;
    case Protocol.Network.CorsError.AllowOriginMismatch:
    case Protocol.Network.CorsError.PreflightAllowOriginMismatch:
      return "CorsIssue::OriginMismatch" /* ORIGIN_MISMATCH */;
    case Protocol.Network.CorsError.InvalidAllowCredentials:
    case Protocol.Network.CorsError.PreflightInvalidAllowCredentials:
      return "CorsIssue::AllowCredentialsRequired" /* ALLOW_CREDENTIALS_REQUIRED */;
    case Protocol.Network.CorsError.MethodDisallowedByPreflightResponse:
      return "CorsIssue::MethodDisallowedByPreflightResponse" /* METHOD_DISALLOWED_BY_PREFLIGHT_RESPONSE */;
    case Protocol.Network.CorsError.HeaderDisallowedByPreflightResponse:
      return "CorsIssue::HeaderDisallowedByPreflightResponse" /* HEADER_DISALLOWED_BY_PREFLIGHT_RESPONSE */;
    case Protocol.Network.CorsError.RedirectContainsCredentials:
      return "CorsIssue::RedirectContainsCredentials" /* REDIRECT_CONTAINS_CREDENTIALS */;
    case Protocol.Network.CorsError.DisallowedByMode:
      return "CorsIssue::DisallowedByMode" /* DISALLOWED_BY_MODE */;
    case Protocol.Network.CorsError.CorsDisabledScheme:
      return "CorsIssue::CorsDisabledScheme" /* CORS_DISABLED_SCHEME */;
    case Protocol.Network.CorsError.PreflightMissingAllowExternal:
      return "CorsIssue::PreflightMissingAllowExternal" /* PREFLIGHT_MISSING_ALLOW_EXTERNAL */;
    case Protocol.Network.CorsError.PreflightInvalidAllowExternal:
      return "CorsIssue::PreflightInvalidAllowExternal" /* PREFLIGHT_INVALID_ALLOW_EXTERNAL */;
    case Protocol.Network.CorsError.InsecurePrivateNetwork:
      return "CorsIssue::InsecurePrivateNetwork" /* INSECURE_PRIVATE_NETWORK */;
    case Protocol.Network.CorsError.NoCorsRedirectModeNotFollow:
      return "CorsIssue::NoCorsRedirectModeNotFollow" /* NO_CORS_REDIRECT_MODE_NOT_FOLLOW */;
    case Protocol.Network.CorsError.InvalidPrivateNetworkAccess:
      return "CorsIssue::InvalidPrivateNetworkAccess" /* INVALID_PRIVATE_NETWORK_ACCESS */;
    case Protocol.Network.CorsError.UnexpectedPrivateNetworkAccess:
      return "CorsIssue::UnexpectedPrivateNetworkAccess" /* UNEXPECTED_PRIVATE_NETWORK_ACCESS */;
    case Protocol.Network.CorsError.PreflightMissingAllowPrivateNetwork:
    case Protocol.Network.CorsError.PreflightInvalidAllowPrivateNetwork:
      return "CorsIssue::PreflightAllowPrivateNetworkError" /* PREFLIGHT_ALLOW_PRIVATE_NETWORK_ERROR */;
    case Protocol.Network.CorsError.PreflightMissingPrivateNetworkAccessId:
      return "CorsIssue::PreflightMissingPrivateNetworkAccessId" /* PREFLIGHT_MISSING_PRIVATE_NETWORK_ACCESS_ID */;
    case Protocol.Network.CorsError.PreflightMissingPrivateNetworkAccessName:
      return "CorsIssue::PreflightMissingPrivateNetworkAccessName" /* PREFLIGHT_MISSING_PRIVATE_NETWORK_ACCESS_NAME */;
    case Protocol.Network.CorsError.PrivateNetworkAccessPermissionUnavailable:
      return "CorsIssue::PrivateNetworkAccessPermissionUnavailable" /* PRIVATE_NETWORK_ACCESS_PERMISSION_UNAVAILABLE */;
    case Protocol.Network.CorsError.PrivateNetworkAccessPermissionDenied:
      return "CorsIssue::PrivateNetworkAccessPermissionDenied" /* PRIVATE_NETWORK_ACCESS_PERMISSION_DENIED */;
  }
}
export class CorsIssue extends Issue {
  #issueDetails;
  constructor(issueDetails, issuesModel, issueId) {
    super(getIssueCode(issueDetails), issuesModel, issueId);
    this.#issueDetails = issueDetails;
  }
  getCategory() {
    return IssueCategory.CORS;
  }
  details() {
    return this.#issueDetails;
  }
  getDescription() {
    switch (getIssueCode(this.#issueDetails)) {
      case "CorsIssue::InsecurePrivateNetwork" /* INSECURE_PRIVATE_NETWORK */:
        return {
          file: "corsInsecurePrivateNetwork.md",
          links: [{
            link: "https://developer.chrome.com/blog/private-network-access-update",
            linkTitle: i18nString(UIStrings.corsPrivateNetworkAccess)
          }]
        };
      case "CorsIssue::PreflightAllowPrivateNetworkError" /* PREFLIGHT_ALLOW_PRIVATE_NETWORK_ERROR */:
        return {
          file: "corsPreflightAllowPrivateNetworkError.md",
          links: [{
            link: "https://developer.chrome.com/blog/private-network-access-update",
            linkTitle: i18nString(UIStrings.corsPrivateNetworkAccess)
          }]
        };
      case "CorsIssue::InvalidHeaders" /* INVALID_HEADER_VALUES */:
        return {
          file: "corsInvalidHeaderValues.md",
          links: [{
            link: "https://web.dev/cross-origin-resource-sharing",
            linkTitle: i18nString(UIStrings.CORS)
          }]
        };
      case "CorsIssue::WildcardOriginWithCredentials" /* WILDCARD_ORIGN_NOT_ALLOWED */:
        return {
          file: "corsWildcardOriginNotAllowed.md",
          links: [{
            link: "https://web.dev/cross-origin-resource-sharing",
            linkTitle: i18nString(UIStrings.CORS)
          }]
        };
      case "CorsIssue::PreflightResponseInvalid" /* PREFLIGHT_RESPONSE_INVALID */:
        return {
          file: "corsPreflightResponseInvalid.md",
          links: [{
            link: "https://web.dev/cross-origin-resource-sharing",
            linkTitle: i18nString(UIStrings.CORS)
          }]
        };
      case "CorsIssue::OriginMismatch" /* ORIGIN_MISMATCH */:
        return {
          file: "corsOriginMismatch.md",
          links: [{
            link: "https://web.dev/cross-origin-resource-sharing",
            linkTitle: i18nString(UIStrings.CORS)
          }]
        };
      case "CorsIssue::AllowCredentialsRequired" /* ALLOW_CREDENTIALS_REQUIRED */:
        return {
          file: "corsAllowCredentialsRequired.md",
          links: [{
            link: "https://web.dev/cross-origin-resource-sharing",
            linkTitle: i18nString(UIStrings.CORS)
          }]
        };
      case "CorsIssue::MethodDisallowedByPreflightResponse" /* METHOD_DISALLOWED_BY_PREFLIGHT_RESPONSE */:
        return {
          file: "corsMethodDisallowedByPreflightResponse.md",
          links: [{
            link: "https://web.dev/cross-origin-resource-sharing",
            linkTitle: i18nString(UIStrings.CORS)
          }]
        };
      case "CorsIssue::HeaderDisallowedByPreflightResponse" /* HEADER_DISALLOWED_BY_PREFLIGHT_RESPONSE */:
        return {
          file: "corsHeaderDisallowedByPreflightResponse.md",
          links: [{
            link: "https://web.dev/cross-origin-resource-sharing",
            linkTitle: i18nString(UIStrings.CORS)
          }]
        };
      case "CorsIssue::RedirectContainsCredentials" /* REDIRECT_CONTAINS_CREDENTIALS */:
        return {
          file: "corsRedirectContainsCredentials.md",
          links: [{
            link: "https://web.dev/cross-origin-resource-sharing",
            linkTitle: i18nString(UIStrings.CORS)
          }]
        };
      case "CorsIssue::DisallowedByMode" /* DISALLOWED_BY_MODE */:
        return {
          file: "corsDisallowedByMode.md",
          links: [{
            link: "https://web.dev/cross-origin-resource-sharing",
            linkTitle: i18nString(UIStrings.CORS)
          }]
        };
      case "CorsIssue::CorsDisabledScheme" /* CORS_DISABLED_SCHEME */:
        return {
          file: "corsDisabledScheme.md",
          links: [{
            link: "https://web.dev/cross-origin-resource-sharing",
            linkTitle: i18nString(UIStrings.CORS)
          }]
        };
      case "CorsIssue::NoCorsRedirectModeNotFollow" /* NO_CORS_REDIRECT_MODE_NOT_FOLLOW */:
        return {
          file: "corsNoCorsRedirectModeNotFollow.md",
          links: [{
            link: "https://web.dev/cross-origin-resource-sharing",
            linkTitle: i18nString(UIStrings.CORS)
          }]
        };
      // TODO(1462857): Change the link after we have a blog post for PNA
      // permission prompt.
      case "CorsIssue::PreflightMissingPrivateNetworkAccessId" /* PREFLIGHT_MISSING_PRIVATE_NETWORK_ACCESS_ID */:
      case "CorsIssue::PreflightMissingPrivateNetworkAccessName" /* PREFLIGHT_MISSING_PRIVATE_NETWORK_ACCESS_NAME */:
        return {
          file: "corsPrivateNetworkPermissionDenied.md",
          links: [{
            link: "https://developer.chrome.com/blog/private-network-access-update",
            linkTitle: i18nString(UIStrings.corsPrivateNetworkAccess)
          }]
        };
      case "CorsIssue::PreflightMissingAllowExternal" /* PREFLIGHT_MISSING_ALLOW_EXTERNAL */:
      case "CorsIssue::PreflightInvalidAllowExternal" /* PREFLIGHT_INVALID_ALLOW_EXTERNAL */:
      case "CorsIssue::InvalidPrivateNetworkAccess" /* INVALID_PRIVATE_NETWORK_ACCESS */:
      case "CorsIssue::UnexpectedPrivateNetworkAccess" /* UNEXPECTED_PRIVATE_NETWORK_ACCESS */:
      case "CorsIssue::PrivateNetworkAccessPermissionUnavailable" /* PRIVATE_NETWORK_ACCESS_PERMISSION_UNAVAILABLE */:
      case "CorsIssue::PrivateNetworkAccessPermissionDenied" /* PRIVATE_NETWORK_ACCESS_PERMISSION_DENIED */:
        return null;
    }
  }
  primaryKey() {
    return JSON.stringify(this.#issueDetails);
  }
  getKind() {
    if (this.#issueDetails.isWarning && (this.#issueDetails.corsErrorStatus.corsError === Protocol.Network.CorsError.InsecurePrivateNetwork || this.#issueDetails.corsErrorStatus.corsError === Protocol.Network.CorsError.PreflightMissingAllowPrivateNetwork || this.#issueDetails.corsErrorStatus.corsError === Protocol.Network.CorsError.PreflightInvalidAllowPrivateNetwork)) {
      return IssueKind.BREAKING_CHANGE;
    }
    return IssueKind.PAGE_ERROR;
  }
  static fromInspectorIssue(issuesModel, inspectorIssue) {
    const corsIssueDetails = inspectorIssue.details.corsIssueDetails;
    if (!corsIssueDetails) {
      console.warn("Cors issue without details received.");
      return [];
    }
    return [new CorsIssue(corsIssueDetails, issuesModel, inspectorIssue.issueId)];
  }
}
//# sourceMappingURL=CorsIssue.js.map

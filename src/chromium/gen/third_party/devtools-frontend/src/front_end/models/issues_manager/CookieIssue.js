"use strict";
import * as Common from "../../core/common/common.js";
import * as i18n from "../../core/i18n/i18n.js";
import * as SDK from "../../core/sdk/sdk.js";
import * as Protocol from "../../generated/protocol.js";
import * as ThirdPartyWeb from "../../third_party/third-party-web/third-party-web.js";
import { Issue, IssueCategory, IssueKind } from "./Issue.js";
import {
  resolveLazyDescription
} from "./MarkdownIssueDescription.js";
const UIStrings = {
  /**
   *@description Label for the link for SameSiteCookies Issues
   */
  samesiteCookiesExplained: "SameSite cookies explained",
  /**
   *@description Label for the link for Schemeful Same-Site Issues
   */
  howSchemefulSamesiteWorks: "How Schemeful Same-Site Works",
  /**
   *@description Phrase used to describe the security of a context. Substitued like 'a secure context' or 'a secure origin'.
   */
  aSecure: "a secure",
  // eslint-disable-line rulesdir/l10n_no_unused_message
  /**
   * @description Phrase used to describe the security of a context. Substitued like 'an insecure context' or 'an insecure origin'.
   */
  anInsecure: "an insecure",
  // eslint-disable-line rulesdir/l10n_no_unused_message
  /**
   * @description Label for a link for SameParty Issues. 'Attribute' refers to a cookie attribute.
   */
  firstPartySetsExplained: "`First-Party Sets` and the `SameParty` attribute",
  /**
   * @description Label for a link for third-party cookie Issues.
   */
  thirdPartyPhaseoutExplained: "Changes to Chrome's treatment of third-party cookies",
  /**
   * @description Label for a link for cross-site redirect Issues.
   */
  fileCrosSiteRedirectBug: "File a bug",
  /**
   * @description text to show in Console panel when a third-party cookie accessed.
   */
  consoleTpcdWarningMessage: "Chrome is moving towards a new experience that allows users to choose to browse without third-party cookies.",
  /**
   * @description text to show in Console panel when a third-party cookie is blocked in Chrome.
   */
  consoleTpcdErrorMessage: "Third-party cookie is blocked in Chrome either because of Chrome flags or browser configuration."
};
const str_ = i18n.i18n.registerUIStrings("models/issues_manager/CookieIssue.ts", UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(void 0, str_);
export var CookieIssueSubCategory = /* @__PURE__ */ ((CookieIssueSubCategory2) => {
  CookieIssueSubCategory2["GENERIC_COOKIE"] = "GenericCookie";
  CookieIssueSubCategory2["SAME_SITE_COOKIE"] = "SameSiteCookie";
  CookieIssueSubCategory2["THIRD_PARTY_PHASEOUT_COOKIE"] = "ThirdPartyPhaseoutCookie";
  return CookieIssueSubCategory2;
})(CookieIssueSubCategory || {});
export var CookieStatus = /* @__PURE__ */ ((CookieStatus2) => {
  CookieStatus2[CookieStatus2["BLOCKED"] = 0] = "BLOCKED";
  CookieStatus2[CookieStatus2["ALLOWED"] = 1] = "ALLOWED";
  CookieStatus2[CookieStatus2["ALLOWED_BY_GRACE_PERIOD"] = 2] = "ALLOWED_BY_GRACE_PERIOD";
  CookieStatus2[CookieStatus2["ALLOWED_BY_HEURISTICS"] = 3] = "ALLOWED_BY_HEURISTICS";
  return CookieStatus2;
})(CookieStatus || {});
export class CookieIssue extends Issue {
  #issueDetails;
  constructor(code, issueDetails, issuesModel, issueId) {
    super(code, issuesModel, issueId);
    this.#issueDetails = issueDetails;
  }
  cookieId() {
    if (this.#issueDetails.cookie) {
      const { domain, path, name } = this.#issueDetails.cookie;
      const cookieId = `${domain};${path};${name}`;
      return cookieId;
    }
    return this.#issueDetails.rawCookieLine ?? "no-cookie-info";
  }
  primaryKey() {
    const requestId = this.#issueDetails.request ? this.#issueDetails.request.requestId : "no-request";
    return `${this.code()}-(${this.cookieId()})-(${requestId})`;
  }
  /**
   * Returns an array of issues from a given CookieIssueDetails.
   */
  static createIssuesFromCookieIssueDetails(cookieIssueDetails, issuesModel, issueId) {
    const issues = [];
    if (cookieIssueDetails.cookieExclusionReasons && cookieIssueDetails.cookieExclusionReasons.length > 0) {
      for (const exclusionReason of cookieIssueDetails.cookieExclusionReasons) {
        const code = CookieIssue.codeForCookieIssueDetails(
          exclusionReason,
          cookieIssueDetails.cookieWarningReasons,
          cookieIssueDetails.operation,
          cookieIssueDetails.cookieUrl
        );
        if (code) {
          issues.push(new CookieIssue(code, cookieIssueDetails, issuesModel, issueId));
        }
      }
      return issues;
    }
    if (cookieIssueDetails.cookieWarningReasons) {
      for (const warningReason of cookieIssueDetails.cookieWarningReasons) {
        const code = CookieIssue.codeForCookieIssueDetails(
          warningReason,
          [],
          cookieIssueDetails.operation,
          cookieIssueDetails.cookieUrl
        );
        if (code) {
          issues.push(new CookieIssue(code, cookieIssueDetails, issuesModel, issueId));
        }
      }
    }
    return issues;
  }
  /**
   * Calculates an issue code from a reason, an operation, and an array of warningReasons. All these together
   * can uniquely identify a specific cookie issue.
   * warningReasons is only needed for some CookieExclusionReason in order to determine if an issue should be raised.
   * It is not required if reason is a CookieWarningReason.
   *
   * The issue code will be mapped to a CookieIssueSubCategory enum for metric purpose.
   */
  static codeForCookieIssueDetails(reason, warningReasons, operation, cookieUrl) {
    const isURLSecure = cookieUrl && (Common.ParsedURL.schemeIs(cookieUrl, "https:") || Common.ParsedURL.schemeIs(cookieUrl, "wss:"));
    const secure = isURLSecure ? "Secure" : "Insecure";
    if (reason === Protocol.Audits.CookieExclusionReason.ExcludeSameSiteStrict || reason === Protocol.Audits.CookieExclusionReason.ExcludeSameSiteLax || reason === Protocol.Audits.CookieExclusionReason.ExcludeSameSiteUnspecifiedTreatedAsLax) {
      if (warningReasons && warningReasons.length > 0) {
        if (warningReasons.includes(Protocol.Audits.CookieWarningReason.WarnSameSiteStrictLaxDowngradeStrict)) {
          return [
            Protocol.Audits.InspectorIssueCode.CookieIssue,
            "ExcludeNavigationContextDowngrade",
            secure
          ].join("::");
        }
        if (warningReasons.includes(Protocol.Audits.CookieWarningReason.WarnSameSiteStrictCrossDowngradeStrict) || warningReasons.includes(Protocol.Audits.CookieWarningReason.WarnSameSiteStrictCrossDowngradeLax) || warningReasons.includes(Protocol.Audits.CookieWarningReason.WarnSameSiteLaxCrossDowngradeStrict) || warningReasons.includes(Protocol.Audits.CookieWarningReason.WarnSameSiteLaxCrossDowngradeLax)) {
          return [
            Protocol.Audits.InspectorIssueCode.CookieIssue,
            "ExcludeContextDowngrade",
            operation,
            secure
          ].join("::");
        }
      }
      if (warningReasons.includes(Protocol.Audits.CookieWarningReason.WarnCrossSiteRedirectDowngradeChangesInclusion)) {
        return [
          Protocol.Audits.InspectorIssueCode.CookieIssue,
          "CrossSiteRedirectDowngradeChangesInclusion"
        ].join("::");
      }
      if (reason === Protocol.Audits.CookieExclusionReason.ExcludeSameSiteUnspecifiedTreatedAsLax) {
        return [Protocol.Audits.InspectorIssueCode.CookieIssue, reason, operation].join("::");
      }
      return null;
    }
    if (reason === Protocol.Audits.CookieWarningReason.WarnSameSiteStrictLaxDowngradeStrict) {
      return [Protocol.Audits.InspectorIssueCode.CookieIssue, reason, secure].join("::");
    }
    if (reason === Protocol.Audits.CookieWarningReason.WarnSameSiteStrictCrossDowngradeStrict || reason === Protocol.Audits.CookieWarningReason.WarnSameSiteStrictCrossDowngradeLax || reason === Protocol.Audits.CookieWarningReason.WarnSameSiteLaxCrossDowngradeLax || reason === Protocol.Audits.CookieWarningReason.WarnSameSiteLaxCrossDowngradeStrict) {
      return [Protocol.Audits.InspectorIssueCode.CookieIssue, "WarnCrossDowngrade", operation, secure].join("::");
    }
    if (reason === Protocol.Audits.CookieExclusionReason.ExcludePortMismatch) {
      return [Protocol.Audits.InspectorIssueCode.CookieIssue, "ExcludePortMismatch"].join("::");
    }
    if (reason === Protocol.Audits.CookieExclusionReason.ExcludeSchemeMismatch) {
      return [Protocol.Audits.InspectorIssueCode.CookieIssue, "ExcludeSchemeMismatch"].join("::");
    }
    return [Protocol.Audits.InspectorIssueCode.CookieIssue, reason, operation].join("::");
  }
  cookies() {
    if (this.#issueDetails.cookie) {
      return [this.#issueDetails.cookie];
    }
    return [];
  }
  rawCookieLines() {
    if (this.#issueDetails.rawCookieLine) {
      return [this.#issueDetails.rawCookieLine];
    }
    return [];
  }
  requests() {
    if (this.#issueDetails.request) {
      return [this.#issueDetails.request];
    }
    return [];
  }
  getCategory() {
    return IssueCategory.COOKIE;
  }
  getDescription() {
    const description = issueDescriptions.get(this.code());
    if (!description) {
      return null;
    }
    return resolveLazyDescription(description);
  }
  isCausedByThirdParty() {
    const outermostFrame = SDK.FrameManager.FrameManager.instance().getOutermostFrame();
    return isCausedByThirdParty(outermostFrame, this.#issueDetails.cookieUrl, this.#issueDetails.siteForCookies);
  }
  getKind() {
    if (this.#issueDetails.cookieExclusionReasons?.length > 0) {
      return IssueKind.PAGE_ERROR;
    }
    return IssueKind.BREAKING_CHANGE;
  }
  makeCookieReportEntry() {
    const status = CookieIssue.getCookieStatus(this.#issueDetails);
    if (this.#issueDetails.cookie && this.#issueDetails.cookieUrl && status !== void 0) {
      const entity = ThirdPartyWeb.ThirdPartyWeb.getEntity(this.#issueDetails.cookieUrl);
      return {
        name: this.#issueDetails.cookie.name,
        domain: this.#issueDetails.cookie.domain,
        type: entity?.category,
        platform: entity?.name,
        status,
        insight: this.#issueDetails.insight
      };
    }
    return;
  }
  static getCookieStatus(cookieIssueDetails) {
    if (cookieIssueDetails.cookieExclusionReasons.includes(
      Protocol.Audits.CookieExclusionReason.ExcludeThirdPartyPhaseout
    )) {
      return 0 /* BLOCKED */;
    }
    if (cookieIssueDetails.cookieWarningReasons.includes(
      Protocol.Audits.CookieWarningReason.WarnDeprecationTrialMetadata
    )) {
      return 2 /* ALLOWED_BY_GRACE_PERIOD */;
    }
    if (cookieIssueDetails.cookieWarningReasons.includes(
      Protocol.Audits.CookieWarningReason.WarnThirdPartyCookieHeuristic
    )) {
      return 3 /* ALLOWED_BY_HEURISTICS */;
    }
    if (cookieIssueDetails.cookieWarningReasons.includes(Protocol.Audits.CookieWarningReason.WarnThirdPartyPhaseout)) {
      return 1 /* ALLOWED */;
    }
    return;
  }
  static fromInspectorIssue(issuesModel, inspectorIssue) {
    const cookieIssueDetails = inspectorIssue.details.cookieIssueDetails;
    if (!cookieIssueDetails) {
      console.warn("Cookie issue without details received.");
      return [];
    }
    return CookieIssue.createIssuesFromCookieIssueDetails(cookieIssueDetails, issuesModel, inspectorIssue.issueId);
  }
  static getSubCategory(code) {
    if (code.includes("SameSite") || code.includes("Downgrade")) {
      return "SameSiteCookie" /* SAME_SITE_COOKIE */;
    }
    if (code.includes("ThirdPartyPhaseout")) {
      return "ThirdPartyPhaseoutCookie" /* THIRD_PARTY_PHASEOUT_COOKIE */;
    }
    return "GenericCookie" /* GENERIC_COOKIE */;
  }
  maybeCreateConsoleMessage() {
    const issuesModel = this.model();
    if (issuesModel && CookieIssue.getSubCategory(this.code()) === "ThirdPartyPhaseoutCookie" /* THIRD_PARTY_PHASEOUT_COOKIE */) {
      return new SDK.ConsoleModel.ConsoleMessage(
        issuesModel.target().model(SDK.RuntimeModel.RuntimeModel),
        Common.Console.FrontendMessageSource.ISSUE_PANEL,
        Protocol.Log.LogEntryLevel.Warning,
        this.getKind() === IssueKind.PAGE_ERROR ? UIStrings.consoleTpcdErrorMessage : UIStrings.consoleTpcdWarningMessage,
        {
          url: this.#issueDetails.request?.url,
          affectedResources: { requestId: this.#issueDetails.request?.requestId, issueId: this.issueId }
        }
      );
    }
    return;
  }
}
export function isCausedByThirdParty(outermostFrame, cookieUrl, siteForCookies) {
  if (!outermostFrame) {
    return true;
  }
  if (!siteForCookies) {
    return true;
  }
  if (!cookieUrl || outermostFrame.domainAndRegistry() === "") {
    return false;
  }
  const parsedCookieUrl = Common.ParsedURL.ParsedURL.fromString(cookieUrl);
  if (!parsedCookieUrl) {
    return false;
  }
  return !isSubdomainOf(parsedCookieUrl.domain(), outermostFrame.domainAndRegistry());
}
function isSubdomainOf(subdomain, superdomain) {
  if (subdomain.length <= superdomain.length) {
    return subdomain === superdomain;
  }
  if (!subdomain.endsWith(superdomain)) {
    return false;
  }
  const subdomainWithoutSuperdomian = subdomain.substr(0, subdomain.length - superdomain.length);
  return subdomainWithoutSuperdomian.endsWith(".");
}
const sameSiteUnspecifiedWarnRead = {
  file: "SameSiteUnspecifiedLaxAllowUnsafeRead.md",
  links: [
    {
      link: "https://web.dev/samesite-cookies-explained/",
      linkTitle: i18nLazyString(UIStrings.samesiteCookiesExplained)
    }
  ]
};
const sameSiteUnspecifiedWarnSet = {
  file: "SameSiteUnspecifiedLaxAllowUnsafeSet.md",
  links: [
    {
      link: "https://web.dev/samesite-cookies-explained/",
      linkTitle: i18nLazyString(UIStrings.samesiteCookiesExplained)
    }
  ]
};
const sameSiteNoneInsecureErrorRead = {
  file: "SameSiteNoneInsecureErrorRead.md",
  links: [
    {
      link: "https://web.dev/samesite-cookies-explained/",
      linkTitle: i18nLazyString(UIStrings.samesiteCookiesExplained)
    }
  ]
};
const sameSiteNoneInsecureErrorSet = {
  file: "SameSiteNoneInsecureErrorSet.md",
  links: [
    {
      link: "https://web.dev/samesite-cookies-explained/",
      linkTitle: i18nLazyString(UIStrings.samesiteCookiesExplained)
    }
  ]
};
const sameSiteNoneInsecureWarnRead = {
  file: "SameSiteNoneInsecureWarnRead.md",
  links: [
    {
      link: "https://web.dev/samesite-cookies-explained/",
      linkTitle: i18nLazyString(UIStrings.samesiteCookiesExplained)
    }
  ]
};
const sameSiteNoneInsecureWarnSet = {
  file: "SameSiteNoneInsecureWarnSet.md",
  links: [
    {
      link: "https://web.dev/samesite-cookies-explained/",
      linkTitle: i18nLazyString(UIStrings.samesiteCookiesExplained)
    }
  ]
};
const schemefulSameSiteArticles = [{ link: "https://web.dev/schemeful-samesite/", linkTitle: i18nLazyString(UIStrings.howSchemefulSamesiteWorks) }];
function schemefulSameSiteSubstitutions({ isDestinationSecure, isOriginSecure }) {
  return /* @__PURE__ */ new Map([
    // TODO(crbug.com/1168438): Use translated phrases once the issue description is localized.
    ["PLACEHOLDER_destination", () => isDestinationSecure ? "a secure" : "an insecure"],
    ["PLACEHOLDER_origin", () => isOriginSecure ? "a secure" : "an insecure"]
  ]);
}
function sameSiteWarnStrictLaxDowngradeStrict(isSecure) {
  return {
    file: "SameSiteWarnStrictLaxDowngradeStrict.md",
    substitutions: schemefulSameSiteSubstitutions({ isDestinationSecure: isSecure, isOriginSecure: !isSecure }),
    links: schemefulSameSiteArticles
  };
}
function sameSiteExcludeNavigationContextDowngrade(isSecure) {
  return {
    file: "SameSiteExcludeNavigationContextDowngrade.md",
    substitutions: schemefulSameSiteSubstitutions({ isDestinationSecure: isSecure, isOriginSecure: !isSecure }),
    links: schemefulSameSiteArticles
  };
}
function sameSiteWarnCrossDowngradeRead(isSecure) {
  return {
    file: "SameSiteWarnCrossDowngradeRead.md",
    substitutions: schemefulSameSiteSubstitutions({ isDestinationSecure: isSecure, isOriginSecure: !isSecure }),
    links: schemefulSameSiteArticles
  };
}
function sameSiteExcludeContextDowngradeRead(isSecure) {
  return {
    file: "SameSiteExcludeContextDowngradeRead.md",
    substitutions: schemefulSameSiteSubstitutions({ isDestinationSecure: isSecure, isOriginSecure: !isSecure }),
    links: schemefulSameSiteArticles
  };
}
function sameSiteWarnCrossDowngradeSet(isSecure) {
  return {
    file: "SameSiteWarnCrossDowngradeSet.md",
    substitutions: schemefulSameSiteSubstitutions({ isDestinationSecure: !isSecure, isOriginSecure: isSecure }),
    links: schemefulSameSiteArticles
  };
}
function sameSiteExcludeContextDowngradeSet(isSecure) {
  return {
    file: "SameSiteExcludeContextDowngradeSet.md",
    substitutions: schemefulSameSiteSubstitutions({ isDestinationSecure: isSecure, isOriginSecure: !isSecure }),
    links: schemefulSameSiteArticles
  };
}
const sameSiteInvalidSameParty = {
  file: "SameSiteInvalidSameParty.md",
  links: [{
    link: "https://developer.chrome.com/blog/first-party-sets-sameparty/",
    linkTitle: i18nLazyString(UIStrings.firstPartySetsExplained)
  }]
};
const samePartyCrossPartyContextSet = {
  file: "SameSiteSamePartyCrossPartyContextSet.md",
  links: [{
    link: "https://developer.chrome.com/blog/first-party-sets-sameparty/",
    linkTitle: i18nLazyString(UIStrings.firstPartySetsExplained)
  }]
};
const attributeValueExceedsMaxSize = {
  file: "CookieAttributeValueExceedsMaxSize.md",
  links: []
};
const warnDomainNonAscii = {
  file: "cookieWarnDomainNonAscii.md",
  links: []
};
const excludeDomainNonAscii = {
  file: "cookieExcludeDomainNonAscii.md",
  links: []
};
const excludeBlockedWithinRelatedWebsiteSet = {
  file: "cookieExcludeBlockedWithinRelatedWebsiteSet.md",
  links: []
};
const cookieWarnThirdPartyPhaseoutSet = {
  file: "cookieWarnThirdPartyPhaseoutSet.md",
  links: [{
    link: "https://goo.gle/3pc-dev-issue",
    linkTitle: i18nLazyString(UIStrings.thirdPartyPhaseoutExplained)
  }]
};
const cookieWarnThirdPartyPhaseoutRead = {
  file: "cookieWarnThirdPartyPhaseoutRead.md",
  links: [{
    link: "https://goo.gle/3pc-dev-issue",
    linkTitle: i18nLazyString(UIStrings.thirdPartyPhaseoutExplained)
  }]
};
const cookieExcludeThirdPartyPhaseoutSet = {
  file: "cookieExcludeThirdPartyPhaseoutSet.md",
  links: [{
    link: "https://goo.gle/report-3pc-dev-issue",
    linkTitle: i18nLazyString(UIStrings.thirdPartyPhaseoutExplained)
  }]
};
const cookieExcludeThirdPartyPhaseoutRead = {
  file: "cookieExcludeThirdPartyPhaseoutRead.md",
  links: [{
    link: "https://goo.gle/report-3pc-dev-issue",
    linkTitle: i18nLazyString(UIStrings.thirdPartyPhaseoutExplained)
  }]
};
const cookieCrossSiteRedirectDowngrade = {
  file: "cookieCrossSiteRedirectDowngrade.md",
  links: [{
    link: "https://bugs.chromium.org/p/chromium/issues/entry?template=Defect%20report%20from%20user&summary=[Cross-Site Redirect Chain] <INSERT BUG SUMMARY HERE>&comment=Chrome Version: (copy from chrome://version)%0AChannel: (e.g. Canary, Dev, Beta, Stable)%0A%0AAffected URLs:%0A%0AWhat is the expected result?%0A%0AWhat happens instead?%0A%0AWhat is the purpose of the cross-site redirect?:%0A%0AWhat steps will reproduce the problem?:%0A(1)%0A(2)%0A(3)%0A%0APlease provide any additional information below.&components=Internals%3ENetwork%3ECookies",
    linkTitle: i18nLazyString(UIStrings.fileCrosSiteRedirectBug)
  }]
};
const ExcludePortMismatch = {
  file: "cookieExcludePortMismatch.md",
  links: []
};
const ExcludeSchemeMismatch = {
  file: "cookieExcludeSchemeMismatch.md",
  links: []
};
const placeholderDescriptionForInvisibleIssues = {
  file: "placeholderDescriptionForInvisibleIssues.md",
  links: []
};
const issueDescriptions = /* @__PURE__ */ new Map([
  // These two don't have a deprecation date yet, but they need to be fixed eventually.
  ["CookieIssue::WarnSameSiteUnspecifiedLaxAllowUnsafe::ReadCookie", sameSiteUnspecifiedWarnRead],
  ["CookieIssue::WarnSameSiteUnspecifiedLaxAllowUnsafe::SetCookie", sameSiteUnspecifiedWarnSet],
  ["CookieIssue::WarnSameSiteUnspecifiedCrossSiteContext::ReadCookie", sameSiteUnspecifiedWarnRead],
  ["CookieIssue::WarnSameSiteUnspecifiedCrossSiteContext::SetCookie", sameSiteUnspecifiedWarnSet],
  ["CookieIssue::ExcludeSameSiteNoneInsecure::ReadCookie", sameSiteNoneInsecureErrorRead],
  ["CookieIssue::ExcludeSameSiteNoneInsecure::SetCookie", sameSiteNoneInsecureErrorSet],
  ["CookieIssue::WarnSameSiteNoneInsecure::ReadCookie", sameSiteNoneInsecureWarnRead],
  ["CookieIssue::WarnSameSiteNoneInsecure::SetCookie", sameSiteNoneInsecureWarnSet],
  ["CookieIssue::WarnSameSiteStrictLaxDowngradeStrict::Secure", sameSiteWarnStrictLaxDowngradeStrict(true)],
  ["CookieIssue::WarnSameSiteStrictLaxDowngradeStrict::Insecure", sameSiteWarnStrictLaxDowngradeStrict(false)],
  ["CookieIssue::WarnCrossDowngrade::ReadCookie::Secure", sameSiteWarnCrossDowngradeRead(true)],
  ["CookieIssue::WarnCrossDowngrade::ReadCookie::Insecure", sameSiteWarnCrossDowngradeRead(false)],
  ["CookieIssue::WarnCrossDowngrade::SetCookie::Secure", sameSiteWarnCrossDowngradeSet(true)],
  ["CookieIssue::WarnCrossDowngrade::SetCookie::Insecure", sameSiteWarnCrossDowngradeSet(false)],
  ["CookieIssue::ExcludeNavigationContextDowngrade::Secure", sameSiteExcludeNavigationContextDowngrade(true)],
  [
    "CookieIssue::ExcludeNavigationContextDowngrade::Insecure",
    sameSiteExcludeNavigationContextDowngrade(false)
  ],
  ["CookieIssue::ExcludeContextDowngrade::ReadCookie::Secure", sameSiteExcludeContextDowngradeRead(true)],
  ["CookieIssue::ExcludeContextDowngrade::ReadCookie::Insecure", sameSiteExcludeContextDowngradeRead(false)],
  ["CookieIssue::ExcludeContextDowngrade::SetCookie::Secure", sameSiteExcludeContextDowngradeSet(true)],
  ["CookieIssue::ExcludeContextDowngrade::SetCookie::Insecure", sameSiteExcludeContextDowngradeSet(false)],
  ["CookieIssue::ExcludeInvalidSameParty::SetCookie", sameSiteInvalidSameParty],
  ["CookieIssue::ExcludeSamePartyCrossPartyContext::SetCookie", samePartyCrossPartyContextSet],
  ["CookieIssue::WarnAttributeValueExceedsMaxSize::ReadCookie", attributeValueExceedsMaxSize],
  ["CookieIssue::WarnAttributeValueExceedsMaxSize::SetCookie", attributeValueExceedsMaxSize],
  ["CookieIssue::WarnDomainNonASCII::ReadCookie", warnDomainNonAscii],
  ["CookieIssue::WarnDomainNonASCII::SetCookie", warnDomainNonAscii],
  ["CookieIssue::ExcludeDomainNonASCII::ReadCookie", excludeDomainNonAscii],
  ["CookieIssue::ExcludeDomainNonASCII::SetCookie", excludeDomainNonAscii],
  [
    "CookieIssue::ExcludeThirdPartyCookieBlockedInRelatedWebsiteSet::ReadCookie",
    excludeBlockedWithinRelatedWebsiteSet
  ],
  [
    "CookieIssue::ExcludeThirdPartyCookieBlockedInRelatedWebsiteSet::SetCookie",
    excludeBlockedWithinRelatedWebsiteSet
  ],
  ["CookieIssue::WarnThirdPartyPhaseout::ReadCookie", cookieWarnThirdPartyPhaseoutRead],
  ["CookieIssue::WarnThirdPartyPhaseout::SetCookie", cookieWarnThirdPartyPhaseoutSet],
  ["CookieIssue::WarnDeprecationTrialMetadata::ReadCookie", placeholderDescriptionForInvisibleIssues],
  ["CookieIssue::WarnDeprecationTrialMetadata::SetCookie", placeholderDescriptionForInvisibleIssues],
  ["CookieIssue::WarnThirdPartyCookieHeuristic::ReadCookie", placeholderDescriptionForInvisibleIssues],
  ["CookieIssue::WarnThirdPartyCookieHeuristic::SetCookie", placeholderDescriptionForInvisibleIssues],
  ["CookieIssue::ExcludeThirdPartyPhaseout::ReadCookie", cookieExcludeThirdPartyPhaseoutRead],
  ["CookieIssue::ExcludeThirdPartyPhaseout::SetCookie", cookieExcludeThirdPartyPhaseoutSet],
  ["CookieIssue::CrossSiteRedirectDowngradeChangesInclusion", cookieCrossSiteRedirectDowngrade],
  ["CookieIssue::ExcludePortMismatch", ExcludePortMismatch],
  ["CookieIssue::ExcludeSchemeMismatch", ExcludeSchemeMismatch]
]);
//# sourceMappingURL=CookieIssue.js.map

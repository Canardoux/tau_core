"use strict";
import * as i18n from "../../core/i18n/i18n.js";
import * as Protocol from "../../generated/protocol.js";
import { Issue, IssueCategory, IssueKind } from "./Issue.js";
const UIStrings = {
  /**
   * @description Label for a link for third-party cookie Issues.
   */
  thirdPartyPhaseoutExplained: "Changes to Chrome's treatment of third-party cookies"
};
const str_ = i18n.i18n.registerUIStrings("models/issues_manager/CookieDeprecationMetadataIssue.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
export class CookieDeprecationMetadataIssue extends Issue {
  #issueDetails;
  constructor(issueDetails, issuesModel) {
    const issueCode = Protocol.Audits.InspectorIssueCode.CookieDeprecationMetadataIssue + "_" + issueDetails.operation;
    super(issueCode, issuesModel);
    this.#issueDetails = issueDetails;
  }
  getCategory() {
    return IssueCategory.OTHER;
  }
  getDescription() {
    const fileName = this.#issueDetails.operation === "SetCookie" ? "cookieWarnMetadataGrantSet.md" : "cookieWarnMetadataGrantRead.md";
    let optOutText = "";
    if (this.#issueDetails.isOptOutTopLevel) {
      optOutText = "\n\n (Top level site opt-out: " + this.#issueDetails.optOutPercentage + "% - [learn more](gracePeriodStagedControlExplainer))";
    }
    return {
      file: fileName,
      substitutions: /* @__PURE__ */ new Map([
        ["PLACEHOLDER_topleveloptout", optOutText]
      ]),
      links: [
        {
          link: "https://goo.gle/changes-to-chrome-browsing",
          linkTitle: i18nString(UIStrings.thirdPartyPhaseoutExplained)
        }
      ]
    };
  }
  details() {
    return this.#issueDetails;
  }
  getKind() {
    return IssueKind.BREAKING_CHANGE;
  }
  primaryKey() {
    return JSON.stringify(this.#issueDetails);
  }
  static fromInspectorIssue(issuesModel, inspectorIssue) {
    const details = inspectorIssue.details.cookieDeprecationMetadataIssueDetails;
    if (!details) {
      console.warn("Cookie deprecation metadata issue without details received.");
      return [];
    }
    return [new CookieDeprecationMetadataIssue(details, issuesModel)];
  }
}
//# sourceMappingURL=CookieDeprecationMetadataIssue.js.map

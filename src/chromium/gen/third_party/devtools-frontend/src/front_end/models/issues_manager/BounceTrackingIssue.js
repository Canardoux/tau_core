"use strict";
import * as i18n from "../../core/i18n/i18n.js";
import * as Protocol from "../../generated/protocol.js";
import { Issue, IssueCategory, IssueKind } from "./Issue.js";
const UIStrings = {
  /**
   *@description Title for Bounce Tracking Mitigation explainer url link.
   */
  bounceTrackingMitigations: "Bounce tracking mitigations"
};
const str_ = i18n.i18n.registerUIStrings("models/issues_manager/BounceTrackingIssue.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
export class BounceTrackingIssue extends Issue {
  #issueDetails;
  constructor(issueDetails, issuesModel) {
    super(Protocol.Audits.InspectorIssueCode.BounceTrackingIssue, issuesModel);
    this.#issueDetails = issueDetails;
  }
  getCategory() {
    return IssueCategory.OTHER;
  }
  getDescription() {
    return {
      file: "bounceTrackingMitigations.md",
      links: [
        {
          link: "https://privacycg.github.io/nav-tracking-mitigations/#bounce-tracking-mitigations",
          linkTitle: i18nString(UIStrings.bounceTrackingMitigations)
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
  trackingSites() {
    if (this.#issueDetails.trackingSites) {
      return this.#issueDetails.trackingSites;
    }
    return [];
  }
  static fromInspectorIssue(issuesModel, inspectorIssue) {
    const details = inspectorIssue.details.bounceTrackingIssueDetails;
    if (!details) {
      console.warn("Bounce tracking issue without details received.");
      return [];
    }
    return [new BounceTrackingIssue(details, issuesModel)];
  }
}
//# sourceMappingURL=BounceTrackingIssue.js.map

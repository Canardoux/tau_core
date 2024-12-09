"use strict";
import * as Protocol from "../../generated/protocol.js";
import * as TextUtils from "../../models/text_utils/text_utils.js";
import * as Common from "../common/common.js";
import * as i18n from "../i18n/i18n.js";
import * as Platform from "../platform/platform.js";
import { Attribute } from "./Cookie.js";
import { CookieModel } from "./CookieModel.js";
import { CookieParser } from "./CookieParser.js";
import * as HttpReasonPhraseStrings from "./HttpReasonPhraseStrings.js";
import { Events as NetworkManagerEvents, NetworkManager } from "./NetworkManager.js";
import { ServerSentEvents } from "./ServerSentEvents.js";
import { ServerTiming } from "./ServerTiming.js";
import { Type } from "./Target.js";
const UIStrings = {
  /**
   *@description Text in Network Request
   */
  binary: "(binary)",
  /**
   *@description Tooltip to explain why a cookie was blocked
   */
  secureOnly: 'This cookie was blocked because it had the "`Secure`" attribute and the connection was not secure.',
  /**
   *@description Tooltip to explain why a cookie was blocked
   */
  notOnPath: "This cookie was blocked because its path was not an exact match for or a superdirectory of the request url's path.",
  /**
   *@description Tooltip to explain why a cookie was blocked
   */
  domainMismatch: "This cookie was blocked because neither did the request URL's domain exactly match the cookie's domain, nor was the request URL's domain a subdomain of the cookie's Domain attribute value.",
  /**
   *@description Tooltip to explain why a cookie was blocked
   */
  sameSiteStrict: 'This cookie was blocked because it had the "`SameSite=Strict`" attribute and the request was made from a different site. This includes top-level navigation requests initiated by other sites.',
  /**
   *@description Tooltip to explain why a cookie was blocked
   */
  sameSiteLax: 'This cookie was blocked because it had the "`SameSite=Lax`" attribute and the request was made from a different site and was not initiated by a top-level navigation.',
  /**
   *@description Tooltip to explain why a cookie was blocked
   */
  sameSiteUnspecifiedTreatedAsLax: 'This cookie didn\'t specify a "`SameSite`" attribute when it was stored and was defaulted to "SameSite=Lax," and was blocked because the request was made from a different site and was not initiated by a top-level navigation. The cookie had to have been set with "`SameSite=None`" to enable cross-site usage.',
  /**
   *@description Tooltip to explain why a cookie was blocked
   */
  sameSiteNoneInsecure: 'This cookie was blocked because it had the "`SameSite=None`" attribute but was not marked "Secure". Cookies without SameSite restrictions must be marked "Secure" and sent over a secure connection.',
  /**
   *@description Tooltip to explain why a cookie was blocked
   */
  userPreferences: "This cookie was blocked due to user preferences.",
  /**
   *@description Tooltip to explain why a cookie was blocked
   */
  thirdPartyPhaseout: "This cookie was blocked either because of Chrome flags or browser configuration. Learn more in the Issues panel.",
  /**
   *@description Tooltip to explain why a cookie was blocked
   */
  unknownError: "An unknown error was encountered when trying to send this cookie.",
  /**
   *@description Tooltip to explain why a cookie was blocked due to Schemeful Same-Site
   */
  schemefulSameSiteStrict: 'This cookie was blocked because it had the "`SameSite=Strict`" attribute but the request was cross-site. This includes top-level navigation requests initiated by other sites. This request is considered cross-site because the URL has a different scheme than the current site.',
  /**
   *@description Tooltip to explain why a cookie was blocked due to Schemeful Same-Site
   */
  schemefulSameSiteLax: 'This cookie was blocked because it had the "`SameSite=Lax`" attribute but the request was cross-site and was not initiated by a top-level navigation. This request is considered cross-site because the URL has a different scheme than the current site.',
  /**
   *@description Tooltip to explain why a cookie was blocked due to Schemeful Same-Site
   */
  schemefulSameSiteUnspecifiedTreatedAsLax: 'This cookie didn\'t specify a "`SameSite`" attribute when it was stored, was defaulted to "`SameSite=Lax"`, and was blocked because the request was cross-site and was not initiated by a top-level navigation. This request is considered cross-site because the URL has a different scheme than the current site.',
  /**
   *@description Tooltip to explain why a cookie was blocked due to SameParty
   */
  samePartyFromCrossPartyContext: "This cookie was blocked because it had the \"`SameParty`\" attribute but the request was cross-party. The request was considered cross-party because the domain of the resource's URL and the domains of the resource's enclosing frames/documents are neither owners nor members in the same First-Party Set.",
  /**
   *@description Tooltip to explain why a cookie was blocked due to exceeding the maximum size
   */
  nameValuePairExceedsMaxSize: "This cookie was blocked because it was too large. The combined size of the name and value must be less than or equal to 4096 characters.",
  /**
   *@description Tooltip to explain why an attempt to set a cookie via `Set-Cookie` HTTP header on a request's response was blocked.
   */
  thisSetcookieWasBlockedDueToUser: "This attempt to set a cookie via a `Set-Cookie` header was blocked due to user preferences.",
  /**
   *@description Tooltip to explain why an attempt to set a cookie via `Set-Cookie` HTTP header on a request's response was blocked.
   */
  thisSetcookieWasBlockedDueThirdPartyPhaseout: "Setting this cookie was blocked either because of Chrome flags or browser configuration. Learn more in the Issues panel.",
  /**
   *@description Tooltip to explain why an attempt to set a cookie via `Set-Cookie` HTTP header on a request's response was blocked.
   */
  thisSetcookieHadInvalidSyntax: "This `Set-Cookie` header had invalid syntax.",
  /**
   *@description Tooltip to explain why a cookie was blocked
   */
  thisSetcookieHadADisallowedCharacter: "This `Set-Cookie` header contained a disallowed character (a forbidden ASCII control character, or the tab character if it appears in the middle of the cookie name, value, an attribute name, or an attribute value).",
  /**
   *@description Tooltip to explain why a cookie was blocked
   */
  theSchemeOfThisConnectionIsNot: "The scheme of this connection is not allowed to store cookies.",
  /**
   *@description Tooltip to explain why a cookie was blocked
   */
  anUnknownErrorWasEncounteredWhenTrying: "An unknown error was encountered when trying to store this cookie.",
  /**
   *@description Tooltip to explain why a cookie was blocked due to Schemeful Same-Site
   *@example {SameSite=Strict} PH1
   */
  thisSetcookieWasBlockedBecauseItHadTheSamesiteStrictLax: 'This attempt to set a cookie via a `Set-Cookie` header was blocked because it had the "{PH1}" attribute but came from a cross-site response which was not the response to a top-level navigation. This response is considered cross-site because the URL has a different scheme than the current site.',
  /**
   *@description Tooltip to explain why a cookie was blocked due to Schemeful Same-Site
   */
  thisSetcookieDidntSpecifyASamesite: 'This `Set-Cookie` header didn\'t specify a "`SameSite`" attribute, was defaulted to "`SameSite=Lax"`, and was blocked because it came from a cross-site response which was not the response to a top-level navigation. This response is considered cross-site because the URL has a different scheme than the current site.',
  /**
   *@description Tooltip to explain why a cookie was blocked due to SameParty
   */
  thisSetcookieWasBlockedBecauseItHadTheSameparty: "This attempt to set a cookie via a `Set-Cookie` header was blocked because it had the \"`SameParty`\" attribute but the request was cross-party. The request was considered cross-party because the domain of the resource's URL and the domains of the resource's enclosing frames/documents are neither owners nor members in the same First-Party Set.",
  /**
   *@description Tooltip to explain why a cookie was blocked due to SameParty
   */
  thisSetcookieWasBlockedBecauseItHadTheSamepartyAttribute: 'This attempt to set a cookie via a `Set-Cookie` header was blocked because it had the "`SameParty`" attribute but also had other conflicting attributes. Chrome requires cookies that use the "`SameParty`" attribute to also have the "Secure" attribute, and to not be restricted to "`SameSite=Strict`".',
  /**
   *@description Tooltip to explain why an attempt to set a cookie via a `Set-Cookie` HTTP header on a request's response was blocked.
   */
  blockedReasonSecureOnly: 'This attempt to set a cookie via a `Set-Cookie` header was blocked because it had the "Secure" attribute but was not received over a secure connection.',
  /**
   *@description Tooltip to explain why an attempt to set a cookie via a `Set-Cookie` HTTP header on a request's response was blocked.
   *@example {SameSite=Strict} PH1
   */
  blockedReasonSameSiteStrictLax: 'This attempt to set a cookie via a `Set-Cookie` header was blocked because it had the "{PH1}" attribute but came from a cross-site response which was not the response to a top-level navigation.',
  /**
   *@description Tooltip to explain why an attempt to set a cookie via a `Set-Cookie` HTTP header on a request's response was blocked.
   */
  blockedReasonSameSiteUnspecifiedTreatedAsLax: 'This `Set-Cookie` header didn\'t specify a "`SameSite`" attribute and was defaulted to "`SameSite=Lax,`" and was blocked because it came from a cross-site response which was not the response to a top-level navigation. The `Set-Cookie` had to have been set with "`SameSite=None`" to enable cross-site usage.',
  /**
   *@description Tooltip to explain why an attempt to set a cookie via a `Set-Cookie` HTTP header on a request's response was blocked.
   */
  blockedReasonSameSiteNoneInsecure: 'This attempt to set a cookie via a `Set-Cookie` header was blocked because it had the "`SameSite=None`" attribute but did not have the "Secure" attribute, which is required in order to use "`SameSite=None`".',
  /**
   *@description Tooltip to explain why an attempt to set a cookie via a `Set-Cookie` HTTP header on a request's response was blocked.
   */
  blockedReasonOverwriteSecure: "This attempt to set a cookie via a `Set-Cookie` header was blocked because it was not sent over a secure connection and would have overwritten a cookie with the Secure attribute.",
  /**
   *@description Tooltip to explain why an attempt to set a cookie via a `Set-Cookie` HTTP header on a request's response was blocked.
   */
  blockedReasonInvalidDomain: "This attempt to set a cookie via a `Set-Cookie` header was blocked because its Domain attribute was invalid with regards to the current host url.",
  /**
   *@description Tooltip to explain why an attempt to set a cookie via a `Set-Cookie` HTTP header on a request's response was blocked.
   */
  blockedReasonInvalidPrefix: 'This attempt to set a cookie via a `Set-Cookie` header was blocked because it used the "`__Secure-`" or "`__Host-`" prefix in its name and broke the additional rules applied to cookies with these prefixes as defined in `https://tools.ietf.org/html/draft-west-cookie-prefixes-05`.',
  /**
   *@description Tooltip to explain why a cookie was blocked when the size of the #name plus the size of the value exceeds the max size.
   */
  thisSetcookieWasBlockedBecauseTheNameValuePairExceedsMaxSize: "This attempt to set a cookie via a `Set-Cookie` header was blocked because the cookie was too large. The combined size of the name and value must be less than or equal to 4096 characters.",
  /**
   *@description Text in Network Manager
   *@example {https://example.com} PH1
   */
  setcookieHeaderIsIgnoredIn: "Set-Cookie header is ignored in response from url: {PH1}. The combined size of the name and value must be less than or equal to 4096 characters.",
  /**
   *@description Tooltip to explain why the cookie should have been blocked by third-party cookie phaseout but is exempted.
   */
  exemptionReasonUserSetting: "This cookie is allowed by user preference.",
  /**
   *@description Tooltip to explain why the cookie should have been blocked by third-party cookie phaseout but is exempted.
   */
  exemptionReasonTPCDMetadata: "This cookie is allowed by a third-party cookie deprecation trial grace period. Learn more: goo.gle/dt-grace.",
  /**
   *@description Tooltip to explain why the cookie should have been blocked by third-party cookie phaseout but is exempted.
   */
  exemptionReasonTPCDDeprecationTrial: "This cookie is allowed by third-party cookie deprecation trial. Learn more: goo.gle/ps-dt.",
  /**
   *@description Tooltip to explain why the cookie should have been blocked by third-party cookie phaseout but is exempted.
   */
  exemptionReasonTopLevelTPCDDeprecationTrial: "This cookie is allowed by top-level third-party cookie deprecation trial. Learn more: goo.gle/ps-dt.",
  /**
   *@description Tooltip to explain why the cookie should have been blocked by third-party cookie phaseout but is exempted.
   */
  exemptionReasonTPCDHeuristics: "This cookie is allowed by third-party cookie heuristics. Learn more: goo.gle/hbe",
  /**
   *@description Tooltip to explain why the cookie should have been blocked by third-party cookie phaseout but is exempted.
   */
  exemptionReasonEnterprisePolicy: "This cookie is allowed by Chrome Enterprise policy. Learn more: goo.gle/ce-3pc",
  /**
   *@description Tooltip to explain why the cookie should have been blocked by third-party cookie phaseout but is exempted.
   */
  exemptionReasonStorageAccessAPI: "This cookie is allowed by the Storage Access API. Learn more: goo.gle/saa",
  /**
   *@description Tooltip to explain why the cookie should have been blocked by third-party cookie phaseout but is exempted.
   */
  exemptionReasonTopLevelStorageAccessAPI: "This cookie is allowed by the top-level Storage Access API. Learn more: goo.gle/saa-top",
  /**
   *@description Tooltip to explain why the cookie should have been blocked by third-party cookie phaseout but is exempted.
   */
  exemptionReasonScheme: "This cookie is allowed by the top-level url scheme"
};
const str_ = i18n.i18n.registerUIStrings("core/sdk/NetworkRequest.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
export class NetworkRequest extends Common.ObjectWrapper.ObjectWrapper {
  #requestIdInternal;
  #backendRequestIdInternal;
  #documentURLInternal;
  #frameIdInternal;
  #loaderIdInternal;
  #hasUserGesture;
  #initiatorInternal;
  #redirectSourceInternal;
  #preflightRequestInternal;
  #preflightInitiatorRequestInternal;
  #isRedirectInternal;
  #redirectDestinationInternal;
  #issueTimeInternal;
  #startTimeInternal;
  #endTimeInternal;
  #blockedReasonInternal;
  #corsErrorStatusInternal;
  statusCode;
  statusText;
  requestMethod;
  requestTime;
  protocol;
  alternateProtocolUsage;
  mixedContentType;
  #initialPriorityInternal;
  #currentPriority;
  #signedExchangeInfoInternal;
  #webBundleInfoInternal;
  #webBundleInnerRequestInfoInternal;
  #resourceTypeInternal;
  #contentDataInternal;
  #streamingContentData;
  #framesInternal;
  #responseHeaderValues;
  #responseHeadersTextInternal;
  #originalResponseHeaders;
  #sortedOriginalResponseHeaders;
  // This field is only used when intercepting and overriding requests, because
  // in that case 'this.responseHeaders' does not contain 'set-cookie' headers.
  #setCookieHeaders;
  #requestHeadersInternal;
  #requestHeaderValues;
  #remoteAddressInternal;
  #remoteAddressSpaceInternal;
  #referrerPolicyInternal;
  #securityStateInternal;
  #securityDetailsInternal;
  connectionId;
  connectionReused;
  hasNetworkData;
  #formParametersPromise;
  #requestFormDataPromise;
  #hasExtraRequestInfoInternal;
  #hasExtraResponseInfoInternal;
  #blockedRequestCookiesInternal;
  #includedRequestCookiesInternal;
  #blockedResponseCookiesInternal;
  #exemptedResponseCookiesInternal;
  #responseCookiesPartitionKey;
  #responseCookiesPartitionKeyOpaque;
  #siteHasCookieInOtherPartition;
  localizedFailDescription;
  #urlInternal;
  #responseReceivedTimeInternal;
  #transferSizeInternal;
  #finishedInternal;
  #failedInternal;
  #canceledInternal;
  #preservedInternal;
  #mimeTypeInternal;
  #charset;
  #parsedURLInternal;
  #nameInternal;
  #pathInternal;
  #clientSecurityStateInternal;
  #trustTokenParamsInternal;
  #trustTokenOperationDoneEventInternal;
  #responseCacheStorageCacheName;
  #serviceWorkerResponseSourceInternal;
  #wallIssueTime;
  #responseRetrievalTime;
  #resourceSizeInternal;
  #fromMemoryCache;
  #fromDiskCache;
  #fromPrefetchCacheInternal;
  #fromEarlyHints;
  #fetchedViaServiceWorkerInternal;
  #serviceWorkerRouterInfoInternal;
  #timingInternal;
  #requestHeadersTextInternal;
  #responseHeadersInternal;
  #earlyHintsHeadersInternal;
  #sortedResponseHeadersInternal;
  #responseCookiesInternal;
  #serverTimingsInternal;
  #queryStringInternal;
  #parsedQueryParameters;
  #contentDataProvider;
  #isSameSiteInternal;
  #wasIntercepted;
  #associatedData = /* @__PURE__ */ new Map();
  #hasOverriddenContent;
  #hasThirdPartyCookiePhaseoutIssue;
  #serverSentEvents;
  responseReceivedPromise;
  responseReceivedPromiseResolve;
  constructor(requestId, backendRequestId, url, documentURL, frameId, loaderId, initiator, hasUserGesture) {
    super();
    this.#requestIdInternal = requestId;
    this.#backendRequestIdInternal = backendRequestId;
    this.setUrl(url);
    this.#documentURLInternal = documentURL;
    this.#frameIdInternal = frameId;
    this.#loaderIdInternal = loaderId;
    this.#initiatorInternal = initiator;
    this.#hasUserGesture = hasUserGesture;
    this.#redirectSourceInternal = null;
    this.#preflightRequestInternal = null;
    this.#preflightInitiatorRequestInternal = null;
    this.#isRedirectInternal = false;
    this.#redirectDestinationInternal = null;
    this.#issueTimeInternal = -1;
    this.#startTimeInternal = -1;
    this.#endTimeInternal = -1;
    this.#blockedReasonInternal = void 0;
    this.#corsErrorStatusInternal = void 0;
    this.statusCode = 0;
    this.statusText = "";
    this.requestMethod = "";
    this.requestTime = 0;
    this.protocol = "";
    this.alternateProtocolUsage = void 0;
    this.mixedContentType = Protocol.Security.MixedContentType.None;
    this.#initialPriorityInternal = null;
    this.#currentPriority = null;
    this.#signedExchangeInfoInternal = null;
    this.#webBundleInfoInternal = null;
    this.#webBundleInnerRequestInfoInternal = null;
    this.#resourceTypeInternal = Common.ResourceType.resourceTypes.Other;
    this.#contentDataInternal = null;
    this.#streamingContentData = null;
    this.#framesInternal = [];
    this.#responseHeaderValues = {};
    this.#responseHeadersTextInternal = "";
    this.#originalResponseHeaders = [];
    this.#setCookieHeaders = [];
    this.#requestHeadersInternal = [];
    this.#requestHeaderValues = {};
    this.#remoteAddressInternal = "";
    this.#remoteAddressSpaceInternal = Protocol.Network.IPAddressSpace.Unknown;
    this.#referrerPolicyInternal = null;
    this.#securityStateInternal = Protocol.Security.SecurityState.Unknown;
    this.#securityDetailsInternal = null;
    this.connectionId = "0";
    this.connectionReused = false;
    this.hasNetworkData = false;
    this.#formParametersPromise = null;
    this.#requestFormDataPromise = Promise.resolve(null);
    this.#hasExtraRequestInfoInternal = false;
    this.#hasExtraResponseInfoInternal = false;
    this.#blockedRequestCookiesInternal = [];
    this.#includedRequestCookiesInternal = [];
    this.#blockedResponseCookiesInternal = [];
    this.#exemptedResponseCookiesInternal = [];
    this.#siteHasCookieInOtherPartition = false;
    this.#responseCookiesPartitionKey = null;
    this.#responseCookiesPartitionKeyOpaque = null;
    this.localizedFailDescription = null;
    this.#isSameSiteInternal = null;
    this.#wasIntercepted = false;
    this.#hasOverriddenContent = false;
    this.#hasThirdPartyCookiePhaseoutIssue = false;
  }
  static create(backendRequestId, url, documentURL, frameId, loaderId, initiator, hasUserGesture) {
    return new NetworkRequest(
      backendRequestId,
      backendRequestId,
      url,
      documentURL,
      frameId,
      loaderId,
      initiator,
      hasUserGesture
    );
  }
  static createForWebSocket(backendRequestId, requestURL, initiator) {
    return new NetworkRequest(
      backendRequestId,
      backendRequestId,
      requestURL,
      Platform.DevToolsPath.EmptyUrlString,
      null,
      null,
      initiator || null
    );
  }
  static createWithoutBackendRequest(requestId, url, documentURL, initiator) {
    return new NetworkRequest(requestId, void 0, url, documentURL, null, null, initiator);
  }
  identityCompare(other) {
    const thisId = this.requestId();
    const thatId = other.requestId();
    if (thisId > thatId) {
      return 1;
    }
    if (thisId < thatId) {
      return -1;
    }
    return 0;
  }
  requestId() {
    return this.#requestIdInternal;
  }
  backendRequestId() {
    return this.#backendRequestIdInternal;
  }
  url() {
    return this.#urlInternal;
  }
  isBlobRequest() {
    return Common.ParsedURL.schemeIs(this.#urlInternal, "blob:");
  }
  setUrl(x) {
    if (this.#urlInternal === x) {
      return;
    }
    this.#urlInternal = x;
    this.#parsedURLInternal = new Common.ParsedURL.ParsedURL(x);
    this.#queryStringInternal = void 0;
    this.#parsedQueryParameters = void 0;
    this.#nameInternal = void 0;
    this.#pathInternal = void 0;
  }
  get documentURL() {
    return this.#documentURLInternal;
  }
  get parsedURL() {
    return this.#parsedURLInternal;
  }
  get frameId() {
    return this.#frameIdInternal;
  }
  get loaderId() {
    return this.#loaderIdInternal;
  }
  setRemoteAddress(ip, port) {
    this.#remoteAddressInternal = ip + ":" + port;
    this.dispatchEventToListeners("RemoteAddressChanged" /* REMOTE_ADDRESS_CHANGED */, this);
  }
  remoteAddress() {
    return this.#remoteAddressInternal;
  }
  remoteAddressSpace() {
    return this.#remoteAddressSpaceInternal;
  }
  /**
   * The cache #name of the CacheStorage from where the response is served via
   * the ServiceWorker.
   */
  getResponseCacheStorageCacheName() {
    return this.#responseCacheStorageCacheName;
  }
  setResponseCacheStorageCacheName(x) {
    this.#responseCacheStorageCacheName = x;
  }
  serviceWorkerResponseSource() {
    return this.#serviceWorkerResponseSourceInternal;
  }
  setServiceWorkerResponseSource(serviceWorkerResponseSource) {
    this.#serviceWorkerResponseSourceInternal = serviceWorkerResponseSource;
  }
  setReferrerPolicy(referrerPolicy) {
    this.#referrerPolicyInternal = referrerPolicy;
  }
  referrerPolicy() {
    return this.#referrerPolicyInternal;
  }
  securityState() {
    return this.#securityStateInternal;
  }
  setSecurityState(securityState) {
    this.#securityStateInternal = securityState;
  }
  securityDetails() {
    return this.#securityDetailsInternal;
  }
  securityOrigin() {
    return this.#parsedURLInternal.securityOrigin();
  }
  setSecurityDetails(securityDetails) {
    this.#securityDetailsInternal = securityDetails;
  }
  get startTime() {
    return this.#startTimeInternal || -1;
  }
  setIssueTime(monotonicTime, wallTime) {
    this.#issueTimeInternal = monotonicTime;
    this.#wallIssueTime = wallTime;
    this.#startTimeInternal = monotonicTime;
  }
  issueTime() {
    return this.#issueTimeInternal;
  }
  pseudoWallTime(monotonicTime) {
    return this.#wallIssueTime ? this.#wallIssueTime - this.#issueTimeInternal + monotonicTime : monotonicTime;
  }
  get responseReceivedTime() {
    return this.#responseReceivedTimeInternal || -1;
  }
  set responseReceivedTime(x) {
    this.#responseReceivedTimeInternal = x;
  }
  /**
   * The time at which the returned response was generated. For cached
   * responses, this is the last time the cache entry was validated.
   */
  getResponseRetrievalTime() {
    return this.#responseRetrievalTime;
  }
  setResponseRetrievalTime(x) {
    this.#responseRetrievalTime = x;
  }
  get endTime() {
    return this.#endTimeInternal || -1;
  }
  set endTime(x) {
    if (this.timing && this.timing.requestTime) {
      this.#endTimeInternal = Math.max(x, this.responseReceivedTime);
    } else {
      this.#endTimeInternal = x;
      if (this.#responseReceivedTimeInternal > x) {
        this.#responseReceivedTimeInternal = x;
      }
    }
    this.dispatchEventToListeners("TimingChanged" /* TIMING_CHANGED */, this);
  }
  get duration() {
    if (this.#endTimeInternal === -1 || this.#startTimeInternal === -1) {
      return -1;
    }
    return this.#endTimeInternal - this.#startTimeInternal;
  }
  get latency() {
    if (this.#responseReceivedTimeInternal === -1 || this.#startTimeInternal === -1) {
      return -1;
    }
    return this.#responseReceivedTimeInternal - this.#startTimeInternal;
  }
  get resourceSize() {
    return this.#resourceSizeInternal || 0;
  }
  set resourceSize(x) {
    this.#resourceSizeInternal = x;
  }
  get transferSize() {
    return this.#transferSizeInternal || 0;
  }
  increaseTransferSize(x) {
    this.#transferSizeInternal = (this.#transferSizeInternal || 0) + x;
  }
  setTransferSize(x) {
    this.#transferSizeInternal = x;
  }
  get finished() {
    return this.#finishedInternal;
  }
  set finished(x) {
    if (this.#finishedInternal === x) {
      return;
    }
    this.#finishedInternal = x;
    if (x) {
      this.dispatchEventToListeners("FinishedLoading" /* FINISHED_LOADING */, this);
    }
  }
  get failed() {
    return this.#failedInternal;
  }
  set failed(x) {
    this.#failedInternal = x;
  }
  get canceled() {
    return this.#canceledInternal;
  }
  set canceled(x) {
    this.#canceledInternal = x;
  }
  get preserved() {
    return this.#preservedInternal;
  }
  set preserved(x) {
    this.#preservedInternal = x;
  }
  blockedReason() {
    return this.#blockedReasonInternal;
  }
  setBlockedReason(reason) {
    this.#blockedReasonInternal = reason;
  }
  corsErrorStatus() {
    return this.#corsErrorStatusInternal;
  }
  setCorsErrorStatus(corsErrorStatus) {
    this.#corsErrorStatusInternal = corsErrorStatus;
  }
  wasBlocked() {
    return Boolean(this.#blockedReasonInternal);
  }
  cached() {
    return (Boolean(this.#fromMemoryCache) || Boolean(this.#fromDiskCache)) && !this.#transferSizeInternal;
  }
  cachedInMemory() {
    return Boolean(this.#fromMemoryCache) && !this.#transferSizeInternal;
  }
  fromPrefetchCache() {
    return Boolean(this.#fromPrefetchCacheInternal);
  }
  setFromMemoryCache() {
    this.#fromMemoryCache = true;
    this.#timingInternal = void 0;
  }
  get fromDiskCache() {
    return this.#fromDiskCache;
  }
  setFromDiskCache() {
    this.#fromDiskCache = true;
  }
  setFromPrefetchCache() {
    this.#fromPrefetchCacheInternal = true;
  }
  fromEarlyHints() {
    return Boolean(this.#fromEarlyHints);
  }
  setFromEarlyHints() {
    this.#fromEarlyHints = true;
  }
  /**
   * Returns true if the request was intercepted by a service worker and it
   * provided its own response.
   */
  get fetchedViaServiceWorker() {
    return Boolean(this.#fetchedViaServiceWorkerInternal);
  }
  set fetchedViaServiceWorker(x) {
    this.#fetchedViaServiceWorkerInternal = x;
  }
  get serviceWorkerRouterInfo() {
    return this.#serviceWorkerRouterInfoInternal;
  }
  set serviceWorkerRouterInfo(x) {
    this.#serviceWorkerRouterInfoInternal = x;
  }
  /**
   * Returns true if the request was sent by a service worker.
   */
  initiatedByServiceWorker() {
    const networkManager = NetworkManager.forRequest(this);
    if (!networkManager) {
      return false;
    }
    return networkManager.target().type() === Type.ServiceWorker;
  }
  get timing() {
    return this.#timingInternal;
  }
  set timing(timingInfo) {
    if (!timingInfo || this.#fromMemoryCache) {
      return;
    }
    this.#startTimeInternal = timingInfo.requestTime;
    const headersReceivedTime = timingInfo.requestTime + timingInfo.receiveHeadersEnd / 1e3;
    if ((this.#responseReceivedTimeInternal || -1) < 0 || this.#responseReceivedTimeInternal > headersReceivedTime) {
      this.#responseReceivedTimeInternal = headersReceivedTime;
    }
    if (this.#startTimeInternal > this.#responseReceivedTimeInternal) {
      this.#responseReceivedTimeInternal = this.#startTimeInternal;
    }
    this.#timingInternal = timingInfo;
    this.dispatchEventToListeners("TimingChanged" /* TIMING_CHANGED */, this);
  }
  setConnectTimingFromExtraInfo(connectTiming) {
    this.#startTimeInternal = connectTiming.requestTime;
    this.dispatchEventToListeners("TimingChanged" /* TIMING_CHANGED */, this);
  }
  get mimeType() {
    return this.#mimeTypeInternal;
  }
  set mimeType(x) {
    this.#mimeTypeInternal = x;
    if (x === Platform.MimeType.MimeType.EVENTSTREAM && !this.#serverSentEvents) {
      const parseFromStreamedData = this.resourceType() !== Common.ResourceType.resourceTypes.EventSource;
      this.#serverSentEvents = new ServerSentEvents(this, parseFromStreamedData);
    }
  }
  get displayName() {
    return this.#parsedURLInternal.displayName;
  }
  name() {
    if (this.#nameInternal) {
      return this.#nameInternal;
    }
    this.parseNameAndPathFromURL();
    return this.#nameInternal;
  }
  path() {
    if (this.#pathInternal) {
      return this.#pathInternal;
    }
    this.parseNameAndPathFromURL();
    return this.#pathInternal;
  }
  parseNameAndPathFromURL() {
    if (this.#parsedURLInternal.isDataURL()) {
      this.#nameInternal = this.#parsedURLInternal.dataURLDisplayName();
      this.#pathInternal = "";
    } else if (this.#parsedURLInternal.isBlobURL()) {
      this.#nameInternal = this.#parsedURLInternal.url;
      this.#pathInternal = "";
    } else if (this.#parsedURLInternal.isAboutBlank()) {
      this.#nameInternal = this.#parsedURLInternal.url;
      this.#pathInternal = "";
    } else {
      this.#pathInternal = this.#parsedURLInternal.host + this.#parsedURLInternal.folderPathComponents;
      const networkManager = NetworkManager.forRequest(this);
      const inspectedURL = networkManager ? Common.ParsedURL.ParsedURL.fromString(networkManager.target().inspectedURL()) : null;
      this.#pathInternal = Platform.StringUtilities.trimURL(this.#pathInternal, inspectedURL ? inspectedURL.host : "");
      if (this.#parsedURLInternal.lastPathComponent || this.#parsedURLInternal.queryParams) {
        this.#nameInternal = this.#parsedURLInternal.lastPathComponent + (this.#parsedURLInternal.queryParams ? "?" + this.#parsedURLInternal.queryParams : "");
      } else if (this.#parsedURLInternal.folderPathComponents) {
        this.#nameInternal = this.#parsedURLInternal.folderPathComponents.substring(
          this.#parsedURLInternal.folderPathComponents.lastIndexOf("/") + 1
        ) + "/";
        this.#pathInternal = this.#pathInternal.substring(0, this.#pathInternal.lastIndexOf("/"));
      } else {
        this.#nameInternal = this.#parsedURLInternal.host;
        this.#pathInternal = "";
      }
    }
  }
  get folder() {
    let path = this.#parsedURLInternal.path;
    const indexOfQuery = path.indexOf("?");
    if (indexOfQuery !== -1) {
      path = path.substring(0, indexOfQuery);
    }
    const lastSlashIndex = path.lastIndexOf("/");
    return lastSlashIndex !== -1 ? path.substring(0, lastSlashIndex) : "";
  }
  get pathname() {
    return this.#parsedURLInternal.path;
  }
  resourceType() {
    return this.#resourceTypeInternal;
  }
  setResourceType(resourceType) {
    this.#resourceTypeInternal = resourceType;
  }
  get domain() {
    return this.#parsedURLInternal.host;
  }
  get scheme() {
    return this.#parsedURLInternal.scheme;
  }
  getInferredStatusText() {
    return this.statusText || HttpReasonPhraseStrings.getStatusText(this.statusCode);
  }
  redirectSource() {
    return this.#redirectSourceInternal;
  }
  setRedirectSource(originatingRequest) {
    this.#redirectSourceInternal = originatingRequest;
  }
  preflightRequest() {
    return this.#preflightRequestInternal;
  }
  setPreflightRequest(preflightRequest) {
    this.#preflightRequestInternal = preflightRequest;
  }
  preflightInitiatorRequest() {
    return this.#preflightInitiatorRequestInternal;
  }
  setPreflightInitiatorRequest(preflightInitiatorRequest) {
    this.#preflightInitiatorRequestInternal = preflightInitiatorRequest;
  }
  isPreflightRequest() {
    return this.#initiatorInternal !== null && this.#initiatorInternal !== void 0 && this.#initiatorInternal.type === Protocol.Network.InitiatorType.Preflight;
  }
  redirectDestination() {
    return this.#redirectDestinationInternal;
  }
  setRedirectDestination(redirectDestination) {
    this.#redirectDestinationInternal = redirectDestination;
  }
  requestHeaders() {
    return this.#requestHeadersInternal;
  }
  setRequestHeaders(headers) {
    this.#requestHeadersInternal = headers;
    this.dispatchEventToListeners("RequestHeadersChanged" /* REQUEST_HEADERS_CHANGED */);
  }
  requestHeadersText() {
    return this.#requestHeadersTextInternal;
  }
  setRequestHeadersText(text) {
    this.#requestHeadersTextInternal = text;
    this.dispatchEventToListeners("RequestHeadersChanged" /* REQUEST_HEADERS_CHANGED */);
  }
  requestHeaderValue(headerName) {
    if (this.#requestHeaderValues[headerName]) {
      return this.#requestHeaderValues[headerName];
    }
    this.#requestHeaderValues[headerName] = this.computeHeaderValue(this.requestHeaders(), headerName);
    return this.#requestHeaderValues[headerName];
  }
  requestFormData() {
    if (!this.#requestFormDataPromise) {
      this.#requestFormDataPromise = NetworkManager.requestPostData(this);
    }
    return this.#requestFormDataPromise;
  }
  setRequestFormData(hasData, data) {
    this.#requestFormDataPromise = hasData && data === null ? null : Promise.resolve(data);
    this.#formParametersPromise = null;
  }
  filteredProtocolName() {
    const protocol = this.protocol.toLowerCase();
    if (protocol === "h2") {
      return "http/2.0";
    }
    return protocol.replace(/^http\/2(\.0)?\+/, "http/2.0+");
  }
  requestHttpVersion() {
    const headersText = this.requestHeadersText();
    if (!headersText) {
      const version = this.requestHeaderValue("version") || this.requestHeaderValue(":version");
      if (version) {
        return version;
      }
      return this.filteredProtocolName();
    }
    const firstLine = headersText.split(/\r\n/)[0];
    const match = firstLine.match(/(HTTP\/\d+\.\d+)$/);
    return match ? match[1] : "HTTP/0.9";
  }
  get responseHeaders() {
    return this.#responseHeadersInternal || [];
  }
  set responseHeaders(x) {
    this.#responseHeadersInternal = x;
    this.#sortedResponseHeadersInternal = void 0;
    this.#serverTimingsInternal = void 0;
    this.#responseCookiesInternal = void 0;
    this.#responseHeaderValues = {};
    this.dispatchEventToListeners("ResponseHeadersChanged" /* RESPONSE_HEADERS_CHANGED */);
  }
  get earlyHintsHeaders() {
    return this.#earlyHintsHeadersInternal || [];
  }
  set earlyHintsHeaders(x) {
    this.#earlyHintsHeadersInternal = x;
  }
  get originalResponseHeaders() {
    return this.#originalResponseHeaders;
  }
  set originalResponseHeaders(headers) {
    this.#originalResponseHeaders = headers;
    this.#sortedOriginalResponseHeaders = void 0;
  }
  get setCookieHeaders() {
    return this.#setCookieHeaders;
  }
  set setCookieHeaders(headers) {
    this.#setCookieHeaders = headers;
  }
  get responseHeadersText() {
    return this.#responseHeadersTextInternal;
  }
  set responseHeadersText(x) {
    this.#responseHeadersTextInternal = x;
    this.dispatchEventToListeners("ResponseHeadersChanged" /* RESPONSE_HEADERS_CHANGED */);
  }
  get sortedResponseHeaders() {
    if (this.#sortedResponseHeadersInternal !== void 0) {
      return this.#sortedResponseHeadersInternal;
    }
    this.#sortedResponseHeadersInternal = this.responseHeaders.slice();
    return this.#sortedResponseHeadersInternal.sort(function(a, b) {
      return Platform.StringUtilities.compare(a.name.toLowerCase(), b.name.toLowerCase());
    });
  }
  get sortedOriginalResponseHeaders() {
    if (this.#sortedOriginalResponseHeaders !== void 0) {
      return this.#sortedOriginalResponseHeaders;
    }
    this.#sortedOriginalResponseHeaders = this.originalResponseHeaders.slice();
    return this.#sortedOriginalResponseHeaders.sort(function(a, b) {
      return Platform.StringUtilities.compare(a.name.toLowerCase(), b.name.toLowerCase());
    });
  }
  get overrideTypes() {
    const types = [];
    if (this.hasOverriddenContent) {
      types.push("content");
    }
    if (this.hasOverriddenHeaders()) {
      types.push("headers");
    }
    return types;
  }
  get hasOverriddenContent() {
    return this.#hasOverriddenContent;
  }
  set hasOverriddenContent(value) {
    this.#hasOverriddenContent = value;
  }
  #deduplicateHeaders(sortedHeaders) {
    const dedupedHeaders = [];
    for (const header of sortedHeaders) {
      if (dedupedHeaders.length && dedupedHeaders[dedupedHeaders.length - 1].name === header.name) {
        dedupedHeaders[dedupedHeaders.length - 1].value += `, ${header.value}`;
      } else {
        dedupedHeaders.push({ name: header.name, value: header.value });
      }
    }
    return dedupedHeaders;
  }
  hasOverriddenHeaders() {
    if (!this.#originalResponseHeaders.length) {
      return false;
    }
    const responseHeaders = this.#deduplicateHeaders(this.sortedResponseHeaders);
    const originalResponseHeaders = this.#deduplicateHeaders(this.sortedOriginalResponseHeaders);
    if (responseHeaders.length !== originalResponseHeaders.length) {
      return true;
    }
    for (let i = 0; i < responseHeaders.length; i++) {
      if (responseHeaders[i].name.toLowerCase() !== originalResponseHeaders[i].name.toLowerCase()) {
        return true;
      }
      if (responseHeaders[i].value !== originalResponseHeaders[i].value) {
        return true;
      }
    }
    return false;
  }
  responseHeaderValue(headerName) {
    if (headerName in this.#responseHeaderValues) {
      return this.#responseHeaderValues[headerName];
    }
    this.#responseHeaderValues[headerName] = this.computeHeaderValue(this.responseHeaders, headerName);
    return this.#responseHeaderValues[headerName];
  }
  wasIntercepted() {
    return this.#wasIntercepted;
  }
  setWasIntercepted(wasIntercepted) {
    this.#wasIntercepted = wasIntercepted;
  }
  setEarlyHintsHeaders(headers) {
    this.earlyHintsHeaders = headers;
  }
  get responseCookies() {
    if (!this.#responseCookiesInternal) {
      this.#responseCookiesInternal = CookieParser.parseSetCookie(this.responseHeaderValue("Set-Cookie"), this.domain) || [];
      if (this.#responseCookiesPartitionKey) {
        for (const cookie of this.#responseCookiesInternal) {
          if (cookie.partitioned()) {
            cookie.setPartitionKey(
              this.#responseCookiesPartitionKey.topLevelSite,
              this.#responseCookiesPartitionKey.hasCrossSiteAncestor
            );
          }
        }
      } else if (this.#responseCookiesPartitionKeyOpaque) {
        for (const cookie of this.#responseCookiesInternal) {
          cookie.setPartitionKeyOpaque();
        }
      }
    }
    return this.#responseCookiesInternal;
  }
  responseLastModified() {
    return this.responseHeaderValue("last-modified");
  }
  allCookiesIncludingBlockedOnes() {
    return [
      ...this.includedRequestCookies().map((includedRequestCookie) => includedRequestCookie.cookie),
      ...this.responseCookies,
      ...this.blockedRequestCookies().map((blockedRequestCookie) => blockedRequestCookie.cookie),
      ...this.blockedResponseCookies().map((blockedResponseCookie) => blockedResponseCookie.cookie)
    ].filter((v) => Boolean(v));
  }
  get serverTimings() {
    if (typeof this.#serverTimingsInternal === "undefined") {
      this.#serverTimingsInternal = ServerTiming.parseHeaders(this.responseHeaders);
    }
    return this.#serverTimingsInternal;
  }
  queryString() {
    if (this.#queryStringInternal !== void 0) {
      return this.#queryStringInternal;
    }
    let queryString = null;
    const url = this.url();
    const questionMarkPosition = url.indexOf("?");
    if (questionMarkPosition !== -1) {
      queryString = url.substring(questionMarkPosition + 1);
      const hashSignPosition = queryString.indexOf("#");
      if (hashSignPosition !== -1) {
        queryString = queryString.substring(0, hashSignPosition);
      }
    }
    this.#queryStringInternal = queryString;
    return this.#queryStringInternal;
  }
  get queryParameters() {
    if (this.#parsedQueryParameters) {
      return this.#parsedQueryParameters;
    }
    const queryString = this.queryString();
    if (!queryString) {
      return null;
    }
    this.#parsedQueryParameters = this.parseParameters(queryString);
    return this.#parsedQueryParameters;
  }
  async parseFormParameters() {
    const requestContentType = this.requestContentType();
    if (!requestContentType) {
      return null;
    }
    if (requestContentType.match(/^application\/x-www-form-urlencoded\s*(;.*)?$/i)) {
      const formData2 = await this.requestFormData();
      if (!formData2) {
        return null;
      }
      return this.parseParameters(formData2);
    }
    const multipartDetails = requestContentType.match(/^multipart\/form-data\s*;\s*boundary\s*=\s*(\S+)\s*$/);
    if (!multipartDetails) {
      return null;
    }
    const boundary = multipartDetails[1];
    if (!boundary) {
      return null;
    }
    const formData = await this.requestFormData();
    if (!formData) {
      return null;
    }
    return this.parseMultipartFormDataParameters(formData, boundary);
  }
  formParameters() {
    if (!this.#formParametersPromise) {
      this.#formParametersPromise = this.parseFormParameters();
    }
    return this.#formParametersPromise;
  }
  responseHttpVersion() {
    const headersText = this.#responseHeadersTextInternal;
    if (!headersText) {
      const version = this.responseHeaderValue("version") || this.responseHeaderValue(":version");
      if (version) {
        return version;
      }
      return this.filteredProtocolName();
    }
    const firstLine = headersText.split(/\r\n/)[0];
    const match = firstLine.match(/^(HTTP\/\d+\.\d+)/);
    return match ? match[1] : "HTTP/0.9";
  }
  parseParameters(queryString) {
    function parseNameValue(pair) {
      const position = pair.indexOf("=");
      if (position === -1) {
        return { name: pair, value: "" };
      }
      return { name: pair.substring(0, position), value: pair.substring(position + 1) };
    }
    return queryString.split("&").map(parseNameValue);
  }
  /**
   * Parses multipart/form-data; boundary=boundaryString request bodies -
   * --boundaryString
   * Content-Disposition: form-data; #name="field-#name"; filename="r.gif"
   * Content-Type: application/octet-stream
   *
   * optionalValue
   * --boundaryString
   * Content-Disposition: form-data; #name="field-#name-2"
   *
   * optionalValue2
   * --boundaryString--
   */
  parseMultipartFormDataParameters(data, boundary) {
    const sanitizedBoundary = Platform.StringUtilities.escapeForRegExp(boundary);
    const keyValuePattern = new RegExp(
      // Header with an optional file #name.
      '^\\r\\ncontent-disposition\\s*:\\s*form-data\\s*;\\s*name="([^"]*)"(?:\\s*;\\s*filename="([^"]*)")?(?:\\r\\ncontent-type\\s*:\\s*([^\\r\\n]*))?\\r\\n\\r\\n(.*)\\r\\n$',
      "is"
    );
    const fields = data.split(new RegExp(`--${sanitizedBoundary}(?:--s*$)?`, "g"));
    return fields.reduce(parseMultipartField, []);
    function parseMultipartField(result, field) {
      const [match, name, filename, contentType, value] = field.match(keyValuePattern) || [];
      if (!match) {
        return result;
      }
      const processedValue = filename || contentType ? i18nString(UIStrings.binary) : value;
      result.push({ name, value: processedValue });
      return result;
    }
  }
  computeHeaderValue(headers, headerName) {
    headerName = headerName.toLowerCase();
    const values = [];
    for (let i = 0; i < headers.length; ++i) {
      if (headers[i].name.toLowerCase() === headerName) {
        values.push(headers[i].value);
      }
    }
    if (!values.length) {
      return void 0;
    }
    if (headerName === "set-cookie") {
      return values.join("\n");
    }
    return values.join(", ");
  }
  requestContentData() {
    if (this.#contentDataInternal) {
      return this.#contentDataInternal;
    }
    if (this.#contentDataProvider) {
      this.#contentDataInternal = this.#contentDataProvider();
    } else {
      this.#contentDataInternal = NetworkManager.requestContentData(this);
    }
    return this.#contentDataInternal;
  }
  setContentDataProvider(dataProvider) {
    console.assert(!this.#contentDataInternal, "contentData can only be set once.");
    this.#contentDataProvider = dataProvider;
  }
  requestStreamingContent() {
    if (this.#streamingContentData) {
      return this.#streamingContentData;
    }
    const contentPromise = this.finished ? this.requestContentData() : NetworkManager.streamResponseBody(this);
    this.#streamingContentData = contentPromise.then((contentData) => {
      if (TextUtils.ContentData.ContentData.isError(contentData)) {
        return contentData;
      }
      return TextUtils.StreamingContentData.StreamingContentData.from(contentData);
    });
    return this.#streamingContentData;
  }
  contentURL() {
    return this.#urlInternal;
  }
  contentType() {
    return this.#resourceTypeInternal;
  }
  async requestContent() {
    return TextUtils.ContentData.ContentData.asDeferredContent(await this.requestContentData());
  }
  async searchInContent(query, caseSensitive, isRegex) {
    if (!this.#contentDataProvider) {
      return NetworkManager.searchInRequest(this, query, caseSensitive, isRegex);
    }
    const contentData = await this.requestContentData();
    if (TextUtils.ContentData.ContentData.isError(contentData) || !contentData.isTextContent) {
      return [];
    }
    return TextUtils.TextUtils.performSearchInContentData(contentData, query, caseSensitive, isRegex);
  }
  isHttpFamily() {
    return Boolean(this.url().match(/^https?:/i));
  }
  requestContentType() {
    return this.requestHeaderValue("Content-Type");
  }
  hasErrorStatusCode() {
    return this.statusCode >= 400;
  }
  setInitialPriority(priority) {
    this.#initialPriorityInternal = priority;
  }
  initialPriority() {
    return this.#initialPriorityInternal;
  }
  setPriority(priority) {
    this.#currentPriority = priority;
  }
  priority() {
    return this.#currentPriority || this.#initialPriorityInternal || null;
  }
  setSignedExchangeInfo(info) {
    this.#signedExchangeInfoInternal = info;
  }
  signedExchangeInfo() {
    return this.#signedExchangeInfoInternal;
  }
  setWebBundleInfo(info) {
    this.#webBundleInfoInternal = info;
  }
  webBundleInfo() {
    return this.#webBundleInfoInternal;
  }
  setWebBundleInnerRequestInfo(info) {
    this.#webBundleInnerRequestInfoInternal = info;
  }
  webBundleInnerRequestInfo() {
    return this.#webBundleInnerRequestInfoInternal;
  }
  async populateImageSource(image) {
    const contentData = await this.requestContentData();
    if (TextUtils.ContentData.ContentData.isError(contentData)) {
      return;
    }
    let imageSrc = contentData.asDataUrl();
    if (imageSrc === null && !this.#failedInternal) {
      const cacheControl = this.responseHeaderValue("cache-control") || "";
      if (!cacheControl.includes("no-cache")) {
        imageSrc = this.#urlInternal;
      }
    }
    if (imageSrc !== null) {
      image.src = imageSrc;
    }
  }
  initiator() {
    return this.#initiatorInternal || null;
  }
  hasUserGesture() {
    return this.#hasUserGesture ?? null;
  }
  frames() {
    return this.#framesInternal;
  }
  addProtocolFrameError(errorMessage, time) {
    this.addFrame(
      { type: "error" /* Error */, text: errorMessage, time: this.pseudoWallTime(time), opCode: -1, mask: false }
    );
  }
  addProtocolFrame(response, time, sent) {
    const type = sent ? "send" /* Send */ : "receive" /* Receive */;
    this.addFrame({
      type,
      text: response.payloadData,
      time: this.pseudoWallTime(time),
      opCode: response.opcode,
      mask: response.mask
    });
  }
  addFrame(frame) {
    this.#framesInternal.push(frame);
    this.dispatchEventToListeners("WebsocketFrameAdded" /* WEBSOCKET_FRAME_ADDED */, frame);
  }
  eventSourceMessages() {
    return this.#serverSentEvents?.eventSourceMessages ?? [];
  }
  addEventSourceMessage(time, eventName, eventId, data) {
    this.#serverSentEvents?.onProtocolEventSourceMessageReceived(eventName, data, eventId, this.pseudoWallTime(time));
  }
  markAsRedirect(redirectCount) {
    this.#isRedirectInternal = true;
    this.#requestIdInternal = `${this.#backendRequestIdInternal}:redirected.${redirectCount}`;
  }
  isRedirect() {
    return this.#isRedirectInternal;
  }
  setRequestIdForTest(requestId) {
    this.#backendRequestIdInternal = requestId;
    this.#requestIdInternal = requestId;
  }
  charset() {
    return this.#charset ?? null;
  }
  setCharset(charset) {
    this.#charset = charset;
  }
  addExtraRequestInfo(extraRequestInfo) {
    this.#blockedRequestCookiesInternal = extraRequestInfo.blockedRequestCookies;
    this.#includedRequestCookiesInternal = extraRequestInfo.includedRequestCookies;
    this.setRequestHeaders(extraRequestInfo.requestHeaders);
    this.#hasExtraRequestInfoInternal = true;
    this.setRequestHeadersText("");
    this.#clientSecurityStateInternal = extraRequestInfo.clientSecurityState;
    this.setConnectTimingFromExtraInfo(extraRequestInfo.connectTiming);
    this.#siteHasCookieInOtherPartition = extraRequestInfo.siteHasCookieInOtherPartition ?? false;
    this.#hasThirdPartyCookiePhaseoutIssue = this.#blockedRequestCookiesInternal.some(
      (item) => item.blockedReasons.includes(Protocol.Network.CookieBlockedReason.ThirdPartyPhaseout)
    );
  }
  hasExtraRequestInfo() {
    return this.#hasExtraRequestInfoInternal;
  }
  blockedRequestCookies() {
    return this.#blockedRequestCookiesInternal;
  }
  includedRequestCookies() {
    return this.#includedRequestCookiesInternal;
  }
  hasRequestCookies() {
    return this.#includedRequestCookiesInternal.length > 0 || this.#blockedRequestCookiesInternal.length > 0;
  }
  siteHasCookieInOtherPartition() {
    return this.#siteHasCookieInOtherPartition;
  }
  // Parse the status text from the first line of the response headers text.
  // See net::HttpResponseHeaders::GetStatusText.
  static parseStatusTextFromResponseHeadersText(responseHeadersText) {
    const firstLineParts = responseHeadersText.split("\r")[0].split(" ");
    return firstLineParts.slice(2).join(" ");
  }
  addExtraResponseInfo(extraResponseInfo) {
    this.#blockedResponseCookiesInternal = extraResponseInfo.blockedResponseCookies;
    if (extraResponseInfo.exemptedResponseCookies) {
      this.#exemptedResponseCookiesInternal = extraResponseInfo.exemptedResponseCookies;
    }
    this.#responseCookiesPartitionKey = extraResponseInfo.cookiePartitionKey ? extraResponseInfo.cookiePartitionKey : null;
    this.#responseCookiesPartitionKeyOpaque = extraResponseInfo.cookiePartitionKeyOpaque || null;
    this.responseHeaders = extraResponseInfo.responseHeaders;
    this.originalResponseHeaders = extraResponseInfo.responseHeaders.map((headerEntry) => ({ ...headerEntry }));
    if (extraResponseInfo.responseHeadersText) {
      this.responseHeadersText = extraResponseInfo.responseHeadersText;
      if (!this.requestHeadersText()) {
        let requestHeadersText = `${this.requestMethod} ${this.parsedURL.path}`;
        if (this.parsedURL.queryParams) {
          requestHeadersText += `?${this.parsedURL.queryParams}`;
        }
        requestHeadersText += " HTTP/1.1\r\n";
        for (const { name, value } of this.requestHeaders()) {
          requestHeadersText += `${name}: ${value}\r
`;
        }
        this.setRequestHeadersText(requestHeadersText);
      }
      this.statusText = NetworkRequest.parseStatusTextFromResponseHeadersText(extraResponseInfo.responseHeadersText);
    }
    this.#remoteAddressSpaceInternal = extraResponseInfo.resourceIPAddressSpace;
    if (extraResponseInfo.statusCode) {
      this.statusCode = extraResponseInfo.statusCode;
    }
    this.#hasExtraResponseInfoInternal = true;
    const networkManager = NetworkManager.forRequest(this);
    if (!networkManager) {
      return;
    }
    for (const blockedCookie of this.#blockedResponseCookiesInternal) {
      if (blockedCookie.blockedReasons.includes(Protocol.Network.SetCookieBlockedReason.NameValuePairExceedsMaxSize)) {
        const message = i18nString(UIStrings.setcookieHeaderIsIgnoredIn, { PH1: this.url() });
        networkManager.dispatchEventToListeners(
          NetworkManagerEvents.MessageGenerated,
          { message, requestId: this.#requestIdInternal, warning: true }
        );
      }
    }
    const cookieModel = networkManager.target().model(CookieModel);
    if (!cookieModel) {
      return;
    }
    for (const exemptedCookie of this.#exemptedResponseCookiesInternal) {
      cookieModel.removeBlockedCookie(exemptedCookie.cookie);
    }
    for (const blockedCookie of this.#blockedResponseCookiesInternal) {
      const cookie = blockedCookie.cookie;
      if (!cookie) {
        continue;
      }
      if (blockedCookie.blockedReasons.includes(Protocol.Network.SetCookieBlockedReason.ThirdPartyPhaseout)) {
        this.#hasThirdPartyCookiePhaseoutIssue = true;
      }
      cookieModel.addBlockedCookie(
        cookie,
        blockedCookie.blockedReasons.map((blockedReason) => ({
          attribute: setCookieBlockedReasonToAttribute(blockedReason),
          uiString: setCookieBlockedReasonToUiString(blockedReason)
        }))
      );
    }
  }
  hasExtraResponseInfo() {
    return this.#hasExtraResponseInfoInternal;
  }
  blockedResponseCookies() {
    return this.#blockedResponseCookiesInternal;
  }
  exemptedResponseCookies() {
    return this.#exemptedResponseCookiesInternal;
  }
  nonBlockedResponseCookies() {
    const blockedCookieLines = this.blockedResponseCookies().map((blockedCookie) => blockedCookie.cookieLine);
    const responseCookies = this.responseCookies.filter((cookie) => {
      const index = blockedCookieLines.indexOf(cookie.getCookieLine());
      if (index !== -1) {
        blockedCookieLines[index] = null;
        return false;
      }
      return true;
    });
    return responseCookies;
  }
  responseCookiesPartitionKey() {
    return this.#responseCookiesPartitionKey;
  }
  responseCookiesPartitionKeyOpaque() {
    return this.#responseCookiesPartitionKeyOpaque;
  }
  redirectSourceSignedExchangeInfoHasNoErrors() {
    return this.#redirectSourceInternal !== null && this.#redirectSourceInternal.#signedExchangeInfoInternal !== null && !this.#redirectSourceInternal.#signedExchangeInfoInternal.errors;
  }
  clientSecurityState() {
    return this.#clientSecurityStateInternal;
  }
  setTrustTokenParams(trustTokenParams) {
    this.#trustTokenParamsInternal = trustTokenParams;
  }
  trustTokenParams() {
    return this.#trustTokenParamsInternal;
  }
  setTrustTokenOperationDoneEvent(doneEvent) {
    this.#trustTokenOperationDoneEventInternal = doneEvent;
    this.dispatchEventToListeners("TrustTokenResultAdded" /* TRUST_TOKEN_RESULT_ADDED */);
  }
  trustTokenOperationDoneEvent() {
    return this.#trustTokenOperationDoneEventInternal;
  }
  setIsSameSite(isSameSite) {
    this.#isSameSiteInternal = isSameSite;
  }
  isSameSite() {
    return this.#isSameSiteInternal;
  }
  getAssociatedData(key) {
    return this.#associatedData.get(key) || null;
  }
  setAssociatedData(key, data) {
    this.#associatedData.set(key, data);
  }
  deleteAssociatedData(key) {
    this.#associatedData.delete(key);
  }
  hasThirdPartyCookiePhaseoutIssue() {
    return this.#hasThirdPartyCookiePhaseoutIssue;
  }
  addDataReceivedEvent({ timestamp, dataLength, encodedDataLength, data }) {
    this.resourceSize += dataLength;
    if (encodedDataLength !== -1) {
      this.increaseTransferSize(encodedDataLength);
    }
    this.endTime = timestamp;
    if (data) {
      void this.#streamingContentData?.then((contentData) => {
        if (!TextUtils.StreamingContentData.isError(contentData)) {
          contentData.addChunk(data);
        }
      });
    }
  }
  waitForResponseReceived() {
    if (this.responseReceivedPromise) {
      return this.responseReceivedPromise;
    }
    const { promise, resolve } = Promise.withResolvers();
    this.responseReceivedPromise = promise;
    this.responseReceivedPromiseResolve = resolve;
    return this.responseReceivedPromise;
  }
}
export var Events = /* @__PURE__ */ ((Events2) => {
  Events2["FINISHED_LOADING"] = "FinishedLoading";
  Events2["TIMING_CHANGED"] = "TimingChanged";
  Events2["REMOTE_ADDRESS_CHANGED"] = "RemoteAddressChanged";
  Events2["REQUEST_HEADERS_CHANGED"] = "RequestHeadersChanged";
  Events2["RESPONSE_HEADERS_CHANGED"] = "ResponseHeadersChanged";
  Events2["WEBSOCKET_FRAME_ADDED"] = "WebsocketFrameAdded";
  Events2["EVENT_SOURCE_MESSAGE_ADDED"] = "EventSourceMessageAdded";
  Events2["TRUST_TOKEN_RESULT_ADDED"] = "TrustTokenResultAdded";
  return Events2;
})(Events || {});
export var InitiatorType = /* @__PURE__ */ ((InitiatorType2) => {
  InitiatorType2["OTHER"] = "other";
  InitiatorType2["PARSER"] = "parser";
  InitiatorType2["REDIRECT"] = "redirect";
  InitiatorType2["SCRIPT"] = "script";
  InitiatorType2["PRELOAD"] = "preload";
  InitiatorType2["SIGNED_EXCHANGE"] = "signedExchange";
  InitiatorType2["PREFLIGHT"] = "preflight";
  return InitiatorType2;
})(InitiatorType || {});
export var WebSocketFrameType = /* @__PURE__ */ ((WebSocketFrameType2) => {
  WebSocketFrameType2["Send"] = "send";
  WebSocketFrameType2["Receive"] = "receive";
  WebSocketFrameType2["Error"] = "error";
  return WebSocketFrameType2;
})(WebSocketFrameType || {});
export const cookieExemptionReasonToUiString = function(exemptionReason) {
  switch (exemptionReason) {
    case Protocol.Network.CookieExemptionReason.UserSetting:
      return i18nString(UIStrings.exemptionReasonUserSetting);
    case Protocol.Network.CookieExemptionReason.TPCDMetadata:
      return i18nString(UIStrings.exemptionReasonTPCDMetadata);
    case Protocol.Network.CookieExemptionReason.TopLevelTPCDDeprecationTrial:
      return i18nString(UIStrings.exemptionReasonTopLevelTPCDDeprecationTrial);
    case Protocol.Network.CookieExemptionReason.TPCDDeprecationTrial:
      return i18nString(UIStrings.exemptionReasonTPCDDeprecationTrial);
    case Protocol.Network.CookieExemptionReason.TPCDHeuristics:
      return i18nString(UIStrings.exemptionReasonTPCDHeuristics);
    case Protocol.Network.CookieExemptionReason.EnterprisePolicy:
      return i18nString(UIStrings.exemptionReasonEnterprisePolicy);
    case Protocol.Network.CookieExemptionReason.StorageAccess:
      return i18nString(UIStrings.exemptionReasonStorageAccessAPI);
    case Protocol.Network.CookieExemptionReason.TopLevelStorageAccess:
      return i18nString(UIStrings.exemptionReasonTopLevelStorageAccessAPI);
    case Protocol.Network.CookieExemptionReason.Scheme:
      return i18nString(UIStrings.exemptionReasonScheme);
  }
  return "";
};
export const cookieBlockedReasonToUiString = function(blockedReason) {
  switch (blockedReason) {
    case Protocol.Network.CookieBlockedReason.SecureOnly:
      return i18nString(UIStrings.secureOnly);
    case Protocol.Network.CookieBlockedReason.NotOnPath:
      return i18nString(UIStrings.notOnPath);
    case Protocol.Network.CookieBlockedReason.DomainMismatch:
      return i18nString(UIStrings.domainMismatch);
    case Protocol.Network.CookieBlockedReason.SameSiteStrict:
      return i18nString(UIStrings.sameSiteStrict);
    case Protocol.Network.CookieBlockedReason.SameSiteLax:
      return i18nString(UIStrings.sameSiteLax);
    case Protocol.Network.CookieBlockedReason.SameSiteUnspecifiedTreatedAsLax:
      return i18nString(UIStrings.sameSiteUnspecifiedTreatedAsLax);
    case Protocol.Network.CookieBlockedReason.SameSiteNoneInsecure:
      return i18nString(UIStrings.sameSiteNoneInsecure);
    case Protocol.Network.CookieBlockedReason.UserPreferences:
      return i18nString(UIStrings.userPreferences);
    case Protocol.Network.CookieBlockedReason.UnknownError:
      return i18nString(UIStrings.unknownError);
    case Protocol.Network.CookieBlockedReason.SchemefulSameSiteStrict:
      return i18nString(UIStrings.schemefulSameSiteStrict);
    case Protocol.Network.CookieBlockedReason.SchemefulSameSiteLax:
      return i18nString(UIStrings.schemefulSameSiteLax);
    case Protocol.Network.CookieBlockedReason.SchemefulSameSiteUnspecifiedTreatedAsLax:
      return i18nString(UIStrings.schemefulSameSiteUnspecifiedTreatedAsLax);
    case Protocol.Network.CookieBlockedReason.SamePartyFromCrossPartyContext:
      return i18nString(UIStrings.samePartyFromCrossPartyContext);
    case Protocol.Network.CookieBlockedReason.NameValuePairExceedsMaxSize:
      return i18nString(UIStrings.nameValuePairExceedsMaxSize);
    case Protocol.Network.CookieBlockedReason.ThirdPartyPhaseout:
      return i18nString(UIStrings.thirdPartyPhaseout);
  }
  return "";
};
export const setCookieBlockedReasonToUiString = function(blockedReason) {
  switch (blockedReason) {
    case Protocol.Network.SetCookieBlockedReason.SecureOnly:
      return i18nString(UIStrings.blockedReasonSecureOnly);
    case Protocol.Network.SetCookieBlockedReason.SameSiteStrict:
      return i18nString(UIStrings.blockedReasonSameSiteStrictLax, { PH1: "SameSite=Strict" });
    case Protocol.Network.SetCookieBlockedReason.SameSiteLax:
      return i18nString(UIStrings.blockedReasonSameSiteStrictLax, { PH1: "SameSite=Lax" });
    case Protocol.Network.SetCookieBlockedReason.SameSiteUnspecifiedTreatedAsLax:
      return i18nString(UIStrings.blockedReasonSameSiteUnspecifiedTreatedAsLax);
    case Protocol.Network.SetCookieBlockedReason.SameSiteNoneInsecure:
      return i18nString(UIStrings.blockedReasonSameSiteNoneInsecure);
    case Protocol.Network.SetCookieBlockedReason.UserPreferences:
      return i18nString(UIStrings.thisSetcookieWasBlockedDueToUser);
    case Protocol.Network.SetCookieBlockedReason.SyntaxError:
      return i18nString(UIStrings.thisSetcookieHadInvalidSyntax);
    case Protocol.Network.SetCookieBlockedReason.SchemeNotSupported:
      return i18nString(UIStrings.theSchemeOfThisConnectionIsNot);
    case Protocol.Network.SetCookieBlockedReason.OverwriteSecure:
      return i18nString(UIStrings.blockedReasonOverwriteSecure);
    case Protocol.Network.SetCookieBlockedReason.InvalidDomain:
      return i18nString(UIStrings.blockedReasonInvalidDomain);
    case Protocol.Network.SetCookieBlockedReason.InvalidPrefix:
      return i18nString(UIStrings.blockedReasonInvalidPrefix);
    case Protocol.Network.SetCookieBlockedReason.UnknownError:
      return i18nString(UIStrings.anUnknownErrorWasEncounteredWhenTrying);
    case Protocol.Network.SetCookieBlockedReason.SchemefulSameSiteStrict:
      return i18nString(UIStrings.thisSetcookieWasBlockedBecauseItHadTheSamesiteStrictLax, { PH1: "SameSite=Strict" });
    case Protocol.Network.SetCookieBlockedReason.SchemefulSameSiteLax:
      return i18nString(UIStrings.thisSetcookieWasBlockedBecauseItHadTheSamesiteStrictLax, { PH1: "SameSite=Lax" });
    case Protocol.Network.SetCookieBlockedReason.SchemefulSameSiteUnspecifiedTreatedAsLax:
      return i18nString(UIStrings.thisSetcookieDidntSpecifyASamesite);
    case Protocol.Network.SetCookieBlockedReason.SamePartyFromCrossPartyContext:
      return i18nString(UIStrings.thisSetcookieWasBlockedBecauseItHadTheSameparty);
    case Protocol.Network.SetCookieBlockedReason.SamePartyConflictsWithOtherAttributes:
      return i18nString(UIStrings.thisSetcookieWasBlockedBecauseItHadTheSamepartyAttribute);
    case Protocol.Network.SetCookieBlockedReason.NameValuePairExceedsMaxSize:
      return i18nString(UIStrings.thisSetcookieWasBlockedBecauseTheNameValuePairExceedsMaxSize);
    case Protocol.Network.SetCookieBlockedReason.DisallowedCharacter:
      return i18nString(UIStrings.thisSetcookieHadADisallowedCharacter);
    case Protocol.Network.SetCookieBlockedReason.ThirdPartyPhaseout:
      return i18nString(UIStrings.thisSetcookieWasBlockedDueThirdPartyPhaseout);
  }
  return "";
};
export const cookieBlockedReasonToAttribute = function(blockedReason) {
  switch (blockedReason) {
    case Protocol.Network.CookieBlockedReason.SecureOnly:
      return Attribute.SECURE;
    case Protocol.Network.CookieBlockedReason.NotOnPath:
      return Attribute.PATH;
    case Protocol.Network.CookieBlockedReason.DomainMismatch:
      return Attribute.DOMAIN;
    case Protocol.Network.CookieBlockedReason.SameSiteStrict:
    case Protocol.Network.CookieBlockedReason.SameSiteLax:
    case Protocol.Network.CookieBlockedReason.SameSiteUnspecifiedTreatedAsLax:
    case Protocol.Network.CookieBlockedReason.SameSiteNoneInsecure:
    case Protocol.Network.CookieBlockedReason.SchemefulSameSiteStrict:
    case Protocol.Network.CookieBlockedReason.SchemefulSameSiteLax:
    case Protocol.Network.CookieBlockedReason.SchemefulSameSiteUnspecifiedTreatedAsLax:
      return Attribute.SAME_SITE;
    case Protocol.Network.CookieBlockedReason.SamePartyFromCrossPartyContext:
    case Protocol.Network.CookieBlockedReason.NameValuePairExceedsMaxSize:
    case Protocol.Network.CookieBlockedReason.UserPreferences:
    case Protocol.Network.CookieBlockedReason.ThirdPartyPhaseout:
    case Protocol.Network.CookieBlockedReason.UnknownError:
      return null;
  }
  return null;
};
export const setCookieBlockedReasonToAttribute = function(blockedReason) {
  switch (blockedReason) {
    case Protocol.Network.SetCookieBlockedReason.SecureOnly:
    case Protocol.Network.SetCookieBlockedReason.OverwriteSecure:
      return Attribute.SECURE;
    case Protocol.Network.SetCookieBlockedReason.SameSiteStrict:
    case Protocol.Network.SetCookieBlockedReason.SameSiteLax:
    case Protocol.Network.SetCookieBlockedReason.SameSiteUnspecifiedTreatedAsLax:
    case Protocol.Network.SetCookieBlockedReason.SameSiteNoneInsecure:
    case Protocol.Network.SetCookieBlockedReason.SchemefulSameSiteStrict:
    case Protocol.Network.SetCookieBlockedReason.SchemefulSameSiteLax:
    case Protocol.Network.SetCookieBlockedReason.SchemefulSameSiteUnspecifiedTreatedAsLax:
      return Attribute.SAME_SITE;
    case Protocol.Network.SetCookieBlockedReason.InvalidDomain:
      return Attribute.DOMAIN;
    case Protocol.Network.SetCookieBlockedReason.InvalidPrefix:
      return Attribute.NAME;
    case Protocol.Network.SetCookieBlockedReason.SamePartyConflictsWithOtherAttributes:
    case Protocol.Network.SetCookieBlockedReason.SamePartyFromCrossPartyContext:
    case Protocol.Network.SetCookieBlockedReason.NameValuePairExceedsMaxSize:
    case Protocol.Network.SetCookieBlockedReason.UserPreferences:
    case Protocol.Network.SetCookieBlockedReason.ThirdPartyPhaseout:
    case Protocol.Network.SetCookieBlockedReason.SyntaxError:
    case Protocol.Network.SetCookieBlockedReason.SchemeNotSupported:
    case Protocol.Network.SetCookieBlockedReason.UnknownError:
    case Protocol.Network.SetCookieBlockedReason.DisallowedCharacter:
      return null;
  }
  return null;
};
//# sourceMappingURL=NetworkRequest.js.map

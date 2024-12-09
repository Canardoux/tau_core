"use strict";
import * as Protocol from "../../generated/protocol.js";
import * as TextUtils from "../../models/text_utils/text_utils.js";
import * as Common from "../common/common.js";
import * as Host from "../host/host.js";
import * as i18n from "../i18n/i18n.js";
import * as Platform from "../platform/platform.js";
import { Cookie } from "./Cookie.js";
import {
  Events as NetworkRequestEvents,
  NetworkRequest
} from "./NetworkRequest.js";
import { SDKModel } from "./SDKModel.js";
import { Capability } from "./Target.js";
import { TargetManager } from "./TargetManager.js";
const UIStrings = {
  /**
   *@description Explanation why no content is shown for WebSocket connection.
   */
  noContentForWebSocket: "Content for WebSockets is currently not supported",
  /**
   *@description Explanation why no content is shown for redirect response.
   */
  noContentForRedirect: "No content available because this request was redirected",
  /**
   *@description Explanation why no content is shown for preflight request.
   */
  noContentForPreflight: "No content available for preflight request",
  /**
   *@description Text to indicate that network throttling is disabled
   */
  noThrottling: "No throttling",
  /**
   *@description Text to indicate the network connectivity is offline
   */
  offline: "Offline",
  /**
   *@description Text in Network Manager representing the "3G" throttling preset.
   */
  slowG: "3G",
  // Named `slowG` for legacy reasons and because this value
  // is serialized locally on the user's machine: if we
  // change it we break their stored throttling settings.
  // (See crrev.com/c/2947255)
  /**
   *@description Text in Network Manager representing the "Slow 4G" throttling preset
   */
  fastG: "Slow 4G",
  // Named `fastG` for legacy reasons and because this value
  // is serialized locally on the user's machine: if we
  // change it we break their stored throttling settings.
  // (See crrev.com/c/2947255)
  /**
   *@description Text in Network Manager representing the "Fast 4G" throttling preset
   */
  fast4G: "Fast 4G",
  /**
   *@description Text in Network Manager
   *@example {https://example.com} PH1
   */
  requestWasBlockedByDevtoolsS: 'Request was blocked by DevTools: "{PH1}"',
  /**
   *@description Message in Network Manager
   *@example {XHR} PH1
   *@example {GET} PH2
   *@example {https://example.com} PH3
   */
  sFailedLoadingSS: '{PH1} failed loading: {PH2} "{PH3}".',
  /**
   *@description Message in Network Manager
   *@example {XHR} PH1
   *@example {GET} PH2
   *@example {https://example.com} PH3
   */
  sFinishedLoadingSS: '{PH1} finished loading: {PH2} "{PH3}".'
};
const str_ = i18n.i18n.registerUIStrings("core/sdk/NetworkManager.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(void 0, str_);
const requestToManagerMap = /* @__PURE__ */ new WeakMap();
const CONNECTION_TYPES = /* @__PURE__ */ new Map([
  ["2g", Protocol.Network.ConnectionType.Cellular2g],
  ["3g", Protocol.Network.ConnectionType.Cellular3g],
  ["4g", Protocol.Network.ConnectionType.Cellular4g],
  ["bluetooth", Protocol.Network.ConnectionType.Bluetooth],
  ["wifi", Protocol.Network.ConnectionType.Wifi],
  ["wimax", Protocol.Network.ConnectionType.Wimax]
]);
export class NetworkManager extends SDKModel {
  dispatcher;
  fetchDispatcher;
  #networkAgent;
  #bypassServiceWorkerSetting;
  constructor(target) {
    super(target);
    this.dispatcher = new NetworkDispatcher(this);
    this.fetchDispatcher = new FetchDispatcher(target.fetchAgent(), this);
    this.#networkAgent = target.networkAgent();
    target.registerNetworkDispatcher(this.dispatcher);
    target.registerFetchDispatcher(this.fetchDispatcher);
    if (Common.Settings.Settings.instance().moduleSetting("cache-disabled").get()) {
      void this.#networkAgent.invoke_setCacheDisabled({ cacheDisabled: true });
    }
    void this.#networkAgent.invoke_enable({ maxPostDataSize: MAX_EAGER_POST_REQUEST_BODY_LENGTH });
    void this.#networkAgent.invoke_setAttachDebugStack({ enabled: true });
    this.#bypassServiceWorkerSetting = Common.Settings.Settings.instance().createSetting("bypass-service-worker", false);
    if (this.#bypassServiceWorkerSetting.get()) {
      this.bypassServiceWorkerChanged();
    }
    this.#bypassServiceWorkerSetting.addChangeListener(this.bypassServiceWorkerChanged, this);
    Common.Settings.Settings.instance().moduleSetting("cache-disabled").addChangeListener(this.cacheDisabledSettingChanged, this);
  }
  static forRequest(request) {
    return requestToManagerMap.get(request) || null;
  }
  static canReplayRequest(request) {
    return Boolean(requestToManagerMap.get(request)) && Boolean(request.backendRequestId()) && !request.isRedirect() && request.resourceType() === Common.ResourceType.resourceTypes.XHR;
  }
  static replayRequest(request) {
    const manager = requestToManagerMap.get(request);
    const requestId = request.backendRequestId();
    if (!manager || !requestId || request.isRedirect()) {
      return;
    }
    void manager.#networkAgent.invoke_replayXHR({ requestId });
  }
  static async searchInRequest(request, query, caseSensitive, isRegex) {
    const manager = NetworkManager.forRequest(request);
    const requestId = request.backendRequestId();
    if (!manager || !requestId || request.isRedirect()) {
      return [];
    }
    const response = await manager.#networkAgent.invoke_searchInResponseBody({ requestId, query, caseSensitive, isRegex });
    return TextUtils.TextUtils.performSearchInSearchMatches(response.result || [], query, caseSensitive, isRegex);
  }
  static async requestContentData(request) {
    if (request.resourceType() === Common.ResourceType.resourceTypes.WebSocket) {
      return { error: i18nString(UIStrings.noContentForWebSocket) };
    }
    if (!request.finished) {
      await request.once(NetworkRequestEvents.FINISHED_LOADING);
    }
    if (request.isRedirect()) {
      return { error: i18nString(UIStrings.noContentForRedirect) };
    }
    if (request.isPreflightRequest()) {
      return { error: i18nString(UIStrings.noContentForPreflight) };
    }
    const manager = NetworkManager.forRequest(request);
    if (!manager) {
      return { error: "No network manager for request" };
    }
    const requestId = request.backendRequestId();
    if (!requestId) {
      return { error: "No backend request id for request" };
    }
    const response = await manager.#networkAgent.invoke_getResponseBody({ requestId });
    const error = response.getError();
    if (error) {
      return { error };
    }
    return new TextUtils.ContentData.ContentData(
      response.body,
      response.base64Encoded,
      request.mimeType,
      request.charset() ?? void 0
    );
  }
  /**
   * Returns the already received bytes for an in-flight request. After calling this method
   * "dataReceived" events will contain additional data.
   */
  static async streamResponseBody(request) {
    if (request.finished) {
      return { error: "Streaming the response body is only available for in-flight requests." };
    }
    const manager = NetworkManager.forRequest(request);
    if (!manager) {
      return { error: "No network manager for request" };
    }
    const requestId = request.backendRequestId();
    if (!requestId) {
      return { error: "No backend request id for request" };
    }
    const response = await manager.#networkAgent.invoke_streamResourceContent({ requestId });
    const error = response.getError();
    if (error) {
      return { error };
    }
    await request.waitForResponseReceived();
    return new TextUtils.ContentData.ContentData(
      response.bufferedData,
      /* isBase64=*/
      true,
      request.mimeType,
      request.charset() ?? void 0
    );
  }
  static async requestPostData(request) {
    const manager = NetworkManager.forRequest(request);
    if (!manager) {
      console.error("No network manager for request");
      return null;
    }
    const requestId = request.backendRequestId();
    if (!requestId) {
      console.error("No backend request id for request");
      return null;
    }
    try {
      const { postData } = await manager.#networkAgent.invoke_getRequestPostData({ requestId });
      return postData;
    } catch (e) {
      return e.message;
    }
  }
  static connectionType(conditions) {
    if (!conditions.download && !conditions.upload) {
      return Protocol.Network.ConnectionType.None;
    }
    try {
      const title = typeof conditions.title === "function" ? conditions.title().toLowerCase() : conditions.title.toLowerCase();
      for (const [name, protocolType] of CONNECTION_TYPES) {
        if (title.includes(name)) {
          return protocolType;
        }
      }
    } catch {
      return Protocol.Network.ConnectionType.None;
    }
    return Protocol.Network.ConnectionType.Other;
  }
  static lowercaseHeaders(headers) {
    const newHeaders = {};
    for (const headerName in headers) {
      newHeaders[headerName.toLowerCase()] = headers[headerName];
    }
    return newHeaders;
  }
  requestForURL(url) {
    return this.dispatcher.requestForURL(url);
  }
  requestForId(id) {
    return this.dispatcher.requestForId(id);
  }
  requestForLoaderId(loaderId) {
    return this.dispatcher.requestForLoaderId(loaderId);
  }
  cacheDisabledSettingChanged({ data: enabled }) {
    void this.#networkAgent.invoke_setCacheDisabled({ cacheDisabled: enabled });
  }
  dispose() {
    Common.Settings.Settings.instance().moduleSetting("cache-disabled").removeChangeListener(this.cacheDisabledSettingChanged, this);
  }
  bypassServiceWorkerChanged() {
    void this.#networkAgent.invoke_setBypassServiceWorker({ bypass: this.#bypassServiceWorkerSetting.get() });
  }
  async getSecurityIsolationStatus(frameId) {
    const result = await this.#networkAgent.invoke_getSecurityIsolationStatus({ frameId: frameId ?? void 0 });
    if (result.getError()) {
      return null;
    }
    return result.status;
  }
  async enableReportingApi(enable = true) {
    return this.#networkAgent.invoke_enableReportingApi({ enable });
  }
  async loadNetworkResource(frameId, url, options) {
    const result = await this.#networkAgent.invoke_loadNetworkResource({ frameId: frameId ?? void 0, url, options });
    if (result.getError()) {
      throw new Error(result.getError());
    }
    return result.resource;
  }
  clearRequests() {
    this.dispatcher.clearRequests();
  }
}
export var Events = /* @__PURE__ */ ((Events2) => {
  Events2["RequestStarted"] = "RequestStarted";
  Events2["RequestUpdated"] = "RequestUpdated";
  Events2["RequestFinished"] = "RequestFinished";
  Events2["RequestUpdateDropped"] = "RequestUpdateDropped";
  Events2["ResponseReceived"] = "ResponseReceived";
  Events2["MessageGenerated"] = "MessageGenerated";
  Events2["RequestRedirected"] = "RequestRedirected";
  Events2["LoadingFinished"] = "LoadingFinished";
  Events2["ReportingApiReportAdded"] = "ReportingApiReportAdded";
  Events2["ReportingApiReportUpdated"] = "ReportingApiReportUpdated";
  Events2["ReportingApiEndpointsChangedForOrigin"] = "ReportingApiEndpointsChangedForOrigin";
  return Events2;
})(Events || {});
export const NoThrottlingConditions = {
  title: i18nLazyString(UIStrings.noThrottling),
  i18nTitleKey: UIStrings.noThrottling,
  download: -1,
  upload: -1,
  latency: 0
};
export const OfflineConditions = {
  title: i18nLazyString(UIStrings.offline),
  i18nTitleKey: UIStrings.offline,
  download: 0,
  upload: 0,
  latency: 0
};
const slow3GTargetLatency = 400;
export const Slow3GConditions = {
  title: i18nLazyString(UIStrings.slowG),
  i18nTitleKey: UIStrings.slowG,
  // ~500Kbps down
  download: 500 * 1e3 / 8 * 0.8,
  // ~500Kbps up
  upload: 500 * 1e3 / 8 * 0.8,
  // 400ms RTT
  latency: slow3GTargetLatency * 5,
  targetLatency: slow3GTargetLatency
};
const slow4GTargetLatency = 150;
export const Slow4GConditions = {
  title: i18nLazyString(UIStrings.fastG),
  i18nTitleKey: UIStrings.fastG,
  // ~1.6 Mbps down
  download: 1.6 * 1e3 * 1e3 / 8 * 0.9,
  // ~0.75 Mbps up
  upload: 750 * 1e3 / 8 * 0.9,
  // 150ms RTT
  latency: slow4GTargetLatency * 3.75,
  targetLatency: slow4GTargetLatency
};
const fast4GTargetLatency = 60;
export const Fast4GConditions = {
  title: i18nLazyString(UIStrings.fast4G),
  i18nTitleKey: UIStrings.fast4G,
  // 9 Mbps down
  download: 9 * 1e3 * 1e3 / 8 * 0.9,
  // 1.5 Mbps up
  upload: 1.5 * 1e3 * 1e3 / 8 * 0.9,
  // 60ms RTT
  latency: fast4GTargetLatency * 2.75,
  targetLatency: fast4GTargetLatency
};
const MAX_EAGER_POST_REQUEST_BODY_LENGTH = 64 * 1024;
export class FetchDispatcher {
  #fetchAgent;
  #manager;
  constructor(agent, manager) {
    this.#fetchAgent = agent;
    this.#manager = manager;
  }
  requestPaused({ requestId, request, resourceType, responseStatusCode, responseHeaders, networkId }) {
    const networkRequest = networkId ? this.#manager.requestForId(networkId) : null;
    if (networkRequest?.originalResponseHeaders.length === 0 && responseHeaders) {
      networkRequest.originalResponseHeaders = responseHeaders;
    }
    void MultitargetNetworkManager.instance().requestIntercepted(new InterceptedRequest(
      this.#fetchAgent,
      request,
      resourceType,
      requestId,
      networkRequest,
      responseStatusCode,
      responseHeaders
    ));
  }
  authRequired({}) {
  }
}
export class NetworkDispatcher {
  #manager;
  #requestsById;
  #requestsByURL;
  #requestsByLoaderId;
  #requestIdToExtraInfoBuilder;
  #requestIdToTrustTokenEvent;
  constructor(manager) {
    this.#manager = manager;
    this.#requestsById = /* @__PURE__ */ new Map();
    this.#requestsByURL = /* @__PURE__ */ new Map();
    this.#requestsByLoaderId = /* @__PURE__ */ new Map();
    this.#requestIdToExtraInfoBuilder = /* @__PURE__ */ new Map();
    this.#requestIdToTrustTokenEvent = /* @__PURE__ */ new Map();
    MultitargetNetworkManager.instance().addEventListener(
      MultitargetNetworkManager.Events.REQUEST_INTERCEPTED,
      this.#markAsIntercepted.bind(this)
    );
  }
  #markAsIntercepted(event) {
    const request = this.requestForId(event.data);
    if (request) {
      request.setWasIntercepted(true);
    }
  }
  headersMapToHeadersArray(headersMap) {
    const result = [];
    for (const name in headersMap) {
      const values = headersMap[name].split("\n");
      for (let i = 0; i < values.length; ++i) {
        result.push({ name, value: values[i] });
      }
    }
    return result;
  }
  updateNetworkRequestWithRequest(networkRequest, request) {
    networkRequest.requestMethod = request.method;
    networkRequest.setRequestHeaders(this.headersMapToHeadersArray(request.headers));
    networkRequest.setRequestFormData(Boolean(request.hasPostData), request.postData || null);
    networkRequest.setInitialPriority(request.initialPriority);
    networkRequest.mixedContentType = request.mixedContentType || Protocol.Security.MixedContentType.None;
    networkRequest.setReferrerPolicy(request.referrerPolicy);
    networkRequest.setIsSameSite(request.isSameSite || false);
  }
  updateNetworkRequestWithResponse(networkRequest, response) {
    if (response.url && networkRequest.url() !== response.url) {
      networkRequest.setUrl(response.url);
    }
    networkRequest.mimeType = response.mimeType;
    networkRequest.setCharset(response.charset);
    if (!networkRequest.statusCode || networkRequest.wasIntercepted()) {
      networkRequest.statusCode = response.status;
    }
    if (!networkRequest.statusText || networkRequest.wasIntercepted()) {
      networkRequest.statusText = response.statusText;
    }
    if (!networkRequest.hasExtraResponseInfo() || networkRequest.wasIntercepted()) {
      networkRequest.responseHeaders = this.headersMapToHeadersArray(response.headers);
    }
    if (response.encodedDataLength >= 0) {
      networkRequest.setTransferSize(response.encodedDataLength);
    }
    if (response.requestHeaders && !networkRequest.hasExtraRequestInfo()) {
      networkRequest.setRequestHeaders(this.headersMapToHeadersArray(response.requestHeaders));
      networkRequest.setRequestHeadersText(response.requestHeadersText || "");
    }
    networkRequest.connectionReused = response.connectionReused;
    networkRequest.connectionId = String(response.connectionId);
    if (response.remoteIPAddress) {
      networkRequest.setRemoteAddress(response.remoteIPAddress, response.remotePort || -1);
    }
    if (response.fromServiceWorker) {
      networkRequest.fetchedViaServiceWorker = true;
    }
    if (response.fromDiskCache) {
      networkRequest.setFromDiskCache();
    }
    if (response.fromPrefetchCache) {
      networkRequest.setFromPrefetchCache();
    }
    if (response.fromEarlyHints) {
      networkRequest.setFromEarlyHints();
    }
    if (response.cacheStorageCacheName) {
      networkRequest.setResponseCacheStorageCacheName(response.cacheStorageCacheName);
    }
    if (response.serviceWorkerRouterInfo) {
      networkRequest.serviceWorkerRouterInfo = response.serviceWorkerRouterInfo;
    }
    if (response.responseTime) {
      networkRequest.setResponseRetrievalTime(new Date(response.responseTime));
    }
    networkRequest.timing = response.timing;
    networkRequest.protocol = response.protocol || "";
    networkRequest.alternateProtocolUsage = response.alternateProtocolUsage;
    if (response.serviceWorkerResponseSource) {
      networkRequest.setServiceWorkerResponseSource(response.serviceWorkerResponseSource);
    }
    networkRequest.setSecurityState(response.securityState);
    if (response.securityDetails) {
      networkRequest.setSecurityDetails(response.securityDetails);
    }
    const newResourceType = Common.ResourceType.ResourceType.fromMimeTypeOverride(networkRequest.mimeType);
    if (newResourceType) {
      networkRequest.setResourceType(newResourceType);
    }
    if (networkRequest.responseReceivedPromiseResolve) {
      networkRequest.responseReceivedPromiseResolve();
    } else {
      networkRequest.responseReceivedPromise = Promise.resolve();
    }
  }
  requestForId(id) {
    return this.#requestsById.get(id) || null;
  }
  requestForURL(url) {
    return this.#requestsByURL.get(url) || null;
  }
  requestForLoaderId(loaderId) {
    return this.#requestsByLoaderId.get(loaderId) || null;
  }
  resourceChangedPriority({ requestId, newPriority }) {
    const networkRequest = this.#requestsById.get(requestId);
    if (networkRequest) {
      networkRequest.setPriority(newPriority);
    }
  }
  signedExchangeReceived({ requestId, info }) {
    let networkRequest = this.#requestsById.get(requestId);
    if (!networkRequest) {
      networkRequest = this.#requestsByURL.get(info.outerResponse.url);
      if (!networkRequest) {
        return;
      }
    }
    networkRequest.setSignedExchangeInfo(info);
    networkRequest.setResourceType(Common.ResourceType.resourceTypes.SignedExchange);
    this.updateNetworkRequestWithResponse(networkRequest, info.outerResponse);
    this.updateNetworkRequest(networkRequest);
    this.#manager.dispatchEventToListeners(
      "ResponseReceived" /* ResponseReceived */,
      { request: networkRequest, response: info.outerResponse }
    );
  }
  requestWillBeSent({
    requestId,
    loaderId,
    documentURL,
    request,
    timestamp,
    wallTime,
    initiator,
    redirectResponse,
    type,
    frameId,
    hasUserGesture
  }) {
    let networkRequest = this.#requestsById.get(requestId);
    if (networkRequest) {
      if (!redirectResponse) {
        return;
      }
      if (!networkRequest.signedExchangeInfo()) {
        this.responseReceived({
          requestId,
          loaderId,
          timestamp,
          type: type || Protocol.Network.ResourceType.Other,
          response: redirectResponse,
          hasExtraInfo: false,
          frameId
        });
      }
      networkRequest = this.appendRedirect(requestId, timestamp, request.url);
      this.#manager.dispatchEventToListeners("RequestRedirected" /* RequestRedirected */, networkRequest);
    } else {
      networkRequest = NetworkRequest.create(
        requestId,
        request.url,
        documentURL,
        frameId ?? null,
        loaderId,
        initiator,
        hasUserGesture
      );
      requestToManagerMap.set(networkRequest, this.#manager);
    }
    networkRequest.hasNetworkData = true;
    this.updateNetworkRequestWithRequest(networkRequest, request);
    networkRequest.setIssueTime(timestamp, wallTime);
    networkRequest.setResourceType(
      type ? Common.ResourceType.resourceTypes[type] : Common.ResourceType.resourceTypes.Other
    );
    if (request.trustTokenParams) {
      networkRequest.setTrustTokenParams(request.trustTokenParams);
    }
    const maybeTrustTokenEvent = this.#requestIdToTrustTokenEvent.get(requestId);
    if (maybeTrustTokenEvent) {
      networkRequest.setTrustTokenOperationDoneEvent(maybeTrustTokenEvent);
      this.#requestIdToTrustTokenEvent.delete(requestId);
    }
    this.getExtraInfoBuilder(requestId).addRequest(networkRequest);
    this.startNetworkRequest(networkRequest, request);
  }
  requestServedFromCache({ requestId }) {
    const networkRequest = this.#requestsById.get(requestId);
    if (!networkRequest) {
      return;
    }
    networkRequest.setFromMemoryCache();
  }
  responseReceived({ requestId, loaderId, timestamp, type, response, frameId }) {
    const networkRequest = this.#requestsById.get(requestId);
    const lowercaseHeaders = NetworkManager.lowercaseHeaders(response.headers);
    if (!networkRequest) {
      const lastModifiedHeader = lowercaseHeaders["last-modified"];
      const eventData = {
        url: response.url,
        frameId: frameId ?? null,
        loaderId,
        resourceType: type,
        mimeType: response.mimeType,
        lastModified: lastModifiedHeader ? new Date(lastModifiedHeader) : null
      };
      this.#manager.dispatchEventToListeners("RequestUpdateDropped" /* RequestUpdateDropped */, eventData);
      return;
    }
    networkRequest.responseReceivedTime = timestamp;
    networkRequest.setResourceType(Common.ResourceType.resourceTypes[type]);
    this.updateNetworkRequestWithResponse(networkRequest, response);
    this.updateNetworkRequest(networkRequest);
    this.#manager.dispatchEventToListeners("ResponseReceived" /* ResponseReceived */, { request: networkRequest, response });
  }
  dataReceived(event) {
    let networkRequest = this.#requestsById.get(event.requestId);
    if (!networkRequest) {
      networkRequest = this.maybeAdoptMainResourceRequest(event.requestId);
    }
    if (!networkRequest) {
      return;
    }
    networkRequest.addDataReceivedEvent(event);
    this.updateNetworkRequest(networkRequest);
  }
  loadingFinished({ requestId, timestamp: finishTime, encodedDataLength }) {
    let networkRequest = this.#requestsById.get(requestId);
    if (!networkRequest) {
      networkRequest = this.maybeAdoptMainResourceRequest(requestId);
    }
    if (!networkRequest) {
      return;
    }
    this.getExtraInfoBuilder(requestId).finished();
    this.finishNetworkRequest(networkRequest, finishTime, encodedDataLength);
    this.#manager.dispatchEventToListeners("LoadingFinished" /* LoadingFinished */, networkRequest);
  }
  loadingFailed({
    requestId,
    timestamp: time,
    type: resourceType,
    errorText: localizedDescription,
    canceled,
    blockedReason,
    corsErrorStatus
  }) {
    const networkRequest = this.#requestsById.get(requestId);
    if (!networkRequest) {
      return;
    }
    networkRequest.failed = true;
    networkRequest.setResourceType(Common.ResourceType.resourceTypes[resourceType]);
    networkRequest.canceled = Boolean(canceled);
    if (blockedReason) {
      networkRequest.setBlockedReason(blockedReason);
      if (blockedReason === Protocol.Network.BlockedReason.Inspector) {
        const message = i18nString(UIStrings.requestWasBlockedByDevtoolsS, { PH1: networkRequest.url() });
        this.#manager.dispatchEventToListeners("MessageGenerated" /* MessageGenerated */, { message, requestId, warning: true });
      }
    }
    if (corsErrorStatus) {
      networkRequest.setCorsErrorStatus(corsErrorStatus);
    }
    networkRequest.localizedFailDescription = localizedDescription;
    this.getExtraInfoBuilder(requestId).finished();
    this.finishNetworkRequest(networkRequest, time, -1);
  }
  webSocketCreated({ requestId, url: requestURL, initiator }) {
    const networkRequest = NetworkRequest.createForWebSocket(requestId, requestURL, initiator);
    requestToManagerMap.set(networkRequest, this.#manager);
    networkRequest.setResourceType(Common.ResourceType.resourceTypes.WebSocket);
    this.startNetworkRequest(networkRequest, null);
  }
  webSocketWillSendHandshakeRequest({ requestId, timestamp: time, wallTime, request }) {
    const networkRequest = this.#requestsById.get(requestId);
    if (!networkRequest) {
      return;
    }
    networkRequest.requestMethod = "GET";
    networkRequest.setRequestHeaders(this.headersMapToHeadersArray(request.headers));
    networkRequest.setIssueTime(time, wallTime);
    this.updateNetworkRequest(networkRequest);
  }
  webSocketHandshakeResponseReceived({ requestId, timestamp: time, response }) {
    const networkRequest = this.#requestsById.get(requestId);
    if (!networkRequest) {
      return;
    }
    networkRequest.statusCode = response.status;
    networkRequest.statusText = response.statusText;
    networkRequest.responseHeaders = this.headersMapToHeadersArray(response.headers);
    networkRequest.responseHeadersText = response.headersText || "";
    if (response.requestHeaders) {
      networkRequest.setRequestHeaders(this.headersMapToHeadersArray(response.requestHeaders));
    }
    if (response.requestHeadersText) {
      networkRequest.setRequestHeadersText(response.requestHeadersText);
    }
    networkRequest.responseReceivedTime = time;
    networkRequest.protocol = "websocket";
    this.updateNetworkRequest(networkRequest);
  }
  webSocketFrameReceived({ requestId, timestamp: time, response }) {
    const networkRequest = this.#requestsById.get(requestId);
    if (!networkRequest) {
      return;
    }
    networkRequest.addProtocolFrame(response, time, false);
    networkRequest.responseReceivedTime = time;
    this.updateNetworkRequest(networkRequest);
  }
  webSocketFrameSent({ requestId, timestamp: time, response }) {
    const networkRequest = this.#requestsById.get(requestId);
    if (!networkRequest) {
      return;
    }
    networkRequest.addProtocolFrame(response, time, true);
    networkRequest.responseReceivedTime = time;
    this.updateNetworkRequest(networkRequest);
  }
  webSocketFrameError({ requestId, timestamp: time, errorMessage }) {
    const networkRequest = this.#requestsById.get(requestId);
    if (!networkRequest) {
      return;
    }
    networkRequest.addProtocolFrameError(errorMessage, time);
    networkRequest.responseReceivedTime = time;
    this.updateNetworkRequest(networkRequest);
  }
  webSocketClosed({ requestId, timestamp: time }) {
    const networkRequest = this.#requestsById.get(requestId);
    if (!networkRequest) {
      return;
    }
    this.finishNetworkRequest(networkRequest, time, -1);
  }
  eventSourceMessageReceived({ requestId, timestamp: time, eventName, eventId, data }) {
    const networkRequest = this.#requestsById.get(requestId);
    if (!networkRequest) {
      return;
    }
    networkRequest.addEventSourceMessage(time, eventName, eventId, data);
  }
  requestIntercepted({}) {
  }
  requestWillBeSentExtraInfo({ requestId, associatedCookies, headers, clientSecurityState, connectTiming, siteHasCookieInOtherPartition }) {
    const blockedRequestCookies = [];
    const includedRequestCookies = [];
    for (const { blockedReasons, exemptionReason, cookie } of associatedCookies) {
      if (blockedReasons.length === 0) {
        includedRequestCookies.push({ exemptionReason, cookie: Cookie.fromProtocolCookie(cookie) });
      } else {
        blockedRequestCookies.push({ blockedReasons, cookie: Cookie.fromProtocolCookie(cookie) });
      }
    }
    const extraRequestInfo = {
      blockedRequestCookies,
      includedRequestCookies,
      requestHeaders: this.headersMapToHeadersArray(headers),
      clientSecurityState,
      connectTiming,
      siteHasCookieInOtherPartition
    };
    this.getExtraInfoBuilder(requestId).addRequestExtraInfo(extraRequestInfo);
  }
  responseReceivedEarlyHints({
    requestId,
    headers
  }) {
    this.getExtraInfoBuilder(requestId).setEarlyHintsHeaders(this.headersMapToHeadersArray(headers));
  }
  responseReceivedExtraInfo({
    requestId,
    blockedCookies,
    headers,
    headersText,
    resourceIPAddressSpace,
    statusCode,
    cookiePartitionKey,
    cookiePartitionKeyOpaque,
    exemptedCookies
  }) {
    const extraResponseInfo = {
      blockedResponseCookies: blockedCookies.map((blockedCookie) => ({
        blockedReasons: blockedCookie.blockedReasons,
        cookieLine: blockedCookie.cookieLine,
        cookie: blockedCookie.cookie ? Cookie.fromProtocolCookie(blockedCookie.cookie) : null
      })),
      responseHeaders: this.headersMapToHeadersArray(headers),
      responseHeadersText: headersText,
      resourceIPAddressSpace,
      statusCode,
      cookiePartitionKey,
      cookiePartitionKeyOpaque,
      exemptedResponseCookies: exemptedCookies?.map((exemptedCookie) => ({
        cookie: Cookie.fromProtocolCookie(exemptedCookie.cookie),
        cookieLine: exemptedCookie.cookieLine,
        exemptionReason: exemptedCookie.exemptionReason
      }))
    };
    this.getExtraInfoBuilder(requestId).addResponseExtraInfo(extraResponseInfo);
  }
  getExtraInfoBuilder(requestId) {
    let builder;
    if (!this.#requestIdToExtraInfoBuilder.has(requestId)) {
      builder = new ExtraInfoBuilder();
      this.#requestIdToExtraInfoBuilder.set(requestId, builder);
    } else {
      builder = this.#requestIdToExtraInfoBuilder.get(requestId);
    }
    return builder;
  }
  appendRedirect(requestId, time, redirectURL) {
    const originalNetworkRequest = this.#requestsById.get(requestId);
    if (!originalNetworkRequest) {
      throw new Error(`Could not find original network request for ${requestId}`);
    }
    let redirectCount = 0;
    for (let redirect = originalNetworkRequest.redirectSource(); redirect; redirect = redirect.redirectSource()) {
      redirectCount++;
    }
    originalNetworkRequest.markAsRedirect(redirectCount);
    this.finishNetworkRequest(originalNetworkRequest, time, -1);
    const newNetworkRequest = NetworkRequest.create(
      requestId,
      redirectURL,
      originalNetworkRequest.documentURL,
      originalNetworkRequest.frameId,
      originalNetworkRequest.loaderId,
      originalNetworkRequest.initiator(),
      originalNetworkRequest.hasUserGesture() ?? void 0
    );
    requestToManagerMap.set(newNetworkRequest, this.#manager);
    newNetworkRequest.setRedirectSource(originalNetworkRequest);
    originalNetworkRequest.setRedirectDestination(newNetworkRequest);
    return newNetworkRequest;
  }
  maybeAdoptMainResourceRequest(requestId) {
    const request = MultitargetNetworkManager.instance().inflightMainResourceRequests.get(requestId);
    if (!request) {
      return null;
    }
    const oldDispatcher = NetworkManager.forRequest(request).dispatcher;
    oldDispatcher.#requestsById.delete(requestId);
    oldDispatcher.#requestsByURL.delete(request.url());
    const loaderId = request.loaderId;
    if (loaderId) {
      oldDispatcher.#requestsByLoaderId.delete(loaderId);
    }
    const builder = oldDispatcher.#requestIdToExtraInfoBuilder.get(requestId);
    oldDispatcher.#requestIdToExtraInfoBuilder.delete(requestId);
    this.#requestsById.set(requestId, request);
    this.#requestsByURL.set(request.url(), request);
    if (loaderId) {
      this.#requestsByLoaderId.set(loaderId, request);
    }
    if (builder) {
      this.#requestIdToExtraInfoBuilder.set(requestId, builder);
    }
    requestToManagerMap.set(request, this.#manager);
    return request;
  }
  startNetworkRequest(networkRequest, originalRequest) {
    this.#requestsById.set(networkRequest.requestId(), networkRequest);
    this.#requestsByURL.set(networkRequest.url(), networkRequest);
    const loaderId = networkRequest.loaderId;
    if (loaderId) {
      this.#requestsByLoaderId.set(loaderId, networkRequest);
    }
    if (networkRequest.loaderId === networkRequest.requestId()) {
      MultitargetNetworkManager.instance().inflightMainResourceRequests.set(networkRequest.requestId(), networkRequest);
    }
    this.#manager.dispatchEventToListeners("RequestStarted" /* RequestStarted */, { request: networkRequest, originalRequest });
  }
  updateNetworkRequest(networkRequest) {
    this.#manager.dispatchEventToListeners("RequestUpdated" /* RequestUpdated */, networkRequest);
  }
  finishNetworkRequest(networkRequest, finishTime, encodedDataLength) {
    networkRequest.endTime = finishTime;
    networkRequest.finished = true;
    if (encodedDataLength >= 0) {
      const redirectSource = networkRequest.redirectSource();
      if (redirectSource && redirectSource.signedExchangeInfo()) {
        networkRequest.setTransferSize(0);
        redirectSource.setTransferSize(encodedDataLength);
        this.updateNetworkRequest(redirectSource);
      } else {
        networkRequest.setTransferSize(encodedDataLength);
      }
    }
    this.#manager.dispatchEventToListeners("RequestFinished" /* RequestFinished */, networkRequest);
    MultitargetNetworkManager.instance().inflightMainResourceRequests.delete(networkRequest.requestId());
    if (Common.Settings.Settings.instance().moduleSetting("monitoring-xhr-enabled").get() && networkRequest.resourceType().category() === Common.ResourceType.resourceCategories.XHR) {
      let message;
      const failedToLoad = networkRequest.failed || networkRequest.hasErrorStatusCode();
      if (failedToLoad) {
        message = i18nString(
          UIStrings.sFailedLoadingSS,
          { PH1: networkRequest.resourceType().title(), PH2: networkRequest.requestMethod, PH3: networkRequest.url() }
        );
      } else {
        message = i18nString(
          UIStrings.sFinishedLoadingSS,
          { PH1: networkRequest.resourceType().title(), PH2: networkRequest.requestMethod, PH3: networkRequest.url() }
        );
      }
      this.#manager.dispatchEventToListeners(
        "MessageGenerated" /* MessageGenerated */,
        { message, requestId: networkRequest.requestId(), warning: false }
      );
    }
  }
  clearRequests() {
    for (const [requestId, request] of this.#requestsById) {
      if (request.finished) {
        this.#requestsById.delete(requestId);
      }
    }
    for (const [requestURL, request] of this.#requestsByURL) {
      if (request.finished) {
        this.#requestsByURL.delete(requestURL);
      }
    }
    for (const [requestLoaderId, request] of this.#requestsByLoaderId) {
      if (request.finished) {
        this.#requestsByLoaderId.delete(requestLoaderId);
      }
    }
    for (const [requestId, builder] of this.#requestIdToExtraInfoBuilder) {
      if (builder.isFinished()) {
        this.#requestIdToExtraInfoBuilder.delete(requestId);
      }
    }
  }
  webTransportCreated({ transportId, url: requestURL, timestamp: time, initiator }) {
    const networkRequest = NetworkRequest.createForWebSocket(transportId, requestURL, initiator);
    networkRequest.hasNetworkData = true;
    requestToManagerMap.set(networkRequest, this.#manager);
    networkRequest.setResourceType(Common.ResourceType.resourceTypes.WebTransport);
    networkRequest.setIssueTime(time, 0);
    this.startNetworkRequest(networkRequest, null);
  }
  webTransportConnectionEstablished({ transportId, timestamp: time }) {
    const networkRequest = this.#requestsById.get(transportId);
    if (!networkRequest) {
      return;
    }
    networkRequest.responseReceivedTime = time;
    networkRequest.endTime = time + 1e-3;
    this.updateNetworkRequest(networkRequest);
  }
  webTransportClosed({ transportId, timestamp: time }) {
    const networkRequest = this.#requestsById.get(transportId);
    if (!networkRequest) {
      return;
    }
    networkRequest.endTime = time;
    this.finishNetworkRequest(networkRequest, time, 0);
  }
  trustTokenOperationDone(event) {
    const request = this.#requestsById.get(event.requestId);
    if (!request) {
      this.#requestIdToTrustTokenEvent.set(event.requestId, event);
      return;
    }
    request.setTrustTokenOperationDoneEvent(event);
  }
  subresourceWebBundleMetadataReceived({ requestId, urls }) {
    const extraInfoBuilder = this.getExtraInfoBuilder(requestId);
    extraInfoBuilder.setWebBundleInfo({ resourceUrls: urls });
    const finalRequest = extraInfoBuilder.finalRequest();
    if (finalRequest) {
      this.updateNetworkRequest(finalRequest);
    }
  }
  subresourceWebBundleMetadataError({ requestId, errorMessage }) {
    const extraInfoBuilder = this.getExtraInfoBuilder(requestId);
    extraInfoBuilder.setWebBundleInfo({ errorMessage });
    const finalRequest = extraInfoBuilder.finalRequest();
    if (finalRequest) {
      this.updateNetworkRequest(finalRequest);
    }
  }
  subresourceWebBundleInnerResponseParsed({ innerRequestId, bundleRequestId }) {
    const extraInfoBuilder = this.getExtraInfoBuilder(innerRequestId);
    extraInfoBuilder.setWebBundleInnerRequestInfo({ bundleRequestId });
    const finalRequest = extraInfoBuilder.finalRequest();
    if (finalRequest) {
      this.updateNetworkRequest(finalRequest);
    }
  }
  subresourceWebBundleInnerResponseError({ innerRequestId, errorMessage }) {
    const extraInfoBuilder = this.getExtraInfoBuilder(innerRequestId);
    extraInfoBuilder.setWebBundleInnerRequestInfo({ errorMessage });
    const finalRequest = extraInfoBuilder.finalRequest();
    if (finalRequest) {
      this.updateNetworkRequest(finalRequest);
    }
  }
  reportingApiReportAdded(data) {
    this.#manager.dispatchEventToListeners("ReportingApiReportAdded" /* ReportingApiReportAdded */, data.report);
  }
  reportingApiReportUpdated(data) {
    this.#manager.dispatchEventToListeners("ReportingApiReportUpdated" /* ReportingApiReportUpdated */, data.report);
  }
  reportingApiEndpointsChangedForOrigin(data) {
    this.#manager.dispatchEventToListeners("ReportingApiEndpointsChangedForOrigin" /* ReportingApiEndpointsChangedForOrigin */, data);
  }
  policyUpdated() {
  }
  /**
   * @deprecated
   * This method is only kept for usage in a web test.
   */
  createNetworkRequest(requestId, frameId, loaderId, url, documentURL, initiator) {
    const request = NetworkRequest.create(
      requestId,
      url,
      documentURL,
      frameId,
      loaderId,
      initiator
    );
    requestToManagerMap.set(request, this.#manager);
    return request;
  }
}
let multiTargetNetworkManagerInstance;
export class MultitargetNetworkManager extends Common.ObjectWrapper.ObjectWrapper {
  #userAgentOverrideInternal;
  #userAgentMetadataOverride;
  #customAcceptedEncodings;
  #networkAgents;
  #fetchAgents;
  inflightMainResourceRequests;
  #networkConditionsInternal;
  #updatingInterceptionPatternsPromise;
  #blockingEnabledSetting;
  #blockedPatternsSetting;
  #effectiveBlockedURLs;
  #urlsForRequestInterceptor;
  #extraHeaders;
  #customUserAgent;
  constructor() {
    super();
    this.#userAgentOverrideInternal = "";
    this.#userAgentMetadataOverride = null;
    this.#customAcceptedEncodings = null;
    this.#networkAgents = /* @__PURE__ */ new Set();
    this.#fetchAgents = /* @__PURE__ */ new Set();
    this.inflightMainResourceRequests = /* @__PURE__ */ new Map();
    this.#networkConditionsInternal = NoThrottlingConditions;
    this.#updatingInterceptionPatternsPromise = null;
    const blockedPatternChanged = () => {
      this.updateBlockedPatterns();
      this.dispatchEventToListeners(MultitargetNetworkManager.Events.BLOCKED_PATTERNS_CHANGED);
    };
    this.#blockingEnabledSetting = Common.Settings.Settings.instance().moduleSetting("request-blocking-enabled");
    this.#blockingEnabledSetting.addChangeListener(blockedPatternChanged);
    this.#blockedPatternsSetting = Common.Settings.Settings.instance().createSetting("network-blocked-patterns", []);
    this.#blockedPatternsSetting.addChangeListener(blockedPatternChanged);
    this.#effectiveBlockedURLs = [];
    this.updateBlockedPatterns();
    this.#urlsForRequestInterceptor = new Platform.MapUtilities.Multimap();
    TargetManager.instance().observeModels(NetworkManager, this);
  }
  static instance(opts = { forceNew: null }) {
    const { forceNew } = opts;
    if (!multiTargetNetworkManagerInstance || forceNew) {
      multiTargetNetworkManagerInstance = new MultitargetNetworkManager();
    }
    return multiTargetNetworkManagerInstance;
  }
  static dispose() {
    multiTargetNetworkManagerInstance = null;
  }
  static getChromeVersion() {
    const chromeRegex = /(?:^|\W)(?:Chrome|HeadlessChrome)\/(\S+)/;
    const chromeMatch = navigator.userAgent.match(chromeRegex);
    if (chromeMatch && chromeMatch.length > 1) {
      return chromeMatch[1];
    }
    return "";
  }
  static patchUserAgentWithChromeVersion(uaString) {
    const chromeVersion = MultitargetNetworkManager.getChromeVersion();
    if (chromeVersion.length > 0) {
      const additionalAppVersion = chromeVersion.split(".", 1)[0] + ".0.100.0";
      return Platform.StringUtilities.sprintf(uaString, chromeVersion, additionalAppVersion);
    }
    return uaString;
  }
  static patchUserAgentMetadataWithChromeVersion(userAgentMetadata) {
    if (!userAgentMetadata.brands) {
      return;
    }
    const chromeVersion = MultitargetNetworkManager.getChromeVersion();
    if (chromeVersion.length === 0) {
      return;
    }
    const majorVersion = chromeVersion.split(".", 1)[0];
    for (const brand of userAgentMetadata.brands) {
      if (brand.version.includes("%s")) {
        brand.version = Platform.StringUtilities.sprintf(brand.version, majorVersion);
      }
    }
    if (userAgentMetadata.fullVersion) {
      if (userAgentMetadata.fullVersion.includes("%s")) {
        userAgentMetadata.fullVersion = Platform.StringUtilities.sprintf(userAgentMetadata.fullVersion, chromeVersion);
      }
    }
  }
  modelAdded(networkManager) {
    const networkAgent = networkManager.target().networkAgent();
    const fetchAgent = networkManager.target().fetchAgent();
    if (this.#extraHeaders) {
      void networkAgent.invoke_setExtraHTTPHeaders({ headers: this.#extraHeaders });
    }
    if (this.currentUserAgent()) {
      void networkAgent.invoke_setUserAgentOverride(
        { userAgent: this.currentUserAgent(), userAgentMetadata: this.#userAgentMetadataOverride || void 0 }
      );
    }
    if (this.#effectiveBlockedURLs.length) {
      void networkAgent.invoke_setBlockedURLs({ urls: this.#effectiveBlockedURLs });
    }
    if (this.isIntercepting()) {
      void fetchAgent.invoke_enable({ patterns: this.#urlsForRequestInterceptor.valuesArray() });
    }
    if (this.#customAcceptedEncodings === null) {
      void networkAgent.invoke_clearAcceptedEncodingsOverride();
    } else {
      void networkAgent.invoke_setAcceptedEncodings({ encodings: this.#customAcceptedEncodings });
    }
    this.#networkAgents.add(networkAgent);
    this.#fetchAgents.add(fetchAgent);
    if (this.isThrottling()) {
      this.updateNetworkConditions(networkAgent);
    }
  }
  modelRemoved(networkManager) {
    for (const entry of this.inflightMainResourceRequests) {
      const manager = NetworkManager.forRequest(entry[1]);
      if (manager !== networkManager) {
        continue;
      }
      this.inflightMainResourceRequests.delete(entry[0]);
    }
    this.#networkAgents.delete(networkManager.target().networkAgent());
    this.#fetchAgents.delete(networkManager.target().fetchAgent());
  }
  isThrottling() {
    return this.#networkConditionsInternal.download >= 0 || this.#networkConditionsInternal.upload >= 0 || this.#networkConditionsInternal.latency > 0;
  }
  isOffline() {
    return !this.#networkConditionsInternal.download && !this.#networkConditionsInternal.upload;
  }
  setNetworkConditions(conditions) {
    this.#networkConditionsInternal = conditions;
    for (const agent of this.#networkAgents) {
      this.updateNetworkConditions(agent);
    }
    this.dispatchEventToListeners(MultitargetNetworkManager.Events.CONDITIONS_CHANGED);
  }
  networkConditions() {
    return this.#networkConditionsInternal;
  }
  updateNetworkConditions(networkAgent) {
    const conditions = this.#networkConditionsInternal;
    if (!this.isThrottling()) {
      void networkAgent.invoke_emulateNetworkConditions({
        offline: false,
        latency: 0,
        downloadThroughput: 0,
        uploadThroughput: 0
      });
    } else {
      void networkAgent.invoke_emulateNetworkConditions({
        offline: this.isOffline(),
        latency: conditions.latency,
        downloadThroughput: conditions.download < 0 ? 0 : conditions.download,
        uploadThroughput: conditions.upload < 0 ? 0 : conditions.upload,
        packetLoss: (conditions.packetLoss ?? 0) < 0 ? 0 : conditions.packetLoss,
        packetQueueLength: conditions.packetQueueLength,
        packetReordering: conditions.packetReordering,
        connectionType: NetworkManager.connectionType(conditions)
      });
    }
  }
  setExtraHTTPHeaders(headers) {
    this.#extraHeaders = headers;
    for (const agent of this.#networkAgents) {
      void agent.invoke_setExtraHTTPHeaders({ headers: this.#extraHeaders });
    }
  }
  currentUserAgent() {
    return this.#customUserAgent ? this.#customUserAgent : this.#userAgentOverrideInternal;
  }
  updateUserAgentOverride() {
    const userAgent = this.currentUserAgent();
    for (const agent of this.#networkAgents) {
      void agent.invoke_setUserAgentOverride(
        { userAgent, userAgentMetadata: this.#userAgentMetadataOverride || void 0 }
      );
    }
  }
  setUserAgentOverride(userAgent, userAgentMetadataOverride) {
    const uaChanged = this.#userAgentOverrideInternal !== userAgent;
    this.#userAgentOverrideInternal = userAgent;
    if (!this.#customUserAgent) {
      this.#userAgentMetadataOverride = userAgentMetadataOverride;
      this.updateUserAgentOverride();
    } else {
      this.#userAgentMetadataOverride = null;
    }
    if (uaChanged) {
      this.dispatchEventToListeners(MultitargetNetworkManager.Events.USER_AGENT_CHANGED);
    }
  }
  userAgentOverride() {
    return this.#userAgentOverrideInternal;
  }
  setCustomUserAgentOverride(userAgent, userAgentMetadataOverride = null) {
    this.#customUserAgent = userAgent;
    this.#userAgentMetadataOverride = userAgentMetadataOverride;
    this.updateUserAgentOverride();
  }
  setCustomAcceptedEncodingsOverride(acceptedEncodings) {
    this.#customAcceptedEncodings = acceptedEncodings;
    this.updateAcceptedEncodingsOverride();
    this.dispatchEventToListeners(MultitargetNetworkManager.Events.ACCEPTED_ENCODINGS_CHANGED);
  }
  clearCustomAcceptedEncodingsOverride() {
    this.#customAcceptedEncodings = null;
    this.updateAcceptedEncodingsOverride();
    this.dispatchEventToListeners(MultitargetNetworkManager.Events.ACCEPTED_ENCODINGS_CHANGED);
  }
  isAcceptedEncodingOverrideSet() {
    return this.#customAcceptedEncodings !== null;
  }
  updateAcceptedEncodingsOverride() {
    const customAcceptedEncodings = this.#customAcceptedEncodings;
    for (const agent of this.#networkAgents) {
      if (customAcceptedEncodings === null) {
        void agent.invoke_clearAcceptedEncodingsOverride();
      } else {
        void agent.invoke_setAcceptedEncodings({ encodings: customAcceptedEncodings });
      }
    }
  }
  // TODO(allada) Move all request blocking into interception and let view manage blocking.
  blockedPatterns() {
    return this.#blockedPatternsSetting.get().slice();
  }
  blockingEnabled() {
    return this.#blockingEnabledSetting.get();
  }
  isBlocking() {
    return Boolean(this.#effectiveBlockedURLs.length);
  }
  setBlockedPatterns(patterns) {
    this.#blockedPatternsSetting.set(patterns);
  }
  setBlockingEnabled(enabled) {
    if (this.#blockingEnabledSetting.get() === enabled) {
      return;
    }
    this.#blockingEnabledSetting.set(enabled);
  }
  updateBlockedPatterns() {
    const urls = [];
    if (this.#blockingEnabledSetting.get()) {
      for (const pattern of this.#blockedPatternsSetting.get()) {
        if (pattern.enabled) {
          urls.push(pattern.url);
        }
      }
    }
    if (!urls.length && !this.#effectiveBlockedURLs.length) {
      return;
    }
    this.#effectiveBlockedURLs = urls;
    for (const agent of this.#networkAgents) {
      void agent.invoke_setBlockedURLs({ urls: this.#effectiveBlockedURLs });
    }
  }
  isIntercepting() {
    return Boolean(this.#urlsForRequestInterceptor.size);
  }
  setInterceptionHandlerForPatterns(patterns, requestInterceptor) {
    this.#urlsForRequestInterceptor.deleteAll(requestInterceptor);
    for (const newPattern of patterns) {
      this.#urlsForRequestInterceptor.set(requestInterceptor, newPattern);
    }
    return this.updateInterceptionPatternsOnNextTick();
  }
  updateInterceptionPatternsOnNextTick() {
    if (!this.#updatingInterceptionPatternsPromise) {
      this.#updatingInterceptionPatternsPromise = Promise.resolve().then(this.updateInterceptionPatterns.bind(this));
    }
    return this.#updatingInterceptionPatternsPromise;
  }
  async updateInterceptionPatterns() {
    if (!Common.Settings.Settings.instance().moduleSetting("cache-disabled").get()) {
      Common.Settings.Settings.instance().moduleSetting("cache-disabled").set(true);
    }
    this.#updatingInterceptionPatternsPromise = null;
    const promises = [];
    for (const agent of this.#fetchAgents) {
      promises.push(agent.invoke_enable({ patterns: this.#urlsForRequestInterceptor.valuesArray() }));
    }
    this.dispatchEventToListeners(MultitargetNetworkManager.Events.INTERCEPTORS_CHANGED);
    await Promise.all(promises);
  }
  async requestIntercepted(interceptedRequest) {
    for (const requestInterceptor of this.#urlsForRequestInterceptor.keysArray()) {
      await requestInterceptor(interceptedRequest);
      if (interceptedRequest.hasResponded() && interceptedRequest.networkRequest) {
        this.dispatchEventToListeners(
          MultitargetNetworkManager.Events.REQUEST_INTERCEPTED,
          interceptedRequest.networkRequest.requestId()
        );
        return;
      }
    }
    if (!interceptedRequest.hasResponded()) {
      interceptedRequest.continueRequestWithoutChange();
    }
  }
  clearBrowserCache() {
    for (const agent of this.#networkAgents) {
      void agent.invoke_clearBrowserCache();
    }
  }
  clearBrowserCookies() {
    for (const agent of this.#networkAgents) {
      void agent.invoke_clearBrowserCookies();
    }
  }
  async getCertificate(origin) {
    const target = TargetManager.instance().primaryPageTarget();
    if (!target) {
      return [];
    }
    const certificate = await target.networkAgent().invoke_getCertificate({ origin });
    if (!certificate) {
      return [];
    }
    return certificate.tableNames;
  }
  async loadResource(url) {
    const headers = {};
    const currentUserAgent = this.currentUserAgent();
    if (currentUserAgent) {
      headers["User-Agent"] = currentUserAgent;
    }
    if (Common.Settings.Settings.instance().moduleSetting("cache-disabled").get()) {
      headers["Cache-Control"] = "no-cache";
    }
    const allowRemoteFilePaths = Common.Settings.Settings.instance().moduleSetting("network.enable-remote-file-loading").get();
    return new Promise(
      (resolve) => Host.ResourceLoader.load(url, headers, (success, _responseHeaders, content, errorDescription) => {
        resolve({ success, content, errorDescription });
      }, allowRemoteFilePaths)
    );
  }
}
((MultitargetNetworkManager2) => {
  let Events2;
  ((Events3) => {
    Events3["BLOCKED_PATTERNS_CHANGED"] = "BlockedPatternsChanged";
    Events3["CONDITIONS_CHANGED"] = "ConditionsChanged";
    Events3["USER_AGENT_CHANGED"] = "UserAgentChanged";
    Events3["INTERCEPTORS_CHANGED"] = "InterceptorsChanged";
    Events3["ACCEPTED_ENCODINGS_CHANGED"] = "AcceptedEncodingsChanged";
    Events3["REQUEST_INTERCEPTED"] = "RequestIntercepted";
    Events3["REQUEST_FULFILLED"] = "RequestFulfilled";
  })(Events2 = MultitargetNetworkManager2.Events || (MultitargetNetworkManager2.Events = {}));
})(MultitargetNetworkManager || (MultitargetNetworkManager = {}));
export class InterceptedRequest {
  #fetchAgent;
  #hasRespondedInternal;
  request;
  resourceType;
  responseStatusCode;
  responseHeaders;
  requestId;
  networkRequest;
  constructor(fetchAgent, request, resourceType, requestId, networkRequest, responseStatusCode, responseHeaders) {
    this.#fetchAgent = fetchAgent;
    this.#hasRespondedInternal = false;
    this.request = request;
    this.resourceType = resourceType;
    this.responseStatusCode = responseStatusCode;
    this.responseHeaders = responseHeaders;
    this.requestId = requestId;
    this.networkRequest = networkRequest;
  }
  hasResponded() {
    return this.#hasRespondedInternal;
  }
  static mergeSetCookieHeaders(originalSetCookieHeaders, setCookieHeadersFromOverrides) {
    const generateHeaderMap = (headers) => {
      const result = /* @__PURE__ */ new Map();
      for (const header of headers) {
        const match = header.value.match(/^([a-zA-Z0-9!#$%&'*+.^_`|~-]+=)(.*)$/);
        if (match) {
          if (result.has(match[1])) {
            result.get(match[1])?.push(header.value);
          } else {
            result.set(match[1], [header.value]);
          }
        } else {
          if (result.has(header.value)) {
            result.get(header.value)?.push(header.value);
          } else {
            result.set(header.value, [header.value]);
          }
        }
      }
      return result;
    };
    const originalHeadersMap = generateHeaderMap(originalSetCookieHeaders);
    const overridesHeaderMap = generateHeaderMap(setCookieHeadersFromOverrides);
    const mergedHeaders = [];
    for (const [key, headerValues] of originalHeadersMap) {
      if (overridesHeaderMap.has(key)) {
        for (const headerValue of overridesHeaderMap.get(key) || []) {
          mergedHeaders.push({ name: "set-cookie", value: headerValue });
        }
      } else {
        for (const headerValue of headerValues) {
          mergedHeaders.push({ name: "set-cookie", value: headerValue });
        }
      }
    }
    for (const [key, headerValues] of overridesHeaderMap) {
      if (originalHeadersMap.has(key)) {
        continue;
      }
      for (const headerValue of headerValues) {
        mergedHeaders.push({ name: "set-cookie", value: headerValue });
      }
    }
    return mergedHeaders;
  }
  async continueRequestWithContent(contentBlob, encoded, responseHeaders, isBodyOverridden) {
    this.#hasRespondedInternal = true;
    const body = encoded ? await contentBlob.text() : await Common.Base64.encode(contentBlob).catch((err) => {
      console.error(err);
      return "";
    });
    const responseCode = isBodyOverridden ? 200 : this.responseStatusCode || 200;
    if (this.networkRequest) {
      const originalSetCookieHeaders = this.networkRequest?.originalResponseHeaders.filter((header) => header.name === "set-cookie") || [];
      const setCookieHeadersFromOverrides = responseHeaders.filter((header) => header.name === "set-cookie");
      this.networkRequest.setCookieHeaders = InterceptedRequest.mergeSetCookieHeaders(originalSetCookieHeaders, setCookieHeadersFromOverrides);
      this.networkRequest.hasOverriddenContent = isBodyOverridden;
    }
    void this.#fetchAgent.invoke_fulfillRequest({ requestId: this.requestId, responseCode, body, responseHeaders });
    MultitargetNetworkManager.instance().dispatchEventToListeners(
      "RequestFulfilled" /* REQUEST_FULFILLED */,
      this.request.url
    );
  }
  continueRequestWithoutChange() {
    console.assert(!this.#hasRespondedInternal);
    this.#hasRespondedInternal = true;
    void this.#fetchAgent.invoke_continueRequest({ requestId: this.requestId });
  }
  continueRequestWithError(errorReason) {
    console.assert(!this.#hasRespondedInternal);
    this.#hasRespondedInternal = true;
    void this.#fetchAgent.invoke_failRequest({ requestId: this.requestId, errorReason });
  }
  async responseBody() {
    const response = await this.#fetchAgent.invoke_getResponseBody({ requestId: this.requestId });
    const error = response.getError();
    if (error) {
      return { error };
    }
    const { mimeType, charset } = this.getMimeTypeAndCharset();
    return new TextUtils.ContentData.ContentData(
      response.body,
      response.base64Encoded,
      mimeType ?? "application/octet-stream",
      charset ?? void 0
    );
  }
  isRedirect() {
    return this.responseStatusCode !== void 0 && this.responseStatusCode >= 300 && this.responseStatusCode < 400;
  }
  /**
   * Tries to determine the MIME type and charset for this intercepted request.
   * Looks at the interecepted response headers first (for Content-Type header), then
   * checks the `NetworkRequest` if we have one.
   */
  getMimeTypeAndCharset() {
    for (const header of this.responseHeaders ?? []) {
      if (header.name.toLowerCase() === "content-type") {
        return Platform.MimeType.parseContentType(header.value);
      }
    }
    const mimeType = this.networkRequest?.mimeType ?? null;
    const charset = this.networkRequest?.charset() ?? null;
    return { mimeType, charset };
  }
}
class ExtraInfoBuilder {
  #requests;
  #requestExtraInfos;
  #responseExtraInfos;
  #responseEarlyHintsHeaders;
  #finishedInternal;
  #webBundleInfo;
  #webBundleInnerRequestInfo;
  constructor() {
    this.#requests = [];
    this.#requestExtraInfos = [];
    this.#responseEarlyHintsHeaders = [];
    this.#responseExtraInfos = [];
    this.#finishedInternal = false;
    this.#webBundleInfo = null;
    this.#webBundleInnerRequestInfo = null;
  }
  addRequest(req) {
    this.#requests.push(req);
    this.sync(this.#requests.length - 1);
  }
  addRequestExtraInfo(info) {
    this.#requestExtraInfos.push(info);
    this.sync(this.#requestExtraInfos.length - 1);
  }
  addResponseExtraInfo(info) {
    this.#responseExtraInfos.push(info);
    this.sync(this.#responseExtraInfos.length - 1);
  }
  setEarlyHintsHeaders(earlyHintsHeaders) {
    this.#responseEarlyHintsHeaders = earlyHintsHeaders;
    this.updateFinalRequest();
  }
  setWebBundleInfo(info) {
    this.#webBundleInfo = info;
    this.updateFinalRequest();
  }
  setWebBundleInnerRequestInfo(info) {
    this.#webBundleInnerRequestInfo = info;
    this.updateFinalRequest();
  }
  finished() {
    this.#finishedInternal = true;
    this.updateFinalRequest();
  }
  isFinished() {
    return this.#finishedInternal;
  }
  sync(index) {
    const req = this.#requests[index];
    if (!req) {
      return;
    }
    const requestExtraInfo = this.#requestExtraInfos[index];
    if (requestExtraInfo) {
      req.addExtraRequestInfo(requestExtraInfo);
      this.#requestExtraInfos[index] = null;
    }
    const responseExtraInfo = this.#responseExtraInfos[index];
    if (responseExtraInfo) {
      req.addExtraResponseInfo(responseExtraInfo);
      this.#responseExtraInfos[index] = null;
    }
  }
  finalRequest() {
    if (!this.#finishedInternal) {
      return null;
    }
    return this.#requests[this.#requests.length - 1] || null;
  }
  updateFinalRequest() {
    if (!this.#finishedInternal) {
      return;
    }
    const finalRequest = this.finalRequest();
    finalRequest?.setWebBundleInfo(this.#webBundleInfo);
    finalRequest?.setWebBundleInnerRequestInfo(this.#webBundleInnerRequestInfo);
    finalRequest?.setEarlyHintsHeaders(this.#responseEarlyHintsHeaders);
  }
}
SDKModel.register(NetworkManager, { capabilities: Capability.NETWORK, autostart: true });
export class ConditionsSerializer {
  stringify(value) {
    const conditions = value;
    return JSON.stringify({
      ...conditions,
      title: typeof conditions.title === "function" ? conditions.title() : conditions.title
    });
  }
  parse(serialized) {
    const parsed = JSON.parse(serialized);
    return {
      ...parsed,
      // eslint-disable-next-line rulesdir/l10n_i18nString_call_only_with_uistrings
      title: parsed.i18nTitleKey ? i18nLazyString(parsed.i18nTitleKey) : parsed.title
    };
  }
}
export function networkConditionsEqual(first, second) {
  const firstTitle = first.i18nTitleKey || (typeof first.title === "function" ? first.title() : first.title);
  const secondTitle = second.i18nTitleKey || (typeof second.title === "function" ? second.title() : second.title);
  return second.download === first.download && second.upload === first.upload && second.latency === first.latency && first.packetLoss === second.packetLoss && first.packetQueueLength === second.packetQueueLength && first.packetReordering === second.packetReordering && secondTitle === firstTitle;
}
//# sourceMappingURL=NetworkManager.js.map

"use strict";
import * as Platform from "../../../core/platform/platform.js";
import * as Protocol from "../../../generated/protocol.js";
import * as Helpers from "../helpers/helpers.js";
import * as Types from "../types/types.js";
import { data as metaHandlerData } from "./MetaHandler.js";
const MILLISECONDS_TO_MICROSECONDS = 1e3;
const SECONDS_TO_MICROSECONDS = 1e6;
const webSocketData = /* @__PURE__ */ new Map();
const requestMap = /* @__PURE__ */ new Map();
const requestsById = /* @__PURE__ */ new Map();
const requestsByOrigin = /* @__PURE__ */ new Map();
const requestsByTime = [];
const networkRequestEventByInitiatorUrl = /* @__PURE__ */ new Map();
const eventToInitiatorMap = /* @__PURE__ */ new Map();
function storeTraceEventWithRequestId(requestId, key, value) {
  if (!requestMap.has(requestId)) {
    requestMap.set(requestId, {});
  }
  const traceEvents = requestMap.get(requestId);
  if (!traceEvents) {
    throw new Error(`Unable to locate trace events for request ID ${requestId}`);
  }
  if (Array.isArray(traceEvents[key])) {
    const target = traceEvents[key];
    const values = value;
    target.push(...values);
  } else {
    traceEvents[key] = value;
  }
}
function firstPositiveValueInList(entries) {
  for (const entry of entries) {
    if (entry > 0) {
      return entry;
    }
  }
  return 0;
}
export function reset() {
  requestsById.clear();
  requestsByOrigin.clear();
  requestMap.clear();
  requestsByTime.length = 0;
  networkRequestEventByInitiatorUrl.clear();
  eventToInitiatorMap.clear();
  webSocketData.clear();
}
export function handleEvent(event) {
  if (Types.Events.isResourceChangePriority(event)) {
    storeTraceEventWithRequestId(event.args.data.requestId, "changePriority", event);
    return;
  }
  if (Types.Events.isResourceWillSendRequest(event)) {
    storeTraceEventWithRequestId(event.args.data.requestId, "willSendRequests", [event]);
    return;
  }
  if (Types.Events.isResourceSendRequest(event)) {
    storeTraceEventWithRequestId(event.args.data.requestId, "sendRequests", [event]);
    return;
  }
  if (Types.Events.isResourceReceiveResponse(event)) {
    storeTraceEventWithRequestId(event.args.data.requestId, "receiveResponse", event);
    return;
  }
  if (Types.Events.isResourceReceivedData(event)) {
    storeTraceEventWithRequestId(event.args.data.requestId, "receivedData", [event]);
    return;
  }
  if (Types.Events.isResourceFinish(event)) {
    storeTraceEventWithRequestId(event.args.data.requestId, "resourceFinish", event);
    return;
  }
  if (Types.Events.isResourceMarkAsCached(event)) {
    storeTraceEventWithRequestId(event.args.data.requestId, "resourceMarkAsCached", event);
    return;
  }
  if (Types.Events.isWebSocketCreate(event) || Types.Events.isWebSocketInfo(event) || Types.Events.isWebSocketTransfer(event)) {
    const identifier = event.args.data.identifier;
    if (!webSocketData.has(identifier)) {
      if (event.args.data.frame) {
        webSocketData.set(identifier, {
          frame: event.args.data.frame,
          webSocketIdentifier: identifier,
          events: [],
          syntheticConnection: null
        });
      } else if (event.args.data.workerId) {
        webSocketData.set(identifier, {
          workerId: event.args.data.workerId,
          webSocketIdentifier: identifier,
          events: [],
          syntheticConnection: null
        });
      }
    }
    webSocketData.get(identifier)?.events.push(event);
  }
}
export async function finalize() {
  const { rendererProcessesByFrame } = metaHandlerData();
  for (const [requestId, request] of requestMap.entries()) {
    if (!request.sendRequests || !request.receiveResponse) {
      continue;
    }
    const redirects = [];
    for (let i = 0; i < request.sendRequests.length - 1; i++) {
      const sendRequest = request.sendRequests[i];
      const nextSendRequest = request.sendRequests[i + 1];
      let ts = sendRequest.ts;
      let dur = Types.Timing.MicroSeconds(nextSendRequest.ts - sendRequest.ts);
      if (request.willSendRequests && request.willSendRequests[i] && request.willSendRequests[i + 1]) {
        const willSendRequest = request.willSendRequests[i];
        const nextWillSendRequest = request.willSendRequests[i + 1];
        ts = willSendRequest.ts;
        dur = Types.Timing.MicroSeconds(nextWillSendRequest.ts - willSendRequest.ts);
      }
      redirects.push({
        url: sendRequest.args.data.url,
        priority: sendRequest.args.data.priority,
        requestMethod: sendRequest.args.data.requestMethod,
        ts,
        dur
      });
    }
    const isPushedResource = request.resourceFinish?.args.data.encodedDataLength !== 0;
    const isDiskCached = request.receiveResponse.args.data.fromCache && !request.receiveResponse.args.data.fromServiceWorker && !isPushedResource;
    const isMemoryCached = request.resourceMarkAsCached !== void 0;
    const timing = isMemoryCached ? void 0 : request.receiveResponse.args.data.timing;
    if (!timing && !isMemoryCached) {
      continue;
    }
    const firstSendRequest = request.sendRequests[0];
    const finalSendRequest = request.sendRequests[request.sendRequests.length - 1];
    const initialPriority = finalSendRequest.args.data.priority;
    let finalPriority = initialPriority;
    if (request.changePriority) {
      finalPriority = request.changePriority.args.data.priority;
    }
    const startTime = request.willSendRequests && request.willSendRequests.length ? Types.Timing.MicroSeconds(request.willSendRequests[0].ts) : Types.Timing.MicroSeconds(firstSendRequest.ts);
    const endRedirectTime = request.willSendRequests && request.willSendRequests.length ? Types.Timing.MicroSeconds(request.willSendRequests[request.willSendRequests.length - 1].ts) : Types.Timing.MicroSeconds(finalSendRequest.ts);
    const endTime = request.resourceFinish ? request.resourceFinish.ts : endRedirectTime;
    const finishTime = request.resourceFinish?.args.data.finishTime ? Types.Timing.MicroSeconds(request.resourceFinish.args.data.finishTime * SECONDS_TO_MICROSECONDS) : Types.Timing.MicroSeconds(endTime);
    const networkDuration = Types.Timing.MicroSeconds(timing ? (finishTime || endRedirectTime) - endRedirectTime : 0);
    const processingDuration = Types.Timing.MicroSeconds(endTime - (finishTime || endTime));
    const redirectionDuration = Types.Timing.MicroSeconds(endRedirectTime - startTime);
    const queueingFromTraceData = timing ? timing.requestTime * SECONDS_TO_MICROSECONDS - endRedirectTime : 0;
    const queueing = Types.Timing.MicroSeconds(Platform.NumberUtilities.clamp(queueingFromTraceData, 0, Number.MAX_VALUE));
    const stalled = timing ? Types.Timing.MicroSeconds(firstPositiveValueInList([
      timing.dnsStart * MILLISECONDS_TO_MICROSECONDS,
      timing.connectStart * MILLISECONDS_TO_MICROSECONDS,
      timing.sendStart * MILLISECONDS_TO_MICROSECONDS,
      request.receiveResponse.ts - endRedirectTime
    ])) : Types.Timing.MicroSeconds(request.receiveResponse.ts - startTime);
    const sendStartTime = timing ? Types.Timing.MicroSeconds(
      timing.requestTime * SECONDS_TO_MICROSECONDS + timing.sendStart * MILLISECONDS_TO_MICROSECONDS
    ) : startTime;
    const waiting = timing ? Types.Timing.MicroSeconds((timing.receiveHeadersEnd - timing.sendEnd) * MILLISECONDS_TO_MICROSECONDS) : Types.Timing.MicroSeconds(0);
    const downloadStart = timing ? Types.Timing.MicroSeconds(
      timing.requestTime * SECONDS_TO_MICROSECONDS + timing.receiveHeadersEnd * MILLISECONDS_TO_MICROSECONDS
    ) : startTime;
    const download = timing ? Types.Timing.MicroSeconds((finishTime || downloadStart) - downloadStart) : Types.Timing.MicroSeconds(endTime - request.receiveResponse.ts);
    const totalTime = Types.Timing.MicroSeconds(networkDuration + processingDuration);
    const dnsLookup = timing ? Types.Timing.MicroSeconds((timing.dnsEnd - timing.dnsStart) * MILLISECONDS_TO_MICROSECONDS) : Types.Timing.MicroSeconds(0);
    const ssl = timing ? Types.Timing.MicroSeconds((timing.sslEnd - timing.sslStart) * MILLISECONDS_TO_MICROSECONDS) : Types.Timing.MicroSeconds(0);
    const proxyNegotiation = timing ? Types.Timing.MicroSeconds((timing.proxyEnd - timing.proxyStart) * MILLISECONDS_TO_MICROSECONDS) : Types.Timing.MicroSeconds(0);
    const requestSent = timing ? Types.Timing.MicroSeconds((timing.sendEnd - timing.sendStart) * MILLISECONDS_TO_MICROSECONDS) : Types.Timing.MicroSeconds(0);
    const initialConnection = timing ? Types.Timing.MicroSeconds((timing.connectEnd - timing.connectStart) * MILLISECONDS_TO_MICROSECONDS) : Types.Timing.MicroSeconds(0);
    const { frame, url, renderBlocking } = finalSendRequest.args.data;
    const { encodedDataLength, decodedBodyLength } = request.resourceFinish ? request.resourceFinish.args.data : { encodedDataLength: 0, decodedBodyLength: 0 };
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === "https:";
    const requestingFrameUrl = Helpers.Trace.activeURLForFrameAtTime(frame, finalSendRequest.ts, rendererProcessesByFrame) || "";
    const networkEvent = Helpers.SyntheticEvents.SyntheticEventsManager.registerSyntheticEvent({
      rawSourceEvent: finalSendRequest,
      args: {
        data: {
          // All data we create from trace events should be added to |syntheticData|.
          syntheticData: {
            dnsLookup,
            download,
            downloadStart,
            finishTime,
            initialConnection,
            isDiskCached,
            isHttps,
            isMemoryCached,
            isPushedResource,
            networkDuration,
            processingDuration,
            proxyNegotiation,
            queueing,
            redirectionDuration,
            requestSent,
            sendStartTime,
            ssl,
            stalled,
            totalTime,
            waiting
          },
          // All fields below are from TraceEventsForNetworkRequest.
          decodedBodyLength,
          encodedDataLength,
          frame,
          fromServiceWorker: request.receiveResponse.args.data.fromServiceWorker,
          isLinkPreload: finalSendRequest.args.data.isLinkPreload || false,
          mimeType: request.receiveResponse.args.data.mimeType,
          priority: finalPriority,
          initialPriority,
          protocol: request.receiveResponse.args.data.protocol ?? "unknown",
          redirects,
          // In the event the property isn't set, assume non-blocking.
          renderBlocking: renderBlocking ?? "non_blocking",
          requestId,
          requestingFrameUrl,
          requestMethod: finalSendRequest.args.data.requestMethod,
          resourceType: finalSendRequest.args.data.resourceType ?? Protocol.Network.ResourceType.Other,
          statusCode: request.receiveResponse.args.data.statusCode,
          responseHeaders: request.receiveResponse.args.data.headers || [],
          fetchPriorityHint: finalSendRequest.args.data.fetchPriorityHint ?? "auto",
          initiator: finalSendRequest.args.data.initiator,
          stackTrace: finalSendRequest.args.data.stackTrace,
          timing,
          url,
          failed: request.resourceFinish?.args.data.didFail ?? false,
          finished: Boolean(request.resourceFinish),
          connectionId: request.receiveResponse.args.data.connectionId,
          connectionReused: request.receiveResponse.args.data.connectionReused
        }
      },
      cat: "loading",
      name: "SyntheticNetworkRequest",
      ph: Types.Events.Phase.COMPLETE,
      dur: Types.Timing.MicroSeconds(endTime - startTime),
      tdur: Types.Timing.MicroSeconds(endTime - startTime),
      ts: Types.Timing.MicroSeconds(startTime),
      tts: Types.Timing.MicroSeconds(startTime),
      pid: finalSendRequest.pid,
      tid: finalSendRequest.tid
    });
    const requests = Platform.MapUtilities.getWithDefault(requestsByOrigin, parsedUrl.host, () => {
      return {
        renderBlocking: [],
        nonRenderBlocking: [],
        all: []
      };
    });
    if (!Helpers.Network.isSyntheticNetworkRequestEventRenderBlocking(networkEvent)) {
      requests.nonRenderBlocking.push(networkEvent);
    } else {
      requests.renderBlocking.push(networkEvent);
    }
    requests.all.push(networkEvent);
    requestsByTime.push(networkEvent);
    requestsById.set(networkEvent.args.data.requestId, networkEvent);
    const initiatorUrl = networkEvent.args.data.initiator?.url || Helpers.Trace.getZeroIndexedStackTraceForEvent(networkEvent)?.at(0)?.url;
    if (initiatorUrl) {
      const events = networkRequestEventByInitiatorUrl.get(initiatorUrl) ?? [];
      events.push(networkEvent);
      networkRequestEventByInitiatorUrl.set(initiatorUrl, events);
    }
  }
  for (const request of requestsByTime) {
    const initiatedEvents = networkRequestEventByInitiatorUrl.get(request.args.data.url);
    if (initiatedEvents) {
      for (const initiatedEvent of initiatedEvents) {
        eventToInitiatorMap.set(initiatedEvent, request);
      }
    }
  }
  finalizeWebSocketData();
}
export function data() {
  return {
    byId: requestsById,
    byOrigin: requestsByOrigin,
    byTime: requestsByTime,
    eventToInitiator: eventToInitiatorMap,
    webSocket: [...webSocketData.values()]
  };
}
export function deps() {
  return ["Meta"];
}
function finalizeWebSocketData() {
  webSocketData.forEach((data2) => {
    let startEvent = null;
    let endEvent = null;
    for (const event of data2.events) {
      if (Types.Events.isWebSocketCreate(event)) {
        startEvent = event;
      }
      if (Types.Events.isWebSocketDestroy(event)) {
        endEvent = event;
      }
    }
    data2.syntheticConnection = createSyntheticWebSocketConnection(startEvent, endEvent, data2.events[0]);
  });
}
function createSyntheticWebSocketConnection(startEvent, endEvent, firstRecordedEvent) {
  const { traceBounds } = metaHandlerData();
  const startTs = startEvent ? startEvent.ts : traceBounds.min;
  const endTs = endEvent ? endEvent.ts : traceBounds.max;
  const duration = endTs - startTs;
  const mainEvent = startEvent || endEvent || firstRecordedEvent;
  return {
    name: "SyntheticWebSocketConnection",
    cat: mainEvent.cat,
    ph: Types.Events.Phase.COMPLETE,
    ts: startTs,
    dur: duration,
    pid: mainEvent.pid,
    tid: mainEvent.tid,
    s: mainEvent.s,
    rawSourceEvent: mainEvent,
    _tag: "SyntheticEntryTag",
    args: {
      data: {
        identifier: mainEvent.args.data.identifier,
        priority: Protocol.Network.ResourcePriority.Low,
        url: mainEvent.args.data.url || ""
      }
    }
  };
}
//# sourceMappingURL=NetworkRequestsHandler.js.map

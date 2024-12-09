"use strict";
import * as Types from "../types/types.js";
export const stackTraceForEventInTrace = /* @__PURE__ */ new Map();
export function clearCacheForTrace(parsedTrace) {
  stackTraceForEventInTrace.delete(parsedTrace);
}
export function get(event, parsedTrace, options) {
  let cacheForTrace = stackTraceForEventInTrace.get(parsedTrace);
  if (!cacheForTrace) {
    cacheForTrace = /* @__PURE__ */ new Map();
    stackTraceForEventInTrace.set(parsedTrace, cacheForTrace);
  }
  const resultFromCache = cacheForTrace.get(event);
  if (resultFromCache) {
    return resultFromCache;
  }
  if (!Types.Events.isProfileCall(event)) {
    return null;
  }
  const result = getForProfileCall(event, parsedTrace, options);
  cacheForTrace.set(event, result);
  return result;
}
function getForProfileCall(event, parsedTrace, options) {
  const entryToNode = parsedTrace.Renderer.entryToNode.size > 0 ? parsedTrace.Renderer.entryToNode : parsedTrace.Samples.entryToNode;
  const topStackTrace = { callFrames: [] };
  let stackTrace = topStackTrace;
  let currentEntry = event;
  let node = entryToNode.get(event);
  const traceCache = stackTraceForEventInTrace.get(parsedTrace) || /* @__PURE__ */ new Map();
  stackTraceForEventInTrace.set(parsedTrace, traceCache);
  while (node) {
    if (!Types.Events.isProfileCall(node.entry)) {
      node = node.parent;
      continue;
    }
    currentEntry = node.entry;
    const stackTraceFromCache = traceCache.get(node.entry);
    if (stackTraceFromCache) {
      stackTrace.callFrames.push(...stackTraceFromCache.callFrames.filter((callFrame) => !isNativeJSFunction(callFrame)));
      stackTrace.parent = stackTraceFromCache.parent;
      stackTrace.description = stackTrace.description || stackTraceFromCache.description;
      break;
    }
    const ignorelisted = options?.isIgnoreListedCallback && options?.isIgnoreListedCallback(currentEntry);
    if (!ignorelisted && !isNativeJSFunction(currentEntry.callFrame)) {
      stackTrace.callFrames.push(currentEntry.callFrame);
    }
    const maybeAsyncParentEvent = parsedTrace.AsyncJSCalls.asyncCallToScheduler.get(currentEntry);
    const maybeAsyncParentNode = maybeAsyncParentEvent && entryToNode.get(maybeAsyncParentEvent.scheduler);
    if (maybeAsyncParentNode) {
      stackTrace.parent = { callFrames: [] };
      stackTrace = stackTrace.parent;
      stackTrace.description = maybeAsyncParentEvent.taskName;
      node = maybeAsyncParentNode;
      continue;
    }
    node = node.parent;
  }
  return topStackTrace;
}
function isNativeJSFunction({ columnNumber, lineNumber, url, scriptId }) {
  return lineNumber === -1 && columnNumber === -1 && url === "" && scriptId === "0";
}
//# sourceMappingURL=StackTraceForEvent.js.map

"use strict";
import * as Common from "../../../core/common/common.js";
import * as Platform from "../../../core/platform/platform.js";
import * as Types from "../types/types.js";
import { SyntheticEventsManager } from "./SyntheticEvents.js";
import { eventTimingsMicroSeconds } from "./Timing.js";
export function stackTraceForEvent(event) {
  if (event.args?.data?.stackTrace) {
    return event.args.data.stackTrace;
  }
  if (event.args?.stackTrace) {
    return event.args.stackTrace;
  }
  if (Types.Events.isUpdateLayoutTree(event)) {
    return event.args.beginData?.stackTrace || null;
  }
  if (Types.Extensions.isSyntheticExtensionEntry(event)) {
    return stackTraceForEvent(event.rawSourceEvent);
  }
  if (Types.Events.isSyntheticUserTiming(event)) {
    return stackTraceForEvent(event.rawSourceEvent);
  }
  return null;
}
export function extractOriginFromTrace(firstNavigationURL) {
  const url = Common.ParsedURL.ParsedURL.fromString(firstNavigationURL);
  if (url) {
    if (url.host.startsWith("www.")) {
      return url.host.slice(4);
    }
    return url.host;
  }
  return null;
}
export function addEventToProcessThread(event, eventsInProcessThread) {
  const { tid, pid } = event;
  let eventsInThread = eventsInProcessThread.get(pid);
  if (!eventsInThread) {
    eventsInThread = /* @__PURE__ */ new Map();
  }
  let events = eventsInThread.get(tid);
  if (!events) {
    events = [];
  }
  events.push(event);
  eventsInThread.set(event.tid, events);
  eventsInProcessThread.set(event.pid, eventsInThread);
}
export function eventTimeComparator(a, b) {
  const aBeginTime = a.ts;
  const bBeginTime = b.ts;
  if (aBeginTime < bBeginTime) {
    return -1;
  }
  if (aBeginTime > bBeginTime) {
    return 1;
  }
  const aDuration = a.dur ?? 0;
  const bDuration = b.dur ?? 0;
  const aEndTime = aBeginTime + aDuration;
  const bEndTime = bBeginTime + bDuration;
  if (aEndTime > bEndTime) {
    return -1;
  }
  if (aEndTime < bEndTime) {
    return 1;
  }
  return 0;
}
export function sortTraceEventsInPlace(events) {
  events.sort(eventTimeComparator);
}
export function mergeEventsInOrder(eventsArray1, eventsArray2) {
  const result = [];
  let i = 0;
  let j = 0;
  while (i < eventsArray1.length && j < eventsArray2.length) {
    const event1 = eventsArray1[i];
    const event2 = eventsArray2[j];
    const compareValue = eventTimeComparator(event1, event2);
    if (compareValue <= 0) {
      result.push(event1);
      i++;
    }
    if (compareValue === 1) {
      result.push(event2);
      j++;
    }
  }
  while (i < eventsArray1.length) {
    result.push(eventsArray1[i++]);
  }
  while (j < eventsArray2.length) {
    result.push(eventsArray2[j++]);
  }
  return result;
}
export function getNavigationForTraceEvent(event, eventFrameId, navigationsByFrameId) {
  const navigations = navigationsByFrameId.get(eventFrameId);
  if (!navigations || eventFrameId === "") {
    return null;
  }
  const eventNavigationIndex = Platform.ArrayUtilities.nearestIndexFromEnd(navigations, (navigation) => navigation.ts <= event.ts);
  if (eventNavigationIndex === null) {
    return null;
  }
  return navigations[eventNavigationIndex];
}
export function extractId(event) {
  return event.id ?? event.id2?.global ?? event.id2?.local;
}
export function activeURLForFrameAtTime(frameId, time, rendererProcessesByFrame) {
  const processData = rendererProcessesByFrame.get(frameId);
  if (!processData) {
    return null;
  }
  for (const processes of processData.values()) {
    for (const processInfo of processes) {
      if (processInfo.window.min > time || processInfo.window.max < time) {
        continue;
      }
      return processInfo.frame.url;
    }
  }
  return null;
}
export function makeProfileCall(node, profileId, sampleIndex, ts, pid, tid) {
  return {
    cat: "",
    name: "ProfileCall",
    nodeId: node.id,
    args: {},
    ph: Types.Events.Phase.COMPLETE,
    pid,
    tid,
    ts,
    dur: Types.Timing.MicroSeconds(0),
    callFrame: node.callFrame,
    sampleIndex,
    profileId
  };
}
export function matchEvents(unpairedEvents) {
  const matchedPairs = /* @__PURE__ */ new Map();
  for (const event of unpairedEvents) {
    const syntheticId = getSyntheticId(event);
    if (syntheticId === void 0) {
      continue;
    }
    const otherEventsWithID = Platform.MapUtilities.getWithDefault(matchedPairs, syntheticId, () => {
      return { begin: null, end: null, instant: [] };
    });
    const isStartEvent = event.ph === Types.Events.Phase.ASYNC_NESTABLE_START;
    const isEndEvent = event.ph === Types.Events.Phase.ASYNC_NESTABLE_END;
    const isInstantEvent = event.ph === Types.Events.Phase.ASYNC_NESTABLE_INSTANT;
    if (isStartEvent) {
      otherEventsWithID.begin = event;
    } else if (isEndEvent) {
      otherEventsWithID.end = event;
    } else if (isInstantEvent) {
      if (!otherEventsWithID.instant) {
        otherEventsWithID.instant = [];
      }
      otherEventsWithID.instant.push(event);
    }
  }
  return matchedPairs;
}
function getSyntheticId(event) {
  const id = extractId(event);
  return id && `${event.cat}:${id}:${event.name}`;
}
export function createSortedSyntheticEvents(matchedPairs, syntheticEventCallback) {
  const syntheticEvents = [];
  for (const [id, eventsTriplet] of matchedPairs.entries()) {
    let eventsArePairable2 = function(data) {
      const instantEventsMatch = data.instantEvents ? data.instantEvents.some((e) => id === getSyntheticId(e)) : false;
      const endEventMatch = data.endEvent ? id === getSyntheticId(data.endEvent) : false;
      return Boolean(id) && (instantEventsMatch || endEventMatch);
    };
    var eventsArePairable = eventsArePairable2;
    const beginEvent = eventsTriplet.begin;
    const endEvent = eventsTriplet.end;
    const instantEvents = eventsTriplet.instant;
    if (!beginEvent || !(endEvent || instantEvents)) {
      continue;
    }
    const triplet = { beginEvent, endEvent, instantEvents };
    if (!eventsArePairable2(triplet)) {
      continue;
    }
    const targetEvent = endEvent || beginEvent;
    const event = SyntheticEventsManager.registerSyntheticEvent({
      rawSourceEvent: beginEvent,
      cat: targetEvent.cat,
      ph: targetEvent.ph,
      pid: targetEvent.pid,
      tid: targetEvent.tid,
      id,
      // Both events have the same name, so it doesn't matter which we pick to
      // use as the description
      name: beginEvent.name,
      dur: Types.Timing.MicroSeconds(targetEvent.ts - beginEvent.ts),
      ts: beginEvent.ts,
      args: {
        data: triplet
      }
    });
    if (event.dur < 0) {
      continue;
    }
    syntheticEventCallback?.(event);
    syntheticEvents.push(event);
  }
  return syntheticEvents.sort((a, b) => a.ts - b.ts);
}
export function createMatchedSortedSyntheticEvents(unpairedAsyncEvents, syntheticEventCallback) {
  const matchedPairs = matchEvents(unpairedAsyncEvents);
  const syntheticEvents = createSortedSyntheticEvents(matchedPairs, syntheticEventCallback);
  return syntheticEvents;
}
export function getZeroIndexedLineAndColumnForEvent(event) {
  const numbers = getRawLineAndColumnNumbersForEvent(event);
  const { lineNumber, columnNumber } = numbers;
  switch (event.name) {
    // All these events have line/column numbers which are 1 indexed; so we
    // subtract to make them 0 indexed.
    case Types.Events.Name.FUNCTION_CALL:
    case Types.Events.Name.EVALUATE_SCRIPT:
    case Types.Events.Name.COMPILE:
    case Types.Events.Name.CACHE_SCRIPT: {
      return {
        lineNumber: typeof lineNumber === "number" ? lineNumber - 1 : void 0,
        columnNumber: typeof columnNumber === "number" ? columnNumber - 1 : void 0
      };
    }
    default: {
      return numbers;
    }
  }
}
export function getZeroIndexedStackTraceForEvent(event) {
  const stack = stackTraceForEvent(event);
  if (!stack) {
    return null;
  }
  return stack.map((callFrame) => {
    switch (event.name) {
      case Types.Events.Name.SCHEDULE_STYLE_RECALCULATION:
      case Types.Events.Name.INVALIDATE_LAYOUT:
      case Types.Events.Name.UPDATE_LAYOUT_TREE: {
        return makeZeroBasedCallFrame(callFrame);
      }
      default: {
        if (Types.Events.isUserTiming(event) || Types.Extensions.isSyntheticExtensionEntry(event)) {
          return makeZeroBasedCallFrame(callFrame);
        }
      }
    }
    return callFrame;
  });
}
export function makeZeroBasedCallFrame(callFrame) {
  const normalizedCallFrame = { ...callFrame };
  normalizedCallFrame.lineNumber = callFrame.lineNumber && callFrame.lineNumber - 1;
  normalizedCallFrame.columnNumber = callFrame.columnNumber && callFrame.columnNumber - 1;
  return normalizedCallFrame;
}
function getRawLineAndColumnNumbersForEvent(event) {
  if (!event.args?.data) {
    return {
      lineNumber: void 0,
      columnNumber: void 0
    };
  }
  let lineNumber = void 0;
  let columnNumber = void 0;
  if ("lineNumber" in event.args.data && typeof event.args.data.lineNumber === "number") {
    lineNumber = event.args.data.lineNumber;
  }
  if ("columnNumber" in event.args.data && typeof event.args.data.columnNumber === "number") {
    columnNumber = event.args.data.columnNumber;
  }
  return { lineNumber, columnNumber };
}
export function frameIDForEvent(event) {
  if (event.args && "beginData" in event.args && typeof event.args.beginData === "object" && event.args.beginData !== null && "frame" in event.args.beginData && typeof event.args.beginData.frame === "string") {
    return event.args.beginData.frame;
  }
  if (event.args?.data?.frame) {
    return event.args.data.frame;
  }
  return null;
}
const DevToolsTimelineEventCategory = "disabled-by-default-devtools.timeline";
export function isTopLevelEvent(event) {
  if (event.name === "JSRoot" && event.cat === "toplevel") {
    return true;
  }
  return event.cat.includes(DevToolsTimelineEventCategory) && event.name === Types.Events.Name.RUN_TASK;
}
function topLevelEventIndexEndingAfter(events, time) {
  let index = Platform.ArrayUtilities.upperBound(events, time, (time2, event) => time2 - event.ts) - 1;
  while (index > 0 && !isTopLevelEvent(events[index])) {
    index--;
  }
  return Math.max(index, 0);
}
export function findUpdateLayoutTreeEvents(events, startTime, endTime) {
  const foundEvents = [];
  const startEventIndex = topLevelEventIndexEndingAfter(events, startTime);
  for (let i = startEventIndex; i < events.length; i++) {
    const event = events[i];
    if (!Types.Events.isUpdateLayoutTree(event)) {
      continue;
    }
    if (event.ts >= (endTime || Infinity)) {
      continue;
    }
    foundEvents.push(event);
  }
  return foundEvents;
}
export function findNextEventAfterTimestamp(candidates, ts) {
  const index = Platform.ArrayUtilities.nearestIndexFromBeginning(candidates, (candidate) => ts < candidate.ts);
  return index === null ? null : candidates[index];
}
export function findPreviousEventBeforeTimestamp(candidates, ts) {
  const index = Platform.ArrayUtilities.nearestIndexFromEnd(candidates, (candidate) => candidate.ts < ts);
  return index === null ? null : candidates[index];
}
export function forEachEvent(events, config) {
  const globalStartTime = config.startTime ?? Types.Timing.MicroSeconds(0);
  const globalEndTime = config.endTime || Types.Timing.MicroSeconds(Infinity);
  const ignoreAsyncEvents = config.ignoreAsyncEvents === false ? false : true;
  const stack = [];
  const startEventIndex = topLevelEventIndexEndingAfter(events, globalStartTime);
  for (let i = startEventIndex; i < events.length; i++) {
    const currentEvent = events[i];
    const currentEventTimings = eventTimingsMicroSeconds(currentEvent);
    if (currentEventTimings.endTime < globalStartTime) {
      continue;
    }
    if (currentEventTimings.startTime > globalEndTime) {
      break;
    }
    const isIgnoredAsyncEvent = ignoreAsyncEvents && Types.Events.isPhaseAsync(currentEvent.ph);
    if (isIgnoredAsyncEvent || Types.Events.isFlowPhase(currentEvent.ph)) {
      continue;
    }
    let lastEventOnStack = stack.at(-1);
    let lastEventEndTime = lastEventOnStack ? eventTimingsMicroSeconds(lastEventOnStack).endTime : null;
    while (lastEventOnStack && lastEventEndTime && lastEventEndTime <= currentEventTimings.startTime) {
      stack.pop();
      config.onEndEvent(lastEventOnStack);
      lastEventOnStack = stack.at(-1);
      lastEventEndTime = lastEventOnStack ? eventTimingsMicroSeconds(lastEventOnStack).endTime : null;
    }
    if (config.eventFilter && !config.eventFilter(currentEvent)) {
      continue;
    }
    if (currentEventTimings.duration) {
      config.onStartEvent(currentEvent);
      stack.push(currentEvent);
    } else if (config.onInstantEvent) {
      config.onInstantEvent(currentEvent);
    }
  }
  while (stack.length) {
    const last = stack.pop();
    if (last) {
      config.onEndEvent(last);
    }
  }
}
const parsedCategories = /* @__PURE__ */ new Map();
export function eventHasCategory(event, category) {
  let parsedCategoriesForEvent = parsedCategories.get(event.cat);
  if (!parsedCategoriesForEvent) {
    parsedCategoriesForEvent = new Set(event.cat.split(",") || []);
  }
  return parsedCategoriesForEvent.has(category);
}
export function nodeIdForInvalidationEvent(event) {
  return event.args.data.nodeId ?? null;
}
//# sourceMappingURL=Trace.js.map

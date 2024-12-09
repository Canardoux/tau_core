"use strict";
import * as Helpers from "../helpers/helpers.js";
import * as Types from "../types/types.js";
let syntheticEvents = [];
const performanceMeasureEvents = [];
const performanceMarkEvents = [];
const consoleTimings = [];
const timestampEvents = [];
export function reset() {
  syntheticEvents.length = 0;
  performanceMeasureEvents.length = 0;
  performanceMarkEvents.length = 0;
  consoleTimings.length = 0;
  timestampEvents.length = 0;
}
const resourceTimingNames = [
  "workerStart",
  "redirectStart",
  "redirectEnd",
  "fetchStart",
  "domainLookupStart",
  "domainLookupEnd",
  "connectStart",
  "connectEnd",
  "secureConnectionStart",
  "requestStart",
  "responseStart",
  "responseEnd"
];
const navTimingNames = [
  "navigationStart",
  "unloadEventStart",
  "unloadEventEnd",
  "redirectStart",
  "redirectEnd",
  "fetchStart",
  "commitNavigationEnd",
  "domainLookupStart",
  "domainLookupEnd",
  "connectStart",
  "connectEnd",
  "secureConnectionStart",
  "requestStart",
  "responseStart",
  "responseEnd",
  "domLoading",
  "domInteractive",
  "domContentLoadedEventStart",
  "domContentLoadedEventEnd",
  "domComplete",
  "loadEventStart",
  "loadEventEnd"
];
const ignoredNames = [...resourceTimingNames, ...navTimingNames];
function userTimingComparator(a, b, originalArray) {
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
  return originalArray.indexOf(b) - originalArray.indexOf(a);
}
export function handleEvent(event) {
  if (ignoredNames.includes(event.name)) {
    return;
  }
  if (Types.Events.isPerformanceMeasure(event)) {
    performanceMeasureEvents.push(event);
    return;
  }
  if (Types.Events.isPerformanceMark(event)) {
    performanceMarkEvents.push(event);
  }
  if (Types.Events.isConsoleTime(event)) {
    consoleTimings.push(event);
  }
  if (Types.Events.isTimeStamp(event)) {
    timestampEvents.push(event);
  }
}
export async function finalize() {
  const asyncEvents = [...performanceMeasureEvents, ...consoleTimings];
  syntheticEvents = Helpers.Trace.createMatchedSortedSyntheticEvents(asyncEvents);
  syntheticEvents = syntheticEvents.sort((a, b) => userTimingComparator(a, b, [...syntheticEvents]));
}
export function data() {
  return {
    performanceMeasures: syntheticEvents.filter((e) => e.cat === "blink.user_timing"),
    consoleTimings: syntheticEvents.filter((e) => e.cat === "blink.console"),
    // TODO(crbug/41484172): UserTimingsHandler.test.ts fails if this is not copied.
    performanceMarks: [...performanceMarkEvents],
    timestampEvents: [...timestampEvents]
  };
}
//# sourceMappingURL=UserTimingsHandler.js.map

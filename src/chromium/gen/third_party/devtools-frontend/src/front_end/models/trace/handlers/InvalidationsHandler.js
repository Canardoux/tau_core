"use strict";
import * as Types from "../types/types.js";
const invalidationsForEvent = /* @__PURE__ */ new Map();
const invalidationCountForEvent = /* @__PURE__ */ new Map();
let lastRecalcStyleEvent = null;
let hasPainted = false;
const allInvalidationTrackingEvents = [];
export function reset() {
  invalidationsForEvent.clear();
  lastRecalcStyleEvent = null;
  allInvalidationTrackingEvents.length = 0;
  hasPainted = false;
  maxInvalidationsPerEvent = null;
}
let maxInvalidationsPerEvent = null;
export function handleUserConfig(userConfig) {
  maxInvalidationsPerEvent = userConfig.maxInvalidationEventsPerEvent;
}
function addInvalidationToEvent(event, invalidation) {
  const existingInvalidations = invalidationsForEvent.get(event) || [];
  existingInvalidations.push(invalidation);
  if (maxInvalidationsPerEvent !== null && existingInvalidations.length > maxInvalidationsPerEvent) {
    existingInvalidations.shift();
  }
  invalidationsForEvent.set(event, existingInvalidations);
  const count = invalidationCountForEvent.get(event) ?? 0;
  invalidationCountForEvent.set(event, count + 1);
}
export function handleEvent(event) {
  if (maxInvalidationsPerEvent === 0) {
    return;
  }
  if (Types.Events.isUpdateLayoutTree(event)) {
    lastRecalcStyleEvent = event;
    for (const invalidation of allInvalidationTrackingEvents) {
      if (Types.Events.isLayoutInvalidationTracking(invalidation)) {
        continue;
      }
      const recalcFrameId = lastRecalcStyleEvent.args.beginData?.frame;
      if (recalcFrameId && invalidation.args.data.frame === recalcFrameId) {
        addInvalidationToEvent(event, invalidation);
      }
    }
    return;
  }
  if (Types.Events.isInvalidationTracking(event)) {
    if (hasPainted) {
      allInvalidationTrackingEvents.length = 0;
      lastRecalcStyleEvent = null;
      hasPainted = false;
    }
    if (lastRecalcStyleEvent && (Types.Events.isScheduleStyleInvalidationTracking(event) || Types.Events.isStyleRecalcInvalidationTracking(event) || Types.Events.isStyleInvalidatorInvalidationTracking(event))) {
      const recalcEndTime = lastRecalcStyleEvent.ts + (lastRecalcStyleEvent.dur || 0);
      if (event.ts >= lastRecalcStyleEvent.ts && event.ts <= recalcEndTime && lastRecalcStyleEvent.args.beginData?.frame === event.args.data.frame) {
        addInvalidationToEvent(lastRecalcStyleEvent, event);
      }
    }
    allInvalidationTrackingEvents.push(event);
    return;
  }
  if (Types.Events.isPaint(event)) {
    hasPainted = true;
    return;
  }
  if (Types.Events.isLayout(event)) {
    const layoutFrame = event.args.beginData.frame;
    for (const invalidation of allInvalidationTrackingEvents) {
      if (!Types.Events.isLayoutInvalidationTracking(invalidation)) {
        continue;
      }
      if (invalidation.args.data.frame === layoutFrame) {
        addInvalidationToEvent(event, invalidation);
      }
    }
  }
}
export async function finalize() {
}
export function data() {
  return {
    invalidationsForEvent,
    invalidationCountForEvent
  };
}
//# sourceMappingURL=InvalidationsHandler.js.map

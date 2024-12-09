"use strict";
import * as Helpers from "../helpers/helpers.js";
import * as Types from "../types/types.js";
import { data as AsyncJSCallsHandlerData } from "./AsyncJSCallsHandler.js";
import { data as flowsHandlerData } from "./FlowsHandler.js";
const lastScheduleStyleRecalcByFrame = /* @__PURE__ */ new Map();
const lastInvalidationEventForFrame = /* @__PURE__ */ new Map();
const lastUpdateLayoutTreeByFrame = /* @__PURE__ */ new Map();
const eventToInitiatorMap = /* @__PURE__ */ new Map();
const initiatorToEventsMap = /* @__PURE__ */ new Map();
const webSocketCreateEventsById = /* @__PURE__ */ new Map();
const schedulePostTaskCallbackEventsById = /* @__PURE__ */ new Map();
export function reset() {
  lastScheduleStyleRecalcByFrame.clear();
  lastInvalidationEventForFrame.clear();
  lastUpdateLayoutTreeByFrame.clear();
  eventToInitiatorMap.clear();
  initiatorToEventsMap.clear();
  webSocketCreateEventsById.clear();
  schedulePostTaskCallbackEventsById.clear();
}
function storeInitiator(data2) {
  eventToInitiatorMap.set(data2.event, data2.initiator);
  const eventsForInitiator = initiatorToEventsMap.get(data2.initiator) || [];
  eventsForInitiator.push(data2.event);
  initiatorToEventsMap.set(data2.initiator, eventsForInitiator);
}
export function handleEvent(event) {
  if (Types.Events.isScheduleStyleRecalculation(event)) {
    lastScheduleStyleRecalcByFrame.set(event.args.data.frame, event);
  } else if (Types.Events.isUpdateLayoutTree(event)) {
    if (event.args.beginData) {
      lastUpdateLayoutTreeByFrame.set(event.args.beginData.frame, event);
      const scheduledStyleForFrame = lastScheduleStyleRecalcByFrame.get(event.args.beginData.frame);
      if (scheduledStyleForFrame) {
        storeInitiator({
          event,
          initiator: scheduledStyleForFrame
        });
      }
    }
  } else if (Types.Events.isInvalidateLayout(event)) {
    let invalidationInitiator = event;
    if (!lastInvalidationEventForFrame.has(event.args.data.frame)) {
      const lastUpdateLayoutTreeForFrame = lastUpdateLayoutTreeByFrame.get(event.args.data.frame);
      if (lastUpdateLayoutTreeForFrame) {
        const { endTime } = Helpers.Timing.eventTimingsMicroSeconds(lastUpdateLayoutTreeForFrame);
        const initiatorOfUpdateLayout = eventToInitiatorMap.get(lastUpdateLayoutTreeForFrame);
        if (initiatorOfUpdateLayout && endTime && endTime > event.ts) {
          invalidationInitiator = initiatorOfUpdateLayout;
        }
      }
    }
    lastInvalidationEventForFrame.set(event.args.data.frame, invalidationInitiator);
  } else if (Types.Events.isLayout(event)) {
    const lastInvalidation = lastInvalidationEventForFrame.get(event.args.beginData.frame);
    if (lastInvalidation) {
      storeInitiator({
        event,
        initiator: lastInvalidation
      });
    }
    lastInvalidationEventForFrame.delete(event.args.beginData.frame);
  } else if (Types.Events.isWebSocketCreate(event)) {
    webSocketCreateEventsById.set(event.args.data.identifier, event);
  } else if (Types.Events.isWebSocketInfo(event) || Types.Events.isWebSocketTransfer(event)) {
    const matchingCreateEvent = webSocketCreateEventsById.get(event.args.data.identifier);
    if (matchingCreateEvent) {
      storeInitiator({
        event,
        initiator: matchingCreateEvent
      });
    }
  } else if (Types.Events.isSchedulePostTaskCallback(event)) {
    schedulePostTaskCallbackEventsById.set(event.args.data.taskId, event);
  } else if (Types.Events.isRunPostTaskCallback(event) || Types.Events.isAbortPostTaskCallback(event)) {
    const matchingSchedule = schedulePostTaskCallbackEventsById.get(event.args.data.taskId);
    if (matchingSchedule) {
      storeInitiator({ event, initiator: matchingSchedule });
    }
  }
}
function createRelationshipsFromFlows() {
  const flows = flowsHandlerData().flows;
  for (let i = 0; i < flows.length; i++) {
    const flow = flows[i];
    for (let j = 0; j < flow.length - 1; j++) {
      storeInitiator({ event: flow[j + 1], initiator: flow[j] });
    }
  }
}
function createRelationshipsFromAsyncJSCalls() {
  const asyncCallPairs = AsyncJSCallsHandlerData().schedulerToRunEntryPoints.entries();
  for (const [asyncCaller, asyncCallees] of asyncCallPairs) {
    for (const asyncCallee of asyncCallees) {
      storeInitiator({ event: asyncCallee, initiator: asyncCaller });
    }
  }
}
export async function finalize() {
  createRelationshipsFromFlows();
  createRelationshipsFromAsyncJSCalls();
}
export function data() {
  return {
    eventToInitiator: eventToInitiatorMap,
    initiatorToEvents: initiatorToEventsMap
  };
}
export function deps() {
  return ["Flows", "AsyncJSCalls"];
}
//# sourceMappingURL=InitiatorsHandler.js.map

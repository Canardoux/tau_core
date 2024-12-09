"use strict";
import * as Platform from "../../../core/platform/platform.js";
import * as Helpers from "../helpers/helpers.js";
import * as Types from "../types/types.js";
import { data as userInteractionsHandlerData } from "./UserInteractionsHandler.js";
const warningsPerEvent = /* @__PURE__ */ new Map();
const eventsPerWarning = /* @__PURE__ */ new Map();
const allEventsStack = [];
const jsInvokeStack = [];
const taskReflowEvents = [];
export const FORCED_REFLOW_THRESHOLD = Helpers.Timing.millisecondsToMicroseconds(Types.Timing.MilliSeconds(30));
export const LONG_MAIN_THREAD_TASK_THRESHOLD = Helpers.Timing.millisecondsToMicroseconds(Types.Timing.MilliSeconds(50));
export function reset() {
  warningsPerEvent.clear();
  eventsPerWarning.clear();
  allEventsStack.length = 0;
  jsInvokeStack.length = 0;
  taskReflowEvents.length = 0;
}
function storeWarning(event, warning) {
  const existingWarnings = Platform.MapUtilities.getWithDefault(warningsPerEvent, event, () => []);
  existingWarnings.push(warning);
  warningsPerEvent.set(event, existingWarnings);
  const existingEvents = Platform.MapUtilities.getWithDefault(eventsPerWarning, warning, () => []);
  existingEvents.push(event);
  eventsPerWarning.set(warning, existingEvents);
}
export function handleEvent(event) {
  processForcedReflowWarning(event);
  if (event.name === Types.Events.Name.RUN_TASK) {
    const { duration } = Helpers.Timing.eventTimingsMicroSeconds(event);
    if (duration > LONG_MAIN_THREAD_TASK_THRESHOLD) {
      storeWarning(event, "LONG_TASK");
    }
    return;
  }
  if (Types.Events.isFireIdleCallback(event)) {
    const { duration } = Helpers.Timing.eventTimingsMilliSeconds(event);
    if (duration > event.args.data.allottedMilliseconds) {
      storeWarning(event, "IDLE_CALLBACK_OVER_TIME");
    }
    return;
  }
}
function processForcedReflowWarning(event) {
  accomodateEventInStack(event, allEventsStack);
  accomodateEventInStack(
    event,
    jsInvokeStack,
    /* pushEventToStack */
    Types.Events.isJSInvocationEvent(event)
  );
  if (jsInvokeStack.length) {
    if (event.name === Types.Events.Name.LAYOUT || event.name === Types.Events.Name.UPDATE_LAYOUT_TREE) {
      taskReflowEvents.push(event);
      return;
    }
  }
  if (allEventsStack.length === 1) {
    const totalTime = taskReflowEvents.reduce((time, event2) => time + (event2.dur || 0), 0);
    if (totalTime >= FORCED_REFLOW_THRESHOLD) {
      taskReflowEvents.forEach((reflowEvent) => storeWarning(reflowEvent, "FORCED_REFLOW"));
    }
    taskReflowEvents.length = 0;
  }
}
function accomodateEventInStack(event, stack, pushEventToStack = true) {
  let nextItem = stack.at(-1);
  while (nextItem && event.ts > nextItem.ts + (nextItem.dur || 0)) {
    stack.pop();
    nextItem = stack.at(-1);
  }
  if (!pushEventToStack) {
    return;
  }
  stack.push(event);
}
export function deps() {
  return ["UserInteractions"];
}
export async function finalize() {
  const longInteractions = userInteractionsHandlerData().interactionsOverThreshold;
  for (const interaction of longInteractions) {
    storeWarning(interaction, "LONG_INTERACTION");
  }
}
export function data() {
  return {
    perEvent: warningsPerEvent,
    perWarning: eventsPerWarning
  };
}
//# sourceMappingURL=WarningsHandler.js.map

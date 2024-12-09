"use strict";
import * as Helpers from "../helpers/helpers.js";
import * as Types from "../types/types.js";
import { data as metaHandlerData } from "./MetaHandler.js";
import { ScoreClassification } from "./PageLoadMetricsHandler.js";
const allEvents = [];
const beginCommitCompositorFrameEvents = [];
const parseMetaViewportEvents = [];
export const LONG_INTERACTION_THRESHOLD = Helpers.Timing.millisecondsToMicroseconds(Types.Timing.MilliSeconds(200));
const INP_GOOD_TIMING = LONG_INTERACTION_THRESHOLD;
const INP_MEDIUM_TIMING = Helpers.Timing.millisecondsToMicroseconds(Types.Timing.MilliSeconds(500));
let longestInteractionEvent = null;
const interactionEvents = [];
const interactionEventsWithNoNesting = [];
const eventTimingEndEventsById = /* @__PURE__ */ new Map();
const eventTimingStartEventsForInteractions = [];
export function reset() {
  allEvents.length = 0;
  beginCommitCompositorFrameEvents.length = 0;
  parseMetaViewportEvents.length = 0;
  interactionEvents.length = 0;
  eventTimingStartEventsForInteractions.length = 0;
  eventTimingEndEventsById.clear();
  interactionEventsWithNoNesting.length = 0;
  longestInteractionEvent = null;
}
export function handleEvent(event) {
  if (Types.Events.isBeginCommitCompositorFrame(event)) {
    beginCommitCompositorFrameEvents.push(event);
    return;
  }
  if (Types.Events.isParseMetaViewport(event)) {
    parseMetaViewportEvents.push(event);
    return;
  }
  if (!Types.Events.isEventTiming(event)) {
    return;
  }
  if (Types.Events.isEventTimingEnd(event)) {
    eventTimingEndEventsById.set(event.id, event);
  }
  allEvents.push(event);
  if (!event.args.data || !Types.Events.isEventTimingStart(event)) {
    return;
  }
  const { duration, interactionId } = event.args.data;
  if (duration < 1 || interactionId === void 0 || interactionId === 0) {
    return;
  }
  eventTimingStartEventsForInteractions.push(event);
}
const pointerEventTypes = /* @__PURE__ */ new Set([
  "pointerdown",
  "touchstart",
  "pointerup",
  "touchend",
  "mousedown",
  "mouseup",
  "click"
]);
const keyboardEventTypes = /* @__PURE__ */ new Set([
  "keydown",
  "keypress",
  "keyup"
]);
export function categoryOfInteraction(interaction) {
  if (pointerEventTypes.has(interaction.type)) {
    return "POINTER";
  }
  if (keyboardEventTypes.has(interaction.type)) {
    return "KEYBOARD";
  }
  return "OTHER";
}
export function removeNestedInteractions(interactions) {
  const earliestEventForEndTimePerCategory = {
    POINTER: /* @__PURE__ */ new Map(),
    KEYBOARD: /* @__PURE__ */ new Map(),
    OTHER: /* @__PURE__ */ new Map()
  };
  function storeEventIfEarliestForCategoryAndEndTime(interaction) {
    const category = categoryOfInteraction(interaction);
    const earliestEventForEndTime = earliestEventForEndTimePerCategory[category];
    const endTime = Types.Timing.MicroSeconds(interaction.ts + interaction.dur);
    const earliestCurrentEvent = earliestEventForEndTime.get(endTime);
    if (!earliestCurrentEvent) {
      earliestEventForEndTime.set(endTime, interaction);
      return;
    }
    if (interaction.ts < earliestCurrentEvent.ts) {
      earliestEventForEndTime.set(endTime, interaction);
    } else if (interaction.ts === earliestCurrentEvent.ts && interaction.interactionId === earliestCurrentEvent.interactionId) {
      const currentProcessingDuration = earliestCurrentEvent.processingEnd - earliestCurrentEvent.processingStart;
      const newProcessingDuration = interaction.processingEnd - interaction.processingStart;
      if (newProcessingDuration > currentProcessingDuration) {
        earliestEventForEndTime.set(endTime, interaction);
      }
    }
    if (interaction.processingStart < earliestCurrentEvent.processingStart) {
      earliestCurrentEvent.processingStart = interaction.processingStart;
      writeSyntheticTimespans(earliestCurrentEvent);
    }
    if (interaction.processingEnd > earliestCurrentEvent.processingEnd) {
      earliestCurrentEvent.processingEnd = interaction.processingEnd;
      writeSyntheticTimespans(earliestCurrentEvent);
    }
  }
  for (const interaction of interactions) {
    storeEventIfEarliestForCategoryAndEndTime(interaction);
  }
  const keptEvents = Object.values(earliestEventForEndTimePerCategory).flatMap((eventsByEndTime) => Array.from(eventsByEndTime.values()));
  keptEvents.sort((eventA, eventB) => {
    return eventA.ts - eventB.ts;
  });
  return keptEvents;
}
function writeSyntheticTimespans(event) {
  const startEvent = event.args.data.beginEvent;
  const endEvent = event.args.data.endEvent;
  event.inputDelay = Types.Timing.MicroSeconds(event.processingStart - startEvent.ts);
  event.mainThreadHandling = Types.Timing.MicroSeconds(event.processingEnd - event.processingStart);
  event.presentationDelay = Types.Timing.MicroSeconds(endEvent.ts - event.processingEnd);
}
export async function finalize() {
  const { navigationsByFrameId } = metaHandlerData();
  for (const interactionStartEvent of eventTimingStartEventsForInteractions) {
    const endEvent = eventTimingEndEventsById.get(interactionStartEvent.id);
    if (!endEvent) {
      continue;
    }
    const { type, interactionId, timeStamp, processingStart, processingEnd } = interactionStartEvent.args.data;
    if (!type || !interactionId || !timeStamp || !processingStart || !processingEnd) {
      continue;
    }
    const processingStartRelativeToTraceTime = Types.Timing.MicroSeconds(
      Helpers.Timing.millisecondsToMicroseconds(processingStart) - Helpers.Timing.millisecondsToMicroseconds(timeStamp) + interactionStartEvent.ts
    );
    const processingEndRelativeToTraceTime = Types.Timing.MicroSeconds(
      Helpers.Timing.millisecondsToMicroseconds(processingEnd) - Helpers.Timing.millisecondsToMicroseconds(timeStamp) + interactionStartEvent.ts
    );
    const frameId = interactionStartEvent.args.frame ?? interactionStartEvent.args.data.frame ?? "";
    const navigation = Helpers.Trace.getNavigationForTraceEvent(interactionStartEvent, frameId, navigationsByFrameId);
    const navigationId = navigation?.args.data?.navigationId;
    const interactionEvent = Helpers.SyntheticEvents.SyntheticEventsManager.registerSyntheticEvent({
      // Use the start event to define the common fields.
      rawSourceEvent: interactionStartEvent,
      cat: interactionStartEvent.cat,
      name: interactionStartEvent.name,
      pid: interactionStartEvent.pid,
      tid: interactionStartEvent.tid,
      ph: interactionStartEvent.ph,
      processingStart: processingStartRelativeToTraceTime,
      processingEnd: processingEndRelativeToTraceTime,
      // These will be set in writeSyntheticTimespans()
      inputDelay: Types.Timing.MicroSeconds(-1),
      mainThreadHandling: Types.Timing.MicroSeconds(-1),
      presentationDelay: Types.Timing.MicroSeconds(-1),
      args: {
        data: {
          beginEvent: interactionStartEvent,
          endEvent,
          frame: frameId,
          navigationId
        }
      },
      ts: interactionStartEvent.ts,
      dur: Types.Timing.MicroSeconds(endEvent.ts - interactionStartEvent.ts),
      type: interactionStartEvent.args.data.type,
      interactionId: interactionStartEvent.args.data.interactionId
    });
    writeSyntheticTimespans(interactionEvent);
    interactionEvents.push(interactionEvent);
  }
  interactionEventsWithNoNesting.push(...removeNestedInteractions(interactionEvents));
  for (const interactionEvent of interactionEventsWithNoNesting) {
    if (!longestInteractionEvent || longestInteractionEvent.dur < interactionEvent.dur) {
      longestInteractionEvent = interactionEvent;
    }
  }
}
export function data() {
  return {
    allEvents,
    beginCommitCompositorFrameEvents,
    parseMetaViewportEvents,
    interactionEvents,
    interactionEventsWithNoNesting,
    longestInteractionEvent,
    interactionsOverThreshold: new Set(interactionEvents.filter((event) => {
      return event.dur > LONG_INTERACTION_THRESHOLD;
    }))
  };
}
export function deps() {
  return ["Meta"];
}
export function scoreClassificationForInteractionToNextPaint(timing) {
  if (timing <= INP_GOOD_TIMING) {
    return ScoreClassification.GOOD;
  }
  if (timing <= INP_MEDIUM_TIMING) {
    return ScoreClassification.OK;
  }
  return ScoreClassification.BAD;
}
//# sourceMappingURL=UserInteractionsHandler.js.map

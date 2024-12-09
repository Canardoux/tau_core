"use strict";
import * as Helpers from "../helpers/helpers.js";
import * as Types from "../types/types.js";
function threadKey(data2) {
  return `${data2.pid}-${data2.tid}`;
}
const animationFrameStarts = /* @__PURE__ */ new Map();
const animationFrameEnds = /* @__PURE__ */ new Map();
const animationFramePresentations = /* @__PURE__ */ new Map();
const animationFrames = [];
const presentationForFrame = /* @__PURE__ */ new Map();
export function reset() {
  animationFrameStarts.clear();
  animationFrameEnds.clear();
  animationFrames.length = 0;
  presentationForFrame.clear();
  animationFramePresentations.clear();
}
export function handleEvent(event) {
  if (Types.Events.isAnimationFrameAsyncStart(event)) {
    const key = threadKey(event);
    const existing = animationFrameStarts.get(key) ?? [];
    existing.push(event);
    animationFrameStarts.set(key, existing);
  } else if (Types.Events.isAnimationFrameAsyncEnd(event)) {
    const key = threadKey(event);
    const existing = animationFrameEnds.get(key) ?? [];
    existing.push(event);
    animationFrameEnds.set(key, existing);
  } else if (Types.Events.isAnimationFramePresentation(event) && event.args?.id) {
    animationFramePresentations.set(event.args.id, event);
  }
}
export async function finalize() {
  for (const [key, startEvents] of animationFrameStarts.entries()) {
    const endEvents = animationFrameEnds.get(key);
    if (!endEvents) {
      continue;
    }
    Helpers.Trace.sortTraceEventsInPlace(startEvents);
    Helpers.Trace.sortTraceEventsInPlace(endEvents);
    for (let i = 0; i < startEvents.length; i++) {
      const endEvent = endEvents.at(i);
      if (!endEvent) {
        break;
      }
      const startEvent = startEvents[i];
      const syntheticEvent = Helpers.SyntheticEvents.SyntheticEventsManager.registerSyntheticEvent({
        rawSourceEvent: startEvent,
        ...startEvent,
        dur: Types.Timing.MicroSeconds(endEvent.ts - startEvent.ts),
        args: {
          data: {
            beginEvent: startEvent,
            endEvent
          }
        }
      });
      animationFrames.push(syntheticEvent);
      const id = startEvent.args?.id;
      if (id) {
        const presentationEvent = animationFramePresentations.get(id);
        if (presentationEvent) {
          presentationForFrame.set(syntheticEvent, presentationEvent);
        }
      }
    }
  }
}
export function data() {
  return {
    animationFrames,
    presentationForFrame
  };
}
export function deps() {
  return ["Meta"];
}
//# sourceMappingURL=AnimationFramesHandler.js.map

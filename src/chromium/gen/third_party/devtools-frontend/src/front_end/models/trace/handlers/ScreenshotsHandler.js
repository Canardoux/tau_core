"use strict";
import * as Helpers from "../helpers/helpers.js";
import * as Types from "../types/types.js";
const unpairedAsyncEvents = [];
const snapshotEvents = [];
const syntheticScreenshots = [];
let frameSequenceToTs = {};
export function reset() {
  unpairedAsyncEvents.length = 0;
  snapshotEvents.length = 0;
  syntheticScreenshots.length = 0;
  frameSequenceToTs = {};
}
export function handleEvent(event) {
  if (Types.Events.isScreenshot(event)) {
    snapshotEvents.push(event);
  } else if (Types.Events.isPipelineReporter(event)) {
    unpairedAsyncEvents.push(event);
  }
}
export async function finalize() {
  const pipelineReporterEvents = Helpers.Trace.createMatchedSortedSyntheticEvents(unpairedAsyncEvents);
  frameSequenceToTs = Object.fromEntries(pipelineReporterEvents.map((evt) => {
    const frameSequenceId = evt.args.data.beginEvent.args.chrome_frame_reporter.frame_sequence;
    const presentationTs = Types.Timing.MicroSeconds(evt.ts + evt.dur);
    return [frameSequenceId, presentationTs];
  }));
  for (const snapshotEvent of snapshotEvents) {
    const { cat, name, ph, pid, tid } = snapshotEvent;
    const syntheticEvent = Helpers.SyntheticEvents.SyntheticEventsManager.registerSyntheticEvent({
      rawSourceEvent: snapshotEvent,
      cat,
      name,
      ph,
      pid,
      tid,
      // TODO(paulirish, crbug.com/41363012): investigate why getPresentationTimestamp(snapshotEvent) seems less accurate. Resolve screenshot timing innaccuracy.
      // `getPresentationTimestamp(snapshotEvent) - snapshotEvent.ts` is how many microsec the screenshot should be adjusted to the right/later
      ts: snapshotEvent.ts,
      args: {
        dataUri: `data:image/jpg;base64,${snapshotEvent.args.snapshot}`
      }
    });
    syntheticScreenshots.push(syntheticEvent);
  }
}
function getPresentationTimestamp(screenshotEvent) {
  const frameSequence = parseInt(screenshotEvent.id, 16);
  if (frameSequence === 1) {
    return screenshotEvent.ts;
  }
  const updatedTs = frameSequenceToTs[frameSequence];
  return updatedTs ?? screenshotEvent.ts;
}
export function data() {
  return { all: syntheticScreenshots };
}
export function deps() {
  return ["Meta"];
}
//# sourceMappingURL=ScreenshotsHandler.js.map

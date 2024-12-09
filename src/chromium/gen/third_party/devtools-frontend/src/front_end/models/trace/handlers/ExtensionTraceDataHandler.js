"use strict";
import * as Helpers from "../helpers/helpers.js";
import * as Types from "../types/types.js";
import { data as userTimingsData } from "./UserTimingsHandler.js";
const extensionFlameChartEntries = [];
const extensionTrackData = [];
const extensionMarkers = [];
const entryToNode = /* @__PURE__ */ new Map();
export function handleEvent(_event) {
}
export function reset() {
  extensionFlameChartEntries.length = 0;
  extensionTrackData.length = 0;
  extensionMarkers.length = 0;
  entryToNode.clear();
}
export async function finalize() {
  createExtensionFlameChartEntries();
}
function createExtensionFlameChartEntries() {
  const pairedMeasures = userTimingsData().performanceMeasures;
  const marks = userTimingsData().performanceMarks;
  const mergedRawExtensionEvents = Helpers.Trace.mergeEventsInOrder(pairedMeasures, marks);
  extractExtensionEntries(mergedRawExtensionEvents);
  Helpers.Extensions.buildTrackDataFromExtensionEntries(extensionFlameChartEntries, extensionTrackData, entryToNode);
}
export function extractExtensionEntries(timings) {
  for (const timing of timings) {
    const extensionPayload = extensionDataInTiming(timing);
    if (!extensionPayload) {
      continue;
    }
    const extensionSyntheticEntry = {
      name: timing.name,
      ph: Types.Events.Phase.COMPLETE,
      pid: Types.Events.ProcessID(0),
      tid: Types.Events.ThreadID(0),
      ts: timing.ts,
      dur: timing.dur,
      cat: "devtools.extension",
      args: extensionPayload,
      rawSourceEvent: Types.Events.isSyntheticUserTiming(timing) ? timing.rawSourceEvent : timing
    };
    if (Types.Extensions.isExtensionPayloadMarker(extensionPayload)) {
      const extensionMarker = Helpers.SyntheticEvents.SyntheticEventsManager.getActiveManager().registerSyntheticEvent(
        extensionSyntheticEntry
      );
      extensionMarkers.push(extensionMarker);
      continue;
    }
    if (Types.Extensions.isExtensionPayloadTrackEntry(extensionSyntheticEntry.args)) {
      const extensionTrackEntry = Helpers.SyntheticEvents.SyntheticEventsManager.getActiveManager().registerSyntheticEvent(
        extensionSyntheticEntry
      );
      extensionFlameChartEntries.push(extensionTrackEntry);
      continue;
    }
  }
}
export function extensionDataInTiming(timing) {
  const timingDetail = Types.Events.isPerformanceMark(timing) ? timing.args.data?.detail : timing.args.data.beginEvent.args.detail;
  if (!timingDetail) {
    return null;
  }
  try {
    const detailObj = JSON.parse(timingDetail);
    if (!("devtools" in detailObj)) {
      return null;
    }
    if (!Types.Extensions.isValidExtensionPayload(detailObj.devtools)) {
      return null;
    }
    return detailObj.devtools;
  } catch (e) {
    return null;
  }
}
export function data() {
  return {
    entryToNode,
    extensionTrackData: [...extensionTrackData],
    extensionMarkers: [...extensionMarkers]
  };
}
export function deps() {
  return ["UserTimings"];
}
//# sourceMappingURL=ExtensionTraceDataHandler.js.map

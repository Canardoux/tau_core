"use strict";
import * as Platform from "../../../core/platform/platform.js";
import { sortTraceEventsInPlace } from "./Trace.js";
import { canBuildTreesFromEvents, treify } from "./TreeHelpers.js";
export function buildTrackDataFromExtensionEntries(extensionEntries, extensionTrackData, entryToNode) {
  const dataByTrack = /* @__PURE__ */ new Map();
  for (const entry of extensionEntries) {
    const key = entry.args.trackGroup || `track-name-${entry.args.track}`;
    const batchedData = Platform.MapUtilities.getWithDefault(dataByTrack, key, () => ({
      name: entry.args.trackGroup || entry.args.track,
      isTrackGroup: Boolean(entry.args.trackGroup),
      entriesByTrack: { [entry.args.track]: [] }
    }));
    if (!batchedData.entriesByTrack[entry.args.track]) {
      batchedData.entriesByTrack[entry.args.track] = [];
    }
    const entriesInTrack = batchedData.entriesByTrack[entry.args.track];
    entriesInTrack.push(entry);
  }
  for (const trackData of dataByTrack.values()) {
    for (const entries of Object.values(trackData.entriesByTrack)) {
      sortTraceEventsInPlace(entries);
      if (canBuildTreesFromEvents(entries)) {
        for (const [entry, node] of treify(entries).entryToNode) {
          entryToNode.set(entry, node);
        }
      }
    }
    extensionTrackData.push(trackData);
  }
  return { extensionTrackData, entryToNode };
}
//# sourceMappingURL=Extensions.js.map

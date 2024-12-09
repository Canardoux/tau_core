"use strict";
import * as Platform from "../../../core/platform/platform.js";
const filmStripCache = /* @__PURE__ */ new WeakMap();
export function fromParsedTrace(parsedTrace, customZeroTime) {
  const frames = [];
  const zeroTime = typeof customZeroTime !== "undefined" ? customZeroTime : parsedTrace.Meta.traceBounds.min;
  const spanTime = parsedTrace.Meta.traceBounds.range;
  const fromCache = filmStripCache.get(parsedTrace)?.get(zeroTime);
  if (fromCache) {
    return fromCache;
  }
  for (const screenshotEvent of parsedTrace.Screenshots.all) {
    if (screenshotEvent.ts < zeroTime) {
      continue;
    }
    const frame = {
      index: frames.length,
      screenshotEvent
    };
    frames.push(frame);
  }
  const result = {
    zeroTime,
    spanTime,
    frames: Array.from(frames)
  };
  const cachedForData = Platform.MapUtilities.getWithDefault(
    filmStripCache,
    parsedTrace,
    () => /* @__PURE__ */ new Map()
  );
  cachedForData.set(zeroTime, result);
  return result;
}
export function frameClosestToTimestamp(filmStrip, searchTimestamp) {
  const closestFrameIndexBeforeTimestamp = Platform.ArrayUtilities.nearestIndexFromEnd(
    filmStrip.frames,
    (frame) => frame.screenshotEvent.ts < searchTimestamp
  );
  if (closestFrameIndexBeforeTimestamp === null) {
    return null;
  }
  return filmStrip.frames[closestFrameIndexBeforeTimestamp];
}
//# sourceMappingURL=FilmStrip.js.map

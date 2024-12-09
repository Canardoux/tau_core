"use strict";
import * as Platform from "../../../core/platform/platform.js";
import * as Types from "../types/types.js";
const paintImageEvents = /* @__PURE__ */ new Map();
const decodeLazyPixelRefEvents = /* @__PURE__ */ new Map();
const paintImageByLazyPixelRef = /* @__PURE__ */ new Map();
const eventToPaintImage = /* @__PURE__ */ new Map();
const urlToPaintImage = /* @__PURE__ */ new Map();
export function reset() {
  paintImageEvents.clear();
  decodeLazyPixelRefEvents.clear();
  paintImageByLazyPixelRef.clear();
  eventToPaintImage.clear();
  urlToPaintImage.clear();
}
export function handleEvent(event) {
  if (Types.Events.isPaintImage(event)) {
    const forProcess = paintImageEvents.get(event.pid) || /* @__PURE__ */ new Map();
    const forThread = forProcess.get(event.tid) || [];
    forThread.push(event);
    forProcess.set(event.tid, forThread);
    paintImageEvents.set(event.pid, forProcess);
    if (event.args.data.url) {
      const paintsForUrl = Platform.MapUtilities.getWithDefault(urlToPaintImage, event.args.data.url, () => []);
      paintsForUrl.push(event);
    }
    return;
  }
  if (Types.Events.isDecodeLazyPixelRef(event) && typeof event.args?.LazyPixelRef !== "undefined") {
    const forProcess = decodeLazyPixelRefEvents.get(event.pid) || /* @__PURE__ */ new Map();
    const forThread = forProcess.get(event.tid) || [];
    forThread.push(event);
    forProcess.set(event.tid, forThread);
    decodeLazyPixelRefEvents.set(event.pid, forProcess);
  }
  if (Types.Events.isDrawLazyPixelRef(event) && typeof event.args?.LazyPixelRef !== "undefined") {
    const lastPaintEvent = paintImageEvents.get(event.pid)?.get(event.tid)?.at(-1);
    if (!lastPaintEvent) {
      return;
    }
    paintImageByLazyPixelRef.set(event.args.LazyPixelRef, lastPaintEvent);
    return;
  }
  if (Types.Events.isDecodeImage(event)) {
    const lastPaintImageEventOnThread = paintImageEvents.get(event.pid)?.get(event.tid)?.at(-1);
    if (lastPaintImageEventOnThread) {
      eventToPaintImage.set(event, lastPaintImageEventOnThread);
      return;
    }
    const lastDecodeLazyPixelRef = decodeLazyPixelRefEvents.get(event.pid)?.get(event.tid)?.at(-1);
    if (!lastDecodeLazyPixelRef || typeof lastDecodeLazyPixelRef.args?.LazyPixelRef === "undefined") {
      return;
    }
    const paintEvent = paintImageByLazyPixelRef.get(lastDecodeLazyPixelRef.args.LazyPixelRef);
    if (!paintEvent) {
      return;
    }
    eventToPaintImage.set(event, paintEvent);
  }
}
export async function finalize() {
}
export function data() {
  return {
    paintImageByDrawLazyPixelRef: paintImageByLazyPixelRef,
    paintImageForEvent: eventToPaintImage,
    paintImageEventForUrl: urlToPaintImage
  };
}
//# sourceMappingURL=ImagePaintingHandler.js.map

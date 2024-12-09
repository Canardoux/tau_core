"use strict";
import * as Types from "../types/types.js";
export function getNonResolved(parsedTrace, entry) {
  if (Types.Events.isProfileCall(entry)) {
    return entry.callFrame.url;
  }
  if (entry.args?.data?.stackTrace && entry.args.data.stackTrace.length > 0) {
    return entry.args.data.stackTrace[0].url;
  }
  if (Types.Events.isSyntheticNetworkRequest(entry)) {
    return entry.args.data.url;
  }
  if (Types.Events.isDecodeImage(entry)) {
    const paintEvent = parsedTrace.ImagePainting.paintImageForEvent.get(entry);
    return paintEvent ? getNonResolved(parsedTrace, paintEvent) : null;
  }
  if (Types.Events.isDrawLazyPixelRef(entry) && entry.args?.LazyPixelRef) {
    const paintEvent = parsedTrace.ImagePainting.paintImageByDrawLazyPixelRef.get(entry.args.LazyPixelRef);
    return paintEvent ? getNonResolved(parsedTrace, paintEvent) : null;
  }
  if (Types.Events.isParseHTML(entry)) {
    return entry.args.beginData.url;
  }
  if (entry.args?.data?.url) {
    return entry.args.data.url;
  }
  return null;
}
//# sourceMappingURL=URLForEntry.js.map

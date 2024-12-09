"use strict";
export const extensionPalette = [
  "primary",
  "primary-light",
  "primary-dark",
  "secondary",
  "secondary-light",
  "secondary-dark",
  "tertiary",
  "tertiary-light",
  "tertiary-dark",
  "error",
  "warning"
];
export function colorIsValid(color) {
  return extensionPalette.includes(color);
}
export function isExtensionPayloadMarker(payload) {
  return payload.dataType === "marker";
}
export function isExtensionPayloadTrackEntry(payload) {
  const hasTrack = "track" in payload && Boolean(payload.track);
  const validEntryType = payload.dataType === "track-entry" || payload.dataType === void 0;
  return validEntryType && hasTrack;
}
export function isValidExtensionPayload(payload) {
  return isExtensionPayloadMarker(payload) || isExtensionPayloadTrackEntry(payload);
}
export function isSyntheticExtensionEntry(entry) {
  return entry.cat === "devtools.extension";
}
//# sourceMappingURL=Extensions.js.map

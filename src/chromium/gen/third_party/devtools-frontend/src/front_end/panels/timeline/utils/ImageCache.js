"use strict";
const imageCache = /* @__PURE__ */ new WeakMap();
export const emitter = new EventTarget();
export function getOrQueue(screenshot) {
  if (imageCache.has(screenshot)) {
    return imageCache.get(screenshot) ?? null;
  }
  const data = screenshot.args.dataUri;
  loadImage(data).then((imageOrNull) => {
    imageCache.set(screenshot, imageOrNull);
    emitter.dispatchEvent(new CustomEvent("screenshot-loaded", { detail: { screenshot, image: imageOrNull } }));
  }).catch(() => {
  });
  return null;
}
function loadImage(url) {
  return new Promise((resolve) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => resolve(null));
    image.src = url;
  });
}
export function preload(screenshots) {
  const promises = screenshots.map((screenshot) => {
    if (imageCache.has(screenshot)) {
      return;
    }
    return loadImage(screenshot.args.dataUri).then((image) => {
      imageCache.set(screenshot, image);
      return;
    });
  });
  return Promise.all(promises);
}
export const cacheForTesting = imageCache;
export const loadImageForTesting = loadImage;
//# sourceMappingURL=ImageCache.js.map

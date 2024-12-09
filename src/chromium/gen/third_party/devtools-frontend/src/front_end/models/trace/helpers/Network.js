"use strict";
const NON_RENDER_BLOCKING_VALUES = /* @__PURE__ */ new Set([
  "non_blocking",
  "dynamically_injected_non_blocking",
  "potentially_blocking"
]);
export function isSyntheticNetworkRequestEventRenderBlocking(event) {
  return !NON_RENDER_BLOCKING_VALUES.has(event.args.data.renderBlocking);
}
//# sourceMappingURL=Network.js.map

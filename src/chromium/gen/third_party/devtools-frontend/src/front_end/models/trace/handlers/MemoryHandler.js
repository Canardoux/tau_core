"use strict";
import * as Platform from "../../../core/platform/platform.js";
import * as Types from "../types/types.js";
const updateCountersByProcess = /* @__PURE__ */ new Map();
export function reset() {
  updateCountersByProcess.clear();
}
export function handleEvent(event) {
  if (Types.Events.isUpdateCounters(event)) {
    const countersForProcess = Platform.MapUtilities.getWithDefault(updateCountersByProcess, event.pid, () => []);
    countersForProcess.push(event);
    updateCountersByProcess.set(event.pid, countersForProcess);
  }
}
export async function finalize() {
}
export function data() {
  return { updateCountersByProcess };
}
//# sourceMappingURL=MemoryHandler.js.map

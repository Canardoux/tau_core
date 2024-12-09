"use strict";
import * as Types from "../types/types.js";
const sessionIdEvents = [];
const workerIdByThread = /* @__PURE__ */ new Map();
const workerURLById = /* @__PURE__ */ new Map();
export function reset() {
  sessionIdEvents.length = 0;
  workerIdByThread.clear();
  workerURLById.clear();
}
export function handleEvent(event) {
  if (Types.Events.isTracingSessionIdForWorker(event)) {
    sessionIdEvents.push(event);
  }
}
export async function finalize() {
  for (const sessionIdEvent of sessionIdEvents) {
    if (!sessionIdEvent.args.data) {
      continue;
    }
    workerIdByThread.set(sessionIdEvent.args.data.workerThreadId, sessionIdEvent.args.data.workerId);
    workerURLById.set(sessionIdEvent.args.data.workerId, sessionIdEvent.args.data.url);
  }
}
export function data() {
  return {
    workerSessionIdEvents: sessionIdEvents,
    workerIdByThread,
    workerURLById
  };
}
//# sourceMappingURL=WorkersHandler.js.map

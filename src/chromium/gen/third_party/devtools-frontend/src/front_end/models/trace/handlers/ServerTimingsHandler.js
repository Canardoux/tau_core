"use strict";
import * as Platform from "../../../core/platform/platform.js";
import * as Helpers from "../helpers/helpers.js";
import * as Types from "../types/types.js";
import { data as networkData } from "./NetworkRequestsHandler.js";
const serverTimings = [];
export function reset() {
  serverTimings.length = 0;
}
export function handleEvent(_event) {
}
export async function finalize() {
  extractServerTimings();
  Helpers.Trace.sortTraceEventsInPlace(serverTimings);
}
const RESPONSE_START_METRIC_NAME = "response-start";
const RESPONSE_END_METRIC_NAME = "response-end";
function extractServerTimings() {
  for (const networkEvent of networkData().byTime) {
    let timingsInRequest = null;
    for (const header of networkEvent.args.data.responseHeaders) {
      const headerName = header.name.toLocaleLowerCase();
      if (headerName === "server-timing" || headerName === "server-timing-test") {
        header.name = "server-timing";
        timingsInRequest = Platform.ServerTiming.ServerTiming.parseHeaders([header]);
        continue;
      }
    }
    const serverStart = timingsInRequest?.find((timing) => timing.metric === RESPONSE_START_METRIC_NAME)?.start;
    const serverEnd = timingsInRequest?.find((timing) => timing.metric === RESPONSE_END_METRIC_NAME)?.start;
    if (!serverStart || !serverEnd || !timingsInRequest) {
      continue;
    }
    const serverStartInMicro = serverStart * 1e3;
    const serverEndInMicro = serverEnd * 1e3;
    serverTimings.push(
      ...createSyntheticServerTiming(networkEvent, serverStartInMicro, serverEndInMicro, timingsInRequest)
    );
  }
}
function createSyntheticServerTiming(request, serverStart, serverEnd, timingsInRequest) {
  const clientStart = request.args.data.syntheticData.sendStartTime;
  const clientEndTime = request.args.data.syntheticData.sendStartTime + request.args.data.syntheticData.waiting;
  const offset = Types.Timing.MicroSeconds((serverStart - clientStart + serverEnd - clientEndTime) / 2);
  const convertedServerTimings = [];
  for (const timing of timingsInRequest) {
    if (timing.metric === RESPONSE_START_METRIC_NAME || timing.metric === RESPONSE_END_METRIC_NAME) {
      continue;
    }
    if (timing.start === null) {
      continue;
    }
    const convertedTimestamp = Helpers.Timing.millisecondsToMicroseconds(Types.Timing.MilliSeconds(timing.start)) - offset;
    const parsedUrl = new URL(request.args.data.url);
    const origin = parsedUrl.origin;
    const serverTiming = Helpers.SyntheticEvents.SyntheticEventsManager.registerServerTiming({
      rawSourceEvent: request.rawSourceEvent,
      name: timing.metric,
      ph: Types.Events.Phase.COMPLETE,
      pid: Types.Events.ProcessID(0),
      tid: Types.Events.ThreadID(0),
      ts: Types.Timing.MicroSeconds(convertedTimestamp),
      dur: Helpers.Timing.millisecondsToMicroseconds(Types.Timing.MilliSeconds(timing.value)),
      cat: "devtools.server-timing",
      args: { data: { desc: timing.description || void 0, origin } }
    });
    if (!request.args.data.syntheticServerTimings) {
      request.args.data.syntheticServerTimings = [];
    }
    request.args.data.syntheticServerTimings.push(serverTiming);
    convertedServerTimings.push(serverTiming);
  }
  return convertedServerTimings;
}
export function data() {
  return {
    serverTimings
  };
}
export function deps() {
  return ["NetworkRequests"];
}
//# sourceMappingURL=ServerTimingsHandler.js.map

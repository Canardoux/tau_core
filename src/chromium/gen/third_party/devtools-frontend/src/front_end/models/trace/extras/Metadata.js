"use strict";
import * as SDK from "../../../core/sdk/sdk.js";
import * as Types from "../types/types.js";
export async function forNewRecording(isCpuProfile, recordStartTime, emulatedDeviceTitle, cruxFieldData) {
  try {
    let getConcurrencyOrTimeout2 = function() {
      return Promise.race([
        SDK.CPUThrottlingManager.CPUThrottlingManager.instance().getHardwareConcurrency(),
        new Promise((resolve) => {
          setTimeout(() => resolve(void 0), 1e3);
        })
      ]);
    };
    var getConcurrencyOrTimeout = getConcurrencyOrTimeout2;
    if (isCpuProfile) {
      return {
        dataOrigin: Types.File.DataOrigin.CPU_PROFILE
      };
    }
    const cpuThrottlingManager = SDK.CPUThrottlingManager.CPUThrottlingManager.instance();
    const hardwareConcurrency = cpuThrottlingManager.hasPrimaryPageTargetSet() ? await getConcurrencyOrTimeout2() : void 0;
    const cpuThrottling = SDK.CPUThrottlingManager.CPUThrottlingManager.instance().cpuThrottlingRate();
    const networkConditions = SDK.NetworkManager.MultitargetNetworkManager.instance().isThrottling() ? SDK.NetworkManager.MultitargetNetworkManager.instance().networkConditions() : void 0;
    let networkThrottlingConditions;
    let networkTitle;
    if (networkConditions) {
      networkThrottlingConditions = {
        download: networkConditions.download,
        upload: networkConditions.upload,
        latency: networkConditions.latency,
        packetLoss: networkConditions.packetLoss,
        packetQueueLength: networkConditions.packetQueueLength,
        packetReordering: networkConditions.packetReordering,
        targetLatency: networkConditions.targetLatency
      };
      networkTitle = typeof networkConditions.title === "function" ? networkConditions.title() : networkConditions.title;
    }
    return {
      source: "DevTools",
      startTime: recordStartTime ? new Date(recordStartTime).toJSON() : void 0,
      // ISO-8601 timestamp
      emulatedDeviceTitle,
      cpuThrottling: cpuThrottling !== 1 ? cpuThrottling : void 0,
      networkThrottling: networkTitle,
      networkThrottlingConditions,
      hardwareConcurrency,
      dataOrigin: Types.File.DataOrigin.TRACE_EVENTS,
      cruxFieldData
    };
  } catch {
    return {};
  }
}
//# sourceMappingURL=Metadata.js.map

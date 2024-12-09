"use strict";
import * as Common from "../../core/common/common.js";
import { EmulationModel } from "./EmulationModel.js";
import { TargetManager } from "./TargetManager.js";
let throttlingManagerInstance;
export class CPUThrottlingManager extends Common.ObjectWrapper.ObjectWrapper {
  #cpuThrottlingRateInternal;
  #hardwareConcurrencyInternal;
  #pendingMainTargetPromise;
  constructor() {
    super();
    this.#cpuThrottlingRateInternal = 1 /* NO_THROTTLING */;
    TargetManager.instance().observeModels(EmulationModel, this);
  }
  static instance(opts = { forceNew: null }) {
    const { forceNew } = opts;
    if (!throttlingManagerInstance || forceNew) {
      throttlingManagerInstance = new CPUThrottlingManager();
    }
    return throttlingManagerInstance;
  }
  cpuThrottlingRate() {
    return this.#cpuThrottlingRateInternal;
  }
  setCPUThrottlingRate(rate) {
    if (rate === this.#cpuThrottlingRateInternal) {
      return;
    }
    this.#cpuThrottlingRateInternal = rate;
    for (const emulationModel of TargetManager.instance().models(EmulationModel)) {
      void emulationModel.setCPUThrottlingRate(this.#cpuThrottlingRateInternal);
    }
    this.dispatchEventToListeners("RateChanged" /* RATE_CHANGED */, this.#cpuThrottlingRateInternal);
  }
  setHardwareConcurrency(concurrency) {
    this.#hardwareConcurrencyInternal = concurrency;
    for (const emulationModel of TargetManager.instance().models(EmulationModel)) {
      void emulationModel.setHardwareConcurrency(concurrency);
    }
    this.dispatchEventToListeners("HardwareConcurrencyChanged" /* HARDWARE_CONCURRENCY_CHANGED */, this.#hardwareConcurrencyInternal);
  }
  hasPrimaryPageTargetSet() {
    try {
      return TargetManager.instance().primaryPageTarget() !== null;
    } catch {
      return false;
    }
  }
  async getHardwareConcurrency() {
    const target = TargetManager.instance().primaryPageTarget();
    const existingCallback = this.#pendingMainTargetPromise;
    if (!target) {
      if (existingCallback) {
        return new Promise((r) => {
          this.#pendingMainTargetPromise = (result2) => {
            r(result2);
            existingCallback(result2);
          };
        });
      }
      return new Promise((r) => {
        this.#pendingMainTargetPromise = r;
      });
    }
    const evalResult = await target.runtimeAgent().invoke_evaluate(
      { expression: "navigator.hardwareConcurrency", returnByValue: true, silent: true, throwOnSideEffect: true }
    );
    const error = evalResult.getError();
    if (error) {
      throw new Error(error);
    }
    const { result, exceptionDetails } = evalResult;
    if (exceptionDetails) {
      throw new Error(exceptionDetails.text);
    }
    return result.value;
  }
  modelAdded(emulationModel) {
    if (this.#cpuThrottlingRateInternal !== 1 /* NO_THROTTLING */) {
      void emulationModel.setCPUThrottlingRate(this.#cpuThrottlingRateInternal);
    }
    if (this.#hardwareConcurrencyInternal !== void 0) {
      void emulationModel.setHardwareConcurrency(this.#hardwareConcurrencyInternal);
    }
    if (this.#pendingMainTargetPromise) {
      const existingCallback = this.#pendingMainTargetPromise;
      this.#pendingMainTargetPromise = void 0;
      void this.getHardwareConcurrency().then(existingCallback);
    }
  }
  modelRemoved(_emulationModel) {
  }
}
export var Events = /* @__PURE__ */ ((Events2) => {
  Events2["RATE_CHANGED"] = "RateChanged";
  Events2["HARDWARE_CONCURRENCY_CHANGED"] = "HardwareConcurrencyChanged";
  return Events2;
})(Events || {});
export function throttlingManager() {
  return CPUThrottlingManager.instance();
}
export var CPUThrottlingRates = /* @__PURE__ */ ((CPUThrottlingRates2) => {
  CPUThrottlingRates2[CPUThrottlingRates2["NO_THROTTLING"] = 1] = "NO_THROTTLING";
  CPUThrottlingRates2[CPUThrottlingRates2["MidTierMobile"] = 4] = "MidTierMobile";
  CPUThrottlingRates2[CPUThrottlingRates2["LowEndMobile"] = 6] = "LowEndMobile";
  CPUThrottlingRates2[CPUThrottlingRates2["EXTRA_SLOW"] = 20] = "EXTRA_SLOW";
  return CPUThrottlingRates2;
})(CPUThrottlingRates || {});
//# sourceMappingURL=CPUThrottlingManager.js.map

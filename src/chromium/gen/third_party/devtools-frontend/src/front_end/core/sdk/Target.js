"use strict";
import * as Common from "../common/common.js";
import * as Platform from "../platform/platform.js";
import * as ProtocolClient from "../protocol_client/protocol_client.js";
import { SDKModel } from "./SDKModel.js";
export class Target extends ProtocolClient.InspectorBackend.TargetBase {
  #targetManagerInternal;
  #nameInternal;
  #inspectedURLInternal;
  #inspectedURLName;
  #capabilitiesMask;
  #typeInternal;
  #parentTargetInternal;
  #idInternal;
  #modelByConstructor;
  #isSuspended;
  #targetInfoInternal;
  #creatingModels;
  constructor(targetManager, id, name, type, parentTarget, sessionId, suspended, connection, targetInfo) {
    const needsNodeJSPatching = type === "node" /* NODE */;
    super(needsNodeJSPatching, parentTarget, sessionId, connection);
    this.#targetManagerInternal = targetManager;
    this.#nameInternal = name;
    this.#inspectedURLInternal = Platform.DevToolsPath.EmptyUrlString;
    this.#inspectedURLName = "";
    this.#capabilitiesMask = 0;
    switch (type) {
      case "frame" /* FRAME */:
        this.#capabilitiesMask = 1 /* BROWSER */ | 8192 /* STORAGE */ | 2 /* DOM */ | 4 /* JS */ | 8 /* LOG */ | 16 /* NETWORK */ | 32 /* TARGET */ | 128 /* TRACING */ | 256 /* EMULATION */ | 1024 /* INPUT */ | 2048 /* INSPECTOR */ | 32768 /* AUDITS */ | 65536 /* WEB_AUTHN */ | 131072 /* IO */ | 262144 /* MEDIA */ | 524288 /* EVENT_BREAKPOINTS */;
        if (parentTarget?.type() !== "frame" /* FRAME */) {
          this.#capabilitiesMask |= 4096 /* DEVICE_EMULATION */ | 64 /* SCREEN_CAPTURE */ | 512 /* SECURITY */ | 16384 /* SERVICE_WORKER */;
          if (Common.ParsedURL.schemeIs(targetInfo?.url, "chrome-extension:")) {
            this.#capabilitiesMask &= ~512 /* SECURITY */;
          }
        }
        break;
      case "service-worker" /* ServiceWorker */:
        this.#capabilitiesMask = 4 /* JS */ | 8 /* LOG */ | 16 /* NETWORK */ | 32 /* TARGET */ | 2048 /* INSPECTOR */ | 131072 /* IO */ | 524288 /* EVENT_BREAKPOINTS */;
        if (parentTarget?.type() !== "frame" /* FRAME */) {
          this.#capabilitiesMask |= 1 /* BROWSER */;
        }
        break;
      case "shared-worker" /* SHARED_WORKER */:
        this.#capabilitiesMask = 4 /* JS */ | 8 /* LOG */ | 16 /* NETWORK */ | 32 /* TARGET */ | 131072 /* IO */ | 262144 /* MEDIA */ | 2048 /* INSPECTOR */ | 524288 /* EVENT_BREAKPOINTS */;
        break;
      case "shared-storage-worklet" /* SHARED_STORAGE_WORKLET */:
        this.#capabilitiesMask = 4 /* JS */ | 8 /* LOG */ | 2048 /* INSPECTOR */ | 524288 /* EVENT_BREAKPOINTS */;
        break;
      case "worker" /* Worker */:
        this.#capabilitiesMask = 4 /* JS */ | 8 /* LOG */ | 16 /* NETWORK */ | 32 /* TARGET */ | 131072 /* IO */ | 262144 /* MEDIA */ | 256 /* EMULATION */ | 524288 /* EVENT_BREAKPOINTS */;
        break;
      case "worklet" /* WORKLET */:
        this.#capabilitiesMask = 4 /* JS */ | 8 /* LOG */ | 524288 /* EVENT_BREAKPOINTS */ | 16 /* NETWORK */;
        break;
      case "node" /* NODE */:
        this.#capabilitiesMask = 4 /* JS */;
        break;
      case "auction-worklet" /* AUCTION_WORKLET */:
        this.#capabilitiesMask = 4 /* JS */ | 524288 /* EVENT_BREAKPOINTS */;
        break;
      case "browser" /* BROWSER */:
        this.#capabilitiesMask = 32 /* TARGET */ | 131072 /* IO */;
        break;
      case "tab" /* TAB */:
        this.#capabilitiesMask = 32 /* TARGET */ | 128 /* TRACING */;
        break;
    }
    this.#typeInternal = type;
    this.#parentTargetInternal = parentTarget;
    this.#idInternal = id;
    this.#modelByConstructor = /* @__PURE__ */ new Map();
    this.#isSuspended = suspended;
    this.#targetInfoInternal = targetInfo;
  }
  createModels(required) {
    this.#creatingModels = true;
    const registeredModels = Array.from(SDKModel.registeredModels.entries());
    for (const [modelClass, info] of registeredModels) {
      if (info.early) {
        this.model(modelClass);
      }
    }
    for (const [modelClass, info] of registeredModels) {
      if (info.autostart || required.has(modelClass)) {
        this.model(modelClass);
      }
    }
    this.#creatingModels = false;
  }
  id() {
    return this.#idInternal;
  }
  name() {
    return this.#nameInternal || this.#inspectedURLName;
  }
  setName(name) {
    if (this.#nameInternal === name) {
      return;
    }
    this.#nameInternal = name;
    this.#targetManagerInternal.onNameChange(this);
  }
  type() {
    return this.#typeInternal;
  }
  markAsNodeJSForTest() {
    super.markAsNodeJSForTest();
    this.#typeInternal = "node" /* NODE */;
  }
  targetManager() {
    return this.#targetManagerInternal;
  }
  hasAllCapabilities(capabilitiesMask) {
    return (this.#capabilitiesMask & capabilitiesMask) === capabilitiesMask;
  }
  decorateLabel(label) {
    return this.#typeInternal === "worker" /* Worker */ || this.#typeInternal === "service-worker" /* ServiceWorker */ ? "\u2699 " + label : label;
  }
  parentTarget() {
    return this.#parentTargetInternal;
  }
  outermostTarget() {
    let lastTarget = null;
    let currentTarget = this;
    do {
      if (currentTarget.type() !== "tab" /* TAB */ && currentTarget.type() !== "browser" /* BROWSER */) {
        lastTarget = currentTarget;
      }
      currentTarget = currentTarget.parentTarget();
    } while (currentTarget);
    return lastTarget;
  }
  dispose(reason) {
    super.dispose(reason);
    this.#targetManagerInternal.removeTarget(this);
    for (const model of this.#modelByConstructor.values()) {
      model.dispose();
    }
  }
  model(modelClass) {
    if (!this.#modelByConstructor.get(modelClass)) {
      const info = SDKModel.registeredModels.get(modelClass);
      if (info === void 0) {
        throw "Model class is not registered @" + new Error().stack;
      }
      if ((this.#capabilitiesMask & info.capabilities) === info.capabilities) {
        const model = new modelClass(this);
        this.#modelByConstructor.set(modelClass, model);
        if (!this.#creatingModels) {
          this.#targetManagerInternal.modelAdded(this, modelClass, model, this.#targetManagerInternal.isInScope(this));
        }
      }
    }
    return this.#modelByConstructor.get(modelClass) || null;
  }
  models() {
    return this.#modelByConstructor;
  }
  inspectedURL() {
    return this.#inspectedURLInternal;
  }
  setInspectedURL(inspectedURL) {
    this.#inspectedURLInternal = inspectedURL;
    const parsedURL = Common.ParsedURL.ParsedURL.fromString(inspectedURL);
    this.#inspectedURLName = parsedURL ? parsedURL.lastPathComponentWithFragment() : "#" + this.#idInternal;
    this.#targetManagerInternal.onInspectedURLChange(this);
    if (!this.#nameInternal) {
      this.#targetManagerInternal.onNameChange(this);
    }
  }
  async suspend(reason) {
    if (this.#isSuspended) {
      return;
    }
    this.#isSuspended = true;
    await Promise.all(Array.from(this.models().values(), (m) => m.preSuspendModel(reason)));
    await Promise.all(Array.from(this.models().values(), (m) => m.suspendModel(reason)));
  }
  async resume() {
    if (!this.#isSuspended) {
      return;
    }
    this.#isSuspended = false;
    await Promise.all(Array.from(this.models().values(), (m) => m.resumeModel()));
    await Promise.all(Array.from(this.models().values(), (m) => m.postResumeModel()));
  }
  suspended() {
    return this.#isSuspended;
  }
  updateTargetInfo(targetInfo) {
    this.#targetInfoInternal = targetInfo;
  }
  targetInfo() {
    return this.#targetInfoInternal;
  }
}
export var Type = /* @__PURE__ */ ((Type2) => {
  Type2["FRAME"] = "frame";
  Type2["ServiceWorker"] = "service-worker";
  Type2["Worker"] = "worker";
  Type2["SHARED_WORKER"] = "shared-worker";
  Type2["SHARED_STORAGE_WORKLET"] = "shared-storage-worklet";
  Type2["NODE"] = "node";
  Type2["BROWSER"] = "browser";
  Type2["AUCTION_WORKLET"] = "auction-worklet";
  Type2["WORKLET"] = "worklet";
  Type2["TAB"] = "tab";
  return Type2;
})(Type || {});
export var Capability = /* @__PURE__ */ ((Capability2) => {
  Capability2[Capability2["BROWSER"] = 1] = "BROWSER";
  Capability2[Capability2["DOM"] = 2] = "DOM";
  Capability2[Capability2["JS"] = 4] = "JS";
  Capability2[Capability2["LOG"] = 8] = "LOG";
  Capability2[Capability2["NETWORK"] = 16] = "NETWORK";
  Capability2[Capability2["TARGET"] = 32] = "TARGET";
  Capability2[Capability2["SCREEN_CAPTURE"] = 64] = "SCREEN_CAPTURE";
  Capability2[Capability2["TRACING"] = 128] = "TRACING";
  Capability2[Capability2["EMULATION"] = 256] = "EMULATION";
  Capability2[Capability2["SECURITY"] = 512] = "SECURITY";
  Capability2[Capability2["INPUT"] = 1024] = "INPUT";
  Capability2[Capability2["INSPECTOR"] = 2048] = "INSPECTOR";
  Capability2[Capability2["DEVICE_EMULATION"] = 4096] = "DEVICE_EMULATION";
  Capability2[Capability2["STORAGE"] = 8192] = "STORAGE";
  Capability2[Capability2["SERVICE_WORKER"] = 16384] = "SERVICE_WORKER";
  Capability2[Capability2["AUDITS"] = 32768] = "AUDITS";
  Capability2[Capability2["WEB_AUTHN"] = 65536] = "WEB_AUTHN";
  Capability2[Capability2["IO"] = 131072] = "IO";
  Capability2[Capability2["MEDIA"] = 262144] = "MEDIA";
  Capability2[Capability2["EVENT_BREAKPOINTS"] = 524288] = "EVENT_BREAKPOINTS";
  Capability2[Capability2["NONE"] = 0] = "NONE";
  return Capability2;
})(Capability || {});
//# sourceMappingURL=Target.js.map

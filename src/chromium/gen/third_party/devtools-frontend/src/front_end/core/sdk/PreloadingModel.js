"use strict";
import { assertNotNullOrUndefined } from "../platform/platform.js";
import * as Protocol from "../../generated/protocol.js";
import { SDKModel } from "./SDKModel.js";
import { Capability } from "./Target.js";
import { TargetManager } from "./TargetManager.js";
import {
  Events as ResourceTreeModelEvents,
  PrimaryPageChangeType,
  ResourceTreeModel
} from "./ResourceTreeModel.js";
export class PreloadingModel extends SDKModel {
  agent;
  loaderIds = [];
  targetJustAttached = true;
  lastPrimaryPageModel = null;
  documents = /* @__PURE__ */ new Map();
  constructor(target) {
    super(target);
    target.registerPreloadDispatcher(new PreloadDispatcher(this));
    this.agent = target.preloadAgent();
    void this.agent.invoke_enable();
    const targetInfo = target.targetInfo();
    if (targetInfo !== void 0 && targetInfo.subtype === "prerender") {
      this.lastPrimaryPageModel = TargetManager.instance().primaryPageTarget()?.model(PreloadingModel) || null;
    }
    TargetManager.instance().addModelListener(
      ResourceTreeModel,
      ResourceTreeModelEvents.PrimaryPageChanged,
      this.onPrimaryPageChanged,
      this
    );
  }
  dispose() {
    super.dispose();
    TargetManager.instance().removeModelListener(
      ResourceTreeModel,
      ResourceTreeModelEvents.PrimaryPageChanged,
      this.onPrimaryPageChanged,
      this
    );
    void this.agent.invoke_disable();
  }
  ensureDocumentPreloadingData(loaderId) {
    if (this.documents.get(loaderId) === void 0) {
      this.documents.set(loaderId, new DocumentPreloadingData());
    }
  }
  currentLoaderId() {
    if (this.targetJustAttached) {
      return null;
    }
    if (this.loaderIds.length === 0) {
      throw new Error("unreachable");
    }
    return this.loaderIds[this.loaderIds.length - 1];
  }
  currentDocument() {
    const loaderId = this.currentLoaderId();
    return loaderId === null ? null : this.documents.get(loaderId) || null;
  }
  // Returns a rule set of the current page.
  //
  // Returns reference. Don't save returned values.
  // Returned value may or may not be updated as the time grows.
  getRuleSetById(id) {
    return this.currentDocument()?.ruleSets.getById(id) || null;
  }
  // Returns rule sets of the current page.
  //
  // Returns array of pairs of id and reference. Don't save returned references.
  // Returned values may or may not be updated as the time grows.
  getAllRuleSets() {
    return this.currentDocument()?.ruleSets.getAll() || [];
  }
  getPreloadCountsByRuleSetId() {
    const countsByRuleSetId = /* @__PURE__ */ new Map();
    for (const { value } of this.getPreloadingAttempts(null)) {
      for (const ruleSetId of [null, ...value.ruleSetIds]) {
        if (countsByRuleSetId.get(ruleSetId) === void 0) {
          countsByRuleSetId.set(ruleSetId, /* @__PURE__ */ new Map());
        }
        const countsByStatus = countsByRuleSetId.get(ruleSetId);
        assertNotNullOrUndefined(countsByStatus);
        const i = countsByStatus.get(value.status) || 0;
        countsByStatus.set(value.status, i + 1);
      }
    }
    return countsByRuleSetId;
  }
  // Returns a preloading attempt of the current page.
  //
  // Returns reference. Don't save returned values.
  // Returned value may or may not be updated as the time grows.
  getPreloadingAttemptById(id) {
    const document = this.currentDocument();
    if (document === null) {
      return null;
    }
    return document.preloadingAttempts.getById(id, document.sources) || null;
  }
  // Returs preloading attempts of the current page that triggered by the rule set with `ruleSetId`.
  // `ruleSetId === null` means "do not filter".
  //
  // Returns array of pairs of id and reference. Don't save returned references.
  // Returned values may or may not be updated as the time grows.
  getPreloadingAttempts(ruleSetId) {
    const document = this.currentDocument();
    if (document === null) {
      return [];
    }
    return document.preloadingAttempts.getAll(ruleSetId, document.sources);
  }
  // Returs preloading attempts of the previousPgae.
  //
  // Returns array of pairs of id and reference. Don't save returned references.
  // Returned values may or may not be updated as the time grows.
  getPreloadingAttemptsOfPreviousPage() {
    if (this.loaderIds.length <= 1) {
      return [];
    }
    const document = this.documents.get(this.loaderIds[this.loaderIds.length - 2]);
    if (document === void 0) {
      return [];
    }
    return document.preloadingAttempts.getAll(null, document.sources);
  }
  onPrimaryPageChanged(event) {
    const { frame, type } = event.data;
    if (this.lastPrimaryPageModel === null && type === PrimaryPageChangeType.ACTIVATION) {
      return;
    }
    if (this.lastPrimaryPageModel !== null && type !== PrimaryPageChangeType.ACTIVATION) {
      return;
    }
    if (this.lastPrimaryPageModel !== null && type === PrimaryPageChangeType.ACTIVATION) {
      this.loaderIds = this.lastPrimaryPageModel.loaderIds;
      for (const [loaderId, prev] of this.lastPrimaryPageModel.documents.entries()) {
        this.ensureDocumentPreloadingData(loaderId);
        this.documents.get(loaderId)?.mergePrevious(prev);
      }
    }
    this.lastPrimaryPageModel = null;
    const currentLoaderId = frame.loaderId;
    this.loaderIds.push(currentLoaderId);
    this.loaderIds = this.loaderIds.slice(-2);
    this.ensureDocumentPreloadingData(currentLoaderId);
    for (const loaderId of this.documents.keys()) {
      if (!this.loaderIds.includes(loaderId)) {
        this.documents.delete(loaderId);
      }
    }
    this.dispatchEventToListeners("ModelUpdated" /* MODEL_UPDATED */);
  }
  onRuleSetUpdated(event) {
    const ruleSet = event.ruleSet;
    const loaderId = ruleSet.loaderId;
    if (this.currentLoaderId() === null) {
      this.loaderIds = [loaderId];
      this.targetJustAttached = false;
    }
    this.ensureDocumentPreloadingData(loaderId);
    this.documents.get(loaderId)?.ruleSets.upsert(ruleSet);
    this.dispatchEventToListeners("ModelUpdated" /* MODEL_UPDATED */);
  }
  onRuleSetRemoved(event) {
    const id = event.id;
    for (const document of this.documents.values()) {
      document.ruleSets.delete(id);
    }
    this.dispatchEventToListeners("ModelUpdated" /* MODEL_UPDATED */);
  }
  onPreloadingAttemptSourcesUpdated(event) {
    const loaderId = event.loaderId;
    this.ensureDocumentPreloadingData(loaderId);
    const document = this.documents.get(loaderId);
    if (document === void 0) {
      return;
    }
    document.sources.update(event.preloadingAttemptSources);
    document.preloadingAttempts.maybeRegisterNotTriggered(document.sources);
    document.preloadingAttempts.cleanUpRemovedAttempts(document.sources);
    this.dispatchEventToListeners("ModelUpdated" /* MODEL_UPDATED */);
  }
  onPrefetchStatusUpdated(event) {
    if (event.prefetchStatus === Protocol.Preload.PrefetchStatus.PrefetchEvictedAfterCandidateRemoved) {
      return;
    }
    const loaderId = event.key.loaderId;
    this.ensureDocumentPreloadingData(loaderId);
    const attempt = {
      action: Protocol.Preload.SpeculationAction.Prefetch,
      key: event.key,
      status: convertPreloadingStatus(event.status),
      prefetchStatus: event.prefetchStatus || null,
      requestId: event.requestId
    };
    this.documents.get(loaderId)?.preloadingAttempts.upsert(attempt);
    this.dispatchEventToListeners("ModelUpdated" /* MODEL_UPDATED */);
  }
  onPrerenderStatusUpdated(event) {
    const loaderId = event.key.loaderId;
    this.ensureDocumentPreloadingData(loaderId);
    const attempt = {
      action: Protocol.Preload.SpeculationAction.Prerender,
      key: event.key,
      status: convertPreloadingStatus(event.status),
      prerenderStatus: event.prerenderStatus || null,
      disallowedMojoInterface: event.disallowedMojoInterface || null,
      mismatchedHeaders: event.mismatchedHeaders || null
    };
    this.documents.get(loaderId)?.preloadingAttempts.upsert(attempt);
    this.dispatchEventToListeners("ModelUpdated" /* MODEL_UPDATED */);
  }
  onPreloadEnabledStateUpdated(event) {
    this.dispatchEventToListeners("WarningsUpdated" /* WARNINGS_UPDATED */, event);
  }
}
SDKModel.register(PreloadingModel, { capabilities: Capability.DOM, autostart: false });
export var Events = /* @__PURE__ */ ((Events2) => {
  Events2["MODEL_UPDATED"] = "ModelUpdated";
  Events2["WARNINGS_UPDATED"] = "WarningsUpdated";
  return Events2;
})(Events || {});
class PreloadDispatcher {
  model;
  constructor(model) {
    this.model = model;
  }
  ruleSetUpdated(event) {
    this.model.onRuleSetUpdated(event);
  }
  ruleSetRemoved(event) {
    this.model.onRuleSetRemoved(event);
  }
  preloadingAttemptSourcesUpdated(event) {
    this.model.onPreloadingAttemptSourcesUpdated(event);
  }
  prefetchStatusUpdated(event) {
    this.model.onPrefetchStatusUpdated(event);
  }
  prerenderStatusUpdated(event) {
    this.model.onPrerenderStatusUpdated(event);
  }
  preloadEnabledStateUpdated(event) {
    void this.model.onPreloadEnabledStateUpdated(event);
  }
}
class DocumentPreloadingData {
  ruleSets = new RuleSetRegistry();
  preloadingAttempts = new PreloadingAttemptRegistry();
  sources = new SourceRegistry();
  mergePrevious(prev) {
    if (!this.ruleSets.isEmpty() || !this.sources.isEmpty()) {
      throw new Error("unreachable");
    }
    this.ruleSets = prev.ruleSets;
    this.preloadingAttempts.mergePrevious(prev.preloadingAttempts);
    this.sources = prev.sources;
  }
}
class RuleSetRegistry {
  map = /* @__PURE__ */ new Map();
  isEmpty() {
    return this.map.size === 0;
  }
  // Returns reference. Don't save returned values.
  // Returned values may or may not be updated as the time grows.
  getById(id) {
    return this.map.get(id) || null;
  }
  // Returns reference. Don't save returned values.
  // Returned values may or may not be updated as the time grows.
  getAll() {
    return Array.from(this.map.entries()).map(([id, value]) => ({ id, value }));
  }
  upsert(ruleSet) {
    this.map.set(ruleSet.id, ruleSet);
  }
  delete(id) {
    this.map.delete(id);
  }
}
export var PreloadingStatus = /* @__PURE__ */ ((PreloadingStatus2) => {
  PreloadingStatus2["NOT_TRIGGERED"] = "NotTriggered";
  PreloadingStatus2["PENDING"] = "Pending";
  PreloadingStatus2["RUNNING"] = "Running";
  PreloadingStatus2["READY"] = "Ready";
  PreloadingStatus2["SUCCESS"] = "Success";
  PreloadingStatus2["FAILURE"] = "Failure";
  PreloadingStatus2["NOT_SUPPORTED"] = "NotSupported";
  return PreloadingStatus2;
})(PreloadingStatus || {});
function convertPreloadingStatus(status) {
  switch (status) {
    case Protocol.Preload.PreloadingStatus.Pending:
      return "Pending" /* PENDING */;
    case Protocol.Preload.PreloadingStatus.Running:
      return "Running" /* RUNNING */;
    case Protocol.Preload.PreloadingStatus.Ready:
      return "Ready" /* READY */;
    case Protocol.Preload.PreloadingStatus.Success:
      return "Success" /* SUCCESS */;
    case Protocol.Preload.PreloadingStatus.Failure:
      return "Failure" /* FAILURE */;
    case Protocol.Preload.PreloadingStatus.NotSupported:
      return "NotSupported" /* NOT_SUPPORTED */;
  }
  throw new Error("unreachable");
}
function makePreloadingAttemptId(key) {
  let action;
  switch (key.action) {
    case Protocol.Preload.SpeculationAction.Prefetch:
      action = "Prefetch";
      break;
    case Protocol.Preload.SpeculationAction.Prerender:
      action = "Prerender";
      break;
  }
  let targetHint;
  switch (key.targetHint) {
    case void 0:
      targetHint = "undefined";
      break;
    case Protocol.Preload.SpeculationTargetHint.Blank:
      targetHint = "Blank";
      break;
    case Protocol.Preload.SpeculationTargetHint.Self:
      targetHint = "Self";
      break;
  }
  return `${key.loaderId}:${action}:${key.url}:${targetHint}`;
}
class PreloadingAttemptRegistry {
  map = /* @__PURE__ */ new Map();
  enrich(attempt, source) {
    let ruleSetIds = [];
    let nodeIds = [];
    if (source !== null) {
      ruleSetIds = source.ruleSetIds;
      nodeIds = source.nodeIds;
    }
    return {
      ...attempt,
      ruleSetIds,
      nodeIds
    };
  }
  // Returns reference. Don't save returned values.
  // Returned values may or may not be updated as the time grows.
  getById(id, sources) {
    const attempt = this.map.get(id) || null;
    if (attempt === null) {
      return null;
    }
    return this.enrich(attempt, sources.getById(id));
  }
  // Returs preloading attempts that triggered by the rule set with `ruleSetId`.
  // `ruleSetId === null` means "do not filter".
  //
  // Returns reference. Don't save returned values.
  // Returned values may or may not be updated as the time grows.
  getAll(ruleSetId, sources) {
    return [...this.map.entries()].map(([id, value]) => ({ id, value: this.enrich(value, sources.getById(id)) })).filter(({ value }) => !ruleSetId || value.ruleSetIds.includes(ruleSetId));
  }
  upsert(attempt) {
    const id = makePreloadingAttemptId(attempt.key);
    this.map.set(id, attempt);
  }
  // Speculation rules emits a CDP event Preload.preloadingAttemptSourcesUpdated
  // and an IPC SpeculationHost::UpdateSpeculationCandidates. The latter emits
  // Preload.prefetch/prerenderAttemptUpdated for each preload attempt triggered.
  // In general, "Not triggered to triggered" period is short (resp. long) for
  // eager (resp. non-eager) preloads. For not yet emitted ones, we fill
  // "Not triggered" preload attempts and show them.
  maybeRegisterNotTriggered(sources) {
    for (const [id, { key }] of sources.entries()) {
      if (this.map.get(id) !== void 0) {
        continue;
      }
      let attempt;
      switch (key.action) {
        case Protocol.Preload.SpeculationAction.Prefetch:
          attempt = {
            action: Protocol.Preload.SpeculationAction.Prefetch,
            key,
            status: "NotTriggered" /* NOT_TRIGGERED */,
            prefetchStatus: null,
            // Fill invalid request id.
            requestId: ""
          };
          break;
        case Protocol.Preload.SpeculationAction.Prerender:
          attempt = {
            action: Protocol.Preload.SpeculationAction.Prerender,
            key,
            status: "NotTriggered" /* NOT_TRIGGERED */,
            prerenderStatus: null,
            disallowedMojoInterface: null,
            mismatchedHeaders: null
          };
          break;
      }
      this.map.set(id, attempt);
    }
  }
  // Removes keys in `this.map` that are not in `sources`. This is used to
  // remove attempts that no longer have a matching speculation rule.
  cleanUpRemovedAttempts(sources) {
    const keysToRemove = Array.from(this.map.keys()).filter((key) => !sources.getById(key));
    for (const key of keysToRemove) {
      this.map.delete(key);
    }
  }
  mergePrevious(prev) {
    for (const [id, attempt] of this.map.entries()) {
      prev.map.set(id, attempt);
    }
    this.map = prev.map;
  }
}
class SourceRegistry {
  map = /* @__PURE__ */ new Map();
  entries() {
    return this.map.entries();
  }
  isEmpty() {
    return this.map.size === 0;
  }
  getById(id) {
    return this.map.get(id) || null;
  }
  update(sources) {
    this.map = new Map(sources.map((s) => [makePreloadingAttemptId(s.key), s]));
  }
}
//# sourceMappingURL=PreloadingModel.js.map

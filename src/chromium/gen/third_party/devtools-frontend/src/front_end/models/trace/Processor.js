"use strict";
import * as Handlers from "./handlers/handlers.js";
import * as Helpers from "./helpers/helpers.js";
import * as Insights from "./insights/insights.js";
import * as Lantern from "./lantern/lantern.js";
import * as LanternComputationData from "./LanternComputationData.js";
import * as Types from "./types/types.js";
var Status = /* @__PURE__ */ ((Status2) => {
  Status2["IDLE"] = "IDLE";
  Status2["PARSING"] = "PARSING";
  Status2["FINISHED_PARSING"] = "FINISHED_PARSING";
  Status2["ERRORED_WHILE_PARSING"] = "ERRORED_WHILE_PARSING";
  return Status2;
})(Status || {});
export class TraceParseProgressEvent extends Event {
  constructor(data, init = { bubbles: true }) {
    super(TraceParseProgressEvent.eventName, init);
    this.data = data;
  }
  static eventName = "traceparseprogress";
}
var ProgressPhase = /* @__PURE__ */ ((ProgressPhase2) => {
  ProgressPhase2[ProgressPhase2["HANDLE_EVENT"] = 0.2] = "HANDLE_EVENT";
  ProgressPhase2[ProgressPhase2["FINALIZE"] = 0.8] = "FINALIZE";
  ProgressPhase2[ProgressPhase2["CLONE"] = 1] = "CLONE";
  return ProgressPhase2;
})(ProgressPhase || {});
function calculateProgress(value, phase) {
  if (phase === 0.8 /* FINALIZE */) {
    return value * (0.8 /* FINALIZE */ - 0.2 /* HANDLE_EVENT */) + 0.2 /* HANDLE_EVENT */;
  }
  return value * phase;
}
export class TraceProcessor extends EventTarget {
  // We force the Meta handler to be enabled, so the TraceHandlers type here is
  // the model handlers the user passes in and the Meta handler.
  #traceHandlers;
  #status = "IDLE" /* IDLE */;
  #modelConfiguration = Types.Configuration.defaults();
  #data = null;
  #insights = null;
  static createWithAllHandlers() {
    return new TraceProcessor(Handlers.ModelHandlers, Types.Configuration.defaults());
  }
  static getEnabledInsightRunners(parsedTrace) {
    const enabledInsights = {};
    for (const [name, insight] of Object.entries(Insights.Models)) {
      const deps = insight.deps();
      if (deps.some((dep) => !parsedTrace[dep])) {
        continue;
      }
      Object.assign(enabledInsights, { [name]: insight });
    }
    return enabledInsights;
  }
  constructor(traceHandlers, modelConfiguration) {
    super();
    this.#verifyHandlers(traceHandlers);
    this.#traceHandlers = {
      Meta: Handlers.ModelHandlers.Meta,
      ...traceHandlers
    };
    if (modelConfiguration) {
      this.#modelConfiguration = modelConfiguration;
    }
    this.#passConfigToHandlers();
  }
  #passConfigToHandlers() {
    for (const handler of Object.values(this.#traceHandlers)) {
      if ("handleUserConfig" in handler && handler.handleUserConfig) {
        handler.handleUserConfig(this.#modelConfiguration);
      }
    }
  }
  /**
   * When the user passes in a set of handlers, we want to ensure that we have all
   * the required handlers. Handlers can depend on other handlers, so if the user
   * passes in FooHandler which depends on BarHandler, they must also pass in
   * BarHandler too. This method verifies that all dependencies are met, and
   * throws if not.
   **/
  #verifyHandlers(providedHandlers) {
    if (Object.keys(providedHandlers).length === Object.keys(Handlers.ModelHandlers).length) {
      return;
    }
    const requiredHandlerKeys = /* @__PURE__ */ new Set();
    for (const [handlerName, handler] of Object.entries(providedHandlers)) {
      requiredHandlerKeys.add(handlerName);
      const deps = "deps" in handler ? handler.deps() : [];
      for (const depName of deps) {
        requiredHandlerKeys.add(depName);
      }
    }
    const providedHandlerKeys = new Set(Object.keys(providedHandlers));
    requiredHandlerKeys.delete("Meta");
    for (const requiredKey of requiredHandlerKeys) {
      if (!providedHandlerKeys.has(requiredKey)) {
        throw new Error(`Required handler ${requiredKey} not provided.`);
      }
    }
  }
  reset() {
    if (this.#status === "PARSING" /* PARSING */) {
      throw new Error("Trace processor can't reset while parsing.");
    }
    const handlers = Object.values(this.#traceHandlers);
    for (const handler of handlers) {
      handler.reset();
    }
    this.#data = null;
    this.#insights = null;
    this.#status = "IDLE" /* IDLE */;
  }
  async parse(traceEvents, options) {
    if (this.#status !== "IDLE" /* IDLE */) {
      throw new Error(`Trace processor can't start parsing when not idle. Current state: ${this.#status}`);
    }
    try {
      this.#status = "PARSING" /* PARSING */;
      await this.#computeParsedTrace(traceEvents);
      if (this.#data && !options.isCPUProfile) {
        this.#computeInsights(this.#data, traceEvents);
      }
      this.#status = "FINISHED_PARSING" /* FINISHED_PARSING */;
    } catch (e) {
      this.#status = "ERRORED_WHILE_PARSING" /* ERRORED_WHILE_PARSING */;
      throw e;
    }
  }
  /**
   * Run all the handlers and set the result to `#data`.
   */
  async #computeParsedTrace(traceEvents) {
    const eventsPerChunk = 5e4;
    const sortedHandlers = [...sortHandlers(this.#traceHandlers).values()];
    for (const handler of sortedHandlers) {
      handler.reset();
    }
    for (let i = 0; i < traceEvents.length; ++i) {
      if (i % eventsPerChunk === 0 && i) {
        const percent = calculateProgress(i / traceEvents.length, 0.2 /* HANDLE_EVENT */);
        this.dispatchEvent(new TraceParseProgressEvent({ percent }));
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      const event = traceEvents[i];
      for (let j = 0; j < sortedHandlers.length; ++j) {
        sortedHandlers[j].handleEvent(event);
      }
    }
    for (const [i, handler] of sortedHandlers.entries()) {
      if (handler.finalize) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        await handler.finalize();
      }
      const percent = calculateProgress(i / sortedHandlers.length, 0.8 /* FINALIZE */);
      this.dispatchEvent(new TraceParseProgressEvent({ percent }));
    }
    const shallowClone = (value, recurse = true) => {
      if (value instanceof Map) {
        return new Map(value);
      }
      if (value instanceof Set) {
        return new Set(value);
      }
      if (Array.isArray(value)) {
        return [...value];
      }
      if (typeof value === "object" && value && recurse) {
        const obj = {};
        for (const [key, v] of Object.entries(value)) {
          obj[key] = shallowClone(v, false);
        }
        return obj;
      }
      return value;
    };
    const parsedTrace = {};
    for (const [name, handler] of Object.entries(this.#traceHandlers)) {
      const data = shallowClone(handler.data());
      Object.assign(parsedTrace, { [name]: data });
    }
    this.dispatchEvent(new TraceParseProgressEvent({ percent: 1 /* CLONE */ }));
    this.#data = parsedTrace;
  }
  get parsedTrace() {
    if (this.#status !== "FINISHED_PARSING" /* FINISHED_PARSING */) {
      return null;
    }
    return this.#data;
  }
  get insights() {
    if (this.#status !== "FINISHED_PARSING" /* FINISHED_PARSING */) {
      return null;
    }
    return this.#insights;
  }
  #createLanternContext(parsedTrace, traceEvents, frameId, navigationId) {
    if (!parsedTrace.NetworkRequests || !parsedTrace.Workers || !parsedTrace.PageLoadMetrics) {
      return;
    }
    if (!parsedTrace.NetworkRequests.byTime.length) {
      throw new Lantern.Core.LanternError("No network requests found in trace");
    }
    const navStarts = parsedTrace.Meta.navigationsByFrameId.get(frameId);
    const navStartIndex = navStarts?.findIndex((n) => n.args.data?.navigationId === navigationId);
    if (!navStarts || navStartIndex === void 0 || navStartIndex === -1) {
      throw new Lantern.Core.LanternError("Could not find navigation start");
    }
    const startTime = navStarts[navStartIndex].ts;
    const endTime = navStartIndex + 1 < navStarts.length ? navStarts[navStartIndex + 1].ts : Number.POSITIVE_INFINITY;
    const boundedTraceEvents = traceEvents.filter((e) => e.ts >= startTime && e.ts < endTime);
    const trace = {
      traceEvents: boundedTraceEvents
    };
    const requests = LanternComputationData.createNetworkRequests(trace, parsedTrace, startTime, endTime);
    const graph = LanternComputationData.createGraph(requests, trace, parsedTrace);
    const processedNavigation = LanternComputationData.createProcessedNavigation(parsedTrace, frameId, navigationId);
    const networkAnalysis = Lantern.Core.NetworkAnalyzer.analyze(requests);
    if (!networkAnalysis) {
      return;
    }
    const simulator = Lantern.Simulation.Simulator.createSimulator({
      // TODO(crbug.com/372674229): if devtools throttling was on, does this network analysis capture
      // that? Do we need to set 'devtools' throttlingMethod?
      networkAnalysis,
      throttlingMethod: "provided"
    });
    const computeData = { graph, simulator, processedNavigation };
    const fcpResult = Lantern.Metrics.FirstContentfulPaint.compute(computeData);
    const lcpResult = Lantern.Metrics.LargestContentfulPaint.compute(computeData, { fcpResult });
    const interactiveResult = Lantern.Metrics.Interactive.compute(computeData, { lcpResult });
    const tbtResult = Lantern.Metrics.TotalBlockingTime.compute(computeData, { fcpResult, interactiveResult });
    const metrics = {
      firstContentfulPaint: fcpResult,
      interactive: interactiveResult,
      largestContentfulPaint: lcpResult,
      totalBlockingTime: tbtResult
    };
    return { graph, simulator, metrics };
  }
  #computeInsightSets(insights, parsedTrace, insightRunners, context) {
    const model = {};
    for (const [name, insight] of Object.entries(insightRunners)) {
      let insightResult;
      try {
        insightResult = insight.generateInsight(parsedTrace, context);
      } catch (err) {
        insightResult = err;
      }
      Object.assign(model, { [name]: insightResult });
    }
    let id, urlString, navigation;
    if (context.navigation) {
      id = context.navigationId;
      urlString = context.navigation.args.data?.documentLoaderURL ?? parsedTrace.Meta.mainFrameURL;
      navigation = context.navigation;
    } else {
      id = Types.Events.NO_NAVIGATION;
      urlString = parsedTrace.Meta.mainFrameURL;
    }
    let url;
    try {
      url = new URL(urlString);
    } catch {
      return;
    }
    const insightSets = {
      id,
      url,
      navigation,
      frameId: context.frameId,
      bounds: context.bounds,
      model
    };
    insights.set(insightSets.id, insightSets);
  }
  /**
   * Run all the insights and set the result to `#insights`.
   */
  #computeInsights(parsedTrace, traceEvents) {
    this.#insights = /* @__PURE__ */ new Map();
    const enabledInsightRunners = TraceProcessor.getEnabledInsightRunners(parsedTrace);
    const navigations = parsedTrace.Meta.mainFrameNavigations.filter(
      (navigation) => navigation.args.frame && navigation.args.data?.navigationId
    );
    if (navigations.length) {
      const bounds = Helpers.Timing.traceWindowFromMicroSeconds(parsedTrace.Meta.traceBounds.min, navigations[0].ts);
      const threshold = Helpers.Timing.millisecondsToMicroseconds(50);
      if (bounds.range > threshold) {
        const context = {
          bounds,
          frameId: parsedTrace.Meta.mainFrameId
        };
        this.#computeInsightSets(this.#insights, parsedTrace, enabledInsightRunners, context);
      }
    } else {
      const context = {
        bounds: parsedTrace.Meta.traceBounds,
        frameId: parsedTrace.Meta.mainFrameId
      };
      this.#computeInsightSets(this.#insights, parsedTrace, enabledInsightRunners, context);
    }
    for (const [i, navigation] of navigations.entries()) {
      const frameId = navigation.args.frame;
      const navigationId = navigation.args.data?.navigationId;
      let lantern;
      try {
        lantern = this.#createLanternContext(parsedTrace, traceEvents, frameId, navigationId);
      } catch (e) {
        const expectedErrors = [
          "mainDocumentRequest not found",
          "missing metric scores for main frame",
          "missing metric: FCP",
          "missing metric: LCP",
          "No network requests found in trace",
          "Trace is too old"
        ];
        if (!(e instanceof Lantern.Core.LanternError)) {
          console.error(e);
        } else if (!expectedErrors.some((err) => e.message === err)) {
          console.error(e);
        }
      }
      const min = navigation.ts;
      const max = i + 1 < navigations.length ? navigations[i + 1].ts : parsedTrace.Meta.traceBounds.max;
      const bounds = Helpers.Timing.traceWindowFromMicroSeconds(min, max);
      const context = {
        bounds,
        frameId,
        navigation,
        navigationId,
        lantern
      };
      this.#computeInsightSets(this.#insights, parsedTrace, enabledInsightRunners, context);
    }
  }
}
export function sortHandlers(traceHandlers) {
  const sortedMap = /* @__PURE__ */ new Map();
  const visited = /* @__PURE__ */ new Set();
  const visitHandler = (handlerName) => {
    if (sortedMap.has(handlerName)) {
      return;
    }
    if (visited.has(handlerName)) {
      let stackPath = "";
      for (const handler2 of visited) {
        if (stackPath || handler2 === handlerName) {
          stackPath += `${handler2}->`;
        }
      }
      stackPath += handlerName;
      throw new Error(`Found dependency cycle in trace event handlers: ${stackPath}`);
    }
    visited.add(handlerName);
    const handler = traceHandlers[handlerName];
    if (!handler) {
      return;
    }
    const deps = handler.deps?.();
    if (deps) {
      deps.forEach(visitHandler);
    }
    sortedMap.set(handlerName, handler);
  };
  for (const handlerName of Object.keys(traceHandlers)) {
    visitHandler(handlerName);
  }
  return sortedMap;
}
//# sourceMappingURL=Processor.js.map

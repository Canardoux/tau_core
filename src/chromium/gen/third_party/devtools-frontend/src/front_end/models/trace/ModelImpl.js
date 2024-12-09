"use strict";
import * as Platform from "../../core/platform/platform.js";
import * as Handlers from "./handlers/handlers.js";
import * as Helpers from "./helpers/helpers.js";
import { TraceParseProgressEvent, TraceProcessor } from "./Processor.js";
import * as Types from "./types/types.js";
export class Model extends EventTarget {
  #traces = [];
  #syntheticEventsManagerByTrace = [];
  #nextNumberByDomain = /* @__PURE__ */ new Map();
  #recordingsAvailable = [];
  #lastRecordingIndex = 0;
  #processor;
  #config = Types.Configuration.defaults();
  static createWithAllHandlers(config) {
    return new Model(Handlers.ModelHandlers, config);
  }
  /**
   * Runs only the provided handlers.
   *
   * Callers must ensure they are providing all dependant handlers (although Meta is included automatically),
   * and must know that the result of `.parsedTrace` will be limited to the handlers provided, even though
   * the type won't reflect that.
   */
  static createWithSubsetOfHandlers(traceHandlers, config) {
    return new Model(traceHandlers, config);
  }
  constructor(handlers, config) {
    super();
    if (config) {
      this.#config = config;
    }
    this.#processor = new TraceProcessor(handlers, this.#config);
  }
  /**
   * Parses an array of trace events into a structured object containing all the
   * information parsed by the trace handlers.
   * You can `await` this function to pause execution until parsing is complete,
   * or instead rely on the `ModuleUpdateEvent` that is dispatched when the
   * parsing is finished.
   *
   * Once parsed, you then have to call the `parsedTrace` method, providing an
   * index of the trace you want to have the data for. This is because any model
   * can store a number of traces. Each trace is given an index, which starts at 0
   * and increments by one as a new trace is parsed.
   *
   * @example
   * // Awaiting the parse method() to block until parsing complete
   * await this.traceModel.parse(events);
   * const data = this.traceModel.parsedTrace(0)
   *
   * @example
   * // Using an event listener to be notified when tracing is complete.
   * this.traceModel.addEventListener(Trace.ModelUpdateEvent.eventName, (event) => {
   *   if(event.data.data === 'done') {
   *     // trace complete
   *     const data = this.traceModel.parsedTrace(0);
   *   }
   * });
   * void this.traceModel.parse(events);
   **/
  async parse(traceEvents, config) {
    const metadata = config?.metadata || {};
    const isFreshRecording = config?.isFreshRecording || false;
    const isCPUProfile = metadata?.dataOrigin === Types.File.DataOrigin.CPU_PROFILE;
    const onTraceUpdate = (event) => {
      const { data } = event;
      this.dispatchEvent(new ModelUpdateEvent({ type: "PROGRESS_UPDATE" /* PROGRESS_UPDATE */, data }));
    };
    this.#processor.addEventListener(TraceParseProgressEvent.eventName, onTraceUpdate);
    const file = {
      traceEvents,
      metadata,
      parsedTrace: null,
      traceInsights: null
    };
    try {
      const syntheticEventsManager = Helpers.SyntheticEvents.SyntheticEventsManager.createAndActivate(traceEvents);
      await this.#processor.parse(traceEvents, {
        isFreshRecording,
        isCPUProfile
      });
      this.#storeParsedFileData(file, this.#processor.parsedTrace, this.#processor.insights);
      this.#traces.push(file);
      this.#syntheticEventsManagerByTrace.push(syntheticEventsManager);
    } catch (e) {
      throw e;
    } finally {
      this.#processor.removeEventListener(TraceParseProgressEvent.eventName, onTraceUpdate);
      this.dispatchEvent(new ModelUpdateEvent({ type: "COMPLETE" /* COMPLETE */, data: "done" }));
    }
  }
  #storeParsedFileData(file, data, insights) {
    file.parsedTrace = data;
    file.traceInsights = insights;
    this.#lastRecordingIndex++;
    let recordingName = `Trace ${this.#lastRecordingIndex}`;
    let origin = null;
    if (file.parsedTrace) {
      origin = Helpers.Trace.extractOriginFromTrace(file.parsedTrace.Meta.mainFrameURL);
      if (origin) {
        const nextSequenceForDomain = Platform.MapUtilities.getWithDefault(this.#nextNumberByDomain, origin, () => 1);
        recordingName = `${origin} (${nextSequenceForDomain})`;
        this.#nextNumberByDomain.set(origin, nextSequenceForDomain + 1);
      }
    }
    this.#recordingsAvailable.push(recordingName);
  }
  lastTraceIndex() {
    return this.size() - 1;
  }
  /**
   * Returns the parsed trace data indexed by the order in which it was stored.
   * If no index is given, the last stored parsed data is returned.
   */
  parsedTrace(index = this.#traces.length - 1) {
    return this.#traces.at(index)?.parsedTrace ?? null;
  }
  traceInsights(index = this.#traces.length - 1) {
    return this.#traces.at(index)?.traceInsights ?? null;
  }
  metadata(index = this.#traces.length - 1) {
    return this.#traces.at(index)?.metadata ?? null;
  }
  overrideModifications(index, newModifications) {
    if (this.#traces[index]) {
      this.#traces[index].metadata.modifications = newModifications;
    }
  }
  rawTraceEvents(index = this.#traces.length - 1) {
    return this.#traces.at(index)?.traceEvents ?? null;
  }
  syntheticTraceEventsManager(index = this.#traces.length - 1) {
    return this.#syntheticEventsManagerByTrace.at(index) ?? null;
  }
  size() {
    return this.#traces.length;
  }
  deleteTraceByIndex(recordingIndex) {
    this.#traces.splice(recordingIndex, 1);
    this.#recordingsAvailable.splice(recordingIndex, 1);
  }
  getRecordingsAvailable() {
    return this.#recordingsAvailable;
  }
  resetProcessor() {
    this.#processor.reset();
  }
}
export var ModelUpdateType = /* @__PURE__ */ ((ModelUpdateType2) => {
  ModelUpdateType2["COMPLETE"] = "COMPLETE";
  ModelUpdateType2["PROGRESS_UPDATE"] = "PROGRESS_UPDATE";
  return ModelUpdateType2;
})(ModelUpdateType || {});
export class ModelUpdateEvent extends Event {
  constructor(data) {
    super(ModelUpdateEvent.eventName);
    this.data = data;
  }
  static eventName = "modelupdate";
}
export function isModelUpdateDataComplete(eventData) {
  return eventData.type === "COMPLETE" /* COMPLETE */;
}
export function isModelUpdateDataProgress(eventData) {
  return eventData.type === "PROGRESS_UPDATE" /* PROGRESS_UPDATE */;
}
//# sourceMappingURL=ModelImpl.js.map

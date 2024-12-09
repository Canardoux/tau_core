"use strict";
import * as Platform from "../../../core/platform/platform.js";
import * as Helpers from "../helpers/helpers.js";
import * as Types from "../types/types.js";
import { data as auctionWorkletsData } from "./AuctionWorkletsHandler.js";
import { data as metaHandlerData } from "./MetaHandler.js";
import { data as samplesHandlerData } from "./SamplesHandler.js";
const processes = /* @__PURE__ */ new Map();
const compositorTileWorkers = Array();
const entryToNode = /* @__PURE__ */ new Map();
let allTraceEntries = [];
const completeEventStack = [];
let config = Types.Configuration.defaults();
const makeRendererProcess = () => ({
  url: null,
  isOnMainFrame: false,
  threads: /* @__PURE__ */ new Map()
});
const makeRendererThread = () => ({
  name: null,
  entries: [],
  profileCalls: []
});
const getOrCreateRendererProcess = (processes2, pid) => {
  return Platform.MapUtilities.getWithDefault(processes2, pid, makeRendererProcess);
};
const getOrCreateRendererThread = (process, tid) => {
  return Platform.MapUtilities.getWithDefault(process.threads, tid, makeRendererThread);
};
export function handleUserConfig(userConfig) {
  config = userConfig;
}
export function reset() {
  processes.clear();
  entryToNode.clear();
  allTraceEntries.length = 0;
  completeEventStack.length = 0;
  compositorTileWorkers.length = 0;
}
export function handleEvent(event) {
  if (Types.Events.isThreadName(event) && event.args.name?.startsWith("CompositorTileWorker")) {
    compositorTileWorkers.push({
      pid: event.pid,
      tid: event.tid
    });
  }
  if (Types.Events.isBegin(event) || Types.Events.isEnd(event)) {
    const process = getOrCreateRendererProcess(processes, event.pid);
    const thread = getOrCreateRendererThread(process, event.tid);
    const completeEvent = makeCompleteEvent(event);
    if (!completeEvent) {
      return;
    }
    thread.entries.push(completeEvent);
    allTraceEntries.push(completeEvent);
    return;
  }
  if (Types.Events.isInstant(event) || Types.Events.isComplete(event)) {
    const process = getOrCreateRendererProcess(processes, event.pid);
    const thread = getOrCreateRendererThread(process, event.tid);
    thread.entries.push(event);
    allTraceEntries.push(event);
  }
}
export async function finalize() {
  const { mainFrameId, rendererProcessesByFrame, threadsInProcess } = metaHandlerData();
  assignMeta(processes, mainFrameId, rendererProcessesByFrame, threadsInProcess);
  sanitizeProcesses(processes);
  buildHierarchy(processes);
  sanitizeThreads(processes);
  Helpers.Trace.sortTraceEventsInPlace(allTraceEntries);
}
export function data() {
  return {
    processes: new Map(processes),
    compositorTileWorkers: new Map(gatherCompositorThreads()),
    entryToNode: new Map(entryToNode),
    allTraceEntries: [...allTraceEntries]
  };
}
function gatherCompositorThreads() {
  const threadsByProcess = /* @__PURE__ */ new Map();
  for (const worker of compositorTileWorkers) {
    const byProcess = threadsByProcess.get(worker.pid) || [];
    byProcess.push(worker.tid);
    threadsByProcess.set(worker.pid, byProcess);
  }
  return threadsByProcess;
}
export function assignMeta(processes2, mainFrameId, rendererProcessesByFrame, threadsInProcess) {
  assignOrigin(processes2, rendererProcessesByFrame);
  assignIsMainFrame(processes2, mainFrameId, rendererProcessesByFrame);
  assignThreadName(processes2, rendererProcessesByFrame, threadsInProcess);
}
export function assignOrigin(processes2, rendererProcessesByFrame) {
  for (const renderProcessesByPid of rendererProcessesByFrame.values()) {
    for (const [pid, processWindows] of renderProcessesByPid) {
      for (const processInfo of processWindows.flat()) {
        const process = getOrCreateRendererProcess(processes2, pid);
        if (process.url === null || process.url === "about:blank") {
          try {
            new URL(processInfo.frame.url);
            process.url = processInfo.frame.url;
          } catch (e) {
            process.url = null;
          }
        }
      }
    }
  }
}
export function assignIsMainFrame(processes2, mainFrameId, rendererProcessesByFrame) {
  for (const [frameId, renderProcessesByPid] of rendererProcessesByFrame) {
    for (const [pid] of renderProcessesByPid) {
      const process = getOrCreateRendererProcess(processes2, pid);
      if (frameId === mainFrameId) {
        process.isOnMainFrame = true;
      }
    }
  }
}
export function assignThreadName(processes2, rendererProcessesByFrame, threadsInProcess) {
  for (const [pid, process] of processes2) {
    for (const [tid, threadInfo] of threadsInProcess.get(pid) ?? []) {
      const thread = getOrCreateRendererThread(process, tid);
      thread.name = threadInfo?.args.name ?? `${tid}`;
    }
  }
}
export function sanitizeProcesses(processes2) {
  const auctionWorklets = auctionWorkletsData().worklets;
  const metaData = metaHandlerData();
  if (metaData.traceIsGeneric) {
    return;
  }
  for (const [pid, process] of processes2) {
    if (process.url === null) {
      const maybeWorklet = auctionWorklets.get(pid);
      if (maybeWorklet) {
        process.url = maybeWorklet.host;
      } else {
        processes2.delete(pid);
      }
      continue;
    }
  }
}
export function sanitizeThreads(processes2) {
  for (const [, process] of processes2) {
    for (const [tid, thread] of process.threads) {
      if (!thread.tree?.roots.size) {
        process.threads.delete(tid);
      }
    }
  }
}
export function buildHierarchy(processes2, options) {
  const samplesData = samplesHandlerData();
  for (const [pid, process] of processes2) {
    for (const [tid, thread] of process.threads) {
      if (!thread.entries.length) {
        thread.tree = Helpers.TreeHelpers.makeEmptyTraceEntryTree();
        continue;
      }
      Helpers.Trace.sortTraceEventsInPlace(thread.entries);
      const samplesDataForThread = samplesData.profilesInProcess.get(pid)?.get(tid);
      if (samplesDataForThread) {
        const cpuProfile = samplesDataForThread.parsedProfile;
        const samplesIntegrator = cpuProfile && new Helpers.SamplesIntegrator.SamplesIntegrator(
          cpuProfile,
          samplesDataForThread.profileId,
          pid,
          tid,
          config
        );
        const profileCalls = samplesIntegrator?.buildProfileCalls(thread.entries);
        if (samplesIntegrator && profileCalls) {
          allTraceEntries = [...allTraceEntries, ...profileCalls];
          thread.entries = Helpers.Trace.mergeEventsInOrder(thread.entries, profileCalls);
          thread.profileCalls = profileCalls;
          const jsSamples = samplesIntegrator.jsSampleEvents;
          if (jsSamples) {
            allTraceEntries = [...allTraceEntries, ...jsSamples];
            thread.entries = Helpers.Trace.mergeEventsInOrder(thread.entries, jsSamples);
          }
        }
      }
      const treeData = Helpers.TreeHelpers.treify(thread.entries, options);
      thread.tree = treeData.tree;
      for (const [entry, node] of treeData.entryToNode) {
        entryToNode.set(entry, node);
      }
    }
  }
}
export function makeCompleteEvent(event) {
  if (Types.Events.isEnd(event)) {
    const beginEvent = completeEventStack.pop();
    if (!beginEvent) {
      return null;
    }
    if (beginEvent.name !== event.name || beginEvent.cat !== event.cat) {
      console.error(
        "Begin/End events mismatch at " + beginEvent.ts + " (" + beginEvent.name + ") vs. " + event.ts + " (" + event.name + ")"
      );
      return null;
    }
    beginEvent.dur = Types.Timing.MicroSeconds(event.ts - beginEvent.ts);
    return null;
  }
  const syntheticComplete = {
    ...event,
    ph: Types.Events.Phase.COMPLETE,
    dur: Types.Timing.MicroSeconds(0)
  };
  completeEventStack.push(syntheticComplete);
  return syntheticComplete;
}
export function deps() {
  return ["Meta", "Samples", "AuctionWorklets"];
}
//# sourceMappingURL=RendererHandler.js.map

"use strict";
import * as Platform from "../../../core/platform/platform.js";
import * as CPUProfile from "../../cpu_profile/cpu_profile.js";
import * as Helpers from "../helpers/helpers.js";
import * as Types from "../types/types.js";
const events = /* @__PURE__ */ new Map();
const profilesInProcess = /* @__PURE__ */ new Map();
const entryToNode = /* @__PURE__ */ new Map();
const preprocessedData = /* @__PURE__ */ new Map();
function buildProfileCalls() {
  for (const [processId, profiles] of preprocessedData) {
    for (const [profileId, preProcessedData] of profiles) {
      let openFrameCallback2 = function(depth, node, sampleIndex, timeStampMilliseconds) {
        if (threadId === void 0) {
          return;
        }
        const ts = Helpers.Timing.millisecondsToMicroseconds(Types.Timing.MilliSeconds(timeStampMilliseconds));
        const nodeId = node.id;
        const profileCall = Helpers.Trace.makeProfileCall(node, profileId, sampleIndex, ts, processId, threadId);
        finalizedData.profileCalls.push(profileCall);
        indexStack.push(finalizedData.profileCalls.length - 1);
        const traceEntryNode = Helpers.TreeHelpers.makeEmptyTraceEntryNode(profileCall, nodeId);
        entryToNode.set(profileCall, traceEntryNode);
        traceEntryNode.depth = depth;
        if (indexStack.length === 1) {
          finalizedData.profileTree?.roots.add(traceEntryNode);
        }
      }, closeFrameCallback2 = function(_depth, _node, _sampleIndex, _timeStampMillis, durMs, selfTimeMs) {
        const profileCallIndex = indexStack.pop();
        const profileCall = profileCallIndex !== void 0 && finalizedData.profileCalls[profileCallIndex];
        if (!profileCall) {
          return;
        }
        const { callFrame, ts, pid, tid } = profileCall;
        const traceEntryNode = entryToNode.get(profileCall);
        if (callFrame === void 0 || ts === void 0 || pid === void 0 || profileId === void 0 || tid === void 0 || traceEntryNode === void 0) {
          return;
        }
        const dur = Helpers.Timing.millisecondsToMicroseconds(Types.Timing.MilliSeconds(durMs));
        const selfTime = Helpers.Timing.millisecondsToMicroseconds(Types.Timing.MilliSeconds(selfTimeMs));
        profileCall.dur = dur;
        traceEntryNode.selfTime = selfTime;
        const parentIndex = indexStack.at(-1);
        const parent = parentIndex !== void 0 && finalizedData.profileCalls.at(parentIndex);
        const parentNode = parent && entryToNode.get(parent);
        if (!parentNode) {
          return;
        }
        traceEntryNode.parent = parentNode;
        parentNode.children.push(traceEntryNode);
      };
      var openFrameCallback = openFrameCallback2, closeFrameCallback = closeFrameCallback2;
      const threadId = preProcessedData.threadId;
      if (!preProcessedData.rawProfile.nodes.length || threadId === void 0) {
        continue;
      }
      const indexStack = [];
      const profileModel = new CPUProfile.CPUProfileDataModel.CPUProfileDataModel(preProcessedData.rawProfile);
      const profileTree = Helpers.TreeHelpers.makeEmptyTraceEntryTree();
      profileTree.maxDepth = profileModel.maxDepth;
      const finalizedData = {
        rawProfile: preProcessedData.rawProfile,
        parsedProfile: profileModel,
        profileCalls: [],
        profileTree,
        profileId
      };
      const dataByThread = Platform.MapUtilities.getWithDefault(profilesInProcess, processId, () => /* @__PURE__ */ new Map());
      profileModel.forEachFrame(openFrameCallback2, closeFrameCallback2);
      dataByThread.set(threadId, finalizedData);
    }
  }
}
export function reset() {
  events.clear();
  preprocessedData.clear();
  profilesInProcess.clear();
  entryToNode.clear();
}
export function handleEvent(event) {
  if (Types.Events.isSyntheticCpuProfile(event)) {
    const pid = event.pid;
    const tid = event.tid;
    const profileId = "0x1";
    const profileData = getOrCreatePreProcessedData(pid, profileId);
    profileData.rawProfile = event.args.data.cpuProfile;
    profileData.threadId = tid;
    return;
  }
  if (Types.Events.isProfile(event)) {
    const profileData = getOrCreatePreProcessedData(event.pid, event.id);
    profileData.rawProfile.startTime = event.ts;
    profileData.threadId = event.tid;
    return;
  }
  if (Types.Events.isProfileChunk(event)) {
    const profileData = getOrCreatePreProcessedData(event.pid, event.id);
    const cdpProfile = profileData.rawProfile;
    const nodesAndSamples = event.args?.data?.cpuProfile || { samples: [] };
    const samples = nodesAndSamples?.samples || [];
    const nodes = [];
    for (const n of nodesAndSamples?.nodes || []) {
      const lineNumber = typeof n.callFrame.lineNumber === "undefined" ? -1 : n.callFrame.lineNumber;
      const columnNumber = typeof n.callFrame.columnNumber === "undefined" ? -1 : n.callFrame.columnNumber;
      const scriptId = String(n.callFrame.scriptId);
      const url = n.callFrame.url || "";
      const node = {
        ...n,
        callFrame: {
          ...n.callFrame,
          url,
          lineNumber,
          columnNumber,
          scriptId
        }
      };
      nodes.push(node);
    }
    const timeDeltas = event.args.data?.timeDeltas || [];
    const lines = event.args.data?.lines || Array(samples.length).fill(0);
    cdpProfile.nodes.push(...nodes);
    cdpProfile.samples?.push(...samples);
    cdpProfile.timeDeltas?.push(...timeDeltas);
    cdpProfile.lines?.push(...lines);
    if (cdpProfile.samples && cdpProfile.timeDeltas && cdpProfile.samples.length !== cdpProfile.timeDeltas.length) {
      console.error("Failed to parse CPU profile.");
      return;
    }
    if (!cdpProfile.endTime && cdpProfile.timeDeltas) {
      const timeDeltas2 = cdpProfile.timeDeltas;
      cdpProfile.endTime = timeDeltas2.reduce((x, y) => x + y, cdpProfile.startTime);
    }
    return;
  }
}
export async function finalize() {
  buildProfileCalls();
}
export function data() {
  return {
    profilesInProcess,
    entryToNode
  };
}
function getOrCreatePreProcessedData(processId, profileId) {
  const profileById = Platform.MapUtilities.getWithDefault(preprocessedData, processId, () => /* @__PURE__ */ new Map());
  return Platform.MapUtilities.getWithDefault(
    profileById,
    profileId,
    () => ({
      rawProfile: {
        startTime: 0,
        endTime: 0,
        nodes: [],
        samples: [],
        timeDeltas: [],
        lines: []
      },
      profileId
    })
  );
}
export function getProfileCallFunctionName(data2, entry) {
  const profile = data2.profilesInProcess.get(entry.pid)?.get(entry.tid);
  const node = profile?.parsedProfile.nodeById(entry.nodeId);
  if (node?.functionName) {
    return node.functionName;
  }
  return entry.callFrame.functionName;
}
//# sourceMappingURL=SamplesHandler.js.map

"use strict";
import * as Types from "../types/types.js";
import { data as flowsHandlerData } from "./FlowsHandler.js";
import { data as rendererHandlerData } from "./RendererHandler.js";
const schedulerToRunEntryPoints = /* @__PURE__ */ new Map();
const asyncCallToScheduler = /* @__PURE__ */ new Map();
export function reset() {
  schedulerToRunEntryPoints.clear();
  asyncCallToScheduler.clear();
}
export function handleEvent(_) {
}
export async function finalize() {
  const { flows } = flowsHandlerData();
  const { entryToNode } = rendererHandlerData();
  for (const flow of flows) {
    const asyncTaskScheduled = flow.at(0);
    if (!asyncTaskScheduled || !Types.Events.isDebuggerAsyncTaskScheduled(asyncTaskScheduled)) {
      continue;
    }
    const taskName = asyncTaskScheduled.args.taskName;
    const asyncTaskRun = flow.at(1);
    if (!asyncTaskRun || !Types.Events.isDebuggerAsyncTaskRun(asyncTaskRun)) {
      continue;
    }
    const asyncCaller = findNearestProfileCallAncestor(asyncTaskScheduled, entryToNode);
    if (!asyncCaller) {
      continue;
    }
    const asyncEntryPoints = findFirstJsInvocationsForAsyncTaskRun(asyncTaskRun, entryToNode);
    if (!asyncEntryPoints) {
      continue;
    }
    schedulerToRunEntryPoints.set(asyncCaller, asyncEntryPoints);
    const scheduledProfileCalls = findFirstJSCallsForAsyncTaskRun(asyncTaskRun, entryToNode);
    for (const call of scheduledProfileCalls) {
      asyncCallToScheduler.set(call, { taskName, scheduler: asyncCaller });
    }
  }
}
function findNearestProfileCallAncestor(asyncTaskScheduled, entryToNode) {
  let node = entryToNode.get(asyncTaskScheduled)?.parent;
  while (node) {
    if (Types.Events.isProfileCall(node.entry)) {
      return node.entry;
    }
    node = node.parent;
  }
  return null;
}
function acceptJSInvocationsPredicate(event) {
  return Types.Events.isJSInvocationEvent(event) && !event.name.startsWith("v8") && !event.name.startsWith("V8");
}
function findFirstJsInvocationsForAsyncTaskRun(asyncTaskRun, entryToNode) {
  return findFirstDescendantsOfType(
    asyncTaskRun,
    entryToNode,
    acceptJSInvocationsPredicate,
    Types.Events.isDebuggerAsyncTaskRun
  );
}
function findFirstJSCallsForAsyncTaskRun(asyncTaskRun, entryToNode) {
  return findFirstDescendantsOfType(
    asyncTaskRun,
    entryToNode,
    Types.Events.isProfileCall,
    Types.Events.isDebuggerAsyncTaskRun
  );
}
function findFirstDescendantsOfType(root, entryToNode, predicateAccept, predicateIgnore) {
  const node = entryToNode.get(root);
  if (!node) {
    return [];
  }
  const childrenGroups = [[...node.children]];
  const firstDescendants = [];
  for (let i = 0; i < childrenGroups.length; i++) {
    const siblings = childrenGroups[i];
    for (let j = 0; j < siblings.length; j++) {
      const node2 = siblings[j];
      if (predicateAccept(node2.entry)) {
        firstDescendants.push(node2.entry);
      } else if (!predicateIgnore(node2.entry)) {
        childrenGroups.push([...node2.children]);
      }
    }
  }
  return firstDescendants;
}
export function data() {
  return {
    schedulerToRunEntryPoints,
    asyncCallToScheduler
  };
}
export function deps() {
  return ["Renderer", "Flows"];
}
//# sourceMappingURL=AsyncJSCallsHandler.js.map

"use strict";
import * as Types from "../types/types.js";
import { eventIsInBounds, microSecondsToMilliseconds } from "./Timing.js";
let nodeIdCount = 0;
export const makeTraceEntryNodeId = () => ++nodeIdCount;
export const makeEmptyTraceEntryTree = () => ({
  roots: /* @__PURE__ */ new Set(),
  maxDepth: 0
});
export const makeEmptyTraceEntryNode = (entry, id) => ({
  entry,
  id,
  parent: null,
  children: [],
  depth: 0
});
export class AINode {
  constructor(event) {
    this.event = event;
    this.name = event.name;
    this.duration = event.dur === void 0 ? void 0 : microSecondsToMilliseconds(event.dur);
    if (Types.Events.isProfileCall(event)) {
      this.name = event.callFrame.functionName || "(anonymous)";
      this.url = event.callFrame.url;
    }
  }
  // event: Types.Events.Event; // Set in the constructor.
  name;
  duration;
  selfDuration;
  id;
  children;
  url;
  selected;
  // Manually handle how nodes in this tree are serialized. We'll drop serveral properties that we don't need in the JSON string.
  // FYI: toJSON() is invoked implicitly via JSON.stringify()
  toJSON() {
    return {
      selected: this.selected,
      name: this.name,
      url: this.url,
      // Round milliseconds because we don't need the precision
      dur: this.duration === void 0 ? void 0 : Math.round(this.duration * 10) / 10,
      self: this.selfDuration === void 0 ? void 0 : Math.round(this.selfDuration * 10) / 10,
      children: this.children?.length ? this.children : void 0
    };
  }
  static #fromTraceEvent(event) {
    return new AINode(event);
  }
  /**
   * Builds a TraceEntryNodeForAI tree from a node and marks the selected node. Primary entrypoint from EntriesFilter
   */
  static fromEntryNode(selectedNode, entryIsVisibleInTimeline) {
    function fromEntryNodeAndTree(node) {
      const aiNode2 = AINode.#fromTraceEvent(node.entry);
      aiNode2.id = node.id;
      if (node === selectedNode) {
        aiNode2.selected = true;
      }
      aiNode2.selfDuration = node.selfTime === void 0 ? void 0 : microSecondsToMilliseconds(node.selfTime);
      for (const child of node.children) {
        aiNode2.children ??= [];
        aiNode2.children.push(fromEntryNodeAndTree(child));
      }
      return aiNode2;
    }
    function findTopMostVisibleAncestor(node) {
      const parentNodes = [node];
      let parent = node.parent;
      while (parent) {
        parentNodes.unshift(parent);
        parent = parent.parent;
      }
      return parentNodes.find((node2) => entryIsVisibleInTimeline(node2.entry)) ?? node;
    }
    const topMostVisibleRoot = findTopMostVisibleAncestor(selectedNode);
    const aiNode = fromEntryNodeAndTree(topMostVisibleRoot);
    const [filteredAiNodeRoot] = AINode.#filterRecursive([aiNode], (node) => {
      if (node.event.name === "V8.CompileCode" || node.event.name === "UpdateCounters") {
        return false;
      }
      return entryIsVisibleInTimeline(node.event);
    });
    return filteredAiNodeRoot;
  }
  static getSelectedNodeWithinTree(node) {
    if (node.selected) {
      return node;
    }
    if (!node.children) {
      return null;
    }
    for (const child of node.children) {
      const returnedNode = AINode.getSelectedNodeWithinTree(child);
      if (returnedNode) {
        return returnedNode;
      }
    }
    return null;
  }
  static #filterRecursive(list, predicate) {
    let done;
    do {
      done = true;
      const filtered = [];
      for (const node of list) {
        if (predicate(node)) {
          filtered.push(node);
        } else if (node.children) {
          filtered.push(...node.children);
          done = false;
        }
      }
      list = filtered;
    } while (!done);
    for (const node of list) {
      if (node.children) {
        node.children = AINode.#filterRecursive(node.children, predicate);
      }
    }
    return list;
  }
  static #removeInexpensiveNodesRecursively(list, options) {
    const minDuration = options?.minDuration ?? 0;
    const minSelf = options?.minSelf ?? 0;
    const minJsDuration = options?.minJsDuration ?? 0;
    const minJsSelf = options?.minJsSelf ?? 0;
    const isJS = (node) => Boolean(node.url);
    const longEnough = (node) => node.duration === void 0 || node.duration >= (isJS(node) ? minJsDuration : minDuration);
    const selfLongEnough = (node) => node.selfDuration === void 0 || node.selfDuration >= (isJS(node) ? minJsSelf : minSelf);
    return AINode.#filterRecursive(list, (node) => longEnough(node) && selfLongEnough(node));
  }
  // Invoked from DrJonesPerformanceAgent
  sanitize() {
    if (this.children) {
      this.children = AINode.#removeInexpensiveNodesRecursively(this.children, {
        minDuration: Types.Timing.MilliSeconds(1),
        minJsDuration: Types.Timing.MilliSeconds(1),
        minJsSelf: Types.Timing.MilliSeconds(0.1)
      });
    }
  }
}
class TraceEntryNodeIdTag {
  /* eslint-disable-next-line no-unused-private-class-members */
  #tag;
}
export function treify(entries, options) {
  const entryToNode = /* @__PURE__ */ new Map();
  const stack = [];
  nodeIdCount = -1;
  const tree = makeEmptyTraceEntryTree();
  for (let i = 0; i < entries.length; i++) {
    const event = entries[i];
    if (options && !options.filter.has(event.name)) {
      continue;
    }
    const duration = event.dur || 0;
    const nodeId = makeTraceEntryNodeId();
    const node = makeEmptyTraceEntryNode(event, nodeId);
    if (stack.length === 0) {
      tree.roots.add(node);
      node.selfTime = Types.Timing.MicroSeconds(duration);
      stack.push(node);
      tree.maxDepth = Math.max(tree.maxDepth, stack.length);
      entryToNode.set(event, node);
      continue;
    }
    const parentNode = stack.at(-1);
    if (parentNode === void 0) {
      throw new Error("Impossible: no parent node found in the stack");
    }
    const parentEvent = parentNode.entry;
    const begin = event.ts;
    const parentBegin = parentEvent.ts;
    const parentDuration = parentEvent.dur || 0;
    const end = begin + duration;
    const parentEnd = parentBegin + parentDuration;
    const startsBeforeParent = begin < parentBegin;
    if (startsBeforeParent) {
      throw new Error("Impossible: current event starts before the parent event");
    }
    const startsAfterParent = begin >= parentEnd;
    if (startsAfterParent) {
      stack.pop();
      i--;
      nodeIdCount--;
      continue;
    }
    const endsAfterParent = end > parentEnd;
    if (endsAfterParent) {
      continue;
    }
    node.depth = stack.length;
    node.parent = parentNode;
    parentNode.children.push(node);
    node.selfTime = Types.Timing.MicroSeconds(duration);
    if (parentNode.selfTime !== void 0) {
      parentNode.selfTime = Types.Timing.MicroSeconds(parentNode.selfTime - (event.dur || 0));
    }
    stack.push(node);
    tree.maxDepth = Math.max(tree.maxDepth, stack.length);
    entryToNode.set(event, node);
  }
  return { tree, entryToNode };
}
export function walkTreeFromEntry(entryToNode, rootEntry, onEntryStart, onEntryEnd) {
  const startNode = entryToNode.get(rootEntry);
  if (!startNode) {
    return;
  }
  walkTreeByNode(entryToNode, startNode, onEntryStart, onEntryEnd);
}
export function walkEntireTree(entryToNode, tree, onEntryStart, onEntryEnd, traceWindowToInclude, minDuration) {
  for (const rootNode of tree.roots) {
    walkTreeByNode(entryToNode, rootNode, onEntryStart, onEntryEnd, traceWindowToInclude, minDuration);
  }
}
function walkTreeByNode(entryToNode, rootNode, onEntryStart, onEntryEnd, traceWindowToInclude, minDuration) {
  if (traceWindowToInclude && !treeNodeIsInWindow(rootNode, traceWindowToInclude)) {
    return;
  }
  if (typeof minDuration !== "undefined") {
    const duration = Types.Timing.MicroSeconds(
      rootNode.entry.ts + Types.Timing.MicroSeconds(rootNode.entry.dur ?? 0)
    );
    if (duration < minDuration) {
      return;
    }
  }
  onEntryStart(rootNode.entry);
  for (const child of rootNode.children) {
    walkTreeByNode(entryToNode, child, onEntryStart, onEntryEnd, traceWindowToInclude, minDuration);
  }
  onEntryEnd(rootNode.entry);
}
function treeNodeIsInWindow(node, traceWindow) {
  return eventIsInBounds(node.entry, traceWindow);
}
export function canBuildTreesFromEvents(events) {
  const stack = [];
  for (const event of events) {
    const startTime = event.ts;
    const endTime = event.ts + (event.dur ?? 0);
    let parent = stack.at(-1);
    if (parent === void 0) {
      stack.push(event);
      continue;
    }
    let parentEndTime = parent.ts + (parent.dur ?? 0);
    while (stack.length && startTime >= parentEndTime) {
      stack.pop();
      parent = stack.at(-1);
      if (parent === void 0) {
        break;
      }
      parentEndTime = parent.ts + (parent.dur ?? 0);
    }
    if (stack.length && endTime > parentEndTime) {
      return false;
    }
    stack.push(event);
  }
  return true;
}
//# sourceMappingURL=TreeHelpers.js.map

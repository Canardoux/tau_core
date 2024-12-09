"use strict";
import * as SDK from "../../../core/sdk/sdk.js";
import * as Types from "../types/types.js";
const domLookUpSingleNodeCache = /* @__PURE__ */ new Map();
const domLookUpBatchNodesCache = /* @__PURE__ */ new Map();
export function clearCacheForTesting() {
  domLookUpSingleNodeCache.clear();
  domLookUpBatchNodesCache.clear();
  layoutShiftSourcesCache.clear();
  normalizedLayoutShiftNodesCache.clear();
}
export async function domNodeForBackendNodeID(modelData, nodeId) {
  const fromCache = domLookUpSingleNodeCache.get(modelData)?.get(nodeId);
  if (fromCache !== void 0) {
    return fromCache;
  }
  const target = SDK.TargetManager.TargetManager.instance().primaryPageTarget();
  const domModel = target?.model(SDK.DOMModel.DOMModel);
  if (!domModel) {
    return null;
  }
  const domNodesMap = await domModel.pushNodesByBackendIdsToFrontend(/* @__PURE__ */ new Set([nodeId]));
  const result = domNodesMap?.get(nodeId) || null;
  const cacheForModel = domLookUpSingleNodeCache.get(modelData) || /* @__PURE__ */ new Map();
  cacheForModel.set(nodeId, result);
  domLookUpSingleNodeCache.set(modelData, cacheForModel);
  return result;
}
const nodeIdsForEventCache = /* @__PURE__ */ new WeakMap();
export function nodeIdsForEvent(modelData, event) {
  const fromCache = nodeIdsForEventCache.get(event);
  if (fromCache) {
    return fromCache;
  }
  const foundIds = /* @__PURE__ */ new Set();
  if (Types.Events.isLayout(event)) {
    event.args.endData?.layoutRoots.forEach((root) => foundIds.add(root.nodeId));
  } else if (Types.Events.isSyntheticLayoutShift(event) && event.args.data?.impacted_nodes) {
    event.args.data.impacted_nodes.forEach((node) => foundIds.add(node.node_id));
  } else if (Types.Events.isLargestContentfulPaintCandidate(event) && typeof event.args.data?.nodeId !== "undefined") {
    foundIds.add(event.args.data.nodeId);
  } else if (Types.Events.isPaint(event) && typeof event.args.data.nodeId !== "undefined") {
    foundIds.add(event.args.data.nodeId);
  } else if (Types.Events.isPaintImage(event) && typeof event.args.data.nodeId !== "undefined") {
    foundIds.add(event.args.data.nodeId);
  } else if (Types.Events.isScrollLayer(event) && typeof event.args.data.nodeId !== "undefined") {
    foundIds.add(event.args.data.nodeId);
  } else if (Types.Events.isSyntheticAnimation(event) && typeof event.args.data.beginEvent.args.data.nodeId !== "undefined") {
    foundIds.add(event.args.data.beginEvent.args.data.nodeId);
  } else if (Types.Events.isDecodeImage(event)) {
    const paintImageEvent = modelData.ImagePainting.paintImageForEvent.get(event);
    if (paintImageEvent && typeof paintImageEvent.args.data.nodeId !== "undefined") {
      foundIds.add(paintImageEvent.args.data.nodeId);
    }
  } else if (Types.Events.isDrawLazyPixelRef(event) && event.args?.LazyPixelRef) {
    const paintImageEvent = modelData.ImagePainting.paintImageByDrawLazyPixelRef.get(event.args.LazyPixelRef);
    if (paintImageEvent && typeof paintImageEvent.args.data.nodeId !== "undefined") {
      foundIds.add(paintImageEvent.args.data.nodeId);
    }
  } else if (Types.Events.isParseMetaViewport(event) && typeof event.args?.data.node_id !== "undefined") {
    foundIds.add(event.args.data.node_id);
  }
  nodeIdsForEventCache.set(event, foundIds);
  return foundIds;
}
export async function extractRelatedDOMNodesFromEvent(modelData, event) {
  const nodeIds = nodeIdsForEvent(modelData, event);
  if (nodeIds.size) {
    return domNodesForMultipleBackendNodeIds(modelData, Array.from(nodeIds));
  }
  return null;
}
export async function domNodesForMultipleBackendNodeIds(modelData, nodeIds) {
  const fromCache = domLookUpBatchNodesCache.get(modelData)?.get(nodeIds);
  if (fromCache) {
    return fromCache;
  }
  const target = SDK.TargetManager.TargetManager.instance().primaryPageTarget();
  const domModel = target?.model(SDK.DOMModel.DOMModel);
  if (!domModel) {
    return /* @__PURE__ */ new Map();
  }
  const domNodesMap = await domModel.pushNodesByBackendIdsToFrontend(new Set(nodeIds)) || /* @__PURE__ */ new Map();
  const cacheForModel = domLookUpBatchNodesCache.get(modelData) || /* @__PURE__ */ new Map();
  cacheForModel.set(nodeIds, domNodesMap);
  domLookUpBatchNodesCache.set(modelData, cacheForModel);
  return domNodesMap;
}
const layoutShiftSourcesCache = /* @__PURE__ */ new Map();
const normalizedLayoutShiftNodesCache = /* @__PURE__ */ new Map();
export async function sourcesForLayoutShift(modelData, event) {
  const fromCache = layoutShiftSourcesCache.get(modelData)?.get(event);
  if (fromCache) {
    return fromCache;
  }
  const impactedNodes = event.args.data?.impacted_nodes;
  if (!impactedNodes) {
    return [];
  }
  const sources = [];
  await Promise.all(impactedNodes.map(async (node) => {
    const domNode = await domNodeForBackendNodeID(modelData, node.node_id);
    if (domNode) {
      sources.push({
        previousRect: new DOMRect(node.old_rect[0], node.old_rect[1], node.old_rect[2], node.old_rect[3]),
        currentRect: new DOMRect(node.new_rect[0], node.new_rect[1], node.new_rect[2], node.new_rect[3]),
        node: domNode
      });
    }
  }));
  const cacheForModel = layoutShiftSourcesCache.get(modelData) || /* @__PURE__ */ new Map();
  cacheForModel.set(event, sources);
  layoutShiftSourcesCache.set(modelData, cacheForModel);
  return sources;
}
export async function normalizedImpactedNodesForLayoutShift(modelData, event) {
  const fromCache = normalizedLayoutShiftNodesCache.get(modelData)?.get(event);
  if (fromCache) {
    return fromCache;
  }
  const impactedNodes = event.args?.data?.impacted_nodes;
  if (!impactedNodes) {
    return [];
  }
  let viewportScale = null;
  const target = SDK.TargetManager.TargetManager.instance().primaryPageTarget();
  const evaluateResult = await target?.runtimeAgent().invoke_evaluate({ expression: "window.devicePixelRatio" });
  if (evaluateResult?.result.type === "number") {
    viewportScale = evaluateResult?.result.value ?? null;
  }
  if (!viewportScale) {
    return impactedNodes;
  }
  const normalizedNodes = [];
  for (const impactedNode of impactedNodes) {
    const newNode = { ...impactedNode };
    for (let i = 0; i < impactedNode.old_rect.length; i++) {
      newNode.old_rect[i] /= viewportScale;
    }
    for (let i = 0; i < impactedNode.new_rect.length; i++) {
      newNode.new_rect[i] /= viewportScale;
    }
    normalizedNodes.push(newNode);
  }
  const cacheForModel = normalizedLayoutShiftNodesCache.get(modelData) || /* @__PURE__ */ new Map();
  cacheForModel.set(event, normalizedNodes);
  normalizedLayoutShiftNodesCache.set(modelData, cacheForModel);
  return normalizedNodes;
}
//# sourceMappingURL=FetchNodes.js.map

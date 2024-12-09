"use strict";
import * as Platform from "../../../core/platform/platform.js";
import * as Helpers from "../helpers/helpers.js";
import * as Types from "../types/types.js";
const fontRequestsByPrePaint = /* @__PURE__ */ new Map();
const renderBlocksByPrePaint = /* @__PURE__ */ new Map();
function setDefaultValue(map, shift) {
  Platform.MapUtilities.getWithDefault(map, shift, () => {
    return {
      unsizedMedia: [],
      iframes: [],
      fontChanges: [],
      renderBlockingRequests: [],
      scriptStackTrace: []
    };
  });
}
function networkRequestIsRenderBlockingInFrame(event, frameId) {
  return event.args.data.frame === frameId && Helpers.Network.isSyntheticNetworkRequestEventRenderBlocking(event);
}
export class LayoutShiftRootCauses {
  #protocolInterface;
  #rootCauseCacheMap = /* @__PURE__ */ new Map();
  #nodeDetailsCache = /* @__PURE__ */ new Map();
  #iframeRootCausesEnabled;
  constructor(protocolInterface, options) {
    this.#protocolInterface = protocolInterface;
    this.#iframeRootCausesEnabled = options?.enableIframeRootCauses ?? false;
  }
  /**
   * Calculates the potential root causes for a given layout shift event. Once
   * calculated, this data is cached.
   * Note: because you need all layout shift data at once to calculate these
   * correctly, this function will parse the root causes for _all_ layout shift
   * events the first time that it's called. That then populates the cache for
   * each shift, so any subsequent calls are just a constant lookup.
   */
  async rootCausesForEvent(modelData, event) {
    const cachedResult = this.#rootCauseCacheMap.get(event);
    if (cachedResult) {
      return cachedResult;
    }
    const allLayoutShifts = modelData.LayoutShifts.clusters.flatMap((cluster) => cluster.events);
    allLayoutShifts.forEach((shift) => setDefaultValue(this.#rootCauseCacheMap, shift));
    await this.blameShifts(
      allLayoutShifts,
      modelData
    );
    const resultForEvent = this.#rootCauseCacheMap.get(event);
    if (!resultForEvent) {
      return null;
    }
    return resultForEvent;
  }
  /**
   * Determines potential root causes for shifts
   */
  async blameShifts(layoutShifts, modelData) {
    await this.linkShiftsToLayoutInvalidations(layoutShifts, modelData);
    this.linkShiftsToLayoutEvents(layoutShifts, modelData);
  }
  /**
   * "LayoutInvalidations" are a set of trace events dispatched in Blink under the name
   * "layoutInvalidationTracking", which track invalidations on the "Layout"stage of the
   * rendering pipeline. This function utilizes this event to flag potential root causes
   * to layout shifts.
   */
  async linkShiftsToLayoutInvalidations(layoutShifts, modelData) {
    const { prePaintEvents, layoutInvalidationEvents, scheduleStyleInvalidationEvents, backendNodeIds } = modelData.LayoutShifts;
    const eventsForLayoutInvalidation = [...layoutInvalidationEvents, ...scheduleStyleInvalidationEvents];
    const nodes = await this.#protocolInterface.pushNodesByBackendIdsToFrontend(backendNodeIds);
    const nodeIdsByBackendIdMap = /* @__PURE__ */ new Map();
    for (let i = 0; i < backendNodeIds.length; i++) {
      nodeIdsByBackendIdMap.set(backendNodeIds[i], nodes[i]);
    }
    const shiftsByPrePaint = getShiftsByPrePaintEvents(layoutShifts, prePaintEvents);
    for (const layoutInvalidation of eventsForLayoutInvalidation) {
      const nextPrePaintIndex = Platform.ArrayUtilities.nearestIndexFromBeginning(
        prePaintEvents,
        (prePaint) => prePaint.ts > layoutInvalidation.ts
      );
      if (nextPrePaintIndex === null) {
        continue;
      }
      const nextPrePaint = prePaintEvents[nextPrePaintIndex];
      const subsequentShifts = shiftsByPrePaint.get(nextPrePaint);
      if (!subsequentShifts) {
        continue;
      }
      const fontChangeRootCause = this.getFontChangeRootCause(layoutInvalidation, nextPrePaint, modelData);
      const renderBlockRootCause = this.getRenderBlockRootCause(layoutInvalidation, nextPrePaint, modelData);
      const layoutInvalidationNodeId = nodeIdsByBackendIdMap.get(layoutInvalidation.args.data.nodeId);
      let unsizedMediaRootCause = null;
      let iframeRootCause = null;
      if (layoutInvalidationNodeId !== void 0 && Types.Events.isLayoutInvalidationTracking(layoutInvalidation)) {
        unsizedMediaRootCause = await this.getUnsizedMediaRootCause(layoutInvalidation, layoutInvalidationNodeId);
        iframeRootCause = await this.getIframeRootCause(layoutInvalidation, layoutInvalidationNodeId);
      }
      if (!unsizedMediaRootCause && !iframeRootCause && !fontChangeRootCause && !renderBlockRootCause) {
        continue;
      }
      for (const shift of subsequentShifts) {
        const rootCausesForShift = Platform.MapUtilities.getWithDefault(this.#rootCauseCacheMap, shift, () => {
          return {
            unsizedMedia: [],
            iframes: [],
            fontChanges: [],
            renderBlockingRequests: [],
            scriptStackTrace: []
          };
        });
        if (unsizedMediaRootCause && !rootCausesForShift.unsizedMedia.some((media) => media.node.nodeId === unsizedMediaRootCause?.node.nodeId) && shift.args.frame === layoutInvalidation.args.data.frame) {
          rootCausesForShift.unsizedMedia.push(unsizedMediaRootCause);
        }
        if (iframeRootCause && !rootCausesForShift.iframes.some(
          (injectedIframe) => injectedIframe.iframe.nodeId === iframeRootCause?.iframe.nodeId
        )) {
          rootCausesForShift.iframes.push(iframeRootCause);
        }
        if (fontChangeRootCause) {
          rootCausesForShift.fontChanges = fontChangeRootCause;
        }
        if (renderBlockRootCause) {
          rootCausesForShift.renderBlockingRequests = renderBlockRootCause;
        }
      }
    }
  }
  /**
   * For every shift looks up the initiator of its corresponding Layout event. This initiator
   * is assigned by the RendererHandler and contains the stack trace of the point in a script
   * that caused a style recalculation or a relayout. This stack trace is added to the shift's
   * potential root causes.
   * Note that a Layout cannot always be linked to a script, in that case, we cannot add a
   * "script causing reflow" as a potential root cause to the corresponding shift.
   */
  linkShiftsToLayoutEvents(layoutShifts, modelData) {
    const { prePaintEvents } = modelData.LayoutShifts;
    const shiftsByPrePaint = getShiftsByPrePaintEvents(layoutShifts, prePaintEvents);
    const eventTriggersLayout = ({ name }) => {
      const knownName = name;
      return knownName === Types.Events.Name.LAYOUT;
    };
    const layoutEvents = modelData.Renderer.allTraceEntries.filter(eventTriggersLayout);
    for (const layout of layoutEvents) {
      const nextPrePaintIndex = Platform.ArrayUtilities.nearestIndexFromBeginning(
        prePaintEvents,
        (prePaint) => prePaint.ts > layout.ts + (layout.dur || 0)
      );
      if (nextPrePaintIndex === null) {
        continue;
      }
      const nextPrePaint = prePaintEvents[nextPrePaintIndex];
      const subsequentShifts = shiftsByPrePaint.get(nextPrePaint);
      if (!subsequentShifts) {
        continue;
      }
      const layoutNode = modelData.Renderer.entryToNode.get(layout);
      const initiator = layoutNode ? modelData.Initiators.eventToInitiator.get(layoutNode.entry) : null;
      const stackTrace = initiator?.args?.data?.stackTrace;
      if (!stackTrace) {
        continue;
      }
      for (const shift of subsequentShifts) {
        const rootCausesForShift = Platform.MapUtilities.getWithDefault(this.#rootCauseCacheMap, shift, () => {
          return {
            unsizedMedia: [],
            iframes: [],
            fontChanges: [],
            renderBlockingRequests: [],
            scriptStackTrace: []
          };
        });
        if (rootCausesForShift.scriptStackTrace.length === 0) {
          rootCausesForShift.scriptStackTrace = stackTrace;
        }
      }
    }
  }
  /**
   * Given a LayoutInvalidation trace event, determines if it was dispatched
   * because a media element without dimensions was resized.
   */
  async getUnsizedMediaRootCause(layoutInvalidation, layoutInvalidationNodeId) {
    if (layoutInvalidation.args.data.reason !== Types.Events.LayoutInvalidationReason.SIZE_CHANGED) {
      return null;
    }
    const layoutInvalidationNode = await this.getNodeDetails(layoutInvalidationNodeId);
    if (!layoutInvalidationNode) {
      return null;
    }
    const computedStylesList = await this.#protocolInterface.getComputedStyleForNode(layoutInvalidationNode.nodeId);
    const computedStyles = new Map(computedStylesList.map((item) => [item.name, item.value]));
    if (computedStyles && !await nodeIsUnfixedMedia(layoutInvalidationNode, computedStyles)) {
      return null;
    }
    const authoredDimensions = await this.getNodeAuthoredDimensions(layoutInvalidationNode);
    if (dimensionsAreExplicit(authoredDimensions)) {
      return null;
    }
    const computedDimensions = computedStyles ? getNodeComputedDimensions(computedStyles) : {};
    return { node: layoutInvalidationNode, authoredDimensions, computedDimensions };
  }
  /**
   * Given a LayoutInvalidation trace event, determines if it was dispatched
   * because a node, which is an ancestor to an iframe, was injected.
   */
  async getIframeRootCause(layoutInvalidation, layoutInvalidationNodeId) {
    if (!this.#iframeRootCausesEnabled) {
      return null;
    }
    if (!layoutInvalidation.args.data.nodeName?.startsWith("IFRAME") && layoutInvalidation.args.data.reason !== Types.Events.LayoutInvalidationReason.STYLE_CHANGED && layoutInvalidation.args.data.reason !== Types.Events.LayoutInvalidationReason.ADDED_TO_LAYOUT) {
      return null;
    }
    const layoutInvalidationNode = await this.getNodeDetails(layoutInvalidationNodeId);
    if (!layoutInvalidationNode) {
      return null;
    }
    const iframe = firstIframeInDOMTree(layoutInvalidationNode);
    if (!iframe) {
      return null;
    }
    return { iframe };
  }
  async getNodeDetails(nodeId) {
    let nodeDetails = this.#nodeDetailsCache.get(nodeId);
    if (nodeDetails !== void 0) {
      return nodeDetails;
    }
    nodeDetails = await this.#protocolInterface.getNode(nodeId);
    this.#nodeDetailsCache.set(nodeId, nodeDetails);
    return nodeDetails;
  }
  /**
   * Given a layout invalidation event and a sorted array, returns the subset of requests that arrived within a
   * 500ms window before the layout invalidation.
   */
  requestsInInvalidationWindow(layoutInvalidation, modelData) {
    const requestsSortedByEndTime = modelData.NetworkRequests.byTime.sort((req1, req2) => {
      const req1EndTime = req1.ts + req1.dur;
      const req2EndTime = req2.ts + req2.dur;
      return req1EndTime - req2EndTime;
    });
    const lastRequestIndex = Platform.ArrayUtilities.nearestIndexFromEnd(
      requestsSortedByEndTime,
      (request) => request.ts + request.dur < layoutInvalidation.ts
    );
    if (lastRequestIndex === null) {
      return [];
    }
    const MAX_DELTA_FOR_FONT_REQUEST = Helpers.Timing.secondsToMicroseconds(Types.Timing.Seconds(0.5));
    const requestsInInvalidationWindow = [];
    for (let i = lastRequestIndex; i > -1; i--) {
      const previousRequest = requestsSortedByEndTime[i];
      const previousRequestEndTime = previousRequest.ts + previousRequest.dur;
      if (layoutInvalidation.ts - previousRequestEndTime < MAX_DELTA_FOR_FONT_REQUEST) {
        const requestInInvalidationWindow = { request: previousRequest };
        const initiator = this.#protocolInterface.getInitiatorForRequest(
          previousRequest.args.data.url
        );
        requestInInvalidationWindow.initiator = initiator || void 0;
        requestsInInvalidationWindow.push(requestInInvalidationWindow);
      } else {
        break;
      }
    }
    return requestsInInvalidationWindow;
  }
  /**
   * Given a LayoutInvalidation trace event, determines if it was dispatched
   * because fonts were changed and if so returns the information of all network
   * request with which the fonts were possibly fetched, if any. The computed
   * network requests are cached for the corresponding prepaint event, meaning
   * that other LayoutInvalidation events that correspond to the same prepaint
   * are not processed and the cached network requests for the prepaint is
   * returned instead.
   */
  getFontChangeRootCause(layoutInvalidation, nextPrePaint, modelData) {
    if (layoutInvalidation.args.data.reason !== Types.Events.LayoutInvalidationReason.FONTS_CHANGED) {
      return null;
    }
    const fontRequestsForPrepaint = fontRequestsByPrePaint.get(nextPrePaint);
    if (fontRequestsForPrepaint !== void 0) {
      return fontRequestsForPrepaint;
    }
    const fontRequestsInThisPrepaint = this.getFontRequestsInInvalidationWindow(this.requestsInInvalidationWindow(layoutInvalidation, modelData));
    fontRequestsByPrePaint.set(nextPrePaint, fontRequestsInThisPrepaint);
    return fontRequestsInThisPrepaint;
  }
  /**
   * Given the requests that arrived within a 500ms window before the layout invalidation, returns the font
   * requests of them.
   */
  getFontRequestsInInvalidationWindow(requestsInInvalidationWindow) {
    const fontRequests = [];
    for (let i = 0; i < requestsInInvalidationWindow.length; i++) {
      const fontRequest = requestsInInvalidationWindow[i];
      if (!fontRequest.request.args.data.mimeType.startsWith("font")) {
        continue;
      }
      const fontFace = this.#protocolInterface.fontFaceForSource(fontRequest.request.args.data.url);
      if (!fontFace || fontFace.fontDisplay === "optional") {
        continue;
      }
      fontRequest.fontFace = fontFace;
      fontRequests.push(fontRequest);
    }
    return fontRequests;
  }
  /**
   * Given a LayoutInvalidation trace event, determines if it arrived within a 500ms window before the layout
   * invalidation and if so returns the information of all network request, if any. The computed network
   * requests are cached for the corresponding prepaint event, meaning that other LayoutInvalidation events
   * that correspond to the same prepaint are not processed and the cached network requests for the prepaint is
   *  returned instead.
   */
  getRenderBlockRootCause(layoutInvalidation, nextPrePaint, modelData) {
    const renderBlocksInPrepaint = renderBlocksByPrePaint.get(nextPrePaint);
    if (renderBlocksInPrepaint !== void 0) {
      return renderBlocksInPrepaint;
    }
    const renderBlocksInThisPrepaint = getRenderBlockRequestsInInvalidationWindow(this.requestsInInvalidationWindow(layoutInvalidation, modelData));
    renderBlocksByPrePaint.set(nextPrePaint, renderBlocksInThisPrepaint);
    return renderBlocksInThisPrepaint;
  }
  /**
   * Returns a function that retrieves the active value of a given
   * CSS property within the matched styles of the param node.
   * The first occurence within the matched styles is returned and the
   * value is looked up in the following order, which follows CSS
   * specificity:
   * 1. Inline styles.
   * 2. CSS rules matching this node, from all applicable stylesheets.
   * 3. Attribute defined styles.
   */
  async nodeMatchedStylesPropertyGetter(node) {
    const response = await this.#protocolInterface.getMatchedStylesForNode(node.nodeId);
    function cssPropertyValueGetter(cssProperty) {
      let prop = response.inlineStyle?.cssProperties.find((prop2) => prop2.name === cssProperty);
      if (prop) {
        return prop.value;
      }
      for (const { rule } of response.matchedCSSRules || []) {
        const prop2 = rule.style.cssProperties.find((prop3) => prop3.name === cssProperty);
        if (prop2) {
          return prop2.value;
        }
      }
      prop = response.attributesStyle?.cssProperties.find((prop2) => prop2.name === cssProperty);
      if (prop) {
        return prop.value;
      }
      return null;
    }
    return cssPropertyValueGetter;
  }
  /**
   * Returns the CSS dimensions set to the node from its matched styles.
   */
  async getNodeAuthoredDimensions(node) {
    const authoredDimensions = {};
    const cssMatchedRulesGetter = await this.nodeMatchedStylesPropertyGetter(node);
    if (!cssMatchedRulesGetter) {
      return authoredDimensions;
    }
    const attributesFlat = node.attributes || [];
    const attributes = [];
    for (let i = 0; i < attributesFlat.length; i += 2) {
      attributes.push({ name: attributesFlat[i], value: attributesFlat[i + 1] });
    }
    const htmlHeight = attributes.find((attr) => attr.name === "height" && htmlAttributeIsExplicit(attr));
    const htmlWidth = attributes.find((attr) => attr.name === "width" && htmlAttributeIsExplicit(attr));
    const cssExplicitAspectRatio = cssMatchedRulesGetter("aspect-ratio") || void 0;
    if (htmlHeight && htmlWidth && cssExplicitAspectRatio) {
      return { height: htmlHeight.value, width: htmlWidth.value, aspectRatio: cssExplicitAspectRatio };
    }
    const cssHeight = cssMatchedRulesGetter("height") || void 0;
    const cssWidth = cssMatchedRulesGetter("width") || void 0;
    return { height: cssHeight, width: cssWidth, aspectRatio: cssExplicitAspectRatio };
  }
}
function getRenderBlockRequestsInInvalidationWindow(requestsInInvalidationWindow) {
  const renderBlockingRequests = [];
  for (let i = 0; i < requestsInInvalidationWindow.length; i++) {
    const mainFrameId = requestsInInvalidationWindow[i].request.args.data.frame;
    if (!networkRequestIsRenderBlockingInFrame(requestsInInvalidationWindow[i].request, mainFrameId)) {
      continue;
    }
    renderBlockingRequests.push(requestsInInvalidationWindow[i]);
  }
  return renderBlockingRequests;
}
function firstIframeInDOMTree(root) {
  if (root.nodeName === "IFRAME") {
    return root;
  }
  const children = root.children;
  if (!children) {
    return null;
  }
  for (const child of children) {
    const iFrameInChild = firstIframeInDOMTree(child);
    if (iFrameInChild) {
      return iFrameInChild;
    }
  }
  return null;
}
function cssPropertyIsExplicitlySet(propertyValue) {
  return !["auto", "initial", "unset", "inherit"].includes(propertyValue);
}
function htmlAttributeIsExplicit(attr) {
  return parseInt(attr.value, 10) >= 0;
}
function computedStyleHasBackroundImage(computedStyle) {
  const CSS_URL_REGEX = /^url\("([^"]+)"\)$/;
  const backgroundImage = computedStyle.get("background-image");
  if (!backgroundImage) {
    return false;
  }
  return CSS_URL_REGEX.test(backgroundImage);
}
function computedStyleHasFixedPosition(computedStyle) {
  const position = computedStyle.get("position");
  if (!position) {
    return false;
  }
  return position === "fixed" || position === "absolute";
}
function getNodeComputedDimensions(computedStyle) {
  const computedDimensions = {};
  computedDimensions.height = computedStyle.get("height");
  computedDimensions.width = computedStyle.get("width");
  computedDimensions.aspectRatio = computedStyle.get("aspect-ratio");
  return computedDimensions;
}
async function nodeIsUnfixedMedia(node, computedStyle) {
  const localName = node.localName;
  const isBackgroundImage = computedStyleHasBackroundImage(computedStyle);
  if (localName !== "img" && localName !== "video" && !isBackgroundImage) {
    return false;
  }
  const isFixed = computedStyleHasFixedPosition(computedStyle);
  return !isFixed;
}
function dimensionsAreExplicit(dimensions) {
  const { height, width, aspectRatio } = dimensions;
  const explicitHeight = Boolean(height && cssPropertyIsExplicitlySet(height));
  const explicitWidth = Boolean(width && cssPropertyIsExplicitlySet(width));
  const explicitAspectRatio = Boolean(aspectRatio && cssPropertyIsExplicitlySet(aspectRatio));
  const explicitWithAR = (explicitHeight || explicitWidth) && explicitAspectRatio;
  return explicitHeight && explicitWidth || explicitWithAR;
}
function getShiftsByPrePaintEvents(layoutShifts, prePaintEvents) {
  const shiftsByPrePaint = /* @__PURE__ */ new Map();
  for (const prePaintEvent of prePaintEvents) {
    const firstShiftIndex = Platform.ArrayUtilities.nearestIndexFromBeginning(layoutShifts, (shift) => shift.ts >= prePaintEvent.ts);
    if (firstShiftIndex === null) {
      continue;
    }
    for (let i = firstShiftIndex; i < layoutShifts.length; i++) {
      const shift = layoutShifts[i];
      if (shift.ts >= prePaintEvent.ts && shift.ts <= prePaintEvent.ts + prePaintEvent.dur) {
        const shiftsInPrePaint = Platform.MapUtilities.getWithDefault(shiftsByPrePaint, prePaintEvent, () => []);
        shiftsInPrePaint.push(shift);
      }
      if (shift.ts > prePaintEvent.ts + prePaintEvent.dur) {
        break;
      }
    }
  }
  return shiftsByPrePaint;
}
//# sourceMappingURL=LayoutShift.js.map

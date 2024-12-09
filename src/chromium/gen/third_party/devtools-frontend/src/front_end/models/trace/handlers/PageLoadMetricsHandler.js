"use strict";
import * as Platform from "../../../core/platform/platform.js";
import * as Helpers from "../helpers/helpers.js";
import * as Types from "../types/types.js";
import { data as metaHandlerData } from "./MetaHandler.js";
const metricScoresByFrameId = /* @__PURE__ */ new Map();
let allMarkerEvents = [];
export function reset() {
  metricScoresByFrameId.clear();
  pageLoadEventsArray = [];
  allMarkerEvents = [];
  selectedLCPCandidateEvents.clear();
}
let pageLoadEventsArray = [];
const selectedLCPCandidateEvents = /* @__PURE__ */ new Set();
export function handleEvent(event) {
  if (!Types.Events.eventIsPageLoadEvent(event)) {
    return;
  }
  pageLoadEventsArray.push(event);
}
function storePageLoadMetricAgainstNavigationId(navigation, event) {
  const navigationId = navigation.args.data?.navigationId;
  if (!navigationId) {
    throw new Error("Navigation event unexpectedly had no navigation ID.");
  }
  const frameId = getFrameIdForPageLoadEvent(event);
  const { rendererProcessesByFrame } = metaHandlerData();
  const rendererProcessesInFrame = rendererProcessesByFrame.get(frameId);
  if (!rendererProcessesInFrame) {
    return;
  }
  const processData = rendererProcessesInFrame.get(event.pid);
  if (!processData) {
    return;
  }
  if (Types.Events.isNavigationStart(event)) {
    return;
  }
  if (Types.Events.isFirstContentfulPaint(event)) {
    const fcpTime = Types.Timing.MicroSeconds(event.ts - navigation.ts);
    const classification = scoreClassificationForFirstContentfulPaint(fcpTime);
    const metricScore = { event, metricName: "FCP" /* FCP */, classification, navigation, timing: fcpTime };
    storeMetricScore(frameId, navigationId, metricScore);
    return;
  }
  if (Types.Events.isFirstPaint(event)) {
    const paintTime = Types.Timing.MicroSeconds(event.ts - navigation.ts);
    const classification = "unclassified" /* UNCLASSIFIED */;
    const metricScore = { event, metricName: "FP" /* FP */, classification, navigation, timing: paintTime };
    storeMetricScore(frameId, navigationId, metricScore);
    return;
  }
  if (Types.Events.isMarkDOMContent(event)) {
    const dclTime = Types.Timing.MicroSeconds(event.ts - navigation.ts);
    const metricScore = {
      event,
      metricName: "DCL" /* DCL */,
      classification: scoreClassificationForDOMContentLoaded(dclTime),
      navigation,
      timing: dclTime
    };
    storeMetricScore(frameId, navigationId, metricScore);
    return;
  }
  if (Types.Events.isInteractiveTime(event)) {
    const ttiValue = Types.Timing.MicroSeconds(event.ts - navigation.ts);
    const tti = {
      event,
      metricName: "TTI" /* TTI */,
      classification: scoreClassificationForTimeToInteractive(ttiValue),
      navigation,
      timing: ttiValue
    };
    storeMetricScore(frameId, navigationId, tti);
    const tbtValue = Helpers.Timing.millisecondsToMicroseconds(Types.Timing.MilliSeconds(event.args.args.total_blocking_time_ms));
    const tbt = {
      event,
      metricName: "TBT" /* TBT */,
      classification: scoreClassificationForTotalBlockingTime(tbtValue),
      navigation,
      timing: tbtValue
    };
    storeMetricScore(frameId, navigationId, tbt);
    return;
  }
  if (Types.Events.isMarkLoad(event)) {
    const loadTime = Types.Timing.MicroSeconds(event.ts - navigation.ts);
    const metricScore = {
      event,
      metricName: "L" /* L */,
      classification: "unclassified" /* UNCLASSIFIED */,
      navigation,
      timing: loadTime
    };
    storeMetricScore(frameId, navigationId, metricScore);
    return;
  }
  if (Types.Events.isLargestContentfulPaintCandidate(event)) {
    const candidateIndex = event.args.data?.candidateIndex;
    if (!candidateIndex) {
      throw new Error("Largest Contenful Paint unexpectedly had no candidateIndex.");
    }
    const lcpTime = Types.Timing.MicroSeconds(event.ts - navigation.ts);
    const lcp = {
      event,
      metricName: "LCP" /* LCP */,
      classification: scoreClassificationForLargestContentfulPaint(lcpTime),
      navigation,
      timing: lcpTime
    };
    const metricsByNavigation = Platform.MapUtilities.getWithDefault(metricScoresByFrameId, frameId, () => /* @__PURE__ */ new Map());
    const metrics = Platform.MapUtilities.getWithDefault(metricsByNavigation, navigationId, () => /* @__PURE__ */ new Map());
    const lastLCPCandidate = metrics.get("LCP" /* LCP */);
    if (lastLCPCandidate === void 0) {
      selectedLCPCandidateEvents.add(lcp.event);
      storeMetricScore(frameId, navigationId, lcp);
      return;
    }
    const lastLCPCandidateEvent = lastLCPCandidate.event;
    if (!Types.Events.isLargestContentfulPaintCandidate(lastLCPCandidateEvent)) {
      return;
    }
    const lastCandidateIndex = lastLCPCandidateEvent.args.data?.candidateIndex;
    if (!lastCandidateIndex) {
      return;
    }
    if (lastCandidateIndex < candidateIndex) {
      selectedLCPCandidateEvents.delete(lastLCPCandidateEvent);
      selectedLCPCandidateEvents.add(lcp.event);
      storeMetricScore(frameId, navigationId, lcp);
    }
    return;
  }
  if (Types.Events.isLayoutShift(event)) {
    return;
  }
  return Platform.assertNever(event, `Unexpected event type: ${event}`);
}
function storeMetricScore(frameId, navigationId, metricScore) {
  const metricsByNavigation = Platform.MapUtilities.getWithDefault(metricScoresByFrameId, frameId, () => /* @__PURE__ */ new Map());
  const metrics = Platform.MapUtilities.getWithDefault(metricsByNavigation, navigationId, () => /* @__PURE__ */ new Map());
  metrics.delete(metricScore.metricName);
  metrics.set(metricScore.metricName, metricScore);
}
export function getFrameIdForPageLoadEvent(event) {
  if (Types.Events.isFirstContentfulPaint(event) || Types.Events.isInteractiveTime(event) || Types.Events.isLargestContentfulPaintCandidate(event) || Types.Events.isNavigationStart(event) || Types.Events.isLayoutShift(event) || Types.Events.isFirstPaint(event)) {
    return event.args.frame;
  }
  if (Types.Events.isMarkDOMContent(event) || Types.Events.isMarkLoad(event)) {
    const frameId = event.args.data?.frame;
    if (!frameId) {
      throw new Error("MarkDOMContent unexpectedly had no frame ID.");
    }
    return frameId;
  }
  Platform.assertNever(event, `Unexpected event type: ${event}`);
}
function getNavigationForPageLoadEvent(event) {
  if (Types.Events.isFirstContentfulPaint(event) || Types.Events.isLargestContentfulPaintCandidate(event) || Types.Events.isFirstPaint(event)) {
    const navigationId = event.args.data?.navigationId;
    if (!navigationId) {
      throw new Error("Trace event unexpectedly had no navigation ID.");
    }
    const { navigationsByNavigationId } = metaHandlerData();
    const navigation = navigationsByNavigationId.get(navigationId);
    if (!navigation) {
      return null;
    }
    return navigation;
  }
  if (Types.Events.isMarkDOMContent(event) || Types.Events.isInteractiveTime(event) || Types.Events.isLayoutShift(event) || Types.Events.isMarkLoad(event)) {
    const frameId = getFrameIdForPageLoadEvent(event);
    const { navigationsByFrameId } = metaHandlerData();
    return Helpers.Trace.getNavigationForTraceEvent(event, frameId, navigationsByFrameId);
  }
  if (Types.Events.isNavigationStart(event)) {
    return null;
  }
  return Platform.assertNever(event, `Unexpected event type: ${event}`);
}
export function scoreClassificationForFirstContentfulPaint(fcpScoreInMicroseconds) {
  const FCP_GOOD_TIMING = Helpers.Timing.secondsToMicroseconds(Types.Timing.Seconds(1.8));
  const FCP_MEDIUM_TIMING = Helpers.Timing.secondsToMicroseconds(Types.Timing.Seconds(3));
  let scoreClassification = "bad" /* BAD */;
  if (fcpScoreInMicroseconds <= FCP_MEDIUM_TIMING) {
    scoreClassification = "ok" /* OK */;
  }
  if (fcpScoreInMicroseconds <= FCP_GOOD_TIMING) {
    scoreClassification = "good" /* GOOD */;
  }
  return scoreClassification;
}
export function scoreClassificationForTimeToInteractive(ttiTimeInMicroseconds) {
  const TTI_GOOD_TIMING = Helpers.Timing.secondsToMicroseconds(Types.Timing.Seconds(3.8));
  const TTI_MEDIUM_TIMING = Helpers.Timing.secondsToMicroseconds(Types.Timing.Seconds(7.3));
  let scoreClassification = "bad" /* BAD */;
  if (ttiTimeInMicroseconds <= TTI_MEDIUM_TIMING) {
    scoreClassification = "ok" /* OK */;
  }
  if (ttiTimeInMicroseconds <= TTI_GOOD_TIMING) {
    scoreClassification = "good" /* GOOD */;
  }
  return scoreClassification;
}
export function scoreClassificationForLargestContentfulPaint(lcpTimeInMicroseconds) {
  const LCP_GOOD_TIMING = Helpers.Timing.secondsToMicroseconds(Types.Timing.Seconds(2.5));
  const LCP_MEDIUM_TIMING = Helpers.Timing.secondsToMicroseconds(Types.Timing.Seconds(4));
  let scoreClassification = "bad" /* BAD */;
  if (lcpTimeInMicroseconds <= LCP_MEDIUM_TIMING) {
    scoreClassification = "ok" /* OK */;
  }
  if (lcpTimeInMicroseconds <= LCP_GOOD_TIMING) {
    scoreClassification = "good" /* GOOD */;
  }
  return scoreClassification;
}
export function scoreClassificationForDOMContentLoaded(_dclTimeInMicroseconds) {
  return "unclassified" /* UNCLASSIFIED */;
}
export function scoreClassificationForTotalBlockingTime(tbtTimeInMicroseconds) {
  const TBT_GOOD_TIMING = Helpers.Timing.millisecondsToMicroseconds(Types.Timing.MilliSeconds(200));
  const TBT_MEDIUM_TIMING = Helpers.Timing.millisecondsToMicroseconds(Types.Timing.MilliSeconds(600));
  let scoreClassification = "bad" /* BAD */;
  if (tbtTimeInMicroseconds <= TBT_MEDIUM_TIMING) {
    scoreClassification = "ok" /* OK */;
  }
  if (tbtTimeInMicroseconds <= TBT_GOOD_TIMING) {
    scoreClassification = "good" /* GOOD */;
  }
  return scoreClassification;
}
function gatherFinalLCPEvents() {
  const allFinalLCPEvents = [];
  const dataForAllFrames = [...metricScoresByFrameId.values()];
  const dataForAllNavigations = dataForAllFrames.flatMap((frameData) => [...frameData.values()]);
  for (let i = 0; i < dataForAllNavigations.length; i++) {
    const navigationData = dataForAllNavigations[i];
    const lcpInNavigation = navigationData.get("LCP" /* LCP */);
    if (!lcpInNavigation || !lcpInNavigation.event) {
      continue;
    }
    allFinalLCPEvents.push(lcpInNavigation.event);
  }
  return allFinalLCPEvents;
}
export async function finalize() {
  pageLoadEventsArray.sort((a, b) => a.ts - b.ts);
  for (const pageLoadEvent of pageLoadEventsArray) {
    const navigation = getNavigationForPageLoadEvent(pageLoadEvent);
    if (navigation) {
      storePageLoadMetricAgainstNavigationId(navigation, pageLoadEvent);
    }
  }
  const allFinalLCPEvents = gatherFinalLCPEvents();
  const mainFrame = metaHandlerData().mainFrameId;
  const allEventsButLCP = pageLoadEventsArray.filter((event) => !Types.Events.isLargestContentfulPaintCandidate(event));
  const markerEvents = [...allFinalLCPEvents, ...allEventsButLCP].filter(Types.Events.isMarkerEvent);
  allMarkerEvents = markerEvents.filter((event) => getFrameIdForPageLoadEvent(event) === mainFrame).sort((a, b) => a.ts - b.ts);
}
export function data() {
  return {
    metricScoresByFrameId,
    allMarkerEvents
  };
}
export function deps() {
  return ["Meta"];
}
export var ScoreClassification = /* @__PURE__ */ ((ScoreClassification2) => {
  ScoreClassification2["GOOD"] = "good";
  ScoreClassification2["OK"] = "ok";
  ScoreClassification2["BAD"] = "bad";
  ScoreClassification2["UNCLASSIFIED"] = "unclassified";
  return ScoreClassification2;
})(ScoreClassification || {});
export var MetricName = /* @__PURE__ */ ((MetricName2) => {
  MetricName2["FCP"] = "FCP";
  MetricName2["FP"] = "FP";
  MetricName2["L"] = "L";
  MetricName2["LCP"] = "LCP";
  MetricName2["DCL"] = "DCL";
  MetricName2["TTI"] = "TTI";
  MetricName2["TBT"] = "TBT";
  MetricName2["CLS"] = "CLS";
  MetricName2["NAV"] = "Nav";
  return MetricName2;
})(MetricName || {});
//# sourceMappingURL=PageLoadMetricsHandler.js.map

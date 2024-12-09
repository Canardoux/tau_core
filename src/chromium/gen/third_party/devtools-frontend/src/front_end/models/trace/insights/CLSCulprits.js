"use strict";
import * as i18n from "../../../core/i18n/i18n.js";
import * as Platform from "../../../core/platform/platform.js";
import * as Helpers from "../helpers/helpers.js";
import * as Types from "../types/types.js";
import { InsightCategory } from "./types.js";
const UIStrings = {
  /** Title of an insight that provides details about why elements shift/move on the page. The causes for these shifts are referred to as culprits ("reasons"). */
  title: "Layout shift culprits",
  /**
   * @description Description of a DevTools insight that identifies the reasons that elements shift on the page.
   * This is displayed after a user expands the section to see more. No character length limits.
   */
  description: "Layout shifts occur when elements move absent any user interaction. [Investigate the causes of layout shifts](https://web.dev/articles/optimize-cls), such as elements being added, removed, or their fonts changing as the page loads."
};
const str_ = i18n.i18n.registerUIStrings("models/trace/insights/CLSCulprits.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
export function deps() {
  return ["Meta", "Animations", "LayoutShifts", "NetworkRequests"];
}
export var AnimationFailureReasons = /* @__PURE__ */ ((AnimationFailureReasons2) => {
  AnimationFailureReasons2["ACCELERATED_ANIMATIONS_DISABLED"] = "ACCELERATED_ANIMATIONS_DISABLED";
  AnimationFailureReasons2["EFFECT_SUPPRESSED_BY_DEVTOOLS"] = "EFFECT_SUPPRESSED_BY_DEVTOOLS";
  AnimationFailureReasons2["INVALID_ANIMATION_OR_EFFECT"] = "INVALID_ANIMATION_OR_EFFECT";
  AnimationFailureReasons2["EFFECT_HAS_UNSUPPORTED_TIMING_PARAMS"] = "EFFECT_HAS_UNSUPPORTED_TIMING_PARAMS";
  AnimationFailureReasons2["EFFECT_HAS_NON_REPLACE_COMPOSITE_MODE"] = "EFFECT_HAS_NON_REPLACE_COMPOSITE_MODE";
  AnimationFailureReasons2["TARGET_HAS_INVALID_COMPOSITING_STATE"] = "TARGET_HAS_INVALID_COMPOSITING_STATE";
  AnimationFailureReasons2["TARGET_HAS_INCOMPATIBLE_ANIMATIONS"] = "TARGET_HAS_INCOMPATIBLE_ANIMATIONS";
  AnimationFailureReasons2["TARGET_HAS_CSS_OFFSET"] = "TARGET_HAS_CSS_OFFSET";
  AnimationFailureReasons2["ANIMATION_AFFECTS_NON_CSS_PROPERTIES"] = "ANIMATION_AFFECTS_NON_CSS_PROPERTIES";
  AnimationFailureReasons2["TRANSFORM_RELATED_PROPERTY_CANNOT_BE_ACCELERATED_ON_TARGET"] = "TRANSFORM_RELATED_PROPERTY_CANNOT_BE_ACCELERATED_ON_TARGET";
  AnimationFailureReasons2["TRANSFROM_BOX_SIZE_DEPENDENT"] = "TRANSFROM_BOX_SIZE_DEPENDENT";
  AnimationFailureReasons2["FILTER_RELATED_PROPERTY_MAY_MOVE_PIXELS"] = "FILTER_RELATED_PROPERTY_MAY_MOVE_PIXELS";
  AnimationFailureReasons2["UNSUPPORTED_CSS_PROPERTY"] = "UNSUPPORTED_CSS_PROPERTY";
  AnimationFailureReasons2["MIXED_KEYFRAME_VALUE_TYPES"] = "MIXED_KEYFRAME_VALUE_TYPES";
  AnimationFailureReasons2["TIMELINE_SOURCE_HAS_INVALID_COMPOSITING_STATE"] = "TIMELINE_SOURCE_HAS_INVALID_COMPOSITING_STATE";
  AnimationFailureReasons2["ANIMATION_HAS_NO_VISIBLE_CHANGE"] = "ANIMATION_HAS_NO_VISIBLE_CHANGE";
  AnimationFailureReasons2["AFFECTS_IMPORTANT_PROPERTY"] = "AFFECTS_IMPORTANT_PROPERTY";
  AnimationFailureReasons2["SVG_TARGET_HAS_INDEPENDENT_TRANSFORM_PROPERTY"] = "SVG_TARGET_HAS_INDEPENDENT_TRANSFORM_PROPERTY";
  return AnimationFailureReasons2;
})(AnimationFailureReasons || {});
const ACTIONABLE_FAILURE_REASONS = [
  {
    flag: 1 << 0,
    failure: "ACCELERATED_ANIMATIONS_DISABLED" /* ACCELERATED_ANIMATIONS_DISABLED */
  },
  {
    flag: 1 << 1,
    failure: "EFFECT_SUPPRESSED_BY_DEVTOOLS" /* EFFECT_SUPPRESSED_BY_DEVTOOLS */
  },
  {
    flag: 1 << 2,
    failure: "INVALID_ANIMATION_OR_EFFECT" /* INVALID_ANIMATION_OR_EFFECT */
  },
  {
    flag: 1 << 3,
    failure: "EFFECT_HAS_UNSUPPORTED_TIMING_PARAMS" /* EFFECT_HAS_UNSUPPORTED_TIMING_PARAMS */
  },
  {
    flag: 1 << 4,
    failure: "EFFECT_HAS_NON_REPLACE_COMPOSITE_MODE" /* EFFECT_HAS_NON_REPLACE_COMPOSITE_MODE */
  },
  {
    flag: 1 << 5,
    failure: "TARGET_HAS_INVALID_COMPOSITING_STATE" /* TARGET_HAS_INVALID_COMPOSITING_STATE */
  },
  {
    flag: 1 << 6,
    failure: "TARGET_HAS_INCOMPATIBLE_ANIMATIONS" /* TARGET_HAS_INCOMPATIBLE_ANIMATIONS */
  },
  {
    flag: 1 << 7,
    failure: "TARGET_HAS_CSS_OFFSET" /* TARGET_HAS_CSS_OFFSET */
  },
  // The failure 1 << 8 is marked as obsolete in Blink
  {
    flag: 1 << 9,
    failure: "ANIMATION_AFFECTS_NON_CSS_PROPERTIES" /* ANIMATION_AFFECTS_NON_CSS_PROPERTIES */
  },
  {
    flag: 1 << 10,
    failure: "TRANSFORM_RELATED_PROPERTY_CANNOT_BE_ACCELERATED_ON_TARGET" /* TRANSFORM_RELATED_PROPERTY_CANNOT_BE_ACCELERATED_ON_TARGET */
  },
  {
    flag: 1 << 11,
    failure: "TRANSFROM_BOX_SIZE_DEPENDENT" /* TRANSFROM_BOX_SIZE_DEPENDENT */
  },
  {
    flag: 1 << 12,
    failure: "FILTER_RELATED_PROPERTY_MAY_MOVE_PIXELS" /* FILTER_RELATED_PROPERTY_MAY_MOVE_PIXELS */
  },
  {
    flag: 1 << 13,
    failure: "UNSUPPORTED_CSS_PROPERTY" /* UNSUPPORTED_CSS_PROPERTY */
  },
  // The failure 1 << 14 is marked as obsolete in Blink
  {
    flag: 1 << 15,
    failure: "MIXED_KEYFRAME_VALUE_TYPES" /* MIXED_KEYFRAME_VALUE_TYPES */
  },
  {
    flag: 1 << 16,
    failure: "TIMELINE_SOURCE_HAS_INVALID_COMPOSITING_STATE" /* TIMELINE_SOURCE_HAS_INVALID_COMPOSITING_STATE */
  },
  {
    flag: 1 << 17,
    failure: "ANIMATION_HAS_NO_VISIBLE_CHANGE" /* ANIMATION_HAS_NO_VISIBLE_CHANGE */
  },
  {
    flag: 1 << 18,
    failure: "AFFECTS_IMPORTANT_PROPERTY" /* AFFECTS_IMPORTANT_PROPERTY */
  },
  {
    flag: 1 << 19,
    failure: "SVG_TARGET_HAS_INDEPENDENT_TRANSFORM_PROPERTY" /* SVG_TARGET_HAS_INDEPENDENT_TRANSFORM_PROPERTY */
  }
];
const ROOT_CAUSE_WINDOW = Helpers.Timing.secondsToMicroseconds(Types.Timing.Seconds(0.5));
function isInRootCauseWindow(event, targetEvent) {
  const eventEnd = event.dur ? event.ts + event.dur : event.ts;
  return eventEnd < targetEvent.ts && eventEnd >= targetEvent.ts - ROOT_CAUSE_WINDOW;
}
export function getNonCompositedFailure(animationEvent) {
  const failures = [];
  const beginEvent = animationEvent.args.data.beginEvent;
  const instantEvents = animationEvent.args.data.instantEvents || [];
  for (const event of instantEvents) {
    const failureMask = event.args.data.compositeFailed;
    const unsupportedProperties = event.args.data.unsupportedProperties;
    if (!failureMask) {
      continue;
    }
    const failureReasons = ACTIONABLE_FAILURE_REASONS.filter((reason) => failureMask & reason.flag).map((reason) => reason.failure);
    const failure = {
      name: beginEvent.args.data.displayName,
      failureReasons,
      unsupportedProperties,
      animation: animationEvent
    };
    failures.push(failure);
  }
  return failures;
}
function getNonCompositedFailureRootCauses(animationEvents, prePaintEvents, shiftsByPrePaint, rootCausesByShift) {
  const allAnimationFailures = [];
  for (const animation of animationEvents) {
    const failures = getNonCompositedFailure(animation);
    if (!failures) {
      continue;
    }
    allAnimationFailures.push(...failures);
    const nextPrePaint = getNextEvent(prePaintEvents, animation);
    if (!nextPrePaint) {
      continue;
    }
    if (!isInRootCauseWindow(animation, nextPrePaint)) {
      continue;
    }
    const shifts = shiftsByPrePaint.get(nextPrePaint);
    if (!shifts) {
      continue;
    }
    for (const shift of shifts) {
      const rootCausesForShift = rootCausesByShift.get(shift);
      if (!rootCausesForShift) {
        throw new Error("Unaccounted shift");
      }
      rootCausesForShift.nonCompositedAnimations.push(...failures);
    }
  }
  return allAnimationFailures;
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
function getNextEvent(sourceEvents, targetEvent) {
  const index = Platform.ArrayUtilities.nearestIndexFromBeginning(
    sourceEvents,
    (source) => source.ts > targetEvent.ts + (targetEvent.dur || 0)
  );
  if (index === null) {
    return void 0;
  }
  return sourceEvents[index];
}
function getIframeRootCauses(iframeCreatedEvents, prePaintEvents, shiftsByPrePaint, rootCausesByShift, domLoadingEvents) {
  for (const iframeEvent of iframeCreatedEvents) {
    const nextPrePaint = getNextEvent(prePaintEvents, iframeEvent);
    if (!nextPrePaint) {
      continue;
    }
    const shifts = shiftsByPrePaint.get(nextPrePaint);
    if (!shifts) {
      continue;
    }
    for (const shift of shifts) {
      const rootCausesForShift = rootCausesByShift.get(shift);
      if (!rootCausesForShift) {
        throw new Error("Unaccounted shift");
      }
      const domEvent = domLoadingEvents.find((e) => {
        const maxIframe = Types.Timing.MicroSeconds(iframeEvent.ts + (iframeEvent.dur ?? 0));
        return e.ts >= iframeEvent.ts && e.ts <= maxIframe;
      });
      if (domEvent && domEvent.args.frame) {
        rootCausesForShift.iframeIds.push(domEvent.args.frame);
      }
    }
  }
  return rootCausesByShift;
}
function getUnsizedImageRootCauses(unsizedImageEvents, paintImageEvents, shiftsByPrePaint, rootCausesByShift) {
  shiftsByPrePaint.forEach((shifts, prePaint) => {
    const paintImage = getNextEvent(paintImageEvents, prePaint);
    const matchingNode = unsizedImageEvents.find((unsizedImage) => unsizedImage.args.data.nodeId === paintImage?.args.data.nodeId);
    if (!matchingNode) {
      return;
    }
    for (const shift of shifts) {
      const rootCausesForShift = rootCausesByShift.get(shift);
      if (!rootCausesForShift) {
        throw new Error("Unaccounted shift");
      }
      rootCausesForShift.unsizedImages.push(matchingNode.args.data.nodeId);
    }
  });
  return rootCausesByShift;
}
function getFontRootCauses(networkRequests, prePaintEvents, shiftsByPrePaint, rootCausesByShift) {
  const fontRequests = networkRequests.filter((req) => req.args.data.resourceType === "Font" && req.args.data.mimeType.startsWith("font"));
  for (const req of fontRequests) {
    const nextPrePaint = getNextEvent(prePaintEvents, req);
    if (!nextPrePaint) {
      continue;
    }
    if (!isInRootCauseWindow(req, nextPrePaint)) {
      continue;
    }
    const shifts = shiftsByPrePaint.get(nextPrePaint);
    if (!shifts) {
      continue;
    }
    for (const shift of shifts) {
      const rootCausesForShift = rootCausesByShift.get(shift);
      if (!rootCausesForShift) {
        throw new Error("Unaccounted shift");
      }
      rootCausesForShift.fontRequests.push(req);
    }
  }
  return rootCausesByShift;
}
function finalize(partialModel) {
  let maxScore = 0;
  for (const cluster of partialModel.clusters) {
    if (cluster.clusterCumulativeScore > maxScore) {
      maxScore = cluster.clusterCumulativeScore;
    }
  }
  return {
    title: i18nString(UIStrings.title),
    description: i18nString(UIStrings.description),
    category: InsightCategory.CLS,
    // TODO: getTopCulprits in component needs to move to model so this can be set properly here.
    shouldShow: maxScore > 0,
    ...partialModel
  };
}
export function generateInsight(parsedTrace, context) {
  const isWithinContext = (event) => Helpers.Timing.eventIsInBounds(event, context.bounds);
  const compositeAnimationEvents = parsedTrace.Animations.animations.filter(isWithinContext);
  const iframeEvents = parsedTrace.LayoutShifts.renderFrameImplCreateChildFrameEvents.filter(isWithinContext);
  const networkRequests = parsedTrace.NetworkRequests.byTime.filter(isWithinContext);
  const domLoadingEvents = parsedTrace.LayoutShifts.domLoadingEvents.filter(isWithinContext);
  const unsizedImageEvents = parsedTrace.LayoutShifts.layoutImageUnsizedEvents.filter(isWithinContext);
  const clusterKey = context.navigation ? context.navigationId : Types.Events.NO_NAVIGATION;
  const clusters = parsedTrace.LayoutShifts.clustersByNavigationId.get(clusterKey) ?? [];
  const clustersByScore = clusters.toSorted((a, b) => b.clusterCumulativeScore - a.clusterCumulativeScore);
  const worstCluster = clustersByScore.at(0);
  const layoutShifts = clusters.flatMap((cluster) => cluster.events);
  const prePaintEvents = parsedTrace.LayoutShifts.prePaintEvents.filter(isWithinContext);
  const paintImageEvents = parsedTrace.LayoutShifts.paintImageEvents.filter(isWithinContext);
  const rootCausesByShift = /* @__PURE__ */ new Map();
  const shiftsByPrePaint = getShiftsByPrePaintEvents(layoutShifts, prePaintEvents);
  for (const shift of layoutShifts) {
    rootCausesByShift.set(shift, { iframeIds: [], fontRequests: [], nonCompositedAnimations: [], unsizedImages: [] });
  }
  getIframeRootCauses(iframeEvents, prePaintEvents, shiftsByPrePaint, rootCausesByShift, domLoadingEvents);
  getFontRootCauses(networkRequests, prePaintEvents, shiftsByPrePaint, rootCausesByShift);
  getUnsizedImageRootCauses(unsizedImageEvents, paintImageEvents, shiftsByPrePaint, rootCausesByShift);
  const animationFailures = getNonCompositedFailureRootCauses(compositeAnimationEvents, prePaintEvents, shiftsByPrePaint, rootCausesByShift);
  const relatedEvents = [...layoutShifts];
  if (worstCluster) {
    relatedEvents.push(worstCluster);
  }
  return finalize({
    relatedEvents,
    animationFailures,
    shifts: rootCausesByShift,
    clusters,
    worstCluster
  });
}
//# sourceMappingURL=CLSCulprits.js.map

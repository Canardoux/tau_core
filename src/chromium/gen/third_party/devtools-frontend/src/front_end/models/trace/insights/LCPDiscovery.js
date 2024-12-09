"use strict";
import * as i18n from "../../../core/i18n/i18n.js";
import * as Handlers from "../handlers/handlers.js";
import * as Helpers from "../helpers/helpers.js";
import * as Types from "../types/types.js";
import {
  InsightCategory,
  InsightWarning
} from "./types.js";
const UIStrings = {
  /**
   *@description Title of an insight that provides details about the LCP metric, and the network requests necessary to load it. Details how the LCP request was discoverable - in other words, the path necessary to load it (ex: network requests, JavaScript)
   */
  title: "LCP request discovery",
  /**
   *@description Description of an insight that provides details about the LCP metric, and the network requests necessary to load it.
   */
  description: "Optimize LCP by making the LCP image [discoverable](https://web.dev/articles/optimize-lcp#1_eliminate_resource_load_delay) from the HTML immediately, and [avoiding lazy-loading](https://web.dev/articles/lcp-lazy-loading)"
};
const str_ = i18n.i18n.registerUIStrings("models/trace/insights/LCPDiscovery.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
export function deps() {
  return ["NetworkRequests", "PageLoadMetrics", "LargestImagePaint", "Meta"];
}
function finalize(partialModel) {
  const relatedEvents = partialModel.lcpEvent && partialModel.lcpRequest ? (
    // TODO: add entire request initiator chain?
    [partialModel.lcpEvent, partialModel.lcpRequest]
  ) : [];
  return {
    title: i18nString(UIStrings.title),
    description: i18nString(UIStrings.description),
    category: InsightCategory.LCP,
    shouldShow: Boolean(
      partialModel.lcpRequest && (partialModel.shouldIncreasePriorityHint || partialModel.shouldPreloadImage || partialModel.shouldRemoveLazyLoading)
    ),
    ...partialModel,
    relatedEvents
  };
}
export function generateInsight(parsedTrace, context) {
  if (!context.navigation) {
    return finalize({});
  }
  const networkRequests = parsedTrace.NetworkRequests;
  const frameMetrics = parsedTrace.PageLoadMetrics.metricScoresByFrameId.get(context.frameId);
  if (!frameMetrics) {
    throw new Error("no frame metrics");
  }
  const navMetrics = frameMetrics.get(context.navigationId);
  if (!navMetrics) {
    throw new Error("no navigation metrics");
  }
  const metricScore = navMetrics.get(Handlers.ModelHandlers.PageLoadMetrics.MetricName.LCP);
  const lcpEvent = metricScore?.event;
  if (!lcpEvent || !Types.Events.isLargestContentfulPaintCandidate(lcpEvent)) {
    return finalize({ warnings: [InsightWarning.NO_LCP] });
  }
  const docRequest = networkRequests.byTime.find((req) => req.args.data.requestId === context.navigationId);
  if (!docRequest) {
    return finalize({ lcpEvent, warnings: [InsightWarning.NO_DOCUMENT_REQUEST] });
  }
  const lcpRequest = parsedTrace.LargestImagePaint.lcpRequestByNavigation.get(context.navigation);
  if (!lcpRequest) {
    return finalize({ lcpEvent });
  }
  const initiatorUrl = lcpRequest.args.data.initiator?.url;
  const initiatedByMainDoc = lcpRequest?.args.data.initiator?.type === "parser" && docRequest.args.data.url === initiatorUrl;
  const imgPreloadedOrFoundInHTML = lcpRequest?.args.data.isLinkPreload || initiatedByMainDoc;
  const imageLoadingAttr = lcpEvent.args.data?.loadingAttr;
  const imageFetchPriorityHint = lcpRequest?.args.data.fetchPriorityHint;
  const earliestDiscoveryTime = docRequest && docRequest.args.data.timing ? Helpers.Timing.secondsToMicroseconds(docRequest.args.data.timing.requestTime) + Helpers.Timing.millisecondsToMicroseconds(docRequest.args.data.timing.receiveHeadersStart) : void 0;
  return finalize({
    lcpEvent,
    shouldRemoveLazyLoading: imageLoadingAttr === "lazy",
    shouldIncreasePriorityHint: imageFetchPriorityHint !== "high",
    shouldPreloadImage: !imgPreloadedOrFoundInHTML,
    lcpRequest,
    earliestDiscoveryTimeTs: earliestDiscoveryTime ? Types.Timing.MicroSeconds(earliestDiscoveryTime) : void 0
  });
}
//# sourceMappingURL=LCPDiscovery.js.map

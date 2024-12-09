"use strict";
import * as i18n from "../../../core/i18n/i18n.js";
import * as Helpers from "../helpers/helpers.js";
import * as Types from "../types/types.js";
import { InsightCategory } from "./types.js";
const UIStrings = {
  /**
   *@description Title of an insight that provides a breakdown for how long it took to download the main document.
   */
  title: "Document request latency",
  /**
   *@description Description of an insight that provides a breakdown for how long it took to download the main document.
   */
  description: "Your first network request is the most important.  Reduce its latency by avoiding redirects, ensuring a fast server response, and enabling text compression."
};
const str_ = i18n.i18n.registerUIStrings("models/trace/insights/DocumentLatency.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
const TOO_SLOW_THRESHOLD_MS = 600;
const TARGET_MS = 100;
const IGNORE_THRESHOLD_IN_BYTES = 1400;
export function deps() {
  return ["Meta", "NetworkRequests"];
}
function getServerResponseTime(request) {
  const timing = request.args.data.timing;
  if (!timing) {
    return null;
  }
  const ms = Helpers.Timing.microSecondsToMilliseconds(request.args.data.syntheticData.waiting);
  return Math.round(ms);
}
function getCompressionSavings(request) {
  const patterns = [
    /^content-encoding$/i,
    /^x-content-encoding-over-network$/i
  ];
  const compressionTypes = ["gzip", "br", "deflate", "zstd"];
  const isCompressed = request.args.data.responseHeaders.some(
    (header) => patterns.some((p) => header.name.match(p)) && compressionTypes.includes(header.value)
  );
  if (isCompressed) {
    return 0;
  }
  const originalSize = request.args.data.decodedBodyLength;
  let estimatedSavings = 0;
  switch (request.args.data.mimeType) {
    case "text/css":
      estimatedSavings = Math.round(originalSize * 0.8);
      break;
    case "text/html":
    case "text/javascript":
      estimatedSavings = Math.round(originalSize * 0.67);
      break;
    case "text/plain":
    case "text/xml":
    case "text/x-component":
    case "application/javascript":
    case "application/json":
    case "application/manifest+json":
    case "application/vnd.api+json":
    case "application/xml":
    case "application/xhtml+xml":
    case "application/rss+xml":
    case "application/atom+xml":
    case "application/vnd.ms-fontobject":
    case "application/x-font-ttf":
    case "application/x-font-opentype":
    case "application/x-font-truetype":
    case "image/svg+xml":
    case "image/x-icon":
    case "image/vnd.microsoft.icon":
    case "font/ttf":
    case "font/eot":
    case "font/otf":
    case "font/opentype":
      estimatedSavings = Math.round(originalSize * 0.5);
      break;
    default:
  }
  return estimatedSavings < IGNORE_THRESHOLD_IN_BYTES ? 0 : estimatedSavings;
}
function finalize(partialModel) {
  let hasFailure = false;
  if (partialModel.data) {
    hasFailure = partialModel.data.redirectDuration > 0 || partialModel.data.serverResponseTooSlow || partialModel.data.uncompressedResponseBytes > 0;
  }
  return {
    title: i18nString(UIStrings.title),
    description: i18nString(UIStrings.description),
    category: InsightCategory.ALL,
    shouldShow: hasFailure,
    ...partialModel
  };
}
export function generateInsight(parsedTrace, context) {
  if (!context.navigation) {
    return finalize({});
  }
  const documentRequest = parsedTrace.NetworkRequests.byTime.find((req) => req.args.data.requestId === context.navigationId);
  if (!documentRequest) {
    throw new Error("missing document request");
  }
  const serverResponseTime = getServerResponseTime(documentRequest);
  if (serverResponseTime === null) {
    throw new Error("missing document request timing");
  }
  const serverResponseTooSlow = serverResponseTime > TOO_SLOW_THRESHOLD_MS;
  let overallSavingsMs = 0;
  if (serverResponseTime > TOO_SLOW_THRESHOLD_MS) {
    overallSavingsMs = Math.max(serverResponseTime - TARGET_MS, 0);
  }
  const redirectDuration = Math.round(documentRequest.args.data.syntheticData.redirectionDuration / 1e3);
  overallSavingsMs += redirectDuration;
  const metricSavings = {
    FCP: overallSavingsMs,
    LCP: overallSavingsMs
  };
  return finalize({
    relatedEvents: [documentRequest],
    data: {
      serverResponseTime,
      serverResponseTooSlow,
      redirectDuration: Types.Timing.MilliSeconds(redirectDuration),
      uncompressedResponseBytes: getCompressionSavings(documentRequest),
      documentRequest
    },
    metricSavings
  });
}
//# sourceMappingURL=DocumentLatency.js.map

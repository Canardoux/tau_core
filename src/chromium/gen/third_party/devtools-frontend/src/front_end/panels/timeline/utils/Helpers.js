"use strict";
import "../../../ui/components/markdown_view/markdown_view.js";
import * as Platform from "../../../core/platform/platform.js";
import * as CrUXManager from "../../../models/crux-manager/crux-manager.js";
import * as Marked from "../../../third_party/marked/marked.js";
import * as LitHtml from "../../../ui/lit-html/lit-html.js";
import * as MobileThrottling from "../../mobile_throttling/mobile_throttling.js";
const { html } = LitHtml;
export function getThrottlingRecommendations() {
  const cpuRate = 4;
  let networkConditions = null;
  const response = CrUXManager.CrUXManager.instance().getSelectedFieldMetricData("round_trip_time");
  if (response?.percentiles) {
    const rtt = Number(response.percentiles.p75);
    networkConditions = MobileThrottling.ThrottlingPresets.ThrottlingPresets.getRecommendedNetworkPreset(rtt);
  }
  return {
    cpuRate,
    networkConditions
  };
}
function createTrimmedUrlSearch(url) {
  const maxSearchValueLength = 8;
  let search = "";
  for (const [key, value] of url.searchParams) {
    if (search) {
      search += "&";
    }
    if (value) {
      search += `${key}=${Platform.StringUtilities.trimEndWithMaxLength(value, maxSearchValueLength)}`;
    } else {
      search += key;
    }
  }
  if (search) {
    search = "?" + search;
  }
  return search;
}
export function createUrlLabels(urls) {
  const labels = [];
  const isAllHttps = urls.every((url) => url.protocol === "https:");
  for (const [index, url] of urls.entries()) {
    const previousUrl = urls[index - 1];
    const sameHostAndProtocol = previousUrl && url.host === previousUrl.host && url.protocol === previousUrl.protocol;
    let elideHost = sameHostAndProtocol;
    let elideProtocol = isAllHttps;
    if (index === 0 && isAllHttps) {
      elideHost = true;
      elideProtocol = true;
    }
    const search = createTrimmedUrlSearch(url);
    if (!elideProtocol) {
      labels.push(`${url.protocol}//${url.host}${url.pathname}${search}`);
    } else if (!elideHost) {
      labels.push(`${url.host}${url.pathname}${search}`);
    } else {
      labels.push(`${url.pathname}${search}`);
    }
  }
  return labels.map((label) => label.length > 1 && label.endsWith("/") ? label.substring(0, label.length - 1) : label);
}
export function shortenUrl(url, maxChars = 20) {
  const parts = url.pathname.split("/");
  let shortenedUrl = parts.at(-1) ?? "";
  if (shortenedUrl.length > maxChars) {
    return Platform.StringUtilities.trimMiddle(shortenedUrl, maxChars);
  }
  let i = parts.length - 1;
  while (--i >= 0) {
    if (shortenedUrl.length + parts[i].length <= maxChars) {
      shortenedUrl = `${parts[i]}/${shortenedUrl}`;
    }
  }
  return shortenedUrl;
}
export function md(markdown) {
  const tokens = Marked.Marked.lexer(markdown);
  const data = { tokens };
  return html`<devtools-markdown-view .data=${data}></devtools-markdown-view>`;
}
//# sourceMappingURL=Helpers.js.map

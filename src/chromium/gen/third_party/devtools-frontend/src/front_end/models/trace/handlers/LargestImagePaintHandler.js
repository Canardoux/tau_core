"use strict";
import * as Types from "../types/types.js";
import { data as metaData } from "./MetaHandler.js";
import { data as networkRequestsData } from "./NetworkRequestsHandler.js";
const imageByDOMNodeId = /* @__PURE__ */ new Map();
const lcpRequestByNavigation = /* @__PURE__ */ new Map();
const lcpPaintEventByNavigation = /* @__PURE__ */ new Map();
let currentNavigation;
export function reset() {
  imageByDOMNodeId.clear();
  lcpRequestByNavigation.clear();
  lcpPaintEventByNavigation.clear();
  currentNavigation = null;
}
export function handleEvent(event) {
  if (Types.Events.isNavigationStart(event)) {
    currentNavigation = event;
    return;
  }
  if (!Types.Events.isLargestImagePaintCandidate(event)) {
    return;
  }
  if (!event.args.data) {
    return;
  }
  imageByDOMNodeId.set(event.args.data.DOMNodeId, event);
  lcpPaintEventByNavigation.set(currentNavigation, event);
}
export async function finalize() {
  const requests = networkRequestsData().byTime;
  const traceBounds = metaData().traceBounds;
  for (const [navigation, event] of lcpPaintEventByNavigation) {
    const lcpUrl = event.args.data?.imageUrl;
    if (!lcpUrl) {
      continue;
    }
    const startTime = navigation?.ts ?? traceBounds.min;
    const endTime = event.ts;
    let lcpRequest;
    for (const request of requests) {
      if (request.ts < startTime) {
        continue;
      }
      if (request.ts >= endTime) {
        break;
      }
      if (request.args.data.url === lcpUrl || request.args.data.redirects.some((r) => r.url === lcpUrl)) {
        lcpRequest = request;
        break;
      }
    }
    if (lcpRequest) {
      lcpRequestByNavigation.set(navigation, lcpRequest);
    }
  }
}
export function data() {
  return { imageByDOMNodeId, lcpRequestByNavigation };
}
export function deps() {
  return ["Meta", "NetworkRequests"];
}
//# sourceMappingURL=LargestImagePaintHandler.js.map

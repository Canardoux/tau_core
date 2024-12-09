"use strict";
import * as Common from "../../../core/common/common.js";
import * as Bindings from "../../../models/bindings/bindings.js";
export function getNetworkRequest(syntheticNetworkRequest) {
  const url = syntheticNetworkRequest.args.data.url;
  const urlWithoutHash = Common.ParsedURL.ParsedURL.urlWithoutHash(url);
  const resource = Bindings.ResourceUtils.resourceForURL(url) || Bindings.ResourceUtils.resourceForURL(urlWithoutHash);
  return resource?.request;
}
export function createTimelineNetworkRequest(syntheticNetworkRequest) {
  const request = getNetworkRequest(syntheticNetworkRequest);
  return request ? new TimelineNetworkRequest(request) : null;
}
export class TimelineNetworkRequest {
  #request;
  constructor(request) {
    this.#request = request;
  }
  get request() {
    return this.#request;
  }
}
//# sourceMappingURL=NetworkRequest.js.map

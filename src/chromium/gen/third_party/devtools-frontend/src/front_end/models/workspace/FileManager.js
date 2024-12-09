"use strict";
import * as Common from "../../core/common/common.js";
import * as Host from "../../core/host/host.js";
let fileManagerInstance;
export class FileManager extends Common.ObjectWrapper.ObjectWrapper {
  saveCallbacks;
  constructor() {
    super();
    this.saveCallbacks = /* @__PURE__ */ new Map();
    Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(
      Host.InspectorFrontendHostAPI.Events.SavedURL,
      this.savedURL,
      this
    );
    Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(
      Host.InspectorFrontendHostAPI.Events.CanceledSaveURL,
      this.canceledSavedURL,
      this
    );
    Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(
      Host.InspectorFrontendHostAPI.Events.AppendedToURL,
      this.appendedToURL,
      this
    );
  }
  static instance(opts = { forceNew: null }) {
    const { forceNew } = opts;
    if (!fileManagerInstance || forceNew) {
      fileManagerInstance = new FileManager();
    }
    return fileManagerInstance;
  }
  // close() *must* be called, for the InspectorFrontendHostStub case, to complete the saving.
  save(url, content, forceSaveAs, isBase64) {
    const result = new Promise((resolve) => this.saveCallbacks.set(url, resolve));
    Host.InspectorFrontendHost.InspectorFrontendHostInstance.save(url, content, forceSaveAs, isBase64);
    return result;
  }
  savedURL(event) {
    const { url, fileSystemPath } = event.data;
    const callback = this.saveCallbacks.get(url);
    this.saveCallbacks.delete(url);
    if (callback) {
      callback({ fileSystemPath });
    }
  }
  canceledSavedURL({ data: url }) {
    const callback = this.saveCallbacks.get(url);
    this.saveCallbacks.delete(url);
    if (callback) {
      callback(null);
    }
  }
  append(url, content) {
    Host.InspectorFrontendHost.InspectorFrontendHostInstance.append(url, content);
  }
  close(url) {
    Host.InspectorFrontendHost.InspectorFrontendHostInstance.close(url);
  }
  appendedToURL({ data: url }) {
    this.dispatchEventToListeners("AppendedToURL" /* APPENDED_TO_URL */, url);
  }
}
export var Events = /* @__PURE__ */ ((Events2) => {
  Events2["APPENDED_TO_URL"] = "AppendedToURL";
  return Events2;
})(Events || {});
//# sourceMappingURL=FileManager.js.map

"use strict";
import * as Common from "../common/common.js";
import * as i18n from "../i18n/i18n.js";
import * as Platform from "../platform/platform.js";
import * as Root from "../root/root.js";
import {
  EventDescriptors,
  Events
} from "./InspectorFrontendHostAPI.js";
import { streamWrite as resourceLoaderStreamWrite } from "./ResourceLoader.js";
const UIStrings = {
  /**
   *@description Document title in Inspector Frontend Host of the DevTools window
   *@example {example.com} PH1
   */
  devtoolsS: "DevTools - {PH1}"
};
const str_ = i18n.i18n.registerUIStrings("core/host/InspectorFrontendHost.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
const MAX_RECORDED_HISTOGRAMS_SIZE = 100;
const OVERRIDES_FILE_SYSTEM_PATH = "/overrides";
export class InspectorFrontendHostStub {
  #urlsBeingSaved;
  events;
  #fileSystem = null;
  recordedCountHistograms = [];
  recordedEnumeratedHistograms = [];
  recordedPerformanceHistograms = [];
  constructor() {
    this.#urlsBeingSaved = /* @__PURE__ */ new Map();
    if (typeof document === "undefined") {
      return;
    }
    function stopEventPropagation(event) {
      const zoomModifier = this.platform() === "mac" ? event.metaKey : event.ctrlKey;
      if (zoomModifier && (event.key === "+" || event.key === "-")) {
        event.stopPropagation();
      }
    }
    document.addEventListener("keydown", (event) => {
      stopEventPropagation.call(this, event);
    }, true);
  }
  platform() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Windows NT")) {
      return "windows";
    }
    if (userAgent.includes("Mac OS X")) {
      return "mac";
    }
    return "linux";
  }
  loadCompleted() {
  }
  bringToFront() {
  }
  closeWindow() {
  }
  setIsDocked(isDocked, callback) {
    window.setTimeout(callback, 0);
  }
  showSurvey(trigger, callback) {
    window.setTimeout(() => callback({ surveyShown: false }), 0);
  }
  canShowSurvey(trigger, callback) {
    window.setTimeout(() => callback({ canShowSurvey: false }), 0);
  }
  /**
   * Requests inspected page to be placed atop of the inspector frontend with specified bounds.
   */
  setInspectedPageBounds(bounds) {
  }
  inspectElementCompleted() {
  }
  setInjectedScriptForOrigin(origin, script) {
  }
  inspectedURLChanged(url) {
    document.title = i18nString(UIStrings.devtoolsS, { PH1: url.replace(/^https?:\/\//, "") });
  }
  copyText(text) {
    if (text === void 0 || text === null) {
      return;
    }
    void navigator.clipboard.writeText(text);
  }
  openInNewTab(url) {
    window.open(url, "_blank");
  }
  openSearchResultsInNewTab(query) {
    Common.Console.Console.instance().error(
      "Search is not enabled in hosted mode. Please inspect using chrome://inspect"
    );
  }
  showItemInFolder(fileSystemPath) {
    Common.Console.Console.instance().error(
      "Show item in folder is not enabled in hosted mode. Please inspect using chrome://inspect"
    );
  }
  save(url, content, forceSaveAs, isBase64) {
    let buffer = this.#urlsBeingSaved.get(url);
    if (!buffer) {
      buffer = [];
      this.#urlsBeingSaved.set(url, buffer);
    }
    buffer.push(content);
    this.events.dispatchEventToListeners(Events.SavedURL, { url, fileSystemPath: url });
  }
  append(url, content) {
    const buffer = this.#urlsBeingSaved.get(url);
    if (buffer) {
      buffer.push(content);
      this.events.dispatchEventToListeners(Events.AppendedToURL, url);
    }
  }
  close(url) {
    const buffer = this.#urlsBeingSaved.get(url) || [];
    this.#urlsBeingSaved.delete(url);
    let fileName = "";
    if (url) {
      try {
        const trimmed = Platform.StringUtilities.trimURL(url);
        fileName = Platform.StringUtilities.removeURLFragment(trimmed);
      } catch (error) {
        fileName = url;
      }
    }
    const link = document.createElement("a");
    link.download = fileName;
    const blob = new Blob([buffer.join("")], { type: "text/plain" });
    const blobUrl = URL.createObjectURL(blob);
    link.href = blobUrl;
    link.click();
    URL.revokeObjectURL(blobUrl);
  }
  sendMessageToBackend(message) {
  }
  recordCountHistogram(histogramName, sample, min, exclusiveMax, bucketSize) {
    if (this.recordedCountHistograms.length >= MAX_RECORDED_HISTOGRAMS_SIZE) {
      this.recordedCountHistograms.shift();
    }
    this.recordedCountHistograms.push({ histogramName, sample, min, exclusiveMax, bucketSize });
  }
  recordEnumeratedHistogram(actionName, actionCode, bucketSize) {
    if (this.recordedEnumeratedHistograms.length >= MAX_RECORDED_HISTOGRAMS_SIZE) {
      this.recordedEnumeratedHistograms.shift();
    }
    this.recordedEnumeratedHistograms.push({ actionName, actionCode });
  }
  recordPerformanceHistogram(histogramName, duration) {
    if (this.recordedPerformanceHistograms.length >= MAX_RECORDED_HISTOGRAMS_SIZE) {
      this.recordedPerformanceHistograms.shift();
    }
    this.recordedPerformanceHistograms.push({ histogramName, duration });
  }
  recordUserMetricsAction(umaName) {
  }
  requestFileSystems() {
    this.events.dispatchEventToListeners(Events.FileSystemsLoaded, []);
  }
  addFileSystem(type) {
    const onFileSystem = (fs) => {
      this.#fileSystem = fs;
      const fileSystem = {
        fileSystemName: "sandboxedRequestedFileSystem",
        fileSystemPath: OVERRIDES_FILE_SYSTEM_PATH,
        rootURL: "filesystem:devtools://devtools/isolated/",
        type: "overrides"
      };
      this.events.dispatchEventToListeners(Events.FileSystemAdded, { fileSystem });
    };
    window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024, onFileSystem);
  }
  removeFileSystem(fileSystemPath) {
    const removalCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isDirectory) {
          entry.removeRecursively(() => {
          });
        } else if (entry.isFile) {
          entry.remove(() => {
          });
        }
      });
    };
    if (this.#fileSystem) {
      this.#fileSystem.root.createReader().readEntries(removalCallback);
    }
    this.#fileSystem = null;
    this.events.dispatchEventToListeners(Events.FileSystemRemoved, OVERRIDES_FILE_SYSTEM_PATH);
  }
  isolatedFileSystem(fileSystemId, registeredName) {
    return this.#fileSystem;
  }
  loadNetworkResource(url, headers, streamId, callback) {
    function isGzip(ab) {
      const buf = new Uint8Array(ab);
      if (!buf || buf.length < 3) {
        return false;
      }
      return buf[0] === 31 && buf[1] === 139 && buf[2] === 8;
    }
    fetch(url).then(async (result) => {
      const resultArrayBuf = await result.arrayBuffer();
      let decoded = resultArrayBuf;
      if (isGzip(resultArrayBuf)) {
        const ds = new DecompressionStream("gzip");
        const writer = ds.writable.getWriter();
        void writer.write(resultArrayBuf);
        void writer.close();
        decoded = ds.readable;
      }
      const text = await new Response(decoded).text();
      return text;
    }).then(function(text) {
      resourceLoaderStreamWrite(streamId, text);
      callback({
        statusCode: 200,
        headers: void 0,
        messageOverride: void 0,
        netError: void 0,
        netErrorName: void 0,
        urlValid: void 0
      });
    }).catch(function() {
      callback({
        statusCode: 404,
        headers: void 0,
        messageOverride: void 0,
        netError: void 0,
        netErrorName: void 0,
        urlValid: void 0
      });
    });
  }
  registerPreference(name, options) {
  }
  getPreferences(callback) {
    const prefs = {};
    for (const name in window.localStorage) {
      prefs[name] = window.localStorage[name];
    }
    callback(prefs);
  }
  getPreference(name, callback) {
    callback(window.localStorage[name]);
  }
  setPreference(name, value) {
    window.localStorage[name] = value;
  }
  removePreference(name) {
    delete window.localStorage[name];
  }
  clearPreferences() {
    window.localStorage.clear();
  }
  getSyncInformation(callback) {
    if ("getSyncInformationForTesting" in globalThis) {
      return callback(globalThis.getSyncInformationForTesting());
    }
    callback({
      isSyncActive: false,
      arePreferencesSynced: false
    });
  }
  getHostConfig(callback) {
    const result = {
      aidaAvailability: {
        enabled: true,
        blockedByAge: false,
        blockedByEnterprisePolicy: false,
        blockedByGeo: false,
        disallowLogging: true,
        enterprisePolicyValue: 0
      },
      devToolsConsoleInsights: {
        modelId: "",
        temperature: -1,
        enabled: false
      },
      devToolsFreestyler: {
        modelId: "",
        temperature: -1,
        enabled: false
      },
      devToolsVeLogging: {
        enabled: true,
        testing: false
      },
      devToolsPrivacyUI: {
        enabled: false
      },
      devToolsEnableOriginBoundCookies: {
        portBindingEnabled: false,
        schemeBindingEnabled: false
      },
      isOffTheRecord: false
    };
    if ("hostConfigForTesting" in globalThis) {
      const { hostConfigForTesting } = globalThis;
      for (const key of Object.keys(hostConfigForTesting)) {
        const mergeEntry = (key2) => {
          if (typeof result[key2] === "object" && typeof hostConfigForTesting[key2] === "object") {
            result[key2] = { ...result[key2], ...hostConfigForTesting[key2] };
          } else {
            result[key2] = hostConfigForTesting[key2] ?? result[key2];
          }
        };
        mergeEntry(key);
      }
    }
    callback(result);
  }
  upgradeDraggedFileSystemPermissions(fileSystem) {
  }
  indexPath(requestId, fileSystemPath, excludedFolders) {
  }
  stopIndexing(requestId) {
  }
  searchInPath(requestId, fileSystemPath, query) {
  }
  zoomFactor() {
    return 1;
  }
  zoomIn() {
  }
  zoomOut() {
  }
  resetZoom() {
  }
  setWhitelistedShortcuts(shortcuts) {
  }
  setEyeDropperActive(active) {
  }
  showCertificateViewer(certChain) {
  }
  reattach(callback) {
  }
  readyForTest() {
  }
  connectionReady() {
  }
  setOpenNewWindowForPopups(value) {
  }
  setDevicesDiscoveryConfig(config) {
  }
  setDevicesUpdatesEnabled(enabled) {
  }
  performActionOnRemotePage(pageId, action) {
  }
  openRemotePage(browserId, url) {
  }
  openNodeFrontend() {
  }
  showContextMenuAtPoint(x, y, items, document2) {
    throw "Soft context menu should be used";
  }
  isHostedMode() {
    return true;
  }
  setAddExtensionCallback(callback) {
  }
  async initialTargetId() {
    return null;
  }
  doAidaConversation(request, streamId, callback) {
    callback({
      error: "Not implemented"
    });
  }
  registerAidaClientEvent(request, callback) {
    callback({
      error: "Not implemented"
    });
  }
  recordImpression(event) {
  }
  recordResize(event) {
  }
  recordClick(event) {
  }
  recordHover(event) {
  }
  recordDrag(event) {
  }
  recordChange(event) {
  }
  recordKeyDown(event) {
  }
}
export let InspectorFrontendHostInstance = globalThis.InspectorFrontendHost;
class InspectorFrontendAPIImpl {
  constructor() {
    for (const descriptor of EventDescriptors) {
      this[descriptor[1]] = this.dispatch.bind(this, descriptor[0], descriptor[2], descriptor[3]);
    }
  }
  dispatch(name, signature, runOnceLoaded, ...params) {
    if (signature.length < 2) {
      try {
        InspectorFrontendHostInstance.events.dispatchEventToListeners(name, params[0]);
      } catch (error) {
        console.error(error + " " + error.stack);
      }
      return;
    }
    const data = {};
    for (let i = 0; i < signature.length; ++i) {
      data[signature[i]] = params[i];
    }
    try {
      InspectorFrontendHostInstance.events.dispatchEventToListeners(name, data);
    } catch (error) {
      console.error(error + " " + error.stack);
    }
  }
  streamWrite(id, chunk) {
    resourceLoaderStreamWrite(id, chunk);
  }
}
(function() {
  function initializeInspectorFrontendHost() {
    let proto;
    if (!InspectorFrontendHostInstance) {
      globalThis.InspectorFrontendHost = InspectorFrontendHostInstance = new InspectorFrontendHostStub();
    } else {
      proto = InspectorFrontendHostStub.prototype;
      for (const name of Object.getOwnPropertyNames(proto)) {
        const stub = proto[name];
        if (typeof stub !== "function" || InspectorFrontendHostInstance[name]) {
          continue;
        }
        console.error(`Incompatible embedder: method Host.InspectorFrontendHost.${name} is missing. Using stub instead.`);
        InspectorFrontendHostInstance[name] = stub;
      }
    }
    InspectorFrontendHostInstance.events = new Common.ObjectWrapper.ObjectWrapper();
  }
  initializeInspectorFrontendHost();
  globalThis.InspectorFrontendAPI = new InspectorFrontendAPIImpl();
})();
export function isUnderTest(prefs) {
  if (Root.Runtime.Runtime.queryParam("test")) {
    return true;
  }
  if (prefs) {
    return prefs["isUnderTest"] === "true";
  }
  return Common.Settings.Settings.hasInstance() && Common.Settings.Settings.instance().createSetting("isUnderTest", false).get();
}
//# sourceMappingURL=InspectorFrontendHost.js.map

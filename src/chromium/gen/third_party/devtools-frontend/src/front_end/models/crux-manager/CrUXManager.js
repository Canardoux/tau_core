"use strict";
import * as Common from "../../core/common/common.js";
import * as i18n from "../../core/i18n/i18n.js";
import * as SDK from "../../core/sdk/sdk.js";
import * as EmulationModel from "../../models/emulation/emulation.js";
const UIStrings = {
  /**
   * @description Warning message indicating that the user will see real user data for a URL which is different from the URL they are currently looking at.
   */
  fieldOverrideWarning: "Field data is configured for a different URL than the current page."
};
const str_ = i18n.i18n.registerUIStrings("models/crux-manager/CrUXManager.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
const CRUX_API_KEY = "AIzaSyCCSOx25vrb5z0tbedCB3_JRzzbVW6Uwgw";
const DEFAULT_ENDPOINT = `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${CRUX_API_KEY}`;
let cruxManagerInstance;
export const DEVICE_SCOPE_LIST = ["ALL", "DESKTOP", "PHONE"];
const pageScopeList = ["origin", "url"];
const metrics = [
  "largest_contentful_paint",
  "cumulative_layout_shift",
  "interaction_to_next_paint",
  "round_trip_time",
  "form_factors"
];
export class CrUXManager extends Common.ObjectWrapper.ObjectWrapper {
  #originCache = /* @__PURE__ */ new Map();
  #urlCache = /* @__PURE__ */ new Map();
  #mainDocumentUrl;
  #configSetting;
  #endpoint = DEFAULT_ENDPOINT;
  #pageResult;
  fieldDeviceOption = "AUTO";
  fieldPageScope = "url";
  constructor() {
    super();
    const hostConfig = Common.Settings.Settings.instance().getHostConfig();
    const useSessionStorage = !hostConfig || hostConfig.isOffTheRecord === true;
    const storageTypeForConsent = useSessionStorage ? Common.Settings.SettingStorageType.SESSION : Common.Settings.SettingStorageType.GLOBAL;
    this.#configSetting = Common.Settings.Settings.instance().createSetting(
      "field-data",
      { enabled: false, override: "", originMappings: [], overrideEnabled: false },
      storageTypeForConsent
    );
    this.#configSetting.addChangeListener(() => {
      void this.refresh();
    });
    SDK.TargetManager.TargetManager.instance().addModelListener(
      SDK.ResourceTreeModel.ResourceTreeModel,
      SDK.ResourceTreeModel.Events.FrameNavigated,
      this.#onFrameNavigated,
      this
    );
  }
  static instance(opts = { forceNew: null }) {
    const { forceNew } = opts;
    if (!cruxManagerInstance || forceNew) {
      cruxManagerInstance = new CrUXManager();
    }
    return cruxManagerInstance;
  }
  /** The most recent page result from the CrUX service. */
  get pageResult() {
    return this.#pageResult;
  }
  getConfigSetting() {
    return this.#configSetting;
  }
  isEnabled() {
    return this.#configSetting.get().enabled;
  }
  async getFieldDataForPage(pageUrl) {
    const pageResult = {
      "origin-ALL": null,
      "origin-DESKTOP": null,
      "origin-PHONE": null,
      "origin-TABLET": null,
      "url-ALL": null,
      "url-DESKTOP": null,
      "url-PHONE": null,
      "url-TABLET": null,
      warnings: []
    };
    try {
      const normalizedUrl = this.#normalizeUrl(pageUrl);
      const promises = [];
      for (const pageScope of pageScopeList) {
        for (const deviceScope of DEVICE_SCOPE_LIST) {
          const promise = this.#getScopedData(normalizedUrl, pageScope, deviceScope).then((response) => {
            pageResult[`${pageScope}-${deviceScope}`] = response;
          });
          promises.push(promise);
        }
      }
      await Promise.all(promises);
      this.#pageResult = pageResult;
    } catch (err) {
      console.error(err);
    } finally {
      return pageResult;
    }
  }
  #getMappedUrl(unmappedUrl) {
    try {
      const unmapped = new URL(unmappedUrl);
      const mappings = this.#configSetting.get().originMappings || [];
      const mapping = mappings.find((m) => m.developmentOrigin === unmapped.origin);
      if (!mapping) {
        return unmappedUrl;
      }
      const mapped = new URL(mapping.productionOrigin);
      mapped.pathname = unmapped.pathname;
      return mapped.href;
    } catch {
      return unmappedUrl;
    }
  }
  /**
   * In general, this function should use the main document URL
   * (i.e. the URL after all redirects but before SPA navigations)
   *
   * However, we can't detect the main document URL of the current page if it's
   * navigation occurred before DevTools was first opened. This function will fall
   * back to the currently inspected URL (i.e. what is displayed in the omnibox) if
   * the main document URL cannot be found.
   */
  async getFieldDataForCurrentPage() {
    const currentUrl = this.#mainDocumentUrl || await this.#getInspectedURL();
    const urlForCrux = this.#configSetting.get().overrideEnabled ? this.#configSetting.get().override || "" : this.#getMappedUrl(currentUrl);
    const result = await this.getFieldDataForPage(urlForCrux);
    this.#pageResult = result;
    if (currentUrl !== urlForCrux) {
      result.warnings.push(i18nString(UIStrings.fieldOverrideWarning));
    }
    return result;
  }
  async #getInspectedURL() {
    const targetManager = SDK.TargetManager.TargetManager.instance();
    let inspectedURL = targetManager.inspectedURL();
    if (!inspectedURL) {
      inspectedURL = await new Promise((resolve) => {
        function handler(event) {
          const newInspectedURL = event.data.inspectedURL();
          if (newInspectedURL) {
            resolve(newInspectedURL);
            targetManager.removeEventListener(SDK.TargetManager.Events.INSPECTED_URL_CHANGED, handler);
          }
        }
        targetManager.addEventListener(SDK.TargetManager.Events.INSPECTED_URL_CHANGED, handler);
      });
    }
    return inspectedURL;
  }
  async #onFrameNavigated(event) {
    if (!event.data.isPrimaryFrame()) {
      return;
    }
    this.#mainDocumentUrl = event.data.url;
    await this.refresh();
  }
  async refresh() {
    this.#pageResult = void 0;
    this.dispatchEventToListeners("field-data-changed" /* FIELD_DATA_CHANGED */, void 0);
    if (!this.#configSetting.get().enabled) {
      return;
    }
    this.#pageResult = await this.getFieldDataForCurrentPage();
    this.dispatchEventToListeners("field-data-changed" /* FIELD_DATA_CHANGED */, this.#pageResult);
  }
  #normalizeUrl(inputUrl) {
    const normalizedUrl = new URL(inputUrl);
    normalizedUrl.hash = "";
    normalizedUrl.search = "";
    return normalizedUrl;
  }
  async #getScopedData(normalizedUrl, pageScope, deviceScope) {
    const { origin, href: url, hostname } = normalizedUrl;
    if (hostname === "localhost" || hostname === "127.0.0.1" || !origin.startsWith("http")) {
      return null;
    }
    const cache = pageScope === "origin" ? this.#originCache : this.#urlCache;
    const cacheKey = pageScope === "origin" ? `${origin}-${deviceScope}` : `${url}-${deviceScope}`;
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse !== void 0) {
      return cachedResponse;
    }
    try {
      const formFactor = deviceScope === "ALL" ? void 0 : deviceScope;
      const result = pageScope === "origin" ? await this.#makeRequest({ origin, metrics, formFactor }) : await this.#makeRequest({ url, metrics, formFactor });
      cache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
  async #makeRequest(request) {
    const body = JSON.stringify(request);
    const response = await fetch(this.#endpoint, {
      method: "POST",
      body
    });
    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to fetch data from CrUX server (Status code: ${response.status})`);
    }
    const responseData = await response.json();
    if (response.status === 404) {
      if (responseData?.error?.status === "NOT_FOUND") {
        return null;
      }
      throw new Error(`Failed to fetch data from CrUX server (Status code: ${response.status})`);
    }
    if (!("record" in responseData)) {
      throw new Error(`Failed to find data in CrUX response: ${JSON.stringify(responseData)}`);
    }
    return responseData;
  }
  #getAutoDeviceScope() {
    const emulationModel = EmulationModel.DeviceModeModel.DeviceModeModel.tryInstance();
    if (emulationModel === null) {
      return "ALL";
    }
    if (emulationModel.isMobile()) {
      if (this.#pageResult?.[`${this.fieldPageScope}-PHONE`]) {
        return "PHONE";
      }
      return "ALL";
    }
    if (this.#pageResult?.[`${this.fieldPageScope}-DESKTOP`]) {
      return "DESKTOP";
    }
    return "ALL";
  }
  getSelectedDeviceScope() {
    return this.fieldDeviceOption === "AUTO" ? this.#getAutoDeviceScope() : this.fieldDeviceOption;
  }
  getSelectedFieldResponse() {
    const pageScope = this.fieldPageScope;
    const deviceScope = this.getSelectedDeviceScope();
    return this.getFieldResponse(pageScope, deviceScope);
  }
  getSelectedFieldMetricData(fieldMetric) {
    return this.getSelectedFieldResponse()?.record.metrics[fieldMetric];
  }
  getFieldResponse(pageScope, deviceScope) {
    return this.#pageResult?.[`${pageScope}-${deviceScope}`];
  }
  setEndpointForTesting(endpoint) {
    this.#endpoint = endpoint;
  }
}
export var Events = /* @__PURE__ */ ((Events2) => {
  Events2["FIELD_DATA_CHANGED"] = "field-data-changed";
  return Events2;
})(Events || {});
//# sourceMappingURL=CrUXManager.js.map

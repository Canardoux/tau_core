"use strict";
import * as Platform from "../platform/platform.js";
const queryParamsObject = new URLSearchParams(location.search);
let runtimePlatform = "";
let runtimeInstance;
export function getRemoteBase(location2 = self.location.toString()) {
  const url = new URL(location2);
  const remoteBase = url.searchParams.get("remoteBase");
  if (!remoteBase) {
    return null;
  }
  const version = /\/serve_file\/(@[0-9a-zA-Z]+)\/?$/.exec(remoteBase);
  if (!version) {
    return null;
  }
  return { base: `devtools://devtools/remote/serve_file/${version[1]}/`, version: version[1] };
}
export function getPathName() {
  return window.location.pathname;
}
export class Runtime {
  constructor() {
  }
  static instance(opts = { forceNew: null }) {
    const { forceNew } = opts;
    if (!runtimeInstance || forceNew) {
      runtimeInstance = new Runtime();
    }
    return runtimeInstance;
  }
  static removeInstance() {
    runtimeInstance = void 0;
  }
  static queryParam(name) {
    return queryParamsObject.get(name);
  }
  static setQueryParamForTesting(name, value) {
    queryParamsObject.set(name, value);
  }
  static experimentsSetting() {
    try {
      return Platform.StringUtilities.toKebabCaseKeys(
        JSON.parse(self.localStorage && self.localStorage["experiments"] ? self.localStorage["experiments"] : "{}")
      );
    } catch (e) {
      console.error("Failed to parse localStorage['experiments']");
      return {};
    }
  }
  static setPlatform(platform) {
    runtimePlatform = platform;
  }
  static platform() {
    return runtimePlatform;
  }
  static isDescriptorEnabled(descriptor, config) {
    const { experiment } = descriptor;
    if (experiment === "*") {
      return true;
    }
    if (experiment && experiment.startsWith("!") && experiments.isEnabled(experiment.substring(1))) {
      return false;
    }
    if (experiment && !experiment.startsWith("!") && !experiments.isEnabled(experiment)) {
      return false;
    }
    const { condition } = descriptor;
    return condition ? condition(config) : true;
  }
  loadLegacyModule(modulePath) {
    const importPath = `../../${modulePath}`;
    return import(importPath);
  }
}
export class ExperimentsSupport {
  #experiments;
  #experimentNames;
  #enabledTransiently;
  #enabledByDefault;
  #serverEnabled;
  constructor() {
    this.#experiments = [];
    this.#experimentNames = /* @__PURE__ */ new Set();
    this.#enabledTransiently = /* @__PURE__ */ new Set();
    this.#enabledByDefault = /* @__PURE__ */ new Set();
    this.#serverEnabled = /* @__PURE__ */ new Set();
  }
  allConfigurableExperiments() {
    const result = [];
    for (const experiment of this.#experiments) {
      if (!this.#enabledTransiently.has(experiment.name)) {
        result.push(experiment);
      }
    }
    return result;
  }
  setExperimentsSetting(value) {
    if (!self.localStorage) {
      return;
    }
    self.localStorage["experiments"] = JSON.stringify(value);
  }
  register(experimentName, experimentTitle, unstable, docLink, feedbackLink) {
    if (this.#experimentNames.has(experimentName)) {
      throw new Error(`Duplicate registraction of experiment '${experimentName}'`);
    }
    this.#experimentNames.add(experimentName);
    this.#experiments.push(new Experiment(
      this,
      experimentName,
      experimentTitle,
      Boolean(unstable),
      docLink ?? Platform.DevToolsPath.EmptyUrlString,
      feedbackLink ?? Platform.DevToolsPath.EmptyUrlString
    ));
  }
  isEnabled(experimentName) {
    this.checkExperiment(experimentName);
    if (Runtime.experimentsSetting()[experimentName] === false) {
      return false;
    }
    if (this.#enabledTransiently.has(experimentName) || this.#enabledByDefault.has(experimentName)) {
      return true;
    }
    if (this.#serverEnabled.has(experimentName)) {
      return true;
    }
    return Boolean(Runtime.experimentsSetting()[experimentName]);
  }
  setEnabled(experimentName, enabled) {
    this.checkExperiment(experimentName);
    const experimentsSetting = Runtime.experimentsSetting();
    experimentsSetting[experimentName] = enabled;
    this.setExperimentsSetting(experimentsSetting);
  }
  enableExperimentsTransiently(experimentNames) {
    for (const experimentName of experimentNames) {
      this.checkExperiment(experimentName);
      this.#enabledTransiently.add(experimentName);
    }
  }
  enableExperimentsByDefault(experimentNames) {
    for (const experimentName of experimentNames) {
      this.checkExperiment(experimentName);
      this.#enabledByDefault.add(experimentName);
    }
  }
  setServerEnabledExperiments(experimentNames) {
    for (const experiment of experimentNames) {
      this.checkExperiment(experiment);
      this.#serverEnabled.add(experiment);
    }
  }
  enableForTest(experimentName) {
    this.checkExperiment(experimentName);
    this.#enabledTransiently.add(experimentName);
  }
  disableForTest(experimentName) {
    this.checkExperiment(experimentName);
    this.#enabledTransiently.delete(experimentName);
  }
  clearForTest() {
    this.#experiments = [];
    this.#experimentNames.clear();
    this.#enabledTransiently.clear();
    this.#enabledByDefault.clear();
    this.#serverEnabled.clear();
  }
  cleanUpStaleExperiments() {
    const experimentsSetting = Runtime.experimentsSetting();
    const cleanedUpExperimentSetting = {};
    for (const { name: experimentName } of this.#experiments) {
      if (experimentsSetting.hasOwnProperty(experimentName)) {
        const isEnabled = experimentsSetting[experimentName];
        if (isEnabled || this.#enabledByDefault.has(experimentName)) {
          cleanedUpExperimentSetting[experimentName] = isEnabled;
        }
      }
    }
    this.setExperimentsSetting(cleanedUpExperimentSetting);
  }
  checkExperiment(experimentName) {
    if (!this.#experimentNames.has(experimentName)) {
      throw new Error(`Unknown experiment '${experimentName}'`);
    }
  }
}
export class Experiment {
  name;
  title;
  unstable;
  docLink;
  feedbackLink;
  #experiments;
  constructor(experiments2, name, title, unstable, docLink, feedbackLink) {
    this.name = name;
    this.title = title;
    this.unstable = unstable;
    this.docLink = docLink;
    this.feedbackLink = feedbackLink;
    this.#experiments = experiments2;
  }
  isEnabled() {
    return this.#experiments.isEnabled(this.name);
  }
  setEnabled(enabled) {
    this.#experiments.setEnabled(this.name, enabled);
  }
}
export const experiments = new ExperimentsSupport();
export var ExperimentName = /* @__PURE__ */ ((ExperimentName2) => {
  ExperimentName2["CAPTURE_NODE_CREATION_STACKS"] = "capture-node-creation-stacks";
  ExperimentName2["CSS_OVERVIEW"] = "css-overview";
  ExperimentName2["LIVE_HEAP_PROFILE"] = "live-heap-profile";
  ExperimentName2["ALL"] = "*";
  ExperimentName2["PROTOCOL_MONITOR"] = "protocol-monitor";
  ExperimentName2["FULL_ACCESSIBILITY_TREE"] = "full-accessibility-tree";
  ExperimentName2["STYLES_PANE_CSS_CHANGES"] = "styles-pane-css-changes";
  ExperimentName2["HEADER_OVERRIDES"] = "header-overrides";
  ExperimentName2["INSTRUMENTATION_BREAKPOINTS"] = "instrumentation-breakpoints";
  ExperimentName2["AUTHORED_DEPLOYED_GROUPING"] = "authored-deployed-grouping";
  ExperimentName2["JUST_MY_CODE"] = "just-my-code";
  ExperimentName2["HIGHLIGHT_ERRORS_ELEMENTS_PANEL"] = "highlight-errors-elements-panel";
  ExperimentName2["USE_SOURCE_MAP_SCOPES"] = "use-source-map-scopes";
  ExperimentName2["NETWORK_PANEL_FILTER_BAR_REDESIGN"] = "network-panel-filter-bar-redesign";
  ExperimentName2["AUTOFILL_VIEW"] = "autofill-view";
  ExperimentName2["TIMELINE_SHOW_POST_MESSAGE_EVENTS"] = "timeline-show-postmessage-events";
  ExperimentName2["TIMELINE_DEBUG_MODE"] = "timeline-debug-mode";
  ExperimentName2["TIMELINE_ENHANCED_TRACES"] = "timeline-enhanced-traces";
  ExperimentName2["TIMELINE_SERVER_TIMINGS"] = "timeline-server-timings";
  ExperimentName2["FLOATING_ENTRY_POINTS_FOR_AI_ASSISTANCE"] = "floating-entry-points-for-ai-assistance";
  ExperimentName2["TIMELINE_EXPERIMENTAL_INSIGHTS"] = "timeline-experimental-insights";
  ExperimentName2["TIMELINE_DIM_UNRELATED_EVENTS"] = "timeline-dim-unrelated-events";
  ExperimentName2["TIMELINE_ALTERNATIVE_NAVIGATION"] = "timeline-alternative-navigation";
  ExperimentName2["TIMELINE_IGNORE_LIST"] = "timeline-ignore-list";
  return ExperimentName2;
})(ExperimentName || {});
export var GenAiEnterprisePolicyValue = /* @__PURE__ */ ((GenAiEnterprisePolicyValue2) => {
  GenAiEnterprisePolicyValue2[GenAiEnterprisePolicyValue2["ALLOW"] = 0] = "ALLOW";
  GenAiEnterprisePolicyValue2[GenAiEnterprisePolicyValue2["ALLOW_WITHOUT_LOGGING"] = 1] = "ALLOW_WITHOUT_LOGGING";
  GenAiEnterprisePolicyValue2[GenAiEnterprisePolicyValue2["DISABLE"] = 2] = "DISABLE";
  return GenAiEnterprisePolicyValue2;
})(GenAiEnterprisePolicyValue || {});
export var HostConfigFreestylerExecutionMode = /* @__PURE__ */ ((HostConfigFreestylerExecutionMode2) => {
  HostConfigFreestylerExecutionMode2["ALL_SCRIPTS"] = "ALL_SCRIPTS";
  HostConfigFreestylerExecutionMode2["SIDE_EFFECT_FREE_SCRIPTS_ONLY"] = "SIDE_EFFECT_FREE_SCRIPTS_ONLY";
  HostConfigFreestylerExecutionMode2["NO_SCRIPTS"] = "NO_SCRIPTS";
  return HostConfigFreestylerExecutionMode2;
})(HostConfigFreestylerExecutionMode || {});
export const conditions = {
  canDock: () => Boolean(Runtime.queryParam("can_dock"))
};
//# sourceMappingURL=Runtime.js.map

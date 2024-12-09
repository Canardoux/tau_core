"use strict";
import * as Common from "../../core/common/common.js";
import { UISourceCode } from "./UISourceCode.js";
export var projectTypes = /* @__PURE__ */ ((projectTypes2) => {
  projectTypes2["Debugger"] = "debugger";
  projectTypes2["Formatter"] = "formatter";
  projectTypes2["Network"] = "network";
  projectTypes2["FileSystem"] = "filesystem";
  projectTypes2["ContentScripts"] = "contentscripts";
  projectTypes2["Service"] = "service";
  return projectTypes2;
})(projectTypes || {});
export class ProjectStore {
  workspaceInternal;
  idInternal;
  typeInternal;
  displayNameInternal;
  #uiSourceCodes;
  constructor(workspace, id, type, displayName) {
    this.workspaceInternal = workspace;
    this.idInternal = id;
    this.typeInternal = type;
    this.displayNameInternal = displayName;
    this.#uiSourceCodes = /* @__PURE__ */ new Map();
  }
  id() {
    return this.idInternal;
  }
  type() {
    return this.typeInternal;
  }
  displayName() {
    return this.displayNameInternal;
  }
  workspace() {
    return this.workspaceInternal;
  }
  createUISourceCode(url, contentType) {
    return new UISourceCode(this, url, contentType);
  }
  addUISourceCode(uiSourceCode) {
    const url = uiSourceCode.url();
    if (this.uiSourceCodeForURL(url)) {
      return false;
    }
    this.#uiSourceCodes.set(url, uiSourceCode);
    this.workspaceInternal.dispatchEventToListeners("UISourceCodeAdded" /* UISourceCodeAdded */, uiSourceCode);
    return true;
  }
  removeUISourceCode(url) {
    const uiSourceCode = this.#uiSourceCodes.get(url);
    if (uiSourceCode === void 0) {
      return;
    }
    this.#uiSourceCodes.delete(url);
    this.workspaceInternal.dispatchEventToListeners("UISourceCodeRemoved" /* UISourceCodeRemoved */, uiSourceCode);
  }
  removeProject() {
    this.workspaceInternal.removeProject(this);
    this.#uiSourceCodes.clear();
  }
  uiSourceCodeForURL(url) {
    return this.#uiSourceCodes.get(url) ?? null;
  }
  uiSourceCodes() {
    return this.#uiSourceCodes.values();
  }
  renameUISourceCode(uiSourceCode, newName) {
    const oldPath = uiSourceCode.url();
    const newPath = uiSourceCode.parentURL() ? Common.ParsedURL.ParsedURL.urlFromParentUrlAndName(uiSourceCode.parentURL(), newName) : Common.ParsedURL.ParsedURL.preEncodeSpecialCharactersInPath(newName);
    this.#uiSourceCodes.set(newPath, uiSourceCode);
    this.#uiSourceCodes.delete(oldPath);
  }
  // No-op implementation for a handfull of interface methods.
  rename(_uiSourceCode, _newName, _callback) {
  }
  excludeFolder(_path) {
  }
  deleteFile(_uiSourceCode) {
  }
  deleteDirectoryRecursively(_path) {
    return Promise.resolve(false);
  }
  remove() {
  }
  indexContent(_progress) {
  }
}
let workspaceInstance;
export class WorkspaceImpl extends Common.ObjectWrapper.ObjectWrapper {
  projectsInternal;
  hasResourceContentTrackingExtensionsInternal;
  constructor() {
    super();
    this.projectsInternal = /* @__PURE__ */ new Map();
    this.hasResourceContentTrackingExtensionsInternal = false;
  }
  static instance(opts = { forceNew: null }) {
    const { forceNew } = opts;
    if (!workspaceInstance || forceNew) {
      workspaceInstance = new WorkspaceImpl();
    }
    return workspaceInstance;
  }
  static removeInstance() {
    workspaceInstance = void 0;
  }
  uiSourceCode(projectId, url) {
    const project = this.projectsInternal.get(projectId);
    return project ? project.uiSourceCodeForURL(url) : null;
  }
  uiSourceCodeForURL(url) {
    for (const project of this.projectsInternal.values()) {
      const uiSourceCode = project.uiSourceCodeForURL(url);
      if (uiSourceCode) {
        return uiSourceCode;
      }
    }
    return null;
  }
  findCompatibleUISourceCodes(uiSourceCode) {
    const url = uiSourceCode.url();
    const contentType = uiSourceCode.contentType();
    const result = [];
    for (const project of this.projectsInternal.values()) {
      if (uiSourceCode.project().type() !== project.type()) {
        continue;
      }
      const candidate = project.uiSourceCodeForURL(url);
      if (candidate && candidate.url() === url && candidate.contentType() === contentType) {
        result.push(candidate);
      }
    }
    return result;
  }
  uiSourceCodesForProjectType(type) {
    const result = [];
    for (const project of this.projectsInternal.values()) {
      if (project.type() === type) {
        for (const uiSourceCode of project.uiSourceCodes()) {
          result.push(uiSourceCode);
        }
      }
    }
    return result;
  }
  addProject(project) {
    console.assert(!this.projectsInternal.has(project.id()), `A project with id ${project.id()} already exists!`);
    this.projectsInternal.set(project.id(), project);
    this.dispatchEventToListeners("ProjectAdded" /* ProjectAdded */, project);
  }
  removeProject(project) {
    this.projectsInternal.delete(project.id());
    this.dispatchEventToListeners("ProjectRemoved" /* ProjectRemoved */, project);
  }
  project(projectId) {
    return this.projectsInternal.get(projectId) || null;
  }
  projects() {
    return [...this.projectsInternal.values()];
  }
  projectsForType(type) {
    function filterByType(project) {
      return project.type() === type;
    }
    return this.projects().filter(filterByType);
  }
  uiSourceCodes() {
    const result = [];
    for (const project of this.projectsInternal.values()) {
      for (const uiSourceCode of project.uiSourceCodes()) {
        result.push(uiSourceCode);
      }
    }
    return result;
  }
  setHasResourceContentTrackingExtensions(hasExtensions) {
    this.hasResourceContentTrackingExtensionsInternal = hasExtensions;
  }
  hasResourceContentTrackingExtensions() {
    return this.hasResourceContentTrackingExtensionsInternal;
  }
}
export var Events = /* @__PURE__ */ ((Events2) => {
  Events2["UISourceCodeAdded"] = "UISourceCodeAdded";
  Events2["UISourceCodeRemoved"] = "UISourceCodeRemoved";
  Events2["UISourceCodeRenamed"] = "UISourceCodeRenamed";
  Events2["WorkingCopyChanged"] = "WorkingCopyChanged";
  Events2["WorkingCopyCommitted"] = "WorkingCopyCommitted";
  Events2["WorkingCopyCommittedByUser"] = "WorkingCopyCommittedByUser";
  Events2["ProjectAdded"] = "ProjectAdded";
  Events2["ProjectRemoved"] = "ProjectRemoved";
  return Events2;
})(Events || {});
//# sourceMappingURL=WorkspaceImpl.js.map

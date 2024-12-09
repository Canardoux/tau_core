"use strict";
import * as i18n from "../../core/i18n/i18n.js";
import * as Platform from "../../core/platform/platform.js";
import * as TextUtils from "../text_utils/text_utils.js";
import * as Workspace from "../workspace/workspace.js";
const UIStrings = {
  /**
   * @description Error message that is displayed in the Sources panel when can't be loaded.
   */
  unknownErrorLoadingFile: "Unknown error loading file"
};
const str_ = i18n.i18n.registerUIStrings("models/bindings/ContentProviderBasedProject.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
export class ContentProviderBasedProject extends Workspace.Workspace.ProjectStore {
  #isServiceProjectInternal;
  #uiSourceCodeToData;
  constructor(workspace, id, type, displayName, isServiceProject) {
    super(workspace, id, type, displayName);
    this.#isServiceProjectInternal = isServiceProject;
    this.#uiSourceCodeToData = /* @__PURE__ */ new WeakMap();
    workspace.addProject(this);
  }
  async requestFileContent(uiSourceCode) {
    const { contentProvider } = this.#uiSourceCodeToData.get(uiSourceCode);
    try {
      return await contentProvider.requestContentData();
    } catch (err) {
      return {
        error: err ? String(err) : i18nString(UIStrings.unknownErrorLoadingFile)
      };
    }
  }
  isServiceProject() {
    return this.#isServiceProjectInternal;
  }
  async requestMetadata(uiSourceCode) {
    const { metadata } = this.#uiSourceCodeToData.get(uiSourceCode);
    return metadata;
  }
  canSetFileContent() {
    return false;
  }
  async setFileContent(_uiSourceCode, _newContent, _isBase64) {
  }
  fullDisplayName(uiSourceCode) {
    let parentPath = uiSourceCode.parentURL().replace(/^(?:https?|file)\:\/\//, "");
    try {
      parentPath = decodeURI(parentPath);
    } catch (e) {
    }
    return parentPath + "/" + uiSourceCode.displayName(true);
  }
  mimeType(uiSourceCode) {
    const { mimeType } = this.#uiSourceCodeToData.get(uiSourceCode);
    return mimeType;
  }
  canRename() {
    return false;
  }
  rename(uiSourceCode, newName, callback) {
    const path = uiSourceCode.url();
    this.performRename(path, newName, (success, newName2) => {
      if (success && newName2) {
        this.renameUISourceCode(uiSourceCode, newName2);
      }
      callback(success, newName2);
    });
  }
  excludeFolder(_path) {
  }
  canExcludeFolder(_path) {
    return false;
  }
  async createFile(_path, _name, _content, _isBase64) {
    return null;
  }
  canCreateFile() {
    return false;
  }
  deleteFile(_uiSourceCode) {
  }
  remove() {
  }
  performRename(path, newName, callback) {
    callback(false);
  }
  searchInFileContent(uiSourceCode, query, caseSensitive, isRegex) {
    const { contentProvider } = this.#uiSourceCodeToData.get(uiSourceCode);
    return contentProvider.searchInContent(query, caseSensitive, isRegex);
  }
  async findFilesMatchingSearchRequest(searchConfig, filesMatchingFileQuery, progress) {
    const result = /* @__PURE__ */ new Map();
    progress.setTotalWork(filesMatchingFileQuery.length);
    await Promise.all(filesMatchingFileQuery.map(searchInContent.bind(this)));
    progress.done();
    return result;
    async function searchInContent(uiSourceCode) {
      let allMatchesFound = true;
      let matches = [];
      for (const query of searchConfig.queries().slice()) {
        const searchMatches = await this.searchInFileContent(uiSourceCode, query, !searchConfig.ignoreCase(), searchConfig.isRegex());
        if (!searchMatches.length) {
          allMatchesFound = false;
          break;
        }
        matches = Platform.ArrayUtilities.mergeOrdered(
          matches,
          searchMatches,
          TextUtils.ContentProvider.SearchMatch.comparator
        );
      }
      if (allMatchesFound) {
        result.set(uiSourceCode, matches);
      }
      progress.incrementWorked(1);
    }
  }
  indexContent(progress) {
    queueMicrotask(progress.done.bind(progress));
  }
  addUISourceCodeWithProvider(uiSourceCode, contentProvider, metadata, mimeType) {
    this.#uiSourceCodeToData.set(uiSourceCode, { mimeType, metadata, contentProvider });
    this.addUISourceCode(uiSourceCode);
  }
  addContentProvider(url, contentProvider, mimeType) {
    const uiSourceCode = this.createUISourceCode(url, contentProvider.contentType());
    this.addUISourceCodeWithProvider(uiSourceCode, contentProvider, null, mimeType);
    return uiSourceCode;
  }
  reset() {
    this.removeProject();
    this.workspace().addProject(this);
  }
  dispose() {
    this.removeProject();
  }
}
//# sourceMappingURL=ContentProviderBasedProject.js.map

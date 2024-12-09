"use strict";
import * as TextUtils from "../../models/text_utils/text_utils.js";
import * as i18n from "../i18n/i18n.js";
import { PageResourceLoader } from "./PageResourceLoader.js";
const UIStrings = {
  /**
   *@description Error message when failing to fetch a resource referenced in a source map
   *@example {https://example.com/sourcemap.map} PH1
   *@example {An error occurred} PH2
   */
  couldNotLoadContentForSS: "Could not load content for {PH1} ({PH2})"
};
const str_ = i18n.i18n.registerUIStrings("core/sdk/CompilerSourceMappingContentProvider.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
export class CompilerSourceMappingContentProvider {
  #sourceURL;
  #contentTypeInternal;
  #initiator;
  constructor(sourceURL, contentType, initiator) {
    this.#sourceURL = sourceURL;
    this.#contentTypeInternal = contentType;
    this.#initiator = initiator;
  }
  contentURL() {
    return this.#sourceURL;
  }
  contentType() {
    return this.#contentTypeInternal;
  }
  async requestContent() {
    const contentData = await this.requestContentData();
    return TextUtils.ContentData.ContentData.asDeferredContent(contentData);
  }
  async requestContentData() {
    try {
      const { content } = await PageResourceLoader.instance().loadResource(this.#sourceURL, this.#initiator);
      return new TextUtils.ContentData.ContentData(
        content,
        /* isBase64=*/
        false,
        this.#contentTypeInternal.canonicalMimeType()
      );
    } catch (e) {
      const error = i18nString(UIStrings.couldNotLoadContentForSS, { PH1: this.#sourceURL, PH2: e.message });
      console.error(error);
      return { error };
    }
  }
  async searchInContent(query, caseSensitive, isRegex) {
    const contentData = await this.requestContentData();
    return TextUtils.TextUtils.performSearchInContentData(contentData, query, caseSensitive, isRegex);
  }
}
//# sourceMappingURL=CompilerSourceMappingContentProvider.js.map

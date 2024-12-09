"use strict";
import { ContentData } from "./ContentData.js";
import { performSearchInContentData } from "./TextUtils.js";
export class StaticContentProvider {
  #contentURL;
  #contentType;
  #lazyContent;
  constructor(contentURL, contentType, lazyContent) {
    this.#contentURL = contentURL;
    this.#contentType = contentType;
    this.#lazyContent = lazyContent;
  }
  static fromString(contentURL, contentType, content) {
    const lazyContent = () => Promise.resolve(new ContentData(
      content,
      /* isBase64 */
      false,
      contentType.canonicalMimeType()
    ));
    return new StaticContentProvider(contentURL, contentType, lazyContent);
  }
  contentURL() {
    return this.#contentURL;
  }
  contentType() {
    return this.#contentType;
  }
  requestContent() {
    return this.#lazyContent().then(ContentData.asDeferredContent.bind(void 0));
  }
  requestContentData() {
    return this.#lazyContent();
  }
  async searchInContent(query, caseSensitive, isRegex) {
    const contentData = await this.requestContentData();
    return performSearchInContentData(contentData, query, caseSensitive, isRegex);
  }
}
//# sourceMappingURL=StaticContentProvider.js.map

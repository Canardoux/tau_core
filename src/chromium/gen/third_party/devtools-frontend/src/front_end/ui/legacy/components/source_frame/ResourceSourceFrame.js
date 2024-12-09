"use strict";
import * as Common from "../../../../core/common/common.js";
import * as i18n from "../../../../core/i18n/i18n.js";
import * as FormatterActions from "../../../../entrypoints/formatter_worker/FormatterActions.js";
import * as TextUtils from "../../../../models/text_utils/text_utils.js";
import * as UI from "../../legacy.js";
import resourceSourceFrameStyles from "./resourceSourceFrame.css.legacy.js";
import { SourceFrameImpl } from "./SourceFrame.js";
const UIStrings = {
  /**
   *@description Text to find an item
   */
  find: "Find"
};
const str_ = i18n.i18n.registerUIStrings("ui/legacy/components/source_frame/ResourceSourceFrame.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
export class ResourceSourceFrame extends SourceFrameImpl {
  resourceInternal;
  #givenContentType;
  constructor(resource, givenContentType, options) {
    const isStreamingProvider = TextUtils.ContentProvider.isStreamingContentProvider(resource);
    const lazyContent = isStreamingProvider ? () => resource.requestStreamingContent().then(TextUtils.StreamingContentData.asContentDataOrError) : () => resource.requestContentData();
    super(lazyContent, options);
    this.#givenContentType = givenContentType;
    this.resourceInternal = resource;
    if (isStreamingProvider) {
      void resource.requestStreamingContent().then((streamingContent) => {
        if (!TextUtils.StreamingContentData.isError(streamingContent)) {
          streamingContent.addEventListener(TextUtils.StreamingContentData.Events.CHUNK_ADDED, () => {
            void this.setContentDataOrError(Promise.resolve(streamingContent.content()));
          });
        }
      });
    }
  }
  static createSearchableView(resource, contentType) {
    return new SearchableContainer(resource, contentType);
  }
  getContentType() {
    return this.#givenContentType;
  }
  get resource() {
    return this.resourceInternal;
  }
  populateTextAreaContextMenu(contextMenu, lineNumber, columnNumber) {
    super.populateTextAreaContextMenu(contextMenu, lineNumber, columnNumber);
    contextMenu.appendApplicableItems(this.resourceInternal);
  }
}
export class SearchableContainer extends UI.Widget.VBox {
  sourceFrame;
  constructor(resource, contentType) {
    super(true);
    this.registerRequiredCSS(resourceSourceFrameStyles);
    const simpleContentType = Common.ResourceType.ResourceType.simplifyContentType(contentType);
    const sourceFrame = new ResourceSourceFrame(resource, simpleContentType);
    this.sourceFrame = sourceFrame;
    const canPrettyPrint = FormatterActions.FORMATTABLE_MEDIA_TYPES.includes(simpleContentType);
    sourceFrame.setCanPrettyPrint(
      canPrettyPrint,
      true
      /* autoPrettyPrint */
    );
    const searchableView = new UI.SearchableView.SearchableView(sourceFrame, sourceFrame);
    searchableView.element.classList.add("searchable-view");
    searchableView.setPlaceholder(i18nString(UIStrings.find));
    sourceFrame.show(searchableView.element);
    sourceFrame.setSearchableView(searchableView);
    searchableView.show(this.contentElement);
    const toolbar = new UI.Toolbar.Toolbar("toolbar", this.contentElement);
    void sourceFrame.toolbarItems().then((items) => {
      items.map((item) => toolbar.appendToolbarItem(item));
    });
  }
  async revealPosition(position) {
    this.sourceFrame.revealPosition(position, true);
  }
}
//# sourceMappingURL=ResourceSourceFrame.js.map

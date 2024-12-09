"use strict";
import * as i18n from "../../../../core/i18n/i18n.js";
import * as Platform from "../../../../core/platform/platform.js";
import * as TextUtils from "../../../../models/text_utils/text_utils.js";
import * as VisualLogging from "../../../visual_logging/visual_logging.js";
import * as UI from "../../legacy.js";
import fontViewStyles from "./fontView.css.legacy.js";
const UIStrings = {
  /**
   *@description Text that appears on a button for the font resource type filter.
   */
  font: "Font",
  /**
   *@description Aria accessible name in Font View of the Sources panel
   *@example {https://example.com} PH1
   */
  previewOfFontFromS: "Preview of font from {PH1}"
};
const str_ = i18n.i18n.registerUIStrings("ui/legacy/components/source_frame/FontView.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
export class FontView extends UI.View.SimpleView {
  url;
  contentProvider;
  mimeTypeLabel;
  fontPreviewElement;
  dummyElement;
  fontStyleElement;
  inResize;
  constructor(mimeType, contentProvider) {
    super(i18nString(UIStrings.font));
    this.registerRequiredCSS(fontViewStyles);
    this.element.classList.add("font-view");
    this.element.setAttribute("jslog", `${VisualLogging.pane("font-view")}`);
    this.url = contentProvider.contentURL();
    UI.ARIAUtils.setLabel(this.element, i18nString(UIStrings.previewOfFontFromS, { PH1: this.url }));
    this.contentProvider = contentProvider;
    this.mimeTypeLabel = new UI.Toolbar.ToolbarText(mimeType);
  }
  async toolbarItems() {
    return [this.mimeTypeLabel];
  }
  onFontContentLoaded(uniqueFontName, contentData) {
    const url = TextUtils.ContentData.ContentData.isError(contentData) ? this.url : contentData.asDataUrl();
    if (!this.fontStyleElement) {
      return;
    }
    this.fontStyleElement.textContent = Platform.StringUtilities.sprintf('@font-face { font-family: "%s"; src: url(%s); }', uniqueFontName, url);
    this.updateFontPreviewSize();
  }
  createContentIfNeeded() {
    if (this.fontPreviewElement) {
      return;
    }
    const uniqueFontName = `WebInspectorFontPreview${++fontId}`;
    this.fontStyleElement = document.createElement("style");
    void this.contentProvider.requestContentData().then((contentData) => {
      this.onFontContentLoaded(uniqueFontName, contentData);
    });
    this.element.appendChild(this.fontStyleElement);
    const fontPreview = document.createElement("div");
    for (let i = 0; i < FONT_PREVIEW_LINES.length; ++i) {
      if (i > 0) {
        fontPreview.createChild("br");
      }
      UI.UIUtils.createTextChild(fontPreview, FONT_PREVIEW_LINES[i]);
    }
    this.fontPreviewElement = fontPreview.cloneNode(true);
    if (!this.fontPreviewElement) {
      return;
    }
    UI.ARIAUtils.markAsHidden(this.fontPreviewElement);
    this.fontPreviewElement.style.overflow = "hidden";
    this.fontPreviewElement.style.setProperty("font-family", uniqueFontName);
    this.fontPreviewElement.style.setProperty("visibility", "hidden");
    this.dummyElement = fontPreview;
    this.dummyElement.style.visibility = "hidden";
    this.dummyElement.style.zIndex = "-1";
    this.dummyElement.style.display = "inline";
    this.dummyElement.style.position = "absolute";
    this.dummyElement.style.setProperty("font-family", uniqueFontName);
    this.dummyElement.style.setProperty("font-size", MEASUURE_FONT_SIZE + "px");
    this.element.appendChild(this.fontPreviewElement);
  }
  wasShown() {
    this.createContentIfNeeded();
    this.updateFontPreviewSize();
  }
  onResize() {
    if (this.inResize) {
      return;
    }
    this.inResize = true;
    try {
      this.updateFontPreviewSize();
    } finally {
      this.inResize = null;
    }
  }
  measureElement() {
    if (!this.dummyElement) {
      throw new Error("No font preview loaded");
    }
    this.element.appendChild(this.dummyElement);
    const result = { width: this.dummyElement.offsetWidth, height: this.dummyElement.offsetHeight };
    this.element.removeChild(this.dummyElement);
    return result;
  }
  updateFontPreviewSize() {
    if (!this.fontPreviewElement || !this.isShowing()) {
      return;
    }
    this.fontPreviewElement.style.removeProperty("visibility");
    const dimension = this.measureElement();
    const height = dimension.height;
    const width = dimension.width;
    const containerWidth = this.element.offsetWidth - 50;
    const containerHeight = this.element.offsetHeight - 30;
    if (!height || !width || !containerWidth || !containerHeight) {
      this.fontPreviewElement.style.removeProperty("font-size");
      return;
    }
    const widthRatio = containerWidth / width;
    const heightRatio = containerHeight / height;
    const finalFontSize = Math.floor(MEASUURE_FONT_SIZE * Math.min(widthRatio, heightRatio)) - 2;
    this.fontPreviewElement.style.setProperty("font-size", finalFontSize + "px", void 0);
  }
}
let fontId = 0;
const FONT_PREVIEW_LINES = ["ABCDEFGHIJKLM", "NOPQRSTUVWXYZ", "abcdefghijklm", "nopqrstuvwxyz", "1234567890"];
const MEASUURE_FONT_SIZE = 50;
//# sourceMappingURL=FontView.js.map

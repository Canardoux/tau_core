"use strict";
import * as Platform from "../../core/platform/platform.js";
import { ViewManager } from "./ViewManager.js";
import { VBox } from "./Widget.js";
export class SimpleView extends VBox {
  #title;
  #viewId;
  constructor(title, useShadowDom, viewId) {
    super(useShadowDom);
    this.#title = title;
    if (viewId) {
      if (!Platform.StringUtilities.isExtendedKebabCase(viewId)) {
        throw new Error(`Invalid view ID '${viewId}'`);
      }
    }
    this.#viewId = viewId ?? Platform.StringUtilities.toKebabCase(title);
  }
  viewId() {
    return this.#viewId;
  }
  title() {
    return this.#title;
  }
  isCloseable() {
    return false;
  }
  isTransient() {
    return false;
  }
  toolbarItems() {
    return Promise.resolve([]);
  }
  widget() {
    return Promise.resolve(this);
  }
  revealView() {
    return ViewManager.instance().revealView(this);
  }
  disposeView() {
  }
  isPreviewFeature() {
    return false;
  }
  iconName() {
    return void 0;
  }
}
//# sourceMappingURL=View.js.map

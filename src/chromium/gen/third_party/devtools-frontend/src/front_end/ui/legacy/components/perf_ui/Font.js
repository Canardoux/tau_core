"use strict";
import * as Host from "../../../../core/host/host.js";
let fontFamily = null;
export function getFontFamilyForCanvas() {
  if (fontFamily) {
    return fontFamily;
  }
  const bodyStyles = getComputedStyle(document.body);
  if (bodyStyles.fontFamily) {
    fontFamily = bodyStyles.fontFamily;
  } else {
    fontFamily = Host.Platform.fontFamily();
  }
  return fontFamily;
}
export const DEFAULT_FONT_SIZE = "11px";
//# sourceMappingURL=Font.js.map

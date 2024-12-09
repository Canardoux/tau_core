"use strict";
import * as UI from "../../legacy.js";
import { CSSLinearEasingModel } from "./CSSLinearEasingModel.js";
export class AnimationTimingModel {
  static parse(text) {
    const cssLinearEasingModel = CSSLinearEasingModel.parse(text);
    if (cssLinearEasingModel) {
      return cssLinearEasingModel;
    }
    return UI.Geometry.CubicBezier.parse(text) || null;
  }
}
export const LINEAR_BEZIER = UI.Geometry.LINEAR_BEZIER;
//# sourceMappingURL=AnimationTimingModel.js.map

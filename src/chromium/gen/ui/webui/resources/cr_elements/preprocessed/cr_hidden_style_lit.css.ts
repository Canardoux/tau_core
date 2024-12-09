import {css, CSSResultGroup} from '//resources/lit/v3_0/lit.rollup.js';


let instance: CSSResultGroup|null = null;
export function getCss() {
  return instance || (instance = [...[], css`
/* Included here so we don't have to include "iron-positioning" in every
 * stylesheet. See crbug.com/498405. */
[hidden],
:host([hidden]) {
  display: none !important;
}`]);
}
import {css, CSSResultGroup} from '//resources/lit/v3_0/lit.rollup.js';


let instance: CSSResultGroup|null = null;
export function getCss() {
  return instance || (instance = [...[], css`
:host {
  display: block;
}

:host(:not([show-all])) > ::slotted(:not(slot):not(.selected)) {
  display: none !important;
}`]);
}
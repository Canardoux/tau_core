import {css, CSSResultGroup} from '//resources/lit/v3_0/lit.rollup.js';
import './mwb_shared_vars.css.js';

let instance: CSSResultGroup|null = null;
export function getCss() {
  return instance || (instance = [...[], css`
a,
cr-button,
cr-icon-button,
div {
  cursor: default;
}

cr-icon-button {
  --cr-icon-button-icon-size: var(--mwb-icon-size);
  --cr-icon-button-size: calc(var(--mwb-icon-size) * 1.5);
}`]);
}
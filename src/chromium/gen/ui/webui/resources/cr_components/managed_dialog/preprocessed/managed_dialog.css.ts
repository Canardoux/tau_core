import {css, CSSResultGroup} from '//resources/lit/v3_0/lit.rollup.js';
import '//resources/cr_elements/cr_shared_vars.css.js';

let instance: CSSResultGroup|null = null;
export function getCss() {
  return instance || (instance = [...[], css`
cr-icon {
  --iron-icon-height: var(--cr-icon-size);
  --iron-icon-width: var(--cr-icon-size);
  padding-inline-end: 10px;
}

cr-dialog::part(body-container) {
  padding-inline-start: 35px;
}`]);
}
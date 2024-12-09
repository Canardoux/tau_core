import { css } from '//resources/lit/v3_0/lit.rollup.js';
import '../cr_shared_vars.css.js';
import '../icons.html.js';
let instance = null;
export function getCss() {
    return instance || (instance = [...[], css `
.buttons {
  --cr-feedback-buttons-icon-size_: 16px;
  display: grid;
  grid-auto-columns: var(--cr-feedback-buttons-icon-size_);
  grid-auto-rows: var(--cr-feedback-buttons-icon-size_);
  grid-auto-flow: column;
  gap: 12px;
  align-items: center;
  justify-items: center;
}

cr-icon-button {
  --cr-icon-button-fill-color: currentColor;
  --cr-icon-button-icon-size: var(--cr-feedback-buttons-icon-size_);
  --cr-icon-button-size: 24px;
  margin: 0;
}`]);
}

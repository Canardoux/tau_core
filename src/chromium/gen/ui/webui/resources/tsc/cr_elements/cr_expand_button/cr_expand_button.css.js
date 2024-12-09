import { css } from '//resources/lit/v3_0/lit.rollup.js';
import '../cr_shared_vars.css.js';
import { getCss as getCrActionableRowStyleLit } from '../cr_actionable_row_style_lit.css.js';
let instance = null;
export function getCss() {
    return instance || (instance = [...[getCrActionableRowStyleLit()], css `:host([disabled]) {
  opacity: 0.65;
  pointer-events: none;
}

:host([disabled]) cr-icon-button {
  display: var(--cr-expand-button-disabled-display, initial);
}

#label {
  flex: 1;
  padding: var(--cr-section-vertical-padding) 0;
}

cr-icon-button {
  --cr-icon-button-icon-size: var(--cr-expand-button-icon-size, 20px);
  --cr-icon-button-size: var(--cr-expand-button-size, 36px);
}`]);
}

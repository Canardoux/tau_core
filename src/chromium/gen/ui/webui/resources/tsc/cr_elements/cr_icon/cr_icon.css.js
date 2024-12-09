import { css } from '//resources/lit/v3_0/lit.rollup.js';
import { getCss as getCrHiddenStyleLit } from '../cr_hidden_style_lit.css.js';
let instance = null;
export function getCss() {
    return instance || (instance = [...[getCrHiddenStyleLit()], css `
:host {
  align-items: center;
  display: inline-flex;
  justify-content: center;
  position: relative;

  vertical-align: middle;

  /* TODO (rbpotter): Change variable names after migration. */
  fill: var(--iron-icon-fill-color, currentcolor);
  stroke: var(--iron-icon-stroke-color, none);

  width: var(--iron-icon-width, 24px);
  height: var(--iron-icon-height, 24px);
}`]);
}

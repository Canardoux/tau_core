import {css, CSSResultGroup} from '//resources/lit/v3_0/lit.rollup.js';
import {getCss as getCrHiddenStyleLit} from '../cr_hidden_style_lit.css.js';

let instance: CSSResultGroup|null = null;
export function getCss() {
  return instance || (instance = [...[getCrHiddenStyleLit()], css`
/* Intentionally empty */`]);
}
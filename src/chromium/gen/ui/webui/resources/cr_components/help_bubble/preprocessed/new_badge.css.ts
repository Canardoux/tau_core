import {css, CSSResultGroup} from '//resources/lit/v3_0/lit.rollup.js';
import '//resources/cr_elements/cr_shared_vars.css.js';
import {getCss as getCrSharedStyleLit} from '//resources/cr_elements/cr_shared_style_lit.css.js';

let instance: CSSResultGroup|null = null;
export function getCss() {
  return instance || (instance = [...[getCrSharedStyleLit()], css`
div {
  align-items: center;
  background-color: var(--color-badge-background);
  border-radius: 4px;
  display: flex;
  font-size: 9px;
  font-weight: 700;
  line-height: 9px;
  padding: 4px;
}`]);
}
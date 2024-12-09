import { css } from '//resources/lit/v3_0/lit.rollup.js';
import { getCss as getCrHiddenStyleLit } from '../cr_hidden_style_lit.css.js';
let instance = null;
export function getCss() {
    return instance || (instance = [...[getCrHiddenStyleLit()], css `
#content {
  display: flex;
  flex: 1;
}

.collapsible {
  overflow: hidden;
  text-overflow: ellipsis;
}

span {
  white-space: pre;
}

.elided-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}`]);
}

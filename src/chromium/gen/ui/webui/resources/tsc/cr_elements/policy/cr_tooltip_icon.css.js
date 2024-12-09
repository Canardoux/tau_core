import { css } from '//resources/lit/v3_0/lit.rollup.js';
import { getCss as getCrSharedStyleLit } from '../cr_shared_style_lit.css.js';
import '../cr_shared_vars.css.js';
let instance = null;
export function getCss() {
    return instance || (instance = [...[getCrSharedStyleLit()], css `
:host {
  display: flex;  /* Position independently from the line-height. */
}

cr-icon {
  --iron-icon-width: var(--cr-icon-size);
  --iron-icon-height: var(--cr-icon-size);
  --iron-icon-fill-color:
      var(--cr-tooltip-icon-fill-color, var(--google-grey-700));
}

@media (prefers-color-scheme: dark) {
  cr-icon {
    --iron-icon-fill-color:
        var(--cr-tooltip-icon-fill-color, var(--google-grey-500));
  }
}`]);
}

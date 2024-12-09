import { css } from '//resources/lit/v3_0/lit.rollup.js';
import { getCss as getCrActionableRowStyleLit } from '../cr_actionable_row_style_lit.css.js';
import { getCss as getCrHiddenStyleLit } from '../cr_hidden_style_lit.css.js';
import { getCss as getCrSharedStyleLit } from '../cr_shared_style_lit.css.js';
import '../cr_shared_vars.css.js';
let instance = null;
export function getCss() {
    return instance || (instance = [...[getCrActionableRowStyleLit(), getCrSharedStyleLit(), getCrHiddenStyleLit()], css `
:host {
  box-sizing: border-box;
  flex: 1;
  font-family: inherit;
  font-size: 100%;  /* Specifically for Mac OSX, harmless elsewhere. */
  line-height: 154%;  /* 20px. */
  min-height: var(--cr-section-min-height);
  padding: 0;
}

:host(:not([embedded])) {
  padding: 0 var(--cr-section-padding);
}

#startIcon {
  --iron-icon-fill-color: var(--cr-link-row-start-icon-color,
      var(--google-grey-700));
  display: flex;
  flex-shrink: 0;
  padding-inline-end: var(--cr-icon-button-margin-start);
  width: var(--cr-link-row-icon-width, var(--cr-icon-size));
}

@media (prefers-color-scheme: dark) {
  #startIcon {
    --iron-icon-fill-color: var(--cr-link-row-start-icon-color,
        var(--google-grey-500));
  }
}

#labelWrapper {
  flex: 1;
  flex-basis: 0.000000001px;
  padding-bottom: var(--cr-section-vertical-padding);
  padding-top: var(--cr-section-vertical-padding);
  text-align: start;
}

#label,
#subLabel {
  display: flex;
}

#buttonAriaDescription {
  clip: rect(0,0,0,0);
  display: block;
  position: fixed;
}`]);
}

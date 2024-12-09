import {css, CSSResultGroup} from '//resources/lit/v3_0/lit.rollup.js';
import '//resources/cr_elements/cr_shared_vars.css.js';

let instance: CSSResultGroup|null = null;
export function getCss() {
  return instance || (instance = [...[], css`
:host {
  --segmented-button-height: 44px;
  --segmented-button-width: 100%;
  --segmented-button-padding: 2px;
}

cr-radio-group {
  border: 1px var(--color-segmented-button-border,
      var(--cr-fallback-color-tonal-outline)) solid;
  border-radius: var(--segmented-button-height);
  box-sizing: border-box;
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  height: var(--segmented-button-height);
  padding: var(--segmented-button-padding);
  width: var(--segmented-button-width);
}

:host ::slotted(*) {
  min-height: 0;
  min-width: 0;
  padding: 0;
}`]);
}
import {css, CSSResultGroup} from '//resources/lit/v3_0/lit.rollup.js';


let instance: CSSResultGroup|null = null;
export function getCss() {
  return instance || (instance = [...[], css`
:host {
  --cr-grid-gap: 0px;
  --cr-column-width: auto;
  --cr-grid-width: fit-content;
}

#grid {
  display: grid;
  grid-gap: var(--cr-grid-gap);
  grid-template-columns: repeat(var(--cr-grid-columns), var(--cr-column-width));
  width: var(--cr-grid-width);
}

::slotted(*) {
  align-self: center;
  justify-self: center;
}`]);
}
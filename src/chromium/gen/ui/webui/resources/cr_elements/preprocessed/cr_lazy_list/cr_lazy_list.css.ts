import {css, CSSResultGroup} from '//resources/lit/v3_0/lit.rollup.js';


let instance: CSSResultGroup|null = null;
export function getCss() {
  return instance || (instance = [...[], css`
:host {
  display: block;
  position: relative;
}

#container > ::slotted(*) {
  box-sizing: border-box;
  contain-intrinsic-size: var(--list-item-size, 100px) auto;
  content-visibility: auto;
  width: 100%;
}`]);
}
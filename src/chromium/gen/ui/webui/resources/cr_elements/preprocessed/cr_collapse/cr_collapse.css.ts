import {css, CSSResultGroup} from '//resources/lit/v3_0/lit.rollup.js';


let instance: CSSResultGroup|null = null;
export function getCss() {
  return instance || (instance = [...[], css`
:host {
  --collapse-duration: var(--iron-collapse-transition-duration, 300ms);
  display: block;
  transition: max-height var(--collapse-duration) ease-out;
  overflow: visible;
}

:host([no-animation]) {
  transition: none;
}

:host(.collapse-closed) {
  display: none;
}

:host(:not(.collapse-opened)) {
  overflow: hidden;
}`]);
}
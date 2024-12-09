import { css } from '//resources/lit/v3_0/lit.rollup.js';
import '../cr_shared_vars.css.js';
let instance = null;
export function getCss() {
    return instance || (instance = [...[], css `
:host {
  display: inline-block;
}

:host ::slotted(*) {
  padding: var(--cr-radio-group-item-padding, 12px);
}

:host([disabled]) {
  cursor: initial;
  pointer-events: none;
  user-select: none;
}

:host([disabled]) ::slotted(*) {
  opacity: var(--cr-disabled-opacity);
}
`]);
}

import { css } from '//resources/lit/v3_0/lit.rollup.js';
let instance = null;
export function getCss() {
    return instance || (instance = [...[], css `
:host ::slotted([slot=view]) {
  bottom: 0;
  display: none;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
}

:host ::slotted(.active),
:host ::slotted(.closing) {
  display: block;
}`]);
}

import { css } from '//resources/lit/v3_0/lit.rollup.js';
let instance = null;
export function getCss() {
    return instance || (instance = [...[], css `
:host {
  bottom: 0;
  display: block;
  left: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  /* For rounded corners: http://jsbin.com/temexa/4. */
  transform: translate3d(0, 0, 0);
}

.ripple {
  background-color: currentcolor;
  left: 0;
  opacity: var(--paper-ripple-opacity, 0.25);
  pointer-events: none;
  position: absolute;
  will-change: height, transform, width;
}

.ripple,
:host(.circle) {
  border-radius: 50%;
}`]);
}

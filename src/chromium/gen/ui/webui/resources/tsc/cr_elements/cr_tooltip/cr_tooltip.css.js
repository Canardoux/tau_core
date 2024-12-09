import { css } from '//resources/lit/v3_0/lit.rollup.js';
import { getCss as getCrHiddenStyleLit } from '../cr_hidden_style_lit.css.js';
let instance = null;
export function getCss() {
    return instance || (instance = [...[getCrHiddenStyleLit()], css `
:host {
  display: block;
  position: absolute;
  outline: none;
  z-index: 1002;
  user-select: none;
  cursor: default;
}

#tooltip {
  display: block;
  outline: none;
  font-size: 10px;
  line-height: 1;
  background-color: var(--paper-tooltip-background, #616161);
  color: var(--paper-tooltip-text-color, white);
  padding: 8px;
  border-radius: 2px;
}

@keyframes keyFrameFadeInOpacity {
  0% {
    opacity: 0;
  }
  100% {
    opacity: var(--paper-tooltip-opacity, 0.9);
  }
}

@keyframes keyFrameFadeOutOpacity {
  0% {
    opacity: var(--paper-tooltip-opacity, 0.9);
  }
  100% {
    opacity: 0;
  }
}

.fade-in-animation {
  opacity: 0;
  animation-delay: var(--paper-tooltip-delay-in, 500ms);
  animation-name: keyFrameFadeInOpacity;
  animation-iteration-count: 1;
  animation-timing-function: ease-in;
  animation-duration: var(--paper-tooltip-duration-in, 500ms);
  animation-fill-mode: forwards;
}

.fade-out-animation {
  opacity: var(--paper-tooltip-opacity, 0.9);
  animation-delay: var(--paper-tooltip-delay-out, 0ms);
  animation-name: keyFrameFadeOutOpacity;
  animation-iteration-count: 1;
  animation-timing-function: ease-in;
  animation-duration: var(--paper-tooltip-duration-out, 500ms);
  animation-fill-mode: forwards;
}`]);
}

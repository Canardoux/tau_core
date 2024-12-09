import {css, CSSResultGroup} from '//resources/lit/v3_0/lit.rollup.js';
import {getCss as getCrHiddenStyleLit} from '../cr_hidden_style_lit.css.js';
import '../cr_shared_vars.css.js';

let instance: CSSResultGroup|null = null;
export function getCss() {
  return instance || (instance = [...[getCrHiddenStyleLit()], css`
:host {
  display: block;
  width: 200px;
  position: relative;
  overflow: hidden;
}

#progressContainer {
  position: relative;
}

#progressContainer,
/* the stripe for the indeterminate animation*/
:host([indeterminate]) #primaryProgress::after {
  height: var(--cr-progress-height, 4px);
}

#primaryProgress,
:host([indeterminate]) #primaryProgress::after {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

#progressContainer,
:host([indeterminate]) #primaryProgress::after {
  background: var(--cr-progress-container-color, var(--google-grey-300));
}

#primaryProgress {
  transform-origin: left center;
  transform: scaleX(0);
  will-change: transform;
}

#primaryProgress {
  background: var(--cr-progress-active-color, var(--google-green-500));
}

:host([disabled]) #primaryProgress {
  background: var(--cr-progress-disabled-active-color,
                  var(--google-grey-500));
}

:host([indeterminate]:not([disabled])) #primaryProgress {
  transform-origin: right center;
  animation: indeterminate-bar
      var(--cr-progress-indeterminate-cycle-duration, 2s) linear infinite;
}

:host([indeterminate]:not([disabled])) #primaryProgress::after {
  content: "";
  transform-origin: center center;

  animation: indeterminate-splitter
      var(--cr-progress-indeterminate-cycle-duration, 2s) linear infinite;
}

@keyframes indeterminate-bar {
  0% {
    transform: scaleX(1) translateX(-100%);
  }
  50% {
    transform: scaleX(1) translateX(0%);
  }
  75% {
    transform: scaleX(1) translateX(0%);
    animation-timing-function: cubic-bezier(.28,.62,.37,.91);
  }
  100% {
    transform: scaleX(0) translateX(0%);
  }
}

@keyframes indeterminate-splitter {
  0% {
    transform: scaleX(.75) translateX(-125%);
  }
  30% {
    transform: scaleX(.75) translateX(-125%);
    animation-timing-function: cubic-bezier(.42,0,.6,.8);
  }
  90% {
    transform: scaleX(.75) translateX(125%);
  }
  100% {
    transform: scaleX(.75) translateX(125%);
  }
}`]);
}
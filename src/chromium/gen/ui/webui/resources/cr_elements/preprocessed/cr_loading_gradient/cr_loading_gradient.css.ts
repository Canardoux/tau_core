import {css, CSSResultGroup} from '//resources/lit/v3_0/lit.rollup.js';


let instance: CSSResultGroup|null = null;
export function getCss() {
  return instance || (instance = [...[], css`

:host {
  --cr-loading-gradient-color-start: var(--color-loading-gradient-start,
      transparent);
  --cr-loading-gradient-color-middle: var(--color-loading-gradient-middle,
      var(--cr-fallback-color-primary-container));
  --cr-loading-gradient-color-end: var(--color-loading-gradient-end,
      rgb(231, 248, 237));

  display: flex;
  width: 100%;
  height: fit-content;
  position: relative;
}

@media (prefers-color-scheme: dark) {
  :host {
    --cr-loading-gradient-color-end: var(--color-loading-gradient-end,
        rgb(15, 82, 35));
  }
}

#gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
      135deg,
      var(--cr-loading-gradient-color-start) 0%,
      var(--cr-loading-gradient-color-middle) 20%,
      var(--cr-loading-gradient-color-end) 40%,
      var(--cr-loading-gradient-color-start) 60%,
      var(--cr-loading-gradient-color-middle) 80%,
      var(--cr-loading-gradient-color-end) 100%);
  background-position: 100% 100%;
  background-size: 250% 250%;
  animation: gradient 2s infinite linear;
}

@keyframes gradient {
  0% { background-position: 100% 100%; }
  100% { background-position: 0% 0%; }
}`]);
}
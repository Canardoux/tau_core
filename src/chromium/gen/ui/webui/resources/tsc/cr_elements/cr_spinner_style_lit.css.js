import { css } from '//resources/lit/v3_0/lit.rollup.js';
import './cr_shared_vars.css.js';
let instance = null;
export function getCss() {
    return instance || (instance = [...[], css `
.spinner {
  --cr-spinner-size: 28px;
  mask-image: url(//resources/images/throbber_small.svg);
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: var(--cr-spinner-size) var(--cr-spinner-size);
  background-color: var(--cr-spinner-color, var(--google-blue-500));
  height: var(--cr-spinner-size);
  width: var(--cr-spinner-size);
}

@media (prefers-color-scheme: dark) {
  .spinner {
    background-color: var(--cr-spinner-color, var(--google-blue-300));
  }
}`]);
}

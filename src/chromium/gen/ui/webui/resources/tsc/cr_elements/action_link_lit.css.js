import { css } from '//resources/lit/v3_0/lit.rollup.js';
import './cr_shared_vars.css.js';
let instance = null;
export function getCss() {
    return instance || (instance = [...[], css `
[is='action-link'] {
  cursor: pointer;
  display: inline-block;
  text-decoration: underline;
}

[is='action-link'],
[is='action-link']:active,
[is='action-link']:hover,
[is='action-link']:visited {
  color: var(--cr-link-color);
}

[is='action-link'][disabled] {
  color: var(--cr-fallback-color-disabled-foreground);
  cursor: default;
  pointer-events: none;
}

[is='action-link'].no-outline {
  outline: none;
}`]);
}

import { html } from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';
import './cr_shared_vars.css.js';
const styleMod = document.createElement('dom-module');
styleMod.appendChild(html `
  <template>
    <style>

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
}
    </style>
  </template>
`.content);
styleMod.register('action-link');

import {html} from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';
import './mwb_shared_vars.css.js';

const styleMod = document.createElement('dom-module');
styleMod.appendChild(html`
  <template>
    <style>

a,
cr-button,
cr-icon-button,
div {
  cursor: default;
}

cr-icon-button {
  --cr-icon-button-icon-size: var(--mwb-icon-size);
  --cr-icon-button-size: calc(var(--mwb-icon-size) * 1.5);
}
    </style>
  </template>
`.content);
styleMod.register('mwb-element-shared-style');
import {html} from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';
import './cr_shared_vars.css.js';

const styleMod = document.createElement('dom-module');
styleMod.appendChild(html`
  <template>
    <style>

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
}
    </style>
  </template>
`.content);
styleMod.register('cr-spinner-style');
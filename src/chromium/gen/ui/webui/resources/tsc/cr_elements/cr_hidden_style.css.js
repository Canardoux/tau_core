import { html } from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';
const styleMod = document.createElement('dom-module');
styleMod.appendChild(html `
  <template>
    <style>

/* Included here so we don't have to include "iron-positioning" in every
 * stylesheet. See crbug.com/498405. */
[hidden],
:host([hidden]) {
  display: none !important;
}
    </style>
  </template>
`.content);
styleMod.register('cr-hidden-style');

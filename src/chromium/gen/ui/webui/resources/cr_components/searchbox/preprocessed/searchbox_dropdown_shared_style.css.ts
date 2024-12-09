import {html} from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';


const styleMod = document.createElement('dom-module');
styleMod.appendChild(html`
  <template>
    <style>

.action-icon {
  --cr-icon-button-active-background-color:
      var(--color-new-tab-page-active-background);
  --cr-icon-button-fill-color: var(--color-searchbox-results-icon);
  --cr-icon-button-focus-outline-color:
      var(--color-searchbox-results-icon-focused-outline);
  --cr-icon-button-hover-background-color:
      var(--color-searchbox-results-button-hover);
  --cr-icon-button-icon-size: 16px;
  --cr-icon-button-margin-end: 0;
  --cr-icon-button-margin-start: 0;
  --cr-icon-button-size: 24px;
}
    </style>
  </template>
`.content);
styleMod.register('searchbox-dropdown-shared-style');
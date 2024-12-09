import {html} from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';
import '//resources/cr_elements/cr_shared_vars.css.js';

const styleMod = document.createElement('dom-module');
styleMod.appendChild(html`
  <template>
    <style>

.section-title {
  color: var(--cr-primary-text-color);
  font-size: 108%;
  font-weight: 400;
  letter-spacing: .25px;
  margin-bottom: 12px;
  margin-top: var(--cr-section-vertical-margin);
  outline: none;
  padding-bottom: 4px;
  padding-top: 8px;
}

.page-title {
  font-weight: 400;
}

.card {
  background-color: var(--cr-card-background-color);
  border-radius: var(--cr-card-border-radius);
  box-shadow: var(--cr-card-shadow);
}

.cr-centered-card-container {
  padding-bottom: 20px;
}
    </style>
  </template>
`.content);
styleMod.register('certificate-manager-style-v2');
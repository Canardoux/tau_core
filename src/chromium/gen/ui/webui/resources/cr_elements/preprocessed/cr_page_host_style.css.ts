import {html} from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';
import './cr_shared_vars.css.js';

const styleMod = document.createElement('dom-module');
styleMod.appendChild(html`
  <template>
    <style>

/* Common CSS properties for WebUI pages, such as an entire page or a standalone
 * dialog. The CSS here is in its own file so that the properties can be
 * imported independently and applied directly to the :host element without
 * having to import other shared CSS. */

:host {
  color: var(--cr-primary-text-color);
  line-height: 154%; /* Apply 20px default line-height to all text. */
  overflow: hidden; /* Prevent double scroll bar bugs. */
  user-select: text;
}
    </style>
  </template>
`.content);
styleMod.register('cr-page-host-style');
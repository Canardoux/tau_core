import {html} from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';
import './cr_shared_vars.css.js';
import './mwb_shared_vars.css.js';

const styleMod = document.createElement('dom-module');
styleMod.appendChild(html`
  <template>
    <style>

::-webkit-scrollbar-thumb {
  background-color: var(--mwb-scrollbar-thumb-color);
}

::-webkit-scrollbar-thumb:hover {
  background-color: var(--mwb-scrollbar-thumb-hover-color);
}

::-webkit-scrollbar-track {
  background-color: var(--mwb-scrollbar-track-color);
}

::-webkit-scrollbar {
  width: var(--mwb-scrollbar-width);
}

.mwb-list-item {
  align-items: center;
  background-color: var(--mwb-background-color);
  contain-intrinsic-size: var(--mwb-item-height);
  content-visibility: auto;
  display: flex;
  height: var(--mwb-item-height);
  padding: 0 var(--mwb-list-item-horizontal-margin);
}

.mwb-list-item.hovered {
  background-color: var(--mwb-list-item-hover-background-color);
}

.mwb-list-item.selected {
  background-color: var(--mwb-list-item-selected-background-color);
}
    </style>
  </template>
`.content);
styleMod.register('mwb-shared-style');
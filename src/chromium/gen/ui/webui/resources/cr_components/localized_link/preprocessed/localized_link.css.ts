import {css, CSSResultGroup} from '//resources/lit/v3_0/lit.rollup.js';
import '//resources/cr_elements/cr_shared_vars.css.js';
import {getCss as getCrSharedStyleLit} from '//resources/cr_elements/cr_shared_style_lit.css.js';

let instance: CSSResultGroup|null = null;
export function getCss() {
  return instance || (instance = [...[getCrSharedStyleLit()], css`
:host {
  --cr-localized-link-display: inline;
  display: block;
}

:host([link-disabled]) {
  cursor: pointer;
  opacity: var(--cr-disabled-opacity);
  pointer-events: none;
}

a {
  display: var(--cr-localized-link-display);
}

a[href] {
  color: var(--cr-link-color);
}

/**
 * Prevent action-links from being selected to avoid accidental
 * selection when trying to click it.
 */
a[is=action-link] {
  user-select: none;
}

#container {
  display: contents;
}`]);
}
import {css, CSSResultGroup} from '//resources/lit/v3_0/lit.rollup.js';
import './shared_vars.css.js';

let instance: CSSResultGroup|null = null;
export function getCss() {
  return instance || (instance = [...[], css`
:host {
  align-items: center;
  background-color: var(--entity-image-background-color);
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 8px;
  display: flex;
  flex-shrink: 0;
  height: 40px;
  justify-content: center;
  margin-inline: 0 16px;
  width: 40px;
}

:host([in-side-panel_]) {
  margin-inline: 8px 16px;
}

#page-image {
  border-radius: 5px;
  max-height: 100%;
  max-width: 100%;
}

:host([is-image-cover_]) #page-image {
  height: 100%;
  object-fit: cover;
  width: 100%;
}`]);
}
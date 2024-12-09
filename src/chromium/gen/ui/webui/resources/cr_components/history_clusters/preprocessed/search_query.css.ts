import {css, CSSResultGroup} from '//resources/lit/v3_0/lit.rollup.js';
import {getCss as getHistoryClustersSharedStyle} from './history_clusters_shared_style.css.js';

let instance: CSSResultGroup|null = null;
export function getCss() {
  return instance || (instance = [...[getHistoryClustersSharedStyle()], css`
:host {
  --border-color: var(--color-suggestion-chip-border,
      var(--cr-fallback-color-tonal-outline));
  --icon-color: var(--color-suggestion-chip-icon,
      var(--cr-fallback-color-primary));
  --pill-padding-text: 12px;
  --pill-padding-icon: 8px;
  --pill-height: 28px;
  display: block;
  min-width: 0;
}

a {
  align-items: center;
  color: inherit;
  display: flex;
  outline: none;
  text-decoration: none;
  overflow: hidden;
  position: relative;
}

:host-context(.focus-outline-visible) a:focus {
  box-shadow: inset 0 0 0 2px var(--cr-focus-outline-color);
}

:host-context(.focus-outline-visible) a:focus {
  --pill-padding-icon: 9px;
  --pill-padding-text: 13px;
  border: none;
  box-shadow: none;
  outline: 2px solid var(--cr-focus-outline-color);
  outline-offset: 0;
}

span {
  position: relative;
  z-index: 1;
}

.icon {
  --cr-icon-button-margin-start: 0;
  --cr-icon-color: var(--icon-color);
  --cr-icon-image: url(chrome://resources/images/icon_search.svg);
  --cr-icon-ripple-margin: 0;
  --cr-icon-ripple-size: 16px;
  --cr-icon-size: 16px;
}

cr-ripple {
  --paper-ripple-opacity: 1;
  color: var(--cr-active-background-color);
  display: block;
}

#hover-layer {
  display: none;
}

:host(:hover) #hover-layer {
  background: var(--cr-hover-background-color);
  content: '';
  display: block;
  inset: 0;
  pointer-events: none;
  position: absolute;
}`]);
}
import {css, CSSResultGroup} from '//resources/lit/v3_0/lit.rollup.js';
import {getCss as getCrHiddenStyleLit} from '//resources/cr_elements/cr_hidden_style_lit.css.js';
import {getCss as getCrSharedStyleLit} from '//resources/cr_elements/cr_shared_style_lit.css.js';
import '//resources/cr_elements/cr_shared_vars.css.js';
import './shared_vars.css.js';

let instance: CSSResultGroup|null = null;
export function getCss() {
  return instance || (instance = [...[getCrSharedStyleLit(),getCrHiddenStyleLit()], css`
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pill {
  border: 1px solid var(--border-color);
  border-radius: calc(var(--pill-height) / 2);
  box-sizing: border-box;
  font-size: 0.75rem; /* 12px */
  height: var(--pill-height);
  line-height: 1.5;  /* 21px */
}

.pill-icon-start {
  padding-inline-end: var(--pill-padding-text);
  padding-inline-start: var(--pill-padding-icon);
}

.pill-icon-start .icon {
  margin-inline-end: 4px;
}

.pill-icon-end {
  padding-inline-end: var(--pill-padding-icon);
  padding-inline-start: var(--pill-padding-text);
}

.pill-icon-end .icon {
  margin-inline-start: 8px;
}

.search-highlight-hit {
  --search-highlight-hit-background-color: none;
  --search-highlight-hit-color: none;
  font-weight: 700;
}

.timestamp-and-menu {
  align-items: center;
  display: flex;
  flex-shrink: 0;
}

.timestamp {
  color: var(--cr-secondary-text-color);
  flex-shrink: 0;
}`]);
}
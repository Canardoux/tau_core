import {css, CSSResultGroup} from '//resources/lit/v3_0/lit.rollup.js';
import {getCss as getHistoryClustersSharedStyle} from './history_clusters_shared_style.css.js';

let instance: CSSResultGroup|null = null;
export function getCss() {
  return instance || (instance = [...[getHistoryClustersSharedStyle()], css`
#actionMenuButton {
  --cr-icon-button-icon-size: 20px;
  --cr-icon-button-margin-end: 16px;
}

:host([in-side-panel_]) #actionMenuButton {
  --cr-icon-button-icon-size: 16px;
  --cr-icon-button-size: 24px;
  --cr-icon-button-margin-end: 8px;
}`]);
}
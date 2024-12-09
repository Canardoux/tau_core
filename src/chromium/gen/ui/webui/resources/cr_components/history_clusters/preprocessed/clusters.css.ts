import {css, CSSResultGroup} from '//resources/lit/v3_0/lit.rollup.js';
import {getCss as getHistoryClustersSharedStyle} from './history_clusters_shared_style.css.js';

let instance: CSSResultGroup|null = null;
export function getCss() {
  return instance || (instance = [...[getHistoryClustersSharedStyle()], css`
:host {
  color: var(--cr-primary-text-color);
  display: block;
  font-size: 0.875rem;  /* 14px */
}

:host([is-empty]) {
  padding-block: 80px;
}

cr-dialog::part(dialog) {
  --cr-dialog-width: min(calc(100% - 32px), 512px);
}

:host([in-side-panel_]) cr-toast {
  margin: 16px; /* Optimized for default side panel */
}

#clusters {
  margin: 0 auto;
  max-width: var(--cluster-max-width);
  min-width: var(--cluster-min-width);
  padding: var(--first-cluster-padding-top) var(--cluster-padding-horizontal) 0;
}

:host([in-side-panel_]) #clusters {
  min-width: 0;
  padding: 0;
}

:host(:not([in-side-panel_])) history-cluster {
  overflow-clip-margin: 8px;
}

:host-context(.focus-outline-visible) history-cluster:focus,
history-cluster:focus-visible {
  outline: none;
}

:host([in-side-panel_]) history-cluster {
  border-bottom: none;
}

:host([in-side-panel_]) history-cluster[is-last] {
  border-bottom: none;
}

#placeholder {
  align-items: center;
  color: var(--md-loading-message-color);
  display: flex;
  flex: 1;
  font-size: inherit;
  font-weight: 500;
  height: 100%;
  justify-content: center;
}

#footer {
  display: flex;
  justify-content: center;
  padding:
      0 var(--cluster-padding-horizontal) var(--cluster-padding-vertical);
}

:host([in-side-panel_]) #footer {
  padding-top: var(--cluster-padding-vertical);
}

/*TODO(mfacey): Refactor history clusters side panel to use shadow parts*/
:host([in-side-panel_]) cr-dialog {
  --cr-dialog-background-color:
      var(--color-history-clusters-side-panel-dialog-background);
  --cr-primary-text-color:
      var(--color-history-clusters-side-panel-dialog-primary-foreground);
  --cr-secondary-text-color:
      var(--color-history-clusters-side-panel-dialog-secondary-foreground);
  --cr-dialog-title-font-size: 16px;
  --cr-dialog-title-slot-padding-bottom: 8px;
  font-weight: 500;
}

:host([in-side-panel_]) cr-dialog::part(dialog) {
  --scroll-border-color:
      var(--color-history-clusters-side-panel-dialog-divider);
  border-radius: 12px;
  box-shadow: var(--cr-elevation-3);
}

.spinner-icon {
  height: 100%;
  width: 100%;
}`]);
}
import { getTrustedHTML } from '//resources/js/static_types.js';
export function getTemplate() {
    return getTrustedHTML `<!--_html_template_start_--><style>
  :host {
    clip: rect(0 0 0 0);
    height: 1px;
    overflow: hidden;
    position: fixed;
    width: 1px;
  }
</style>

<div id="messages" role="alert" aria-live="polite" aria-relevant="additions">
</div>
<!--_html_template_end_-->`;
}

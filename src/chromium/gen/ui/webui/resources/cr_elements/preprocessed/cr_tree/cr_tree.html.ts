import {getTrustedHTML} from '//resources/js/static_types.js';
export function getTemplate() {
  return getTrustedHTML`<!--_html_template_start_--><style>
  :host {
    display: block;
    outline: none;
    overflow: auto;
  }
</style>
<!--_html_template_end_-->`;
}
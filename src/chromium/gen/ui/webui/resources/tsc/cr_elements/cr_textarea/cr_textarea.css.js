import { css } from '//resources/lit/v3_0/lit.rollup.js';
import '../cr_shared_vars.css.js';
import { getCss as getCrHiddenStyleLit } from '../cr_hidden_style_lit.css.js';
import { getCss as getCrSharedStyleLit } from '../cr_shared_style_lit.css.js';
import { getCss as getCrInputStyleLit } from '../cr_input/cr_input_style_lit.css.js';
let instance = null;
export function getCss() {
    return instance || (instance = [...[getCrHiddenStyleLit(), getCrInputStyleLit(), getCrSharedStyleLit()], css `
textarea {
  display: block;
  resize: none;

  /* Ensures content sits above the hover layer. */
  position: relative;
  z-index: 1;
}

#input-container {
  background-color: var(--cr-input-background-color);
}

:host([autogrow][has-max-height]) #input-container {
  box-sizing: content-box;
  max-height: var(--cr-textarea-autogrow-max-height);
  min-height: 1lh;
}

:host([invalid]) #underline {
  border-color: var(--cr-input-error-color);
}

#input {
  padding-bottom: var(--cr-input-padding-bottom);
  padding-inline-end: var(--cr-input-padding-end);
  padding-inline-start: var(--cr-input-padding-start);
  padding-top: var(--cr-input-padding-top);
}

#footerContainer {
  border-top: 0;
  /* Components that use the footer should set this to "flex". */
  display: var(--cr-textarea-footer-display, none);
  font-size: var(--cr-form-field-label-font-size);
  height: var(--cr-form-field-label-height);
  justify-content: space-between;
  line-height: var(--cr-form-field-label-line-height);
  margin: 8px 0;
  min-height: 0;
  padding: 0;
  white-space: var(--cr-input-error-white-space);
}

:host([invalid]) #label,
:host([invalid]) #footerContainer {
  color: var(--cr-input-error-color);
}

#mirror {
  display: none;

  /* Must match textarea. */
  font-size: 12px;
  line-height: 16px;
}

:host([autogrow]) #mirror {
  display: block;
  visibility: hidden;
  white-space: pre-wrap;
  word-wrap: break-word;
}

:host([autogrow]) #mirror,
:host([autogrow]) textarea {
  border: 0;
  box-sizing: border-box;
  padding-bottom: var(--cr-input-padding-bottom, 6px);
  padding-inline-end: var(--cr-input-padding-end, 8px);
  padding-inline-start: var(--cr-input-padding-start, 8px);
  padding-top: var(--cr-input-padding-top, 6px);
}

:host([autogrow]) textarea {
  height: 100%;
  left: 0;
  overflow: hidden;
  position: absolute;
  resize: none;
  top: 0;
  width: 100%;
}

:host([autogrow][has-max-height]) #mirror,
:host([autogrow][has-max-height]) textarea {
  overflow-x: hidden;
  overflow-y: auto;
}`]);
}

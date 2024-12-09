import { css } from '//resources/lit/v3_0/lit.rollup.js';
import { getCss as getCrRadioButtonStyleLit } from './cr_radio_button_style_lit.css.js';
import { getCss as getCrHiddenStyleLit } from '../cr_hidden_style_lit.css.js';
import '../cr_shared_vars.css.js';
let instance = null;
export function getCss() {
    return instance || (instance = [...[getCrRadioButtonStyleLit(), getCrHiddenStyleLit()], css `
/* Intentionally empty */`]);
}

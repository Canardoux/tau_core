/**
 * @fileoverview 'managed-dialog' is a dialog that is displayed when a user
 * interact with some UI features which are managed by the user's organization.
 */
import '//resources/cr_elements/cr_button/cr_button.js';
import '//resources/cr_elements/cr_dialog/cr_dialog.js';
import '//resources/cr_elements/cr_icon/cr_icon.js';
import '//resources/cr_elements/icons.html.js';
import type { CrDialogElement } from '//resources/cr_elements/cr_dialog/cr_dialog.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
export interface ManagedDialogElement {
    $: {
        dialog: CrDialogElement;
    };
}
declare const ManagedDialogElementBase: typeof CrLitElement & (new (...args: any[]) => import("//resources/cr_elements/i18n_mixin_lit.js").I18nMixinLitInterface);
export declare class ManagedDialogElement extends ManagedDialogElementBase {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        /** Managed dialog title text. */
        title: {
            type: StringConstructor;
        };
        /** Managed dialog body text. */
        body: {
            type: StringConstructor;
        };
    };
    title: string;
    body: string;
    protected onOkClick_(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'managed-dialog': ManagedDialogElement;
    }
}
export {};

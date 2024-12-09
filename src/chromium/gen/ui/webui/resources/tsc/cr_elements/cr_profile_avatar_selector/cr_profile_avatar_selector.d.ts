/**
 * @fileoverview 'cr-profile-avatar-selector' is an element that displays
 * profile avatar icons and allows an avatar to be selected.
 */
import '../cr_button/cr_button.js';
import '../cr_grid/cr_grid.js';
import '../cr_icon/cr_icon.js';
import '../cr_tooltip/cr_tooltip.js';
import '../icons.html.js';
import { CrLitElement } from '//resources/lit/v3_0/lit.rollup.js';
import type { PropertyValues } from '//resources/lit/v3_0/lit.rollup.js';
export interface AvatarIcon {
    url: string;
    label: string;
    index: number;
    isGaiaAvatar: boolean;
    selected: boolean;
}
export declare class CrProfileAvatarSelectorElement extends CrLitElement {
    static get is(): string;
    static get styles(): import("//resources/lit/v3_0/lit.rollup.js").CSSResultGroup;
    render(): import("//resources/lit/v3_0/lit.rollup.js").TemplateResult<1>;
    static get properties(): {
        /**
         * The list of profile avatar URLs and labels.
         */
        avatars: {
            type: ArrayConstructor;
        };
        /**
         * The currently selected profile avatar icon, if any.
         */
        selectedAvatar: {
            type: ObjectConstructor;
            notify: boolean;
        };
        ignoreModifiedKeyEvents: {
            type: BooleanConstructor;
        };
        /**
         * The currently selected profile avatar icon index, or '-1' if none is
         * selected.
         */
        tabFocusableAvatar_: {
            type: NumberConstructor;
        };
        /**
         * Number of columns in the grid.
         */
        columns: {
            type: NumberConstructor;
        };
    };
    avatars: AvatarIcon[];
    selectedAvatar: AvatarIcon | null;
    ignoreModifiedKeyEvents: boolean;
    columns: number;
    private tabFocusableAvatar_;
    willUpdate(changedProperties: PropertyValues<this>): void;
    protected getAvatarId_(index: number): string;
    protected getTabIndex_(index: number, item: AvatarIcon): string;
    protected getSelectedClass_(avatarItem: AvatarIcon): string;
    protected isAvatarSelected_(avatarItem: AvatarIcon): boolean;
    protected onAvatarClick_(e: Event): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'cr-profile-avatar-selector': CrProfileAvatarSelectorElement;
    }
}

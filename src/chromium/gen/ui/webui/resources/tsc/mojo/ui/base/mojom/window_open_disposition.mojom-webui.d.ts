import { mojo } from '//resources/mojo/mojo/public/js/bindings.js';
export declare const WindowOpenDispositionSpec: {
    $: mojo.internal.MojomType;
};
export declare enum WindowOpenDisposition {
    MIN_VALUE = 0,
    MAX_VALUE = 11,
    UNKNOWN = 0,
    CURRENT_TAB = 1,
    SINGLETON_TAB = 2,
    NEW_FOREGROUND_TAB = 3,
    NEW_BACKGROUND_TAB = 4,
    NEW_POPUP = 5,
    NEW_WINDOW = 6,
    SAVE_TO_DISK = 7,
    OFF_THE_RECORD = 8,
    IGNORE_ACTION = 9,
    SWITCH_TO_TAB = 10,
    NEW_PICTURE_IN_PICTURE = 11
}
export declare const ClickModifiersSpec: {
    $: mojo.internal.MojomType;
};
export interface ClickModifiersMojoType {
    middleButton: boolean;
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
}
export type ClickModifiers = ClickModifiersMojoType;

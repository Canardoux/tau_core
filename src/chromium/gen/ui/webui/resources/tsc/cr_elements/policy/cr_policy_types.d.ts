/**
 * Strings required for policy indicators. These must be set at runtime.
 * Chrome OS only strings may be undefined.
 */
export interface CrPolicyStringsType {
    controlledSettingExtension: string;
    controlledSettingExtensionWithoutName: string;
    controlledSettingPolicy: string;
    controlledSettingRecommendedMatches: string;
    controlledSettingRecommendedDiffers: string;
    controlledSettingParent: string;
    controlledSettingChildRestriction: string;
}
declare global {
    interface Window {
        CrPolicyStrings: Partial<CrPolicyStringsType>;
    }
}
/**
 * Possible policy indicators that can be shown in settings.
 */
export declare enum CrPolicyIndicatorType {
    DEVICE_POLICY = "devicePolicy",
    EXTENSION = "extension",
    NONE = "none",
    OWNER = "owner",
    PRIMARY_USER = "primary_user",
    RECOMMENDED = "recommended",
    USER_POLICY = "userPolicy",
    PARENT = "parent",
    CHILD_RESTRICTION = "childRestriction"
}

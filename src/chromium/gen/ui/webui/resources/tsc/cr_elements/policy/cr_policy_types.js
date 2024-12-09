// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * Possible policy indicators that can be shown in settings.
 */
export var CrPolicyIndicatorType;
(function (CrPolicyIndicatorType) {
    CrPolicyIndicatorType["DEVICE_POLICY"] = "devicePolicy";
    CrPolicyIndicatorType["EXTENSION"] = "extension";
    CrPolicyIndicatorType["NONE"] = "none";
    CrPolicyIndicatorType["OWNER"] = "owner";
    CrPolicyIndicatorType["PRIMARY_USER"] = "primary_user";
    CrPolicyIndicatorType["RECOMMENDED"] = "recommended";
    CrPolicyIndicatorType["USER_POLICY"] = "userPolicy";
    CrPolicyIndicatorType["PARENT"] = "parent";
    CrPolicyIndicatorType["CHILD_RESTRICTION"] = "childRestriction";
})(CrPolicyIndicatorType || (CrPolicyIndicatorType = {}));

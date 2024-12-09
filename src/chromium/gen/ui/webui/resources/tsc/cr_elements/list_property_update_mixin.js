// Copyright 2021 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { calculateSplices, dedupingMixin } from '//resources/polymer/v3_0/polymer/polymer_bundled.min.js';
export const ListPropertyUpdateMixin = dedupingMixin((superClass) => {
    class ListPropertyUpdateMixin extends superClass {
        updateList(propertyPath, identityGetter, updatedList, identityBasedUpdate = false) {
            const list = this.get(propertyPath);
            const splices = calculateSplices(updatedList.map(item => identityGetter(item)), list.map(identityGetter));
            splices.forEach(splice => {
                const index = splice.index;
                const deleteCount = splice.removed.length;
                // Transform splices to the expected format of notifySplices().
                // Convert !Array<string> to !Array<!Object>.
                splice.removed = list.slice(index, index + deleteCount);
                splice.object = list;
                splice.type = 'splice';
                const added = updatedList.slice(index, index + splice.addedCount);
                const spliceParams = [index, deleteCount].concat(added);
                list.splice.apply(list, spliceParams);
            });
            let updated = splices.length > 0;
            if (!identityBasedUpdate) {
                list.forEach((item, index) => {
                    const updatedItem = updatedList[index];
                    if (JSON.stringify(item) !== JSON.stringify(updatedItem)) {
                        this.set([propertyPath, index], updatedItem);
                        updated = true;
                    }
                });
            }
            if (splices.length > 0) {
                this.notifySplices(propertyPath, splices);
            }
            return updated;
        }
    }
    return ListPropertyUpdateMixin;
});

// Copyright 2020 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview A helper object used to get a pluralized string.
 */
// clang-format off
import { sendWithPromise } from './cr.js';
export class PluralStringProxyImpl {
    getPluralString(messageName, itemCount) {
        return sendWithPromise('getPluralString', messageName, itemCount);
    }
    getPluralStringTupleWithComma(messageName1, itemCount1, messageName2, itemCount2) {
        return sendWithPromise('getPluralStringTupleWithComma', messageName1, itemCount1, messageName2, itemCount2);
    }
    getPluralStringTupleWithPeriods(messageName1, itemCount1, messageName2, itemCount2) {
        return sendWithPromise('getPluralStringTupleWithPeriods', messageName1, itemCount1, messageName2, itemCount2);
    }
    static getInstance() {
        return instance || (instance = new PluralStringProxyImpl());
    }
    static setInstance(obj) {
        instance = obj;
    }
}
let instance = null;

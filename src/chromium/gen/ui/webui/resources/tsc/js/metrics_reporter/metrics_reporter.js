// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { assert } from '../assert.js';
import { BrowserProxyImpl } from './browser_proxy.js';
function timeFromMojo(delta) {
    return delta.microseconds;
}
function timeToMojo(mark) {
    return { microseconds: mark };
}
export class MetricsReporterImpl {
    marks_ = new Map();
    browserProxy_ = BrowserProxyImpl.getInstance();
    constructor() {
        const callbackRouter = this.browserProxy_.getCallbackRouter();
        callbackRouter.onGetMark.addListener((name) => ({
            markedTime: this.marks_.has(name) ? timeToMojo(this.marks_.get(name)) : null,
        }));
        callbackRouter.onClearMark.addListener((name) => this.marks_.delete(name));
    }
    static getInstance() {
        return instance || (instance = new MetricsReporterImpl());
    }
    static setInstanceForTest(newInstance) {
        instance = newInstance;
    }
    mark(name) {
        this.marks_.set(name, this.browserProxy_.now());
    }
    async measure(startMark, endMark) {
        let endTime;
        if (endMark) {
            const entry = this.marks_.get(endMark);
            assert(entry, `Mark "${endMark}" does not exist locally.`);
            endTime = entry;
        }
        else {
            endTime = this.browserProxy_.now();
        }
        let startTime;
        if (this.marks_.has(startMark)) {
            startTime = this.marks_.get(startMark);
        }
        else {
            const remoteStartTime = await this.browserProxy_.getMark(startMark);
            assert(remoteStartTime.markedTime, `Mark "${startMark}" does not exist locally or remotely.`);
            startTime = timeFromMojo(remoteStartTime.markedTime);
        }
        return endTime - startTime;
    }
    async hasMark(name) {
        if (this.marks_.has(name)) {
            return true;
        }
        const remoteMark = await this.browserProxy_.getMark(name);
        return remoteMark !== null && remoteMark.markedTime !== null;
    }
    hasLocalMark(name) {
        return this.marks_.has(name);
    }
    clearMark(name) {
        this.marks_.delete(name);
        this.browserProxy_.clearMark(name);
    }
    umaReportTime(histogram, time) {
        this.browserProxy_.umaReportTime(histogram, timeToMojo(time));
    }
}
let instance = null;

"use strict";
class WorkItem {
  promise;
  trigger;
  cancel;
  label;
  #handler;
  constructor(label, initialHandler) {
    const { promise, resolve, reject } = Promise.withResolvers();
    this.promise = promise.then(() => this.#handler());
    this.trigger = resolve;
    this.cancel = reject;
    this.label = label;
    this.#handler = initialHandler;
  }
  set handler(newHandler) {
    this.#handler = newHandler;
  }
}
var ACTION = /* @__PURE__ */ ((ACTION2) => {
  ACTION2["READ"] = "read";
  ACTION2["WRITE"] = "write";
  return ACTION2;
})(ACTION || {});
export class RenderCoordinatorQueueEmptyEvent extends Event {
  static eventName = "renderqueueempty";
  constructor() {
    super(RenderCoordinatorQueueEmptyEvent.eventName);
  }
}
export class RenderCoordinatorNewFrameEvent extends Event {
  static eventName = "newframe";
  constructor() {
    super(RenderCoordinatorNewFrameEvent.eventName);
  }
}
let renderCoordinatorInstance;
const UNNAMED_READ = "Unnamed read";
const UNNAMED_WRITE = "Unnamed write";
const UNNAMED_SCROLL = "Unnamed scroll";
const DEADLOCK_TIMEOUT = 1500;
globalThis.__getRenderCoordinatorPendingFrames = function() {
  return RenderCoordinator.pendingFramesCount();
};
export class RenderCoordinator extends EventTarget {
  static instance({ forceNew = false } = {}) {
    if (!renderCoordinatorInstance || forceNew) {
      renderCoordinatorInstance = new RenderCoordinator();
    }
    return renderCoordinatorInstance;
  }
  static pendingFramesCount() {
    if (!renderCoordinatorInstance) {
      throw new Error("No render coordinator instance found.");
    }
    return renderCoordinatorInstance.hasPendingWork() ? 1 : 0;
  }
  // Toggle on to start tracking. You must call takeRecords() to
  // obtain the records. Please note: records are limited by maxRecordSize below.
  observe = false;
  recordStorageLimit = 100;
  // If true, only log activity with an explicit label.
  // This does not affect logging frames or queue empty events.
  observeOnlyNamed = true;
  #logInternal = [];
  #pendingReaders = [];
  #pendingWriters = [];
  #scheduledWorkId = 0;
  hasPendingWork() {
    return this.#pendingReaders.length !== 0 || this.#pendingWriters.length !== 0;
  }
  done(options) {
    if (!this.hasPendingWork() && !options?.waitForWork) {
      this.#logIfEnabled("[Queue empty]");
      return Promise.resolve();
    }
    return new Promise((resolve) => this.addEventListener("renderqueueempty", () => resolve(), { once: true }));
  }
  async read(labelOrCallback, callback) {
    if (typeof labelOrCallback === "string") {
      if (!callback) {
        throw new Error("Read called with label but no callback");
      }
      return this.#enqueueHandler("read" /* READ */, labelOrCallback, callback);
    }
    return this.#enqueueHandler("read" /* READ */, UNNAMED_READ, labelOrCallback);
  }
  async write(labelOrCallback, callback) {
    if (typeof labelOrCallback === "string") {
      if (!callback) {
        throw new Error("Write called with label but no callback");
      }
      return this.#enqueueHandler("write" /* WRITE */, labelOrCallback, callback);
    }
    return this.#enqueueHandler("write" /* WRITE */, UNNAMED_WRITE, labelOrCallback);
  }
  findPendingWrite(label) {
    return this.#enqueueHandler("write" /* WRITE */, label);
  }
  takeRecords() {
    const logs = [...this.#logInternal];
    this.#logInternal.length = 0;
    return logs;
  }
  async scroll(labelOrCallback, callback) {
    if (typeof labelOrCallback === "string") {
      if (!callback) {
        throw new Error("Scroll called with label but no callback");
      }
      return this.#enqueueHandler("read" /* READ */, labelOrCallback, callback);
    }
    return this.#enqueueHandler("read" /* READ */, UNNAMED_SCROLL, labelOrCallback);
  }
  #enqueueHandler(action, label, callback) {
    const hasName = ![UNNAMED_READ, UNNAMED_WRITE, UNNAMED_SCROLL].includes(label);
    label = `${action === "read" /* READ */ ? "[Read]" : "[Write]"}: ${label}`;
    let workItems = null;
    switch (action) {
      case "read" /* READ */:
        workItems = this.#pendingReaders;
        break;
      case "write" /* WRITE */:
        workItems = this.#pendingWriters;
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    let workItem = hasName ? workItems.find((w) => w.label === label) : void 0;
    if (callback) {
      if (!workItem) {
        workItem = new WorkItem(label, callback);
        workItems.push(workItem);
      } else {
        workItem.handler = callback;
      }
      this.#scheduleWork();
    }
    return workItem?.promise;
  }
  #scheduleWork() {
    const hasScheduledWork = this.#scheduledWorkId !== 0;
    if (hasScheduledWork) {
      return;
    }
    this.#scheduledWorkId = requestAnimationFrame(async () => {
      if (!this.hasPendingWork()) {
        this.dispatchEvent(new RenderCoordinatorQueueEmptyEvent());
        window.dispatchEvent(new RenderCoordinatorQueueEmptyEvent());
        this.#logIfEnabled("[Queue empty]");
        this.#scheduledWorkId = 0;
        return;
      }
      this.dispatchEvent(new RenderCoordinatorNewFrameEvent());
      this.#logIfEnabled("[New frame]");
      const readers = this.#pendingReaders;
      this.#pendingReaders = [];
      const writers = this.#pendingWriters;
      this.#pendingWriters = [];
      for (const reader of readers) {
        this.#logIfEnabled(reader.label);
        reader.trigger();
      }
      try {
        await Promise.race([
          Promise.all(readers.map((r) => r.promise)),
          new Promise((_, reject) => {
            window.setTimeout(
              () => reject(new Error(`Readers took over ${DEADLOCK_TIMEOUT}ms. Possible deadlock?`)),
              DEADLOCK_TIMEOUT
            );
          })
        ]);
      } catch (err) {
        this.#rejectAll(readers, err);
      }
      for (const writer of writers) {
        this.#logIfEnabled(writer.label);
        writer.trigger();
      }
      try {
        await Promise.race([
          Promise.all(writers.map((w) => w.promise)),
          new Promise((_, reject) => {
            window.setTimeout(
              () => reject(new Error(`Writers took over ${DEADLOCK_TIMEOUT}ms. Possible deadlock?`)),
              DEADLOCK_TIMEOUT
            );
          })
        ]);
      } catch (err) {
        this.#rejectAll(writers, err);
      }
      this.#scheduledWorkId = 0;
      this.#scheduleWork();
    });
  }
  #rejectAll(handlers, error) {
    for (const handler of handlers) {
      handler.cancel(error);
    }
  }
  cancelPending() {
    const error = new Error();
    this.#rejectAll(this.#pendingReaders, error);
    this.#rejectAll(this.#pendingWriters, error);
  }
  #logIfEnabled(value) {
    if (!this.observe || !value) {
      return;
    }
    const hasNoName = value.endsWith(UNNAMED_READ) || value.endsWith(UNNAMED_WRITE) || value.endsWith(UNNAMED_SCROLL);
    if (hasNoName && this.observeOnlyNamed) {
      return;
    }
    this.#logInternal.push({ time: performance.now(), value });
    while (this.#logInternal.length > this.recordStorageLimit) {
      this.#logInternal.shift();
    }
  }
}
//# sourceMappingURL=RenderCoordinator.js.map

"use strict";
export class TraceObject {
  traceEvents;
  metadata;
  constructor(traceEvents, metadata = {}) {
    this.traceEvents = traceEvents;
    this.metadata = metadata;
  }
}
export class RevealableEvent {
  // Only Trace.Types.Events.Event are passed in, but we can't depend on that type from SDK
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  constructor(event) {
    this.event = event;
  }
}
//# sourceMappingURL=TraceObject.js.map

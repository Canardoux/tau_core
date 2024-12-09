"use strict";
import * as Types from "../types/types.js";
export class TimelineJSProfileProcessor {
  static isNativeRuntimeFrame(frame) {
    return frame.url === "native V8Runtime";
  }
  static nativeGroup(nativeName) {
    if (nativeName.startsWith("Parse")) {
      return TimelineJSProfileProcessor.NativeGroups.PARSE;
    }
    if (nativeName.startsWith("Compile") || nativeName.startsWith("Recompile")) {
      return TimelineJSProfileProcessor.NativeGroups.COMPILE;
    }
    return null;
  }
  static createFakeTraceFromCpuProfile(profile, tid) {
    const events = [];
    const threadName = `Thread ${tid}`;
    appendEvent("TracingStartedInPage", { data: { sessionId: "1" } }, 0, 0, Types.Events.Phase.METADATA);
    appendEvent(Types.Events.Name.THREAD_NAME, { name: threadName }, 0, 0, Types.Events.Phase.METADATA, "__metadata");
    if (!profile) {
      return events;
    }
    appendEvent(
      "JSRoot",
      {},
      profile.startTime,
      profile.endTime - profile.startTime,
      Types.Events.Phase.COMPLETE,
      "toplevel"
    );
    appendEvent("CpuProfile", { data: { cpuProfile: profile } }, profile.endTime, 0, Types.Events.Phase.COMPLETE);
    return events;
    function appendEvent(name, args, ts, dur, ph, cat) {
      const event = {
        cat: cat || "disabled-by-default-devtools.timeline",
        name,
        ph: ph || Types.Events.Phase.COMPLETE,
        pid: Types.Events.ProcessID(1),
        tid,
        ts: Types.Timing.MicroSeconds(ts),
        args
      };
      if (dur) {
        event.dur = Types.Timing.MicroSeconds(dur);
      }
      events.push(event);
      return event;
    }
  }
}
((TimelineJSProfileProcessor2) => {
  let NativeGroups;
  ((NativeGroups2) => {
    NativeGroups2["COMPILE"] = "Compile";
    NativeGroups2["PARSE"] = "Parse";
  })(NativeGroups = TimelineJSProfileProcessor2.NativeGroups || (TimelineJSProfileProcessor2.NativeGroups = {}));
})(TimelineJSProfileProcessor || (TimelineJSProfileProcessor = {}));
//# sourceMappingURL=TimelineJSProfile.js.map

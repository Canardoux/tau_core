"use strict";
import * as WebVitals from "../../../third_party/web-vitals/web-vitals.js";
export function onEachInteraction(onReport) {
  WebVitals.entryPreProcessingCallbacks.push((entry) => {
    void Promise.resolve().then(() => {
      if (entry.interactionId) {
        const interaction = WebVitals.attributeINP({
          entries: [entry],
          // The only value we really need for `attributeINP` is `entries`
          // Everything else is included to fill out the type.
          name: "INP",
          rating: "good",
          value: entry.duration,
          delta: entry.duration,
          navigationType: "navigate",
          id: "N/A"
        });
        onReport(interaction);
      }
    });
  });
}
//# sourceMappingURL=OnEachInteraction.js.map

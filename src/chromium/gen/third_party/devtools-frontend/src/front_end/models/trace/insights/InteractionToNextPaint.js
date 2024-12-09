"use strict";
import * as i18n from "../../../core/i18n/i18n.js";
import * as Helpers from "../helpers/helpers.js";
import { InsightCategory } from "./types.js";
const UIStrings = {
  /**
   * @description Text to tell the user about the longest user interaction.
   */
  description: "Start investigating with the longest phase. [Delays can be minimized](https://web.dev/articles/optimize-inp#optimize_interactions). To reduce processing duration, [optimize the main-thread costs](https://web.dev/articles/optimize-long-tasks), often JS.",
  /**
   * @description Title for the performance insight "INP by phase", which shows a breakdown of INP by phases / sections.
   */
  title: "INP by phase"
};
const str_ = i18n.i18n.registerUIStrings("models/trace/insights/InteractionToNextPaint.ts", UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(void 0, str_);
export function deps() {
  return ["UserInteractions"];
}
function finalize(partialModel) {
  return {
    title: i18nString(UIStrings.title),
    description: i18nString(UIStrings.description),
    category: InsightCategory.INP,
    shouldShow: Boolean(partialModel.longestInteractionEvent),
    ...partialModel
  };
}
export function generateInsight(parsedTrace, context) {
  const interactionEvents = parsedTrace.UserInteractions.interactionEventsWithNoNesting.filter((event) => {
    return Helpers.Timing.eventIsInBounds(event, context.bounds);
  });
  if (!interactionEvents.length) {
    return finalize({});
  }
  const longestByInteractionId = /* @__PURE__ */ new Map();
  for (const event of interactionEvents) {
    const key = event.interactionId;
    const longest = longestByInteractionId.get(key);
    if (!longest || event.dur > longest.dur) {
      longestByInteractionId.set(key, event);
    }
  }
  const normalizedInteractionEvents = [...longestByInteractionId.values()];
  normalizedInteractionEvents.sort((a, b) => b.dur - a.dur);
  const highPercentileIndex = Math.min(9, Math.floor(normalizedInteractionEvents.length / 50));
  return finalize({
    relatedEvents: [normalizedInteractionEvents[0]],
    longestInteractionEvent: normalizedInteractionEvents[0],
    highPercentileInteractionEvent: normalizedInteractionEvents[highPercentileIndex]
  });
}
//# sourceMappingURL=InteractionToNextPaint.js.map

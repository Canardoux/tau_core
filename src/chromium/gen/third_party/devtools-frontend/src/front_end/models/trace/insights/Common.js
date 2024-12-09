"use strict";
export function getInsight(insightName, insights, key) {
  if (!insights || !key) {
    return null;
  }
  const insightSets = insights.get(key);
  if (!insightSets) {
    return null;
  }
  const insight = insightSets.model[insightName];
  if (insight instanceof Error) {
    return null;
  }
  return insight;
}
//# sourceMappingURL=Common.js.map

"use strict";
export const defaults = () => ({
  includeRuntimeCallStats: false,
  showAllEvents: false,
  debugMode: false,
  maxInvalidationEventsPerEvent: 20
});
export function configToCacheKey(config) {
  return JSON.stringify(config);
}
//# sourceMappingURL=Configuration.js.map

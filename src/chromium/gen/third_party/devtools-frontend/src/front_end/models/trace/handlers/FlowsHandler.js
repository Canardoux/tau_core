"use strict";
import * as Types from "../types/types.js";
const flowDataByGroupToken = /* @__PURE__ */ new Map();
const flowPhaseBindingTokenToFlowId = /* @__PURE__ */ new Map();
const flowsById = /* @__PURE__ */ new Map();
const flowEvents = [];
const nonFlowEvents = [];
let flows = [];
const ID_COMPONENT_SEPARATOR = "-$-";
export function reset() {
  flows = [];
  flowEvents.length = 0;
  nonFlowEvents.length = 0;
  flowDataByGroupToken.clear();
  flowPhaseBindingTokenToFlowId.clear();
  flowsById.clear();
}
export function handleEvent(event) {
  if (Types.Events.isFlowPhaseEvent(event)) {
    flowEvents.push(event);
    return;
  }
  nonFlowEvents.push(event);
}
function processNonFlowEvent(event) {
  const flowPhaseBindingToken = flowPhaseBindingTokenForEvent(event);
  const flowIds = flowPhaseBindingTokenToFlowId.get(flowPhaseBindingToken);
  if (!flowIds) {
    return;
  }
  for (const flowId of flowIds) {
    const flow = flowsById.get(flowId);
    if (!flow) {
      continue;
    }
    const timeIndex = flow.times.indexOf(event.ts);
    if (timeIndex < 0) {
      continue;
    }
    flow.events[timeIndex] = event;
  }
}
function processFlowEvent(flowPhaseEvent) {
  const flowGroup = flowGroupTokenForFlowPhaseEvent(flowPhaseEvent);
  switch (flowPhaseEvent.ph) {
    case Types.Events.Phase.FLOW_START: {
      const flowMetadata = { flowId: flowPhaseEvent.id, times: [flowPhaseEvent.ts] };
      flowDataByGroupToken.set(flowGroup, flowMetadata);
      addFlowIdToFlowPhaseBinding(flowPhaseBindingTokenForEvent(flowPhaseEvent), flowMetadata.flowId);
      return;
    }
    case Types.Events.Phase.FLOW_STEP: {
      const flow = flowDataByGroupToken.get(flowGroup);
      if (!flow || flow.times.length < 0) {
        return;
      }
      addFlowIdToFlowPhaseBinding(flowPhaseBindingTokenForEvent(flowPhaseEvent), flow.flowId);
      flow.times.push(flowPhaseEvent.ts);
      return;
    }
    case Types.Events.Phase.FLOW_END: {
      const flow = flowDataByGroupToken.get(flowGroup);
      if (!flow || flow.times.length < 0) {
        return;
      }
      addFlowIdToFlowPhaseBinding(flowPhaseBindingTokenForEvent(flowPhaseEvent), flow.flowId);
      flow.times.push(flowPhaseEvent.ts);
      flowsById.set(flow.flowId, { times: flow.times, events: [] });
      flowDataByGroupToken.delete(flowGroup);
    }
  }
}
function addFlowIdToFlowPhaseBinding(flowPhaseBinding, flowId) {
  let flowIds = flowPhaseBindingTokenToFlowId.get(flowPhaseBinding);
  if (!flowIds) {
    flowIds = /* @__PURE__ */ new Set();
  }
  flowIds.add(flowId);
  flowPhaseBindingTokenToFlowId.set(flowPhaseBinding, flowIds);
}
function flowGroupTokenForFlowPhaseEvent(event) {
  return `${event.cat}${ID_COMPONENT_SEPARATOR}${event.name}${ID_COMPONENT_SEPARATOR}${event.id}`;
}
function flowPhaseBindingTokenForEvent(event) {
  return `${event.cat}${ID_COMPONENT_SEPARATOR}${event.tid}${ID_COMPONENT_SEPARATOR}${event.pid}${ID_COMPONENT_SEPARATOR}${event.ts}`;
}
export async function finalize() {
  flowEvents.forEach(processFlowEvent);
  nonFlowEvents.forEach(processNonFlowEvent);
  flows = [...flowsById.values()].map((f) => f.events).filter((flow) => flow.length > 1);
}
export function data() {
  return {
    flows
  };
}
//# sourceMappingURL=FlowsHandler.js.map

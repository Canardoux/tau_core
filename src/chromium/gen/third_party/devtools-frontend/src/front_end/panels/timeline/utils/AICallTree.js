"use strict";
import * as Trace from "../../../models/trace/trace.js";
import { nameForEntry } from "./EntryName.js";
import { visibleTypes } from "./EntryStyles.js";
import { SourceMapsResolver } from "./SourceMapsResolver.js";
function depthFirstWalk(nodes, callback) {
  for (const node of nodes) {
    if (callback?.(node)) {
      break;
    }
    depthFirstWalk(node.children().values(), callback);
  }
}
export class AICallTree {
  constructor(selectedNode, rootNode, parsedTrace) {
    this.selectedNode = selectedNode;
    this.rootNode = rootNode;
    this.parsedTrace = parsedTrace;
  }
  static from(selectedEvent, events, parsedTrace) {
    const { startTime, endTime } = Trace.Helpers.Timing.eventTimingsMilliSeconds(selectedEvent);
    const selectedEventBounds = Trace.Helpers.Timing.traceWindowFromMicroSeconds(
      Trace.Helpers.Timing.millisecondsToMicroseconds(startTime),
      Trace.Helpers.Timing.millisecondsToMicroseconds(endTime)
    );
    const threadEvents = parsedTrace.Renderer.processes.get(selectedEvent.pid)?.threads.get(selectedEvent.tid)?.entries;
    if (!threadEvents) {
      throw new Error("Cannot locate thread");
    }
    const overlappingEvents = threadEvents.filter((e) => Trace.Helpers.Timing.eventIsInBounds(e, selectedEventBounds));
    const visibleEventsFilter = new Trace.Extras.TraceFilter.VisibleEventsFilter(visibleTypes());
    const customFilter = new AITreeFilter(selectedEvent);
    const rootNode = new Trace.Extras.TraceTree.TopDownRootNode(
      overlappingEvents,
      [visibleEventsFilter, customFilter],
      startTime,
      endTime,
      false,
      null,
      true
    );
    let selectedNode = null;
    depthFirstWalk([rootNode].values(), (node) => {
      if (node.event === selectedEvent) {
        selectedNode = node;
        return true;
      }
      return;
    });
    if (selectedNode === null) {
      throw new Error("Node not within its own tree. Unexpected.");
    }
    const instance = new AICallTree(selectedNode, rootNode, parsedTrace);
    return instance;
  }
  /** Define precisely how the call tree is serialized. Typically called from within `DrJonesPerformanceAgent` */
  serialize() {
    const nodeToIdMap = /* @__PURE__ */ new Map();
    const allUrls = [];
    let nodesStr = "";
    depthFirstWalk(this.rootNode.children().values(), (node) => {
      nodesStr += AICallTree.stringifyNode(node, this.parsedTrace, this.selectedNode, nodeToIdMap, allUrls);
    });
    let output = "";
    if (allUrls.length) {
      output += "\n# All URL #s:\n\n" + allUrls.map((url, index) => `  * ${index}: ${url}`).join("\n");
    }
    output += "\n\n# Call tree:" + nodesStr;
    return output;
  }
  /* This custom YAML-like format with an adjacency list for children is 35% more token efficient than JSON */
  static stringifyNode(node, parsedTrace, selectedNode, nodeToIdMap, allUrls) {
    const event = node.event;
    if (!event) {
      throw new Error("Event required");
    }
    const url = SourceMapsResolver.resolvedURLForEntry(parsedTrace, event);
    const urlIndex = !url ? -1 : allUrls.indexOf(url) === -1 ? allUrls.push(url) - 1 : allUrls.indexOf(url);
    const children = Array.from(node.children().values());
    const getIdentifier = (node2) => {
      if (!node2.event || typeof node2.id !== "string") {
        throw new Error("ok");
      }
      if (!nodeToIdMap.has(node2)) {
        nodeToIdMap.set(node2, nodeToIdMap.size + 1);
      }
      return `${nodeToIdMap.get(node2)} \u2013 ${nameForEntry(node2.event, parsedTrace)}`;
    };
    const roundToTenths = (num) => Math.round(num * 10) / 10;
    const lines = [
      `

Node: ${getIdentifier(node)}`,
      selectedNode === node && "Selected: true",
      node.totalTime && `dur: ${roundToTenths(node.totalTime)}`,
      // node.functionSource && `snippet: ${node.functionSource.slice(0, 250)}`,
      node.selfTime && `self: ${roundToTenths(node.selfTime)}`,
      urlIndex !== -1 && `URL #: ${urlIndex}`
    ];
    if (children.length) {
      lines.push("Children:");
      lines.push(...children.map((node2) => `  * ${getIdentifier(node2)}`));
    }
    return lines.filter(Boolean).join("\n");
  }
  // Only used for debugging.
  logDebug() {
    const str = this.serialize();
    console.log("\u{1F386}", str);
    if (str.length > 45e3) {
      console.warn("Output will likely not fit in the context window. Expect an AIDA error.");
    }
  }
}
export class AITreeFilter extends Trace.Extras.TraceFilter.TraceFilter {
  #minDuration;
  #selectedEvent;
  constructor(selectedEvent) {
    super();
    this.#minDuration = Trace.Types.Timing.MicroSeconds((selectedEvent.dur ?? 1) * 5e-3);
    this.#selectedEvent = selectedEvent;
  }
  accept(event) {
    if (event === this.#selectedEvent) {
      return true;
    }
    if (event.name === Trace.Types.Events.Name.COMPILE_CODE) {
      return false;
    }
    return event.dur ? event.dur >= this.#minDuration : false;
  }
}
//# sourceMappingURL=AICallTree.js.map

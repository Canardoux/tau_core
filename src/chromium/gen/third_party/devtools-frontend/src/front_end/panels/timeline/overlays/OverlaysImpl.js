"use strict";
import * as Common from "../../../core/common/common.js";
import * as i18n from "../../../core/i18n/i18n.js";
import * as Platform from "../../../core/platform/platform.js";
import * as Trace from "../../../models/trace/trace.js";
import * as VisualLogging from "../../../ui/visual_logging/visual_logging.js";
import { EntryStyles } from "../../timeline/utils/utils.js";
import * as Components from "./components/components.js";
const NETWORK_RESIZE_ELEM_HEIGHT_PX = 8;
export function traceWindowContainingOverlays(overlays) {
  let minTime = Trace.Types.Timing.MicroSeconds(Number.POSITIVE_INFINITY);
  let maxTime = Trace.Types.Timing.MicroSeconds(Number.NEGATIVE_INFINITY);
  for (const overlay of overlays) {
    const windowForOverlay = traceWindowForOverlay(overlay);
    if (windowForOverlay.min < minTime) {
      minTime = windowForOverlay.min;
    }
    if (windowForOverlay.max > maxTime) {
      maxTime = windowForOverlay.max;
    }
  }
  return Trace.Helpers.Timing.traceWindowFromMicroSeconds(minTime, maxTime);
}
function traceWindowForOverlay(overlay) {
  const overlayMinBounds = [];
  const overlayMaxBounds = [];
  switch (overlay.type) {
    case "ENTRY_SELECTED": {
      const timings = timingsForOverlayEntry(overlay.entry);
      overlayMinBounds.push(timings.startTime);
      overlayMaxBounds.push(timings.endTime);
      break;
    }
    case "ENTRY_OUTLINE": {
      const timings = timingsForOverlayEntry(overlay.entry);
      overlayMinBounds.push(timings.startTime);
      overlayMaxBounds.push(timings.endTime);
      break;
    }
    case "TIME_RANGE": {
      overlayMinBounds.push(overlay.bounds.min);
      overlayMaxBounds.push(overlay.bounds.max);
      break;
    }
    case "ENTRY_LABEL": {
      const timings = timingsForOverlayEntry(overlay.entry);
      overlayMinBounds.push(timings.startTime);
      overlayMaxBounds.push(timings.endTime);
      break;
    }
    case "ENTRIES_LINK": {
      const timingsFrom = timingsForOverlayEntry(overlay.entryFrom);
      overlayMinBounds.push(timingsFrom.startTime);
      if (overlay.entryTo) {
        const timingsTo = timingsForOverlayEntry(overlay.entryTo);
        overlayMaxBounds.push(timingsTo.endTime);
      } else {
        overlayMaxBounds.push(timingsFrom.endTime);
      }
      break;
    }
    case "TIMESPAN_BREAKDOWN": {
      if (overlay.entry) {
        const timings = timingsForOverlayEntry(overlay.entry);
        overlayMinBounds.push(timings.startTime);
        overlayMaxBounds.push(timings.endTime);
      }
      for (const section of overlay.sections) {
        overlayMinBounds.push(section.bounds.min);
        overlayMaxBounds.push(section.bounds.max);
      }
      break;
    }
    case "TIMESTAMP_MARKER": {
      overlayMinBounds.push(overlay.timestamp);
      break;
    }
    case "CANDY_STRIPED_TIME_RANGE": {
      const timings = timingsForOverlayEntry(overlay.entry);
      overlayMinBounds.push(timings.startTime);
      overlayMaxBounds.push(timings.endTime);
      overlayMinBounds.push(overlay.bounds.min);
      overlayMaxBounds.push(overlay.bounds.max);
      break;
    }
    case "TIMINGS_MARKER": {
      const timings = timingsForOverlayEntry(overlay.entries[0]);
      overlayMinBounds.push(timings.startTime);
      break;
    }
    default:
      Platform.TypeScriptUtilities.assertNever(overlay, `Unexpected overlay ${overlay}`);
  }
  const min = Trace.Types.Timing.MicroSeconds(Math.min(...overlayMinBounds));
  const max = Trace.Types.Timing.MicroSeconds(Math.max(...overlayMaxBounds));
  return Trace.Helpers.Timing.traceWindowFromMicroSeconds(min, max);
}
export function entriesForOverlay(overlay) {
  const entries = [];
  switch (overlay.type) {
    case "ENTRY_SELECTED": {
      entries.push(overlay.entry);
      break;
    }
    case "ENTRY_OUTLINE": {
      entries.push(overlay.entry);
      break;
    }
    case "TIME_RANGE": {
      break;
    }
    case "ENTRY_LABEL": {
      entries.push(overlay.entry);
      break;
    }
    case "ENTRIES_LINK": {
      entries.push(overlay.entryFrom);
      if (overlay.entryTo) {
        entries.push(overlay.entryTo);
      }
      break;
    }
    case "TIMESPAN_BREAKDOWN": {
      if (overlay.entry) {
        entries.push(overlay.entry);
      }
      break;
    }
    case "TIMESTAMP_MARKER": {
      break;
    }
    case "CANDY_STRIPED_TIME_RANGE": {
      entries.push(overlay.entry);
      break;
    }
    case "TIMINGS_MARKER": {
      entries.push(...overlay.entries);
      break;
    }
    default:
      Platform.assertNever(overlay, `Unknown overlay type ${JSON.stringify(overlay)}`);
  }
  return entries;
}
export function chartForEntry(entry) {
  if (Trace.Types.Events.isNetworkTrackEntry(entry)) {
    return "network";
  }
  return "main";
}
export function overlayIsSingleton(overlay) {
  return overlay.type === "TIMESTAMP_MARKER" || overlay.type === "ENTRY_SELECTED";
}
export class AnnotationOverlayActionEvent extends Event {
  constructor(overlay, action) {
    super(AnnotationOverlayActionEvent.eventName);
    this.overlay = overlay;
    this.action = action;
  }
  static eventName = "annotationoverlayactionsevent";
}
export class TimeRangeMouseOverEvent extends Event {
  constructor(overlay) {
    super(TimeRangeMouseOverEvent.eventName, { bubbles: true });
    this.overlay = overlay;
  }
  static eventName = "timerangemouseoverevent";
}
export class TimeRangeMouseOutEvent extends Event {
  static eventName = "timerangemouseoutevent";
  constructor() {
    super(TimeRangeMouseOutEvent.eventName, { bubbles: true });
  }
}
export class EventReferenceClick extends Event {
  constructor(event) {
    super(EventReferenceClick.eventName, { bubbles: true, composed: true });
    this.event = event;
  }
  static eventName = "eventreferenceclick";
}
export class Overlays extends EventTarget {
  /**
   * The list of active overlays. Overlays can't be marked as visible or
   * hidden; every overlay in this list is rendered.
   * We track each overlay against the HTML Element we have rendered. This is
   * because on first render of a new overlay, we create it, but then on
   * subsequent renders we do not destroy and recreate it, instead we update it
   * based on the new position of the timeline.
   */
  #overlaysToElements = /* @__PURE__ */ new Map();
  // When the Entries Link Annotation is created, the arrow needs to follow the mouse.
  // Update the mouse coordinates while it is being created.
  #lastMouseOffsetX = null;
  #lastMouseOffsetY = null;
  // `entriesLinkInProgress` is the entries link Overlay that has not yet been fully created
  // and only has the entry that the link starts from set.
  // We save it as a separate variable because when the second entry of the link is not chosen yet,
  // the arrow follows the mouse. To achieve that, update the coordinates of `entriesLinkInProgress`
  // on mousemove. There can only be one link in the process on being created so the mousemove
  // only needs to update `entriesLinkInProgress` link overlay.
  #entriesLinkInProgress;
  #dimensions = {
    trace: {
      visibleWindow: null
    },
    charts: {
      main: null,
      network: null
    }
  };
  /**
   * To calculate the Y pixel value for an event we need access to the chart
   * and data provider in order to find out what level the event is on, and from
   * there calculate the pixel value for that level.
   */
  #charts;
  /**
   * The Overlays class will take each overlay, generate its HTML, and add it
   * to the container. This container is provided for us when the class is
   * created so we can manage its contents as overlays come and go.
   */
  #overlaysContainer;
  // Setting that specififed if the annotations overlays need to be visible.
  // It is switched on/off from the annotations tab in the sidebar.
  #annotationsHiddenSetting;
  /**
   * The OverlaysManager sometimes needs to find out if an entry is visible or
   * not, and if not, why not - for example, if the user has collapsed its
   * parent. We define these query functions that must be supplied in order to
   * answer these questions.
   */
  #queries;
  constructor(init) {
    super();
    this.#overlaysContainer = init.container;
    this.#charts = init.charts;
    this.#queries = init.entryQueries;
    this.#entriesLinkInProgress = null;
    this.#annotationsHiddenSetting = Common.Settings.Settings.instance().moduleSetting("annotations-hidden");
    this.#annotationsHiddenSetting.addChangeListener(this.update.bind(this));
    init.flameChartsContainers.main.addEventListener(
      "mousemove",
      (event) => this.#updateMouseCoordinatesProgressEntriesLink.bind(this)(event, "main")
    );
    init.flameChartsContainers.network.addEventListener(
      "mousemove",
      (event) => this.#updateMouseCoordinatesProgressEntriesLink.bind(this)(event, "network")
    );
  }
  // Mousemove event listener to get mouse coordinates and update them for the entries link that is being created.
  //
  // The 'mousemove' event is attached to `flameChartsContainers` instead of `overlaysContainer`
  // because `overlaysContainer` doesn't have events to enable the interaction with the
  // Flamecharts beneath it.
  #updateMouseCoordinatesProgressEntriesLink(event, chart) {
    const mouseEvent = event;
    this.#lastMouseOffsetX = mouseEvent.offsetX;
    this.#lastMouseOffsetY = mouseEvent.offsetY;
    if (this.#entriesLinkInProgress?.state !== Trace.Types.File.EntriesLinkState.PENDING_TO_EVENT) {
      return;
    }
    const networkHeight = this.#dimensions.charts.network?.heightPixels ?? 0;
    const linkInProgressElement = this.#overlaysToElements.get(this.#entriesLinkInProgress);
    if (linkInProgressElement) {
      const component = linkInProgressElement.querySelector("devtools-entries-link-overlay");
      const yCoordinate = mouseEvent.offsetY + (chart === "main" ? networkHeight : 0);
      component.toEntryCoordinateAndDimentions = { x: mouseEvent.offsetX, y: yCoordinate };
    }
  }
  /**
   * Add a new overlay to the view.
   */
  add(newOverlay) {
    if (this.#overlaysToElements.has(newOverlay)) {
      return newOverlay;
    }
    const existing = this.overlaysOfType(newOverlay.type);
    if (overlayIsSingleton(newOverlay) && existing[0]) {
      this.updateExisting(existing[0], newOverlay);
      return existing[0];
    }
    this.#overlaysToElements.set(newOverlay, null);
    return newOverlay;
  }
  /**
   * Update an existing overlay without destroying and recreating its
   * associated DOM.
   *
   * This is useful if you need to rapidly update an overlay's data - e.g.
   * dragging to create time ranges - without the thrashing of destroying the
   * old overlay and re-creating the new one.
   */
  updateExisting(existingOverlay, newData) {
    if (!this.#overlaysToElements.has(existingOverlay)) {
      console.error("Trying to update an overlay that does not exist.");
      return;
    }
    for (const [key, value] of Object.entries(newData)) {
      const k = key;
      existingOverlay[k] = value;
    }
  }
  enterLabelEditMode(overlay) {
    const element = this.#overlaysToElements.get(overlay);
    const component = element?.querySelector("devtools-entry-label-overlay");
    if (component) {
      component.setLabelEditabilityAndRemoveEmptyLabel(true);
    }
  }
  /**
   * @returns the list of overlays associated with a given entry.
   */
  overlaysForEntry(entry) {
    const matches = [];
    for (const [overlay] of this.#overlaysToElements) {
      if ("entry" in overlay && overlay.entry === entry) {
        matches.push(overlay);
      }
    }
    return matches;
  }
  /**
   * Removes any active overlays that match the provided type.
   * @returns the number of overlays that were removed.
   */
  removeOverlaysOfType(type) {
    const overlaysToRemove = Array.from(this.#overlaysToElements.keys()).filter((overlay) => {
      return overlay.type === type;
    });
    for (const overlay of overlaysToRemove) {
      this.remove(overlay);
    }
    return overlaysToRemove.length;
  }
  /**
   * @returns all overlays that match the provided type.
   */
  overlaysOfType(type) {
    const matches = [];
    function overlayIsOfType(overlay) {
      return overlay.type === type;
    }
    for (const [overlay] of this.#overlaysToElements) {
      if (overlayIsOfType(overlay)) {
        matches.push(overlay);
      }
    }
    return matches;
  }
  /**
   * Removes the provided overlay from the list of overlays and destroys any
   * DOM associated with it.
   */
  remove(overlay) {
    const htmlElement = this.#overlaysToElements.get(overlay);
    if (htmlElement && this.#overlaysContainer) {
      this.#overlaysContainer.removeChild(htmlElement);
    }
    this.#overlaysToElements.delete(overlay);
  }
  /**
   * Update the dimenions of a chart.
   * IMPORTANT: this does not trigger a re-draw. You must call the render() method manually.
   */
  updateChartDimensions(chart, dimensions) {
    this.#dimensions.charts[chart] = dimensions;
  }
  /**
   * Update the visible window of the UI.
   * IMPORTANT: this does not trigger a re-draw. You must call the render() method manually.
   */
  updateVisibleWindow(visibleWindow) {
    this.#dimensions.trace.visibleWindow = visibleWindow;
  }
  /**
   * Clears all overlays and all data. Call this when the trace is changing
   * (e.g. the user has imported/recorded a new trace) and we need to start from
   * scratch and remove all overlays relating to the preivous trace.
   */
  reset() {
    if (this.#overlaysContainer) {
      this.#overlaysContainer.innerHTML = "";
    }
    this.#overlaysToElements.clear();
    this.#dimensions.trace.visibleWindow = null;
    this.#dimensions.charts.main = null;
    this.#dimensions.charts.network = null;
  }
  /**
   * Updates the Overlays UI: new overlays will be rendered onto the view, and
   * existing overlays will have their positions changed to ensure they are
   * rendered in the right place.
   */
  async update() {
    const timeRangeOverlays = [];
    const timingsMarkerOverlays = [];
    for (const [overlay, existingElement] of this.#overlaysToElements) {
      const element = existingElement || this.#createElementForNewOverlay(overlay);
      if (!existingElement) {
        this.#overlaysToElements.set(overlay, element);
        this.#overlaysContainer.appendChild(element);
      }
      this.#updateOverlayBeforePositioning(overlay, element);
      this.#positionOverlay(overlay, element);
      this.#updateOverlayAfterPositioning(overlay, element);
      if (overlay.type === "TIME_RANGE") {
        timeRangeOverlays.push(overlay);
      }
      if (overlay.type === "TIMINGS_MARKER") {
        timingsMarkerOverlays.push(overlay);
      }
    }
    if (timeRangeOverlays.length > 1) {
      this.#positionOverlappingTimeRangeLabels(timeRangeOverlays);
    }
  }
  /**
   * If any time-range overlays overlap, we try to adjust their horizontal
   * position in order to make sure you can distinguish them and that the labels
   * do not entirely overlap.
   * This is very much minimal best effort, and does not guarantee that all
   * labels will remain readable.
   */
  #positionOverlappingTimeRangeLabels(overlays) {
    const overlaysSorted = overlays.toSorted((o1, o2) => {
      return o1.bounds.min - o2.bounds.min;
    });
    const overlapsByOverlay = /* @__PURE__ */ new Map();
    for (let i = 0; i < overlaysSorted.length; i++) {
      const current = overlaysSorted[i];
      const overlaps = [];
      for (let j = i + 1; j < overlaysSorted.length; j++) {
        const next = overlaysSorted[j];
        const currentAndNextOverlap = Trace.Helpers.Timing.boundsIncludeTimeRange({
          bounds: current.bounds,
          timeRange: next.bounds
        });
        if (currentAndNextOverlap) {
          overlaps.push(next);
        } else {
          break;
        }
      }
      overlapsByOverlay.set(current, overlaps);
    }
    for (const [firstOverlay, overlappingOverlays] of overlapsByOverlay) {
      const element = this.#overlaysToElements.get(firstOverlay);
      if (!element) {
        continue;
      }
      let firstIndexForOverlapClass = 1;
      if (element.getAttribute("class")?.includes("overlap-")) {
        firstIndexForOverlapClass = 0;
      }
      overlappingOverlays.forEach((overlay) => {
        const element2 = this.#overlaysToElements.get(overlay);
        element2?.classList.add(`overlap-${firstIndexForOverlapClass++}`);
      });
    }
  }
  #positionOverlay(overlay, element) {
    const annotationsAreHidden = this.#annotationsHiddenSetting.get();
    switch (overlay.type) {
      case "ENTRY_SELECTED": {
        const isVisible = this.entryIsVisibleOnChart(overlay.entry);
        this.#setOverlayElementVisibility(element, isVisible);
        if (isVisible) {
          this.#positionEntryBorderOutlineType(overlay.entry, element);
        }
        break;
      }
      case "ENTRY_OUTLINE": {
        const selectedOverlay = this.overlaysOfType("ENTRY_SELECTED")?.at(0);
        const outlinedEntryIsSelected = Boolean(selectedOverlay && selectedOverlay.entry === overlay.entry);
        if (!outlinedEntryIsSelected && this.entryIsVisibleOnChart(overlay.entry)) {
          this.#setOverlayElementVisibility(element, true);
          this.#positionEntryBorderOutlineType(overlay.entry, element);
        } else {
          this.#setOverlayElementVisibility(element, false);
        }
        break;
      }
      case "TIME_RANGE": {
        if (overlay.label.length) {
          this.#setOverlayElementVisibility(element, !annotationsAreHidden);
        }
        this.#positionTimeRangeOverlay(overlay, element);
        break;
      }
      case "ENTRY_LABEL": {
        const entryVisible = this.entryIsVisibleOnChart(overlay.entry);
        this.#setOverlayElementVisibility(element, entryVisible && !annotationsAreHidden);
        if (entryVisible) {
          const entryLabelVisibleHeight = this.#positionEntryLabelOverlay(overlay, element);
          const component = element.querySelector("devtools-entry-label-overlay");
          if (component && entryLabelVisibleHeight) {
            component.entryLabelVisibleHeight = entryLabelVisibleHeight;
          }
        }
        break;
      }
      case "ENTRIES_LINK": {
        const entriesToConnect = this.#calculateFromAndToForEntriesLink(overlay);
        const isVisible = entriesToConnect !== null && !annotationsAreHidden;
        this.#setOverlayElementVisibility(element, isVisible);
        if (isVisible) {
          this.#positionEntriesLinkOverlay(overlay, element, entriesToConnect);
        }
        break;
      }
      case "TIMESPAN_BREAKDOWN": {
        this.#positionTimespanBreakdownOverlay(overlay, element);
        if (overlay.entry) {
          const { visibleWindow } = this.#dimensions.trace;
          const isVisible = Boolean(
            visibleWindow && this.#entryIsVerticallyVisibleOnChart(overlay.entry) && Trace.Helpers.Timing.boundsIncludeTimeRange({
              bounds: visibleWindow,
              timeRange: overlay.sections[0].bounds
            })
          );
          this.#setOverlayElementVisibility(element, isVisible);
        }
        break;
      }
      case "TIMESTAMP_MARKER": {
        const { visibleWindow } = this.#dimensions.trace;
        const isVisible = Boolean(visibleWindow && Trace.Helpers.Timing.timestampIsInBounds(visibleWindow, overlay.timestamp));
        this.#setOverlayElementVisibility(element, isVisible);
        if (isVisible) {
          this.#positionTimingOverlay(overlay, element);
        }
        break;
      }
      case "CANDY_STRIPED_TIME_RANGE": {
        const { visibleWindow } = this.#dimensions.trace;
        const isVisible = Boolean(
          visibleWindow && this.#entryIsVerticallyVisibleOnChart(overlay.entry) && Trace.Helpers.Timing.boundsIncludeTimeRange({
            bounds: visibleWindow,
            timeRange: overlay.bounds
          })
        );
        this.#setOverlayElementVisibility(element, isVisible);
        if (isVisible) {
          this.#positionCandyStripedTimeRange(overlay, element);
        }
        break;
      }
      case "TIMINGS_MARKER": {
        const { visibleWindow } = this.#dimensions.trace;
        const isVisible = Boolean(visibleWindow && this.#entryIsHorizontallyVisibleOnChart(overlay.entries[0]));
        this.#setOverlayElementVisibility(element, isVisible);
        if (isVisible) {
          this.#positionTimingOverlay(overlay, element);
        }
        break;
      }
      default: {
        Platform.TypeScriptUtilities.assertNever(overlay, `Unknown overlay: ${JSON.stringify(overlay)}`);
      }
    }
  }
  #positionTimingOverlay(overlay, element) {
    let left;
    switch (overlay.type) {
      case "TIMINGS_MARKER": {
        const timings = Trace.Helpers.Timing.eventTimingsMicroSeconds(overlay.entries[0]);
        left = this.#xPixelForMicroSeconds("main", timings.startTime);
        break;
      }
      case "TIMESTAMP_MARKER": {
        left = this.#xPixelForMicroSeconds("main", overlay.timestamp);
        break;
      }
    }
    element.style.left = `${left}px`;
  }
  #positionTimespanBreakdownOverlay(overlay, element) {
    if (overlay.sections.length === 0) {
      return;
    }
    const component = element.querySelector("devtools-timespan-breakdown-overlay");
    const elementSections = component?.renderedSections() ?? [];
    const leftEdgePixel = this.#xPixelForMicroSeconds("main", overlay.sections[0].bounds.min);
    const rightEdgePixel = this.#xPixelForMicroSeconds("main", overlay.sections[overlay.sections.length - 1].bounds.max);
    if (leftEdgePixel === null || rightEdgePixel === null) {
      return;
    }
    const rangeWidth = rightEdgePixel - leftEdgePixel;
    element.style.left = `${leftEdgePixel}px`;
    element.style.width = `${rangeWidth}px`;
    if (elementSections.length === 0) {
      return;
    }
    let count = 0;
    for (const section of overlay.sections) {
      const leftPixel = this.#xPixelForMicroSeconds("main", section.bounds.min);
      const rightPixel = this.#xPixelForMicroSeconds("main", section.bounds.max);
      if (leftPixel === null || rightPixel === null) {
        return;
      }
      const rangeWidth2 = rightPixel - leftPixel;
      const sectionElement = elementSections[count];
      sectionElement.style.left = `${leftPixel}px`;
      sectionElement.style.width = `${rangeWidth2}px`;
      count++;
    }
    if (overlay.entry && (overlay.renderLocation === "BELOW_EVENT" || overlay.renderLocation === "ABOVE_EVENT")) {
      const MAX_BOX_HEIGHT = 50;
      element.style.maxHeight = `${MAX_BOX_HEIGHT}px`;
      const y = this.yPixelForEventOnChart(overlay.entry);
      if (y === null) {
        return;
      }
      const eventHeight = this.pixelHeightForEventOnChart(overlay.entry);
      if (eventHeight === null) {
        return;
      }
      if (overlay.renderLocation === "BELOW_EVENT") {
        const top = y + eventHeight;
        element.style.top = `${top}px`;
      } else {
        const PADDING = 7;
        const bottom = y - PADDING;
        const minSpace = Math.max(bottom, 0);
        const height = Math.min(MAX_BOX_HEIGHT, minSpace);
        const top = bottom - height;
        element.style.top = `${top}px`;
      }
    }
  }
  /**
   * Positions the arrow between two entries. Takes in the entriesToConnect
   * because if one of the original entries is hidden in a collapsed main thread
   * icicle, we use its parent to connect to.
   */
  #positionEntriesLinkOverlay(overlay, element, entriesToConnect) {
    const component = element.querySelector("devtools-entries-link-overlay");
    if (component) {
      const fromEntryInCollapsedTrack = this.#entryIsInCollapsedTrack(entriesToConnect.entryFrom);
      const toEntryInCollapsedTrack = entriesToConnect.entryTo && this.#entryIsInCollapsedTrack(entriesToConnect.entryTo);
      const bothEntriesInCollapsedTrack = Boolean(fromEntryInCollapsedTrack && toEntryInCollapsedTrack);
      if (bothEntriesInCollapsedTrack) {
        this.#setOverlayElementVisibility(element, false);
        return;
      }
      const hideArrow = Boolean(fromEntryInCollapsedTrack || toEntryInCollapsedTrack);
      component.hideArrow = hideArrow;
      const { entryFrom, entryTo, entryFromIsSource, entryToIsSource } = entriesToConnect;
      const entryFromWrapper = component.entryFromWrapper();
      if (!entryFromWrapper) {
        return;
      }
      const fromEntryParams = this.#positionEntryBorderOutlineType(entriesToConnect.entryFrom, entryFromWrapper);
      if (!fromEntryParams) {
        return;
      }
      const {
        entryHeight: fromEntryHeight,
        entryWidth: fromEntryWidth,
        cutOffHeight: fromCutOffHeight = 0,
        x: fromEntryX,
        y: fromEntryY
      } = fromEntryParams;
      const entryFromVisibility = this.entryIsVisibleOnChart(entryFrom) && !fromEntryInCollapsedTrack;
      const entryToVisibility = entryTo ? this.entryIsVisibleOnChart(entryTo) && !toEntryInCollapsedTrack : false;
      if (!entryFromVisibility && overlay.state === Trace.Types.File.EntriesLinkState.CREATION_NOT_STARTED) {
        this.dispatchEvent(new AnnotationOverlayActionEvent(overlay, "Remove"));
      }
      const yPixelForFromArrow = (entryFromVisibility ? fromEntryY : this.#yCoordinateForNotVisibleEntry(entryFrom)) ?? 0;
      component.fromEntryIsSource = entryFromIsSource;
      component.toEntryIsSource = entryToIsSource;
      component.entriesVisibility = {
        fromEntryVisibility: entryFromVisibility,
        toEntryVisibility: entryToVisibility
      };
      component.fromEntryCoordinateAndDimentions = { x: fromEntryX, y: yPixelForFromArrow, length: fromEntryWidth, height: fromEntryHeight - fromCutOffHeight };
      const entryToWrapper = component.entryToWrapper();
      if (entryTo && entryToWrapper) {
        const toEntryParams = this.#positionEntryBorderOutlineType(entryTo, entryToWrapper);
        if (!toEntryParams) {
          return;
        }
        const {
          entryHeight: toEntryHeight,
          entryWidth: toEntryWidth,
          cutOffHeight: toCutOffHeight = 0,
          x: toEntryX,
          y: toEntryY
        } = toEntryParams;
        const yPixelForToArrow = this.entryIsVisibleOnChart(entryTo) ? toEntryY : this.#yCoordinateForNotVisibleEntry(entryTo) ?? 0;
        component.toEntryCoordinateAndDimentions = {
          x: toEntryX,
          y: yPixelForToArrow,
          length: toEntryWidth,
          height: toEntryHeight - toCutOffHeight
        };
      } else if (this.#lastMouseOffsetX && this.#lastMouseOffsetY) {
        this.#entriesLinkInProgress = overlay;
      }
    }
  }
  /**
   *  Return Y coordinate for an arrow connecting 2 entries to attach to if the entry is not visible.
   *  For example, if the entry is scrolled up from the visible area , return the y index of the edge of the track:
   *  --
   * |  | - entry off the visible chart
   *  --
   *
   * --Y---------------  -- Y is the returned coordinate that the arrow should point to
   *
   * flamechart data     -- visible flamechart data between the 2 lines
   * ------------------
   *
   * On the contrary, if the entry is scrolled off the bottom, get the coordinate of the top of the visible canvas.
   */
  #yCoordinateForNotVisibleEntry(entry) {
    const chartName = chartForEntry(entry);
    const y = this.yPixelForEventOnChart(entry);
    if (y === null) {
      return 0;
    }
    if (chartName === "main") {
      if (!this.#dimensions.charts.main?.heightPixels) {
        return 0;
      }
      const yWithoutNetwork = y - this.networkChartOffsetHeight();
      if (yWithoutNetwork < 0) {
        return this.networkChartOffsetHeight();
      }
    }
    if (chartName === "network") {
      if (!this.#dimensions.charts.network) {
        return 0;
      }
      if (y > this.#dimensions.charts.network.heightPixels) {
        return this.#dimensions.charts.network.heightPixels;
      }
    }
    return y;
  }
  #positionTimeRangeOverlay(overlay, element) {
    const leftEdgePixel = this.#xPixelForMicroSeconds("main", overlay.bounds.min);
    const rightEdgePixel = this.#xPixelForMicroSeconds("main", overlay.bounds.max);
    if (leftEdgePixel === null || rightEdgePixel === null) {
      return;
    }
    const rangeWidth = rightEdgePixel - leftEdgePixel;
    element.style.left = `${leftEdgePixel}px`;
    element.style.width = `${rangeWidth}px`;
  }
  /**
   * Positions an EntryLabel overlay
   * @param overlay - the EntrySelected overlay that we need to position.
   * @param element - the DOM element representing the overlay
   */
  #positionEntryLabelOverlay(overlay, element) {
    const component = element.querySelector("devtools-entry-label-overlay");
    if (!component) {
      return null;
    }
    const entryWrapper = component.entryHighlightWrapper();
    if (!entryWrapper) {
      return null;
    }
    const { entryHeight, entryWidth, cutOffHeight = 0, x, y } = this.#positionEntryBorderOutlineType(overlay.entry, entryWrapper) || {};
    if (!entryHeight || !entryWidth || x === null || !y) {
      return null;
    }
    element.style.top = `${y - Components.EntryLabelOverlay.EntryLabelOverlay.LABEL_AND_CONNECTOR_HEIGHT}px`;
    element.style.left = `${x}px`;
    element.style.width = `${entryWidth}px`;
    return entryHeight - cutOffHeight;
  }
  #positionCandyStripedTimeRange(overlay, element) {
    const chartName = chartForEntry(overlay.entry);
    const startX = this.#xPixelForMicroSeconds(chartName, overlay.bounds.min);
    const endX = this.#xPixelForMicroSeconds(chartName, overlay.bounds.max);
    if (startX === null || endX === null) {
      return;
    }
    const widthPixels = endX - startX;
    const finalWidth = Math.max(2, widthPixels);
    element.style.width = `${finalWidth}px`;
    element.style.left = `${startX}px`;
    let y = this.yPixelForEventOnChart(overlay.entry);
    if (y === null) {
      return;
    }
    const totalHeight = this.pixelHeightForEventOnChart(overlay.entry) ?? 0;
    let height = totalHeight;
    if (height === null) {
      return;
    }
    if (chartName === "main") {
      const chartTopPadding = this.networkChartOffsetHeight();
      const cutOffTop = y < chartTopPadding;
      height = cutOffTop ? Math.abs(y + height - chartTopPadding) : height;
      element.classList.toggle("cut-off-top", cutOffTop);
      if (cutOffTop) {
        y = y + totalHeight - height;
      }
    } else {
      const networkHeight = this.#dimensions.charts.network?.heightPixels ?? 0;
      const lastVisibleY = y + totalHeight;
      const cutOffBottom = lastVisibleY > networkHeight;
      const cutOffTop = y > networkHeight;
      element.classList.toggle("cut-off-top", cutOffTop);
      element.classList.toggle("cut-off-bottom", cutOffBottom);
      if (cutOffBottom) {
        height = networkHeight - y;
      }
    }
    element.style.height = `${height}px`;
    element.style.top = `${y}px`;
  }
  /**
   * Draw and position borders around an entry. Multiple overlays either fully consist
   * of a border around an entry of have an entry border as a part of the overlay.
   * Positions an EntrySelected or EntryOutline overlay and a part of the EntryLabel.
   * @param overlay - the EntrySelected/EntryOutline/EntryLabel overlay that we need to position.
   * @param element - the DOM element representing the overlay
   */
  #positionEntryBorderOutlineType(entry, element) {
    const chartName = chartForEntry(entry);
    let x = this.xPixelForEventStartOnChart(entry);
    let y = this.yPixelForEventOnChart(entry);
    const chartWidth = chartName === "main" ? this.#dimensions.charts.main?.widthPixels : this.#dimensions.charts.network?.widthPixels;
    if (x === null || y === null || !chartWidth) {
      return null;
    }
    const { endTime } = timingsForOverlayEntry(entry);
    const endX = this.#xPixelForMicroSeconds(chartName, endTime);
    if (endX === null) {
      return null;
    }
    const totalHeight = this.pixelHeightForEventOnChart(entry) ?? 0;
    let height = totalHeight;
    if (height === null) {
      return null;
    }
    let widthPixels = endX - x;
    const provider = chartName === "main" ? this.#charts.mainProvider : this.#charts.networkProvider;
    const chart = chartName === "main" ? this.#charts.mainChart : this.#charts.networkChart;
    const index = provider.indexForEvent?.(entry);
    const customPos = chart.getCustomDrawnPositionForEntryIndex(index ?? -1);
    if (customPos) {
      x = customPos.x;
      widthPixels = customPos.width;
    }
    const cutOffRight = x + widthPixels > chartWidth ? x + widthPixels - chartWidth : null;
    const cutOffLeft = x < 0 ? Math.abs(x) : null;
    element.classList.toggle("cut-off-right", cutOffRight !== null);
    if (cutOffRight) {
      widthPixels = widthPixels - cutOffRight;
    }
    if (cutOffLeft) {
      x = 0;
      widthPixels = widthPixels - cutOffLeft;
    }
    const finalWidth = Math.max(2, widthPixels);
    element.style.width = `${finalWidth}px`;
    if (chartName === "main") {
      const chartTopPadding = this.networkChartOffsetHeight();
      const cutOffTop = y < chartTopPadding;
      height = cutOffTop ? Math.abs(y + height - chartTopPadding) : height;
      element.classList.toggle("cut-off-top", cutOffTop);
      if (cutOffTop) {
        y = y + totalHeight - height;
      }
    } else {
      const networkHeight = this.#dimensions.charts.network?.heightPixels ?? 0;
      const lastVisibleY = y + totalHeight;
      const cutOffBottom = lastVisibleY > networkHeight;
      element.classList.toggle("cut-off-bottom", cutOffBottom);
      if (cutOffBottom) {
        height = networkHeight - y;
      }
    }
    element.style.height = `${height}px`;
    element.style.top = `${y}px`;
    element.style.left = `${x}px`;
    return { entryHeight: totalHeight, entryWidth: finalWidth, cutOffHeight: totalHeight - height, x, y };
  }
  /**
   * We draw an arrow between connected entries but this can get complicated
   * depending on if the entries are visible or not. For example, the user might
   * draw a connection to an entry in the main thread but then collapse the
   * parent of that entry. In this case the entry we want to draw to is the
   * first visible parent of that entry rather than the (invisible) entry.
   */
  #calculateFromAndToForEntriesLink(overlay) {
    if (!overlay.entryTo) {
      return {
        entryFrom: overlay.entryFrom,
        entryTo: overlay.entryTo,
        entryFromIsSource: true,
        entryToIsSource: true
      };
    }
    let entryFrom = overlay.entryFrom;
    let entryTo = overlay.entryTo ?? null;
    if (this.#queries.isEntryCollapsedByUser(overlay.entryFrom)) {
      entryFrom = this.#queries.firstVisibleParentForEntry(overlay.entryFrom);
    }
    if (overlay.entryTo && this.#queries.isEntryCollapsedByUser(overlay.entryTo)) {
      entryTo = this.#queries.firstVisibleParentForEntry(overlay.entryTo);
    }
    if (entryFrom === null || entryTo === null) {
      return null;
    }
    return {
      entryFrom,
      entryFromIsSource: entryFrom === overlay.entryFrom,
      entryTo,
      entryToIsSource: entryTo === overlay.entryTo
    };
  }
  #createElementForNewOverlay(overlay) {
    const div = document.createElement("div");
    div.classList.add("overlay-item", `overlay-type-${overlay.type}`);
    const jslogContext = jsLogContext(overlay);
    if (jslogContext) {
      div.setAttribute("jslog", `${VisualLogging.item(jslogContext)}`);
    }
    switch (overlay.type) {
      case "ENTRY_LABEL": {
        const shouldDrawLabelBelowEntry = Trace.Types.Events.isLegacyTimelineFrame(overlay.entry);
        const component = new Components.EntryLabelOverlay.EntryLabelOverlay(overlay.label, shouldDrawLabelBelowEntry);
        component.addEventListener(Components.EntryLabelOverlay.EmptyEntryLabelRemoveEvent.eventName, () => {
          this.dispatchEvent(new AnnotationOverlayActionEvent(overlay, "Remove"));
        });
        component.addEventListener(Components.EntryLabelOverlay.EntryLabelChangeEvent.eventName, (event) => {
          const newLabel = event.newLabel;
          overlay.label = newLabel;
          this.dispatchEvent(new AnnotationOverlayActionEvent(overlay, "Update"));
        });
        div.appendChild(component);
        return div;
      }
      case "ENTRIES_LINK": {
        const entries = this.#calculateFromAndToForEntriesLink(overlay);
        if (entries === null) {
          return div;
        }
        const entryEndX = this.xPixelForEventEndOnChart(entries.entryFrom) ?? 0;
        const entryStartX = this.xPixelForEventEndOnChart(entries.entryFrom) ?? 0;
        const entryStartY = this.yPixelForEventOnChart(entries.entryFrom) ?? 0;
        const entryWidth = entryEndX - entryStartX;
        const entryHeight = this.pixelHeightForEventOnChart(entries.entryFrom) ?? 0;
        const component = new Components.EntriesLinkOverlay.EntriesLinkOverlay(
          { x: entryEndX, y: entryStartY, width: entryWidth, height: entryHeight },
          overlay.state
        );
        component.addEventListener(Components.EntriesLinkOverlay.EntryLinkStartCreating.eventName, () => {
          overlay.state = Trace.Types.File.EntriesLinkState.PENDING_TO_EVENT;
          this.dispatchEvent(new AnnotationOverlayActionEvent(overlay, "Update"));
        });
        div.appendChild(component);
        return div;
      }
      case "ENTRY_OUTLINE": {
        div.classList.add(`outline-reason-${overlay.outlineReason}`);
        return div;
      }
      case "TIME_RANGE": {
        const component = new Components.TimeRangeOverlay.TimeRangeOverlay(overlay.label);
        component.duration = overlay.showDuration ? overlay.bounds.range : null;
        component.canvasRect = this.#charts.mainChart.canvasBoundingClientRect();
        component.addEventListener(Components.TimeRangeOverlay.TimeRangeLabelChangeEvent.eventName, (event) => {
          const newLabel = event.newLabel;
          overlay.label = newLabel;
          this.dispatchEvent(new AnnotationOverlayActionEvent(overlay, "Update"));
        });
        component.addEventListener(Components.TimeRangeOverlay.TimeRangeRemoveEvent.eventName, () => {
          this.dispatchEvent(new AnnotationOverlayActionEvent(overlay, "Remove"));
        });
        component.addEventListener("mouseover", () => {
          this.dispatchEvent(new TimeRangeMouseOverEvent(overlay));
        });
        component.addEventListener("mouseout", () => {
          this.dispatchEvent(new TimeRangeMouseOutEvent());
        });
        div.appendChild(component);
        return div;
      }
      case "TIMESPAN_BREAKDOWN": {
        const component = new Components.TimespanBreakdownOverlay.TimespanBreakdownOverlay();
        component.sections = overlay.sections;
        component.canvasRect = this.#charts.mainChart.canvasBoundingClientRect();
        component.isBelowEntry = overlay.renderLocation === "BELOW_EVENT";
        div.appendChild(component);
        return div;
      }
      case "TIMINGS_MARKER": {
        const { color } = EntryStyles.markerDetailsForEvent(overlay.entries[0]);
        const markersComponent = this.#createTimingsMarkerElement(overlay);
        div.appendChild(markersComponent);
        div.style.backgroundColor = color;
        return div;
      }
      default: {
        return div;
      }
    }
  }
  #clickEvent(event) {
    this.dispatchEvent(new EventReferenceClick(event));
  }
  #createOverlayPopover(adjustedTimestamp, name) {
    const popoverElement = document.createElement("div");
    const popoverContents = popoverElement.createChild("div", "overlay-popover");
    popoverContents.createChild("span", "overlay-popover-time").textContent = i18n.TimeUtilities.formatMicroSecondsTime(adjustedTimestamp);
    popoverContents.createChild("span", "overlay-popover-title").textContent = name;
    return popoverElement;
  }
  #mouseMoveOverlay(event, name, overlay, markers, marker) {
    const popoverElement = this.#createOverlayPopover(overlay.adjustedTimestamp, name);
    this.#lastMouseOffsetX = event.offsetX + (markers.offsetLeft || 0) + (marker.offsetLeft || 0);
    this.#lastMouseOffsetY = event.offsetY + markers.offsetTop || 0;
    this.#charts.mainChart.updateMouseOffset(this.#lastMouseOffsetX, this.#lastMouseOffsetY);
    this.#charts.mainChart.updatePopoverContents(popoverElement);
  }
  #mouseOutOverlay() {
    this.#lastMouseOffsetX = -1;
    this.#lastMouseOffsetY = -1;
    this.#charts.mainChart.updateMouseOffset(this.#lastMouseOffsetX, this.#lastMouseOffsetY);
    this.#charts.mainChart.hideHighlight();
  }
  #createTimingsMarkerElement(overlay) {
    const markers = document.createElement("div");
    markers.classList.add("markers");
    for (const entry of overlay.entries) {
      const { color, title } = EntryStyles.markerDetailsForEvent(entry);
      const marker = document.createElement("div");
      marker.classList.add("marker-title");
      marker.textContent = title;
      marker.style.backgroundColor = color;
      markers.appendChild(marker);
      marker.addEventListener("click", () => this.#clickEvent(entry));
      marker.addEventListener("mousemove", (event) => this.#mouseMoveOverlay(event, title, overlay, markers, marker));
      marker.addEventListener("mouseout", () => this.#mouseOutOverlay());
    }
    return markers;
  }
  /**
   * Some overlays store data in their components that needs to be updated
   * before we position an overlay. Else, we might position an overlay based on
   * stale data. This method is used to update an overlay BEFORE it is then
   * positioned onto the canvas. It is the right place to ensure an overlay has
   * the latest data it needs.
   */
  #updateOverlayBeforePositioning(overlay, element) {
    switch (overlay.type) {
      case "ENTRY_SELECTED":
        break;
      case "TIME_RANGE": {
        const component = element.querySelector("devtools-time-range-overlay");
        if (component) {
          component.duration = overlay.showDuration ? overlay.bounds.range : null;
          component.canvasRect = this.#charts.mainChart.canvasBoundingClientRect();
        }
        break;
      }
      case "ENTRY_LABEL":
      case "ENTRY_OUTLINE":
      case "ENTRIES_LINK": {
        const component = element.querySelector("devtools-entries-link-overlay");
        if (component) {
          component.canvasRect = this.#charts.mainChart.canvasBoundingClientRect();
        }
        break;
      }
      case "TIMESPAN_BREAKDOWN": {
        const component = element.querySelector("devtools-timespan-breakdown-overlay");
        if (component) {
          component.sections = overlay.sections;
          component.canvasRect = this.#charts.mainChart.canvasBoundingClientRect();
        }
        break;
      }
      case "TIMESTAMP_MARKER":
        break;
      case "CANDY_STRIPED_TIME_RANGE":
        break;
      case "TIMINGS_MARKER":
        break;
      default:
        Platform.TypeScriptUtilities.assertNever(overlay, `Unexpected overlay ${overlay}`);
    }
  }
  /**
   * Some overlays have custom logic within them to manage visibility of
   * labels/etc that can be impacted if the positioning or size of the overlay
   * has changed. This method can be used to run code after an overlay has
   * been updated + repositioned on the timeline.
   */
  #updateOverlayAfterPositioning(overlay, element) {
    switch (overlay.type) {
      case "ENTRY_SELECTED":
        break;
      case "TIME_RANGE": {
        const component = element.querySelector("devtools-time-range-overlay");
        component?.updateLabelPositioning();
        break;
      }
      case "ENTRY_LABEL":
        break;
      case "ENTRY_OUTLINE":
        break;
      case "ENTRIES_LINK":
        break;
      case "TIMESPAN_BREAKDOWN": {
        const component = element.querySelector("devtools-timespan-breakdown-overlay");
        component?.checkSectionLabelPositioning();
        break;
      }
      case "TIMESTAMP_MARKER":
        break;
      case "CANDY_STRIPED_TIME_RANGE":
        break;
      case "TIMINGS_MARKER":
        break;
      default:
        Platform.TypeScriptUtilities.assertNever(overlay, `Unexpected overlay ${overlay}`);
    }
  }
  /**
   * @returns true if the entry is visible on chart, which means that both
   * horizontally and vertically it is at least partially in view.
   */
  entryIsVisibleOnChart(entry) {
    const verticallyVisible = this.#entryIsVerticallyVisibleOnChart(entry);
    const horiziontallyVisible = this.#entryIsHorizontallyVisibleOnChart(entry);
    return verticallyVisible && horiziontallyVisible;
  }
  /**
   * Calculates if an entry is visible horizontally. This is easy because we
   * don't have to consider any pixels and can instead check that its start and
   * end times intersect with the visible window.
   */
  #entryIsHorizontallyVisibleOnChart(entry) {
    if (this.#dimensions.trace.visibleWindow === null) {
      return false;
    }
    const { startTime, endTime } = timingsForOverlayEntry(entry);
    const entryTimeRange = Trace.Helpers.Timing.traceWindowFromMicroSeconds(startTime, endTime);
    return Trace.Helpers.Timing.boundsIncludeTimeRange({
      bounds: this.#dimensions.trace.visibleWindow,
      timeRange: entryTimeRange
    });
  }
  #entryIsInCollapsedTrack(entry) {
    const chartName = chartForEntry(entry);
    const provider = chartName === "main" ? this.#charts.mainProvider : this.#charts.networkProvider;
    const entryIndex = provider.indexForEvent?.(entry) ?? null;
    if (entryIndex === null) {
      return false;
    }
    const group = provider.groupForEvent?.(entryIndex) ?? null;
    if (!group) {
      return false;
    }
    return Boolean(group.expanded) === false;
  }
  /**
   * Calculate if an entry is visible vertically on the chart. A bit fiddly as
   * we have to figure out its pixel offset and go on that. Unlike horizontal
   * visibility, we can't work soley from its microsecond values.
   */
  #entryIsVerticallyVisibleOnChart(entry) {
    const chartName = chartForEntry(entry);
    const y = this.yPixelForEventOnChart(entry);
    if (y === null) {
      return false;
    }
    const eventHeight = this.pixelHeightForEventOnChart(entry);
    if (!eventHeight) {
      return false;
    }
    if (chartName === "main") {
      if (!this.#dimensions.charts.main?.heightPixels) {
        return false;
      }
      const yWithoutNetwork = y - this.networkChartOffsetHeight();
      if (yWithoutNetwork + eventHeight < 0) {
        return false;
      }
      if (yWithoutNetwork > this.#dimensions.charts.main.heightPixels) {
        return false;
      }
    }
    if (chartName === "network") {
      if (!this.#dimensions.charts.network) {
        return false;
      }
      if (y <= -14) {
        return false;
      }
      if (y > this.#dimensions.charts.network.heightPixels) {
        return false;
      }
    }
    return true;
  }
  /**
   * Calculate the X pixel position for an event start on the timeline.
   * @param chartName - the chart that the event is on. It is expected that both
   * charts have the same width so this doesn't make a difference - but it might
   * in the future if the UI changes, hence asking for it.
   *
   * @param event - the trace event you want to get the pixel position of
   */
  xPixelForEventStartOnChart(event) {
    const chartName = chartForEntry(event);
    const { startTime } = timingsForOverlayEntry(event);
    return this.#xPixelForMicroSeconds(chartName, startTime);
  }
  /**
   * Calculate the X pixel position for an event end on the timeline.
   * @param chartName - the chart that the event is on. It is expected that both
   * charts have the same width so this doesn't make a difference - but it might
   * in the future if the UI changes, hence asking for it.
   *
   * @param event - the trace event you want to get the pixel position of
   */
  xPixelForEventEndOnChart(event) {
    const chartName = chartForEntry(event);
    const { endTime } = timingsForOverlayEntry(event);
    return this.#xPixelForMicroSeconds(chartName, endTime);
  }
  /**
   * Calculate the xPixel for a given timestamp. To do this we calculate how
   * far in microseconds from the left of the visible window an event is, and
   * divide that by the total time span. This gives us a fraction representing
   * how far along the timeline the event is. We can then multiply that by the
   * width of the canvas to get its pixel position.
   */
  #xPixelForMicroSeconds(chart, timestamp) {
    if (this.#dimensions.trace.visibleWindow === null) {
      console.error("Cannot calculate xPixel without visible trace window.");
      return null;
    }
    const canvasWidthPixels = this.#dimensions.charts[chart]?.widthPixels ?? null;
    if (canvasWidthPixels === null) {
      console.error(`Cannot calculate xPixel without ${chart} dimensions.`);
      return null;
    }
    const timeFromLeft = timestamp - this.#dimensions.trace.visibleWindow.min;
    const totalTimeSpan = this.#dimensions.trace.visibleWindow.range;
    return Math.floor(
      timeFromLeft / totalTimeSpan * canvasWidthPixels
    );
  }
  /**
   * Calculate the Y pixel position for the event on the timeline relative to
   * the entire window.
   * This means if the event is in the main flame chart and below the network,
   * we add the height of the network chart to the Y value to position it
   * correctly.
   * This can return null if any data was missing, or if the event is not
   * visible (if the level it's on is hidden because the track is collapsed,
   * for example)
   */
  yPixelForEventOnChart(event) {
    const chartName = chartForEntry(event);
    const chart = chartName === "main" ? this.#charts.mainChart : this.#charts.networkChart;
    const provider = chartName === "main" ? this.#charts.mainProvider : this.#charts.networkProvider;
    const indexForEntry = provider.indexForEvent?.(event);
    if (typeof indexForEntry !== "number") {
      return null;
    }
    const timelineData = provider.timelineData();
    if (timelineData === null) {
      return null;
    }
    const level = timelineData.entryLevels.at(indexForEntry);
    if (typeof level === "undefined") {
      return null;
    }
    if (!chart.levelIsVisible(level)) {
      return null;
    }
    const pixelOffsetForLevel = chart.levelToOffset(level);
    let pixelAdjustedForScroll = pixelOffsetForLevel - (this.#dimensions.charts[chartName]?.scrollOffsetPixels ?? 0);
    if (chartName === "main") {
      pixelAdjustedForScroll += this.networkChartOffsetHeight();
    }
    return pixelAdjustedForScroll;
  }
  /**
   * Calculate the height of the event on the timeline.
   */
  pixelHeightForEventOnChart(event) {
    const chartName = chartForEntry(event);
    const chart = chartName === "main" ? this.#charts.mainChart : this.#charts.networkChart;
    const provider = chartName === "main" ? this.#charts.mainProvider : this.#charts.networkProvider;
    const indexForEntry = provider.indexForEvent?.(event);
    if (typeof indexForEntry !== "number") {
      return null;
    }
    const timelineData = provider.timelineData();
    if (timelineData === null) {
      return null;
    }
    const level = timelineData.entryLevels.at(indexForEntry);
    if (typeof level === "undefined") {
      return null;
    }
    return chart.levelHeight(level);
  }
  /**
   * Calculate the height of the network chart. If the network chart has
   * height, we also allow for the size of the resize handle shown between the
   * two charts.
   *
   * Note that it is possible for the chart to have 0 height if the user is
   * looking at a trace with no network requests.
   */
  networkChartOffsetHeight() {
    if (this.#dimensions.charts.network === null) {
      return 0;
    }
    if (this.#dimensions.charts.network.heightPixels === 0) {
      return 0;
    }
    if (this.#dimensions.charts.network.allGroupsCollapsed) {
      return this.#dimensions.charts.network.heightPixels;
    }
    return this.#dimensions.charts.network.heightPixels + NETWORK_RESIZE_ELEM_HEIGHT_PX;
  }
  /**
   * Hides or shows an element. We used to use visibility rather than display,
   * but a child of an element with visibility: hidden may still be visible if
   * its own `display` property is set.
   */
  #setOverlayElementVisibility(element, isVisible) {
    element.style.display = isVisible ? "block" : "none";
  }
}
export function timingsForOverlayEntry(entry) {
  if (Trace.Types.Events.isLegacyTimelineFrame(entry)) {
    return {
      startTime: entry.startTime,
      endTime: entry.endTime,
      duration: entry.duration
    };
  }
  return Trace.Helpers.Timing.eventTimingsMicroSeconds(entry);
}
export function jsLogContext(overlay) {
  switch (overlay.type) {
    case "ENTRY_SELECTED": {
      return null;
    }
    case "ENTRY_OUTLINE": {
      return `timeline.overlays.entry-outline-${Platform.StringUtilities.toKebabCase(overlay.outlineReason)}`;
    }
    case "ENTRY_LABEL": {
      return "timeline.overlays.entry-label";
    }
    case "ENTRIES_LINK": {
      if (overlay.state !== Trace.Types.File.EntriesLinkState.CONNECTED) {
        return null;
      }
      return "timeline.overlays.entries-link";
    }
    case "TIME_RANGE": {
      return "timeline.overlays.time-range";
    }
    case "TIMESPAN_BREAKDOWN": {
      return "timeline.overlays.timespan-breakdown";
    }
    case "TIMESTAMP_MARKER": {
      return "timeline.overlays.cursor-timestamp-marker";
    }
    case "CANDY_STRIPED_TIME_RANGE": {
      return "timeline.overlays.candy-striped-time-range";
    }
    case "TIMINGS_MARKER": {
      return "timeline.overlays.timings-marker";
    }
    default:
      Platform.assertNever(overlay, "Unknown overlay type");
  }
}
//# sourceMappingURL=OverlaysImpl.js.map

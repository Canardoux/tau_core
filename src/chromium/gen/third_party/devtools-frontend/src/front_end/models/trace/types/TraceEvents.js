"use strict";
export var Phase = /* @__PURE__ */ ((Phase2) => {
  Phase2["BEGIN"] = "B";
  Phase2["END"] = "E";
  Phase2["COMPLETE"] = "X";
  Phase2["INSTANT"] = "I";
  Phase2["COUNTER"] = "C";
  Phase2["ASYNC_NESTABLE_START"] = "b";
  Phase2["ASYNC_NESTABLE_INSTANT"] = "n";
  Phase2["ASYNC_NESTABLE_END"] = "e";
  Phase2["ASYNC_STEP_INTO"] = "T";
  Phase2["ASYNC_BEGIN"] = "S";
  Phase2["ASYNC_END"] = "F";
  Phase2["ASYNC_STEP_PAST"] = "p";
  Phase2["FLOW_START"] = "s";
  Phase2["FLOW_STEP"] = "t";
  Phase2["FLOW_END"] = "f";
  Phase2["SAMPLE"] = "P";
  Phase2["OBJECT_CREATED"] = "N";
  Phase2["OBJECT_SNAPSHOT"] = "O";
  Phase2["OBJECT_DESTROYED"] = "D";
  Phase2["METADATA"] = "M";
  Phase2["MEMORY_DUMP_GLOBAL"] = "V";
  Phase2["MEMORY_DUMP_PROCESS"] = "v";
  Phase2["MARK"] = "R";
  Phase2["CLOCK_SYNC"] = "c";
  return Phase2;
})(Phase || {});
export function isNestableAsyncPhase(phase) {
  return phase === "b" /* ASYNC_NESTABLE_START */ || phase === "e" /* ASYNC_NESTABLE_END */ || phase === "n" /* ASYNC_NESTABLE_INSTANT */;
}
export function isPhaseAsync(phase) {
  return isNestableAsyncPhase(phase) || phase === "S" /* ASYNC_BEGIN */ || phase === "T" /* ASYNC_STEP_INTO */ || phase === "F" /* ASYNC_END */ || phase === "p" /* ASYNC_STEP_PAST */;
}
export function isFlowPhase(phase) {
  return phase === "s" /* FLOW_START */ || phase === "t" /* FLOW_STEP */ || phase === "f" /* FLOW_END */;
}
export var Scope = /* @__PURE__ */ ((Scope2) => {
  Scope2["THREAD"] = "t";
  Scope2["PROCESS"] = "p";
  Scope2["GLOBAL"] = "g";
  return Scope2;
})(Scope || {});
export function objectIsCallFrame(object) {
  return "functionName" in object && typeof object.functionName === "string" && ("scriptId" in object && (typeof object.scriptId === "string" || typeof object.scriptId === "number")) && ("columnNumber" in object && typeof object.columnNumber === "number") && ("lineNumber" in object && typeof object.lineNumber === "number") && ("url" in object && typeof object.url === "string");
}
export function isRunTask(event) {
  return event.name === "RunTask" /* RUN_TASK */;
}
export var AuctionWorkletType = /* @__PURE__ */ ((AuctionWorkletType2) => {
  AuctionWorkletType2["BIDDER"] = "bidder";
  AuctionWorkletType2["SELLER"] = "seller";
  AuctionWorkletType2["UNKNOWN"] = "unknown";
  return AuctionWorkletType2;
})(AuctionWorkletType || {});
export function isAuctionWorkletRunningInProcess(event) {
  return event.name === "AuctionWorkletRunningInProcess";
}
export function isAuctionWorkletDoneWithProcess(event) {
  return event.name === "AuctionWorkletDoneWithProcess";
}
export function isScreenshot(event) {
  return event.name === "Screenshot" /* SCREENSHOT */;
}
const markerTypeGuards = [
  isMarkDOMContent,
  isMarkLoad,
  isFirstPaint,
  isFirstContentfulPaint,
  isLargestContentfulPaintCandidate,
  isNavigationStart
];
export const MarkerName = ["MarkDOMContent", "MarkLoad", "firstPaint", "firstContentfulPaint", "largestContentfulPaint::Candidate"];
export function isMarkerEvent(event) {
  if (event.ph === "I" /* INSTANT */ || event.ph === "R" /* MARK */) {
    return markerTypeGuards.some((fn) => fn(event));
  }
  return false;
}
const pageLoadEventTypeGuards = [
  ...markerTypeGuards,
  isInteractiveTime
];
export function eventIsPageLoadEvent(event) {
  if (event.ph === "I" /* INSTANT */ || event.ph === "R" /* MARK */) {
    return pageLoadEventTypeGuards.some((fn) => fn(event));
  }
  return false;
}
export function isTracingSessionIdForWorker(event) {
  return event.name === "TracingSessionIdForWorker";
}
export const NO_NAVIGATION = "NO_NAVIGATION";
export var LayoutInvalidationReason = /* @__PURE__ */ ((LayoutInvalidationReason2) => {
  LayoutInvalidationReason2["SIZE_CHANGED"] = "Size changed";
  LayoutInvalidationReason2["ATTRIBUTE"] = "Attribute";
  LayoutInvalidationReason2["ADDED_TO_LAYOUT"] = "Added to layout";
  LayoutInvalidationReason2["SCROLLBAR_CHANGED"] = "Scrollbar changed";
  LayoutInvalidationReason2["REMOVED_FROM_LAYOUT"] = "Removed from layout";
  LayoutInvalidationReason2["STYLE_CHANGED"] = "Style changed";
  LayoutInvalidationReason2["FONTS_CHANGED"] = "Fonts changed";
  LayoutInvalidationReason2["UNKNOWN"] = "Unknown";
  return LayoutInvalidationReason2;
})(LayoutInvalidationReason || {});
export function isScheduleStyleInvalidationTracking(event) {
  return event.name === "ScheduleStyleInvalidationTracking" /* SCHEDULE_STYLE_INVALIDATION_TRACKING */;
}
export var StyleRecalcInvalidationReason = /* @__PURE__ */ ((StyleRecalcInvalidationReason2) => {
  StyleRecalcInvalidationReason2["ANIMATION"] = "Animation";
  return StyleRecalcInvalidationReason2;
})(StyleRecalcInvalidationReason || {});
export function isStyleRecalcInvalidationTracking(event) {
  return event.name === "StyleRecalcInvalidationTracking" /* STYLE_RECALC_INVALIDATION_TRACKING */;
}
export function isStyleInvalidatorInvalidationTracking(event) {
  return event.name === "StyleInvalidatorInvalidationTracking" /* STYLE_INVALIDATOR_INVALIDATION_TRACKING */;
}
export function isBeginCommitCompositorFrame(event) {
  return event.name === "BeginCommitCompositorFrame" /* BEGIN_COMMIT_COMPOSITOR_FRAME */;
}
export function isParseMetaViewport(event) {
  return event.name === "ParseMetaViewport" /* PARSE_META_VIEWPORT */;
}
export function isScheduleStyleRecalculation(event) {
  return event.name === "ScheduleStyleRecalculation" /* SCHEDULE_STYLE_RECALCULATION */;
}
export function isRenderFrameImplCreateChildFrame(event) {
  return event.name === "RenderFrameImpl::createChildFrame" /* RENDER_FRAME_IMPL_CREATE_CHILD_FRAME */;
}
export function isLayoutImageUnsized(event) {
  return event.name === "LayoutImageUnsized" /* LAYOUT_IMAGE_UNSIZED */;
}
export function isAnimationFrameAsyncStart(data) {
  return data.name === "AnimationFrame" /* ANIMATION_FRAME */ && data.ph === "b" /* ASYNC_NESTABLE_START */;
}
export function isAnimationFrameAsyncEnd(data) {
  return data.name === "AnimationFrame" /* ANIMATION_FRAME */ && data.ph === "e" /* ASYNC_NESTABLE_END */;
}
export function isAnimationFramePresentation(data) {
  return data.name === "AnimationFrame::Presentation" /* ANIMATION_FRAME_PRESENTATION */;
}
var State = /* @__PURE__ */ ((State2) => {
  State2["STATE_NO_UPDATE_DESIRED"] = "STATE_NO_UPDATE_DESIRED";
  State2["STATE_PRESENTED_ALL"] = "STATE_PRESENTED_ALL";
  State2["STATE_PRESENTED_PARTIAL"] = "STATE_PRESENTED_PARTIAL";
  State2["STATE_DROPPED"] = "STATE_DROPPED";
  return State2;
})(State || {});
var FrameDropReason = /* @__PURE__ */ ((FrameDropReason2) => {
  FrameDropReason2["REASON_UNSPECIFIED"] = "REASON_UNSPECIFIED";
  FrameDropReason2["REASON_DISPLAY_COMPOSITOR"] = "REASON_DISPLAY_COMPOSITOR";
  FrameDropReason2["REASON_MAIN_THREAD"] = "REASON_MAIN_THREAD";
  FrameDropReason2["REASON_CLIENT_COMPOSITOR"] = "REASON_CLIENT_COMPOSITOR";
  return FrameDropReason2;
})(FrameDropReason || {});
var ScrollState = /* @__PURE__ */ ((ScrollState2) => {
  ScrollState2["SCROLL_NONE"] = "SCROLL_NONE";
  ScrollState2["SCROLL_MAIN_THREAD"] = "SCROLL_MAIN_THREAD";
  ScrollState2["SCROLL_COMPOSITOR_THREAD"] = "SCROLL_COMPOSITOR_THREAD";
  ScrollState2["SCROLL_UNKNOWN"] = "SCROLL_UNKNOWN";
  return ScrollState2;
})(ScrollState || {});
var FrameType = /* @__PURE__ */ ((FrameType2) => {
  FrameType2["FORKED"] = "FORKED";
  FrameType2["BACKFILL"] = "BACKFILL";
  return FrameType2;
})(FrameType || {});
export function isPipelineReporter(event) {
  return event.name === "PipelineReporter" /* PIPELINE_REPORTER */;
}
export function isSyntheticBased(event) {
  return "rawSourceEvent" in event;
}
export function isSyntheticInteraction(event) {
  return Boolean(
    "interactionId" in event && event.args?.data && "beginEvent" in event.args.data && "endEvent" in event.args.data
  );
}
export function isDrawFrame(event) {
  return event.name === "DrawFrame" /* DRAW_FRAME */ && event.ph === "I" /* INSTANT */;
}
export function isLegacyTraceEventDrawFrameBegin(event) {
  return event.name === "DrawFrame" /* DRAW_FRAME */ && event.ph === "b" /* ASYNC_NESTABLE_START */;
}
export function isBeginFrame(event) {
  return Boolean(event.name === "BeginFrame" /* BEGIN_FRAME */ && event.args && "frameSeqId" in event.args);
}
export function isDroppedFrame(event) {
  return Boolean(event.name === "DroppedFrame" /* DROPPED_FRAME */ && event.args && "frameSeqId" in event.args);
}
export function isRequestMainThreadFrame(event) {
  return event.name === "RequestMainThreadFrame" /* REQUEST_MAIN_THREAD_FRAME */;
}
export function isBeginMainThreadFrame(event) {
  return event.name === "BeginMainThreadFrame" /* BEGIN_MAIN_THREAD_FRAME */;
}
export function isNeedsBeginFrameChanged(event) {
  return event.name === "NeedsBeginFrameChanged" /* NEEDS_BEGIN_FRAME_CHANGED */;
}
export function isCommit(event) {
  return Boolean(event.name === "Commit" /* COMMIT */ && event.args && "frameSeqId" in event.args);
}
export function isRasterTask(event) {
  return event.name === "RasterTask" /* RASTER_TASK */;
}
export function isCompositeLayers(event) {
  return event.name === "CompositeLayers" /* COMPOSITE_LAYERS */;
}
export function isActivateLayerTree(event) {
  return event.name === "ActivateLayerTree" /* ACTIVATE_LAYER_TREE */;
}
export function isInvalidationTracking(event) {
  return isScheduleStyleInvalidationTracking(event) || isStyleRecalcInvalidationTracking(event) || isStyleInvalidatorInvalidationTracking(event) || isLayoutInvalidationTracking(event);
}
export function isDrawLazyPixelRef(event) {
  return event.name === "Draw LazyPixelRef" /* DRAW_LAZY_PIXEL_REF */;
}
export function isDecodeLazyPixelRef(event) {
  return event.name === "Decode LazyPixelRef" /* DECODE_LAZY_PIXEL_REF */;
}
export function isDecodeImage(event) {
  return event.name === "Decode Image" /* DECODE_IMAGE */;
}
export var SelectorTimingsKey = /* @__PURE__ */ ((SelectorTimingsKey2) => {
  SelectorTimingsKey2["Elapsed"] = "elapsed (us)";
  SelectorTimingsKey2["RejectPercentage"] = "reject_percentage";
  SelectorTimingsKey2["FastRejectCount"] = "fast_reject_count";
  SelectorTimingsKey2["MatchAttempts"] = "match_attempts";
  SelectorTimingsKey2["MatchCount"] = "match_count";
  SelectorTimingsKey2["Selector"] = "selector";
  SelectorTimingsKey2["StyleSheetId"] = "style_sheet_id";
  return SelectorTimingsKey2;
})(SelectorTimingsKey || {});
export function isSelectorStats(event) {
  return event.name === "SelectorStats" /* SELECTOR_STATS */;
}
export function isUpdateLayoutTree(event) {
  return event.name === "UpdateLayoutTree" /* UPDATE_LAYOUT_TREE */;
}
export function isLayout(event) {
  return event.name === "Layout" /* LAYOUT */;
}
export function isInvalidateLayout(event) {
  return event.name === "InvalidateLayout" /* INVALIDATE_LAYOUT */;
}
export function isDebuggerAsyncTaskScheduled(event) {
  return event.name === "v8::Debugger::AsyncTaskScheduled" /* DEBUGGER_ASYNC_TASK_SCHEDULED */;
}
export function isDebuggerAsyncTaskRun(event) {
  return event.name === "v8::Debugger::AsyncTaskRun" /* DEBUGGER_ASYNC_TASK_RUN */;
}
class ProfileIdTag {
  #profileIdTag;
}
export function ProfileID(value) {
  return value;
}
class CallFrameIdTag {
  #callFrameIdTag;
}
export function CallFrameID(value) {
  return value;
}
class SampleIndexTag {
  #sampleIndexTag;
}
export function SampleIndex(value) {
  return value;
}
class ProcessIdTag {
  #processIdTag;
}
export function ProcessID(value) {
  return value;
}
class ThreadIdTag {
  #threadIdTag;
}
export function ThreadID(value) {
  return value;
}
class WorkerIdTag {
  #workerIdTag;
}
export function WorkerId(value) {
  return value;
}
export function isComplete(event) {
  return event.ph === "X" /* COMPLETE */;
}
export function isBegin(event) {
  return event.ph === "B" /* BEGIN */;
}
export function isEnd(event) {
  return event.ph === "E" /* END */;
}
export function isDispatch(event) {
  return event.name === "EventDispatch";
}
export function isInstant(event) {
  return event.ph === "I" /* INSTANT */;
}
export function isRendererEvent(event) {
  return isInstant(event) || isComplete(event);
}
export function isFireIdleCallback(event) {
  return event.name === "FireIdleCallback";
}
export function isSchedulePostMessage(event) {
  return event.name === "SchedulePostMessage" /* SCHEDULE_POST_MESSAGE */;
}
export function isHandlePostMessage(event) {
  return event.name === "HandlePostMessage" /* HANDLE_POST_MESSAGE */;
}
export function isUpdateCounters(event) {
  return event.name === "UpdateCounters";
}
export function isThreadName(event) {
  return event.name === "thread_name" /* THREAD_NAME */;
}
export function isProcessName(event) {
  return event.name === "process_name";
}
export function isTracingStartedInBrowser(event) {
  return event.name === "TracingStartedInBrowser" /* TRACING_STARTED_IN_BROWSER */;
}
export function isFrameCommittedInBrowser(event) {
  return event.name === "FrameCommittedInBrowser";
}
export function isCommitLoad(event) {
  return event.name === "CommitLoad";
}
export function isNavigationStartUnreliable(event) {
  return event.name === "navigationStart";
}
export function isAnimation(event) {
  return event.name === "Animation" && event.cat.includes("devtools.timeline");
}
export function isSyntheticAnimation(event) {
  if (event.name !== "Animation" || !event.cat.includes("devtools.timeline")) {
    return false;
  }
  const data = event.args?.data;
  if (!data) {
    return false;
  }
  return "beginEvent" in data && "endEvent" in data;
}
export function isLayoutShift(event) {
  return event.name === "LayoutShift";
}
export function isLayoutInvalidationTracking(event) {
  return event.name === "LayoutInvalidationTracking" /* LAYOUT_INVALIDATION_TRACKING */;
}
export function isFirstContentfulPaint(event) {
  return event.name === "firstContentfulPaint";
}
export function isLargestContentfulPaintCandidate(event) {
  return event.name === "largestContentfulPaint::Candidate" /* MARK_LCP_CANDIDATE */;
}
export function isLargestImagePaintCandidate(event) {
  return event.name === "LargestImagePaint::Candidate";
}
export function isLargestTextPaintCandidate(event) {
  return event.name === "LargestTextPaint::Candidate";
}
export function isMarkLoad(event) {
  return event.name === "MarkLoad";
}
export function isFirstPaint(event) {
  return event.name === "firstPaint";
}
export function isMarkDOMContent(event) {
  return event.name === "MarkDOMContent";
}
export function isInteractiveTime(event) {
  return event.name === "InteractiveTime";
}
export function isEventTiming(event) {
  return event.name === "EventTiming" /* EVENT_TIMING */;
}
export function isEventTimingEnd(event) {
  return isEventTiming(event) && event.ph === "e" /* ASYNC_NESTABLE_END */;
}
export function isEventTimingStart(event) {
  return isEventTiming(event) && event.ph === "b" /* ASYNC_NESTABLE_START */;
}
export function isGPUTask(event) {
  return event.name === "GPUTask";
}
export function isProfile(event) {
  return event.name === "Profile";
}
export function isSyntheticCpuProfile(event) {
  return event.name === "CpuProfile";
}
export function isProfileChunk(event) {
  return event.name === "ProfileChunk";
}
export function isResourceChangePriority(event) {
  return event.name === "ResourceChangePriority";
}
export function isResourceSendRequest(event) {
  return event.name === "ResourceSendRequest";
}
export function isResourceReceiveResponse(event) {
  return event.name === "ResourceReceiveResponse";
}
export function isResourceMarkAsCached(event) {
  return event.name === "ResourceMarkAsCached";
}
export function isResourceFinish(event) {
  return event.name === "ResourceFinish";
}
export function isResourceWillSendRequest(event) {
  return event.name === "ResourceWillSendRequest";
}
export function isResourceReceivedData(event) {
  return event.name === "ResourceReceivedData";
}
export function isSyntheticNetworkRequest(event) {
  return event.name === "SyntheticNetworkRequest";
}
export function isSyntheticWebSocketConnection(event) {
  return event.name === "SyntheticWebSocketConnection";
}
export function isNetworkTrackEntry(event) {
  return isSyntheticNetworkRequest(event) || isSyntheticWebSocketConnection(event) || isWebSocketTraceEvent(event);
}
export function isPrePaint(event) {
  return event.name === "PrePaint";
}
export function isNavigationStart(event) {
  return Boolean(isNavigationStartUnreliable(event) && event.args.data && event.args.data.documentLoaderURL !== "");
}
export function isMainFrameViewport(event) {
  return event.name === "PaintTimingVisualizer::Viewport";
}
export function isSyntheticUserTiming(event) {
  if (event.cat !== "blink.user_timing") {
    return false;
  }
  const data = event.args?.data;
  if (!data) {
    return false;
  }
  return "beginEvent" in data && "endEvent" in data;
}
export function isSyntheticConsoleTiming(event) {
  if (event.cat !== "blink.console") {
    return false;
  }
  const data = event.args?.data;
  if (!data) {
    return false;
  }
  return "beginEvent" in data && "endEvent" in data;
}
export function isUserTiming(event) {
  return event.cat === "blink.user_timing";
}
export function isDomLoading(event) {
  return event.name === "domLoading" /* DOM_LOADING */;
}
export function isBeginRemoteFontLoad(event) {
  return event.name === "BeginRemoteFontLoad" /* BEGIN_REMOTE_FONT_LOAD */;
}
export function isPerformanceMeasure(event) {
  return isUserTiming(event) && isPhaseAsync(event.ph);
}
export function isPerformanceMark(event) {
  return isUserTiming(event) && (event.ph === "R" /* MARK */ || event.ph === "I" /* INSTANT */);
}
export function isConsoleTime(event) {
  return event.cat === "blink.console" && isPhaseAsync(event.ph);
}
export function isTimeStamp(event) {
  return event.ph === "I" /* INSTANT */ && event.name === "TimeStamp";
}
export function isParseHTML(event) {
  return event.name === "ParseHTML";
}
export function isSyntheticLayoutShift(event) {
  if (!isLayoutShift(event) || !event.args.data) {
    return false;
  }
  return "rawEvent" in event.args.data;
}
export function isSyntheticLayoutShiftCluster(event) {
  return event.name === "SyntheticLayoutShiftCluster" /* SYNTHETIC_LAYOUT_SHIFT_CLUSTER */;
}
export function isProfileCall(event) {
  return "callFrame" in event;
}
export function isPaint(event) {
  return event.name === "Paint" /* PAINT */;
}
export function isPaintImage(event) {
  return event.name === "PaintImage" /* PAINT_IMAGE */;
}
export function isScrollLayer(event) {
  return event.name === "ScrollLayer" /* SCROLL_LAYER */;
}
export function isSetLayerId(event) {
  return event.name === "SetLayerTreeId" /* SET_LAYER_TREE_ID */;
}
export function isUpdateLayer(event) {
  return event.name === "UpdateLayer" /* UPDATE_LAYER */;
}
export function isDisplayListItemListSnapshot(event) {
  return event.name === "cc::DisplayItemList" /* DISPLAY_ITEM_LIST_SNAPSHOT */;
}
export function isLayerTreeHostImplSnapshot(event) {
  return event.name === "cc::LayerTreeHostImpl" /* LAYER_TREE_HOST_IMPL_SNAPSHOT */;
}
export function isFireAnimationFrame(event) {
  return event.name === "FireAnimationFrame" /* FIRE_ANIMATION_FRAME */;
}
export function isRequestAnimationFrame(event) {
  return event.name === "RequestAnimationFrame" /* REQUEST_ANIMATION_FRAME */;
}
export function isTimerInstall(event) {
  return event.name === "TimerInstall" /* TIMER_INSTALL */;
}
export function isTimerFire(event) {
  return event.name === "TimerFire" /* TIMER_FIRE */;
}
export function isRequestIdleCallback(event) {
  return event.name === "RequestIdleCallback" /* REQUEST_IDLE_CALLBACK */;
}
export function isWebSocketCreate(event) {
  return event.name === "WebSocketCreate" /* WEB_SOCKET_CREATE */;
}
export function isWebSocketInfo(event) {
  return event.name === "WebSocketSendHandshakeRequest" /* WEB_SOCKET_SEND_HANDSHAKE_REQUEST */ || event.name === "WebSocketReceiveHandshakeResponse" /* WEB_SOCKET_RECEIVE_HANDSHAKE_REQUEST */ || event.name === "WebSocketDestroy" /* WEB_SOCKET_DESTROY */;
}
export function isWebSocketTransfer(event) {
  return event.name === "WebSocketSend" /* WEB_SOCKET_SEND */ || event.name === "WebSocketReceive" /* WEB_SOCKET_RECEIVE */;
}
export function isWebSocketSend(event) {
  return event.name === "WebSocketSend" /* WEB_SOCKET_SEND */;
}
export function isWebSocketReceive(event) {
  return event.name === "WebSocketReceive" /* WEB_SOCKET_RECEIVE */;
}
export function isWebSocketSendHandshakeRequest(event) {
  return event.name === "WebSocketSendHandshakeRequest" /* WEB_SOCKET_SEND_HANDSHAKE_REQUEST */;
}
export function isWebSocketReceiveHandshakeResponse(event) {
  return event.name === "WebSocketReceiveHandshakeResponse" /* WEB_SOCKET_RECEIVE_HANDSHAKE_REQUEST */;
}
export function isWebSocketDestroy(event) {
  return event.name === "WebSocketDestroy" /* WEB_SOCKET_DESTROY */;
}
export function isWebSocketTraceEvent(event) {
  return isWebSocketCreate(event) || isWebSocketInfo(event) || isWebSocketTransfer(event);
}
export function isWebSocketEvent(event) {
  return isWebSocketTraceEvent(event) || isSyntheticWebSocketConnection(event);
}
export function isV8Compile(event) {
  return event.name === "v8.compile" /* COMPILE */;
}
export function isFunctionCall(event) {
  return event.name === "FunctionCall" /* FUNCTION_CALL */;
}
export function isSyntheticServerTiming(event) {
  return event.cat === "devtools.server-timing";
}
export function isSchedulePostTaskCallback(event) {
  return event.name === "SchedulePostTaskCallback" /* SCHEDULE_POST_TASK_CALLBACK */;
}
export function isRunPostTaskCallback(event) {
  return event.name === "RunPostTaskCallback" /* RUN_POST_TASK_CALLBACK */;
}
export function isAbortPostTaskCallback(event) {
  return event.name === "AbortPostTaskCallback" /* ABORT_POST_TASK_CALLBACK */;
}
export function isJSInvocationEvent(event) {
  switch (event.name) {
    case "RunMicrotasks" /* RUN_MICROTASKS */:
    case "FunctionCall" /* FUNCTION_CALL */:
    // TODO(paulirish): Define types for these Evaluate* events
    case "EvaluateScript" /* EVALUATE_SCRIPT */:
    case "v8.evaluateModule" /* EVALUATE_MODULE */:
    case "EventDispatch" /* EVENT_DISPATCH */:
    case "V8.Execute" /* V8_EXECUTE */:
      return true;
  }
  if (event.name.startsWith("v8") || event.name.startsWith("V8")) {
    return true;
  }
  if (isConsoleTaskRun(event)) {
    return true;
  }
  return false;
}
export function isConsoleTaskRun(event) {
  return isProfileCall(event) && event.callFrame.functionName === "run" && event.callFrame.columnNumber === -1 && event.callFrame.lineNumber === -1;
}
export function isFlowPhaseEvent(event) {
  return event.ph === "s" /* FLOW_START */ || event.ph === "t" /* FLOW_STEP */ || event.ph === "f" /* FLOW_END */;
}
export var Name = /* @__PURE__ */ ((Name2) => {
  Name2["THREAD_NAME"] = "thread_name";
  Name2["PROGRAM"] = "Program";
  Name2["RUN_TASK"] = "RunTask";
  Name2["ASYNC_TASK"] = "AsyncTask";
  Name2["RUN_MICROTASKS"] = "RunMicrotasks";
  Name2["XHR_LOAD"] = "XHRLoad";
  Name2["XHR_READY_STATE_CHANGED"] = "XHRReadyStateChange";
  Name2["PARSE_HTML"] = "ParseHTML";
  Name2["PARSE_CSS"] = "ParseAuthorStyleSheet";
  Name2["COMPILE_CODE"] = "V8.CompileCode";
  Name2["COMPILE_MODULE"] = "V8.CompileModule";
  Name2["COMPILE"] = "v8.compile";
  Name2["COMPILE_SCRIPT"] = "V8.CompileScript";
  Name2["OPTIMIZE"] = "V8.OptimizeCode";
  Name2["WASM_STREAM_FROM_RESPONSE_CALLBACK"] = "v8.wasm.streamFromResponseCallback";
  Name2["WASM_COMPILED_MODULE"] = "v8.wasm.compiledModule";
  Name2["WASM_CACHED_MODULE"] = "v8.wasm.cachedModule";
  Name2["WASM_MODULE_CACHE_HIT"] = "v8.wasm.moduleCacheHit";
  Name2["WASM_MODULE_CACHE_INVALID"] = "v8.wasm.moduleCacheInvalid";
  Name2["PROFILE_CALL"] = "ProfileCall";
  Name2["EVALUATE_SCRIPT"] = "EvaluateScript";
  Name2["FUNCTION_CALL"] = "FunctionCall";
  Name2["EVENT_DISPATCH"] = "EventDispatch";
  Name2["EVALUATE_MODULE"] = "v8.evaluateModule";
  Name2["REQUEST_MAIN_THREAD_FRAME"] = "RequestMainThreadFrame";
  Name2["REQUEST_ANIMATION_FRAME"] = "RequestAnimationFrame";
  Name2["CANCEL_ANIMATION_FRAME"] = "CancelAnimationFrame";
  Name2["FIRE_ANIMATION_FRAME"] = "FireAnimationFrame";
  Name2["REQUEST_IDLE_CALLBACK"] = "RequestIdleCallback";
  Name2["CANCEL_IDLE_CALLBACK"] = "CancelIdleCallback";
  Name2["FIRE_IDLE_CALLBACK"] = "FireIdleCallback";
  Name2["TIMER_INSTALL"] = "TimerInstall";
  Name2["TIMER_REMOVE"] = "TimerRemove";
  Name2["TIMER_FIRE"] = "TimerFire";
  Name2["WEB_SOCKET_CREATE"] = "WebSocketCreate";
  Name2["WEB_SOCKET_SEND_HANDSHAKE"] = "WebSocketSendHandshakeRequest";
  Name2["WEB_SOCKET_RECEIVE_HANDSHAKE"] = "WebSocketReceiveHandshakeResponse";
  Name2["WEB_SOCKET_DESTROY"] = "WebSocketDestroy";
  Name2["WEB_SOCKET_SEND"] = "WebSocketSend";
  Name2["WEB_SOCKET_RECEIVE"] = "WebSocketReceive";
  Name2["CRYPTO_DO_ENCRYPT"] = "DoEncrypt";
  Name2["CRYPTO_DO_ENCRYPT_REPLY"] = "DoEncryptReply";
  Name2["CRYPTO_DO_DECRYPT"] = "DoDecrypt";
  Name2["CRYPTO_DO_DECRYPT_REPLY"] = "DoDecryptReply";
  Name2["CRYPTO_DO_DIGEST"] = "DoDigest";
  Name2["CRYPTO_DO_DIGEST_REPLY"] = "DoDigestReply";
  Name2["CRYPTO_DO_SIGN"] = "DoSign";
  Name2["CRYPTO_DO_SIGN_REPLY"] = "DoSignReply";
  Name2["CRYPTO_DO_VERIFY"] = "DoVerify";
  Name2["CRYPTO_DO_VERIFY_REPLY"] = "DoVerifyReply";
  Name2["V8_EXECUTE"] = "V8.Execute";
  Name2["SCHEDULE_POST_TASK_CALLBACK"] = "SchedulePostTaskCallback";
  Name2["RUN_POST_TASK_CALLBACK"] = "RunPostTaskCallback";
  Name2["ABORT_POST_TASK_CALLBACK"] = "AbortPostTaskCallback";
  Name2["DEBUGGER_ASYNC_TASK_RUN"] = "v8::Debugger::AsyncTaskRun";
  Name2["DEBUGGER_ASYNC_TASK_SCHEDULED"] = "v8::Debugger::AsyncTaskScheduled";
  Name2["GC"] = "GCEvent";
  Name2["DOMGC"] = "BlinkGC.AtomicPhase";
  Name2["MAJOR_GC"] = "MajorGC";
  Name2["MINOR_GC"] = "MinorGC";
  Name2["GC_COLLECT_GARBARGE"] = "BlinkGC.AtomicPhase";
  Name2["CPPGC_SWEEP"] = "CppGC.IncrementalSweep";
  Name2["SCHEDULE_STYLE_RECALCULATION"] = "ScheduleStyleRecalculation";
  Name2["LAYOUT"] = "Layout";
  Name2["UPDATE_LAYOUT_TREE"] = "UpdateLayoutTree";
  Name2["INVALIDATE_LAYOUT"] = "InvalidateLayout";
  Name2["LAYOUT_INVALIDATION_TRACKING"] = "LayoutInvalidationTracking";
  Name2["COMPUTE_INTERSECTION"] = "ComputeIntersections";
  Name2["HIT_TEST"] = "HitTest";
  Name2["PRE_PAINT"] = "PrePaint";
  Name2["LAYERIZE"] = "Layerize";
  Name2["LAYOUT_SHIFT"] = "LayoutShift";
  Name2["SYNTHETIC_LAYOUT_SHIFT_CLUSTER"] = "SyntheticLayoutShiftCluster";
  Name2["UPDATE_LAYER_TREE"] = "UpdateLayerTree";
  Name2["SCHEDULE_STYLE_INVALIDATION_TRACKING"] = "ScheduleStyleInvalidationTracking";
  Name2["STYLE_RECALC_INVALIDATION_TRACKING"] = "StyleRecalcInvalidationTracking";
  Name2["STYLE_INVALIDATOR_INVALIDATION_TRACKING"] = "StyleInvalidatorInvalidationTracking";
  Name2["SELECTOR_STATS"] = "SelectorStats";
  Name2["BEGIN_COMMIT_COMPOSITOR_FRAME"] = "BeginCommitCompositorFrame";
  Name2["PARSE_META_VIEWPORT"] = "ParseMetaViewport";
  Name2["SCROLL_LAYER"] = "ScrollLayer";
  Name2["UPDATE_LAYER"] = "UpdateLayer";
  Name2["PAINT_SETUP"] = "PaintSetup";
  Name2["PAINT"] = "Paint";
  Name2["PAINT_IMAGE"] = "PaintImage";
  Name2["COMMIT"] = "Commit";
  Name2["COMPOSITE_LAYERS"] = "CompositeLayers";
  Name2["RASTER_TASK"] = "RasterTask";
  Name2["IMAGE_DECODE_TASK"] = "ImageDecodeTask";
  Name2["IMAGE_UPLOAD_TASK"] = "ImageUploadTask";
  Name2["DECODE_IMAGE"] = "Decode Image";
  Name2["DRAW_LAZY_PIXEL_REF"] = "Draw LazyPixelRef";
  Name2["DECODE_LAZY_PIXEL_REF"] = "Decode LazyPixelRef";
  Name2["GPU_TASK"] = "GPUTask";
  Name2["RASTERIZE"] = "Rasterize";
  Name2["EVENT_TIMING"] = "EventTiming";
  Name2["OPTIMIZE_CODE"] = "V8.OptimizeCode";
  Name2["CACHE_SCRIPT"] = "v8.produceCache";
  Name2["CACHE_MODULE"] = "v8.produceModuleCache";
  Name2["V8_SAMPLE"] = "V8Sample";
  Name2["JIT_CODE_ADDED"] = "JitCodeAdded";
  Name2["JIT_CODE_MOVED"] = "JitCodeMoved";
  Name2["STREAMING_COMPILE_SCRIPT"] = "v8.parseOnBackground";
  Name2["STREAMING_COMPILE_SCRIPT_WAITING"] = "v8.parseOnBackgroundWaiting";
  Name2["STREAMING_COMPILE_SCRIPT_PARSING"] = "v8.parseOnBackgroundParsing";
  Name2["BACKGROUND_DESERIALIZE"] = "v8.deserializeOnBackground";
  Name2["FINALIZE_DESERIALIZATION"] = "V8.FinalizeDeserialization";
  Name2["COMMIT_LOAD"] = "CommitLoad";
  Name2["MARK_LOAD"] = "MarkLoad";
  Name2["MARK_DOM_CONTENT"] = "MarkDOMContent";
  Name2["MARK_FIRST_PAINT"] = "firstPaint";
  Name2["MARK_FCP"] = "firstContentfulPaint";
  Name2["MARK_LCP_CANDIDATE"] = "largestContentfulPaint::Candidate";
  Name2["MARK_LCP_INVALIDATE"] = "largestContentfulPaint::Invalidate";
  Name2["NAVIGATION_START"] = "navigationStart";
  Name2["TIME_STAMP"] = "TimeStamp";
  Name2["CONSOLE_TIME"] = "ConsoleTime";
  Name2["USER_TIMING"] = "UserTiming";
  Name2["INTERACTIVE_TIME"] = "InteractiveTime";
  Name2["BEGIN_FRAME"] = "BeginFrame";
  Name2["NEEDS_BEGIN_FRAME_CHANGED"] = "NeedsBeginFrameChanged";
  Name2["BEGIN_MAIN_THREAD_FRAME"] = "BeginMainThreadFrame";
  Name2["ACTIVATE_LAYER_TREE"] = "ActivateLayerTree";
  Name2["DRAW_FRAME"] = "DrawFrame";
  Name2["DROPPED_FRAME"] = "DroppedFrame";
  Name2["FRAME_STARTED_LOADING"] = "FrameStartedLoading";
  Name2["PIPELINE_REPORTER"] = "PipelineReporter";
  Name2["SCREENSHOT"] = "Screenshot";
  Name2["RESOURCE_WILL_SEND_REQUEST"] = "ResourceWillSendRequest";
  Name2["RESOURCE_SEND_REQUEST"] = "ResourceSendRequest";
  Name2["RESOURCE_RECEIVE_RESPONSE"] = "ResourceReceiveResponse";
  Name2["RESOURCE_RECEIVE_DATA"] = "ResourceReceivedData";
  Name2["RESOURCE_FINISH"] = "ResourceFinish";
  Name2["RESOURCE_MARK_AS_CACHED"] = "ResourceMarkAsCached";
  Name2["WEB_SOCKET_SEND_HANDSHAKE_REQUEST"] = "WebSocketSendHandshakeRequest";
  Name2["WEB_SOCKET_RECEIVE_HANDSHAKE_REQUEST"] = "WebSocketReceiveHandshakeResponse";
  Name2["PROFILE"] = "Profile";
  Name2["START_PROFILING"] = "CpuProfiler::StartProfiling";
  Name2["PROFILE_CHUNK"] = "ProfileChunk";
  Name2["UPDATE_COUNTERS"] = "UpdateCounters";
  Name2["JS_SAMPLE"] = "JSSample";
  Name2["ANIMATION"] = "Animation";
  Name2["PARSE_AUTHOR_STYLE_SHEET"] = "ParseAuthorStyleSheet";
  Name2["EMBEDDER_CALLBACK"] = "EmbedderCallback";
  Name2["SET_LAYER_TREE_ID"] = "SetLayerTreeId";
  Name2["TRACING_STARTED_IN_PAGE"] = "TracingStartedInPage";
  Name2["TRACING_STARTED_IN_BROWSER"] = "TracingStartedInBrowser";
  Name2["TRACING_SESSION_ID_FOR_WORKER"] = "TracingSessionIdForWorker";
  Name2["LAZY_PIXEL_REF"] = "LazyPixelRef";
  Name2["LAYER_TREE_HOST_IMPL_SNAPSHOT"] = "cc::LayerTreeHostImpl";
  Name2["PICTURE_SNAPSHOT"] = "cc::Picture";
  Name2["DISPLAY_ITEM_LIST_SNAPSHOT"] = "cc::DisplayItemList";
  Name2["INPUT_LATENCY_MOUSE_MOVE"] = "InputLatency::MouseMove";
  Name2["INPUT_LATENCY_MOUSE_WHEEL"] = "InputLatency::MouseWheel";
  Name2["IMPL_SIDE_FLING"] = "InputHandlerProxy::HandleGestureFling::started";
  Name2["SCHEDULE_POST_MESSAGE"] = "SchedulePostMessage";
  Name2["HANDLE_POST_MESSAGE"] = "HandlePostMessage";
  Name2["RENDER_FRAME_IMPL_CREATE_CHILD_FRAME"] = "RenderFrameImpl::createChildFrame";
  Name2["LAYOUT_IMAGE_UNSIZED"] = "LayoutImageUnsized";
  Name2["DOM_LOADING"] = "domLoading";
  Name2["BEGIN_REMOTE_FONT_LOAD"] = "BeginRemoteFontLoad";
  Name2["ANIMATION_FRAME"] = "AnimationFrame";
  Name2["ANIMATION_FRAME_PRESENTATION"] = "AnimationFrame::Presentation";
  return Name2;
})(Name || {});
export const Categories = {
  Console: "blink.console",
  UserTiming: "blink.user_timing",
  Loading: "loading"
};
export function isLegacyTimelineFrame(data) {
  return "idle" in data && typeof data.idle === "boolean";
}
//# sourceMappingURL=TraceEvents.js.map

// Copyright 2024 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * Histogram buckets for UMA tracking of which type of result the History user
 * clicked.
 */
export var HistoryResultType;
(function (HistoryResultType) {
    HistoryResultType[HistoryResultType["TRADITIONAL"] = 0] = "TRADITIONAL";
    HistoryResultType[HistoryResultType["GROUPED"] = 1] = "GROUPED";
    HistoryResultType[HistoryResultType["EMBEDDINGS"] = 2] = "EMBEDDINGS";
    HistoryResultType[HistoryResultType["END"] = 3] = "END";
})(HistoryResultType || (HistoryResultType = {}));
/**
 * Histogram buckets for UMA tracking of Embeddings-related UMA actions. They
 * are defined here rather than in the history_embeddings component, because
 * History component itself needs to call this to provide a proper comparison
 * for users that don't have Embeddings enabled.
 */
export var HistoryEmbeddingsUserActions;
(function (HistoryEmbeddingsUserActions) {
    HistoryEmbeddingsUserActions[HistoryEmbeddingsUserActions["NON_EMPTY_QUERY_HISTORY_SEARCH"] = 0] = "NON_EMPTY_QUERY_HISTORY_SEARCH";
    // Intermediate values are omitted because they are never used from WebUI.
    // This is a total count, not the "last" usable enum value. It should be
    // updated to `HistoryEmbeddingsUserActions::kMaxValue + 1` if that changes.
    // See related comment in
    // chrome/browser/ui/webui/cr_components/history_embeddings/history_embeddings_handler.h
    // HistoryEmbeddingsUserActions::kMaxValue = 6
    HistoryEmbeddingsUserActions[HistoryEmbeddingsUserActions["END"] = 7] = "END";
})(HistoryEmbeddingsUserActions || (HistoryEmbeddingsUserActions = {}));
// Unclicked query results that live for less than this amount of milliseconds
// are ignored from the metrics perspective. This is to account for the fact
// that new query results are fetched per user keystroke.
export const QUERY_RESULT_MINIMUM_AGE = 2000;

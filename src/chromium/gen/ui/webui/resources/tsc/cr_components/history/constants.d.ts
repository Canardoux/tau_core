/**
 * Histogram buckets for UMA tracking of which type of result the History user
 * clicked.
 */
export declare enum HistoryResultType {
    TRADITIONAL = 0,
    GROUPED = 1,
    EMBEDDINGS = 2,
    END = 3
}
/**
 * Histogram buckets for UMA tracking of Embeddings-related UMA actions. They
 * are defined here rather than in the history_embeddings component, because
 * History component itself needs to call this to provide a proper comparison
 * for users that don't have Embeddings enabled.
 */
export declare enum HistoryEmbeddingsUserActions {
    NON_EMPTY_QUERY_HISTORY_SEARCH = 0,
    END = 7
}
export declare const QUERY_RESULT_MINIMUM_AGE = 2000;

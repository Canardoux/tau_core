export interface LoadTimeDataRaw {
    [key: string]: any;
}
declare class LoadTimeData {
    private data_;
    /**
     * Sets the backing object.
     *
     * Note that there is no getter for |data_| to discourage abuse of the form:
     *
     *     var value = loadTimeData.data()['key'];
     */
    set data(value: LoadTimeDataRaw);
    /**
     * @param id An ID of a value that might exist.
     * @return True if |id| is a key in the dictionary.
     */
    valueExists(id: string): boolean;
    /**
     * Fetches a value, expecting that it exists.
     * @param id The key that identifies the desired value.
     * @return The corresponding value.
     */
    getValue(id: string): any;
    /**
     * As above, but also makes sure that the value is a string.
     * @param id The key that identifies the desired string.
     * @return The corresponding string value.
     */
    getString(id: string): string;
    /**
     * Returns a formatted localized string where $1 to $9 are replaced by the
     * second to the tenth argument.
     * @param id The ID of the string we want.
     * @param args The extra values to include in the formatted output.
     * @return The formatted string.
     */
    getStringF(id: string, ...args: Array<string | number>): string;
    /**
     * Returns a formatted localized string where $1 to $9 are replaced by the
     * second to the tenth argument. Any standalone $ signs must be escaped as
     * $$.
     * @param label The label to substitute through. This is not an resource ID.
     * @param args The extra values to include in the formatted output.
     * @return The formatted string.
     */
    substituteString(label: string, ...args: Array<string | number>): string;
    /**
     * Returns a formatted string where $1 to $9 are replaced by the second to
     * tenth argument, split apart into a list of pieces describing how the
     * substitution was performed. Any standalone $ signs must be escaped as $$.
     * @param label A localized string to substitute through.
     *     This is not an resource ID.
     * @param args The extra values to include in the formatted output.
     * @return The formatted string pieces.
     */
    getSubstitutedStringPieces(label: string, ...args: Array<string | number>): Array<{
        value: string;
        arg: (string | null);
    }>;
    /**
     * As above, but also makes sure that the value is a boolean.
     * @param id The key that identifies the desired boolean.
     * @return The corresponding boolean value.
     */
    getBoolean(id: string): boolean;
    /**
     * As above, but also makes sure that the value is an integer.
     * @param id The key that identifies the desired number.
     * @return The corresponding number value.
     */
    getInteger(id: string): number;
    /**
     * Override values in loadTimeData with the values found in |replacements|.
     * @param replacements The dictionary object of keys to replace.
     */
    overrideValues(replacements: LoadTimeDataRaw): void;
    /**
     * Reset loadTimeData's data. Should only be used in tests.
     * @param newData The data to restore to, when null restores to unset state.
     */
    resetForTesting(newData?: LoadTimeDataRaw | null): void;
    /**
     * @return Whether loadTimeData.data has been set.
     */
    isInitialized(): boolean;
}
export declare const loadTimeData: LoadTimeData;
export {};

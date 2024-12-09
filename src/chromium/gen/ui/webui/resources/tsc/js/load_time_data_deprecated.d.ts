/**
 * Checks condition, throws error message if expectation fails.
 * @param {*} condition The condition to check for truthiness.
 * @param {string} message The message to display if the check fails.
 */
declare function expect(condition: any, message: string): void;
/**
 * Checks that the given value has the given type.
 * @param {string} id The id of the value (only used for error message).
 * @param {*} value The value to check the type on.
 * @param {string} type The type we expect |value| to be.
 */
declare function expectIsType(id: string, value: any, type: string): void;
/**
 * @fileoverview
 * NOTE: This file is deprecated, and provides only the minimal LoadTimeData
 * functions for places in the code still not using JS modules. Use
 * load_time_data.ts in all new code.
 *
 * This file defines a singleton which provides access to all data
 * that is available as soon as the page's resources are loaded (before DOM
 * content has finished loading). This data includes both localized strings and
 * any data that is important to have ready from a very early stage (e.g. things
 * that must be displayed right away).
 *
 * Note that loadTimeData is not guaranteed to be consistent between page
 * refreshes (https://crbug.com/740629) and should not contain values that might
 * change if the page is re-opened later.
 */
/** @type {!LoadTimeData} */
declare var loadTimeData: LoadTimeData;
declare class LoadTimeData {
    /** @type {?Object} */
    data_: Object | null;
    /**
     * Sets the backing object.
     *
     * Note that there is no getter for |data_| to discourage abuse of the form:
     *
     *     var value = loadTimeData.data()['key'];
     *
     * @param {Object} value The de-serialized page data.
     */
    set data(value: Object);
    /**
     * @param {string} id An ID of a value that might exist.
     * @return {boolean} True if |id| is a key in the dictionary.
     */
    valueExists(id: string): boolean;
    /**
     * Fetches a value, expecting that it exists.
     * @param {string} id The key that identifies the desired value.
     * @return {*} The corresponding value.
     */
    getValue(id: string): any;
    /**
     * As above, but also makes sure that the value is a string.
     * @param {string} id The key that identifies the desired string.
     * @return {string} The corresponding string value.
     */
    getString(id: string): string;
    /**
     * Returns a formatted localized string where $1 to $9 are replaced by the
     * second to the tenth argument.
     * @param {string} id The ID of the string we want.
     * @param {...(string|number)} var_args The extra values to include in the
     *     formatted output.
     * @return {string} The formatted string.
     */
    getStringF(id: string, ...args: (string | number)[]): string;
    /**
     * Returns a formatted localized string where $1 to $9 are replaced by the
     * second to the tenth argument. Any standalone $ signs must be escaped as
     * $$.
     * @param {string} label The label to substitute through.
     *     This is not an resource ID.
     * @param {...(string|number)} var_args The extra values to include in the
     *     formatted output.
     * @return {string} The formatted string.
     */
    substituteString(label: string, ...args: (string | number)[]): string;
    /**
     * As above, but also makes sure that the value is a boolean.
     * @param {string} id The key that identifies the desired boolean.
     * @return {boolean} The corresponding boolean value.
     */
    getBoolean(id: string): boolean;
    /**
     * As above, but also makes sure that the value is an integer.
     * @param {string} id The key that identifies the desired number.
     * @return {number} The corresponding number value.
     */
    getInteger(id: string): number;
    /**
     * Override values in loadTimeData with the values found in |replacements|.
     * @param {Object} replacements The dictionary object of keys to replace.
     */
    overrideValues(replacements: Object): void;
}

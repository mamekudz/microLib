// ===========================================
// BooleanUtils.js
// © 1996-2026 Meinolf Amekudzi
// (published under MIT license)
// ===========================================

/**
 * Boolean prototype extensions.
 * @module BooleanUtils
 */

/** Static class with default strings for boolean values.
 * @class BooleanUtils
 */
export default class BooleanUtils {
	/** STATIC: Default translated string for the boolean value true.
	 * @static
	 * @type {string}
	 */
	static trueString = 'yes<context="boolean standard text">'.I18xTrans();
	/** STATIC: Default translated string for the boolean value false.
	 * @static
	 * @type {string}
	 */
	static falseString = 'no<context="boolean standard text">'.I18xTrans()
}

/** General Boolean extensions.
 * @class Boolean
 */

/** Converts this boolean to a string.
 * @param {string} [_trueString=null]    The string to return if true, defaults to BooleanUtils.trueString.
 * @param {string} [_falseString=null]    The string to return if false, defaults to BooleanUtils.falseString.
 * @returns {string}    The string representation of this boolean.
 */
Boolean.prototype.asString = function (_trueString = null, _falseString = null) {
	if (_trueString == null) _trueString = BooleanUtils.trueString;
	if (_falseString == null) _falseString = BooleanUtils.falseString;
	return this.valueOf() ? _trueString : _falseString;
}

/** Converts this boolean to a number.
 * @returns {number}    1 if true, 0 if false.
 */
Boolean.prototype.asNumber = function () {
	return this.valueOf() ? 1 : 0;
}
// ===========================================
// NumberUtils.js
/// © 1996-2026 Meinolf Amekudzi
// (published under MIT license)
// ===========================================


/** General Number prototype extensions.
 * @module NumberUtils
 */

/** General Number prototype extensions.
 * @class Number
 */

/** Converts an integer number to string with a specified count of digits, zero characters will be added to begin of string.
 * @param {number} _n    Number of characters in resulting string.
 * @return {string}    Resulting string with _n number of characters.
 */
Number.prototype.PreZero = function (_n) {
	return this.toString().PadStart(_n, "0");
}

/** Cutting a float number to 1/1000000000, needed for 64Bit float numbers in other languages (e.g. C#).
 * @return {number}    Clipped float number.
 */
Number.prototype.SysClp = function () {
	return Math.round(this.valueOf() * 1000000000.0) / 1000000000.0;
}

/** Returns this number rounded to a given count of fraction digits.
 * @param {number} _frac    The count of fraction digits to round to.
 * @return {number}    The number rounded to the given count of fraction digits.
 */
Number.prototype.Frac = function (_frac) {
	let n = Math.pow(10, _frac);
	return Math.round(this.valueOf() * n) / n;
}

/** Returns the clamped value between a _min value and a _max value.
 * @param {number} _min  The minimum value to clamp to.
 * @param {number} _max  The maximum value to clamp to.
 * @return {number}    The clamped value.
 */
Number.prototype.Clamp = function (_min, _max) {
	let ret = this.valueOf();
	if (this < _min) ret = _min;
	if (this > _max) ret = _max;
	return ret;
}

/** Returns numeric integer of a number (type-free fill function).
 * @param {number} [_base]    The numeric base (ignored, provided for API compatibility with String).
 * @return {number}    The numeric value of this number.
 */
Number.prototype.ParseInt = function (_base) {
	return this.valueOf();
}

/** Returns numeric float of a number (type-free fill function).
 * @return {number}    The numeric value of this number.
 */
Number.prototype.ParseFloat = function () {
	return this.valueOf();
}

/** Returns htmlEntities of a number (type-free fill function).
 * @param {number} [_mode]    The conversion mode (ignored, provided for API compatibility with String).
 * @return {string}    This number as a string.
 */
Number.prototype.HtmlEntities = function (_mode) {
	return "" + this.valueOf();
}

/** Converts a number to a roman number string.
 * @return {string|boolean}    The roman number string, or false if this number is 0 or not a number.
 */
Number.prototype.ToRoman = function () {
	let i = 3, n = Math.abs(this.valueOf()), ret = "";
	if (!+n) return false;
	let digits = String(+n).split(""),
		key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM", "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC", "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
	while (i--) ret = (key[+digits.pop() + (i * 10)] || "") + ret;
	return Array(+digits.join("") + 1).join("M") + ret;
}

/** Logs a number to console.
 * @param {string} [_txt]  An optional prefix text.
 */
Number.prototype.Log = function (_txt) {
	if (_txt !== undefined) {
		console.Log(_txt, this);
	} else {
		console.Log(this);
	}
}

/** Converts a radians value to degrees value.
 * @return {number}    Degrees of the radian value.
 */
Number.prototype.Radians2Degrees = function () {
	return this * 180 / Math.PI;
}

/** Converts a degrees value to a radians value.
 * @return {number}    Radians of the degrees value.
 */
Number.prototype.Degrees2Radians = function () {
	return this * Math.PI / 180;
}

/** Returns true if number is a decimal value.
 * @return {boolean}    True if number is a decimal value.
 */
Number.prototype.IsFloat = function () {
	return /\./.test(this.toString());
}

/** Returns a number where the bits in the given _bitset will be set if the given boolean _bool is true
 * or will reset if the given boolean _bool is false.
 * @param {number} _bitset    The bit mask to set or reset.
 * @param {boolean} [_bool=true]    True to set the bits, false to reset them.
 * @return {number}    The resulting number with the bits set or reset.
 */
Number.prototype.BitSetByBool = function (_bitset, _bool = true) {
	return _bool ? this.valueOf() | _bitset : this.valueOf() & ~_bitset;
}


/** Converts this number to a string padded at the start with a given string up to a given length.
 * @param {number} _count    The target length of the resulting string.
 * @param {string} _str    The string to pad with.
 * @return {string}    The padded string representation of this number.
 */
Number.prototype.PadStart = function (_count, _str) {
	return (this.valueOf()+"").PadStart(_count, _str);
}
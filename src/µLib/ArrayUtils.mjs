// ===========================================
// ArrayUtils.js
// © 1996-2026 Meinolf Amekudzi
// (published under MIT license)
// ===========================================

import ObjectUtils from "./ObjectUtils.mjs";

/**
 * Array prototype extensions.
 * @module ArrayUtils
 */

/** General Array extensions.
 * @class Array
 */

/** Clears the array.
 */
Array.prototype.Clear = function () {
	this.length = 0;
}

/** Push a value if it is not currently in this array.
 * @param {*} _n    Any value to push.
 */
Array.prototype.PushIfNotIn = function (_n) {
	if (this.indexOf(_n) < 0) this.push(_n);
}

/** Checks whether there is an intersection of this array and the array _a.
 * @param {array} _a    An array to check an intersection.
 * @return {boolean}    True, if there is an intersection of both arrays.
 */
Array.prototype.IsIntersection = function (_a) {
	let i, l = this.length;
	for (i = 0; i < l; i++) if (_a.indexOf(this[i]) >= 0) return true;
	return false;
}

/** Checks whether all values of this array are contained in the array _a.
 * @param {array} _a    An array to check for containing values.
 * @return {boolean}    True, if all elements of this array are contained in array _a.
 */
Array.prototype.ContainsAll = function (_a) {
	// true => this array contains all of _a...
	let i, l = this.length;
	for (i = 0; i < l; i++) if (_a.indexOf(this[i]) < 0) return false;
	return true;
}

/** Adds all properties of a JSON object to this array as keyed entries.
 * @param {object} _json    A JSON object whose properties are copied into this array.
 */
Array.prototype.AddJSON = function (_json) {
	let i;
	for (i in _json) this[i] = _json[i];
}

/** Removes all elements equal to the given value from this array.
 * @param {*} _e    The value to remove.
 */
Array.prototype.RemoveElement = function (_e) {
	let i, l = this.length;
	for (i = 0; i < l; i++) if (_e == this[i]) this.splice(i, 1);
}

/** Removes duplicate values from this array in place (known to be faulty, see inline note).
 */
Array.prototype.CleanMultiple = function () {
	// !!!!!!!!!!!!!!!!!!!!!!!!!!  WRONG !!!!!!!!!!!!!!!
	let i, ret = this, l = ret.length;
	this.length = 0;
	for (i = 0; i < l; i++) if (!this.indexOf(ret[i])) this.push(ret[i]);
}

/** Removes all elements from this array which are contained in the given array.
 * @param {array} _e    An array of values to remove.
 */
Array.prototype.RemoveElements = function (_e) {
	let i, l = this.length;
	for (i = 0; i < l; i++) if (_e.indexOf(this[i]) >= 0) this.splice(i, 1);
}

/** Removes the element at the given index from this array.
 * @param {number} _n    The index of the element to remove.
 */
Array.prototype.RemoveAt = function (_n) {
	this.splice(_n, 1);
}

/** Joins all key/value pairs of this array to a string, each pair followed by the given delimiter.
 * @param {string} _e    The delimiter appended after each "key:value" pair.
 * @return {string}    The joined string of all key/value pairs.
 */
Array.prototype.Kjoin = function (_e) {
	let i, n = "";
	for (i in this) if (!(this[i] instanceof Function)) n += i + ":" + this[i] + _e;
	return n;
}

/** Returns a shallow copy of this array including keyed entries (functions are skipped).
 * @return {array}    A shallow copy of this array.
 */
Array.prototype.Copy = function () {
	let i, ret = [];
	for (i in this) if (!(this[i] instanceof Function)) ret[i] = this[i];
	return ret;
}

/** Checks whether this array is equal to the given array, comparing objects deeply and other values strictly.
 * @param {array} _ary    The array to compare with.
 * @return {boolean}    True, if both arrays have the same length and equal elements.
 */
Array.prototype.IsEqualTo = function (_ary) {
	let i, l = this.length;
	if (l !== _ary.length) return false;
	for (i = 0; i < l; i++) {
		// Check if both elements are objects before using areEqual
		if (typeof this[i] === 'object' && this[i] !== null && typeof _ary[i] === 'object' && _ary[i] !== null) {
			if (!ObjectUtils.areEqual(this[i], _ary[i])) return false;
		} else {
			// Use strict equality for non-object types
			if (this[i] !== _ary[i]) return false;
		}
	}
	return true;
}

/** Logs this array to the console, optionally prefixed with a text.
 * @param {string} [_txt]    An optional prefix text.
 */
Array.prototype.Log = function (_txt) {
	if (_txt !== undefined) {
		console.Log(_txt, this);
	} else {
		console.Log(this);
	}
}

/** Merges this array with the given array and returns a new array without duplicate values.
 * @param {array} _ary    The array to merge with.
 * @return {array}    A new array containing the distinct values of both arrays.
 */
Array.prototype.Merge = function (_ary) {
	let i, l = this.length, res = {}, ret = [];
	for (i = 0; i < l; i++) res[this[i]] = true;
	l = _ary.length;
	for (i = 0; i < l; i++) res[_ary[i]] = true;
	for (a in res) ret.push(a);
	return ret;
}

/** Converts this array to an object where each array value becomes a property set to true.
 * @return {object}    An object with the array values as property names.
 */
Array.prototype.ToObject = function () {
	let i, l = this.length, ret = {};
	for (i = 0; i < l; i++) ret[this[i]] = true;
	return ret;
}

/** Returns a new array with all elements of this array parsed as integers.
 * @return {array}    A new array of integer values.
 */
Array.prototype.IntegerContent = function () {
	let i, l = this.length, ret = [];
	for (i = 0; i < l; i++) ret.push(parseInt(this[i], 10));
	return ret;
}

/** Swaps the element at the given index with its successor.
 * @param {number} _i    The index of the element to move up.
 * @return {number}    The new index of the element, or -1 if the array is empty.
 */
Array.prototype.MoveUp = function (_i) {
	let l = this.length, old;
	if (l == 0) return -1;
	if (_i == l - 1) return l - 1;
	old = this[_i + 1];
	this[_i + 1] = this[_i];
	this[_i] = old;
	return _i + 1;
}

/** Swaps the element at the given index with its predecessor.
 * @param {number} _i    The index of the element to move down.
 * @return {number}    The new index of the element, or -1 if the array is empty.
 */
Array.prototype.MoveDown = function (_i) {
	let l = this.length, old;
	if (l == 0) return -1;
	if (_i == 0) return 0;
	old = this[_i - 1];
	this[_i - 1] = this[_i];
	this[_i] = old;
	return _i - 1;
}

/** Moves the element at the given index to the end of this array.
 * @param {number} _i    The index of the element to move.
 * @return {number}    The new index of the element, or -1 if the array is empty.
 */
Array.prototype.MoveEnd = function (_i) {
	let l = this.length, old;
	if (l == 0) return -1;
	if (_i == l - 1) return l - 1;
	old = this[_i];
	this.splice(_i, 1);
	this.push(old);
	return l - 1;
}

/** Moves the element at the given index to the beginning of this array.
 * @param {number} _i    The index of the element to move.
 * @return {number}    The new index of the element (0), or -1 if the array is empty.
 */
Array.prototype.MoveBegin = function (_i) {
	let l = this.length, old;
	if (l == 0) return -1;
	if (_i == 0) return 0;
	old = this[_i];
	this.splice(_i, 1);
	this.unshift(old);
	return 0;
}

/** Inserts a value at the given index of this array.
 * @param {number} _at    The index to insert at.
 * @param {*} _v    The value to insert.
 */
Array.prototype.InsertAt = function (_at, _v) {
	this.splice(_at, 0, _v);
}

/** Converts all elements of this array to integers in place.
 * @return {array}    This array with all elements converted to integers.
 */
Array.prototype.ToInt = function () {
	let l = this.length, i;
	for (i = 0; i < l; i++) this[i] = this[i] | 0;
	return this;
}

/** Returns the first element of this array.
 * @return {*}    The first element, or null if the array is empty.
 */
Array.prototype.First = function () {
	if (this.length == 0) {
		return null;
	} else {
		return this[0];
	}
}

/** Joins all non-empty elements of this array to a string using the given separator.
 * @param {string} _clue    The separator string.
 * @return {string}    The joined string without empty elements.
 */
Array.prototype.JoinWithoutEmpty = function (_clue) {
	let r = [], i, l = this.length;
	for (i = 0; i < l; i++) if (this[i] != "") r.push(this[i]);
	return r.join(_clue);
}

/** Uint8Array extensions.
 * @class Uint8Array
 */

/**
 * Extension to convert Uint8Array to Base64.
 * @returns {string} Base64 string
 */
Uint8Array.prototype.ToBase64 = function () {
	const CHUNK_SZ = 0x8000; // 32KB chunks to avoid a stack overflow
	const chunks = [];
	for (let i = 0; i < this.length; i += CHUNK_SZ) {
		chunks.push(String.fromCharCode.apply(null, this.subarray(i, i + CHUNK_SZ)));
	}
	return btoa(chunks.join(""));
}
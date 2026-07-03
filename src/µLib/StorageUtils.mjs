// ===========================================
// StorageUtils.js
// © 1996-2026 Meinolf Amekudzi
// (published under MIT license)
// ===========================================


/**
 * General Storage prototype extensions.
 * @module StorageUtils
 */

/** General Storage object extensions.
 * Usable for window.localStorage and window.sessionStorage
 * @class Storage
 */

import './NumberUtils.mjs';
import './JSONUtils.mjs';
import Users from './Users.mjs';

/** Storage level constant: key is scoped to the application only (0). */
Storage.LEVEL_APP = 0;
/** Storage level constant: key is scoped to the application and the current user (1). */
Storage.LEVEL_APP_USER = 1;
/** Storage level constant: key is scoped to the application and the client (2). */
Storage.LEVEL_APP_CLIENT = 2;
/** Storage level constant: key is scoped to the application, the client and the current user (3). */
Storage.LEVEL_APP_CLIENT_USER = 3;
/** Whether the user gave privacy consent to use the persistent storage. */
Storage.privatyConsent = true;
/** Whether the user gave privacy consent to use the session storage. */
Storage.privatySessionConsent = true;

/** Builds the full storage key for a given key name and storage level.
 * @param {string} _key    The key name.
 * @param {number} _level    The storage level, one of the Storage.LEVEL_* constants.
 * @returns {string}    The full storage key including application, client and/or user scope.
 */
Storage.prototype.LevelKey = function (_key, _level) {
	let key = Config.APPID;
	switch (_level) {
		case Storage.LEVEL_APP:
			key += "/" + _key;
			break;
		case Storage.LEVEL_APP_USER:
			key += "/" + Users.curUser.usersId + "/" + _key;
			break;
		case Storage.LEVEL_APP_CLIENT:
			key += "/" + Config.CLIENT + "/" + _key;
			break;
		case Storage.LEVEL_APP_CLIENT_USER:
			key += "/" + Config.CLIENT + "/" + Users.curUser.usersId + "/" + _key;
			break;
	}
	return key;
}

/** Sets a value in Storage, type-prefixed and optionally compressed.
 * @param {string} _name    The key name to store the value under.
 * @param {number|boolean|string|object|array} _obj    The value to store.
 * @param {number} [_level=Storage.LEVEL_APP_CLIENT]    The storage level, one of the Storage.LEVEL_* constants.
 * @param {*} [_default=null]    The default value; the value is not stored if it equals this default.
 * @param {boolean} [_compressed=false]    Whether the value has to be compressed.
 * @returns {boolean}    True, if successfully saved to storage, false, if it is already the default value or consent is missing.
 */
Storage.prototype.Set = function (_name, _obj, _level = Storage.LEVEL_APP_CLIENT, _default = null, _compressed = false) {
	if (_obj == null || _obj === _default) return false;
	let key = this.LevelKey(_name, _level), err, json, compressed;
	if (!Storage.privatyConsent) return false;
	try {
		//this.removeItem(key);
		switch (typeof (_obj)) {
			case "number":
				this.setItem(key, ((_obj.IsFloat()) ? "f:" : "i:") + _obj);
				break;
			case "boolean":
				this.setItem(key, "b:" + (_obj ? 1 : 0));
				break;
			case "string":
				if (_compressed) {
					json = JSON.stringify(_obj);
					compressed = json.compress();
					if (json.byteLength() < compressed.byteLength()) {
						this.setItem(key, "s:" + _obj);
					} else {
						this.setItem(key, "S:" + _obj.compress());
					}
				} else {
					this.setItem(key, "s:" + _obj);
				}
				break;
			case "object":
				if (Array.isArray(_obj)) {
					if (_compressed) {
						json = JSON.stringify(_obj);
						compressed = json.compress();
						if (json.byteLength() < compressed.byteLength()) {
							this.setItem(key, "a:" + JSON.stringify(_obj));
						} else {
							this.setItem(key, "A:" + JSON.stringify(_obj).compress());
						}
					} else {
						this.setItem(key, "a:" + JSON.stringify(_obj));
					}
				} else {
					if (_compressed) {
						json = JSON.stringify(_obj);
						compressed = json.compress();
						if (json.byteLength() < compressed.byteLength()) {
							this.setItem(key, "o:" + JSON.stringify(_obj));
						} else {
							this.setItem(key, "O:" + JSON.stringify(_obj).compress());
						}
					} else {
						this.setItem(key, "o:" + JSON.stringify(_obj));
					}
				}
				break;
		}
	} catch (err) {
	}
	return true;
}

/** Returns a value from Storage, decoded by its type prefix and decompressed if needed.
 * @param {string} _name    The key name of the value to read.
 * @param {*} _default    The default value to return if the key does not exist or consent is missing.
 * @param {number} [_level=Storage.LEVEL_APP_CLIENT]    The storage level, one of the Storage.LEVEL_* constants.
 * @returns {*}    The value from Storage which is saved under the given name, or the default value.
 */
Storage.prototype.Get = function (_name, _default, _level = Storage.LEVEL_APP_CLIENT) {
	let key = this.LevelKey(_name, _level), value = this.getItem(key), err;
	if (_default === undefined) _default = null;
	if (!Storage.privatyConsent) return _default;
	if (value == null) return _default;
	switch (value.substr(0, 2)) {
		case "i:":
			value = parseInt(value.substr(2), 10);
			break;
		case "f:":
			value = parseFloat(value.substr(2));
			break;
		case "n:":
			value = parseFloat(value.substr(2));
			break;
		case "b:":
			value = value.substr(2, 1) == "1";
			break;
		case "s:":
			value = value.substr(2);
			break;
		case "S:":
			value = value.substr(2).deCompress();
			if (value == null) return _default;
			break;
		case "a:":
			value = value.substr(2);
			try {
				value = JSON.parse(value);
			} catch (err) {
			}
			if (value == null) return _default;
			break;
		case "A:":
			value = value.substr(2).deCompress();
			try {
				value = JSON.parse(value);
			} catch (err) {
			}
			if (value == null) return _default;
			break;
		case "o:":
			value = value.substr(2);
			try {
				value = JSON.parse(value);
			} catch (err) {
			}
			if (value == null) return _default;
			break;
		case "O:":
			value = value.substr(2).deCompress();
			try {
				value = JSON.parse(value);
			} catch (err) {
			}
			if (value == null) return _default;
			break;
	}
	return value;
}

/** Removes a value from Storage.
 * @param {string} _name    The key name of the value to remove.
 * @returns {boolean|undefined}    False, if consent is missing, otherwise undefined.
 */
Storage.prototype.Remove = function (_name) {
	if (!Storage.privatyConsent) return false;
	this.removeItem(Config.APPID + "/" + Config.INSTANCE + "/" + Config.CLIENT + "/" + _name);
}

/** Checks whether a value exists in Storage under the given name.
 * @param {string} _name    The key name to check.
 * @returns {boolean}    True, if a value exists under the given name.
 */
Storage.prototype.exists = function (_name) {
	let key = Config.APPID + "/" + Config.INSTANCE + "/" + Config.CLIENT + "/" + _name,
		value = this.getItem(key);
	if (!Storage.privatyConsent) return false;
	return value != null;
}

/** Returns all key names in Storage which start with the given prefix (application scope stripped).
 * @param {string} _prefix    The key name prefix to search for.
 * @returns {array}    An array of matching key names without the scope prefix.
 */
Storage.prototype.keys = function (_prefix) {
	if (!Storage.privatyConsent) return [];
	let i, l = this.length, key,
		a = (Config.APPID + "/" + Config.INSTANCE + "/" + Config.CLIENT + "/" + _prefix),
		al = a.length,
		ret = [];
	for (i = 0; i < l; i++) {
		key = this.key(i);
		if (key.substr(0, al) == a) ret.push(key.substr(al));
	}
	return ret;
}

/** Removes all values of the current application scope from Storage.
 * @returns {boolean|undefined}    False, if consent is missing, otherwise undefined.
 */
Storage.prototype.clear = function () {
	if (!Storage.privatyConsent) return false;
	let i, l = this.length, key, a = (Config.APPID + "/" + Config.INSTANCE + "/" + Config.CLIENT + "/"),
		al = a.length,
		toremove = [];
	for (i = 0; i < l; i++) {
		key = this.key(i);
		if (key.substr(0, al) == a) toremove.push(key);
	}
	l = toremove.length;
	for (i = 0; i < l; i++) this.removeItem(toremove[i]);
}

/** Returns the approximate size of the Storage content in bytes.
 * @returns {number}    The approximate storage size in bytes, or 0 if consent is missing.
 */
Storage.prototype.size = function () {
	if (!Storage.privatyConsent) return 0;
	let allStrings = "";
	for (let key in window.this) if (window.this.hasOwnProperty(key)) allStrings += window.this[key];
	return allStrings ? 3 + ((allStrings.length * 16) / (8 * 1024)) * 1024 : 0;
}



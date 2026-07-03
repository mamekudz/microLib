// ===========================================
// Users.js
// © 1996-2026 Meinolf Amekudzi
// (published under MIT license)
// ===========================================

/** Module to manage users of an application.
 * @module Users
 */

import User from './User.mjs';
import RESTX from "./RESTX.mjs";
import WebUtils from "./WebUtils.mjs";

/** Class to manage users.
 *
 * @class Users
 */
export default class Users {
	/** Client configuration: Whether the system uses an AD login. (Note: This also has to be set up in server configuration.)*/
	static CONF_WINDOWS_AUTHENTICATION = true;
	/** Client configuration: Whether users should be able to delete their account. (Note: This also has to be set up in server configuration.) */
	static CONF_USER_DELETION_POSSIBLE = false;
	/** Client configuration: Whether users should be able to anonymize their account. (Note: This also has to be set up in server configuration.)*/
	static CONF_USER_ANONYMIZATION_POSSIBLE = false;
	/** Client configuration: Whether admins should be able to delete user accounts. (Note: This also has to be set up in server configuration.)*/
	static CONF_ADMIN_DELETION_POSSIBLE = false;
	/** Client configuration: Whether admins should be able to anonymize user accounts. (Note: This also has to be set up in server configuration.)*/
	static CONF_ADMIN_ANONYMIZATION_POSSIBLE = false;
	/** Client configuration: Whether a user can log out. */
	static CONF_USER_LOGOUT_POSSIBLE = true;
	/** Client configuration: Whether an automatic log out have to do on browser tabulator close. */
	static CONF_USER_AUTO_LOGOUT = true;
	/** Client configuration: Whether to use signature feature. */
	static CONF_USER_FEATURE_AVATAR = false;
	/** Client configuration: Whether to use signature feature. */
	static CONF_USER_FEATURE_SIGNATURE = false;
	
	/** Registered event callbacks called when the current user changes, key is the registration id. */
	static onChangeUserEvents = {};
	/** Info objects passed to the registered user change callbacks, key is the registration id. */
	static onChangeUserEventsObjects = {};
	
	/** STATIC: The device token if user is using a mobile device.
	 * @static
	 * @type {string}
	 */
	static curDeviceToken = "";
	
	/** STATIC: The current user.
	 * @static
	 * @type {User}
	 */
	static curUser = null;
	
	/** STATIC: All users who are currently online.
	 * @static
	 * @type {array}
	 */
	static onlineUsers = [];
	
	/** STATIC: The user data cache, holds all data received from server while application is running, key is the users id, value is an object of class user.
	 * @static
	 * @type  {object}
	 */
	static usersCache = {};
	
	/** STATIC: Currently running user data requests, key is the users id, value is an array of deferred promise objects waiting for the result.
	 * @static
	 * @type {object}
	 */
	static runningUserRequests = {};
	
	/** STATIC: Calls the web service to get a list of all users, which are currently online.
	 * @method getOnlineUsers
	 * @static
	 */
	static getOnlineUsers = function () {
	}
	
	/** STATIC: Gets data of a user.
	 * @method getUser
	 * @static
	 * @param {number} [_usersId=-1]           The users id to get data. Special usersIds: -1: Unknown, 0: system admin user
	 * @param {boolean} [_forceReload=false]   true, if user data should be reloaded from server.
	 * @param {object} [_vueComponent=null]    Optional Vue component passed to the RESTX request to show modal error alerts.
	 * @return {Promise}   A promise resolved with the user object or rejected on errors.
	 */
	static getUser = function (_usersId = -1, _forceReload = false, _vueComponent= null) {
		if (_forceReload && _usersId <= 0) _forceReload = false;
		if (_usersId <= 0) {
			return new Promise(function (_resolve, _reject) {
				let user = new User();
				_resolve(user);
			});
		} else if (Users.usersCache.hasOwnProperty(_usersId) && !_forceReload) {
			return new Promise(function (_resolve, _reject) {
				_resolve(Users.usersCache[_usersId]);
			});
		} else if (Users.runningUserRequests.hasOwnProperty(_usersId)) {
			let deferredObj = {};
			let promise = new Promise((_resolve, _reject) => {
				deferredObj.resolve = _resolve;
				deferredObj.reject = _reject;
			});
			deferredObj.promise = promise;
			
			Users.runningUserRequests[_usersId].push(deferredObj);
			return promise;
		} else {
			let rest = new RESTX(_vueComponent);
			Users.runningUserRequests[_usersId] = [];
			return rest.promiseCall("getUsers", {
				usersId: _usersId
			}).then(function (_res) {
				if (_res.output.user.isDeleted) _res.output.user.nickName = 'Deleted User<context="Nickname of a deleted user"/>'.I18xTrans();
				if (_res.output.user.isAnonymized) _res.output.user.nickName = 'Anonymous<context="Nickname of an anonymized user"/>'.I18xTrans();
				Users.usersCache[_usersId] = new User(_res.output.user);
				if (Users.runningUserRequests.hasOwnProperty(_usersId)) {
					for (let u = 0; u < Users.runningUserRequests[_usersId].length; u++) {
						Users.runningUserRequests[_usersId][u].resolve(Users.usersCache[_usersId]);
					}
					delete Users.runningUserRequests[_usersId];
				}
				return _res.output.user;
			}, function (_res) {
				Users.usersCache[_usersId] = new User(-1);
				//Users.usersCache[_usersId].nickName = 'Not Logged<context="Nickname of a not logged user"/>'.I18xTrans();
				Users.usersCache[_usersId].nickName = 'Error by Loading<context="Nickname of a not logged user"/>'.I18xTrans();
				if (Users.runningUserRequests.hasOwnProperty(_usersId)) {
					for (let u = 0; u < Users.runningUserRequests[_usersId].length; u++) {
						Users.runningUserRequests[_usersId][u].reject(Users.usersCache[_usersId]);
					}
					delete Users.runningUserRequests[_usersId];
				}
				this.reject();
			});
		}
	}
	
	/** STATIC: Gets data of multiple users and updates the user data cache.
	 * @method getUsers
	 * @static
	 * @param {array} [_usersIds=[]]           Array of users ids to get data for.
	 * @param {object} [_opts={}]              Optional filter options (excludeBlocked, excludeDeleted, excludeAnonymized, onlyOnlineUsers, roles, excludeRoles).
	 * @param {boolean} [_forceReload=false]   true, if user data should be reloaded from server.
	 * @return {Promise}   A promise resolved with the user data cache or rejected on errors.
	 */
	static getUsers = function (_usersIds = [], _opts = {}, _forceReload = false) {
		if (_forceReload && _userId <= 0) _forceReload = false;
		let serverRequestUserIds = [];
		for (let i = 0; i < _usersIds.length; i++) {
			let usersId = _usersIds[i];
			if (Users.usersCache.hasOwnProperty(usersId) && !_forceReload) serverRequestUserIds.push(usersId);
		}
		if (serverRequestUserIds.length == 0) {
			return new Promise(function (_resolve, _reject) {
				_resolve(Users.usersCache);
			})
		} else {
			let rest = new RESTX(this);
			return rest.promiseCall("getUsers", {
				usersIds: serverRequestUserIds,
				excludeBlocked: _opts.hasOwnProperty('excludeBlocked') ? _opts.excludeBlocked : false,
				excludeDeleted: _opts.hasOwnProperty('excludeDeleted') ? _opts.excludeDeleted : false,
				excludeAnonymized: _opts.hasOwnProperty('excludeAnonymized') ? _opts.excludeAnonymized : false,
				onlyOnlineUsers: _opts.hasOwnProperty('onlyOnlineUsers') ? _opts.onlyOnlineUsers : false,
				roles: _opts.hasOwnProperty('roles') ? _opts.roles : null,
				excludeRoles: _opts.hasOwnProperty('excludeRoles') ? _opts.excludeRoles : null
			})
				.then(function (_res) {
					for (let u in _res.output.users) {
						let us = _res.output.users[u];
						Users.usersCache[_res.output.users[u.usersId]] = new User(_res.output.users[u]);
					}
					return Users.usersCache;
				}, function (_res) {
					this.reject();
				});
		}
	}
	
	/** STATIC: Reloads all currently online users from server and updates the isLoggedIn state in the user data cache.
	 * @method updateUserOnlineCache
	 * @static
	 * @param {object} _vueComponent   Optional Vue component passed to the RESTX request, its fetchRests set tracks the running request.
	 * @return {Promise}   A promise resolved with the user data cache.
	 */
	static updateUserOnlineCache = function (_vueComponent) {
		let rest = new RESTX(_vueComponent);
		
		if (_vueComponent && _vueComponent.fetchRests) {
			_vueComponent.fetchRests.add(rest);
		}
		
		return rest.promiseCall("getUsers", {onlyOnlineUsers: true})
			.then(function (_res) {
				for (let u in Users.usersCache) {
					Users.usersCache[u].isLoggedIn = false;
				}
				
				for (let u in _res.output.users) {
					let us = _res.output.users[u];
					let id = us.usersId;
					Users.usersCache[id] = new User(us);
					us = Users.usersCache[id];
					us.isLoggedIn = true;
				}
				return Users.usersCache;
			}, function (_res) {
				const aborted = (res && (res.wasAbort || res.status === 0)) || rest.wasAbortedBySystem;
				if (aborted) return Users.usersCache;
				this.reject();
			}).finally(function () {
				if (_vueComponent && _vueComponent.fetchRests) {
					_vueComponent.fetchRests.delete(rest);
				}
			});
	}
	
	/** STATIC: Saves changed user data to server.
	 * @method updateUser
	 * @static
	 * @param {User} _user   The user object to update.
	 * @return {Promise}   A promise resolved with the updated user object or rejected on errors.
	 */
	static updateUser = function (_user) {
		let rest = new RESTX(this);
		return rest.promiseCall("updateUser", {user: _user})
			.then(function (_res) {
				let user = _res.output.user;
				if (_user.usersId == Users.curUser.usersId) Users.curUser = user;
				Users.usersCache[_usersId] = user;
				return user;
			}, function (_res) {
				this.reject();
			});
		
	}
	
	/** Get a HTML representation of the users data. (Not implemented yet.)
	 * @method toHTML
	 * @instance
	 * @param {object} [_opt={}]   Optional display options.
	 * @return {void}
	 */
	toHTML(_opt = {}) {

	}

	/** STATIC: Logs in a user. (Not implemented yet.)
	 * @method logIn
	 * @static
	 * @return {void}
	 */
	static logIn = function () {
	}

	/** STATIC: Disposes the current user by replacing it with an empty (not logged) user and triggers the user change callbacks.
	 * @method disposeCurrentUser
	 * @static
	 * @return {void}
	 */
	static disposeCurrentUser = function () {
		Users.curUser = new User();
		Users.onUserChanged();
	}
	
	/** STATIC: Registers a callback which is called when the current user changes.
	 * @method registerUserChanged
	 * @static
	 * @param {string} _id         Unique id of the registration.
	 * @param {function} _event    Callback function called on user changes.
	 * @param {object} [_info={}]  Info object passed to the callback.
	 * @return {void}
	 */
	static registerUserChanged(_id, _event, _info = {}) {
		Users.onChangeUserEvents[_id] = _event;
		Users.onChangeUserEventsObjects[_id] = _info;
	}
	
	/** STATIC: Unregisters a user change callback.
	 * @method unRegisterUserChanged
	 * @static
	 * @param {string} _id        Unique id of the registration to remove.
	 * @param {function} _event   Unused placeholder parameter.
	 * @return {void}
	 */
	static unRegisterUserChanged(_id, _event) {
		if (Users.onChangeUserEvents.hasOwnProperty(_id)) {
			delete Users.onChangeUserEventsObjects[_id]
			delete Users.onChangeUserEvents[_id];
		}
	}
	
	/** STATIC: Calls all registered user change callbacks with their registered info objects.
	 * @method onUserChanged
	 * @static
	 * @return {void}
	 */
	static onUserChanged() {
		for (let id in Users.onChangeUserEvents) {
			Users.onChangeUserEvents[id](Users.onChangeUserEventsObjects[id]);
		}
	}
	
	/** STATIC: Sets the current user from user data, stores it in the local storage and triggers the user change callbacks on changes.
	 * @method setCurUser
	 * @static
	 * @param {object} _userData   The user data (JSON object) of the new current user.
	 * @return {void}
	 */
	static setCurUser(_userData) {
		let oldMd5 = Users.curUser.md5;
		Users.curUser = new User(_userData);
		if (!WebUtils.GetParameterExists("adLogin")) localStorage.Set("curUser", Users.curUser);
		if (Users.curUser.md5 != oldMd5) Users.onUserChanged();
	}
	
	/** STATIC: Removes the current user by replacing it with an empty (not logged) user and removes it from the local storage.
	 * @method removeCurUser
	 * @static
	 * @param {boolean} [_withUserChangeEvent=false]   true, to trigger the user change callbacks.
	 * @return {void}
	 */
	static removeCurUser(_withUserChangeEvent=false) {
		Users.curUser = new User();
		localStorage.Remove("curUser");
		if (_withUserChangeEvent) Users.onUserChanged();
	}
	
	/** STATIC: Initializes the Users class: restores the current user from the local storage and prefills the user data cache with the system users.
	 * @method init
	 * @static
	 * @return {void}
	 */
	static init = function () {
		if (WebUtils.GetParameterExists("adLogin")) localStorage.Remove("curUser");
		if (localStorage.exists("curUser")) {
			Users.curUser = new User(localStorage.Get("curUser"));
		} else {
			Users.curUser = new User();
		}
		Users.usersCache = {"-1": new User(-1), "0": new User(0)};
		/*-- @<BUILD_NEVER_AT_RELEASES:Production,Test --*/
		Users.curUser.roles = User.ROLES_ALL_AUTH;
		Users.curUser.nickName = "DEV";
		Users.curUser.firstNames = "Dev";
		Users.curUser.lastName = "Eloper";
		Users.curUser.jobTitle = "Developer";
		/*-- @>BUILD_NEVER_AT_RELEASES --*/
	}
}

window.Users = Users;
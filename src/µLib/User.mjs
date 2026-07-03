// ===========================================
// User.js
// © 1996-2022 Dongleware Verlags GmbH
// © 1996-2026 Meinolf Amekudzi
// (published under MIT license)
// ===========================================

/** Module to manage a single users data.
 * @module User
 */

import './i18x.mjs';

/** Class which represents a single user.
 * @class User
 */
export default class User {
	/** @constant ROLEBIT_NOTLOGGED {number} Bit number of the role for not logged users (guest). */
	static ROLEBIT_NOTLOGGED = 0;
	/** @constant ROLEBIT_STANDARD {number} Bit number of the role for standard identified users. */
	static ROLEBIT_STANDARD = 2;
	/** @constant ROLEBIT_PHOTOGRAPHER {number} Bit number of the photographer role. */
	static ROLEBIT_PHOTOGRAPHER = 3;
	/** @constant ROLEBIT_MEASUREMENT_DATA_LOGGER {number} Bit number of the measurement data logger role. */
	static ROLEBIT_MEASUREMENT_DATA_LOGGER = 4;
	/** @constant ROLEBIT_PHOTOEDITOR {number} Bit number of the photo editor role. */
	static ROLEBIT_PHOTOEDITOR = 5;
	/** @constant ROLEBIT_QUALITYMANAGER {number} Bit number of the quality manager role. */
	static ROLEBIT_QUALITYMANAGER = 6;
	/** @constant ROLEBIT_PRODUCTS_INCOMING_CONTROLLER {number} Bit number of the incoming controller role (products, data...). */
	static ROLEBIT_PRODUCTS_INCOMING_CONTROLLER = 7;
	/** @constant ROLEBIT_PRODUCTS_OUTGOING_CONTROLLER {number} Bit number of the outgoing controller role (products, data...). */
	static ROLEBIT_PRODUCTS_OUTGOING_CONTROLLER = 8;
	/** @constant ROLEBIT_LOGISTIC_EXPORTER {number} Bit number of the logistic exporter role. */
	static ROLEBIT_LOGISTIC_EXPORTER = 9;
	/** @constant ROLEBIT_EXECUTIVE_EXPORTER {number} Bit number of the executive exporter role. */
	static ROLEBIT_EXECUTIVE_EXPORTER = 10;
	/** @constant ROLEBIT_HEALTH_CARE_PROFESSIONAL {number} Bit number of the health care professional role. */
	static ROLEBIT_HEALTH_CARE_PROFESSIONAL = 1;
	/** @constant ROLEBIT_PHARMACIST {number} Bit number of the pharmacist role. */
	static ROLEBIT_PHARMACIST = 11;
	/** @constant ROLEBIT_SUPERPHARMACIST {number} Bit number of the super pharmacist role. */
	static ROLEBIT_SUPERPHARMACIST = 14;
	/** @constant ROLEBIT_MEDIC {number} Bit number of the medic role. */
	static ROLEBIT_MEDIC = 13;
	/** @constant ROLEBIT_SUPERMEDIC {number} Bit number of the super medic role. */
	static ROLEBIT_SUPERMEDIC = 15;
	/** @constant ROLEBIT_PROJECT_MANAGER {number} Bit number of the project manager role. */
	static ROLEBIT_PROJECT_MANAGER = 12;
	/** @constant ROLEBIT_LICENSE_MANAGER {number} Bit number of the license manager role. */
	static ROLEBIT_LICENSE_MANAGER = 16;
	/** @constant ROLEBIT_TRANSLATOR {number} Bit number of the translator role. */
	static ROLEBIT_TRANSLATOR = 17;
	/** @constant ROLEBIT_SUPERTRANSLATOR {number} Bit number of the super translator role. */
	static ROLEBIT_SUPERTRANSLATOR = 19;
	/** @constant ROLEBIT_DEVELOPER {number} Bit number of the developer role. */
	static ROLEBIT_DEVELOPER = 23;
	/** @constant ROLEBIT_SUPERDEVELOPER {number} Bit number of the super developer role. */
	static ROLEBIT_SUPERDEVELOPER = 26;
	/** @constant ROLEBIT_TESTER {number} Bit number of the tester role. */
	static ROLEBIT_TESTER = 27;
	/** @constant ROLEBIT_SUPERTESTER {number} Bit number of the super tester role. */
	static ROLEBIT_SUPERTESTER = 28;
	/** @constant ROLEBIT_ADMIN {number} Bit number of the administrator role. */
	static ROLEBIT_ADMIN = 29;
	/** @constant ROLEBIT_SUPERADMIN {number} Bit number of the super administrator role. */
	static ROLEBIT_SUPERADMIN = 30;

	/** @constant ROLEBIT_UNUSED_2 {number} Bit number of an unused role, reserved for future use. */
	static ROLEBIT_UNUSED_2 = 18;
	/** @constant ROLEBIT_UNUSED_3 {number} Bit number of an unused role, reserved for future use. */
	static ROLEBIT_UNUSED_3 = 20;
	/** @constant ROLEBIT_UNUSED_4 {number} Bit number of an unused role, reserved for future use. */
	static ROLEBIT_UNUSED_4 = 21;
	/** @constant ROLEBIT_UNUSED_5 {number} Bit number of an unused role, reserved for future use. */
	static ROLEBIT_UNUSED_5 = 22;
	/** @constant ROLEBIT_UNUSED_6 {number} Bit number of an unused role, reserved for future use. */
	static ROLEBIT_UNUSED_6 = 24;
	/** @constant ROLEBIT_UNUSED_7 {number} Bit number of an unused role, reserved for future use. */
	static ROLEBIT_UNUSED_7 = 25;

	/** @constant ROLE_UNUSED_2 {number} Unused role, reserved for future use. */
	static ROLE_UNUSED_2 = 1 << User.ROLEBIT_UNUSED_2;
	/** @constant ROLE_UNUSED_3 {number} Unused role, reserved for future use. */
	static ROLE_UNUSED_3 = 1 << User.ROLEBIT_UNUSED_3;
	/** @constant ROLE_UNUSED_4 {number} Unused role, reserved for future use. */
	static ROLE_UNUSED_4 = 1 << User.ROLEBIT_UNUSED_4;
	/** @constant ROLE_UNUSED_5 {number} Unused role, reserved for future use. */
	static ROLE_UNUSED_5 = 1 << User.ROLEBIT_UNUSED_5;
	/** @constant ROLE_UNUSED_6 {number} Unused role, reserved for future use. */
	static ROLE_UNUSED_6 = 1 << User.ROLEBIT_UNUSED_6;
	/** @constant ROLE_UNUSED_7 {number} Unused role, reserved for future use. */
	static ROLE_UNUSED_7 = 1 << User.ROLEBIT_UNUSED_7;
	
	/** @constant ROLE_NOTLOGGED {number} Role for not logged users (guest). */
	static ROLE_NOTLOGGED = 1 << User.ROLEBIT_NOTLOGGED;
	/** @constant ROLE_STANDARD {number} Role for standard identified users without any special rights. */
	static ROLE_STANDARD = 1 << User.ROLEBIT_STANDARD;
	/** @constant ROLE_PHOTOGRAPHER {number} Role for users with photographer rights. */
	static ROLE_PHOTOGRAPHER = 1 << User.ROLEBIT_PHOTOGRAPHER;
	/** @constant ROLE_MEASUREMENT_DATA_LOGGER {number} Role for users with data logging rights. */
	static ROLE_MEASUREMENT_DATA_LOGGER = 1 << User.ROLEBIT_MEASUREMENT_DATA_LOGGER;
	/** @constant ROLE_PHOTOEDITOR {number} Role for users with photo editor rights. */
	static ROLE_PHOTOEDITOR = 1 << User.ROLEBIT_PHOTOEDITOR;
	/** @constant ROLE_QUALITYMANAGER {number} Role for users with quality checking rights. */
	static ROLE_QUALITYMANAGER = 1 << User.ROLEBIT_QUALITYMANAGER;
	/** @constant ROLE_PRODUCTS_INCOMING_CONTROLLER {number} Role for incoming controller rights (products, data...). */
	static ROLE_PRODUCTS_INCOMING_CONTROLLER = 1 << User.ROLEBIT_PRODUCTS_INCOMING_CONTROLLER;
	/** @constant ROLE_PRODUCTS_OUTGOING_CONTROLLER {number} Role for outgoing controller rights (products, data...). */
	static ROLE_PRODUCTS_OUTGOING_CONTROLLER = 1 << User.ROLEBIT_PRODUCTS_OUTGOING_CONTROLLER;
	/** @constant ROLE_LOGISTIC_EXPORTER {number} Role for logistic exporter rights (products, data...). */
	static ROLE_LOGISTIC_EXPORTER = 1 << User.ROLEBIT_LOGISTIC_EXPORTER;
	/** @constant ROLE_EXECUTIVE_EXPORTER {number} Role for executive exporter rights (products, data...). */
	static ROLE_EXECUTIVE_EXPORTER = 1 << User.ROLEBIT_EXECUTIVE_EXPORTER;
	/** @constant ROLE_HEALTH_CARE_PROFESSIONAL {number} Role for health care professional users(german: "medizinisches Fachpersonal"). */
	static ROLE_HEALTH_CARE_PROFESSIONAL = 1 << User.ROLEBIT_HEALTH_CARE_PROFESSIONAL;
	/** @constant ROLE_PHARMACIST {number} Role for pharmacist users(german: "Apotheker"). */
	static ROLE_PHARMACIST = 1 << User.ROLEBIT_PHARMACIST;
	/** @constant ROLE_SUPERPHARMACIST {number} Role for super pharmacist users (german: "leitender Apotheker"). */
	static ROLE_SUPERPHARMACIST = 1 << User.ROLEBIT_SUPERPHARMACIST;
	/** @constant ROLE_MEDIC {number} Role for medic users. */
	static ROLE_MEDIC = 1 << User.ROLEBIT_MEDIC;
	/** @constant ROLE_SUPERMEDIC {number} Role super medic users. */
	static ROLE_SUPERMEDIC = 1 << User.ROLEBIT_SUPERMEDIC;
	/** @constant ROLE_PROJECT_MANAGER {number} Role for project manager users. */
	static ROLE_PROJECT_MANAGER = 1 << User.ROLEBIT_PROJECT_MANAGER;
	/** @constant ROLE_LICENSE_MANAGER {number} Role for license manager users. */
	static ROLE_LICENSE_MANAGER = 1 << User.ROLEBIT_LICENSE_MANAGER;
	/** @constant ROLE_TRANSLATOR {number} Role for translater users. */
	static ROLE_TRANSLATOR = 1 << User.ROLEBIT_TRANSLATOR;
	/** @constant ROLE_SUPERTRANSLATOR {number} Role for super translator users. */
	static ROLE_SUPERTRANSLATOR = 1 << User.ROLEBIT_SUPERTRANSLATOR;
	/** @constant ROLE_DEVELOPER {number} Role for developer users. */
	static ROLE_DEVELOPER = 1 << User.ROLEBIT_DEVELOPER;
	/** @constant ROLE_SUPERDEVELOPER {number} Role for super developer users. */
	static ROLE_SUPERDEVELOPER = 1 << User.ROLEBIT_SUPERDEVELOPER;
	/** @constant ROLE_TESTER {number} Role for test users. */
	static ROLE_TESTER = 1 << User.ROLEBIT_TESTER;
	/** @constant ROLE_SUPERTESTER {number} Role for super test users. */
	static ROLE_SUPERTESTER = 1 << User.ROLEBIT_SUPERTESTER;
	/** @constant ROLE_ADMIN {number} Role for administration users. */
	static ROLE_ADMIN = 1 << User.ROLEBIT_ADMIN;
	/** @constant ROLE_SUPERADMIN {number} Role for super administration users. */
	static ROLE_SUPERADMIN = 1 << User.ROLEBIT_SUPERADMIN;
	
	
	/** @constant ROLES_ALL_AUTH {number} All roles of logged (authenticated) users. */
	static ROLES_ALL_AUTH =
		User.ROLE_STANDARD |
		User.ROLE_PHOTOGRAPHER |
		User.ROLE_MEASUREMENT_DATA_LOGGER |
		User.ROLE_PHOTOEDITOR |
		User.ROLE_QUALITYMANAGER |
		User.ROLE_PRODUCTS_INCOMING_CONTROLLER |
		User.ROLE_PRODUCTS_OUTGOING_CONTROLLER |
		User.ROLE_LOGISTIC_EXPORTER |
		User.ROLE_EXECUTIVE_EXPORTER |
		User.ROLE_HEALTH_CARE_PROFESSIONAL |
		User.ROLE_PHARMACIST |
		User.ROLE_SUPERPHARMACIST |
		User.ROLE_MEDIC |
		User.ROLE_SUPERMEDIC |
		User.ROLE_PROJECT_MANAGER |
		User.ROLE_LICENSE_MANAGER |
		User.ROLE_TRANSLATOR |
		User.ROLE_SUPERTRANSLATOR |
		User.ROLE_DEVELOPER |
		User.ROLE_SUPERDEVELOPER |
		User.ROLE_TESTER |
		User.ROLE_SUPERTESTER |
		User.ROLE_ADMIN |
		User.ROLE_SUPERADMIN;
	/** @constant ROLES_NONE {number} No roles. */
	static ROLES_NONE = 0;
	/** @constant ROLES_ALL_PROD {number} All roles of logged production users (without User.ROLE_NOTLOGGED and User.ROLE_STANDARD). */
	static ROLES_ALL_PROD = User.ROLES_ALL_AUTH & ~User.ROLE_STANDARD;
	/** @constant ROLES_ALL_TRANSLATORS {number} All translator roles. */
	static ROLES_ALL_TRANSLATORS = User.ROLE_TRANSLATOR | User.ROLE_SUPERTRANSLATOR;
	/** @constant ROLES_ALL_TESTERS {number} All tester roles. */
	static ROLES_ALL_TESTERS = User.ROLE_TESTER | User.ROLE_SUPERTESTER;
	/** @constant ROLES_ALL_DEVELOPERS {number} All developer roles. */
	static ROLES_ALL_DEVELOPERS = User.ROLE_DEVELOPER | User.ROLE_SUPERDEVELOPER;
	/** @constant ROLES_ALL_ADMINS {number} All administration roles. */
	static ROLES_ALL_ADMINS = User.ROLE_ADMIN | User.ROLE_SUPERADMIN;
	/** @constant ROLES_ALL {number} All roles. */
	static ROLES_ALL = User.ROLES_ALL_AUTH | User.ROLE_NOTLOGGED;
	/** @constant ROLES_ALL_TECHNICIANS {number} All technician roles (testers, developers and administrators). */
	static ROLES_ALL_TECHNICIANS = User.ROLES_ALL_TESTERS | User.ROLES_ALL_DEVELOPERS | User.ROLES_ALL_ADMINS;
	/** @constant ROLES_ALL_PHARMACIST_AND_MEDICS {number} All medic and pharmacist roles. */
	static ROLES_ALL_PHARMACIST_AND_MEDICS =
		User.ROLE_HEALTH_CARE_PROFESSIONAL |
		User.ROLE_MEDIC | User.ROLE_SUPERMEDIC |
		User.ROLE_PHARMACIST | User.ROLE_SUPERPHARMACIST;
	
	/** Localized role names, key is the role bit number, value is the registered translation string. Filled by User.init(). */
	static ROLE_NAMES = {};


	/** The constructor of the User object.
	 * @constructor
	 * @param {number|object} [_usersIdOrJsonObj=0]    A users id to create an empty user, or a JSON object with user data to copy from.
	 */
	constructor(_usersIdOrJsonObj = 0) {
		if (typeof _usersIdOrJsonObj == "object") {
			this.usersId = _usersIdOrJsonObj.usersId;
			this.creationTs = _usersIdOrJsonObj.creationTs;
			this.modificationTs = _usersIdOrJsonObj.modificationTs;
			this.lastLogInTs = _usersIdOrJsonObj.lastLogInTs;
			this.lastOnlineTs = _usersIdOrJsonObj.lastOnlineTs;
			this.lastLogInIP = _usersIdOrJsonObj.lastLogInIP;
			this.noOfLogIns = _usersIdOrJsonObj.noOfLogIns;
			this.isLoggedIn = _usersIdOrJsonObj.isLoggedIn;
			this.isConfirmed = _usersIdOrJsonObj.isConfirmed;
			this.isDeleted = _usersIdOrJsonObj.isDeleted;
			this.isAnonymized = _usersIdOrJsonObj.isAnonymized;
			this.isBlocked = _usersIdOrJsonObj.isBlocked;
			this.roles = _usersIdOrJsonObj.roles;
			this.rolesData = _usersIdOrJsonObj.rolesData;
			
			this.logInEMail = _usersIdOrJsonObj.logInEMail;
			this.eMail = _usersIdOrJsonObj.eMail;
			this.isEMailContactAllowed = _usersIdOrJsonObj.isEMailContactAllowed;
			
			this.nickName = _usersIdOrJsonObj.nickName;
			this.title = _usersIdOrJsonObj.title;
			this.firstNames = _usersIdOrJsonObj.firstNames;
			this.lastName = _usersIdOrJsonObj.lastName;
			this.jobTitle = _usersIdOrJsonObj.jobTitle;
			this.avatar = _usersIdOrJsonObj.avatar;
			this.signature = _usersIdOrJsonObj.signature;
			
			this.lid = _usersIdOrJsonObj.lid;
			this.nlid = _usersIdOrJsonObj.nlid;
			this.timezone = _usersIdOrJsonObj.timezone;
			this.md5 = User.getMD5(this);
		} else {
			/** The user's id in database.
			 * @instance
			 * @type {number}
			 */
			this.usersId = _usersIdOrJsonObj;
			/** Creation timestamp of users account.
			 * @instance
			 * @type {number}
			 */
			this.creationTs = 0;
			/** Last modification timestamp of users account.
			 * @instance
			 * @type {number}
			 */
			this.modificationTs = 0;
			/** Last login timestamp of users account.
			 * @instance
			 * @type {number}
			 */
			this.lastLogInTs = 0
			
			/** User account is logged in.
			 * @instance
			 * @type {bool}
			 */
			this.isLoggedIn = false;
			/** User account is confirmed.
			 * @instance
			 * @type {bool}
			 */
			this.isConfirmed = false;
			/** User account is deleted.
			 * @instance
			 * @type {bool}
			 */
			this.isDeleted = false;
			/** User account is anonymized.
			 * @instance
			 * @type {bool}
			 */
			this.isAnonymized = false;
			/** User account is blocked.
			 * @instance
			 * @type {bool}
			 */
			this.isBlocked = false;
			
			/** Roles of user (a 32 bit bitset).
			 * @instance
			 * @type {number}
			 */
			this.roles = User.ROLE_NOTLOGGED;
			/** Roles data of user. This are additional data to describe details of roles.
			 * @instance
			 * @type {object}
			 */
			this.rolesData = {};
			
			/** The eMail address of user which is used for log in.
			 * @instance
			 * @type {string}
			 */
			this.logInEMail = "";
			/** The eMail address of user.
			 * @instance
			 * @type {string}
			 */
			this.eMail = "";
			/** User has allowed to receive e-mails.
			 * @instance
			 * @type {string}
			 */
			this.isEMailContactAllowed = false;
			
			/** Nickname of user.
			 * @instance
			 * @type {string}
			 */
			this.nickName = "";
			//_usersIdOrJsonObj == 0 ? 'Not Logged<context="Default Username"/>'.I18xTrans() : 'Unknown<context="Default Username"/>'.I18xTrans();
			/** Title of user (e.g. "Dr.", "Prof.").
			 * @instance
			 * @type {string}
			 */
			this.title = "";
			/** First names of user, separated by spaces if multiple names available.
			 * @instance
			 * @type {string}
			 */
			//this.firstNames = _usersId==0?'Not<context="Default Username"/>'.I18xTrans():'Not<context="Default Username"/>'.I18xTrans();
			this.firstNames = "";
			/** The last name of user.
			 * @instance
			 * @type {string}
			 */
			//this.lastName = _usersId==0?'Logged<context="Default Username"/>'.I18xTrans():'Known<context="Default Username"/>'.I18xTrans();
			this.lastName = "";
			
			/** Job title of user (e.g. "Aphotheker", "Developer").
			 * @instance
			 * @type {string}
			 */
			this.jobTitle = "";
			/** Avatar filename of user.
			 * @instance
			 * @type {string}
			 */
			this.avatar = "";
			/** Signature filename of user.
			 * @instance
			 * @type {string}
			 */
			this.signature = "";
			
			/** Last selected localization of user.
			 * @instance
			 * @type {string}
			 */
			this.lid = "en-US";
			/** Native (browser) localization of user.
			 * @instance
			 * @type {string}
			 */
			this.nlid = "en-US";
			/** Last detected timezone of user.
			 * @instance
			 * @type {string}
			 */
			this.timezone = "GMT";
			/** MD5 fingerprint of the user data, used to detect user data changes.
			 * @instance
			 * @type {string}
			 */
			this.md5 = User.getMD5(this);
		}
		if (this.isBlocked) {
			this.nickName = 'Blocked User<context="Nickname of a deleted user"/>'.I18xTrans();
			this.firstNames = 'Not<context="Firstnames of a deleted user"/>'.I18xTrans();
			this.lastName = 'Available<context="Lastname of a deleted user"/>'.I18xTrans();
			this.avatar = 'blockedAvatar.jpg';
			this.signature = 'blockedSignature.jpg';
		}
		if (this.isAnonymized) {
			this.nickName = 'Anonymous<context="Nickname of an anonymized user"/>'.I18xTrans();
			this.firstNames = 'Not<context="Firstnames of an anonymized user"/>'.I18xTrans();
			this.lastName = 'Available<context="Lastname of anonymized user"/>'.I18xTrans();
			this.avatar = 'anonymizedAvatar.jpg';
			this.signature = 'anonymizedSignature.jpg';
		}
		if (this.isDeleted) {
			this.nickName = 'Deleted User<context="Nickname of a deleted user"/>'.I18xTrans();
			this.firstNames = 'Not<context="Firstnames of a deleted user"/>'.I18xTrans();
			this.lastName = 'Available<context="Lastname of a deleted user"/>'.I18xTrans();
			this.avatar = 'deletedAvatar.jpg';
			this.signature = 'deletedSignature.jpg';
		}
		switch (this.usersId) {
			case -1:
				this.nickName = 'Not Logged<context="Nickname of a not logged user"/>'.I18xTrans();
				this.avatar = 'notloggedAvatar.jpg';
				this.signature = 'notloggedSignature.jpg';
				break;
			case 0:
				this.nickName = 'System<context="Nickname of an system user"/>'.I18xTrans();
				this.avatar = 'systemAvatar.jpg';
				this.signature = 'systemSignature.jpg';
				break;
		}
	}
	
	/** Calculates an MD5 fingerprint over the relevant user data, used to detect user data changes.
	 * @method getMD5
	 * @instance
	 * @static
	 * @param {User} _user   The user object to calculate the fingerprint for.
	 * @return {string}      The MD5 hash of the user data.
	 */
	static getMD5(_user) {
		let ret = "";
		ret += _user.usersId + "|";
		ret += _user.nickName + "|";
		ret += _user.firstNames + "|";
		ret += _user.lastName + "|";
		ret += _user.jobTitle + "|";
		ret += _user.roles + "|";
		ret += JSON.stringify(_user.rolesData) + "|";
		ret += _user.logInEMail + "|";
		//ret += _user.isLoggedIn + "|";
		ret += _user.isBlocked + "|";
		ret += _user.isDeleted + "|";
		ret += _user.isAnonymized + "|";
		ret += _user.eMail + "|";
		ret += _user.isEMailContactAllowed;
		//console.error("md5 user str ",ret);
		//console.error("md5 user md5 ",ret.md5());
		return ret.md5();
	}
	
	/** Returns the localized name of a user role.
	 * @method getUserRoleName
	 * @instance
	 * @static
	 * @param {number} _roleBit   The bit number of the role (one of the ROLEBIT_* constants).
	 * @return {string}           The localized role name, or a localized "Unknown" if the role bit is unknown.
	 */
	static getUserRoleName(_roleBit) {
		if (User.ROLE_NAMES.hasOwnProperty(_roleBit)) {
			return User.ROLE_NAMES[_roleBit].I18xTrans();
		} else {
			return 'Unknown<context="user role name"/>'.I18xTrans();
		}
	}
	
	/** Writes the localized names of all roles set in a roles bitset to the console.
	 * @method userRoles2Console
	 * @instance
	 * @static
	 * @param {number} _roles           The roles bitset to print.
	 * @param {string} [_preGule=""]    String prepended to each role name.
	 * @param {string} [_postGlue=""]   String appended to each role name.
	 * @param {string} [_genGlue="\n"]  Separator string between the role names.
	 * @return {void}
	 */
	static userRoles2Console(_roles, _preGule = "", _postGlue = "", _genGlue = "\n") {
		let h = [], r;
		//console.Log(this.roles);
		for (r = 0; r < 31; r++) {
			if (_roles & (1 << r)) h.push(_preGule + User.getUserRoleName(r) + _postGlue);
			//console.Log(r,(this.roles & (1 << r)),User.getUserRoleName(r) );
		}
		//console.Log("rolesHTML",h.join(_genGlue));
		console.Log(h.join(_genGlue));
	}
	
	/** Returns a localized text representation of a roles bitset.
	 * Known complete role sets are returned as one set name, otherwise the single role names are joined.
	 * @method rolesText
	 * @instance
	 * @static
	 * @param {number} _roles           The roles bitset to convert.
	 * @param {string} [_preGule=""]    String prepended to each role name.
	 * @param {string} [_postGlue=""]   String appended to each role name.
	 * @param {string} [_genGlue=""]    Separator string between the role names.
	 * @return {string}                 The localized text representation of the roles.
	 */
	static rolesText(_roles, _preGule = "", _postGlue = "", _genGlue = "") {
		let h = [], r, isRoleSet = false;
		//console.Log(this.roles);
		switch (_roles) {
			case User.ROLES_NONE:
				h.push('no roles definition<context="user role set name"/>'.I18xTrans());
				isRoleSet = true;
				break;
			case User.ROLES_ALL:
				h.push('all roles<context="user role set name"/>'.I18xTrans());
				isRoleSet = true;
				break;
			case User.ROLES_ALL_AUTH:
				h.push('all authenticated roles<context="user role set name"/>'.I18xTrans());
				isRoleSet = true;
				break;
			case User.ROLES_ALL_PROD:
				h.push('all production roles<context="user role set name"/>'.I18xTrans());
				isRoleSet = true;
				break;
			case User.ROLES_ALL_TRANSLATORS:
				h.push('all internationalization roles<context="user role set name"/>'.I18xTrans());
				isRoleSet = true;
				break;
			case User.ROLES_ALL_TESTERS:
				h.push('all tester roles<context="user role set name"/>'.I18xTrans());
				isRoleSet = true;
				break;
			case User.ROLES_ALL_DEVELOPERS:
				h.push('all developer roles<context="user role set name"/>'.I18xTrans());
				isRoleSet = true;
				break;
			case User.ROLES_ALL_ADMINS:
				h.push('all administration roles<context="user role set name"/>'.I18xTrans());
				isRoleSet = true;
				break;
			case User.ROLES_ALL_TECHNICIANS:
				h.push('all technician roles<context="user role set name"/>'.I18xTrans());
				isRoleSet = true;
				break;
			case User.ROLES_ALL_PHARMACIST_AND_MEDICS:
				h.push('all medic and pharmacist roles<context="user role set name"/>'.I18xTrans());
				isRoleSet = true;
				break;
			case (User.ROLES_ALL_PHARMACIST_AND_MEDICS | User.ROLES_ALL_TECHNICIANS):
				h.push('all technician, medic and pharmacist roles<context="user role set name"/>'.I18xTrans());
				isRoleSet = true;
				break;
		}
		if (!isRoleSet) {
			for (r = 0; r < 31; r++) {
				if (_roles & (1 << r)) h.push(_preGule + User.getUserRoleName(r) + _postGlue);
				//console.Log(r,(this.roles & (1 << r)),User.getUserRoleName(r) );
			}
		}
		//console.Log("rolesHTML",h.join(_genGlue));
		return h.join(_genGlue);
	}
	
	/** Returns an HTML representation of all roles set for this user.
	 * @method rolesHTML
	 * @instance
	 * @param {string} [_preGule=""]    HTML string prepended to each role name.
	 * @param {string} [_postGlue=""]   HTML string appended to each role name.
	 * @param {string} [_genGlue=""]    Separator HTML string between the role names.
	 * @return {string}                 The HTML representation of the user's roles.
	 */
	rolesHTML(_preGule = "", _postGlue = "", _genGlue = "") {
		let h = [], r;
		//console.Log(this.roles);
		for (r = 0; r < 31; r++) {
			if (this.roles & (1 << r)) h.push(_preGule + User.getUserRoleName(r) + _postGlue);
			//console.Log(r,(this.roles & (1 << r)),User.getUserRoleName(r) );
		}
		//console.Log("rolesHTML",h.join(_genGlue));
		return h.join(_genGlue);
	}
	
	/** Returns an HTML representation with checkboxes to edit the roles of this user.
	 * @method rolesEditHTML
	 * @instance
	 * @param {string} [_genGlue=""]     Separator HTML string between the role checkboxes.
	 * @param {number} _includeRoles     Roles bitset of roles to show.
	 * @param {number} _excludeRoles     Roles bitset of roles to hide.
	 * @return {string}                  The HTML representation with role edit checkboxes.
	 */
	rolesEditHTML(_genGlue = "", _includeRoles, _excludeRoles) {
		let h = [], r;
		for (r = 0; r < 31; r++) {
			if (User.ROLE_NAMES.hasOwnProperty(r)) if (((1 << r) & _includeRoles) && !((1 << r) & _excludeRoles)) h.push('<input id="rolesEdit_' + r + '" type="checkbox" ' + ((this.roles & (1 << r)) ? "checked" : "") + '>' + User.getUserRoleName(r));
		}
		//console.Log("rolesHTML",h.join(_genGlue));
		return h.join(_genGlue);
	}
	
	/** Reads the checkbox states of the role edit HTML (see rolesEditHTML) and returns the resulting roles bitset.
	 * @method rolesEditHTMLResult
	 * @instance
	 * @param {number} _supportedRoles   Roles bitset of roles which are editable.
	 * @return {number}                  The resulting roles bitset of the user.
	 */
	rolesEditHTMLResult(_supportedRoles) {
		let roles = this.roles, r;
		//console.Log("old",roles);
		for (r = 0; r < 31; r++) {
			let o = document.getElementById("rolesEdit_" + r);
			if ((_supportedRoles & ~(1 << r)) != 0) {
				if (o) {
					if (o.checked) {
						roles |= 1 << r;
					} else {
						roles &= ~(1 << r);
					}
				}
			}
		}
		//console.Log("new",roles);
		return roles;
	}
	
	/** Get a HTML representation of users data.
	 * @method toHTML
	 * @instance
	 * @param {object} [_opts={}]   Optional display options.
	 * @return {string}             The HTML table representation of the user's data.
	 */
	toHTML(_opts = {}) {
		let h = "";
		
		/** Appends a table row with a header cell and a data cell to the HTML result.
		 * @param {string} _headerHtml   HTML content of the header cell.
		 * @param {string} [_html=""]    HTML content of the data cell.
		 * @return {void}
		 */
		function _addRow(_headerHtml, _html = "") {
			h += "<tr><th>" + _headerHtml + "</th><td>" + _html + "</td></tr>";
		}
		
		h += '<table>';
		if (Users.CONF_USER_FEATURE_AVATAR) _addRow('<img width="64px;" src="' + './build/dynData/avatars/' + this.avatar + '"/>');
		_addRow('Nickname<context="user info header text"/>'.I18xTrans().HtmlEntities(), this.nickName.HtmlEntities());
		_addRow('Firstnames<context="user info header text"/>'.I18xTrans().HtmlEntities(), this.firstNames.HtmlEntities());
		_addRow('Lastname<context="user info header text"/>'.I18xTrans().HtmlEntities(), this.lastName.HtmlEntities());
		_addRow('Job Title<context="user info header text"/>'.I18xTrans().HtmlEntities(), this.jobTitle == 'not specified<context="user empty job title info text"/>'.I18xTrans().HtmlEntities() ? "" : this.jobTitle.HtmlEntities());
		_addRow('eMail<context="user info header text"/>'.I18xTrans().HtmlEntities(), '<a href="mailto:' + this.eMail + '">' + this.eMail.HtmlEntities() + '</a>');
		_addRow('Roles<context="user info header text"/>'.I18xTrans().HtmlEntities(), User.rolesText(this.roles, "", "", ", ").HtmlEntities());
		_addRow('', '<br>');
		h += '</table>';
		return h;
	}
	
	
	/** Creates a copy of this user.
	 * @method clone
	 * @instance
	 * @return {User}   The new user object with the same data.
	 */
	clone() {
		return new User(this);
	}

	/** Initializes the User class by registering the localized role names.
	 * @method init
	 * @instance
	 * @static
	 * @return {void}
	 */
	static init() {
		User.ROLE_NAMES[User.ROLEBIT_NOTLOGGED] = 'Not Logged<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_STANDARD] = 'Standard User<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_PHOTOGRAPHER] = 'Photographer<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_MEASUREMENT_DATA_LOGGER] = 'Measurement Data Logger<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_PHOTOEDITOR] = 'Photo Editor<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_QUALITYMANAGER] = 'Quality Manager<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_PRODUCTS_INCOMING_CONTROLLER] = 'Products Incoming Controller<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_PRODUCTS_OUTGOING_CONTROLLER] = 'Products Outgoing Controller<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_LOGISTIC_EXPORTER] = 'Logistic Exporter<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_EXECUTIVE_EXPORTER] = 'Executive Exporter<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_HEALTH_CARE_PROFESSIONAL] = 'Health Care Professional<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_PHARMACIST] = 'Pharmacist<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_SUPERPHARMACIST] = 'Super Pharmacist<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_MEDIC] = 'Medic<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_SUPERMEDIC] = 'Super Medic<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_PROJECT_MANAGER] = 'Project Manager<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_LICENSE_MANAGER] = 'License Manager<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_TRANSLATOR] = 'Translator<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_SUPERTRANSLATOR] = 'Super Translator<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_DEVELOPER] = 'Developer<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_SUPERDEVELOPER] = 'Super Developer<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_TESTER] = 'Tester<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_SUPERTESTER] = 'Super Tester<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_ADMIN] = 'Administrator<context="user role name"/>'.I18xRegister();
		User.ROLE_NAMES[User.ROLEBIT_SUPERADMIN] = 'Super Administrator<context="user role name"/>'.I18xRegister();
	}
}
if (typeof window !== 'undefined') window.User = User;

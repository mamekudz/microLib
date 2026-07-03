// ===========================================
// Config.js
// © 1996-2026 Meinolf Amekudzi
// (published under MIT license)
// ===========================================

/**
 * A class to configure web applications.
 * @module Config
 */

import Users from "./Users.mjs";

/** Class to configure web applications. Properties will be overwritten by main javascript file of application.
 * @class Config
 */
export default class Config {
	/** The application identifier. Used for localStorage and external server communication.
	 * @static
	 * @type  {string}
	 */
	static APPID = "UnknownApp";
	
	/** The client identifier. Used for application customizing.
	 * @static
	 * @type  {string}
	 */
	static CLIENT = "Standard";
	/** The instance identifier.
	 * @static
	 * @type  {string}
	 */
	static INSTANCE = "";
	
	/** True if the current browser is Chrome (detected via user agent).
	 * @static
	 * @type  {boolean}
	 */
	static IS_CHROME = navigator.userAgent.match(/Chrome/i) != null;
	/** True if the current browser is Firefox (detected via user agent).
	 * @static
	 * @type  {boolean}
	 */
	static IS_FIREFOX = navigator.userAgent.match(/Firefox/i) != null;
	
	/*-- @<BUILD_ONLY_AT_RELEASES:Production ----
	static IS_DEVELOPEMENT_SERVER = false;
	static IS_TEST_SERVER = false;
	static IS_PRODUCTION_SERVER = true;
	---- @>BUILD_ONLY_AT_RELEASES --*/
	/*-- @<BUILD_ONLY_AT_RELEASES:Test ----
	static IS_DEVELOPEMENT_SERVER = false;
	static IS_TEST_SERVER = true;
	static IS_PRODUCTION_SERVER = false;
	---- @>BUILD_ONLY_AT_RELEASES --*/
	/*-- @<BUILD_NEVER_AT_RELEASES:Production,Test --*/
	/** True if the application runs on the development server (set by the build process).
	 * @static
	 * @type  {boolean}
	 */
	static IS_DEVELOPEMENT_SERVER = true;
	/** True if the application runs on the test server (set by the build process).
	 * @static
	 * @type  {boolean}
	 */
	static IS_TEST_SERVER = false;
	/** True if the application runs on the production server (set by the build process).
	 * @static
	 * @type  {boolean}
	 */
	static IS_PRODUCTION_SERVER = false;
	/*-- @>BUILD_NEVER_AT_RELEASES:Production,Test --*/
	
	/** The release and development documentation.
	 * This is an array of following format:
	 * @example
	 * [
	 *   {
	 *     "main": 0, "minor": 1, "revision": 0, "date": "2022-06-01 18:00", "beta": true,
	 *     "info": [
	 *       "basic implementatinos"
	 *     ]
	 *   }
	 * ]
	 * @static
	 * @type  {array}
	 */
	static RELEASES = [
		{
			"main": 0, "minor": 0, "revision": 0, "date": "2000-01-01 00:00", "beta": true,
			"info": [
				"dummy information"
			]
		},
	];
	
	/** The i18x context used to register and translate release info texts.
	 * @static
	 * @type  {string}
	 */
	static RELEASES_INFO_CONTEXT = "release info";
	
	/** STATIC: Sets the release history and registers all info texts for i18x translation.
	 * Info texts without an explicit context tag get the context {@link Config.RELEASES_INFO_CONTEXT}
	 * appended, so the texts can be translated automatically via the i18xe engine.
	 * @method SetReleases
	 * @static
	 * @param {array} _releases   Release history in the format of {@link Config.RELEASES}.
	 * @return {array} The processed release history (also assigned to Config.RELEASES).
	 */
	static SetReleases(_releases) {
		let r, i, info;
		for (r = 0; r < _releases.length; r++) {
			for (i = 0; i < _releases[r].info.length; i++) {
				info = _releases[r].info[i];
				if (info.indexOf("<context=") < 0) info += '<context="' + Config.RELEASES_INFO_CONTEXT + '"/>';
				_releases[r].info[i] = info.I18xRegister();
			}
		}
		Config.RELEASES = _releases;
		return _releases;
	}
	
	/** STATIC: Loads the release history from a JSON file and registers all info texts
	 * for i18x translation (see {@link Config.SetReleases}).
	 * @method LoadReleases
	 * @static
	 * @param {string} _url     URL of the releases JSON file, default value is "./releases.json".
	 * @param {boolean} _cache  Whether to use the browsers cache, default value is true.
	 * @return {Promise}        A promise resolving to the processed release history.
	 * @example
	 * await Config.LoadReleases();
	 * console.Log(Config.GetReleasesConsoleString());
	 */
	static async LoadReleases(_url = "./releases.json", _cache = true) {
		let response = await fetch(_url, _cache ? undefined : { cache: "no-store" });
		if (!response.ok) throw new Error("Config.LoadReleases: failed to load '" + _url + "' (HTTP " + response.status + ")");
		return Config.SetReleases(await response.json());
	}
	
	/** STATIC: Returns the formatted version history as a plain text string for console output.
	 * The info texts are translated via i18x into the given (or current) language.
	 * @method GetReleasesConsoleString
	 * @static
	 * @param {number} _maxNoOfReleases   Maximum number of releases to include, 0 means all (default).
	 * @param {string} _lid               Optional language id, default is the current i18x language.
	 * @return {string} The formatted version history.
	 */
	static GetReleasesConsoleString(_maxNoOfReleases = 0, _lid = undefined) {
		let lines = [], r, i, release, l = this.RELEASES.length;
		if (_maxNoOfReleases > 0 && _maxNoOfReleases < l) l = _maxNoOfReleases;
		for (r = 0; r < l; r++) {
			release = this.RELEASES[r];
			lines.push("V" + release.main + "." + release.minor + "." + release.revision + ((release.beta) ? "β" : "") + " · " + release.date);
			for (i = 0; i < release.info.length; i++) lines.push("  · " + release.info[i].I18xTrans({}, _lid).I18xRemoveContext());
			lines.push("");
		}
		return lines.join("\n").trim();
	}
	
	/** Bit flags controlling which elements are shown in the application sub menu layout.
	 * @static
	 * @type  {object}
	 */
	static subMenuLayoutFlags = {
		"InfoSheet": 1 << 0,
		"ActivityLog": 1 << 1,
		"Lock": 1 << 2,
		"Detail": 1 << 3
	};
	
	/** Whether the application is currently in maintenance mode.
	 * @static
	 * @type  {boolean}
	 */
	static maintenanceActive = false;


	/** Bit mask of the user roles supported by the application, default is User.ROLES_ALL.
	 * @static
	 * @type  {number}
	 */
	static SUPPORTED_USER_ROLES = User.ROLES_ALL;
	
	// Sound, Music and Speech Settings...
	/** Mute of audio output.
	 * @static
	 * @type  {boolean}
	 */
	static ALL_AUDIO_MUTE = true;
	/** Mute of control elements audio output.
	 * @static
	 * @type  {boolean}
	 */
	static SOUND_CONTROL_MUTE = false
	/** Volume of control elements (float, range 0.0 to 1.0).
	 * @static
	 * @type  {number}
	 */
	static SOUND_CONTROL_VOL = 1;
	/** Mute of modal panel elements audio output.
	 * @static
	 * @type  {boolean}
	 */
	static SOUND_MODAL_MUTE = true;
	/** Volume of modal panel elements (float, range 0.0 to 1.0).
	 * @static
	 * @type  {number}
	 */
	static SOUND_MODAL_VOL = 1;
	/** Mute of music audio output.
	 * @static
	 * @type  {boolean}
	 */
	static MUSIC_MUTE = true;
	/** Volume of musics (float, range 0.0 to 1.0).
	 * @static
	 * @type  {number}
	 */
	static MUSIC_VOL = 0.8;
	/** Mute of speech audio output.
	 * @static
	 * @type  {boolean}
	 */
	static SPEECH_MUTE = true;
	/** Volume of speech outputs (float, range 0.0 to 1.0).
	 * @static
	 * @type  {number}
	 */
	static SPEECH_VOL = 1;
	
	/** STATIC: Returns the current version string of the newest release, e.g. "V1.2.3β".
	 * @method GetCurrentVersionString
	 * @static
	 * @return {string} The current version string.
	 */
	static GetCurrentVersionString = function () {
		return "V" + this.RELEASES[0].main + "." + this.RELEASES[0].minor + "." + this.RELEASES[0].revision + ((this.RELEASES[0].beta) ? "β" : "");
	}
	
	/** STATIC: Returns the current version string of the newest release including the formatted release date.
	 * @method GetCurrentFullVersionString
	 * @static
	 * @return {string} The current version string with release date.
	 */
	static GetCurrentFullVersionString = function () {
		return "V" + this.RELEASES[0].main + "." + this.RELEASES[0].minor + "." + this.RELEASES[0].revision + ((this.RELEASES[0].beta) ? "β" : "") + " · " + this.RELEASES[0].date.ReleaseDate2DateTime().Format('stddatetime');
	}
	
	/** STATIC: Returns the copyright years span derived from the release history, e.g. "2020-2026".
	 * @method GetCopyrightYearsString
	 * @static
	 * @return {string} The copyright years string (single year or year range).
	 */
	static GetCopyrightYearsString = function () {
		let s = 0;
		let e = 0;
		let d = 0;
		for (let r in this.RELEASES) {
			if (!(this.RELEASES[r] instanceof Function)) {
				for (let i in this.RELEASES[r].info) {
					if (!(this.RELEASES[r].info[i] instanceof Function)) {
						d = this.RELEASES[0].date.ReleaseDateYear();
						if (s == 0) {
							s = d;
							e = d;
						} else if (d > e) {
							e = d;
						}
					}
				}
			}
		}
		return s + (e != s ? "-" + e : "");
	}
	
	/** STATIC: Returns the version history as HTML unordered lists, with info texts translated via i18x.
	 * @method GetReleasesHTML
	 * @static
	 * @return {string} The HTML representation of the release history.
	 */
	static GetReleasesHTML = function () {
		let ret = "";
		for (let r in this.RELEASES) {
			if (!(this.RELEASES[r] instanceof Function)) {
				ret += '<ul class="versioninfo">' + this.RELEASES[r].main + "." + this.RELEASES[r].minor + "." + this.RELEASES[r].revision + ((this.RELEASES[r].beta) ? "β" : "") + " · " + this.RELEASES[r].date.ReleaseDate2DateTime().Format('stddate');
				for (let i in this.RELEASES[r].info) {
					if (!(this.RELEASES[r].info[i] instanceof Function)) {
						ret += '<li class="versioninfo">' + this.RELEASES[r].info[i].I18xTrans().HtmlEntities() + '</li>';
					}
				}
				ret += '</ul>';
			}
		}
		return ret;
	}
	
	/** STATIC: Restores the sound, music and speech configuration values from the browsers localStorage.
	 * @method setConfigByLocalStorage
	 * @static
	 */
	static setConfigByLocalStorage() {
		this.ALL_AUDIO_MUTE = localStorage.Get("ALL_AUDIO_MUTE", true, Storage.LEVEL_APP);
		this.SOUND_CONTROL_MUTE = localStorage.Get("SOUND_CONTROL_MUTE", false, Storage.LEVEL_APP);
		this.SOUND_CONTROL_VOL = localStorage.Get("SOUND_CONTROL_VOL", 1, Storage.LEVEL_APP);
		this.SOUND_MODAL_MUTE = localStorage.Get("SOUND_MODAL_MUTE", true, Storage.LEVEL_APP);
		this.SOUND_MODAL_VOL = localStorage.Get("SOUND_MODAL_VOL", 1, Storage.LEVEL_APP);
		this.MUSIC_MUTE = localStorage.Get("MUSIC_MUTE", true, Storage.LEVEL_APP);
		this.MUSIC_VOL = localStorage.Get("MUSIC_VOL", 0.8, Storage.LEVEL_APP);
		this.SPEECH_MUTE = localStorage.Get("SPEECH_MUTE", true, Storage.LEVEL_APP);
		this.SPEECH_VOL = localStorage.Get("SPEECH_VOL", 1, Storage.LEVEL_APP);
	}
}

/** String prototype extensions for configuration handling.
 * @class String
 */
/** Appends the full version string (version, beta marker and formatted release date) of a release entry to this string.
 * @param {object} _configVersion    A release entry in the format of {@link Config.RELEASES}.
 * @return {string} The string followed by the full version string of _configVersion.
 */
String.prototype.ConfigFullVersionString = function (_configVersion) {
	return this.valueOf() + "V" + _configVersion.main + "." + _configVersion.minor + "." + _configVersion.revision + ((_configVersion.beta) ? "𝛽" : "") + " · " + _configVersion.date.ReleaseDate2DateTime().Format('stddatetime');
}

/** Global access to the Config class via the browsers window object. */
window.Config = Config;
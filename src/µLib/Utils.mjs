// ===========================================
// Utils.js
// © 1996-2026 Meinolf Amekudzi
// (published under MIT license)
// ===========================================

/** General utility class with platform detection and file loading helpers.
 * @module Utils
 */

/** Static class with platform detection constants and file loading helpers.
 * @class Utils
 */
export default class Utils {
	/** STATIC: The device pixel ratio of the display (1 if not available). */
	static IS_PIXELRATIO = window.devicePixelRatio || 1;
	/** STATIC: The viewport size as an object with width and height in CSS pixels. */
	static IS_VIEWPORT = { width: window.innerWidth, height: window.innerHeight };
	/** STATIC: The screen size as an object with width and height in physical pixels. */
	static IS_SCREEN = { width: window.screen.width * Utils.IS_PIXELRATIO, height: window.screen.height * Utils.IS_PIXELRATIO };

	/** STATIC: True, if the device is an iPod. */
	static IS_IPOD = navigator.userAgent.match(/iPod/i) != null;
	/** STATIC: True, if the device is an iPad. */
	static IS_IPAD = navigator.userAgent.match(/iPad/i) != null;
	/** STATIC: True, if the device is an iPad 3 or later (retina display). */
	static IS_IPAD3PLUS = Utils.IS_IPAD && window.devicePixelRatio == 2;
	/** STATIC: True, if the device is an iPhone. */
	static IS_IPHONE = navigator.userAgent.match(/iPhone/i) != null;
	/** STATIC: True, if the device is an iPhone 5 / iPod 5 sized screen. */
	static IS_IPHONEIPOD5 = window.screen.availHeight == 548;
	/** STATIC: True, if the device runs iOS. */
	static IS_IOS = Utils.IS_IPHONE || Utils.IS_IPOD || Utils.IS_IPAD;
	/** STATIC: True, if the browser is Internet Explorer. */
	static IS_IE = navigator.userAgent.match(/MSIE/) != null || navigator.userAgent.match(/Trident/) != null || navigator.userAgent.match(/Zune/) != null;
	/** STATIC: True, if the browser is Firefox. */
	static IS_FIREFOX = navigator.userAgent.match(/Firefox/i) != null;
	/** STATIC: True, if the browser is Safari. */
	static IS_SAFARI = ((navigator.userAgent.match(/Safari/i) != null && navigator.userAgent.match(/Chrome/i) == null) || Utils.IS_IPHONE || Utils.IS_IPAD) && !navigator.userAgent.match(/Android/i) != null;
	/** STATIC: True, if the browser is Chrome. */
	static IS_CHROME = navigator.userAgent.match(/Chrome/i) != null;
	/** STATIC: True, if the browser is Opera. */
	static IS_OPERA = navigator.userAgent.match(/Opera/i) != null;
	/** STATIC: True, if the device runs Android. */
	static IS_ANDROID = navigator.userAgent.match(/Android/i) != null;
	/** STATIC: True, if the browser is WebKit based. */
	static IS_WEBKIT = navigator.userAgent.match(/WebKit/i) != null;
	/** STATIC: True, if the operating system is Windows. */
	static IS_WINDOWS = navigator.userAgent.match(/Windows/i) != null;
	/** STATIC: True, if the operating system is macOS. */
	static IS_MAC = navigator.userAgent.match(/Macintosh/i) != null;
	/** STATIC: True, if the browser is Safari on macOS. */
	static IS_MACSAFARI = Utils.IS_MAC && Utils.IS_SAFARI;
	/** STATIC: True, if the browser is Safari on Windows. */
	static IS_WINSAFARI = Utils.IS_WINDOWS && Utils.IS_SAFARI;
	/** STATIC: True, if the device runs Android older than 4.1. */
	static IS_ANDROID40 = Utils.IS_ANDROID && parseFloat(navigator.userAgent.split("Android")[1]) < 4.1;
	/** STATIC: True, if the device is a mobile device (Android or iOS). */
	static IS_MOBILE = Utils.IS_ANDROID || Utils.IS_IOS;

	
	/** STATIC: A function that does nothing, useful as an empty event handler.
	 */
	static nothings() {
	}
	
	/** STATIC: Loads a json file from server.
	 * @method LoadJSON
	 * @static
	 * @param {string} _url   URL to load.
	 * @param {boolean} [_cache=true]   Whether to use the browser cache.
	 * @return {Promise}	A promise which resolves with the parsed JSON if successful.
	 */
	static LoadJSON = function (_url, _cache = true) {
		let jsonajax = new XMLHttpRequest(), self = this, ret;
		jsonajax.open("GET", _url, true);
		jsonajax.setRequestHeader("Content-Type", "application/json");
		if (!_cache) {
			jsonajax.setRequestHeader("pragma", "no-cache");
			jsonajax.setRequestHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0, proxy-revalidate, no-transform");
			jsonajax.setRequestHeader("pragma", "no-cache");
			jsonajax.setRequestHeader("Expires", 0);
		}
		ret =  new Promise(
			 function (_resolve, _reject) {
						jsonajax.onreadystatechange = function () {
							if (this.readyState == 4) {
								if (this.status == 200) {
									try {
										_resolve(JSON.parse(this.responseText));
									} catch (e) {
										_reject();
									}
								} else {
									_reject();
								}
							}
						}
			 })
		jsonajax.send(null);
		return ret;
	}
	
	/** STATIC: Loads a text file from server.
	 * @method loadText
	 * @static
	 * @param {string} _url   URL to load.
	 * @param {boolean} [_cache=true]   Whether to use the browser cache.
	 * @return {Promise}	A promise which will give the loaded text if successful.
	 */
	static loadText = function (_url, _cache = true) {
		let textajax = new XMLHttpRequest(), self = this, ret;
		textajax.open("GET", _url, true);
		textajax.setRequestHeader("Content-Type", "text/plain");
		if (!_cache) {
			textajax.setRequestHeader("pragma", "no-cache");
			textajax.setRequestHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0, proxy-revalidate, no-transform");
			textajax.setRequestHeader("pragma", "no-cache");
			textajax.setRequestHeader("Expires", 0);
		}
		ret =  new Promise(
			function (_resolve, _reject) {
				textajax.onreadystatechange = function () {
					if (this.readyState == 4) {
						if (this.status == 200) {
							try {
								_resolve(this.responseText);
							} catch (e) {
								_reject();
							}
						} else {
							_reject();
						}
					}
				}
			})
		textajax.send(null);
		return ret;
	}
}


/** String extensions.
 * @class String
 */

/** Wraps unicode regional indicator symbols in a span element with class "unicode" on Chrome.
 * @returns {string}    The processed string on Chrome, otherwise the unchanged string.
 */
String.prototype.unicodePolyfill = function (){
	if(Utils.IS_CHROME){
		return this.valueOf().replace(/([\u{1F1E6}-\u{1F1FF}]+)/gmu,'<span class="unicode">$1</span>');
	}
	return this.valueOf();
}

/**
 * Returns a debounced version of the given callback function.
 * The debounced function delays invoking the callback until after
 * the specified wait time has elapsed since the last time it was called.
 *
 * @param {Function} callback - The function to debounce.
 * @param {number} wait - The number of milliseconds to delay.
 * @returns {Function} A debounced function.
 */
export const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, wait);
  };
};
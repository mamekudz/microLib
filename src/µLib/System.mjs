// ===========================================
// System.js
// © 1996-2026 Meinolf Amekudzi
// (published under MIT license)
// ===========================================

/** Module to manage system environment.
 * @module System
 */

// Mock browser environment for Node.js
if (typeof process !== 'undefined' && process.title && process.title.indexOf("node") >= 0) {
	global.navigator = { userAgent: "node.js" };
	global.location = { href: "", protocol: "" };
	global.screen = { availWidth: 0, availHeight: 0 };
	global.document = { location: global.location };
	global.Image = class {};
	global.XMLHttpRequest = class {};
	global.XMLDocument = class {};
	global.Element = class {};
	global.Storage = class { set() {} get() {} exists() {} clear() {} };
	global.window = {
		Image: global.Image,
		screen: global.screen,
		document: global.document,
		location: global.location,
		navigator: global.navigator,
		devicePixelRatio: 1,
		innerWidth: 0,
		innerHeight: 0,
		availWidth: 0,
		availHeight: 0,
        requestAnimationFrame: (callback) => {
            setTimeout(callback, 0);
        },
	};
}


/** Class providing static detection of the runtime environment, browser, platform, and display capabilities.
 * @class System
 */
export default class System {
	/** Client platform id for unknown platforms: -1 */
	static CLIENT_PLATFORM_UNKOWN = -1;
	/** Client platform id for web browsers: 0 */
	static CLIENT_PLATFORM_WEB = 0;
	/** Client platform id for iOS devices: 1 */
	static CLIENT_PLATFORM_IOS = 1;
	/** Client platform id for Apple TV devices: 2 */
	static CLIENT_PLATFORM_APPLETV = 2;
	/** Client platform id for Android devices: 3 */
	static CLIENT_PLATFORM_ANDROID = 3;
	/** Client platform id for Windows: 4 */
	static CLIENT_PLATFORM_WINDOWS = 4;
	/** Client platform id for macOS: 5 */
	static CLIENT_PLATFORM_OSX = 5;
	/** Client platform id for Linux: 6 */
	static CLIENT_PLATFORM_LINUX = 6;
	/** Client platform id for Nintendo Switch: 7 */
	static CLIENT_PLATFORM_SWITCH = 7;
	/** Client platform id for Xbox: 8 */
	static CLIENT_PLATFORM_XBOX = 8;
	/** Client platform id for PlayStation 4: 9 */
	static CLIENT_PLATFORM_PS4 = 9;

	/** Server type id for no server: 0 */
	static SERVERTYPE_NONE = 0;
	/** Server type id for Apache servers: 1 */
	static SERVERTYPE_APACHE = 1;
	/** Server type id for SAP NetWeaver servers: 2 */
	static SERVERTYPE_NETWEAVER = 2
	/** Server type id for Microsoft IIS servers: 3 */
	static SERVERTYPE_IIS = 3;

	/** True when running under Node.js instead of a browser. */
	static IS_NODEJS;
	/** Application id taken from the global APPID, or "none". */
	static APPID;
	/** Active client key taken from the global CLIENT, or "std". */
	static CLIENT;
	/** List of available clients as [key, label] pairs taken from the global CLIENTS. */
	static CLIENTS;
	/** Active instance key taken from the global INSTANCE, or "std". */
	static INSTANCE;
	/** List of available instances as [key, label] pairs taken from the global INSTANCES. */
	static INSTANCES;

	/** True when the page is served via HTTPS. */
	static IS_HTTPS;
	/** True when served by an Apache server. */
	static IS_APACHE;
	/** True when served by a SAP NetWeaver server. */
	static IS_NETWEAVER;
	/** True when served by a Microsoft IIS server. */
	static IS_IIS;

	/** True when running on an iPod. */
	static IS_IPOD;
	/** True when running on an iPad. */
	static IS_IPAD;
	/** True when running on an iPad 3 or newer (retina resolution). */
	static IS_IPAD3PLUS;
	/** True when running on an iPhone. */
	static IS_IPHONE;
	/** True when running on an iPhone 5 or iPod touch 5 sized screen. */
	static IS_IPHONEIPOD5;
	/** True when running on any iOS device (iPhone, iPod, or iPad). */
	static IS_IOS;
	/** True when running in Internet Explorer. */
	static IS_IE;
	/** True when running in Firefox. */
	static IS_FIREFOX;
	/** True when running in Safari (excluding Chrome and Android browsers). */
	static IS_SAFARI;
	/** True when running in Opera. */
	static IS_OPERA;
	/** True when running in Chrome. */
	static IS_CHROME;
	/** True when running on an Android device. */
	static IS_ANDROID;
	/** True when running in a WebKit-based browser. */
	static IS_WEBKIT;
	/** True when running on Windows. */
	static IS_WINDOWS;
	/** True when running on a Macintosh. */
	static IS_MAC;
	/** True when running in Safari on a Macintosh. */
	static IS_MACSAFARI;
	/** True when running in Safari on Windows. */
	static IS_WINSAFARI;
	/** True when running on Android older than version 4.1. */
	static IS_ANDROID40;
	/** True when running on a mobile device (Android or iOS). */
	static IS_MOBILE;

	/** True when running on a high-density (retina) screen. */
	static IS_RETINA;
	/** iOS version as a float, or 0.0 when not running on iOS. */
	static IOSVERSION;

	/** User agent pattern used to locate the browser version string. */
	static verPat;
	/** True when running in an Internet Explorer app variant (Trident or Zune engine). */
	static IS_IE_APP;

	/** Browser version number parsed from the user agent string. */
	static BROWSERVERSION;
	/** Browser-specific step size for vertical mouse wheel events. */
	static WHEELYSTEPSIZE;
	/** Browser-specific step size for horizontal mouse wheel events. */
	static WHEELXSTEPSIZE;
	/** Browser-specific factor to convert horizontal wheel steps to vertical ones. */
	static WHEELXFIXFACTOR2Y;

	/** True when running inside a web view container. */
	static IS_WEBVIEW;
	/** True when running in Internet Explorer older than version 11, which needs workarounds. */
	static IS_M$HIT;
	/** True when running standalone on iOS 8 or later, which needs workarounds. */
	static IS_APPLEBUG;
	/** True when running in Safari, which needs workarounds. */
    static IS_SAFARI$HIT;

	/** Detected refresh rate of the current screen in frames per second (default 60). */
	static DISPLAYFPS = 60;

	/** Static initializer detecting the runtime environment, browser, platform, and screen properties. */
	static {
		this.IS_NODEJS = typeof (process) !== 'undefined' && process.title && process.title.indexOf("node") >= 0;

		this.APPID = typeof APPID === 'undefined' ? "none" : APPID;
		this.CLIENT = typeof CLIENT === 'undefined' ? "std" : CLIENT;
		this.CLIENTS = typeof CLIENTS === 'undefined' ? [["std", "Standard"]] : CLIENTS;
		this.INSTANCE = typeof INSTANCE === 'undefined' ? "std" : INSTANCE;
		this.INSTANCES = typeof INSTANCES === 'undefined' ? [["std", "Standard"]] : INSTANCES;
		
		this.IS_HTTPS = document.location.href.indexOf("https://") !== -1;
		this.IS_APACHE = false;
		this.IS_NETWEAVER = false;
		this.IS_IIS = false;
		
		this.IS_IPOD = navigator.userAgent.match(/iPod/i) != null;
		this.IS_IPAD = navigator.userAgent.match(/iPad/i) != null;
		this.IS_IPAD3PLUS = this.IS_IPAD && window.devicePixelRatio === 2;
		this.IS_IPHONE = navigator.userAgent.match(/iPhone/i) != null;
		this.IS_IPHONEIPOD5 = screen.availHeight === 548;
		this.IS_IOS = this.IS_IPHONE || this.IS_IPOD || this.IS_IPAD;
		this.IS_IE = navigator.userAgent.match(/MSIE/) != null || navigator.userAgent.match(/Trident/) != null || navigator.userAgent.match(/Zune/) != null;
		this.IS_FIREFOX = navigator.userAgent.match(/Firefox/i) != null;
		this.IS_SAFARI = (navigator.userAgent.match(/Safari/i) != null && navigator.userAgent.match(/Chrome/i) == null) || this.IS_IPHONE || this.IS_IPAD;
		this.IS_OPERA = navigator.userAgent.match(/Opera/i) != null;
		this.IS_CHROME = navigator.userAgent.match(/Chrome/i) != null;
		
		this.IS_ANDROID = navigator.userAgent.match(/Android/i) != null;
		if (this.IS_ANDROID) this.IS_SAFARI = false;

		this.IS_WEBKIT = navigator.userAgent.match(/WebKit/i) != null;
		this.IS_WINDOWS = navigator.userAgent.match(/Windows/i) != null;
		this.IS_MAC = navigator.userAgent.match(/Macintosh/i) != null;
		this.IS_MACSAFARI = this.IS_MAC && this.IS_SAFARI;
		this.IS_WINSAFARI = this.IS_WINDOWS && this.IS_SAFARI;
		
        this.IS_ANDROID40 = false;
		if (this.IS_ANDROID) {
            const versionMatch = navigator.userAgent.split("Android")[1];
            if(versionMatch) {
                this.IS_ANDROID40 = parseFloat(versionMatch) < 4.1;
            }
		}
		
		this.IS_MOBILE = this.IS_ANDROID || this.IS_IOS;
		
		this.IS_RETINA = window.devicePixelRatio > 1;
		this.IOSVERSION = this.GetIOSVersion();
		
		this.verPat = "";
		if (this.IS_SAFARI) this.verPat = "Version/";
		if (this.IS_CHROME) this.verPat = "Chrome/";
		if (this.IS_IPHONE) this.verPat = "iPhone; CPU OS ";
		
        this.IS_IE_APP = false;
		if (this.IS_IE) {
            this.IS_IE_APP = (navigator.userAgent.match(/Trident/) != null || navigator.userAgent.match(/Zune/) != null);
			if ((navigator.userAgent.match(/Trident/) != null || navigator.userAgent.match(/Zune/) != null) && navigator.userAgent.indexOf("rv:") >= 0) {
                this.verPat = "rv:";
            } else if (this.verPat !== "rv:") {
                this.verPat = "MSIE";
            }
        }
		if (this.IS_FIREFOX) this.verPat = "Firefox/";
		
		this.BROWSERVERSION = this.verPat ? parseFloat(navigator.userAgent.substr(navigator.userAgent.indexOf(this.verPat) + this.verPat.length)) : 0;
		if (isNaN(this.BROWSERVERSION)) this.BROWSERVERSION = 0;

		this.WHEELYSTEPSIZE = ((this.IS_IE) ? 70 / 3 : ((this.IS_WEBKIT) ? ((this.IS_MAC) ? 10 : 30) : ((this.IS_FIREFOX) ? ((this.IS_MAC) ? 10 : 3 / 3) : 1)));
		this.WHEELXSTEPSIZE = ((this.IS_IE) ? 180 : ((this.IS_WEBKIT) ? ((this.IS_MAC) ? 1 : 3) : ((this.IS_FIREFOX) ? ((this.IS_MAC) ? 1 : 3) : 1)));
		this.WHEELXFIXFACTOR2Y = ((this.IS_IE) ? 3 : ((this.IS_WEBKIT) ? ((this.IS_MAC) ? 1 : 3) : ((this.IS_FIREFOX) ? ((this.IS_MAC) ? 1 : 3) : 1)));
		
		this.IS_WEBVIEW = navigator.userAgent.match(/webview/i) != null;
		this.IS_M$HIT = this.IS_IE && this.BROWSERVERSION < 11;
		this.IS_APPLEBUG = this.IS_IOS && this.IOSVERSION >= 8 && this.IS_STANDALONE && !this.IS_WEBVIEW;
		this.IS_SAFARI$HIT = this.IS_SAFARI;
	}
	
	/** Returns the iOS version parsed from the user agent string.
	 * @returns {number}    iOS version as a float (e.g. 17.4), or 0.0 when not running on iOS.
	 */
	static GetIOSVersion() {
		if (!this.IS_IOS) return 0.0;
		let s = navigator.userAgent, p = s.indexOf("OS ");
        if (p === -1) return 0.0;
        let q = s.indexOf(" ", p + 3);
        if (q === -1) q = s.length;
		let a = s.substring(p + 3, q).split("_");
		if (a.length < 2) a[1] = "0";
		return parseFloat(a[0] + "." + a[1]);
	}
	
	/** Measures the screen refresh rate over a number of animation frames and stores the rounded result in the static frame rate field.
	 * @param {number} [_count=60]    Number of animation frames to sample.
	 * @param {function} [_callBack=null]    Optional callback function(_fps) invoked with the detected frame rate.
	 */
	CalcFPS(_count = 60, _callBack = null) {
		let count = _count, index = count, start = performance.now(), requestFrame = window.requestAnimationFrame;
		const _checker = () => {
			if (index--) {
				requestFrame(_checker);
			} else {
				let result = count * 1000 / (performance.now() - start);
				console.Log(result + " FPS display detected");
				if (result < 35) {
					result = 30;
				} else if (result < 65) {
					result = 60;
				} else if (result < 95) {
					result = 90;
				} else if (result < 105) {
					result = 100;
				} else if (result < 115) {
					result = 110;
				} else if (result < 127) {
					result = 122;
				}
				System.DISPLAYFPS = result;
				if (_callBack != null) _callBack(result);
			}
		}
		_checker();
	}
}
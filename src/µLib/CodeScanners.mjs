// ===========================================
// CodeScanners.js
// © 1996-2026 Meinolf Amekudzi
// (published under MIT license)
// ===========================================


/** Keyboard-wedge barcode scanner handling and pharmaceutical code (PZN/PPN/NTIN/IFA/GS1/ASC) parsing utilities.
 * @module CodeScanners
 */

/** Shared scanner state kept on the window object (current barcode buffer, timers, activation flags, and user callbacks). */
window.barCode = "";
window.barCodeId = "";
window.barCodeReadTimer = null
window.barCodeClearTimer = null
window.barCodeTimeStamp = 0;
window.barCodeIsActive = false;
window.barCodeIsFilling = false;
window.barCodeActivationRegExs = null;
window.barCodeDeactivationRegExs = null;
window.barCodeMetaKey = false;
window.barCodeStartMetaKey = false;
window.onBarCode = null;
window.onBarCodeActivation = null;
window.onBarCodeIsFilling = null;
window.barcodeTestMode = false;
window.keyHandler = null;
window.barCodeGeneralIsActive = false;


/** Static helper class that captures keystrokes from keyboard-wedge barcode scanners via global window event handlers.
 * @class CodeScanners
 */
export default class CodeScanners {
	/** Idle timeout in milliseconds after which the collected key buffer is treated as a complete barcode read. */
	static CONF_BARCODESCANNER_TIMEOUT_MS = 500;
	/** When true, verbose debug output is written to the console. */
	static CONF_BARCODESCANNER_DEBUGMODE = false;
	/** When true, control and directional formatting characters are stripped from the scanned barcode. */
	static CONF_BARCODESCANNER_REMOVE_CTRLCHARS = true;

	/** List of HTML input type attribute values that are considered text inputs (scanner capture is suspended while one is focused). */
	static  HTMLINPUTTYPES = ['text', 'password', 'number', 'email', 'tel', 'url', 'search', 'date', 'datetime', 'datetime-local', 'time', 'month', 'week'];

	/** Global keyup handler; tracks the Alt key state and forwards the event to an optional custom key handler.
	 * @param {KeyboardEvent} _ev    The keyboard event.
	 */
	static OnKeyUp = function (_ev) {
		window.barCodeMetaKey = _ev.altKey;
		if (window.keyHandler != null) {
			if (!CodeScanners.ActiveHTMLElementIsTextInput()) {
				if (window.keyHandler(_ev)) {
					_ev.preventDefault();
					CodeScanners.Reset();
				}
			}
		}
	}
	
	/** Global keydown handler; tracks the Alt key state and forwards the event to an optional custom key handler.
	 * @param {KeyboardEvent} _ev    The keyboard event.
	 */
	static OnKeyDown = function (_ev) {
		if (CodeScanners.CONF_BARCODESCANNER_DEBUGMODE) console.Log("GUIOnKeyDown", _ev.code);
		window.barCodeMetaKey = _ev.altKey;
		if (window.keyHandler != null) {
			if (!CodeScanners.ActiveHTMLElementIsTextInput()) {
				if (window.keyHandler(_ev)) {
					_ev.preventDefault();
					CodeScanners.Reset();
				}
			}
		}
	}
	
	/** Global keypress handler; collects scanned characters into the barcode buffer and (re)starts the read timeout.
	 * @param {KeyboardEvent} _ev    The keyboard event.
	 */
	static  OnKeyPress = function (_ev) {
		if (CodeScanners.CONF_BARCODESCANNER_DEBUGMODE) console.Log("OnKeyPress: ", _ev.key, _ev.keyCode);
		if (!CodeScanners.ActiveHTMLElementIsTextInput()) {
			//if (window.barcodeTestMode && IS_FIREFOX) _ev.preventDefault();
			if (!(_ev.ctrlKey || _ev.altKey || _ev.metaKey)) {
				window.barCodTimeStamp = Date.now();
				window.barCodeReadTimer = clearTimeout(window.barCodeReadTimer);
				switch (_ev.key) {
					case "Enter":
						window.barCode += "\n";
						break;
					case "Spacebar":
						window.barCode += " ";
						break;
					default:
						window.barCode += _ev.key;
				}
				if (CodeScanners.CONF_BARCODESCANNER_DEBUGMODE) console.Log(_ev.key, _ev.keyCode);
				//if (window.keyRecording != null) window.keyRecording(_ev.key, _ev.keyCode);
				//window.barCodeId = window.barCode.barCodeTest(window.barCodeActivationRegExs);
				window.barCodeReadTimer = setTimeout(CodeScanners.barCodeReadTimerHandler, CodeScanners.CONF_BARCODESCANNER_TIMEOUT_MS);
				if (CodeScanners.CONF_BARCODESCANNER_DEBUGMODE) console.info("OnKeyPress ", window.barCode);
				//if (window.barcodeTestMode) return;
				if (window.barCodeId != "") {
					window.barCodeClearTimer = clearTimeout(window.barCodeClearTimer);
					if (CodeScanners.CONF_BARCODESCANNER_DEBUGMODE) console.Log("barCodeId ", window.barCodeId);
					if (!window.barCodeIsFilling) {
						window.barCodeStartMetaKey = false;
						window.barCodeIsFilling = true;
						if (window.onBarCodeIsFilling != null) window.onBarCodeIsFilling();
					}
					_ev.preventDefault();
				} else {
					if (CodeScanners.CONF_BARCODESCANNER_DEBUGMODE) console.Log("OnKeyPress ResetBarCode");
					window.barCodeClearTimer = clearTimeout(window.barCodeClearTimer);
					window.barCodeClearTimer = setTimeout(CodeScanners.Reset, CodeScanners.CONF_BARCODESCANNER_TIMEOUT_MS);
					//if (!window.barCodeDeactivationRegEx.test(window.barCode)) ResetBarCode();
				}
			} else {
				CodeScanners.Reset();
			}
			if (window.modalPanelKeyPressHandler != null) window.modalPanelKeyPressHandler(_ev);
		} else {
			CodeScanners.Reset();
		}
	}
	
	/** Read-timeout handler; optionally strips control characters from the collected barcode, invokes the onBarCode callback, and resets the scanner state. */
	static barCodeReadTimerHandler = function () {
		//console.Log("barCodeReadTimerHandler");
		//window.barCode = BarCodeKeyReplace(window.barCode)
		if (CodeScanners.CONF_BARCODESCANNER_REMOVE_CTRLCHARS) window.barCode = window.barCode.replace(/[\u0000-\u001F\u007F-\u009F\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "");
		if (window.barcodeTestMode) {
			if(window.onBarCode!=null)window.onBarCode();
			CodeScanners.Reset();
		} else {
			let o = document.getElementById("overlay");
			if(window.onBarCode!=null)window.onBarCode();
			CodeScanners.Reset();
		}
	}
	
	/** Checks whether the currently focused HTML element is a text input or textarea.
	 * @returns {boolean}    True if the active element accepts text input.
	 */
	static ActiveHTMLElementIsTextInput = function () {
		let e = document.activeElement;
		if (!e) return false;
		let tagName = e.tagName.toLowerCase();
		if (tagName === 'textarea') return true;
		if (tagName !== 'input') return false;
		let type = e.getAttribute('type').toLowerCase();
		return CodeScanners.HTMLINPUTTYPES.indexOf(type) >= 0;
	}
	
	/** Clears the barcode buffer and all pending timers, and notifies the onBarCodeIsFilling callback if a read was in progress. */
	static Reset = function () {
		//console.error("ResetBarCode");
		window.barCodeReadTimer = clearTimeout(window.barCodeReadTimer);
		window.barCodeClearTimer = clearTimeout(window.barCodeClearTimer);
		window.barCode = "";
		if (window.barCodeIsFilling) {
			window.barCodeIsFilling = false;
			if (window.onBarCodeIsFilling != null) window.onBarCodeIsFilling();
		}
	}
	
	/** Window focus handler; re-enables scanner capture when the document becomes visible and notifies the activation callback.
	 * @param {FocusEvent} _ev    The focus event.
	 */
	static OnFocus = function (_ev) {
		window.barCodeIsActive = document.visibilityState == "visible";
		if (window.onBarCodeActivation != null) window.onBarCodeActivation();
		if (!window.barCodeIsActive) CodeScanners.Reset();
	}
	
	/** Window blur handler; disables scanner capture, notifies the activation callback, and resets the scanner state.
	 * @param {FocusEvent} _ev    The blur event.
	 */
	static OnBlur = function (_ev) {
		window.barCodeIsActive = false;
		if (window.onBarCodeActivation != null) window.onBarCodeActivation();
		if (!window.barCodeIsActive) CodeScanners.Reset();
	}
	
	/** Activates barcode scanner capture by installing the global window focus, blur, and keyboard event handlers. */
	static Activate = function () {
		window.barCodeGeneralIsActive = true;
		window.barCodeIsActive = document.visibilityState == "visible";
		window.onfocus = CodeScanners.OnFocus;
		window.onblur = CodeScanners.OnBlur;
		window.onkeypress = CodeScanners.OnKeyPress;
		window.onkeyup = CodeScanners.OnKeyUp;
		window.onkeydown = CodeScanners.OnKeyDown;
	}
	
	/** Deactivates barcode scanner capture by removing the global window focus, blur, and keyboard event handlers. */
	static Deactivate = function () {
		window.onfocus = null;
		window.onblur = null;
		window.onkeypress = null;
		window.onkeyup = null;
		window.onkeydown = null;
		window.barCodeGeneralIsActive = false;
		window.barCodeIsActive = false;
		
	}
	
}

//  -----------------------------------------------
//  PZN String Prototypes
//  -----------------------------------------------

/** String prototype extensions to extract and validate pharmaceutical registration numbers (PZN) from scanned codes.
 * @class String
 */

/** Checks whether the check digit of the PZN contained in this string is correct.
 * @returns {boolean}    True if the check digit is correct.
 */
String.prototype.PZNCheckDigitTest = function () {
	// input 8 digits pzn...
	// returns true or false whether check sum digit is correkt
	let pzn = this.valueOf()
	if ((typeof _pzn) == 'number') pzn = pzn.toString();
	if (pzn.length > 8) pzn = pzn.right(8);
	pzn = pzn.PreZero(8);
	let digit = pzn.substr(pzn.length - 1, 1);
	let sum = 0;
	for (i = 1; i < pzn.length; i++) sum += parseInt(pzn.substr(i - 1, 1), 10) * i;
	return !(sum % 11 != digit);
}


/** Check whether the given PPN is correct and contains a PZN.
 * @returns {string}    Returns an empty string on failed check or the found PZN.
 */
String.prototype.PPNPZN = function () {
	let pzn;
	let ppn = this.valueOf();
	if (ppn.substr(0, 2) != "11") return "";
	pzn = ppn.substr(2, 8);
	if (pzn.PZNCheckDigitTest()) return pzn;
	return "";
}

/** Check whether the given NTIN is correct and contains a PZN.
 * @returns {string}    Returns an empty string on failed check or the found PZN.
 */
String.prototype.NTINPZN = function () {
	let pzn;
	let ntin = this.valueOf();
	if (ntin.substr(0, 5) != "04150") return "";
	pzn = ntin.substr(5, 8);
	if (pzn.PZNCheckDigitTest()) return pzn;
	return "";
}

/** Builds a GS1 data string (with NTIN, expiration date, serial number, and lot number) from the given values.
 * @param {string} [_pzn=""]    8-digit PZN (leading zeros are added if shorter).
 * @param {string} [_sn=""]    Serial number.
 * @param {string} [_lot=""]    Lot (batch) number.
 * @param {string} [_exp=""]    Expiration date as "YYYY-MM" or "YYYY-MM-DD".
 * @returns {string}    The composed GS1 string with "{GS}" separators, or an empty string if no PZN was given.
 */
function GS1Creation(_pzn = "", _sn = "", _lot = "", _exp = "") {
	var ret = "", c = 0, t;
	/** Calculates the GS1 (mod 10) check digit for the given 8-digit PZN.
	 * @param {string} _pzn    8-digit PZN (leading zeros are added if shorter).
	 * @returns {string}    The calculated check digit.
	 */
	function _GS8CheckDigit(_pzn) {
		_pzn = _pzn.PreZero(8);
		for (i = 0;i < 8;i++) c += parseInt(_pzn.substr(i, 1), 10) * ((i % 2) == 0 ? 1 : 3);
		return ((c % 10) == 0 ? c % 10 : 10 - c % 10) + "";
	}
	_pzn += "";
	if (_pzn == "") return "";
	ret += "0104150" + _pzn.PreZero(8) + _GS8CheckDigit(_pzn);
	var x = "";
	if (_exp.length > 7) {
		// "2021-02-20"
		x = _exp.substr(2, 2) + _exp.substr(5, 2) + _exp.substr(8, 2);
	} else {
		// "2021-02"
		x = _exp.substr(2, 2) + _exp.substr(5, 2) + "00";
	};
	if (_exp != "") ret += "17" + x;
	if (_sn != "") ret += "21" + _sn + "{GS}";
	if (_lot != "") ret += "10" + _lot + "{GS}";
	t = ret.split("{GS}");
	if (t.length > 0) {
		if (t[t.length - 1] == "") {
			t.pop();
			ret = t.join("{GS}");
		}
	}
	return ret;
}

/** Decodes a GS1 data string into its application identifier fields (PZN, serial number, lot number, expiration date).
 * @param {string} _txt    The GS1 data string to decode.
 * @returns {object}    Object {pzn, sn, lot, exp, sub}; pzn is empty if no valid PZN was found, exp is given in ticks.
 */
function GS1Decode(_txt) {
	var ret = {pzn: "", sn: "", lot: "", exp: 0, sub: 0}, anyMultiple = false, ai, used = new Array(_txt.length), match, lastIndex, lastAi;
	
	
	var aids = {
		//ean: {ai: "01",reg: /01(\d{14})/g,var:false},
		pzn: {ai: "01", reg: /0104150(\d{8})\d{1}/, use: -1, matches: []},
		lot: { ai: "10", reg: /10([0-9A-Za-z\/\-\.\:\_\+\*\#]{1,20})/, use: -1, matches: []},
		sn: {ai: "21", reg: /21([\d\w]{1,20})/, use: -1, matches: []},
		exp: {ai: "17", reg: /17(\d{6})/, use: -1, matches: []},
		nhrn_DE: {ai: "710", reg: /710(\d{8})/, use: -1, matches: []},
		nhrn_FR: {ai: "711", reg: /711(\d{1,20})/, use: -1, matches: []},
		nhrn_ES: {ai: "712", reg: /712(\d{1,20})/, use: -1, matches: []},
		nhrn_PT: {ai: "714", reg: /714(\d{1,20})/, use: -1, matches: []},
		product_url: {ai: "8200", reg: /8200[^{]{1,70}/, use: -1, matches: []},
	};
	
	_txt = _txt.replace(/[\[]/gm, "{").replace(/[\]]/gm, "}");
	
	while (_txt.length > 0) {
		lastIndex = _txt.length + 1;
		lastAi = "";
		for (ai in aids) {
			if (aids[ai].use < 0) {
				match = _txt.match(aids[ai].reg);
				if (match != null) {
					if (match.index < lastIndex) {
						lastAi = ai;
						lastIndex = match.index;
						aids[ai].matches[0] = match;
					}
				}
			}
		}
		if (lastAi != "") {
			aids[lastAi].use = 0;
			_txt = _txt.substr(0, aids[lastAi].matches[0].index) + _txt.substr(aids[lastAi].matches[0].index + aids[lastAi].matches[0][0].length);
		} else {
			_txt = _txt.substr(1);
		}
	}
	
	// create return value if a valid pzn was found...
	if (aids.pzn.use >= 0) {
		ret.pzn = aids.pzn.matches[aids.pzn.use][1];
	} else if (aids.nhrn_DE.use >= 0) {
		ret.pzn = aids.nhrn_DE.matches[aids.nhrn_DE.use][1];
	}
	if (ret.pzn != "") {
		if (PZNCheckDigitTest(ret.pzn)) {
			if (aids.lot.use >= 0) ret.lot = aids.lot.matches[aids.lot.use][1];
			if (aids.sn.use >= 0) ret.sn = aids.sn.matches[aids.sn.use][1];
			if (aids.exp.use >= 0) {
				ret.exp = aids.exp.matches[aids.exp.use][1];
				if (ret.exp.substr(4, 2) == "00") {
					ret.exp = new Date(Date.UTC(parseInt("20" + ret.exp.substr(0, 2), 10), parseInt(ret.exp.substr(2, 2), 10) - 1, 1, 23, 59, 59));
					ret.exp = ret.exp.GetLastDayOfMonthUTCDate();
					ret.exp = ret.exp.Ticks();
				} else {
					ret.exp = new Date(Date.UTC(parseInt("20" + ret.exp.substr(0, 2), 10), parseInt(ret.exp.substr(2, 2), 10) - 1, parseInt(ret.exp.substr(4, 2), 10))).Ticks();
					ret.exp == ret.exp.Ticks();
				}
			}
		} else {
			ret.pzn = "";
		}
	}
	
	return ret;
}

/** Decodes an ASC MH10 data string into its data identifier fields (PZN, serial number, lot number, expiration date).
 * @param {string} _txt    The ASC data string to decode.
 * @returns {object}    Object {pzn, sn, lot, exp, sub}; pzn is empty if no valid PZN was found, exp is given in ticks.
 */
function ASCDecode(_txt) {
	var ret = {pzn: "", sn: "", lot: "", exp: 0, sub: 0}, anyMultiple = false, ai, used = new Array(_txt.length), match, lastIndex, lastAi;
	var aids = {
		pzn: {di: "9N", reg: /9N11(\d{8})/, use: -1, matches: []},
		lot: { ai: "1T", reg: /1T([0-9A-Za-z\/\-\.\:\_\+\*\#]{1,20})/, use: -1, matches: []},
		sn: { ai: "S", reg: /S([0-9A-Za-z]{1,20})/, use: -1, matches: []},
		exp: {ai: "D", reg: /D(\d{6})/, use: -1, matches: []},
		GTIN: {ai: "8P", reg: /8P(\d{14})/, use: -1, matches: []},
	};
	while (_txt.length > 0) {
		lastIndex = _txt.length + 1;
		lastAi = "";
		for (ai in aids) {
			match = _txt.match(aids[ai].reg);
			if (match != null) {
				if (match.index < lastIndex) {
					lastAi = ai;
					lastIndex = match.index;
					aids[ai].matches[0] = match;
				}
			}
		}
		if (lastAi != "") {
			aids[lastAi].use = 0;
			_txt = _txt.substr(0, aids[lastAi].matches[0].index) + _txt.substr(aids[lastAi].matches[0].index + aids[lastAi].matches[0][0].length);
		} else {
			_txt = _txt.substr(1);
		}
	}
	if (aids.pzn.use >= 0) {
		ret.pzn = aids.pzn.matches[aids.pzn.use][1];
	} else if (aids.GTIN.use >= 0) {
		ret.pzn = aids.GTIN.matches[aids.GTIN.use][1];
	}
	if (ret.pzn != "") {
		if (PZNCheckDigitTest(ret.pzn)) {
			if (aids.lot.use >= 0) ret.lot = aids.lot.matches[aids.lot.use][1];
			if (aids.sn.use >= 0) ret.sn = aids.sn.matches[aids.sn.use][1];
			if (aids.exp.use >= 0) {
				ret.exp = aids.exp.matches[aids.exp.use][1];
				if (ret.exp.substr(4, 2) == "00") {
					ret.exp = new Date(Date.UTC(parseInt("20" + ret.exp.substr(0, 2), 10), parseInt(ret.exp.substr(2, 2), 10) - 1, 1, 23, 59, 59));
					ret.exp = ret.exp.GetLastDayOfMonthUTCDate();
					ret.exp = ret.exp.Ticks();
				} else {
					ret.exp = new Date(Date.UTC(parseInt("20" + ret.exp.substr(0, 2), 10), parseInt(ret.exp.substr(2, 2), 10) - 1, parseInt(ret.exp.substr(4, 2), 10))).Ticks();
					ret.exp == ret.exp.Ticks();
				}
			}
		} else {
			ret.pzn = "";
		}
	}
	
	return ret;
}

/** Check whether the given IFA is correct and contains a PZN.
 * @returns {string}    Returns an empty string on failed check or the found PZN.
 */
String.prototype.IFAPZN = function () {
	let pzn;
	let ifa = this.valueOf();
	if (ifa.substr(0, 6) != "069N11") return "";
	pzn = ifa.substr(6, 8);
	if (pzn.PZNCheckDigitTest()) return pzn;
	return "";
}

/** Extracts the PZN from a GS1 data string by walking its application identifier segments.
 * @returns {string}    Returns an empty string on failed check or the found PZN.
 */
String.prototype.GS1PZN = function () {
	let pzn = "";
	let gs1 = this.valueOf().replace(/[\[]/, "{").replace(/[\]]/, "}");
	while (gs1.length > 0) {
		switch (gs1.substr(0, 2)) {
			case "01":
				// pzn
				if (gs1.substr(0, 7) == "0104150") {
					pzn = gs1.substr(7, 8);
					if (pzn.PZNCheckDigitTest()) return pzn;
				}
				_gs1 = gs1.substr(16);
				break;
			case "17":
				// expiration date
				gs1 = gs1.substr(8);
				break;
			case "21":
				// serialnumber
				gs1 = gs1.substr(18);
				break;
			case "10":
				// batch number
				gs1 = gs1.substr(11);
				break;
			case "71":
				// international codes
				switch (gs1.substr(2, 1)) {
					case "0":
						// Germany PZN
						gs1 = gs1.substr(11);
						break;
					case "1":
						// France PZN
						break;
					case "2":
						// Spain PZN
						break;
					case "4":
						// Portugal PZN
						break;
				}
				gs1 = gs1.substr(11);
				break;
			default:
				return "";
		}
	}
	return "";
}
// ===========================================
// Speech.js
// © 1996-2026 Meinolf Amekudzi
// (published under MIT license)
// ===========================================

/** Module to manage speech output.
 * @module Speech
 */

/** Static class for speech output.
 * @class Speech
 */

import './i18x.mjs';
import Config from "./Config.mjs";

export default class Speech {
	/** STATIC: The current SpeechSynthesisUtterance object, or null if nothing has been spoken yet.
	 * @static
	 * @type {SpeechSynthesisUtterance}
	 */
	static curSpeechOut = null;
	/** STATIC: The current retry timeout handle used while waiting for a running speech to be canceled.
	 * @static
	 * @type {number}
	 */
	static curSpeechTimeout = null;
	/** STATIC: Whether a new speech output interrupts a currently running speech output.
	 * @static
	 * @type {boolean}
	 */
	static DOSPEECHINTERRUPT = true;
	/** STATIC: Speaks the given text using the browser speech synthesis in the current language.
	 * Does nothing if speech or all audio is muted by configuration.
	 * @static
	 * @param {string} _text    The text to speak.
	 */
	static speak(_text) {
		if (Config.ALL_AUDIO_MUTE || Config.SPEECH_MUTE) return;
		if (Speech.DOSPEECHINTERRUPT) {
			if (speechSynthesis.speaking) {
				// Speechyn is currently speaking, cancel the current utterance(s)
				speechSynthesis.cancel();
				// Make sure we don't create more than one timeout...
				if (Speech.curSpeechTimeout !== null) clearTimeout(Speech.curSpeechTimeout);
				Speech.curSpeechTimeout = setTimeout(function () { Speech.speak(_text); }, 250);
				return;
			}
		}
		Speech.curSpeechOut = new SpeechSynthesisUtterance(_text);
		Speech.curSpeechOut.volume = Config.SPEECH_VOL;
		Speech.curSpeechOut.rate = 0.7;
		Speech.curSpeechOut.pitch = 1;
		Speech.curSpeechOut.lang = (i18x.curLid === undefined) ? "es-US" : i18x.curLid;
		speechSynthesis.speak(Speech.curSpeechOut);
	}
	
	//static setRatePitch(_rate){
	//}
	
	/** STATIC: Stops the currently running speech output, if any.
	 * @static
	 */
	static stop() {
		if (speechSynthesis.speaking) {
			// Speechyn is currently speaking, cancel the current utterance(s)
			speechSynthesis.cancel();
		}
	}
	
}
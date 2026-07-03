// ===========================================
// Musics.js
// © 1996-2026 Meinolf Amekudzi
// (published under MIT license)
// ===========================================

/** Module to manage music playing.
 * @module Musics
 */

/** Static class for music playing.
 * @class Musics
 */

import Config from "./Config.mjs";

export default class Musics {
	/** STATIC: The currently playing Audio object, or null if no music is playing.
	 * @static
	 * @type {Audio}
	 */
	static musicAudio = null;
	/** STATIC: The URL of the last played music.
	 * @static
	 * @type {string}
	 */
	static musicLastUrl = "";

	/** STATIC: Starts playing a music from the given URL, stopping any currently playing music first.
	 * Does nothing if music or all audio is muted by configuration.
	 * @static
	 * @param {string} _musicURL    The URL of the music to play.
	 * @param {boolean} _loop    Whether the music should be played in a loop.
	 */
	static play(_musicURL, _loop) {
		if (Musics.musicAudio != null) Musics.stop();
		if (Config.ALL_AUDIO_MUTE || Config.MUSIC_MUTE) return;
		Musics.musicLastUrl = _musicURL;
		Musics.musicAudio = new Audio(_musicURL);
		Musics.musicAudio.isStream = true;
		Musics.musicAudio.loop = _loop;
		Musics.musicAudio.preload = "none";
		Musics.musicAudio.volume = Config.MUSIC_MUTE ? 0.0 : Config.MUSIC_VOL;
		//musicAudio.fadeOutStartVolume=1.0;
		Musics.musicAudio.addEventListener('ended', function (_ev) { musicAudio = null; }, false);
		try {
			Musics.musicAudio.currentTime = 0;
			Musics.musicAudio.autoplay = true;
			//var playPromise=musicAudio.play();
		} catch (err) { musicAudio = null; }
		//_endCallback(true);
	}

	/** STATIC: Stops the currently playing music, if any.
	 * @static
	 */
	static stop() {
		if (Musics.musicAudio != null) {
			Musics.musicAudio.pause();
			Musics.musicAudio = null;
		}
	}

	/** STATIC: Applies the current volume and mute configuration to the playing music.
	 * @static
	 */
	static setupSetting() {
		//if(musicAudio==null)if(musicLastUrl!="")PlayGUIMusic(musicLastUrl);
		if (Musics.musicAudio != null) Musics.musicAudio.volume = (Config.ALL_AUDIO_MUTE || Config.MUSIC_MUTE) ? 0.0 : Config.MUSIC_VOL;
	}

	/** STATIC: Checks whether music is currently playing.
	 * @static
	 * @returns {boolean}    True, if music is currently playing.
	 */
	static isPlaying() {
		if (Musics.musicAudio == null) return false;
		return Musics.musicAudio.currentTime != 0;
	}
}
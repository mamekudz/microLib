// ===========================================
// MathAniUtils.js
// © 1996-2026 Meinolf Amekudzi
// (published under MIT license)
// ===========================================


/** Math extensions to handle animations.
 * @module MathAniUtils
 */

/** Math extensions to handle animations.
 * @class Math
 */

/** Returns a linear interpolated value.
 * Simple linear tweening - no easing, no acceleration.
 * @param {number} _t    The current time.
 * @param {number} _b    The start value.
 * @param {number} _c    The change in value.
 * @param {number} _d    The duration.
 * @returns {number}    The interpolated value.
 */
Math.linearTween = function (_t, _b, _c, _d) {
	// simple linear tweening - no easing, no acceleration
	return _c * _t / _d + _b;
}

/** Returns a quadratic ease-in interpolated value.
 * Quadratic easing in - accelerating from zero velocity.
 * @param {number} t    The current time.
 * @param {number} b    The start value.
 * @param {number} c    The change in value.
 * @param {number} d    The duration.
 * @returns {number}    The interpolated value.
 */
Math.easeInQuad = function (t, b, c, d) {
	// quadratic easing in - accelerating from zero velocity
	t /= d;
	return c * t * t + b;
}

/** Returns a quadratic ease-out interpolated value.
 * Quadratic easing out - decelerating to zero velocity.
 * @param {number} t    The current time.
 * @param {number} b    The start value.
 * @param {number} c    The change in value.
 * @param {number} d    The duration.
 * @returns {number}    The interpolated value.
 */
Math.easeOutQuad = function (t, b, c, d) {
	// quadratic easing out - decelerating to zero velocity
	t /= d;
	return -c * t * (t - 2) + b;
}

/** Returns a quadratic ease-in/out interpolated value.
 * Quadratic easing in/out - acceleration until halfway, then deceleration.
 * @param {number} t    The current time.
 * @param {number} b    The start value.
 * @param {number} c    The change in value.
 * @param {number} d    The duration.
 * @returns {number}    The interpolated value.
 */
Math.easeInOutQuad = function (t, b, c, d) {
	// quadratic easing in/out - acceleration until halfway, then deceleration
	t /= d / 2;
	if (t < 1) return c / 2 * t * t + b;
	t--;
	return -c / 2 * (t * (t - 2) - 1) + b;
}

/** Returns a cubic ease-in interpolated value.
 * Cubic easing in - accelerating from zero velocity.
 * @param {number} t    The current time.
 * @param {number} b    The start value.
 * @param {number} c    The change in value.
 * @param {number} d    The duration.
 * @returns {number}    The interpolated value.
 */
Math.easeInCubic = function (t, b, c, d) {
	// cubic easing in - accelerating from zero velocity
	t /= d;
	return c * t * t * t + b;
}

/** Returns a cubic ease-out interpolated value.
 * Cubic easing out - decelerating to zero velocity.
 * @param {number} t    The current time.
 * @param {number} b    The start value.
 * @param {number} c    The change in value.
 * @param {number} d    The duration.
 * @returns {number}    The interpolated value.
 */
Math.easeOutCubic = function (t, b, c, d) {
	//cubic easing out - decelerating to zero velocity
	t /= d;
	t--;
	return c * (t * t * t + 1) + b;
}

/** Returns a cubic ease-in/out interpolated value.
 * Cubic easing in/out - acceleration until halfway, then deceleration.
 * @param {number} t    The current time.
 * @param {number} b    The start value.
 * @param {number} c    The change in value.
 * @param {number} d    The duration.
 * @returns {number}    The interpolated value.
 */
Math.easeInOutCubic = function (t, b, c, d) {
	// cubic easing in/out - acceleration until halfway, then deceleration
	t /= d / 2;
	if (t < 1) return c / 2 * t * t * t + b;
	t -= 2;
	return c / 2 * (t * t * t + 2) + b;
}

/** Returns a quartic ease-in interpolated value.
 * Quartic easing in - accelerating from zero velocity.
 * @param {number} t    The current time.
 * @param {number} b    The start value.
 * @param {number} c    The change in value.
 * @param {number} d    The duration.
 * @returns {number}    The interpolated value.
 */
Math.easeInQuart = function (t, b, c, d) {
	// quartic easing in - accelerating from zero velocity
	t /= d;
	return c * t * t * t * t + b;
}

/** Returns a quartic ease-out interpolated value.
 * Quartic easing out - decelerating to zero velocity.
 * @param {number} t    The current time.
 * @param {number} b    The start value.
 * @param {number} c    The change in value.
 * @param {number} d    The duration.
 * @returns {number}    The interpolated value.
 */
Math.easeOutQuart = function (t, b, c, d) {
	// quartic easing out - decelerating to zero velocity
	t /= d;
	t--;
	return -c * (t * t * t * t - 1) + b;
}

/** Returns a quartic ease-in/out interpolated value.
 * Quartic easing in/out - acceleration until halfway, then deceleration.
 * @param {number} t    The current time.
 * @param {number} b    The start value.
 * @param {number} c    The change in value.
 * @param {number} d    The duration.
 * @returns {number}    The interpolated value.
 */
Math.easeInOutQuart = function (t, b, c, d) {
	// quartic easing in/out - acceleration until halfway, then deceleration
	t /= d / 2;
	if (t < 1) return c / 2 * t * t * t * t + b;
	t -= 2;
	return -c / 2 * (t * t * t * t - 2) + b;
}

/** Returns a quintic ease-in interpolated value.
 * Quintic easing in - accelerating from zero velocity.
 * @param {number} t    The current time.
 * @param {number} b    The start value.
 * @param {number} c    The change in value.
 * @param {number} d    The duration.
 * @returns {number}    The interpolated value.
 */
Math.easeInQuint = function (t, b, c, d) {
	// quintic easing in - accelerating from zero velocity
	t /= d;
	return c * t * t * t * t * t + b;
}

/** Returns a quintic ease-out interpolated value.
 * Quintic easing out - decelerating to zero velocity.
 * @param {number} t    The current time.
 * @param {number} b    The start value.
 * @param {number} c    The change in value.
 * @param {number} d    The duration.
 * @returns {number}    The interpolated value.
 */
Math.easeOutQuint = function (t, b, c, d) {
	// quintic easing out - decelerating to zero velocity	t/=d;
	t--;
	return c * (t * t * t * t * t + 1) + b;
}

/** Returns a quintic ease-in/out interpolated value.
 * Quintic easing in/out - acceleration until halfway, then deceleration.
 * @param {number} t    The current time.
 * @param {number} b    The start value.
 * @param {number} c    The change in value.
 * @param {number} d    The duration.
 * @returns {number}    The interpolated value.
 */
Math.easeInOutQuint = function (t, b, c, d) {
	// quintic easing in/out - acceleration until halfway, then deceleration
	t /= d / 2;
	if (t < 1) return c / 2 * t * t * t * t * t + b;
	t -= 2;
	return c / 2 * (t * t * t * t * t + 2) + b;
}

/** Returns a sinusoidal ease-in interpolated value.
 * Sinusoidal easing in - accelerating from zero velocity.
 * @param {number} t    The current time.
 * @param {number} b    The start value.
 * @param {number} c    The change in value.
 * @param {number} d    The duration.
 * @returns {number}    The interpolated value.
 */
Math.easeInSine = function (t, b, c, d) {
	// sinusoidal easing in - accelerating from zero velocity
	return -c * Math.cos(t / d * Math.PI05) + c + b;
}

/** Returns a sinusoidal ease-out interpolated value.
 * Sinusoidal easing out - decelerating to zero velocity.
 * @param {number} t    The current time.
 * @param {number} b    The start value.
 * @param {number} c    The change in value.
 * @param {number} d    The duration.
 * @returns {number}    The interpolated value.
 */
Math.easeOutSine = function (t, b, c, d) {
	// sinusoidal easing out - decelerating to zero velocity
	return c * Math.sin(t / d * Math.PI05) + b;
}

/** Returns a sinusoidal ease-in/out interpolated value.
 * Sinusoidal easing in/out - acceleration until halfway, then deceleration.
 * @param {number} t    The current time.
 * @param {number} b    The start value.
 * @param {number} c    The change in value.
 * @param {number} d    The duration.
 * @returns {number}    The interpolated value.
 */
Math.easeInOutSine = function (t, b, c, d) {
	// sinusoidal easing in/out - accelerating until halfway, then decelerating
	return -c / 2 * (Math.cos(2 * Math.PI * t / d) - 1) + b;
}

/** Returns an exponential ease-in interpolated value.
 * Exponential easing in - accelerating from zero velocity.
 * @param {number} t    The current time.
 * @param {number} b    The start value.
 * @param {number} c    The change in value.
 * @param {number} d    The duration.
 * @returns {number}    The interpolated value.
 */
Math.easeInExpo = function (t, b, c, d) {
	// exponential easing in - accelerating from zero velocity
	return c * Math.pow(2, 10 * (t / d - 1)) + b;
}

/** Returns an exponential ease-out interpolated value.
 * Exponential easing out - decelerating to zero velocity.
 * @param {number} t    The current time.
 * @param {number} b    The start value.
 * @param {number} c    The change in value.
 * @param {number} d    The duration.
 * @returns {number}    The interpolated value.
 */
Math.easeOutExpo = function (t, b, c, d) {
	// exponential easing out - decelerating to zero velocity
	return c * (-Math.pow(2, -10 * t / d) + 1) + b;
}

/** Returns an exponential ease-in/out interpolated value.
 * Exponential easing in/out - acceleration until halfway, then deceleration.
 * @param {number} t    The current time.
 * @param {number} b    The start value.
 * @param {number} c    The change in value.
 * @param {number} d    The duration.
 * @returns {number}    The interpolated value.
 */
Math.easeInOutExpo = function (t, b, c, d) {
	// exponential easing in/out - accelerating until halfway, then decelerating
	t /= d / 2;
	if (t < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
	t--;
	return c / 2 * (-Math.pow(2, -10 * t) + 2) + b;
}

/** Returns a circular ease-in interpolated value.
 * Circular easing in - accelerating from zero velocity.
 * @param {number} t    The current time.
 * @param {number} b    The start value.
 * @param {number} c    The change in value.
 * @param {number} d    The duration.
 * @returns {number}    The interpolated value.
 */
Math.easeInCirc = function (t, b, c, d) {
	// circular easing in - accelerating from zero velocity
	t /= d;
	return -c * (Math.sqrt(1 - t * t) - 1) + b;
}

/** Returns a circular ease-out interpolated value.
 * Circular easing out - decelerating to zero velocity.
 * @param {number} t    The current time.
 * @param {number} b    The start value.
 * @param {number} c    The change in value.
 * @param {number} d    The duration.
 * @returns {number}    The interpolated value.
 */
Math.easeOutCirc = function (t, b, c, d) {
	// circular easing out - decelerating to zero velocity
	t /= d;
	t--;
	return c * Math.sqrt(1 - t * t) + b;
}

/** Returns a circular ease-in/out interpolated value.
 * Circular easing in/out - acceleration until halfway, then deceleration.
 * @param {number} t    The current time.
 * @param {number} b    The start value.
 * @param {number} c    The change in value.
 * @param {number} d    The duration.
 * @returns {number}    The interpolated value.
 */
Math.easeInOutCirc = function (t, b, c, d) {
	// circular easing in/out - acceleration until halfway, then deceleration
	t /= d / 2;
	if (t < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
	t -= 2;
	return c / 2 * (Math.sqrt(1 - t * t) + 1) + b;
}

/** Animation mode constant: linear tweening (0). */
Math.ANILINEARTWEEN = 0;
/** Animation mode constant: quadratic ease-in (1). */
Math.ANIEASEINQUAD = 1;
/** Animation mode constant: quadratic ease-out (2). */
Math.ANIEASEOUTQUAD = 2;
/** Animation mode constant: quadratic ease-in/out (3). */
Math.ANIEASEINOUTQUAD = 3;
/** Animation mode constant: cubic ease-in (4). */
Math.ANIEASEINCUBIC = 4;
/** Animation mode constant: cubic ease-out (5). */
Math.ANIEASEOUTCUBIC = 5;
/** Animation mode constant: cubic ease-in/out (6). */
Math.ANIEASEINOUTCUBIC = 6;
/** Animation mode constant: quartic ease-in (7). */
Math.ANIANIEASEINQUART = 7;
/** Animation mode constant: quartic ease-out (8). */
Math.ANIEASEOUTQUART = 8;
/** Animation mode constant: quartic ease-in/out (9). */
Math.ANIEASEINOUTQUART = 9;
/** Animation mode constant: quintic ease-in (10). */
Math.ANIEASEINQUINT = 10;
/** Animation mode constant: quintic ease-out (11). */
Math.ANIEASEOUTQUINT = 11;
/** Animation mode constant: quintic ease-in/out (12). */
Math.ANIEASEINOUTQUINT = 12;
/** Animation mode constant: sinusoidal ease-in (13). */
Math.ANIEASEINSINE = 13;
/** Animation mode constant: sinusoidal ease-out (14). */
Math.ANIEASEOUTSINE = 14;
/** Animation mode constant: sinusoidal ease-in/out (15). */
Math.ANIEASEINOUTSINE = 15;
/** Animation mode constant: exponential ease-in (16). */
Math.ANIEASEINEXPO = 16;
/** Animation mode constant: exponential ease-out (17). */
Math.ANIEASEOUTEXPO = 17;
/** Animation mode constant: exponential ease-in/out (18). */
Math.ANIEASEINOUTEXPO = 18;
/** Animation mode constant: circular ease-in (19). */
Math.ANIEASEINCIRC = 19;
/** Animation mode constant: circular ease-out (20). */
Math.ANIEASEOUTCIRC = 20;
/** Animation mode constant: circular ease-in/out (21). */
Math.ANIEASEINOUTCIRC = 21;

/** Returns an interpolated value for a given time inside a time range, mapped to a value range using the given animation mode.
 * @param {number} _t    The current time (clamped to the time range).
 * @param {number} _mint    The start time of the animation.
 * @param {number} _maxt    The end time of the animation.
 * @param {number} _minv    The start value of the animation.
 * @param {number} _maxv    The end value of the animation.
 * @param {number} _mode    The animation mode, one of the Math.ANI* constants.
 * @returns {number}    The interpolated value between _minv and _maxv.
 */
Math.animate = function (_t, _mint, _maxt, _minv, _maxv, _mode) {
	if (_t < _mint) _t = _mint;
	if (_t > _maxt) _t = _maxt;
	switch (_mode) {
		case Math.ANILINEARTWEEN:
			return Math.linearTween(_t - _mint, 0, _maxv - _minv, _maxt - _mint) + _minv;
		case Math.ANIEASEINQUAD:
			return Math.easeInQuad(_t - _mint, 0, _maxv - _minv, _maxt - _mint) + _minv;
		case Math.ANIEASEOUTQUAD:
			return Math.easeOutQuad(_t - _mint, 0, _maxv - _minv, _maxt - _mint) + _minv;
		case Math.ANIEASEINOUTQUAD:
			return Math.easeInOutQuad(_t - _mint, 0, _maxv - _minv, _maxt - _mint) + _minv;
		case Math.ANIEASEINCUBIC:
			return Math.easeInCubic(_t - _mint, 0, _maxv - _minv, _maxt - _mint) + _minv;
		case Math.ANIEASEOUTCUBIC:
			return Math.easeOutCubic(_t - _mint, 0, _maxv - _minv, _maxt - _mint) + _minv;
		case Math.ANIEASEINOUTCUBIC:
			return Math.easeInOutCubic(_t - _mint, 0, _maxv - _minv, _maxt - _mint) + _minv;
		case Math.ANIANIEASEINQUART:
			return Math.easeInQuart(_t - _mint, 0, _maxv - _minv, _maxt - _mint) + _minv;
		case Math.ANIEASEOUTQUART:
			return Math.easeOutQuart(_t - _mint, 0, _maxv - _minv, _maxt - _mint) + _minv;
		case Math.ANIEASEINOUTQUART:
			return Math.easeInOutQuart(_t - _mint, 0, _maxv - _minv, _maxt - _mint) + _minv;
		case Math.ANIEASEINQUINT:
			return Math.easeInQuint(_t - _mint, 0, _maxv - _minv, _maxt - _mint) + _minv;
		case Math.ANIEASEOUTQUINT:
			return Math.easeOutQuint(_t - _mint, 0, _maxv - _minv, _maxt - _mint) + _minv;
		case Math.ANIEASEINOUTQUINT:
			return Math.easeInOutQuint(_t - _mint, 0, _maxv - _minv, _maxt - _mint) + _minv;
		case Math.ANIEASEINSINE:
			return Math.easeInSine(_t - _mint, 0, _maxv - _minv, _maxt - _mint) + _minv;
		case Math.ANIEASEOUTSINE:
			return Math.easeOutSine(_t - _mint, 0, _maxv - _minv, _maxt - _mint) + _minv;
		case Math.ANIEASEINOUTSINE:
			return Math.easeInOutSine(_t - _mint, 0, _maxv - _minv, _maxt - _mint) + _minv;
		case Math.ANIEASEINEXPO:
			return Math.easeInExpo(_t - _mint, 0, _maxv - _minv, _maxt - _mint) + _minv;
		case Math.ANIEASEOUTEXPO:
			return Math.easeOutExpo(_t - _mint, 0, _maxv - _minv, _maxt - _mint) + _minv;
		case Math.ANIEASEINOUTEXPO:
			return Math.easeInOutExpo(_t - _mint, 0, _maxv - _minv, _maxt - _mint) + _minv;
		case Math.ANIEASEINCIRC:
			return Math.easeInCirc(_t - _mint, 0, _maxv - _minv, _maxt - _mint) + _minv;
		case Math.ANIEASEOUTCIRC:
			return Math.easeOutCirc(_t - _mint, 0, _maxv - _minv, _maxt - _mint) + _minv;
		case Math.ANIEASEINOUTCIRC:
			return Math.easeInOutCirc(_t - _mint, 0, _maxv - _minv, _maxt - _mint) + _minv;
		default:
			return (_maxv - _minv) / 2 + _minv;
	}
}
// ===========================================
// DateUtils.js
// © 1996-2026 Meinolf Amekudzi
// (published under MIT license)
// ===========================================


/** Number and Date prototype extensions to handle date and time.
 * @module DateUtils
 */

/** Number prototype extensions to handle numbers of date.
 * @class Number
 */

/** Returns a Date object given by a ticks number.
 * @returns {Date}    Date of Ticks.
 */
Number.prototype.DateOfTicks = function () {
	let v = this.valueOf();
	if (v == 0) return new Date(0);
	var d = new Date((v - 621355968000000000) / 10000);
	return d;
};
/** Returns the .NET ticks of a number interpreted as milliseconds since 1970-01-01.
 * @returns {number}    Ticks of the millisecond value.
 */
Number.prototype.Ticks = function () {
	return this.valueOf() * 10000 + 621355968000000000;
};
/** Converts a .NET ticks number to milliseconds since 1970-01-01.
 * @returns {number}    Milliseconds since the Unix epoch, or 0 if the ticks value is 0.
 */
Number.prototype.TicksToMilliSeconds = function () {
	if (this.valueOf() == 0) return 0;
	return Math.floor((this.valueOf() - 621355968000000000) / 10000);
}


/** Date prototype extensions to handle date and time.
 * @class Date
 */

/** Number of ticks per day: 864000000000 */
Date.TICKS_PER_DAY = 864000000000;
/** Number of ticks per hour: 36000000000 */
Date.TICKS_PER_HOUR = 36000000000;
/** Number of ticks per minute: 600000000 */
Date.TICKS_PER_MINUTE = 600000000;
/** Number of ticks per second: 10000000 */
Date.TICKS_PER_SECOND = 10000000;
/** Number of ticks per millisecond: 10000 */
Date.TICKS_PER_MILLISECOND = 10000;
/** Number of ticks per µsec: 10 */
Date.TICKS_PER_MICROSECOND = 10;
/** Zero ticks (1900-01-01 00:00:00) */
Date.TICKS_ZERO = 0;
/** Number of ticks per week: 7*864000000000 */
Date.TICKS_PER_WEEK = 6048000000000;
/** Number of ticks per month: 30*864000000000 */
Date.TICKS_PER_MONTH = 25920000000000;


/** Returns the ticks of a Date object.
 * @returns {number}    Ticks of Date.
 */
Date.prototype.Ticks = function () {
	return this.getTime() * 10000 + 621355968000000000;
}

/** Sets the date and time of a Date object by a .NET ticks number.
 * @param {number} _ticks    Ticks to set the Date to.
 * @returns {Date}    This Date object for chaining.
 */
Date.prototype.SetTicks = function (_ticks) {
	this.setTime((_ticks - 621355968000000000) / 10000);
	return this;
}

/**
 * Converts a UTC date string to a local time string in the format YYYY-MM-DDTHH:mm
 * for the German time zone (handles daylight saving time automatically).
 * @param {string} utcDateString - The UTC date string to convert (e.g., '2024-09-16T10:12:00.000Z').
 * @returns {string} - The local time string in the format 'YYYY-MM-DDTHH:mm'.
 */
Date.prototype.ConvertUtcToLocal = function (utcDateString) {
	const date = new Date(utcDateString); // Convert the UTC string to a JavaScript Date object
	
	// Get the local time in the German time zone (UTC+2 during DST, otherwise UTC+1)
	const options = {
		timeZone: 'Europe/Berlin',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	};
	
	// Format the date in the desired format: YYYY-MM-DDTHH:mm
	const formatter = new Intl.DateTimeFormat('en-GB', options);
	const parts = formatter.formatToParts(date);
	
	// Extract the parts (year, month, day, hour, minute) and build the string
	const year = parts.find(part => part.type === 'year').value;
	const month = parts.find(part => part.type === 'month').value;
	const day = parts.find(part => part.type === 'day').value;
	const hour = parts.find(part => part.type === 'hour').value;
	const minute = parts.find(part => part.type === 'minute').value;
	
	return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Converts .NET ticks (the number value itself) to a human-readable local time string (German time zone).
 * @returns {string} - The local time string in the format 'YYYY-MM-DDTHH:mm'.
 */
Number.prototype.ConvertTicksToLocalTime = function () {
	// Convert ticks to Date object using existing dateOfTicks method
	const date = this.DateOfTicks();
	
	// Convert the date object to a local time string in the German time zone
	return date.ConvertUtcToLocal(date.toISOString());
}


/** Converts a .NET ticks number to a UTC date string in the format "YYYY-MM-DD".
 * @returns {string}    UTC date string of the ticks value.
 */
Number.prototype.Ticks2UTCDateStr = function () {
	const date = this.DateOfTicks();
	return date.getUTCFullYear().PadStart(4, '0') + "-" + (date.getUTCMonth()+1).PadStart(2, '0') + "-" + date.getUTCDate().PadStart(2, '0');
}


/** Converts a date/time string (e.g. "2016:02:15 19:08:20 +0000") or a numeric timestamp to .NET ticks.
 * Numeric values greater than 621355968000000000 are treated as ticks already, otherwise as a Unix timestamp.
 * @param {string|number} _date    Date/time string or numeric timestamp to convert.
 * @returns {number}    Ticks of the given date, or 0 on error.
 */
function dateTimeToTicks(_date) {
	// 2016:02:15 19:08:20 +0000"
	let e;
	try {
		if (isNaN(_date)) {
			let d = new Date(Date.UTC(_date.substr(0, 4), _date.substr(5, 2) - 1, _date.substr(8, 2), _date.substr(11, 2), _date.substr(14, 2), _date.substr(17, 2)));
			let ret = d.getTime();
			if (_date.length > 19) {
				ret += parseInt(_date.substr(20), 10) * 60 * 1000;
				//!!! minutes calculations
			}
			return ret * 10000 + 621355968000000000;
		} else {
			if (_date > 621355968000000000) {
				// are already .NET ticks...
				return _date;
			} else {
				// it's a unix timestamp...
				return ret * 10000 + 621355968000000000;
			}
		}
		
	} catch (e) {
		return 0;
	}
}

/** Returns the Unix timestamp (seconds since 1970-01-01) of a Date object.
 * @param {boolean} [_asFloat=false]    True to return the timestamp as a float with fractional seconds instead of rounding.
 * @returns {number}    Unix timestamp of Date.
 */
Date.prototype.Timestamp = function (_asFloat) {
	if (_asFloat === undefined) _asFloat = false;
	return ((_asFloat) ? this.getTime() / 1000 : Math.round(this.getTime() / 1000));
}

/** Returns the Unix timestamp of a Date object shifted by a time zone offset.
 * @param {number} [_timezone]    Time zone offset in seconds; defaults to the local time zone offset.
 * @returns {number}    Local Unix timestamp of Date.
 */
Date.prototype.LocalTimestamp = function (_timezone) {
	if (_timezone === undefined) _timezone = this.getTimezoneOffset() * 60;
	return Math.floor(this.getTime() / 1000) + _timezone;
}

/** Returns a new Date object shifted from GMT to local time by a minutes offset.
 * @param {number} [_timeMinutesOffsetToGMT]    Offset to GMT in minutes; defaults to the local time zone offset.
 * @returns {Date}    New Date object shifted to local time.
 */
Date.prototype.AsLocalTime = function (_timeMinutesOffsetToGMT) {
	var ret = new Date(this);
	if (_timeMinutesOffsetToGMT === undefined) _timeMinutesOffsetToGMT = this.getTimezoneOffset();
	ret.setTime(ret.getTime() - _timeMinutesOffsetToGMT * 60 * 1000);
	return ret;
}

/** Returns the UTC date of a Date object as a local Date set to 12:00 noon.
 * @returns {Date}    Local Date at noon of the UTC date.
 */
Date.prototype.UtcDateAsLocalDate = function () {
	return new Date(this.getUTCFullYear(), this.getUTCMonth(), this.getUTCDate(), 12, 0, 0);
}

/** Returns a new Date object set to the start of the day (00:00:00 local time) of this Date.
 * @returns {Date}    Start of day of Date.
 */
Date.prototype.StartOfDay = function () {
	return new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0);
}

/** Returns a new Date object shifted from GMT to local time by a minutes offset (same behavior as AsLocalTime).
 * @param {number} [_timeMinutesOffsetToGMT]    Offset to GMT in minutes; defaults to the local time zone offset.
 * @returns {Date}    New Date object shifted to local time.
 */
Date.prototype.ToLocalTime = function (_timeMinutesOffsetToGMT) {
	var ret = new Date(this);
	if (_timeMinutesOffsetToGMT === undefined) _timeMinutesOffsetToGMT = this.getTimezoneOffset();
	ret.setTime(ret.getTime() - _timeMinutesOffsetToGMT * 60 * 1000);
	return ret;
}

/** Returns the difference in milliseconds between another Date and this Date.
 * @param {Date} _from    Date to compare with.
 * @returns {number}    Milliseconds of _from minus milliseconds of this Date.
 */
Date.prototype.MillisecondsFrom = function (_from) {
	return _from.getTime() - this.getTime();
}

/** Writes this Date object to the console log, optionally prefixed by a text.
 * @param {string} [_txt]    Optional text logged in front of the Date.
 */
Date.prototype.Log = function (_txt) {
	if (_txt !== undefined) {
		console.Log(_txt, this);
	} else {
		console.Log(this);
	}
}

/** Sets the date and time of a Date object by a Unix timestamp.
 * @param {number} _unixTimestamp    Unix timestamp in seconds since 1970-01-01.
 * @returns {number}    Milliseconds since the Unix epoch as returned by setTime().
 */
Date.prototype.SetTimestamp = function (_unixTimestamp) {
	return this.setTime(_unixTimestamp * 1000);
}

/** Returns the Unix timestamp (seconds since 1970-01-01) built from the UTC components of a Date object.
 * Note: This definition overrides the previous Timestamp implementation above.
 * @returns {number}    Unix timestamp of Date.
 */
Date.prototype.Timestamp = function () {
	return Math.floor(Date.UTC(this.getUTCFullYear(), this.getUTCMonth(), this.getUTCDate(), this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds()) / 1000);
}

/** Returns the ISO 8601 week number of the year of a Date object.
 * @returns {number}    Week of year (1 to 53).
 */
Date.prototype.GetWeekOfYear = function () {
	let d = new Date(+this);
	d.setHours(0, 0, 0);
	d.setDate(d.getDate() + 4 - (d.getDay() || 7));
	return Math.ceil((((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
}

/** Returns the day number within the year of a Date object.
 * @returns {number}    Day of year (1 to 366).
 */
Date.prototype.GetDayOfYear = function () {
	let d = new Date(this.getFullYear(), 0, 0);
	return Math.floor((this - d) / 8.64e+7);
}

/** Returns a UTC Date of the last day of the month of this Date, keeping the UTC time of day.
 * @returns {Date}    UTC Date of the last day of the month.
 */
Date.prototype.GetLastDayOfMonthUTCDate = function () {
	let d = new Date(Date.UTC(this.getUTCFullYear(), this.getUTCMonth() + 1, 0, 0, 0));
	return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds()));
}

/** Returns the number of ticks elapsed from this Date up to now.
 * @returns {number}    Ticks between this Date and the current time.
 */
Date.prototype.GetUpToNowTicks = function () {
	//return this.Ticks() - Date.nowTicks();
	return Date.nowTicks() - this.Ticks();
}

//function now() {
//	return Math.round(new Date().getTime() / 1000);
//}

/** STATIC: Returns the current time in milliseconds since 1970-01-01.
 * @method nowTimestamp
 * @static
 * @returns {number}    Current time in milliseconds since the Unix epoch.
 */
Date.nowTimestamp = function () {
	return Date.now();
}

/** STATIC: Returns the current time as .NET ticks.
 * @method nowTicks
 * @static
 * @returns {number}    Current time in ticks.
 */
Date.nowTicks = function () {
	return Date.now().Ticks();
}

/** String prototype extensions to handle date and time strings.
 * @class String
 */

/** Converts a release date string in the format "YYYY-MM-DD HH:mm" to a Date object.
 * @returns {Date}    Date of the release date string (seconds set to 0).
 */
String.prototype.ReleaseDate2DateTime = function () {
	let d = this.valueOf();
	return new Date(d.substr(0, 4), d.substr(5, 2) - 1, d.substr(8, 2), d.substr(11, 2), d.substr(14, 2), 0);
}

/** Returns the year of a release date string in the format "YYYY-MM-DD HH:mm".
 * @returns {number}    Year of the release date string.
 */
String.prototype.ReleaseDateYear = function () {
	let d = this.valueOf();
	return parseInt(d.substr(0, 4), 10);
}

/** Converts an ISO date/time string to a German date-time string in the format "DD.MM.YYYY HH:mm" (local time).
 * @param {string} isoDateTimeString    ISO date/time string to convert.
 * @returns {string}    German formatted date-time string.
 */
export function convertToGermanDateTimeString(isoDateTimeString) {
	const date = new Date(isoDateTimeString); // Parse the ISO string to Date object
	
	// Convert to German date-time format
	const day = String(date.getDate()).PadStart(2, '0');
	const month = String(date.getMonth() + 1).PadStart(2, '0'); // Months are zero-based in JS
	const year = date.getFullYear();
	const hours = String(date.getHours()).PadStart(2, '0');
	const minutes = String(date.getMinutes()).PadStart(2, '0');
	
	return `${day}.${month}.${year} ${hours}:${minutes}`;
}

/** Calculates the date of Easter Sunday for a given year using the Gaussian Easter algorithm.
 * @param {number} year    Year to calculate Easter Sunday for.
 * @returns {Date}    UTC Date of Easter Sunday.
 */
export function calculateEaster(year) {
	const a = year % 19;
	const b = Math.floor(year / 100);
	const c = year % 100;
	const d = Math.floor(b / 4);
	const e = b % 4;
	const f = Math.floor((b + 8) / 25);
	const g = Math.floor((b - f + 1) / 3);
	const h = (19 * a + b - d - g + 15) % 30;
	const i = Math.floor(c / 4);
	const k = c % 4;
	const l = (32 + 2 * e + 2 * i - h - k) % 7;
	const m = Math.floor((a + 11 * h + 22 * l) / 451);
	const month = Math.floor((h + l - 7 * m + 114) / 31);
	const day = ((h + l - 7 * m + 114) % 31) + 1;
	
	return new Date(Date.UTC(year, month - 1, day));
}

/** Object of unix timestamps of holidays of each year.
 *  This object is updated by updateHolidaysOfYear function.
 */
export let holidays = {};

/** Returns the German holidays of a year as an object keyed by the ticks of each holiday date (UTC midnight).
 * Contains the fixed holidays and the movable holidays derived from Easter Sunday.
 * @param {number} _year    Year to get the holidays for.
 * @returns {Object}    Object mapping ticks to arrays of holiday info objects ({type, info}).
 */
export function getHolidaysOfYear(_year) {
	// List of fixed holidays
	let ret = {};
	ret[new Date(Date.UTC(_year, 1 - 1, 1)).Ticks()] = [{
		type: 2,
		info: "New Year's Day<context=\"holiday name\"/>".I18xRegister()
	}];
	ret[new Date(Date.UTC(_year, 1 - 1, 6)).Ticks()] = [{
		type: 2,
		info: "Holy Kings<context=\"holiday name\"/>".I18xRegister()
	}];
	ret[new Date(Date.UTC(_year, 5 - 1, 1)).Ticks()] = [{
		type: 2,
		info: "Labor Day<context=\"holiday name\"/>".I18xRegister()
	}];
	ret[new Date(Date.UTC(_year, 10 - 1, 3)).Ticks()] = [{
		type: 2,
		info: "German Unity Day<context=\"holiday name\"/>".I18xRegister()
	}];
	ret[new Date(Date.UTC(_year, 11 - 1, 1)).Ticks()] = [{
		type: 2,
		info: "All Saints Day<context=\"holiday name\"/>".I18xRegister()
	}];
	ret[new Date(Date.UTC(_year, 12 - 1, 25)).Ticks()] = [{
		type: 2,
		info: "Christmas Day<context=\"holiday name\"/>".I18xRegister()
	}];
	ret[new Date(Date.UTC(_year, 12 - 1, 26)).Ticks()] = [{
		type: 2,
		info: "Boxing Day<context=\"holiday name\"/>".I18xRegister()
	}];
	
	// Calculate Easter Sunday for the current year
	const easterDate = calculateEaster(_year);
	ret[easterDate.Ticks()] = [{type: 2, info: "Easter Sunday<context=\"holiday name\"/>".I18xRegister()}];
	
	// Good Friday (2 days before Easter)
	const goodFriday = new Date(easterDate);
	goodFriday.setDate(easterDate.getDate() - 2);
	ret[goodFriday.Ticks()] = [{type: 2, info: "Good Friday<context=\"holiday name\"/>".I18xRegister()}];
	
	// Easter Monday (1 day after Easter)
	const easterMonday = new Date(easterDate);
	easterMonday.setDate(easterDate.getDate() + 1);
	ret[easterMonday.Ticks()] = [{type: 2, info: "Easter Monday<context=\"holiday name\"/>".I18xRegister()}];
	
	// Ascension Day (39 days after Easter)
	const ascensionDay = new Date(easterDate);
	ascensionDay.setDate(easterDate.getDate() + 39);
	ret[ascensionDay.Ticks()] = [{type: 2, info: "Ascension Day<context=\"holiday name\"/>".I18xRegister()}];
	
	// Pentecost Sunday (49 days after Easter)
	const pentecostSunday = new Date(easterDate);
	pentecostSunday.setDate(easterDate.getDate() + 49);
	ret[pentecostSunday.Ticks()] = [{type: 2, info: "Pentecost Sunday<context=\"holiday name\"/>".I18xRegister()}];
	
	// Pentecost Monday (50 days after Easter)
	const pentecostMonday = new Date(easterDate);
	pentecostMonday.setDate(easterDate.getDate() + 50);
	ret[pentecostMonday.Ticks()] = [{type: 2, info: "Pentecost Monday<context=\"holiday name\"/>".I18xRegister()}];
	
	// Corpus Christi (60 days after Easter)
	const corpusChristi = new Date(easterDate);
	corpusChristi.setDate(easterDate.getDate() + 60);
	ret[corpusChristi.Ticks()] = [{type: 2, info: "Corpus Christi<context=\"holiday name\"/>".I18xRegister()}];
	
	return ret;
}

/** Adds the holidays of a year to the holidays cache object if not already present.
 * @param {number} _year    Year to update the holidays cache for.
 * @returns {string}    Always an empty string.
 */
export function updateHolidaysOfYear(_year) {
	if (!holidays.hasOwnProperty(_year)) {
		holidays[_year] = getHolidaysOfYear(_year);
	}
	return "";
}

/** Returns the holiday info entries for this Date (matched by ticks at UTC midnight).
 * @returns {Array}    Array of holiday info objects, or an empty array if this Date is not a holiday.
 */
Date.prototype.GetHoliday = function () {
	let y = this.getFullYear(), t = this.Ticks();
	updateHolidaysOfYear(y);
	if (holidays[y].hasOwnProperty(t)) {
		return holidays[y][t];
	}
	return [];
}
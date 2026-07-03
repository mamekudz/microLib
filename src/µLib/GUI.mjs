//	===============================================
//	GUI.mjs
// © 1996-2026 Meinolf Amekudzi
// (published under MIT license)
// ===========================================

// * TO DO:
// * Curve Input: Undo/ReUndo
// * FullScreen: border:none padding:0px

/** Browser GUI framework: menus, dockable panels, tab views, tool bars, tree views,
 * panel containers, the central GUI controller and a large set of static input/form helpers.
 * @module GUI
 */

import i18x, { i18xExpression } from './i18x.mjs';
import System from './System.mjs';
import Users from './Users.mjs';
import Config from './Config.mjs';
import Sounds from './Sounds.mjs';
import ObjectUtils from './ObjectUtils.mjs';
// Side-effect imports (prototype extensions used below)
import './StringUtils.mjs';
import './NumberUtils.mjs';
import './MathUtils.mjs';
import './ArrayUtils.mjs';
import './BooleanUtils.mjs';
import './StorageUtils.mjs';

// ===========================================
// EXTERNAL LEGACY HELPERS
// Not yet ported to µLib modules. They are resolved lazily from
// globalThis at call time (provided by the legacy µlib bundle until
// their own modules exist).
// ===========================================
/** Lazy wrapper for the legacy global ButtonAttributes() helper (button event attribute string). */
const ButtonAttributes = (..._args) => globalThis.ButtonAttributes(..._args);
/** Lazy wrapper for the legacy global ButtonAttributesToElement() helper (applies button events to a DOM element). */
const ButtonAttributesToElement = (..._args) => globalThis.ButtonAttributesToElement(..._args);
/** Lazy wrapper for the legacy global SetOuterHTML() helper (replaces an element's outerHTML). */
const SetOuterHTML = (..._args) => globalThis.SetOuterHTML(..._args);
/** Lazy wrapper for the legacy global AbsPositionOfElement() helper (absolute page position of an element). */
const AbsPositionOfElement = (..._args) => globalThis.AbsPositionOfElement(..._args);
/** Lazy wrapper for the legacy global GetCSSPropertyOfClass() helper (reads a CSS property of a class rule). */
const GetCSSPropertyOfClass = (..._args) => globalThis.GetCSSPropertyOfClass(..._args);
/** Lazy wrapper for the legacy global ImgLoadHTML() helper (image tag HTML with load handling). */
const ImgLoadHTML = (..._args) => globalThis.ImgLoadHTML(..._args);
/** Lazy wrapper for the legacy global AutoSmartScrollHTMLOnLoadJS() helper (onload JS for auto smart scroll areas). */
const AutoSmartScrollHTMLOnLoadJS = (..._args) => globalThis.AutoSmartScrollHTMLOnLoadJS(..._args);
/** Lazy wrapper for the legacy global AlienPolicy() helper (external content policy check). */
const AlienPolicy = (..._args) => globalThis.AlienPolicy(..._args);
/** Lazy factory for the legacy global SmartScroll class (custom scroll bar handling).
 * @returns {Object} New SmartScroll instance.
 */
function SmartScroll(..._args) { return new globalThis.SmartScroll(..._args); }

// ===========================================
// MODULE LOCAL HELPERS & CONSTANTS
// (replacements for former global-script helpers)
// ===========================================
/** No-operation function used as a default/placeholder callback. */
const NOFUNCTION = function () { };

/** String constant "undefined" for typeof comparisons. */
const UNDEFINED = "undefined";

/** Returns a new object containing the properties of both given objects (_o2 wins on conflicts).
 * @param {Object} _o1 First source object.
 * @param {Object} _o2 Second source object (its properties win on conflicts).
 * @returns {Object} New merged object.
 */
function ObjMerge(_o1, _o2) {
	let a, ret = {};
	for (a in _o1) ret[a] = _o1[a];
	for (a in _o2) ret[a] = _o2[a];
	return ret;
}

/** Current skin name used to build image URLs (./skins/<SKIN>/imgs/...). */
const SKIN = (typeof globalThis.SKIN === 'string') ? globalThis.SKIN : 'std';

/** Regular expression to validate e-mail addresses. */
const REGEX_EMAIL = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
/** Regular expression to validate IPv4 and IPv6 addresses. */
const REGEX_IPV46 = new RegExp("((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))");
/** Regular expression to validate domain names. */
const REGEX_DOMAIN = new RegExp("^((?!-))(xn--)?[a-z0-9][a-z0-9-_]{0,61}[a-z0-9]{0,1}\.(xn--)?([a-z0-9\-]{1,61}|[a-z0-9-]{1,30}\.[a-z]{2,})$");

/** Current Unix timestamp in milliseconds. */
function NOW_TIMESTAMP() {
	return Date.now();
}

/** Plays a GUI control sound via the Sounds module (former global PlaySound()). */
function PlaySound(_soundName, _vol = undefined) {
	if (Config.ALL_AUDIO_MUTE || Config.SOUND_CONTROL_MUTE) return null;
	return Sounds.play(_soundName, _vol === undefined ? Config.SOUND_CONTROL_VOL : _vol);
}

/** Running counter used to generate consecutive enum values for static class constants. */
let ENUMERATOR = 0;

/** DOM element (id "effectlayer") that hosts particle effect divs. */
let EFFECTLAYER = document.getElementById("effectlayer");
// ========================
// TABVIEWS
// ========================
// TabView
/** Running id counter for generated TabView ids. */
let CREATETABVIEWID = 0;
// ====================================
// PANEL CONTAINERS
// ====================================
/** Running id counter for generated PanelContainer ids. */
let panelIdCounter = 0;
// ====================================
// GUI
// ====================================
/** Registry of all created GUI instances by id. */
let GUIS = {};
/** Currently active GUI instance and the previously active one. */
let curGUI = null, lastGUI = null;


/** Wraps every character of a text in its own div for distributed (spread) text rendering.
 * @param {string} _text Text to distribute.
 * @returns {string} HTML string with one div per character.
 */
function DisributeText(_text) {
	var i, ret = '<div class="disttext">';
	for (i = 0; i < _text.length; i++) {
		ret += '<div class="char">' + _text[i].HtmlEntities() + '</div>';
	};
	ret += '</div>';
	return ret;
}

/** Window resize handler: resizes the current GUI and notifies all visible panels via their event handlers.
 * @param {Event} _ev Resize event.
 * @param {boolean} [_callAfterWSEvent=false] Also fire EVENTTYPE_AFTERWORKSPACECHANGE on each panel.
 */
function ResizeViewPort(_ev, _callAfterWSEvent = false) {
	var p, pp, o;
	// shit ie...
	//if(curGUI!==undefined)return;

	if (curGUI != null) {
		curGUI.Resize();
		if (curGUI.extraResizeEvent != null) curGUI.extraResizeEvent(_ev);
		var pp;
		for (pp in curGUI.panels) {
			p = curGUI.panels[pp];
			if (p.visible) {
				if (!p.isFolded) {
					if (p.type <= Panel.TYPE_PALETTE) {
						o = document.getElementById("panel_" + p.id);
						//if(o)o.style.maxHeight=o.parentElement.clientHeight+"px";
					};
				};
				if (p.eventHandler != null) {
					p.eventHandler({ type: Panel.EVENTTYPE_SIZECHANGED, panel: p });
					if (_callAfterWSEvent) p.eventHandler({ type: Panel.EVENTTYPE_AFTERWORKSPACECHANGE, panel: p });
				};
			};
		};
		if (curGUI.modalPanel != null) {
			p = curGUI.modalPanel;
			p.eventHandler({ type: Panel.EVENTTYPE_SIZECHANGED, panel: p });
			if (_callAfterWSEvent) p.eventHandler({ type: Panel.EVENTTYPE_AFTERWORKSPACECHANGE, panel: p });
		};
	};
}

/** Moves the next sibling of the given element into the page header element (id "pageHeader").
 * @param {HTMLElement} _this Element whose next sibling is moved.
 */
function MoveSC(_this) {
	var o = document.getElementById("pageHeader");
	if (o) o.appendChild(_this.nextSibling);
}

/** Data holder for a queued modal panel request (type, title, text, buttons, handler, progress range).
 * @param {number} _type Modal type (one of GUI.MODALTYPE_*).
 * @param {Object} _opts Options: title, text, buttons, eventHandler, minValue, maxValue.
 */
function GUIModalPanelData(_type, _opts) {
	this.type = _type;
	this.title = _opts.title;
	this.text = _opts.text;
	this.buttons = _opts.buttons;
	this.eventHandler = _opts.eventHandler;
	this.minValue = _opts.minValue;
	this.maxValue = _opts.maxValue;
}


// ===================
// PARTICLES
// ===================
/** Pool-based CSS animation particle effect emitter rendered on the global effect layer.
 * @class GUIParticles
 */
export class GUIParticles {
	/** Creates a particle pool with the given CSS class and parameters.
	 * @param {string} _particleClassName CSS class of a single particle div (defines the animation).
	 * @param {Object} _params Options: runMode, maxNoOfParticles, minDuration, maxDuration, minRadius, maxRadius.
	 */
	constructor(_particleClassName, _params) {
		this.divs = [];
		this.particleClassName = _particleClassName;
		this.runMode = _params.hasOwnProperty("runMode") ? _params.runMode : GUIParticles.RUNMODE_RNDRADIAL;
		this.maxNoOfParticles = _params.hasOwnProperty("maxNoOfParticles") ? _params.maxNoOfParticles : 20;
		this.minDuration = _params.hasOwnProperty("minDuration") ? _params.minDuration : -1;
		this.maxDuration = _params.hasOwnProperty("maxDuration") ? _params.maxDuration : -1;
		this.minRadius = Math.sqrt(_params.hasOwnProperty("minRadius") ? _params.minRadius : 10);
		this.maxRadius = Math.sqrt(_params.hasOwnProperty("maxRadius") ? _params.maxRadius : 80);

		this.Init = function () {
			var i, o;
			for (i = 0; i < this.maxNoOfParticles; i++) {
				o = document.createElement("div");
				o.className = this.particleClassName + " hidden";
				o.dataset.no = i;
				o.dataset.particleClassName = this.particleClassName;
				o.dataset.used = 0;
				o.addEventListener("animationend", GUIParticles.AnimationEnd, { capture: false, passive: false });
				this.divs.push(o);
			};
		};
		this.Init();
	}

	static { ENUMERATOR = 0; }
	/** Run mode: emit the particle exactly at the event position. */
	static RUNMODE_POINT = ENUMERATOR++;
	/** Run mode: emit the particle at a random radial offset around the event position. */
	static RUNMODE_RNDRADIAL = ENUMERATOR++;
	/** animationend handler: hides the particle, marks it unused and removes it from the effect layer.
	 * @param {AnimationEvent} _ev Animation end event.
	 */
	static AnimationEnd(_ev) {
		var o = _ev.target, b = EFFECTLAYER;
		o.className = o.dataset.particleClassName + " hidden";
		o.dataset.used = 0;
		b.removeChild(o);
	}

	/** Emits one free particle of the pool at the position of the given mouse event.
	 * @param {MouseEvent} _ev Mouse event providing pageX/pageY.
	 */
	Run(_ev) {
		var i, l = this.divs.length, o = null, b = EFFECTLAYER;
		for (i = 0; i < l; i++)if (this.divs[i].dataset.used == 0) { o = this.divs[i]; break; };
		if (o != null) {
			b.appendChild(o);
			o.dataset.used = 1;
			switch (this.runMode) {
				case GUIParticles.RUNMODE_POINT:
					o.style.top = _ev.pageY + "px";
					o.style.left = _ev.pageX + "px";
					if (this.minDuration != -1) o.style.animationDuration = Math.minMaxFloatRandom(this.minDuration, this.maxDuration) + "s";
					break;
				case GUIParticles.RUNMODE_RNDRADIAL:
					i = Math.minMaxFloatRandom(0, Math.PI2);
					l = Math.minMaxFloatRandom(this.minRadius, this.maxRadius);
					l = l * l;
					if (this.minDuration != -1) o.style.animationDuration = Math.minMaxFloatRandom(this.minDuration, this.maxDuration) + "s";
					o.style.top = (_ev.pageY + Math.sin(i) * l) + "px";
					o.style.left = (_ev.pageX + Math.cos(i) * l) + "px";
					break;
			};
			o.className = this.particleClassName;
		};
	}

}

// ====================================
// MENUS
// ====================================
/** Hierarchical menu entry (top level, drop-down, side menu) with key shortcut, toggle state and click handling.
 * @class Menu
 */
export class Menu {
	/** Creates a menu entry; omitting the title creates a separator.
	 * @param {string} _id Menu id (unique within its GUI).
	 * @param {string} [_title] Title (i18x key); undefined creates a TYPE_SEPARATION entry.
	 * @param {number} [_key=0] Key shortcut code (GUI.KEY combination), 0 for none.
	 * @param {?function} [_func=null] Click handler, called with the menu instance.
	 * @param {number} [_type=Menu.TYPE_FUNC] Menu type (one of Menu.TYPE_*).
	 * @param {string} [_iconClass=""] CSS class of the menu icon.
	 */
	constructor(_id, _title, _key, _func, _type, _iconClass) {
		if (_title === undefined) {
			_title = "";
			_type = Menu.TYPE_SEPARATION;
		};
		if (_key === undefined) _key = 0x0000;
		if (_type === undefined) _type = Menu.TYPE_FUNC;
		if (_iconClass === undefined) _iconClass = "";
		if (_func === undefined) _func = null;
		this.gui = null;
		this.parentMenu = null;
		this.id = _id;
		this.level = -1;
		this.iconClass = _iconClass;
		this.title = _title;
		this.titlePlaceholders = {};
		this.type = _type;
		this.visible = true;
		this.enabled = true;
		this.toggle = false;
		this.doAutoToggle = true;
		this.key = _key;
		this.func = _func;
		this.subs = null;
	}

	static { ENUMERATOR = 0; }
	/** Menu type: plain function entry. */
	static TYPE_FUNC = ENUMERATOR++;
	/** Menu type: toggle entry with check mark/icon state. */
	static TYPE_TOGGLE = ENUMERATOR++;
	/** Menu type: separator line. */
	static TYPE_SEPARATION = ENUMERATOR++;
	/** Invokes the menu function if enabled and visible; toggles state for TYPE_TOGGLE entries.
	 * @returns {boolean} True if the menu had a function and was enabled and visible.
	 */
	Call() {
		var oldtog, o;
		//log("Call");
		if (this.func != null && this.enabled && this.visible) {
			if (this.type == Menu.TYPE_TOGGLE) {
				oldtog = this.toggle;
				//log("Call1",this.toggle);
				if (this.doAutoToggle) this.toggle = !this.toggle;
				//log("Call2",this.toggle,this.func);
				this.func(this);
				if (oldtog != this.toggle) {
					o = document.getElementById("menuicon_" + this.id);
					if (this.iconClass == "") {
						o.innerHTML = (this.toggle ? '•' : '');
					} else {
						o.className = o.className.boolClass("notsel", !this.toggle);
					};
				};
			} else {
				setTimeout(this.func, 10, this);
				//this.func(this);
			};
		};
		return this.func != null && this.enabled && this.visible;
	}

	/** Adds a sub menu entry to this menu.
	 * @param {Menu} _menu Sub menu to add.
	 * @returns {Menu} The added menu (for chaining).
	 */
	Add(_menu) {
		if (this.subs == null) this.subs = [];
		this.subs.push(_menu);
		return _menu;
	}

	/** Removes all sub menus of this menu and clears their DOM container.
	 * @param {Menu} _menu Unused.
	 */
	RemoveSubMenus(_menu) {
		var o;
		this.subs = null;
		o = document.getElementById(this.fullId);
		if (o) o.innerHTML = "";
	}

	/** Finds a menu of the current GUI by its short id.
	 * @param {string} _menuId Menu id (without "menu_<guiId>_" prefix).
	 * @returns {?Menu} Found menu or null if no GUI is active.
	 */
	static Find(_menuId) {
		if (curGUI != null) {
			return curGUI.menus['menu_' + curGUI.id + "_" + _menuId];
		} else {
			return null;
		};
	}

	/** True while a top-level menu has been activated by mouse down (enables hover-open of siblings). */
	static GeneralActiveByMouseDown = false;
	/** Currently open drop-down menu div (to hide it when another menu opens). */
	static lastVisibleMenuDiv = null;
	/** Mouse up handler on a menu entry: calls the menu function and closes the open drop-down.
	 * @param {MouseEvent} _ev Mouse event.
	 * @param {string} _fullId Full menu element id ("menu_<guiId>_<menuId>").
	 */
	static OnMouseUp(_ev, _fullId) {
		var gui, menu, comp = _fullId.split("_"), div = document.getElementById(_fullId), subdiv = document.getElementById(_fullId + "_submenus");
		//Menu.GeneralActiveByMouseDown=false;
		//log("Menu.OnMouseUp",comp);
		PlaySound("button_up");
		gui = GUIS[comp[1]];
		menu = gui.menus[_fullId];
		//log("OnMouseUp",comp,menu.level,Menu.GeneralActiveByMouseDown);
		menu.Call();
		if (!subdiv) {
			_fullId = 'menu_' + menu.gui.id + "_" + menu.parentMenu.id;
			subdiv = document.getElementById(_fullId + "_submenus");
		};
		if (subdiv) {
			if (Menu.lastVisibleMenuDiv != null) Menu.lastVisibleMenuDiv.className = Menu.lastVisibleMenuDiv.className.addClass("hidden");
			Menu.lastVisibleMenuDiv = null;
			subdiv.className = subdiv.className.addClass("hidden");
		};
	}

	/** True while the pointer hovers a function-less (dummy) menu entry. */
	static GeneralDummyMouseOver = false;
	/** Mouse over handler for menu entries without a function; keeps the drop-down open.
	 * @param {MouseEvent} _ev Mouse event.
	 */
	static OnDummyMouseOver(_ev) {
		//Menu.GeneralActiveByMouseDown=false;
		//log("OnDummyMouseOver",Menu.GeneralActiveByMouseDown);
		PlaySound("button_up");
		Menu.GeneralDummyMouseOver = true;
	}

	/** Mouse over handler: opens the entry's sub menu when hover-open is active.
	 * @param {MouseEvent} _ev Mouse event.
	 * @param {string} _fullId Full menu element id.
	 */
	static OnMouseOver(_ev, _fullId) {
		var gui, menu, comp = _fullId.split("_"), div = document.getElementById(_fullId), subdiv = document.getElementById(_fullId + "_submenus");
		Menu.GeneralDummyMouseOver = false;
		gui = GUIS[comp[1]];
		menu = gui.menus[_fullId];
		//log("OnMouseOver",comp,menu.level,Menu.GeneralActiveByMouseDown);
		if (subdiv) if (menu.level > 1 || Menu.GeneralActiveByMouseDown) {
			if (Menu.lastVisibleMenuDiv != null) Menu.lastVisibleMenuDiv.className = Menu.lastVisibleMenuDiv.className.addClass("hidden");
			Menu.lastVisibleMenuDiv = subdiv;
			subdiv.className = subdiv.className.removeClass("hidden");
		};
	}

	/** Mouse down handler: toggles the entry's drop-down/sub menu visibility.
	 * @param {MouseEvent} _ev Mouse event.
	 * @param {string} _fullId Full menu element id.
	 */
	static OnMouseDown(_ev, _fullId) {
		var gui, menu, comp = _fullId.split("_"), parentMenu, div = document.getElementById(_fullId), subdiv = document.getElementById(_fullId + "_submenus");
		Menu.GeneralDummyMouseOver = false;
		PlaySound("button_down");
		if (System.IS_SAFARI) _ev.buttons = _ev.which;
		if ((_ev.buttons & 1) == 0) return;
		gui = GUIS[comp[1]];
		menu = gui.menus[_fullId];
		parentMenu = gui.menus[_ev.target.parentNode.id];
		//log("Menu.OnMouseDown",comp);
		if (menu.level == 1) Menu.GeneralActiveByMouseDown = true;
		//log("OnMouseDown",comp,menu.level,Menu.GeneralActiveByMouseDown);
		if (subdiv) {
			if (subdiv.className.hasClass("hidden")) {
				if (Menu.lastVisibleMenuDiv != null) Menu.lastVisibleMenuDiv.className = Menu.lastVisibleMenuDiv.className.addClass("hidden");
				Menu.lastVisibleMenuDiv = subdiv;
				subdiv.className = subdiv.className.removeClass("hidden");
			} else if (parentMenu !== undefined) {
				if (parentMenu.id == menu.id) {
					if (Menu.lastVisibleMenuDiv != null) Menu.lastVisibleMenuDiv.className = Menu.lastVisibleMenuDiv.className.addClass("hidden");
					Menu.lastVisibleMenuDiv = null;
					subdiv.className = subdiv.className.addClass("hidden");
				};
			};
		};
	}

	/** Mouse leave handler: closes the entry's drop-down unless a dummy entry is hovered.
	 * @param {MouseEvent} _ev Mouse event.
	 * @param {string} _fullId Full menu element id.
	 */
	static OnMouseLeave(_ev, _fullId) {
		var gui, menu, comp = _fullId.split("_"), div = document.getElementById(_fullId), subdiv = document.getElementById(_fullId + "_submenus");
		gui = GUIS[comp[1]];
		menu = gui.menus[_fullId];
		//log("OnMouseLeave",menu.level,Menu.GeneralActiveByMouseDown);
		Menu.GeneralActiveByMouseDown = false;
		if (menu.level > 1) Menu.GeneralActiveByMouseDown = false;
		if (!Menu.GeneralDummyMouseOver) if (subdiv) {
			if (Menu.lastVisibleMenuDiv != null) Menu.lastVisibleMenuDiv.className = Menu.lastVisibleMenuDiv.className.addClass("hidden");
			Menu.lastVisibleMenuDiv = null;
			subdiv.className = subdiv.className.addClass("hidden");
		};
		Menu.GeneralDummyMouseOver = false;
	}

	/** Recursively links menus whose function is Panel.MenuHandler to their panel (panel.menu).
	 * @param {GUI} _gui GUI whose panels are referenced.
	 */
	SetUpPanelMenuReferences(_gui) {
		var pi = this.id.split("_"), i;
		if (this.func == Panel.MenuHandler) {
			this.doAutoToggle = true;
			if (_gui.panels[pi[1]]) {
				_gui.panels[pi[1]].menu = this;
			};
		};
		if (this.subs != null) for (i = 0; i < this.subs.length; i++)this.subs[i].SetUpPanelMenuReferences(_gui);
	}

	/** Builds the HTML of this menu entry and its sub menus for the given nesting level.
	 * @param {number} _level Nesting level (0=root container, 1=main menu, 2=drop-down, 3=side menu).
	 * @param {GUI} _gui Owning GUI.
	 * @param {?Menu} _parentMenu Parent menu entry.
	 * @returns {string} HTML string of the menu entry.
	 */
	HTML(_level, _gui, _parentMenu) {
		var h = "", i, l, attrStr = "", keyInfoStr = "", iconStr = '<span class="icon"></span>';
		Menu.GeneralActiveByMouseDown = false;
		this.gui = _gui;
		this.level = _level;
		this.parentMenu = _parentMenu;
		this.fullId = 'menu_' + this.gui.id + "_" + this.id;
		this.gui.menus[this.fullId] = this;
		if (this.key != 0) {
			this.gui.menuKeys[this.key] = this;
			keyInfoStr = '<span class="keyinfo">' + GUI.KeyToStr(this.key) + '</span>';
		} else {
			keyInfoStr = '<span class="nokeyinfo"></span>';
		};
		if (this.func != null) {
			attrStr += ' onmouseup="Menu.OnMouseUp(event,\'' + this.fullId + '\');" ';
		} else {
			attrStr += ' onmouseup="Menu.OnDummyMouseOver(event);" ';
		};
		attrStr += ' id="' + this.fullId + '" onmousedown="Menu.OnMouseDown(event,\'' + this.fullId + '\');" onmouseover="Menu.OnMouseOver(event,\'' + this.fullId + '\');" onmouseleave="Menu.OnMouseLeave(event,\'' + this.fullId + '\');" ';
		switch (_level) {
			case 0:
				h += '<div id="' + this.fullId + '" class="menu' + ((this.visible) ? '' : ' hidden') + ((this.enabled) ? '' : ' disabled') + ((_gui.topMenuClass == "") ? "" : " " + _gui.topMenuClass) + '">';
				if (this.subs != null) for (i = 0; i < this.subs.length; i++)h += this.subs[i].HTML(1, _gui, this);
				h += '</div>';
				break;
			case 1:
				h += '<div' + attrStr + 'class="mainmenu' + ((this.visible) ? '' : ' hidden') + ((this.enabled) ? '' : ' disabled') + '"><span class="title" id="menutitle_' + this.id + '">' + this.title.I18xTrans(this.titlePlaceholders).HtmlEntities() + '</span>';
				if (this.subs != null) {
					h += '<div id="' + this.fullId + '_submenus" class="normmenus hidden">';
					for (i = 0; i < this.subs.length; i++)h += this.subs[i].HTML(2, _gui, this);
					h += '</div>';
				};
				h += '</div>';
				break;
			case 2:
				switch (this.type) {
					case Menu.TYPE_TOGGLE:
						iconStr = '<span class="icon' + (this.iconClass != "" ? " " + this.iconClass + (this.toggle ? "" : " notsel") : "") + '" id="menuicon_' + this.id + '">' + (this.iconClass == "" ? (this.toggle ? '•' : '') : "") + '</span>'
					case Menu.TYPE_FUNC:
						h += '<div' + attrStr + 'class="normmenu' + ((this.visible) ? '' : ' hidden') + ((this.enabled) ? '' : ' disabled') + '">' + iconStr + '<span class="title" id="menutitle_' + this.id + '">' + this.title.I18xTrans(this.titlePlaceholders).HtmlEntities() + '</span>' + keyInfoStr;
						if (this.subs != null) {
							h += '<div class="sidemenus">';
							for (i = 0; i < this.subs.length; i++)h += this.subs[i].HTML(3, _gui, this);
							h += '</div>';
						};
						h += '</div>';
						break;
					case Menu.TYPE_SEPARATION:
						h += '<div' + attrStr + 'class="normmenu' + ((this.visible) ? '' : ' hidden') + ((this.enabled) ? '' : ' disabled') + ' separation"></div>';
						break;
				};
				break;
			case 3:
				h += '<div' + attrStr + 'class="sidemenu' + ((this.visible) ? '' : ' hidden') + ((this.enabled) ? '' : ' disabled') + '">' + iconStr + '<span class="title" id="menutitle_' + this.id + '">' + this.title.I18xTrans(this.titlePlaceholders).HtmlEntities() + '</span>' + keyInfoStr + '</div>';
				//for(i=0;i<this.subs.length;i++)h+=this.subs.HTML(3,this);
				break;
		};
		return h;
	}

	/** Enables or disables the menu entry (updates the "disabled" CSS class).
	 * @param {boolean} _enabled New enabled state.
	 */
	SetEnable(_enabled) {
		var o;
		if (_enabled != this.enabled) {
			this.enabled = _enabled;
			o = document.getElementById(this.fullId);
			if (o) o.className = _enabled ? o.className.removeClass("disabled") : o.className.addClass("disabled");
			//if(o)log(o.className);
		};
	}

	/** Shows or hides the menu entry (updates the "hidden" CSS class).
	 * @param {boolean} _visible New visibility state.
	 */
	SetVisible(_visible) {
		var o;
		if (_visible != this.visible) {
			this.visible = _visible;
			o = document.getElementById(this.fullId);
			if (o) o.className = _visible ? o.className.removeClass("hidden") : o.className.addClass("hidden");
		};
	}

	/** Sets the toggle state of a TYPE_TOGGLE entry and updates its icon/check mark.
	 * @param {boolean} _toggle New toggle state.
	 */
	SetToggle(_toggle) {
		var o;
		//log("SetToggle",_toggle);
		if (_toggle != this.toggle) {
			o = document.getElementById("menuicon_" + this.id);
			//log("SetToggle tog ok",_toggle);
			this.toggle = _toggle;
			if (o) {
				//log("SetToggle ob ok",_toggle);
				//this.toggle=_toggle;
				if (this.iconClass == "") {
					o.innerHTML = (this.toggle ? '•' : '');
				} else {
					o.className = o.className.boolClass("notsel", !this.toggle);
				};
			};
		};
	}

	/** Inverts the toggle state of the menu entry. */
	SwitchToggle() {
		this.SetToggle(!this.toggle);
	}

	/** Changes the menu title and/or its i18x placeholders and updates the DOM.
	 * @param {string} [_title] New title (i18x key); undefined keeps the current title.
	 * @param {Object} [_menuPlaceHolders={}] Placeholder values for the title translation.
	 */
	ChangeTitle(_title, _menuPlaceHolders) {
		var o, ot = this.title, op = this.titlePlaceholders;
		if (_title != undefined) this.title = _title;
		if (_menuPlaceHolders === undefined) _menuPlaceHolders = {};
		this.titlePlaceholders = _menuPlaceHolders;
		if (_title != ot || this.titlePlaceholders != op) {
			o = document.getElementById("menutitle_" + this.id);
			if (o) o.innerHTML = this.title.I18xTrans(this.titlePlaceholders).HtmlEntities();
		};
	}

}

// ====================================
// PANELS
// ====================================
/** Dockable, floatable, foldable GUI panel with header, content div, optional menu/tool bar and modal support.
 * @class Panel
 */
export class Panel {
	/** Creates a panel with a persistent content div.
	 * @param {string} _id Panel id (unique within the GUI).
	 * @param {string} _title Panel title (i18x key).
	 * @param {number} [_type=Panel.TYPE_NORMAL] Panel type (one of Panel.TYPE_*).
	 * @param {?function} [_eventHandler=null] Handler for panel events ({type, panel}).
	 * @param {string} [_extraContentClass=""] Additional CSS class for the content div.
	 * @param {string} [_extraPanelClass=""] Additional CSS class for the panel div.
	 * @param {number} [_defWidth=150] Default width in pixels when floating.
	 * @param {number} [_defHeight=200] Default height in pixels when floating.
	 */
	constructor(_id, _title, _type = Panel.TYPE_NORMAL, _eventHandler = null, _extraContentClass = "", _extraPanelClass = "", _defWidth = 150, _defHeight = 200) {
		this.id = _id;
		this.type = _type;
		this.title = _title;
		this.titlePlaceholders = {};
		this.eventHandler = _eventHandler;
		this.defWidth = _defWidth;
		this.defHeight = _defHeight;
		this.extraContentClass = _extraContentClass;
		this.extraPanelClass = _extraPanelClass;
		this.prefContainer = "float,center";

		this.visible = this.type == Panel.TYPE_MAIN;
		this.mainWithHeader = false;
		this.isDocked = false;
		this.isFolded = false;
		this.isModal = false;
		this.isMarked = false;
		this.top = 0;
		this.left = 0;
		this.width = 100;
		this.height = 100;

		this.menu = null;
		this.toolBar = null;
		this.menus = null;

		this.contentDiv = document.createElement("div");
		this.contentDiv.id = 'panel_' + this.id + '_content';
		this.contentDiv.className = "content" + ((this.extraContentClass == "") ? "" : " " + this.extraContentClass);
		this.loadId = 0;
	}

	static { ENUMERATOR = 0; }
	/** Panel type: normal dockable panel. */
	static TYPE_NORMAL = ENUMERATOR++;
	/** Panel type: palette panel (small tool panel). */
	static TYPE_PALETTE = ENUMERATOR++;
	/** Panel type: main (center) panel. */
	static TYPE_MAIN = ENUMERATOR++;
	/** Panel type: modal dialog panel. */
	static TYPE_MODAL = ENUMERATOR++;
	/** Panel type: modal cloud (borderless modal) panel. */
	static TYPE_MODALCLOUD = ENUMERATOR++;
	static { ENUMERATOR = 0; }
	/** Panel event: visibility changed. */
	static EVENTTYPE_VISIBLECHANGED = ENUMERATOR++;
	/** Panel event: size changed. */
	static EVENTTYPE_SIZECHANGED = ENUMERATOR++;
	/** Panel event: dock state changed. */
	static EVENTTYPE_DOCKCHANGED = ENUMERATOR++;
	/** Panel event: content div was (re)inserted into the DOM. */
	static EVENTTYPE_APPEARSINDOM = ENUMERATOR++;
	/** Panel event: content div will be removed from the DOM. */
	static EVENTTYPE_WILLREMOVEDFROMDOM = ENUMERATOR++;
	/** Panel event: fired after a workspace change was applied. */
	static EVENTTYPE_AFTERWORKSPACECHANGE = ENUMERATOR++;
	/** Panel event: panel is about to be closed. */
	static EVENTTYPE_WILLCLOSED = ENUMERATOR++;
	/** Releases references to the event handler, menu and content div. */
	Dispose() {
		delete this.eventHandler;
		delete this.menu;
		delete this.contentDiv;
	}

	/** Changes the panel title and updates the header DOM.
	 * @param {string} _title New title (i18x key).
	 * @param {Object} [_placeholders={}] Placeholder values for the title translation.
	 */
	ChangeTitle(_title, _placeholders) {
		var o = document.getElementById('panel_' + this.id + '_title');
		if (_placeholders === undefined) _placeholders = {};
		this.title = _title;
		this.titlePlaceholders = _placeholders;
		if (o) o.innerHTML = _title.I18xTrans(_placeholders).HtmlEntities();
	}

	/** Marks or unmarks the panel header (CSS class "marked").
	 * @param {boolean} _marked New marked state.
	 */
	SetMarked(_marked) {
		var o = document.getElementById('panel_' + this.id + '_header');
		this.isMarked = _marked;
		if (o) o.className = o.className.boolClass("marked", _marked);
	}

	/** Switches the panel to/from a black background (CSS class "black").
	 * @param {boolean} _onOff True for black background.
	 */
	SetBlackBgrd(_onOff) {
		var o = document.getElementById('panel_' + this.id);
		if (o) o.className = o.className.boolClass("black", _onOff);
	}

	/** transitionend handler for fold animations: clears the temporary maxHeight (called with the panel div as this).
	 * @param {TransitionEvent} _ev Transition end event.
	 */
	static EndOfFoldTransition(_ev) {
		this.style.maxHeight = "";
	}

	/** Folds or unfolds the panel with a height transition and sound feedback.
	 * @param {boolean} _folded True to fold (collapse to header), false to unfold.
	 */
	SetUpFold(_folded) {
		var o, fbo;
		this.isFolded = _folded;
		o = document.getElementById("panel_" + this.id);
		if (o) {
			fbo = document.getElementById("panel_" + this.id + "_foldbutton");
			if (this.isFolded) {
				o.addEventListener("transitionend", Panel.EndOfFoldTransition, { capture: false, passive: false });
				o.style.maxHeight = o.parentElement.clientHeight + "px";
				o.className = o.className.addClass("folded");
				//o.style.height=this.isDocked?"":this.height+"px";
				fbo.className = fbo.className.exchangeClass("foldin", "foldout");
				PlaySound("foldin", 0.2);
			} else {
				o.addEventListener("transitionend", Panel.EndOfFoldTransition, { capture: false, passive: false });
				o.style.height = this.isDocked ? "" : this.height + "px";
				o.style.maxHeight = o.parentElement.clientHeight + "px";
				o.className = o.className.removeClass("folded");
				fbo.className = fbo.className.exchangeClass("foldout", "foldin");
				PlaySound("foldout", 0.2);
			};
		};
	}

	/** Fold button click handler: toggles the panel fold state and updates its container grid (Alt folds all others).
	 * @param {MouseEvent} _ev Mouse event.
	 * @param {string} _id Panel id.
	 */
	static Fold(_ev, _id) {
		var p, o, pcInfo, container = null;
		if (curGUI != null) if (curGUI.isActive) {
			p = curGUI.panels[_id];
			p.SetUpFold(!p.isFolded);
			//curGUI.Panel2Front(p);
			pcInfo = curGUI.GetPanelContainerInfoOfPanelId(_id);
			switch (pcInfo.container) {
				case "left": container = curGUI.leftPanelContainers[pcInfo.no]; break;
				case "right": container = curGUI.rightPanelContainers[pcInfo.no]; break;
				case "top": container = curGUI.topPanelContainers[pcInfo.no]; break;
				case "bottom": container = curGUI.bottomPanelContainers[pcInfo.no]; break;
			};
			if (container != null) {
				if (_ev.altKey && !p.isFolded) container.FoldAllPanels(!p.isFolded, _id);
				container.SetUpContainerGrid(1000);
			};
			//if(p.eventHandler!=null)p.eventHandler({type:Panel.EVENTTYPE_SIZECHANGED,panel:p});
		};
		_ev.stopPropagation();
	}

	/** Undock button click handler: removes the panel from its container and shows it as a float panel.
	 * @param {MouseEvent} _ev Mouse event.
	 * @param {string} _id Panel id.
	 */
	static Undock(_ev, _id) {
		var p = curGUI.panels[_id];
		Panel.CloseButtonEvent(_ev, _id, true);
		_ev.stopPropagation();
		if (p.eventHandler != null) {
			p.eventHandler({ type: Panel.EVENTTYPE_DOCKCHANGED, panel: p });
			p.eventHandler({ type: Panel.EVENTTYPE_SIZECHANGED, panel: p });
		};
	}

	/** Closes this panel programmatically.
	 * @param {boolean} [_rememberResultInWorkSpace=false] Skip saving the workspace to local storage.
	 */
	Close(_rememberResultInWorkSpace = false) {
		Panel.CloseButtonEvent(false, this.id, false, _rememberResultInWorkSpace);
	}

	/** Close/undock button handler: removes the panel from its container (and grid) or re-attaches it as float panel.
	 * @param {MouseEvent|boolean} _ev Mouse event or false when called programmatically.
	 * @param {string} _id Panel id.
	 * @param {boolean} [_noCloseDoUndock=false] True to undock (keep visible as float) instead of closing.
	 * @param {boolean} [_rememberResultInWorkSpace=false] Skip saving the workspace to local storage.
	 */
	static CloseButtonEvent(_ev, _id, _noCloseDoUndock, _rememberResultInWorkSpace = false) {
		var p, o, pcInfo, pc, pco, np, pos;
		if (_noCloseDoUndock === undefined) _noCloseDoUndock = false;
		if (curGUI != null) if (curGUI.isActive) {
			p = curGUI.panels[_id];
			if (p.eventHandler != null) p.eventHandler({ type: Panel.EVENTTYPE_WILLCLOSED, panel: p });
			o = document.getElementById("panel_" + _id);
			if (o == null) return;
			pos = AbsPositionOfElement(o);
			pco = p.parent;
			if (!_noCloseDoUndock) {
				if (!_rememberResultInWorkSpace) curGUI.SetLocalStorageWorkSpace(undefined, false);
				p.visible = false;
				//log("CloseButtonEvent",p.menu);
				if (p.menu != null) p.menu.SetToggle(p.visible);
			};
			pcInfo = curGUI.GetPanelContainerInfoOfPanelId(_id);
			if (p.eventHandler != null) p.eventHandler({ type: Panel.EVENTTYPE_WILLREMOVEDFROMDOM, panel: p });
			switch (pcInfo.container) {
				case "left":
					delete curGUI.leftPanelContainers[pcInfo.no].panels[_id];
					o.outerHTML = "";
					if (ObjectUtils.isEmpty(curGUI.leftPanelContainers[pcInfo.no].panels)) {
						SetOuterHTML("topgrip_left_" + curGUI.leftPanelContainers[pcInfo.no].id);
						SetOuterHTML("rightgrip_left_" + curGUI.leftPanelContainers[pcInfo.no].id);
						SetOuterHTML("bottomgrip_left_" + curGUI.leftPanelContainers[pcInfo.no].id);
						SetOuterHTML("panelcontainer_" + curGUI.leftPanelContainers[pcInfo.no].id);
						curGUI.leftPanelContainers.splice(pcInfo.no, 1);
						curGUI.gridTemplateCols.splice(1 + pcInfo.no * 2, 2);
						curGUI.noOfGridCols -= 2;
						curGUI._SetUpGUIGrid();
					} else {
						curGUI.leftPanelContainers[pcInfo.no].SetUpContainerGrid();
					};
					break;
				case "right":
					delete curGUI.rightPanelContainers[pcInfo.no].panels[_id];
					o.outerHTML = "";
					if (ObjectUtils.isEmpty(curGUI.rightPanelContainers[pcInfo.no].panels)) {
						SetOuterHTML("leftgrip_right_" + curGUI.rightPanelContainers[pcInfo.no].id);
						SetOuterHTML("topgrip_right_" + curGUI.rightPanelContainers[pcInfo.no].id);
						SetOuterHTML("bottomgrip_right_" + curGUI.rightPanelContainers[pcInfo.no].id);
						SetOuterHTML("panelcontainer_" + curGUI.rightPanelContainers[pcInfo.no].id);
						curGUI.rightPanelContainers.splice(pcInfo.no, 1);
						curGUI.gridTemplateCols.splice(curGUI.leftPanelContainers.length * 2 + 2 + pcInfo.no * 2, 2);
						curGUI.noOfGridCols -= 2;
						curGUI._SetUpGUIGrid();
					} else {
						curGUI.rightPanelContainers[pcInfo.no].SetUpContainerGrid();
					};
					break;
				case "top":
					delete curGUI.topPanelContainers[pcInfo.no].panels[_id];
					o.outerHTML = "";
					if (ObjectUtils.isEmpty(curGUI.topPanelContainers[pcInfo.no].panels)) {
						SetOuterHTML("bottomgrip_top_" + curGUI.topPanelContainers[pcInfo.no].id);
						SetOuterHTML("panelcontainer_" + curGUI.topPanelContainers[pcInfo.no].id);
						curGUI.topPanelContainers.splice(pcInfo.no, 1);
						curGUI.gridTemplateRows.splice(2 + pcInfo.no * 2, 2);
						curGUI.noOfGridRows -= 2;
						curGUI._SetUpGUIGrid();
					} else {
						curGUI.topPanelContainers[pcInfo.no].SetUpContainerGrid();
					};
					break;
				case "bottom":
					delete curGUI.bottomPanelContainers[pcInfo.no].panels[_id];
					o.outerHTML = "";
					if (ObjectUtils.isEmpty(curGUI.bottomPanelContainers[pcInfo.no].panels)) {
						SetOuterHTML("topgrip_bottom_" + curGUI.bottomPanelContainers[pcInfo.no].id);
						SetOuterHTML("panelcontainer_" + curGUI.bottomPanelContainers[pcInfo.no].id);
						curGUI.bottomPanelContainers.splice(pcInfo.no, 1);
						curGUI.gridTemplateRows.splice(curGUI.topPanelContainers.length * 2 + 3 + pcInfo.no * 2, 2);
						curGUI.noOfGridRows -= 2;
						curGUI._SetUpGUIGrid();
					} else {
						curGUI.bottomPanelContainers[pcInfo.no].SetUpContainerGrid();
					};
					break;
				case "float":
					curGUI.floatPanels.splice(pcInfo.pos, 1);
					o.outerHTML = "";
					break;
			};
		};
		if (_noCloseDoUndock) {
			np = document.createElement("div");
			np.innerHTML = p.HTML(true);
			p.isDocked = false;
			curGUI.floatPanels.push(p);
			document.getElementById("guifloatpanels").appendChild(np.firstChild);
			np = document.getElementById("panel_" + p.id);
			np.style.top = (pos.y - 80 + 5) + "px";
			np.style.left = (pos.x + 5) + "px";
			np.style.width = p.defWidth + "px";
			np.style.height = p.defHeight + "px";
			curGUI.Panel2Front(p);
			if (!_rememberResultInWorkSpace) curGUI.SetLocalStorageWorkSpace(undefined, false);
		} else {
			if (curGUI) if (curGUI.isActive) if (p.eventHandler != null) p.eventHandler({ type: Panel.EVENTTYPE_VISIBLECHANGED, panel: p });
		};
		if (_ev) _ev.stopPropagation();
	}

	/** Shows the panel as a floating panel at the given position and size.
	 * @param {number} [_x=this.left] Left position in pixels.
	 * @param {number} [_y=this.top] Top position in pixels.
	 * @param {number} [_w=this.defWidth] Width in pixels.
	 * @param {number} [_h=this.defHeight] Height in pixels.
	 */
	ShowAsFloat(_x, _y, _w, _h) {
		var np;
		//log("ShowAsFloat");
		if (_w === undefined) _w = this.defWidth;
		if (_h === undefined) _h = this.defHeight;
		if (_x === undefined) _x = this.left;
		if (_y === undefined) _y = this.top;
		this.top = _y;
		this.left = _x;
		this.width = _w;
		this.height = _h;
		np = document.createElement("div");
		np.innerHTML = this.HTML(true);
		this.isDocked = false;
		this.visible = true;
		if (this.menu != null) this.menu.SetToggle(this.visible);
		curGUI.floatPanels.push(this);
		document.getElementById("guifloatpanels").appendChild(np.firstChild);
		np = document.getElementById("panel_" + this.id);
		np.style.top = (_y - 80 + 5) + "px";
		np.style.left = (_x + 5) + "px";
		np.style.width = _w + "px";
		np.style.height = _h + "px";
		this.FitToGUI();
		curGUI.Panel2Front(this);
	}

	/** Shows the panel as a modal dialog on the overlay layer. */
	ShowAsModal() {
		var oo = document.getElementById("overlay"), om = document.getElementById("modalcontent"), np;
		oo.className = oo.className.removeClass("hidden");
		om.className = om.className.removeClass("hidden");
		np = document.createElement("div");
		np.innerHTML = this.HTML(true);
		curGUI.panels[this.id] = this;
		this.isDocked = false;
		this.visible = true;
		this.isModal = true;
		om.appendChild(np.firstChild);
		np = document.getElementById("panel_" + this.id);
	}

	/** Sets up (or refreshes) a SmartScroll area inside the panel and limits its height.
	 * @param {?Object} _sm Existing SmartScroll instance or null to create a new one.
	 * @param {string} _sa Element id of the scroll area.
	 * @param {boolean} [_setMaxHeight=true] Also set maxHeight to the content scroll height.
	 * @param {string} [_panelHeightMax="75vh"] CSS max height the panel may occupy.
	 * @returns {Object} The (possibly newly created) SmartScroll instance.
	 */
	SetUpScrollArea(_sm, _sa, _setMaxHeight = true, _panelHeightMax = "75vh") {
		var os = document.getElementById(_sa), op = document.getElementById("panel_" + this.id), sh, ph;
		if (os) if (op) {
			sh = os.scrollHeight;
			os.style.display = "none";
			os.style.height = "auto";
			os.style.maxHeight = "none";
			if (true) {
				//if(System.IS_FIREFOX&&System.IS_WINDOWS||System.IS_IOS||System.IS_ANDROID){
				if (_sm == null) {
					os.style.overflow = "hidden";
					_sm = new SmartScroll(os, globalThis.SYSTEM_SMARTSCROLL_STD_VERTICAL);
					_sm.Init();
					_sm.Activate();
				};
			};
			ph = op.scrollHeight + 80;
			// ...40px panel padding
			os.style.display = "block";
			os.style.height = "calc(" + _panelHeightMax + " - " + ph + "px)";
			if (_setMaxHeight) os.style.maxHeight = sh + "px";
		};
		return _sm;
	}

	/** Deactivates and disposes a SmartScroll instance created by SetUpScrollArea().
	 * @param {?Object} _sm SmartScroll instance to remove.
	 * @returns {null} Always null (for resetting the caller's reference).
	 */
	RemoveScrollArea(_sm) {
		if (_sm == null) return null;
		_sm.Deactivate();
		_sm.Exit();
		return null;
	}

	/** Clamps position and size of the floating panel to the visible GUI float area. */
	FitToGUI() {
		var og, np, x, y, w, h;
		if (this.visible && !this.isDocked) {
			//log("FIT");
			og = document.getElementById("guifloatpanels");
			np = document.getElementById("panel_" + this.id);
			y = parseInt(np.style.top, 10);
			x = parseInt(np.style.left, 10);
			w = parseInt(np.style.width, 10);
			h = parseInt(np.style.height, 10);
			x = Math.range(x, 0 - og.clientWidth + 20, og.clientWidth - 20);
			y = Math.range(y, 0, og.clientHeight - 20);
			w = Math.range(w, 40, og.clientWidth - 20);
			h = Math.range(h, 40, og.clientHeight - 40);
			np.style.width = w + "px";
			np.style.height = h + "px";
			np.style.left = x + "px";
			np.style.top = y + "px";
			this.top = y;
			this.left = x;
			this.width = w;
			this.height = h;
		};
	}

	/** Header mouse up handler: plays the button-up sound.
	 * @param {MouseEvent} _ev Mouse event.
	 * @param {string} _id Panel id.
	 */
	static OnHeaderMouseUp(_ev, _id) {
		//log("Panel.OnHeaderMouseUp");
		PlaySound("button_up");
	}

	/** Header mouse down handler: starts dragging a floating panel.
	 * @param {MouseEvent} _ev Mouse event.
	 * @param {string} _id Panel id.
	 */
	static OnHeaderMouseDown(_ev, _id) {
		var p, o, og = document.getElementById("guifloatpanels");
		if (curGUI != null) if (curGUI.isActive) {
			PlaySound("button_down");
			p = curGUI.FloatPanelOfId(_id);
			if (p != null) {
				o = document.getElementById("panel_" + p.id);
				o.className = o.className.addClass("drag");
				curGUI.generalMouseMode = GUI.GENERALMOUSEMODE_FLOATPANELDRAG;
				if (globalThis.MCEFreeze !== undefined) globalThis.MCEFreeze();
				GUI.SetGeneralCursor("pointermove");
				curGUI.SelectableForSizingGrips(false);
				curGUI.floatDragPanel = { panel: p, offX: _ev.clientX - parseInt(o.style.left, 10), offY: _ev.clientY - parseInt(o.style.top, 10) };
				curGUI.Panel2Front(p);
				_ev.preventDefault();
				_ev.stopPropagation();
			};
		};
	}

	/** Size grip mouse down handler: starts resizing a floating panel.
	 * @param {MouseEvent} _ev Mouse event.
	 * @param {string} _id Panel id.
	 */
	static OnFloatSizerMouseDown(_ev, _id) {
		var p, o, og = document.getElementById("guifloatpanels");
		if (curGUI != null) if (curGUI.isActive) {
			PlaySound("button_down");
			p = curGUI.FloatPanelOfId(_id);
			if (p != null) {
				o = document.getElementById("panel_" + p.id);
				o.className = o.className.addClass("drag");
				curGUI.generalMouseMode = GUI.GENERALMOUSEMODE_FLOATPANELSIZE;
				if (globalThis.MCEFreeze !== undefined) globalThis.MCEFreeze();
				GUI.SetGeneralCursor("panelsize");
				curGUI.SelectableForSizingGrips(false);
				curGUI.floatSizePanel = { panel: p, startX: _ev.clientX, startY: _ev.clientY, startWidth: o.clientWidth, startHeight: o.clientHeight };
				curGUI.Panel2Front(p);
				_ev.preventDefault();
			};
		};
	}

	/** Replaces the placeholder element with the panel's persistent content div after the panel HTML was inserted.
	 * @param {HTMLElement} _this Placeholder element inside the freshly rendered panel.
	 * @param {string} _id Panel id.
	 * @param {number} _loadId Load id to match against the panel (guards against outdated inserts).
	 */
	static SetContentDiv(_this, _id, _loadId) {
		var p, pn;
		if (curGUI != null) if (curGUI.isActive) {
			p = curGUI.panels[_id];
			if (p) {
				if (p.contentDiv) {
					if (p.loadId == _loadId) {
						pn = _this.parentNode;
						pn.insertBefore(p.contentDiv, _this);
						pn.removeChild(_this);
						if (p.eventHandler != null) p.eventHandler({ type: Panel.EVENTTYPE_APPEARSINDOM, panel: p });
						if (p.eventHandler != null) p.eventHandler({ type: Panel.EVENTTYPE_SIZECHANGED, panel: p });
					};
				};
			};
		};
	}

	/** Panel mouse down handler: brings a floating panel to the front.
	 * @param {MouseEvent} _ev Mouse event.
	 * @param {string} _id Panel id.
	 */
	static OnMouseDown(_ev, _id) {
		var p, o;
		// OnHeaderMouseDown
		if (curGUI != null) if (curGUI.isActive) {
			p = curGUI.FloatPanelOfId(_id);
			if (p != null) {
				if (curGUI.floatPanels[curGUI.floatPanels.length - 1] != p) {
					curGUI.Panel2Front(p);
					_ev.preventDefault();
					_ev.stopPropagation();
				};
			};
		};
	}

	/** Builds the panel HTML (header, buttons, content placeholder) for docked or floating display.
	 * @param {boolean} [_asFloatPanel=false] True to render as floating/modal panel.
	 * @param {number} [_zIndex=0] z-index offset within the float panel stack.
	 * @returns {string} HTML string of the panel.
	 */
	HTML(_asFloatPanel = false, _zIndex = 0) {
		var h = "";
		this.loadId++;
		if (_asFloatPanel) {
			switch (this.type) {
				case Panel.TYPE_NORMAL:
					h += '<div id="panel_' + this.id + '" class="panel normal float' + (this.isFolded ? " folded" : "") + (this.extraPanelClass == '' ? '' : ' ' + this.extraPanelClass) + '" onmousedown="Panel.OnMouseDown(event,\'' + this.id + '\');" style="top:' + this.top + 'px;left:' + this.left + 'px;width:' + this.width + 'px;height:' + ((this.height == -1) ? "100px" : this.height + "px") + ';z-index:' + (GUI.FLOATPANELZINDEXSTART + _zIndex + 1) + ';">';
					h += '<div id="panel_' + this.id + '_foldbutton" class="headerbutton ' + (this.isFolded ? "foldout" : "foldin") + '" ' + ButtonAttributes("Panel.Fold(event,'" + this.id + "');") + '"></div>';
					h += '<div class="headerbutton closer" onmousedown="Panel.CloseButtonEvent(event,\'' + this.id + '\');"></div>';
					h += '<div id="panel_' + this.id + '_header" class="header' + (this.isMarked ? ' marked' : '') + '" onmousedown="Panel.OnHeaderMouseDown(event,\'' + this.id + '\');" onmouseup="Panel.OnHeaderMouseUp(event,\'' + this.id + '\');">';
					h += '<div class="title">' + this.title.I18xTrans(this.titlePlaceholders).HtmlEntities() + '</div>';
					h += '</div>';
					h += '<img src="./skins/' + SKIN + '/imgs/empty.png" class="empty" onload="Panel.SetContentDiv(this,\'' + this.id + '\',' + this.loadId + ');">';
					h += '<div class="footerbutton sizer" onmousedown="Panel.OnFloatSizerMouseDown(event,\'' + this.id + '\');"></div>';
					h += '</div>';
					break;
				case Panel.TYPE_PALETTE:
					h += '<div id="panel_' + this.id + '" class="panel normal float' + (this.isFolded ? " folded" : "") + (this.extraPanelClass == '' ? '' : ' ' + this.extraPanelClass) + '" style="top:' + this.top + 'px;left:' + this.left + 'px;width:' + this.width + 'px;height:' + ((this.height == -1) ? "100px" : this.height + "px") + ';z-index:' + (GUI.FLOATPANELZINDEXSTART - _zIndex + 1) + ';">';
					h += '<div id="panel_' + this.id + '_foldbutton" class="headerbutton ' + (this.isFolded ? "foldout" : "foldin") + '" ' + ButtonAttributes("Panel.Fold(event,'" + this.id + "');") + '"></div>';
					h += '<div class="headerbutton closer" onclick="Panel.CloseButtonEvent(event,\'' + this.id + '\');"></div>';
					h += '<div id="panel_' + this.id + '_header" class="header" ' + (this.isMarked ? ' marked' : '') + 'onmousedown="Panel.OnHeaderMouseDown(event,\'' + this.id + '\');"></div>';
					h += '<img src="./skins/' + SKIN + '/imgs/empty.png" class="empty" onload="Panel.SetContentDiv(this,\'' + this.id + '\',' + this.loadId + ');">';
					h += '<div class="footerbutton sizer" onmousedown="Panel.OnFloatSizerMouseDown(event,\'' + this.id + '\');"></div>';
					h += '</div>';
					break;
				case Panel.TYPE_MODAL:
					h += '<div id="panel_' + this.id + '" class="panel modal' + (this.extraPanelClass == '' ? '' : ' ' + this.extraPanelClass) + '">';
					h += ImgLoadHTML('Panel.SetContentDiv(this,\'' + this.id + '\',' + this.loadId + ');');
					//h+='<img src="./skins/'+SKIN+'/imgs/empty.png" class="empty" onload="Panel.SetContentDiv(this,\''+this.id+'\','+this.loadId+');">';
					h += '</div>';
					break;
				case Panel.TYPE_MODALCLOUD:
					h += '<div id="panel_' + this.id + '" class="panel modal cloud' + (this.extraPanelClass == '' ? '' : ' ' + this.extraPanelClass) + '">';
					h += ImgLoadHTML('Panel.SetContentDiv(this,\'' + this.id + '\',' + this.loadId + ');');
					//h+='<img src="./skins/'+SKIN+'/imgs/empty.png" class="empty" onload="Panel.SetContentDiv(this,\''+this.id+'\','+this.loadId+');">';
					h += '</div>';
					break;
			};
		} else {
			switch (this.type) {
				case Panel.TYPE_NORMAL:
					h += '<div id="panel_' + this.id + '" class="panel normal' + (this.isFolded ? " folded" : "") + (this.extraPanelClass == '' ? '' : ' ' + this.extraPanelClass) + '" style="z-index:' + (GUI.FLOATPANELZINDEXSTART - _zIndex - 1) + ';">';
					h += '<div id="panel_' + this.id + '_foldbutton" class="headerbutton ' + (this.isFolded ? "foldout" : "foldin") + '" ' + ButtonAttributes("Panel.Fold(event,'" + this.id + "');") + '"></div>';
					h += '<div class="headerbutton docker" onclick="Panel.Undock(event,\'' + this.id + '\');"></div>';
					h += '<div class="headerbutton closer" onclick="Panel.CloseButtonEvent(event,\'' + this.id + '\');"></div>';
					h += '<div id="panel_' + this.id + '_header" class="header' + (this.isMarked ? ' marked' : '') + '">';
					h += '<div id="panel_' + this.id + '_title" class="title">' + this.title.I18xTrans(this.titlePlaceholders).HtmlEntities() + '</div>';
					h += '</div>';
					h += '<img src="./skins/' + SKIN + '/imgs/empty.png" class="empty" onload="Panel.SetContentDiv(this,\'' + this.id + '\',' + this.loadId + ');">';
					h += '</div>';
					break;
				case Panel.TYPE_PALETTE:
					h += '<div id="panel_' + this.id + '" class="panel palette' + (this.isFolded ? " folded" : "") + (this.extraPanelClass == '' ? '' : ' ' + this.extraPanelClass) + '" style="z-index:' + (GUI.FLOATPANELZINDEXSTART - _zIndex - 1) + ';">';
					h += '<div id="panel_' + this.id + '_foldbutton" class="headerbutton ' + (this.isFolded ? "foldout" : "foldin") + '" ' + ButtonAttributes("Panel.Fold(event,'" + this.id + "');") + '"></div>';
					h += '<div class="headerbutton docker" onclick="Panel.Undock(event,\'' + this.id + '\');"></div>';
					h += '<div class="headerbutton closer" onclick="Panel.CloseButtonEvent(event,\'' + this.id + '\');"></div>';
					h += '<div id="panel_' + this.id + '_header" class="header' + (this.isMarked ? ' marked' : '') + '"></div>';
					h += '<img src="./skins/' + SKIN + '/imgs/empty.png" class="empty" onload="Panel.SetContentDiv(this,\'' + this.id + '\',' + this.loadId + ');">';
					h += '</div>';
					break;
				case Panel.TYPE_MAIN:
					h += '<div id="panel_' + this.id + '" class="panel main' + (this.extraPanelClass == '' ? '' : ' ' + this.extraPanelClass) + '">';
					if (this.mainWithHeader) {
						h += '<div id="panel_' + this.id + '_header" class="header' + (this.isMarked ? ' marked' : '') + '">';
						h += '<div id="panel_' + this.id + '_title" class="title">' + this.title.I18xTrans(this.titlePlaceholders).HtmlEntities() + '</div>';
						h += '</div>';
					};
					h += ImgLoadHTML('Panel.SetContentDiv(this,\'' + this.id + '\',' + this.loadId + ');');
					//h+='<img src="./skins/'+SKIN+'/imgs/empty.png" class="empty" onload="Panel.SetContentDiv(this,\''+this.id+'\','+this.loadId+');">';
					h += '</div>';
					break;
			};
		};
		return h;
	}

	/** Resizes the panel if it is currently floating and clamps it to the GUI.
	 * @param {number} _width New width in pixels.
	 * @param {number} _height New height in pixels.
	 */
	ResizeIfFloat(_width, _height) {
		var i = curGUI.GetPanelContainerInfoOfPanelId(this.id);
		if (i.container == "float") {
			this.width = _width;
			this.height = _height;
			var np = document.getElementById("panel_" + this.id);
			np.style.width = _width + "px";
			np.style.height = _height + "px";
			this.FitToGUI();
		};
	}

	/** Shows the panel at its preferred container/position (prefContainer) if it is not visible yet.
	 * @param {number} [_width=-1] Width override in pixels (-1 uses the preference value).
	 * @param {number} [_height=-1] Height override in pixels (-1 uses the preference value).
	 */
	ShowIfNotVisible(_width = -1, _height = -1) {
		var pref = [], cno, cnop;
		if (!this.visible) {
			if (this.prefContainer === undefined) this.prefContainer = "float,center";
			if (this.prefContainer == "") this.prefContainer = "float,center";
			pref = this.prefContainer.split(",");
			switch (pref[0]) {
				case "float":
					switch (pref[1]) {
						case "center":
							this.ShowAsFloat();
							break;
						case "pos":
							this.ShowAsFloat(parseInt(pref[2], 10), parseInt(pref[3], 10), _width == -1 ? parseInt(pref[4], 10) : _width, _height == -1 ? parseInt(pref[5], 10) : _height);
							break;
						case "topleft":
							this.ShowAsFloat(10, 10, parseInt(pref[4], 10), parseInt(pref[5], 10));
							break;
					};
					break;
				case "left":
					cno = parseInt(pref[1], 10);
					cnop = parseInt(pref[2], 10);
					if (cno < curGUI.leftPanelContainers.length) {
						GUI.InsertPanelIntoContainer("left", curGUI.leftPanelContainers, curGUI.leftPanelContainers[cno].id, this, true);
					} else {
						GUI.InsertPanelIntoContainer("left", curGUI.leftPanelContainers, GUI.CreateNewPanelContainer("left", -1), this, true);
					};
					break;
				case "right":
					cno = parseInt(pref[1], 10);
					cnop = parseInt(pref[2], 10);
					if (cno < curGUI.rightPanelContainers.length) {
						GUI.InsertPanelIntoContainer("right", curGUI.rightPanelContainers, curGUI.rightPanelContainers[curGUI.rightPanelContainers.length - cno - 1].id, this, true);
					} else {
						GUI.InsertPanelIntoContainer("right", curGUI.rightPanelContainers, GUI.CreateNewPanelContainer("right", -1), this, true);
					};
					break;
				case "top":
					cno = parseInt(pref[1], 10);
					cnop = parseInt(pref[2], 10);
					if (cno < curGUI.topPanelContainers.length) {
						GUI.InsertPanelIntoContainer("top", curGUI.topPanelContainers, curGUI.topPanelContainers[cno].id, this, true);
					} else {
						GUI.InsertPanelIntoContainer("top", curGUI.topPanelContainers, GUI.CreateNewPanelContainer("top", -1), this, true);
					};
					break;
				case "bottom":
					cno = parseInt(pref[1], 10);
					cnop = parseInt(pref[2], 10);
					if (cno < curGUI.bottomPanelContainers.length) {
						GUI.InsertPanelIntoContainer("bottom", curGUI.bottomPanelContainers, curGUI.bottomPanelContainers[curGUI.bottomPanelContainers.length - cno - 1].id, this, true);
					} else {
						GUI.InsertPanelIntoContainer("bottom", curGUI.bottomPanelContainers, GUI.CreateNewPanelContainer("bottom", -1), this, true);
					};
					break;
			};
		};
	}

	/** Finds an element inside the panel's content div.
	 * @param {string} _id Element id.
	 * @returns {?HTMLElement} Found element or null.
	 */
	GetElementById(_id) {
		return this.contentDiv.GetElementById(_id);
	}

	/** Standard menu handler for panel toggle menus: closes a visible panel or shows a hidden one.
	 * @param {Menu} _menu Menu whose id encodes the panel id ("<prefix>_<panelId>").
	 */
	static MenuHandler(_menu) {
		var p, pi = _menu.id.split("_");
		p = curGUI.panels[pi[1]];
		//log("A");
		if (p) {
			//log("B",p);
			if (p.visible) {
				p.Close();
			} else {
				p.ShowIfNotVisible();
			};
		};
	}

	/** Assigns a tool bar to the panel.
	 * @param {ToolBar} _toolBar Tool bar to assign.
	 */
	SetToolBar(_toolBar) {
		this.toolBar = _toolBar;
	}

	/** Wires the assigned tool bar to this panel (button events, selection). */
	SetUpToolBar() {
		this.toolBar.SetUp(this);
	}

	/** Sets the selection value of a tool bar group.
	 * @param {number} _groupNo Group index within the tool bar.
	 * @param {number|Object} _value Selection value (button index or multi-select map).
	 */
	SetToolBarGroup(_groupNo, _value) {
		this.toolBar.toolBarGroups[_groupNo].Set(_value);
	}

	/** Sets the enabled states of the buttons of a tool bar group.
	 * @param {number} _groupNo Group index within the tool bar.
	 * @param {Array<boolean>} _enables Enabled state per button.
	 */
	SetToolBarGroupEnables(_groupNo, _enables) {
		this.toolBar.toolBarGroups[_groupNo].SetEnables(_enables);
	}

	// =========================================
	// PANEL DB TABLE UTILS
	// =========================================
	/** Initializes the panel's paged database request state (results, paging params, messages).
	 * @param {Object} _def Definition: requestAction, failedErrorMsgTitle, waitMsg, noResultMsg.
	 */
	InitPanelDBReqs(_def) {
		this.curDBResults = {};
		this.curDBResultsCount = 0;
		this.curDBRequestParams = { limit: 100, offset: 0, filter: "", orders: "" };
		this.DBReqsAction = _def.requestAction;
		this.DBReqsFailedErrorMsgTitle = _def.failedErrorMsgTitle;
		this.DBReqsWaitMsg = _def.waitMsg;
		this.DBReqsNoResultMsg = _def.noResultMsg;
	}

	/** Builds the page navigation button bar (first/previous/next/last) for the current result page.
	 * @returns {string} HTML string of the paging button bar.
	 */
	GetPanelDBReqsPageEndButtons() {
		var p = this.curDBRequestParams;
		var pagebutgroups = [[
			GUI.ButtonHTML(this.id + "_firstpage_button", false, 'icon-first', "curGUI.panels['" + this.id + "'].DBReqsDoRequestPage(event,this);", { data: 0, disabled: p.offset == 0, tooltip: '...show first page...<info context="general page select button tooltip text"/>'.I18xTrans() }),
			GUI.ButtonHTML(this.id + "_prevpage_button", false, 'icon-backward2', "curGUI.panels['" + this.id + "'].DBReqsDoRequestPage(event,this);", { data: (p.offset - p.limit) < 0 ? 0 : (p.offset - p.limit), disabled: p.offset == 0, tooltip: '...show previous page...<info context="general page select button tooltip text"/>'.I18xTrans() }),
			GUI.ButtonHTML(this.id + "_nextpage_button", false, 'icon-forward3', "curGUI.panels['" + this.id + "'].DBReqsDoRequestPage(event,this);", { data: (p.offset + p.limit), disabled: ((p.offset + p.limit) >= this.curDBResultsCount), tooltip: '...show next page...<info context="general page select button tooltip text"/>'.I18xTrans() }),
			GUI.ButtonHTML(this.id + "_lastpage_button", false, 'icon-last', "curGUI.panels['" + this.id + "'].DBReqsDoRequestPage(event,this);", { data: (this.curDBResultsCount - p.limit), disabled: ((p.offset + p.limit) >= this.curDBResultsCount), tooltip: '...show last page...<info context="general page select button tooltip text"/>'.I18xTrans() })
		]];
		return GUI.ButtonBarsHTML(
			pagebutgroups,
			{ buttonsAligns: ["center wrap noglass", "right"], containerAlign: "center", fullContainer: true, texts: ['Page <pageno/> of <totalnoofpages/><info context="general page select dialog text"/>'.I18xTrans({ pageno: Math.ceil(p.offset / p.limit) + 1, totalnoofpages: (this.curDBResultsCount <= p.limit) ? 1 : Math.ceil(this.curDBResultsCount / p.limit) }), ""] }
		);
	}

	/** Loads a result page via REST using the current filter/limit/offset and shows it (calls this.ShowDBResults()).
	 * @param {boolean} [_resetOffset=false] Reset the paging offset to 0 before loading.
	 */
	DBReqsLoad(_resetOffset = false) {
		var request = new XMLHttpRequest(), self = this, p = self.curDBRequestParams, o;
		if (_resetOffset) p.offset = 0;
		p.limit = self.TextInputIntValue(this.id + "_dbreqs_limit", 100);
		p.filter = self.TextInputValue(this.id + "_dbreqs_filter", "");
		request.onreadystatechange = function () {
			if (this.readyState == 4) {
				var res = this.finish();
				self.HideOverlay();
				self.curDBResults = {};
				if (res.ok) {
					self.curDBResults = res.output.results;
					self.curDBResultsCount = res.output.totalResultsCount;
					self.ShowDBResults();
				} else {
					curGUI.ShowAlert(self.DBReqsFailedErrorMsgTitle, 'Please try again later<info context="Alert Message"/>'.I18xTrans(), this.ShowDBResults);
				};
			};
		};
		//o=this.contentDiv.GetElementById(this.id+"_resultDisplay");
		//if(o)o.innerHTML="";
		//o=this.contentDiv.GetElementById(this.id+"_resultControl");
		//if(o)o.innerHTML="";
		self.ShowWaitMessage(self.DBReqsWaitMsg);
		request.rest(self.DBReqsAction, { filter: p.filter, offset: p.offset, orders: p.orders, limit: p.limit });
	}

	/** Paging button handler: loads the page whose offset is stored in the button's data value.
	 * @param {MouseEvent} _ev Mouse event.
	 * @param {HTMLElement} _o Button element with dataset.value holding the new offset.
	 */
	DBReqsDoRequestPage(_ev, _o) {
		this.curDBRequestParams.offset = parseInt(_o.dataset.value, 10);
		this.DBReqsLoad();
	}

	/** Builds the table header cells for a result table.
	 * @param {Array<Object>} _cols Column definitions ({title, class}).
	 * @returns {string} HTML string of th elements.
	 */
	GetDBReqsHeader(_cols) {
		var l = _cols.length, i, h = "";
		for (i = 0; i < l; i++)h += '<th' + ((_cols[i].class == '') ? '' : ' class="' + _cols[i].class + '"') + '>' + _cols[i].title.HtmlEntities() + '</th>';
		return h;
	}

	/** Registers a key shortcut for a modal button inside this panel.
	 * @param {string} _id Button element id.
	 * @param {number} _key Key code (GUI.KEY combination).
	 * @param {function} _eventHandler Handler called on key/button activation.
	 */
	ModalButtonKeyEventsSetUp(_id, _key, _eventHandler) {
		var o = this.contentDiv.GetElementById(_id);
		if (o) GUI.ModalButtonKeyEventsSetUp(o, _key, _eventHandler);
	}

	/** Enables/disables a text input of this panel (see GUI.TextInputSetEnabled).
	 * @param {string} _id Input id.
	 * @param {boolean} _enabled New enabled state.
	 */
	TextInputSetEnabled(_id, _enabled) { GUI.TextInputSetEnabled(this, _id, _enabled); }

	/** Sets the key press handler of a text input (see GUI.TextInputSetOnKeyPress).
	 * @param {string} _id Input id.
	 * @param {function} _onKeyPress Key press handler.
	 */
	TextInputSetOnKeyPress(_id, _onKeyPress) { GUI.TextInputSetOnKeyPress(this, _id, _onKeyPress); }

	/** Sets the change handler of a text input (alias of TextInputSetOnKeyPress).
	 * @param {string} _id Input id.
	 * @param {function} _onKeyPress Change handler.
	 */
	TextInputSetOnChange(_id, _onKeyPress) { GUI.TextInputSetOnKeyPress(this, _id, _onKeyPress); }

	/** Sets the value of a text input (see GUI.TextInputSetValue).
	 * @param {string} _id Input id.
	 * @param {string|number} _value New value.
	 */
	TextInputSetValue(_id, _value) { GUI.TextInputSetValue(this, _id, _value); }

	/** Sets the minimum of a numeric text input (see GUI.TextInputSetMin).
	 * @param {string} _id Input id.
	 * @param {number} _value New minimum.
	 */
	TextInputSetMin(_id, _value) { GUI.TextInputSetMin(this, _id, _value); }

	/** Sets the maximum of a numeric text input (see GUI.TextInputSetMax).
	 * @param {string} _id Input id.
	 * @param {number} _value New maximum.
	 */
	TextInputSetMax(_id, _value) { GUI.TextInputSetMax(this, _id, _value); }

	/** Returns the value of a text input (see GUI.TextInputValue).
	 * @param {string} _id Input id.
	 * @param {string} [_defValue=""] Default if the input does not exist.
	 * @returns {string} Input value.
	 */
	TextInputValue(_id, _defValue = "") { return GUI.TextInputValue(this, _id, _defValue); }

	/** Returns the integer value of a text input (see GUI.TextInputIntValue).
	 * @param {string} _id Input id.
	 * @param {number} _defValue Default if missing/invalid.
	 * @returns {number} Integer value.
	 */
	TextInputIntValue(_id, _defValue) { return GUI.TextInputIntValue(this, _id, _defValue); }

	/** Returns the float value of a text input (see GUI.TextInputDoubleValue).
	 * @param {string} _id Input id.
	 * @param {number} _defValue Default if missing/invalid.
	 * @returns {number} Float value.
	 */
	TextInputDoubleValue(_id, _defValue) { return GUI.TextInputDoubleValue(this, _id, _defValue); }

	/** Sets the value of a timestamp input (see GUI.TimestampInputSetValue).
	 * @param {string} _id Input id.
	 * @param {number} _value New timestamp value.
	 */
	TimestampInputSetValue(_id, _value) { GUI.TimestampInputSetValue(this, _id, _value); }

	/** Sets the change handler of a range input (see GUI.RangeInputSetOnChange).
	 * @param {string} _id Input id.
	 * @param {function} _onchange Change handler.
	 */
	RangeInputSetOnChange(_id, _onchange) { return GUI.RangeInputSetOnChange(this, _id, _onchange); }

	/** Returns the integer value of a range input (see GUI.RangeInputIntValue).
	 * @param {string} _id Input id.
	 * @param {number} _defValue Default if missing/invalid.
	 * @returns {number} Integer value.
	 */
	RangeInputIntValue(_id, _defValue) { return GUI.RangeInputIntValue(this, _id, _defValue); }

	/** Returns the float value of a range input (see GUI.RangeInputDoubleValue).
	 * @param {string} _id Input id.
	 * @param {number} _defValue Default if missing/invalid.
	 * @returns {number} Float value.
	 */
	RangeInputDoubleValue(_id, _defValue) { return GUI.RangeInputDoubleValue(this, _id, _defValue); }

	/** Sets the input handler of a range input (see GUI.RangeInputSetOnInput).
	 * @param {string} _id Input id.
	 * @param {function} _onInput Input handler.
	 */
	RangeInputSetOnInput(_id, _onInput) { GUI.RangeInputSetOnInput(this, _id, _onInput); }

	/** Sets the value of a range input (see GUI.RangeInputSetValue).
	 * @param {string} _id Input id.
	 * @param {number} _value New value.
	 */
	RangeInputSetValue(_id, _value) { GUI.RangeInputSetValue(this, _id, _value); }

	/** Returns the value object of a joint input (see GUI.JointInputValue).
	 * @param {string} _id Input id.
	 * @param {Object} _defValue Default if missing.
	 * @returns {Object} Joint input value.
	 */
	JointInputValue(_id, _defValue) { return GUI.JointInputValue(this, _id, _defValue); }

	/** Sets the value object of a joint input (see GUI.JointInputSetValue).
	 * @param {string} _id Input id.
	 * @param {Object} _value New value.
	 */
	JointInputSetValue(_id, _value) { return GUI.JointInputSetValue(this, _id, _value); }

	/** Returns the value object of a curve input (see GUI.CurveInputValue).
	 * @param {string} _id Input id.
	 * @param {Object} [_defValue={}] Default if missing.
	 * @returns {Object} Curve input value.
	 */
	CurveInputValue(_id, _defValue = {}) { return GUI.CurveInputValue(this, _id, _defValue); }

	/** Sets the value object of a curve input (see GUI.CurveInputSetValue).
	 * @param {string} _id Input id.
	 * @param {Object} [_value={}] New value.
	 */
	CurveInputSetValue(_id, _value = {}) { return GUI.CurveInputSetValue(this, _id, _value); }

	/** Returns the value of a text area (see GUI.TextAreaValue).
	 * @param {string} _id Text area id.
	 * @param {string} [_defValue=""] Default if missing.
	 * @returns {string} Text area value.
	 */
	TextAreaValue(_id, _defValue = "") { return GUI.TextAreaValue(this, _id, _defValue); }

	/** Sets the input handler of a text area (see GUI.TextAreaSetOnInput).
	 * @param {string} _id Text area id.
	 * @param {function} _onInput Input handler.
	 */
	TextAreaSetOnInput(_id, _onInput) { GUI.TextAreaSetOnInput(this, _id, _onInput); }

	/** Sets the value of a text area (see GUI.TextAreaSetValue).
	 * @param {string} _id Text area id.
	 * @param {string} [_value=""] New value.
	 */
	TextAreaSetValue(_id, _value = "") { return GUI.TextAreaSetValue(this, _id, _value); }

	/** Returns the checked state of a check box (see GUI.CheckBoxValue).
	 * @param {string} _id Check box id.
	 * @param {boolean} _defValue Default if missing.
	 * @returns {boolean} Checked state.
	 */
	CheckBoxValue(_id, _defValue) { return GUI.CheckBoxValue(this, _id, _defValue); }

	/** Sets the checked state of a check box (see GUI.CheckBoxSetValue).
	 * @param {string} _id Check box id.
	 * @param {boolean} _value New checked state.
	 */
	CheckBoxSetValue(_id, _value) { return GUI.CheckBoxSetValue(this, _id, _value); }

	/** Sets the input handler of a check box (see GUI.CheckBoxSetOnInput).
	 * @param {string} _id Check box id.
	 * @param {function} _onInput Input handler.
	 */
	CheckBoxSetOnInput(_id, _onInput) { GUI.CheckBoxSetOnInput(this, _id, _onInput); }

	/** Enables/disables a check box (see GUI.CheckBoxSetEnabled).
	 * @param {string} _id Check box id.
	 * @param {boolean} _enabled New enabled state.
	 */
	CheckBoxSetEnabled(_id, _enabled) { GUI.CheckBoxSetEnabled(this, _id, _enabled); }

	/** Returns the bit set value of a bitset select (see GUI.BitsetSelectValue).
	 * @param {string} _id Input id.
	 * @param {number} _defValue Default if missing.
	 * @returns {number} Bit set value.
	 */
	BitsetSelectValue(_id, _defValue) { return GUI.BitsetSelectValue(this, _id, _defValue); }

	/** Sets the bit set value of a bitset select (see GUI.BitsetSelectSetValue).
	 * @param {string} _id Input id.
	 * @param {number} _value New bit set value.
	 */
	BitsetSelectSetValue(_id, _value) { return GUI.BitsetSelectSetValue(this, _id, _value); }

	/** Replaces the options of a select input and sets a value (see GUI.SelectInputChangeSelects).
	 * @param {string} _id Select id.
	 * @param {Array} _selects New option definitions.
	 * @param {string|number} _value Value to select.
	 */
	SelectInputChangeSelects(_id, _selects, _value) { return GUI.SelectInputChangeSelects(this, _id, _selects, _value); }

	/** Sets the value of a select input (see GUI.SelectInputSetValue).
	 * @param {string} _id Select id.
	 * @param {string|number} _value New value.
	 */
	SelectInputSetValue(_id, _value) { return GUI.SelectInputSetValue(this, _id, _value); }

	/** Returns the value of a select input (see GUI.SelectInputValue).
	 * @param {string} _id Select id.
	 * @param {string} _defValue Default if missing.
	 * @returns {string} Selected value.
	 */
	SelectInputValue(_id, _defValue) { return GUI.SelectInputValue(this, _id, _defValue); }

	/** Returns the integer value of a select input (see GUI.SelectInputIntValue).
	 * @param {string} _id Select id.
	 * @param {number} _defValue Default if missing/invalid.
	 * @returns {number} Integer value.
	 */
	SelectInputIntValue(_id, _defValue) { return GUI.SelectInputIntValue(this, _id, _defValue); }

	/** Returns the float value of a select input (see GUI.SelectInputDoubleValue).
	 * @param {string} _id Select id.
	 * @param {number} _defValue Default if missing/invalid.
	 * @returns {number} Float value.
	 */
	SelectInputDoubleValue(_id, _defValue) { return GUI.SelectInputDoubleValue(this, _id, _defValue); }

	/** Replaces the options of a select input (see GUI.SelectInputChangeOptions).
	 * @param {string} _id Select id.
	 * @param {Array} _selects New option definitions.
	 */
	SelectInputChangeOptions(_id, _selects) { return GUI.SelectInputChangeOptions(this, _id, _selects); }

	/** Enables/disables a select input (see GUI.SelectInputSetEnabled).
	 * @param {string} _id Select id.
	 * @param {boolean} _enabled New enabled state.
	 */
	SelectInputSetEnabled(_id, _enabled) { return GUI.SelectInputSetEnabled(this, _id, _enabled); }

	/** Returns the value of a radio input group (see GUI.RadioInputValue).
	 * @param {string} _id Radio group id.
	 * @param {string} _defValue Default if none selected.
	 * @returns {string} Selected value.
	 */
	RadioInputValue(_id, _defValue) { return GUI.RadioInputValue(this, _id, _defValue); }

	/** Returns the integer value of a radio input group (see GUI.RadioInputIntValue).
	 * @param {string} _id Radio group id.
	 * @param {number} _defValue Default if none selected.
	 * @returns {number} Integer value.
	 */
	RadioInputIntValue(_id, _defValue) { return GUI.RadioInputIntValue(this, _id, _defValue); }

	/** Returns the float value of a radio input group (delegates to GUI.RadioInputIntValue).
	 * @param {string} _id Radio group id.
	 * @param {number} _defValue Default if none selected.
	 * @returns {number} Numeric value.
	 */
	RadioInputDoubleValue(_id, _defValue) { return GUI.RadioInputIntValue(this, _id, _defValue); }

	/** Returns the boolean value of a radio input group (delegates to GUI.RadioInputIntValue).
	 * @param {string} _id Radio group id.
	 * @param {boolean} _defValue Default if none selected.
	 * @returns {boolean|number} Selected value.
	 */
	RadioInputBoolValue(_id, _defValue) { return GUI.RadioInputIntValue(this, _id, _defValue); }

	/** Sets the value of a radio input group (see GUI.RadioInputSetValue).
	 * @param {string} _id Radio group id.
	 * @param {string|number} _value Value to select.
	 */
	RadioInputSetValue(_id, _value) { return GUI.RadioInputSetValue(this, _id, _value); }

	/** Sets the change handler of a radio input group (see GUI.RadioInputSetOnChange).
	 * @param {string} _id Radio group id.
	 * @param {function} _onchange Change handler.
	 */
	RadioInputSetOnChange(_id, _onchange) { return GUI.RadioInputSetOnChange(this, _id, _onchange); }

	/** Returns the image data URL of an image input (see GUI.ImageInputValue).
	 * @param {string} _id Input id.
	 * @param {string} _defValue Default if missing.
	 * @returns {string} Image data URL.
	 */
	ImageInputValue(_id, _defValue) { return GUI.ImageInputValue(this, _id, _defValue); }

	/** Returns the natural width of the loaded image (see GUI.ImageInputWidth).
	 * @param {string} _id Input id.
	 * @param {number} _defValue Default if missing.
	 * @returns {number} Image width in pixels.
	 */
	ImageInputWidth(_id, _defValue) { return GUI.ImageInputWidth(this, _id, _defValue); }

	/** Returns the natural height of the loaded image (see GUI.ImageInputHeight).
	 * @param {string} _id Input id.
	 * @param {number} _defValue Default if missing.
	 * @returns {number} Image height in pixels.
	 */
	ImageInputHeight(_id, _defValue) { return GUI.ImageInputHeight(this, _id, _defValue); }

	/** Sets the image of an image input (see GUI.ImageInputSetValue).
	 * @param {string} _id Input id.
	 * @param {string} _value Image data URL/source.
	 */
	ImageInputSetValue(_id, _value) { return GUI.ImageInputSetValue(this, _id, _value); }

	/** Returns the audio data of an audio input (see GUI.AudioInputValue).
	 * @param {string} _id Input id.
	 * @param {string} _defValue Default if missing.
	 * @returns {string} Audio data URL.
	 */
	AudioInputValue(_id, _defValue) { return GUI.AudioInputValue(this, _id, _defValue); }

	/** Returns the file name of the loaded audio (see GUI.AudioInputAudioName).
	 * @param {string} _id Input id.
	 * @param {string} _defValue Default if missing.
	 * @returns {string} Audio file name.
	 */
	AudioInputAudioName(_id, _defValue) { return GUI.AudioInputAudioName(this, _id, _defValue); }

	/** Sets the audio data of an audio input (see GUI.AudioInputSetValue).
	 * @param {string} _id Input id.
	 * @param {Object|string} _value New audio value.
	 */
	AudioInputSetValue(_id, _value) { return GUI.AudioInputSetValue(this, _id, _value); }

	/** Returns the value of a SoundCloud input (see GUI.SoundCloudInputValue).
	 * @param {string} _id Input id.
	 * @param {string} _defValue Default if missing.
	 * @returns {string} SoundCloud value.
	 */
	SoundCloudInputValue(_id, _defValue) { return GUI.SoundCloudInputValue(this, _id, _defValue); }

	/** Rebinds the event handler attributes of a button (see GUI.ButtonSetAttributes).
	 * @param {string} _id Button id.
	 * @param {string|function} _eventHandler Handler code/function.
	 */
	ButtonSetAttributes(_id, _eventHandler) { GUI.ButtonSetAttributes(this, _id, _eventHandler); }

	/** Sets the selected state of a button (see GUI.ButtonSetSelected).
	 * @param {string} _id Button id.
	 * @param {boolean} _selected New selected state.
	 */
	ButtonSetSelected(_id, _selected) { GUI.ButtonSetSelected(this, _id, _selected); }

	/** Returns the selected state of a button (see GUI.ButtonGetSelected).
	 * @param {string} _id Button id.
	 * @returns {boolean} Selected state.
	 */
	ButtonSelected(_id) { return GUI.ButtonGetSelected(this, _id); }

	/** Enables/disables a button (see GUI.ButtonSetEnabled).
	 * @param {string} _id Button id.
	 * @param {boolean} _enabled New enabled state.
	 */
	ButtonSetEnabled(_id, _enabled) { GUI.ButtonSetEnabled(this, _id, _enabled); }

	/** Returns the enabled state of a button (see GUI.ButtonEnabled).
	 * @param {string} _id Button id.
	 * @returns {boolean} Enabled state.
	 */
	ButtonEnabled(_id) { return GUI.ButtonEnabled(this, _id); }

	/** Highlights or unhighlights a button (see GUI.ButtonSetHighlight).
	 * @param {string} _id Button id.
	 * @param {boolean} _highlight New highlight state.
	 */
	ButtonSetHighlight(_id, _highlight) { GUI.ButtonSetHighlight(this, _id, _highlight); }

	/** Shows or hides a button (see GUI.ButtonSetVisible).
	 * @param {string} _id Button id.
	 * @param {boolean} _visible New visibility state.
	 */
	ButtonSetVisible(_id, _visible) { return GUI.ButtonSetVisible(this, _id, _visible); }

	/** Returns the HTML of the (initially hidden) panel overlay div.
	 * @returns {string} HTML string of the overlay div.
	 */
	GetPanelOverlayHTML() {
		return '<div id="paneloverlay_' + this.id + '" class="paneloverlay hidden"></div>';
	}

	/** Shows the panel overlay (blocks the panel content). */
	ShowOverlay() {
		var o = this.contentDiv.GetElementById('paneloverlay_' + this.id);
		if (o) o.className = o.className.removeClass("hidden");
	}

	/** Hides the panel overlay. */
	HideOverlay() {
		var o = this.contentDiv.GetElementById('paneloverlay_' + this.id);
		if (o) o.className = o.className.addClass("hidden");
	}

	/** Shows a wait message (spinner, optional progress bar) on the panel overlay.
	 * @param {string} [_text=""] Message text.
	 * @param {string} [_title=""] Message title.
	 * @param {boolean} [_withProgress=false] Include a progress bar.
	 */
	ShowWaitMessage(_text = "", _title = "", _withProgress = false) {
		var o = this.contentDiv.GetElementById('paneloverlay_' + this.id), h = "";
		if (o) {
			o.className = o.className.addClass("hidden");
			h += '<div class="panelwaitmessage">';
			if (_title != "") h += '<div class="title">' + _title.HtmlEntities() + '</div>';
			h += '<div class="ai white"></div>';
			if (_withProgress) {
				h += '<br/><br/><div id="progressbar_' + this.id + '" class=" progressbar off"><div id="progressbarinner_' + this.id + '" class="progressbarinner" data-source-text="" data-placeholders="{}" data-last-timestamp="' + NOW_TIMESTAMP() + '" data-start-timestamp="' + NOW_TIMESTAMP() + '" data-value="0" data-total="' + 0 + '"></div></div><br/>';
				h += '<div id="progressbartext_gui' + this.id + '" class="off"></div>';
			};
			if (_text != "") h += '<div id="panelwaitmessagetext_' + this.id + '" class="text">' + _text.HtmlEntities() + '</div>';
			h += '</div>';
			o.innerHTML = h;
		};
		this.ShowOverlay();
	}

	/** Registers dialog inputs for handled-dialog validation (see GUI.SetHdlDialogInputs).
	 * @param {Array<string>} _ids Input ids.
	 * @param {Object} _hdlDialog Handled dialog descriptor.
	 */
	SetHdlDialogInputs(_ids, _hdlDialog) {
		GUI.SetHdlDialogInputs(this, _ids, _hdlDialog);
	}

	/** Marks or unmarks an input title as wrong (CSS class "wrong").
	 * @param {string} _id Input id.
	 * @param {boolean} _isWrong True to mark as wrong.
	 */
	SetWrongInput(_id, _isWrong) {
		var ot = this.contentDiv.GetElementById(_id + "_title");
		if (ot) ot.className = ot.className.boolClass("wrong", _isWrong);
	}

	/** Validates the given inputs of this panel (see GUI.CheckInputs).
	 * @param {Array<string>} _ids Input ids to validate.
	 * @param {boolean} [_markWrong=true] Mark invalid inputs as wrong.
	 * @returns {boolean} True if all inputs are valid.
	 */
	CheckInputs(_ids, _markWrong = true) {
		return GUI.CheckInputs(this, _ids, _markWrong);
	}

}

/** Single tab (tab button plus content div) managed by a TabViews container.
 * @class TabView
 */
export class TabView {
	/** Creates a tab view with a persistent content div.
	 * @param {Object} _p Options: id, type, title, isClosable, contentClass.
	 */
	constructor(_p) {
		this.id = (_p.id === undefined) ? "" : _p.id;
		this.type = (_p.type === undefined) ? TabView.TABVIEWTYPE_NONE : _p.type;
		this.title = (_p.title === undefined) ? "Unnamed" : _p.title;
		this.isClosable = (_p.isClosable === undefined) ? false : _p.isClosable;
		this.contentClass = (_p.contentClass === undefined) ? "" : _p.contentClass;

		this.marked = false;
		this.selected = false;
		this.contentDiv = document.createElement("div");
		this.contentDiv.className = "innercontent";
		this.loadId = 0;

		this.subTabViews = null;
	}

	/** Replaces the placeholder element with the tab's persistent content div after HTML insertion.
	 * @param {HTMLElement} _this Placeholder element (carries the TabViews access code in its dataset).
	 * @param {number} _loadId Load id to match against the tab (guards against outdated inserts).
	 */
	static SetContentDiv(_this, _loadId) {
		var err, h;
		try {
			var ids = _this.parentNode.id.split("_"), tvs = eval(_this.dataset.accessCode), tv = tvs.tabViews[ids[2]];
			if (tv.loadId != _loadId) return;
			//_this.parentNode.replaceChild(tv.contentDiv,_this);
			//return;
			// !!!!!!!??????? I don't know why....
			//log(tv.id,this.title);
			var t = document.createElement("div");
			//if(_this.dataset.accessCode=="curEditLandscapes.configTabViews"){
			//	log("AAAA:",tv.contentDiv.innerHTML,tv,tvs,ids);
			//};
			t.innerHTML = tv.contentDiv.innerHTML;
			t.id = tv.contentDiv.id;
			t.className = tv.contentDiv.className;
			tv.contentDiv = t;
			_this.parentNode.replaceChild(tv.contentDiv, _this);
			if (tv.subTabViews != null) {
				tv.subTabViews.UpdateHTML();
				if (t.innerHTML.trim() == tv.subTabViews.HTMLUnLoaded().trim() || t.innerHTML == tv.subTabViews.HTMLWithImg().trim()) {
					tv.contentDiv.innerHTML = tv.subTabViews.HTMLLoaded(tv.subTabViews.ContentHTML());
					//log("!TABVIEW PROBLEM!");
				};
			};
		} catch (err) { };
	}

	/** Tab button click handler: selects the tab identified by the button's id/access code.
	 * @param {HTMLElement} _this Clicked tab button element.
	 */
	static TabButtonSelect(_this) {
		var err;
		try {
			var ids = _this.id.split("_"), tvs = eval(_this.dataset.accessCode), tv = tvs.tabViews[ids[2]]; //
			tvs.SelectTabViewId(ids[2]);
		} catch (err) { };
	}

	/** Tab close button click handler: removes the tab from its TabViews container.
	 * @param {HTMLElement} _this Clicked closer element.
	 */
	static TabButtonClose(_this) {
		var err;
		try {
			var ids = _this.id.split("_"), tvs = eval(_this.parentNode.dataset.accessCode), tv = tvs.tabViews[ids[2]]; //
			tvs.RemoveTabViewOfId(tv.id);
		} catch (err) { };
	}

	/** Builds the tab content container HTML with a placeholder for the persistent content div.
	 * @param {TabViews} _tabViews Owning TabViews container.
	 * @returns {string} HTML string of the content container.
	 */
	ContentHTML(_tabViews) {
		var h = "";
		this.loadId++;
		h += '<div id="tabview_' + this.tabViews.id + '_' + this.id + '" class="content' + (this.selected ? " sel" : "") + ((this.contentClass != "") ? ' ' + this.contentClass : "") + '">';
		h += '<img src="./skins/' + SKIN + '/imgs/empty.png" class="empty" data-access-code="' + _tabViews.accessCode + '" onload="TabView.SetContentDiv(this,' + this.loadId + ');">';
		h += '</div>';
		return h;
	}

	/** Builds the tab button HTML (title, optional close button, selection/marked state).
	 * @param {TabViews} _tabViews Owning TabViews container.
	 * @returns {string} HTML string of the tab button.
	 */
	TabHTML(_tabViews) {
		var h = "";
		h += '<div id="tab_' + this.tabViews.id + '_' + this.id + '" data-access-code="' + _tabViews.accessCode + '" title="' + this.title.I18xTrans().tHtmlEntities() + '" class="tab' + (this.selected ? " sel" : "") + (this.marked ? " marked" : "") + (this.isClosable ? " withCloser" : "") + '" ' + ButtonAttributes("TabView.TabButtonSelect(this);") + '>' + (this.isClosable ? '<div id="tab_' + this.tabViews.id + '_' + this.id + '_closer" class="closer"' + ButtonAttributes("TabView.TabButtonClose(this);") + '></div>' : "") + '<div class="title" id="tab_' + this.tabViews.id + '_' + this.id + '_title">' + this.title.I18xTrans().HtmlEntities() + '</div></div>';
		return h;
	}

	static { ENUMERATOR = 0; }
	/** Tab view type: default (no special type). */
	static TABVIEWTYPE_NONE = ENUMERATOR++;
	static { ENUMERATOR = 0; }
	/** Tab view event: undefined/none. */
	static TABVIEWEVENT_UDNEFINED = ENUMERATOR++;
	/** Tab view event: tab is about to be closed. */
	static TABVIEWEVENT_BEFORECLOSE = ENUMERATOR++;
	/** Tab view event: tab was closed. */
	static TABVIEWEVENT_AFTERCLOSE = ENUMERATOR++;
	/** Tab view event: tab is about to be selected. */
	static TABVIEWEVENT_BEFORESELECT = ENUMERATOR++;
	/** Tab view event: tab is about to be deselected. */
	static TABVIEWEVENT_BEFOREDESELECT = ENUMERATOR++;
}

// TabViews
/** Container managing a set of TabView tabs (tab bar plus content area) with selection and events.
 * @class TabViews
 */
export class TabViews {
	/** Creates a tab views container with a persistent content div.
	 * @param {string} _id Container id.
	 * @param {number} [_type=TabViews.TABVIEWSTYPE_NORMALTABS] Container type (one of TabViews.TABVIEWSTYPE_*).
	 * @param {string} [_contentsAddClass=""] Additional CSS class for the contents area.
	 * @param {string} _accessCode JS expression evaluating to this instance (used in inline event handlers).
	 * @param {?function} [_eventHandler=null] Handler for tab view events ({type, id, ...}).
	 */
	constructor(_id, _type, _contentsAddClass, _accessCode, _eventHandler) {
		this.id = _id;
		this.type = (_type === undefined) ? TabViews.TABVIEWSTYPE_NORMALTABS : _type;
		this.contentsAddClass = (_contentsAddClass === undefined) ? "" : _contentsAddClass;
		this.eventHandler = (_eventHandler === undefined) ? null : _eventHandler;
		this.accessCode = _accessCode;
		this.tabViews = {};
		this.selectedTabView = null;

		this.contentDiv = document.createElement("div");
		this.contentDiv.className = "tabviews";
		this.contentDiv.innerHTML = this.ContentHTML();
		this.loadId = 0;
	}

	/** Adds a tab view to the container.
	 * @param {TabView} _tabView Tab view to add.
	 * @param {boolean} [_selectIt=true] Select the new tab.
	 * @param {boolean} [_doUpdateHTML=true] Rebuild the container HTML afterwards.
	 */
	AddTabView(_tabView, _selectIt = true, _doUpdateHTML = true) {
		this.tabViews[_tabView.id] = _tabView;
		_tabView.tabViews = this;
		_tabView.contentDiv.tabViews = this;
		this.tabViews[_tabView.id].selected = false;
		if (_selectIt || this.selectedTabView == null) {
			this.tabViews[_tabView.id].selected = true;
			if (this.selectedTabView != null) this.selectedTabView.selected = false;
			this.selectedTabView = this.tabViews[_tabView.id];
		};
		if (_doUpdateHTML) this.UpdateHTML();
	}

	/** Removes the tab with the given id and selects its neighbor (BEFORECLOSE event may veto).
	 * @param {string} _id Tab id.
	 * @param {boolean} [_noBeforeEvent=false] Skip the TABVIEWEVENT_BEFORECLOSE event.
	 */
	RemoveTabViewOfId(_id, _noBeforeEvent) {
		var nextsel = this.GetViewIdOfPrePostId(_id), ev;
		if (_noBeforeEvent === undefined) _noBeforeEvent = false;
		if (!_noBeforeEvent) {
			ev = { type: TabView.TABVIEWEVENT_BEFORECLOSE, id: _id, tabviews: this };
			// on true supress closing...
			if (this.eventHandler != null) if (this.eventHandler(ev)) return;
		};
		delete this.tabViews[_id];
		this.UpdateHTML();
		this.SelectTabViewId(nextsel);
		ev = { type: TabView.TABVIEWEVENT_AFTERCLOSE, id: _id };
		if (this.eventHandler != null) this.eventHandler(ev);
	}

	/** Returns the id of the neighbor tab (successor preferred, else predecessor) of the given tab.
	 * @param {string} _id Tab id.
	 * @returns {string} Neighbor tab id or "" if none.
	 */
	GetViewIdOfPrePostId(_id) {
		var o, last = null, pre = null, post = null;
		for (o in this.tabViews) {
			if (o == _id) pre = last;
			if (last == _id) post = o;
			last = o;
		};
		if (pre != null) last = pre;
		if (post != null) last = post;
		if (last == null) last = "";
		return last;
	}

	/** Marks or unmarks a tab (CSS class "marked").
	 * @param {string} _id Tab id.
	 * @param {boolean} _marked New marked state.
	 */
	MarkTabViewId(_id, _marked) {
		var o;
		if (this.tabViews.hasOwnProperty(_id)) {
			if (this.tabViews[_id].marked != _marked) {
				this.tabViews[_id].marked = _marked;
				o = this.contentDiv.GetElementById('tab_' + this.id + '_' + _id);
				if (o) o.className = o.className.boolClass("marked", _marked);
			};
		};
	}

	/** Changes the title of a tab and updates its button DOM.
	 * @param {string} _id Tab id.
	 * @param {string} _newTitle New title.
	 */
	ChangeTitleOfViewId(_id, _newTitle) {
		var o;
		if (this.tabViews.hasOwnProperty(_id)) {
			this.tabViews[_id].title = _newTitle;
			o = this.contentDiv.GetElementById('tab_' + this.id + '_' + _id + "_title");
			if (o) {
				o.innerHTML = _newTitle.HtmlEntities();
				o.title = _newTitle.HtmlEntities();
			};
		};
	}

	/** Replaces the content HTML of a tab.
	 * @param {string} _id Tab id.
	 * @param {string} _newContent New inner HTML.
	 */
	ChangeContentInnerHTMLOfViewId(_id, _newContent) {
		var o;
		if (this.tabViews.hasOwnProperty(_id)) {
			this.tabViews[_id].contentDiv.innerHTML = _newContent;
		};
	}

	/** Selects a tab by id, deselecting the previous one (fires BEFOREDESELECT/BEFORESELECT events).
	 * @param {string} _id Tab id.
	 */
	SelectTabViewId(_id) {
		var o, ev;
		if (this.tabViews.hasOwnProperty(_id)) {
			if (!this.tabViews[_id].selected) {
				if (this.selectedTabView != null) {
					ev = { type: TabView.TABVIEWEVENT_BEFOREDESELECT, id: this.selectedTabView.id };
					if (this.eventHandler != null) this.eventHandler(ev);
					this.selectedTabView.selected = false;
					o = this.contentDiv.GetElementById('tab_' + this.id + '_' + this.selectedTabView.id);
					if (o) o.className = o.className.removeClass("sel");
					o = this.contentDiv.GetElementById('tabview_' + this.id + '_' + this.selectedTabView.id);
					if (o) o.className = o.className.removeClass("sel");
				};
				ev = { type: TabView.TABVIEWEVENT_BEFORESELECT, id: _id };
				if (this.eventHandler != null) this.eventHandler(ev);
				this.tabViews[_id].selected = true;
				this.selectedTabView = this.tabViews[_id];
				o = this.contentDiv.GetElementById('tab_' + this.id + '_' + _id);
				if (o) o.className = o.className.addClass("sel");
				o = this.contentDiv.GetElementById('tabview_' + this.id + '_' + _id);
				if (o) o.className = o.className.addClass("sel");
			};
		};
	}

	/** Replaces the placeholder element with the container's persistent content div after HTML insertion.
	 * @param {HTMLElement} _this Placeholder element (carries the access code in its dataset).
	 * @param {number} _loadId Load id to match against the container (guards against outdated inserts).
	 */
	static SetContentDiv(_this, _loadId) {
		var err;
		try {
			var tvs = eval(_this.dataset.accessCode);
			if (tvs.loadId != _loadId) return;
			_this.parentNode.replaceChild(tvs.contentDiv, _this);
			tvs.UpdateHTML();
		} catch (err) { };
	}

	/** Builds the inner HTML of the container (tab bar and content areas of all tabs).
	 * @returns {string} HTML string of tabs and contents.
	 */
	ContentHTML() {
		var h = "", t;
		if (this.type != TabViews.TABVIEWSTYPE_NOTABS) {
			h += '<div id="tabviews_' + this.id + '_tabs" class="tabs">';
			var t;
			for (t in this.tabViews) {
				h += this.tabViews[t].TabHTML(this);
			};
			h += '</div>';
		};
		h += '<div id="tabviews_' + this.id + '_contents" class="contents ' + this.contentsAddClass + '">';
		var t;
		for (t in this.tabViews) {
			h += this.tabViews[t].ContentHTML(this);
		};
		h += '</div>';
		return h;
	}

	/** Builds the outer container HTML with a placeholder that pulls in the persistent content div (bumps loadId).
	 * @returns {string} HTML string of the container.
	 */
	HTML() {
		var h = "";
		this.loadId++;
		h += '<div id="tabviews_' + this.id + '_container" class="tabviews">';
		h += '<img src="./skins/' + SKIN + '/imgs/empty.png" data-access-code="' + this.accessCode + '" class="empty" onload="TabViews.SetContentDiv(this,' + this.loadId + ');">';
		h += '</div>';
		return h;
	}

	/** Builds the outer container HTML with placeholder image without bumping the loadId.
	 * @returns {string} HTML string of the container.
	 */
	HTMLWithImg() {
		var h = "";
		h += '<div id="tabviews_' + this.id + '_container" class="tabviews">';
		h += '<img src="./skins/' + SKIN + '/imgs/empty.png" data-access-code="' + this.accessCode + '" class="empty" onload="TabViews.SetContentDiv(this,' + this.loadId + ');">';
		h += '</div>';
		return h;
	}

	/** Builds the empty outer container HTML (no content loaded yet).
	 * @returns {string} HTML string of the empty container.
	 */
	HTMLUnLoaded() {
		return '<div id="tabviews_' + this.id + '_container" class="tabviews"></div>';
	}

	/** Builds the outer container HTML around already-rendered content.
	 * @param {string} _loadHTML Pre-rendered inner HTML.
	 * @returns {string} HTML string of the container.
	 */
	HTMLLoaded(_loadHTML) {
		return '<div id="tabviews_' + this.id + '_container" class="tabviews">' + _loadHTML + '</div>';
	}

	/** Rebuilds the tab bar and content areas inside the persistent content div.
	 * @returns {boolean} True if both tab bar and contents element were found and updated.
	 */
	UpdateHTML() {
		var ret = true, h, t, tto = this.contentDiv.GetElementById('tabviews_' + this.id + '_tabs'), tco = this.contentDiv.GetElementById('tabviews_' + this.id + '_contents');
		//log("TabViewsUpdateHTML",this.id);
		if (tto) {
			h = "";
			var t;
			for (t in this.tabViews) {
				//log(this.tabViews[t].id);
				h += this.tabViews[t].TabHTML(this);
			};
			tto.innerHTML = h;
		} else {
			ret = false;
		};
		if (tco) {
			h = "";
			var t;
			for (t in this.tabViews) {
				h += this.tabViews[t].ContentHTML(this);
			};
			tco.innerHTML = h;
		} else {
			ret = false;
		};
		//log("TabViewsUpdateHTML h ",h);
		return ret;
	}

	static { ENUMERATOR = 0; }
	/** Container type: content areas only, no tab bar. */
	static TABVIEWSTYPE_NOTABS = ENUMERATOR++;
	/** Container type: normal tab bar with content areas. */
	static TABVIEWSTYPE_NORMALTABS = ENUMERATOR++;
}

// ========================
// TOOLBAR
// ========================
// TOOLBAR BUTTON
/** Single tool bar button with value, tooltip and selection state, registered in a global button registry.
 * @class ToolBarButton
 */
export class ToolBarButton {
	/** Creates a tool bar button and registers it in ToolBarButton.ALL.
	 * @param {Object} _p Options: id, class, tooltip, value.
	 */
	constructor(_p) {
		this.id = typeof (_p.id) == "undefined" ? ToolBarButton.NEXTID++ : _p.id;
		ToolBarButton.ALL[this.id] = this;
		this.class = (_p.class === undefined) ? "" : _p.class;
		this.tooltip = (_p.tooltip === undefined) ? "" : _p.tooltip;
		this.value = (_p.value === undefined) ? 0 : _p.value;
		this.enabled = true;
		this.selected = false;

		this.menu = null;
		this.toolBarGroup = null;
	}

	/** Next auto-generated button id. */
	static NEXTID = 0;
	/** Registry of all created tool bar buttons by id. */
	static ALL = {};
	/** Button click handler: updates the selection within the button's group (multi/single select) and fires the group event.
	 * @param {?MouseEvent} _event Mouse event or null for programmatic selection.
	 * @param {string|number} _id Button id.
	 * @returns {boolean} New selected state of the button.
	 */
	static OnSelect(_event, _id) {
		var tb = ToolBarButton.ALL[_id], tg, v, i, l, ret = false;
		if (tb) {
			tg = tb.toolBarGroup;
			l = tg.toolBarButtons.length;
			if (tg.isMultiSelect) {
				if (_event == null) {
					tb.selected = !tb.selected;
				} else {
					if (curGUI.altKeyPressed) {
						for (i = 0; i < l; i++)tg.toolBarButtons[i].selected = false;
						tb.selected = true;
					} else if (curGUI.ctrlKeyPressed) {
						for (i = 0; i < l; i++)tg.toolBarButtons[i].selected = true;
						tb.selected = false;
					} else {
						tb.selected = !tb.selected;
					};
				};
				v = 0;
				for (i = 0; i < l; i++)if (tg.toolBarButtons[i].selected) v |= tg.toolBarButtons[i].value;
				if (tg.value != v) {
					tg.value = v;
					tg.event({ type: ToolBar.EVENTTYPE_SELECTIONCHANGED, value: v, toolbarGroup: tg, toolbutton: tb });
				};
			} else {
				for (i = 0; i < l; i++)tg.toolBarButtons[i].selected = false;
				tb.selected = true;
				tg.value = tb.value;
				v = tb.value;
				tg.event({ type: ToolBar.EVENTTYPE_SELECTIONCHANGED, value: v, toolbarGroup: tg, toolbutton: tb });
			};
			tg.UpdateHTML();
			ret = tb.selected;
		};
		return ret;
	}

	/** Builds the HTML of the button.
	 * @returns {string} HTML string of the button div.
	 */
	HTML() {
		var h = "";
		h += '<div id="toolbarbutton_' + this.id + '" class="button notouch ' + this.class + '" title="' + this.tooltip.tHtmlEntities() + '" ' + ButtonAttributes("ToolBarButton.OnSelect(event,'" + this.id + "');") + '></div>';
		return h;
	}

	/** Enables or disables the button and refreshes its HTML.
	 * @param {boolean} _enable New enabled state.
	 */
	SetEnable(_enable) {
		this.enabled = _enable;
		this.UpdateHTML();
	}

	/** Selects a button programmatically (no mouse event).
	 * @param {string|number} _id Button id.
	 * @returns {boolean} New selected state of the button.
	 */
	static Select(_id) {
		return ToolBarButton.OnSelect(null, _id);
	}

	/** Disposes the contained buttons. */
	Dispose() {
		var i, l = this.toolBarButtons.length;
		for (i = 0; i < l; i++)this.toolBarButtons[i].Dispose();
	}

}

// TOOLBAR GROUP
/** Group of tool bar buttons with single- or multi-select behavior and a combined value.
 * @class ToolBarGroup
 */
export class ToolBarGroup {
	/** Creates a tool bar group.
	 * @param {string|number} _id Group id.
	 * @param {boolean} [_isMultiSelect=false] True for multi-select (bit mask values).
	 * @param {?function} _eventHandler Handler for selection change events.
	 */
	constructor(_id, _isMultiSelect, _eventHandler) {
		this.id = _id;
		this.toolBarButtons = [];
		this.isMultiSelect = (_isMultiSelect) === undefined ? false : _isMultiSelect;
		this.event = (_isMultiSelect) === undefined ? null : _eventHandler;
		this.value = 0;

		this.toolBar = null;
	}

	/** Adds a button to the group.
	 * @param {ToolBarButton} _toolBarButton Button to add.
	 */
	AddToolBarButton(_toolBarButton) {
		this.toolBarButtons.push(_toolBarButton);
		_toolBarButton.toolBarGroup = this;
	}

	/** Sets the group value, updates button selection states and fires the selection change event.
	 * @param {number} _value New group value (bit mask for multi-select, button value otherwise).
	 */
	Set(_value) {
		var i, l = this.toolBarButtons.length;
		if (this.isMultiSelect) {
			this.value = _value;
			for (i = 0; i < l; i++)this.toolBarButtons[i].selected = (_value & this.toolBarButtons[i].value);
		} else {
			for (i = 0; i < l; i++)this.toolBarButtons[i].selected = (this.toolBarButtons[i].value == _value);
			this.value = _value;
		};
		this.UpdateHTML();
		this.event({ type: ToolBar.EVENTTYPE_SELECTIONCHANGED, value: this.value, toolbarGroup: this });
	}

	/** Enables exactly the buttons whose values are listed (single-select groups only).
	 * @param {Array<number>} _enables Values of the buttons to enable.
	 */
	SetEnables(_enables) {
		var i, l = this.toolBarButtons.length;
		if (!this.isMultiSelect) {
			for (i = 0; i < l; i++)this.toolBarButtons[i].enabled = _enables.indexOf(this.toolBarButtons[i].value) >= 0;
			this.UpdateHTML();
		};
	}

	/** Builds the HTML of the group including all buttons.
	 * @returns {string} HTML string of the group div.
	 */
	HTML() {
		var h = "", i;
		h += '<div id="toolbargroup_' + this.id + '" class="group">';
		for (i = 0; i < this.toolBarButtons.length; i++) {
			h += this.toolBarButtons[i].HTML();
		};
		h += '</div>';
		return h;
	}

	/** Updates the selected/disabled CSS classes of all buttons in the DOM. */
	UpdateHTML() {
		var i, l = this.toolBarButtons.length, o;
		for (i = 0; i < l; i++) {
			o = document.getElementById('toolbarbutton_' + this.toolBarButtons[i].id);
			if (o) {
				if (this.toolBarButtons[i].selected) {
					o.className = o.className.addClass("sel");
				} else {
					o.className = o.className.removeClass("sel");
				};
				if (this.toolBarButtons[i].enabled) {
					o.className = o.className.removeClass("disabled");
				} else {
					o.className = o.className.addClass("disabled");
				};
			};
		};
	}

}

// TOOLBAR
/** Tool bar consisting of several ToolBarGroup instances, usually rendered into a panel.
 * @class ToolBar
 */
export class ToolBar {
	/** Creates an empty tool bar.
	 * @param {string|number} _id Tool bar id.
	 */
	constructor(_id) {
		this.id = _id;
		this.toolBarGroups = [];
	}

	/** Disposes all contained groups. */
	Dispose() {
		var i, l = this.toolBarGroups.length;
		for (i = 0; i < l; i++)this.toolBarGroups[i].Dispose();
	}

	/** Adds a group to the tool bar.
	 * @param {ToolBarGroup} _toolBarGroup Group to add.
	 */
	AddToolBarGroup(_toolBarGroup) {
		this.toolBarGroups.push(_toolBarGroup);
		_toolBarGroup.toolBar = this;
	}

	/** Builds the HTML of the tool bar with dividers between the groups.
	 * @returns {string} HTML string of the tool bar.
	 */
	HTML() {
		var h = "", gr = [], i, l = this.toolBarGroups.length;
		h += '<div class="toolbar">';
		for (i = 0; i < l; i++)gr.push(this.toolBarGroups[i].HTML());
		h += gr.join('<div class="groupdiv"></div>');
		h += '</div>';
		return h;
	}

	/** Renders the tool bar into the content div of the given panel.
	 * @param {Panel} _panel Target panel.
	 */
	SetUp(_panel) {
		_panel.contentDiv.innerHTML = this.HTML();
	}

	/** Menu handler that toggles the tool bar button encoded in the menu id ("<prefix>_<buttonId>").
	 * @param {Menu} _menu Triggering menu entry.
	 */
	static MenuHandler(_menu) {
		var p, pi = _menu.id.split("_"), tog = false;
		tog = ToolBarButton.Select(pi[1]);
		_menu.SetToggle(tog);
	}

	static { ENUMERATOR = 0; }
	/** Tool bar event: group selection changed. */
	static EVENTTYPE_SELECTIONCHANGED = ENUMERATOR++;
}

// ========================
// TREEVIEW
// ========================
/** Node of a TreeView with title, value and child entries.
 * @class TreeViewEntry
 */
export class TreeViewEntry {
	/** Creates a tree entry (the id is always auto-generated from IDCOUNTER).
	 * @param {string} [_id=""] Unused; kept for signature compatibility.
	 * @param {string} [_title=""] Entry title (i18x key).
	 * @param {*} _value Payload value of the entry.
	 */
	constructor(_id = "", _title, _value) {
		this.title = (_title == undefined) ? "" : _title;
		//this.id=(_id=="")?TreeViewEntry.IDCOUNTER++:_title.md5();
		this.id = TreeViewEntry.IDCOUNTER++;
		this.value = _value;
		this.subs = [];
	}

	/** Running counter for auto-generated tree entry ids. */
	static IDCOUNTER = 0;
	/** Adds a child entry.
	 * @param {TreeViewEntry} _tve Child entry to add.
	 */
	Add(_tve) {
		this.subs.push(_tve);
	}

	/** Builds the HTML of this entry and its (initially hidden) sub entries with tree line symbols.
	 * @param {TreeView} _treeView Owning tree view.
	 * @param {number} _thisEntryNo Index of this entry among its siblings.
	 * @param {number} _ofMaxEntryNo Index of the last sibling.
	 * @param {number} _level Nesting level (0 = invisible root).
	 * @param {string} _prelevelsymbols Accumulated HTML of the tree line symbols of parent levels.
	 * @returns {string} HTML string of the entry subtree.
	 */
	HTML(_treeView, _thisEntryNo, _ofMaxEntryNo, _level, _prelevelsymbols) {
		var h = "", i, l, c, onclick = "";
		l = this.subs.length;
		if (_level == 1) {
			if (l > 0) {
				if (_thisEntryNo == _ofMaxEntryNo) {
					if (_thisEntryNo == 0) {
						c = "p1";
					} else {
						c = "pe";
					};
				} else if (_thisEntryNo == 0) {
					c = "pb";
				} else {
					c = "p";
				};
				onclick = 'TreeView.OnSwitchClick(event,this);';
			} else {
				c = "t";
				if (_ofMaxEntryNo == 0) {
					c = "-";
				} else if (_thisEntryNo == _ofMaxEntryNo) {
					c = "e";
				} else if (_thisEntryNo == 0) {
					c = "b";
				};
			};
		} else {
			if (l > 0) {
				if (_thisEntryNo == _ofMaxEntryNo) {
					if (_thisEntryNo == 0) {
						c = "pe";
					} else {
						c = "pe";
					};
				} else if (_thisEntryNo == 0) {
					c = "p";
				} else {
					c = "p";
				};
				onclick = 'TreeView.OnSwitchClick(event,this);';
			} else {
				if (_thisEntryNo == _ofMaxEntryNo) {
					c = "e";
				} else if (_thisEntryNo == 0) {
					c = "t";
				} else {
					c = "t";
				};
			};
		};
		if (_level > 0) {
			h += '<div id="treeentry_' + _treeView.id + '_' + this.id + '" class="entry">';
			h += _prelevelsymbols;
			h += '<div class="' + c + '"' + ButtonAttributes(onclick) + '></div>';
			h += '<div class="text" ' + ButtonAttributes("TreeView.OnSelectClick(event,this);") + '>' + this.title.concat('<info context="model catalog entry"/>').I18xTrans().HtmlEntities() + '</div>';
			h += '</div>';
		};
		if (l > 0) {
			h += '<div id="treeentries_' + _treeView.id + '_' + this.id + '" class="subentries' + ((_level > 0) ? ' hidden' : '') + '">';
			for (i = 0; i < l; i++)h += this.subs[i].HTML(_treeView, i, l - 1, _level + 1, ((_level == 0) ? "" : (_prelevelsymbols + ((_thisEntryNo == _ofMaxEntryNo) ? '<div class="x"></div>' : '<div class="l"></div>'))));
			h += '</div>';
		};
		return h;
	}

	/** Recursively searches this subtree for the entry with the given id.
	 * @param {string|number} _id Entry id.
	 * @returns {?TreeViewEntry} Found entry or null.
	 */
	EntryOfId(_id) {
		var i, l, ret = null;
		if (this.id == _id) return this;
		l = this.subs.length;
		for (i = 0; i < l; i++) {
			ret = this.subs[i].EntryOfId(_id);
			if (ret != null) return ret;
		};
		return null;
	}

}

/** Collapsible tree view built from TreeViewEntry nodes with single selection.
 * @class TreeView
 */
export class TreeView {
	/** Creates a tree view and registers it in TreeView.ALL.
	 * @param {string|number} _id Tree view id.
	 * @param {?function} [_eventHandler=null] Handler for selection change events ({type, entry}).
	 */
	constructor(_id, _eventHandler) {
		this.id = _id;
		this.eventHandler = (_eventHandler === undefined) ? null : _eventHandler;
		this.topnode = null;
		this.selectedEntry = null;
		TreeView.ALL[this.id] = this;
	}

	static { ENUMERATOR = 0; }
	/** Tree view event: selected entry changed. */
	static EVENTTYPE_SELECTIONCHANGED = ENUMERATOR++;
	/** Registry of all created tree views by id. */
	static ALL = {};
	/** Searches the whole tree for the entry with the given id.
	 * @param {string|number} _id Entry id.
	 * @returns {?TreeViewEntry} Found entry or null.
	 */
	EntryOfId(_id) {
		var i, l;
		if (this.topnode.id == _id) return this.topnode;
		return this.topnode.EntryOfId(_id);
	}

	/** Sets the root entry of the tree.
	 * @param {TreeViewEntry} _tve New root entry.
	 */
	Set(_tve) {
		this.topnode = _tve;
	}

	/** Builds the HTML of the whole tree view.
	 * @returns {string} HTML string of the tree container.
	 */
	HTML() {
		var h = "";
		h += '<div id="treeview_' + this.id + '" class="treecontainer">';
		h += this.topnode.HTML(this, 0, 0, 0, "");
		h += '</div>';
		return h;
	}

	/** Shows a title for the tree view (not implemented yet).
	 * @param {string} _title Title to show.
	 */
	ShowTitle(_title) {
		//!!!!
	}

	/** Entry text click handler: selects the clicked entry and fires the selection change event.
	 * @param {MouseEvent} _ev Mouse event.
	 * @param {HTMLElement} _this Clicked entry text element.
	 */
	static OnSelectClick(_ev, _this) {
		var ids = _this.parentNode.id.split("_"), o, tv = TreeView.ALL[ids[1]], tve;
		if (tv) {
			if (tv.selectedEntry != null) {
				//tv.selectedEntry.selected=false;
				o = document.getElementById("treeentry_" + tv.id + "_" + tv.selectedEntry.id);
				if (o) o.className = o.className.removeClass("sel");
				tv.selectedEntry = null;
			};
			tve = tv.EntryOfId(ids[2]);
			if (tve) {
				//tve.selected=true;
				tv.selectedEntry = tve;
				_this.parentNode.className = _this.parentNode.className.addClass("sel");
				if (tv.eventHandler != null) tv.eventHandler({ type: TreeView.EVENTTYPE_SELECTIONCHANGED, entry: tv.selectedEntry });
			};
		};
	}

	/** Fold/unfold symbol click handler: toggles the visibility of the entry's sub entries.
	 * @param {MouseEvent} _ev Mouse event.
	 * @param {HTMLElement} _this Clicked switch symbol element.
	 */
	static OnSwitchClick(_ev, _this) {
		var ids = _this.parentNode.id.split("_"), o = document.getElementById("treeentries_" + ids[1] + "_" + ids[2]), foldme = false, cn = _this.className.split(" ");
		switch (cn[0]) {
			case 'p1':
				cn[0] = 'm1';
				break;
			case 'pb':
				cn[0] = 'mb';
				break;
			case 'pe':
				cn[0] = 'me';
				break;
			case 'p':
				cn[0] = 'm';
				break;
			case 'm1':
				foldme = true;
				cn[0] = 'p1';
				break;
			case 'mb':
				foldme = true;
				cn[0] = 'pb';
				break;
			case 'me':
				foldme = true;
				cn[0] = 'pe';
				break;
			case 'm':
				foldme = true;
				cn[0] = 'p';
				break;
		};
		_this.className = cn.join(" ");
		if (o) {
			if (foldme) {
				o.className = o.className.boolClass("hidden", true);
			} else {
				o.className = o.className.boolClass("hidden", false);
			};
		};
	}

}

/** Docking container (left/right/top/bottom column or row) holding stacked panels in a CSS grid.
 * @class PanelContainer
 */
export class PanelContainer {
	/** Creates a panel container with an auto-generated id.
	 * @param {string|number} _size Container size (grid track size, e.g. pixels or fraction).
	 */
	constructor(_size) {
		this.id = panelIdCounter++;
		this.size = _size;
		this.panels = {};
	}

	/** Adds a panel to the container.
	 * @param {Panel} _panel Panel to add.
	 */
	AddPanel(_panel) {
		this.panels[_panel.id] = _panel;
	}

	/** Closes all panels of the container.
	 * @param {Panel} _panel Unused.
	 */
	CloseAllPanels(_panel) {
		var p;
		for (p in this.panels) {
			this.panels[p].Close(true);
		};
		return;
		p = ObjectUtils.firstKey(this.panels);
		while (p != null) {
			this.panels[p].Close(true);
			p = ObjectUtils.firstKey(this.panels);
		};
	}

	/** Builds the HTML of the container including all docked panels.
	 * @returns {string} HTML string of the container div.
	 */
	HTML() {
		var h = "", p;
		h += '<div id="panelcontainer_' + this.id + '" class="panelContainer" style="grid-template-cols:100%;grid-template-rows:1fr;">';
		var p;
		for (p in this.panels) {
			h += this.panels[p].HTML(false, 0);
		};
		h += '</div>';
		return h;
	}

	/** Fires EVENTTYPE_SIZECHANGED on all panels of the given container.
	 * @param {PanelContainer} _this Container whose panels are notified.
	 */
	static SizeChangeEvents(_this) {
		var p;
		for (p in _this.panels) if (_this.panels[p].eventHandler != null) _this.panels[p].eventHandler({ type: Panel.EVENTTYPE_SIZECHANGED, panel: _this.panels[p] });
	}

	/** Recomputes the container's grid rows (folded panels get "auto", the last unfolded "1fr") and notifies the panels.
	 * @param {number} [_eventDelay=0] Delay in milliseconds before the size change events are fired.
	 */
	SetUpContainerGrid(_eventDelay = 0) {
		var o = document.getElementById("panelcontainer_" + this.id), p, q, lastNotFolded = null, template = [];
		var p;
		for (p in this.panels) { q = p; if (!this.panels[p].isFolded) lastNotFolded = p; };
		if (lastNotFolded == null) lastNotFolded = q;
		var p;
		for (p in this.panels) if (p == lastNotFolded) { template.push("1fr"); } else { template.push("auto"); };
		//for(p in this.panels)if(p==lastNotFolded){template.push("auto");}else{template.push("auto");};
		o.style.gridTemplateRows = template.join(" ");
		//log(template.join(" "),this.panels);
		if (_eventDelay == 0) {
			PanelContainer.SizeChangeEvents(this);
		} else {
			setTimeout(PanelContainer.SizeChangeEvents, _eventDelay, this);
		};
	}

	/** Folds or unfolds all panels of the container except the given one.
	 * @param {boolean} _folded New fold state.
	 * @param {string} [_doNotPanelId=""] Panel id to skip.
	 */
	FoldAllPanels(_folded, _doNotPanelId = "") {
		var p;
		for (p in this.panels) if (p != _doNotPanelId) this.panels[p].SetUpFold(_folded);
	}

}

/** Central application GUI manager: hosts the top menu, docked/floating panel containers,
 * modal dialogs, keyboard/mouse event routing, workspaces, and a large library of static
 * HTML widget builders (buttons, inputs, tables, alerts, etc.).
 * @class
 */
export class GUI {
	/** Creates a GUI instance and registers it in the global GUIS registry.
	 * @param {string} _id Unique GUI id.
	 * @param {string} _title GUI/window title.
	 * @param {Object} [_stdWorkSpace] Default workspace definition (clone of GUI.EMPTYWORKSPACE if omitted).
	 * @param {string} [_topMenuClass=""] Extra CSS class for the top menu.
	 */
	constructor(_id, _title, _stdWorkSpace, _topMenuClass) {
		this.id = _id;
		this.title = _title;
		GUIS[this.id] = this;
		this.isMainFull = false;
		this.isActive = false;
		this.isInit = false;
		this.isWorkSpaceApply = false;

		this.mode = GUI.GENERALMOUSEMODE_NONE;
		this.floatDragPanel = {
			panel: null,
			offX: 0,
			offY: 0
		};
		this.floatSizePanel = {
			panel: null,
			startX: 0,
			startY: 0,
			startWidth: 0,
			startHeight: 0
		};
		this.sizePanelContainer = {
			dir: "",
			domElement: null,
			no: 0,
			rcno: 0,
			startX: 0,
			startY: 0,
			size: 0,
			maxSize: 0,
		};

		this.stdWorkSpace = (_stdWorkSpace === undefined) ? ObjectUtils.clone(GUI.EMPTYWORKSPACE) : _stdWorkSpace;
		this.topMenu = new Menu(_id, _id);
		this.topMenuClass = (_topMenuClass === undefined) ? "" : _topMenuClass;
		this.menuKeys = {};
		this.menus = {};

		this.lastLx = -1;
		this.lastLy = -1;

		this.panels = {};

		this.noOfGridCols = 3;
		this.noOfGridRows = 1;
		this.gridTemplateCols = [];
		this.gridTemplateColsStr = "";
		this.gridTemplateColsSum = 0;
		this.gridTemplateRows = [];
		this.gridTemplateRowsStr = "";
		this.gridTemplateRowsSum = 0;
		this.mainPanelContainer = new PanelContainer(0);
		this.leftPanelContainers = [];
		this.topPanelContainers = [];
		this.bottomPanelContainers = [];
		this.rightPanelContainers = [];
		this.floatPanels = [];
		this.modalPanel = null;
		this.modalPanelData = [];
		this.modalMode = false;

		this.domElementId = "";

		this.OldOnKeyDown;
		this.OldOnKeyUp;
		this.OldOnMouseDown;
		this.OldOnMouseUp;
		this.OldOnMouseMove;
		this.OldOnMouseWheel;
		this.OldOnContextMenu;

		this.extraKeyDownEvent = null;
		this.extraKeyUpEvent = null;
		this.extraMouseMoveEvent = null;
		this.extraMouseWheelEvent = null;
		this.extraRresizeEvent = null;

		this.keyDowns = {};
		this.ctrlKeyPressed = false;
		this.cmdKeyPressed = false;
		this.altKeyPressed = false;
		this.shiftKeyPressed = false;
		this.specialKeyChange = 0x00;
	}

	/** Registry of panels shared between multiple GUIs, keyed by panel id.
	 * @type {Object<string,Panel>}
	 */
	static interGUIPanels = {};
	static { ENUMERATOR = 0; }
	/** Mouse mode: no special drag/size operation active.
	 * @type {number}
	 */
	static GENERALMOUSEMODE_NONE = ENUMERATOR++;
	/** Mouse mode: a floating panel is being dragged.
	 * @type {number}
	 */
	static GENERALMOUSEMODE_FLOATPANELDRAG = ENUMERATOR++;
	/** Mouse mode: a floating panel is being resized.
	 * @type {number}
	 */
	static GENERALMOUSEMODE_FLOATPANELSIZE = ENUMERATOR++;
	/** Mouse mode: a panel container grip is being dragged to resize.
	 * @type {number}
	 */
	static GENERALMOUSEMODE_PANELCONTAINERSIZE = ENUMERATOR++;
	/** Base z-index for floating panels.
	 * @type {number}
	 */
	static FLOATPANELZINDEXSTART = 9000;
	/** Key handlers active while a modal dialog is open, keyed by key mapping.
	 * @type {Object<number,Function>}
	 */
	static modalKeyEvents = {};
	/** Button DOM elements bound to modal key handlers, keyed by key mapping.
	 * @type {Object<number,HTMLElement>}
	 */
	static modalKeyEventButtonObjects = {};
	// Key Handling
	/** @enum {number} Key codes and modifier bit flags (CTRL/SHIFT/ALT/WIN resp. OPT/CMD on Mac) used for shortcut mappings. */
	static KEY = {
		A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90,
		_0: 48, _1: 49, _2: 50, _3: 51, _4: 52, _5: 53, _6: 54, _7: 55, _8: 56, _9: 57,
		SPACE: 32, TAB: 9, BACKSPACE: 8, ENTER: 13, ESCAPE: 27, PAGEUP: 33, PAGEDOWN: 34, END: 35, HOME: 36,
		LEFTARROW: 37, UPARROW: 38, RIGHTARROW: 39, DOWNARROW: 40, INSERT: 45, DELETE: 46, PAUSE: 19,
		ADD: 107, SUBTRACT: 109, MULTIPLY: 106, DIVIDE: 111,
		F1: 112, F2: 113, F3: 114, F4: 115, F5: 116, F6: 117, F7: 118, F8: 119, F9: 120, F10: 121, F11: 122, F12: 123,
		COMMA: 188, PERIOD: 190,
		CTRL: 0x0200, SHIFT: 0x0400,
		ALT: 0x0100, WIN: 0x0800, // Win only
		OPT: 0x0100, CMD: 0x0800, // Mac only
		KEYCTRL: 0x0011, KEYALT: 0x0012, KEYSHIFT: 0x0010, KEYCMD: 0x0013, KEYCMDMACLEFT: 0x005B, KEYCMDMACRIGHT: 0x005D
	};
	/** @enum {string} Mac-specific display strings (HTML entities) for special keys. */
	static KEYSTRMAC = {
		TAB: "&#8677;", BACKSPACE: "&#x232b;", ENTER: "&#x23ce;", ESCAPE: "&#9099;",
		CTRL: "^", SHIFT: "&#x21E7;",
		OPT: "&#x2325;", CMD: "&#x2318;"
	};
	/** GUI.KEYSTRMAC remapped by key code (filled at startup).
	 * @type {Object<number,string>}
	 */
	static KEYSTRMAC_BYCODE = {};
	/** @enum {string} Human-readable display strings for keys (i18n-registered where applicable). */
	static KEYSTR = {
		A: "A", B: "B", C: "C", D: "D", E: "E", F: "F", G: "G", H: "H", I: "I", J: "J", K: "K", L: "L", M: "M", N: "N", O: "O", P: "P", Q: "Q", R: "R", S: "S", T: "T", U: "U", V: "V", W: "W", X: "X", Y: "Y", Z: "Z",
		_0: "0", _1: "1", _2: "2", _3: "3", _4: "4", _5: "5", _6: "6", _7: "7", _8: "8", _9: "9",
		SPACE: 'Space<info context="key name"/>'.I18xRegister(), TAB: 'Tab<info context="key name"/>'.I18xRegister(), BACKSPACE: '&#x232b;<info context="key name backspace"/>'.I18xRegister(), ENTER: 'Enter<info context="key name"/>'.I18xRegister(), ESCAPE: 'ESC<info context="key name"/>'.I18xRegister(), PAGEUP: 'Page up<info context="key name"/>'.I18xRegister(), PAGEDOWN: 'Page down<info context="key name"/>'.I18xRegister(), END: 'End<info context="key name"/>'.I18xRegister(), HOME: 'Home<info context="key name"/>'.I18xRegister(),
		LEFTARROW: '←<info context="key name"/>'.I18xRegister(), UPARROW: '↑<info context="key name"/>'.I18xRegister(), RIGHTARROW: '→<info context="key name"/>'.I18xRegister(), DOWNARROW: '↓<info context="key name"/>'.I18xRegister(), INSERT: 'Insert<info context="key name"/>'.I18xRegister(), DELETE: 'Delete<info context="key name"/>'.I18xRegister(), PAUSE: 'Pause<info context="key name"/>'.I18xRegister(),
		ADD: "+", SUBTRACT: "-", MULTIPLY: "*", DIVIDE: "/",
		F1: "F1", F2: "F2", F3: "F3", F4: "F4", F5: "F5", F6: "F6", F7: "F7", F8: "F8", F9: "F9", F10: "F10", F11: "F11", F12: "F12",
		COMMA: ",", PERIOD: ".",
		CTRL: 'Ctrl<info context="key name"/>'.I18xRegister(), SHIFT: 'Shift<info context="key name"/>'.I18xRegister(),
		// Win only...
		ALT: 'Alt<info context="key name"/>'.I18xRegister(), WIN: 'Win<info context="key name"/>'.I18xRegister()
	};
	/** GUI.KEYSTR remapped by key code (filled at startup).
	 * @type {Object<number,string>}
	 */
	static KEYSTR_BYCODE = {};
	/** Maps KeyboardEvent.code letter codes to their expected characters (used to detect remapped layouts).
	 * @type {Object<string,string>}
	 */
	static KEYCODECHARS = { KeyA: "A", KeyB: "B", KeyC: "C", KeyD: "D", KeyE: "E", KeyF: "F", KeyG: "G", KeyH: "H", KeyI: "I", KeyJ: "J", KeyK: "K", KeyL: "L", KeyM: "M", KeyN: "N", KeyO: "Q", KeyP: "R", KeyQ: "S", KeyR: "R", KeyS: "S", KeyT: "T", KeyU: "U", KeyV: "V", KeyW: "W", KeyX: "X", KeyY: "Y", KeyZ: "Z" };
	/** Special characters mapped to their combined key mapping (key code plus modifier flags); platform-dependent.
	 * @type {Object<string,number>}
	 */
	static KEYCODESPECIALS = { "@": 81 + GUI.KEY.ALT + GUI.KEY.CTRL, "µ": 77 + GUI.KEY.ALT + GUI.KEY.CTRL, "€": 69 + GUI.KEY.ALT + GUI.KEY.CTRL };
	static { if (System.IS_MAC) GUI.KEYCODESPECIALS = { "@": 76 + GUI.KEY.ALT + GUI.KEY.CTRL, "µ": 77 + GUI.KEY.ALT + GUI.KEY.CTRL, "€": 69 + GUI.KEY.ALT + GUI.KEY.CTRL }; }
	/** Maps KeyboardEvent.code values to legacy numeric key codes.
	 * @type {Object<string,number>}
	 */
	static KEYCODEMAP = {
		KeyA: 65, KeyB: 66, KeyC: 67, KeyD: 68, KeyE: 69, KeyF: 70, KeyG: 71, KeyH: 72, KeyI: 73, KeyJ: 74, KeyK: 75, KeyL: 76, KeyM: 77, KeyN: 78, KeyO: 79, KeyP: 80, KeyQ: 81, KeyR: 82, KeyS: 83, KeyT: 84, KeyU: 85, KeyV: 86, KeyW: 87, KeyX: 88, KeyY: 89, KeyZ: 90,
		Digit0: 48, Digit1: 49, Digit2: 50, Digit3: 51, Digit4: 52, Digit5: 53, Digit6: 54, Digit7: 55, Digit8: 56, Digit9: 57,
		Space: 32, Tab: 9, Backspace: 8, Enter: 13, Escape: 27, PageUp: 33, PageDown: 34, End: 35, Home: 36,
		ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, Insert: 45, Delete: 46, Pause: 19,
		NumpadAdd: 107, NumpadSubtract: 109, NumpadMultiply: 106, NumpadDivide: 111,
		F1: 112, F2: 113, F3: 114, F4: 115, F5: 116, F6: 117, F7: 118, F8: 119, F9: 120, F10: 121, F11: 122, F12: 123,
		Comma: 188, Period: 190
	};
	/** Computes the combined key mapping (key code plus modifier bit flags) for a keyboard event.
	 * @param {KeyboardEvent} _ev Keyboard event.
	 * @returns {number} Combined key mapping value.
	 */
	static GETKEYMAPPING(_ev) {
		var key = 0, menu, tn, keyCode = 0, c;
		if (GUI.KEYCODECHARS.hasOwnProperty(_ev.code)) {
			c = _ev.key.toUpperCase();
			if (GUI.KEYCODECHARS[_ev.code] != c) {
				if (GUI.KEYCODEMAP.hasOwnProperty("Key" + c)) {
					keyCode = GUI.KEYCODEMAP["Key" + c];
				} else {
					keyCode = GUI.KEYCODEMAP[_ev.code];
				};
			} else {
				if (GUI.KEYCODEMAP.hasOwnProperty(_ev.code)) keyCode = GUI.KEYCODEMAP[_ev.code];
			};
		} else {
			if (GUI.KEYCODEMAP.hasOwnProperty(_ev.code)) keyCode = GUI.KEYCODEMAP[_ev.code];
		};
		if (GUI.KEYCODESPECIALS.hasOwnProperty(_ev.key)) {
			key = GUI.KEYCODESPECIALS[_ev.key];
		} else {
			if (System.IS_MAC) {
				key = (_ev.ctrlKey ? GUI.KEY.CTRL : 0) | (_ev.shiftKey ? GUI.KEY.SHIFT : 0) | (_ev.altKey ? GUI.KEY.OPT : 0) | (_ev.metaKey ? GUI.KEY.CMD : 0) | keyCode;
			} else {
				key = (_ev.ctrlKey ? GUI.KEY.CTRL : 0) | (_ev.shiftKey ? GUI.KEY.SHIFT : 0) | (_ev.altKey ? GUI.KEY.ALT : 0) | (_ev.metaKey ? GUI.KEY.WIN : 0) | keyCode;
			};
		};
		return key;
	}

	/** Converts a combined key mapping to a platform-specific human-readable shortcut string.
	 * @param {number} _key Combined key mapping value.
	 * @returns {string} Display string (empty for 0).
	 */
	static KeyToStr(_key) {
		if (_key == 0) return "";
		var s = [];
		if (System.IS_MAC) {
			if (_key & GUI.KEY.CTRL) s.push(GUI.KEYSTRMAC_BYCODE[_key & GUI.KEY.CTRL]);
			if (_key & GUI.KEY.OPT) s.push(GUI.KEYSTRMAC_BYCODE[_key & GUI.KEY.OPT]);
			if (_key & GUI.KEY.SHIFT) s.push(GUI.KEYSTRMAC_BYCODE[_key & GUI.KEY.SHIFT]);
			if (_key & GUI.KEY.CMD) s.push(GUI.KEYSTRMAC_BYCODE[_key & GUI.KEY.CMD]);
			s.push(GUI.KEYSTRMAC.hasOwnProperty(_key & 0xFF) ? GUI.KEYSTRMAC_BYCODE[_key & 0xFF] : GUI.KEYSTR_BYCODE[_key & 0xFF]);
			s = s.join("");
		} else {
			if (_key & GUI.KEY.ALT) s.push(GUI.KEYSTR_BYCODE[_key & GUI.KEY.ALT]);
			if (_key & GUI.KEY.SHIFT) s.push(GUI.KEYSTR_BYCODE[_key & GUI.KEY.SHIFT]);
			if (_key & GUI.KEY.CTRL) s.push(GUI.KEYSTR_BYCODE[_key & GUI.KEY.CTRL]);
			if (_key & GUI.KEY.WIN) s.push(GUI.KEYSTR_BYCODE[_key & GUI.KEY.WIN]);
			s.push(GUI.KEYSTR_BYCODE[_key & 0xFF]);
			s = s.join("+");
		};
		return s;
	}

	/** Registers a panel as shared between multiple GUIs.
	 * @param {Panel} _panel Panel to register.
	 */
	static AddInterGUIPanel(_panel) {
		GUI.interGUIPanels[_panel.id] = _panel;
	}

	/** Removes a panel from the inter-GUI panel registry.
	 * @param {Panel} _panel Panel to remove.
	 */
	static RemoveInterGUIPanel(_panel) {
		delete GUI.interGUIPanels[_panel.id];
	}

	// Menu Handling
	/** Builds the HTML of the top menu and resets the menu/shortcut registries.
	 * @returns {string} Menu HTML.
	 */
	MenuHTML() {
		this.menuKeys = {};
		this.menus = {};
		return this.topMenu.HTML(0, this, this.topMenu);
	}

	// General Handling
	/** window.onbeforeunload handler; collects UnloadCheck() messages from all initialized GUIs.
	 * @param {BeforeUnloadEvent} _ev Unload event.
	 * @returns {?string} Combined warning message or null if leaving is fine.
	 */
	static OnBeforeUnload(_ev) {
		var g, msgs = [], m;
		for (g in GUIS) {
			if (GUIS[g].isInit) {
				if (GUIS[g].hasOwnProperty("UnloadCheck")) {
					m = GUIS[g].UnloadCheck();
					if (m != "") msgs.push(m);
				};
			};
		};
		if (msgs.length > 0) {
			_ev.returnValue = msgs.join("\n");
			PlaySound("confirm");
			return _ev.returnValue;
		};
		return null;
	}

	/** Global window.onerror handler; plays an error sound and shows an alert with error details.
	 * @param {string} _errorMsg Error message.
	 * @param {string} _url Script URL.
	 * @param {number} _lineNumber Line number.
	 * @param {number} _column Column number.
	 * @param {Error} _errorObj Error object (stack trace).
	 */
	static OnError(_errorMsg, _url, _lineNumber, _column, _errorObj) {
		var e;
		try { PlaySound("error"); } catch (e) { };
		try {
			curGUI.ShowAlert('Javascript Error<info context="Alert Message Title"/>'.I18xTrans(), 'A Javascript error occurred: Error: <error/><newline/>Script:<script/><newline/>Line:<line/><newline/>Column:<column/><newline/>StackTrace:<stacktrace/><info context="Alert Message"/>'.I18xTrans({ error: _errorMsg, script: _url, line: _lineNumber, column: _column, stacktrace: _errorObj }));
		} catch (e) {
			/*-- @<BUILD_ONLY_ON_BUILDS:Debug --*/
			alert('Error: ' + _errorMsg + ' Script: ' + _url + ' Line: ' + _lineNumber + ' Column: ' + _column + ' StackTrace: ' + _errorObj);
			/*-- @>BUILD_ONLY_ON_BUILDS --*/
			/*-- @<BUILD_NEVER_ON_BUILDS:Release ----
				document.location.ref="./serverexceptions/exceptionjs.html";
			---- @>BUILD_NEVER_ON_BUILDS --*/
		};
	}

	/** Initializes all registered GUIs (calls their Init() once) and installs the unload handler. */
	static InitAll() {
		var g;
		window.onbeforeunload = GUI.OnBeforeUnload;
		/*-- @<BUILD_ONLY_ON_BUILDS:Release,Debug ----
			window.onerror=GUI.OnError;
		---- @>BUILD_ONLY_ON_BUILDS --*/
		for (g in GUIS) if (!GUIS[g].isInit) if (GUIS[g].hasOwnProperty("Init")) { GUIS[g].Init(); GUIS[g].isInit = true; };
	}

	/** Shuts down all registered GUIs: resets menus/panels and calls their Exit() if initialized. */
	static ExitAll() {
		var g;
		for (g in GUIS) {
			GUIS[g].topMenu = new Menu(GUIS[g].id, GUIS[g].id);
			GUIS[g].menus = {};
			GUIS[g].panels = {};
			if (GUIS[g].isInit) if (GUIS[g].hasOwnProperty("Exit")) { GUIS[g].Exit(); GUIS[g].isInit = false; };
		};
	}

	/** Notifies all initialized GUIs that the current user changed (calls their OnUserChanged()). */
	static OnUserChangedAll() {
		var g;
		for (g in GUIS) if (GUIS[g].isInit) if (GUIS[g].hasOwnProperty("OnUserChanged")) { GUIS[g].OnUserChanged(); };
	}

	/** Rebuilds the top menu HTML in place (if its DOM element exists). */
	ReBuildMenu() {
		var o = document.getElementById(this.topMenu.fullId);
		if (o) {
			o.innerHTML = this.MenuHTML();
		};
	}

	/** Builds the complete GUI layout HTML (menu, docked panel containers with grips, main container, float panels) and computes the grid templates.
	 * @returns {string} GUI HTML.
	 */
	HTML() {
		var h = "", i, l, attrOnlyDropStr = ' name="guigrip" onmouseenter="GUI.OnGripMouseEnter(event,this);" onmouseleave="GUI.OnGripMouseLeave(event,this);" onmouseup="GUI.OnGripMouseUp(event,this);" ', attrGripStr = ' name="guigrip" onmouseenter="GUI.OnGripMouseEnter(event,this);" onmouseleave="GUI.OnGripMouseLeave(event,this);" onmousedown="GUI.OnGripMouseDown(event,this);" onmouseup="GUI.OnGripMouseUp(event,this);" ';
		var dropSize = 3, gripSize = 5, menuHeight = 20;
		h += '<div id="gui" class="guiContainer">';
		h += this.MenuHTML();
		this.noOfGridCols = 3;
		this.noOfGridRows = 4;
		this.gridTemplateCols = [];
		this.gridTemplateRows = [menuHeight];
		//...20px for menu...

		l = this.leftPanelContainers.length;
		this.noOfGridCols += 2 * l;
		h += '<div id="leftgrip_main" ' + attrOnlyDropStr + 'class="verPanelContainerGrip onlyDropper"></div>';
		this.gridTemplateCols.push(dropSize);
		for (i = 0; i < l; i++) {
			h += '<div id="topgrip_left_' + this.leftPanelContainers[i].id + '" ' + attrOnlyDropStr + 'class="horPanelContainerGrip onlyDropper"></div>';
			h += this.leftPanelContainers[i].HTML();
			this.gridTemplateCols.push(this.leftPanelContainers[i].size);
			h += '<div id="rightgrip_left_' + this.leftPanelContainers[i].id + '" ' + attrGripStr + 'class="verPanelContainerGrip"></div>';
			this.gridTemplateCols.push(gripSize);
			h += '<div id="bottomgrip_left_' + this.leftPanelContainers[i].id + '" ' + attrOnlyDropStr + 'class="horPanelContainerGrip onlyDropper"></div>';
		};

		l = this.topPanelContainers.length;
		h += '<div id="topgrip_main" ' + attrOnlyDropStr + 'class="horPanelContainerGrip onlyDropper"></div>';
		this.gridTemplateRows.push(dropSize);
		this.noOfGridRows += 2 * l;
		for (i = 0; i < l; i++) {
			h += this.topPanelContainers[i].HTML();
			this.gridTemplateRows.push(this.topPanelContainers[i].size);
			h += '<div id="bottomgrip_top_' + this.topPanelContainers[i].id + '" ' + attrGripStr + 'class="horPanelContainerGrip"></div>';
			this.gridTemplateRows.push(gripSize);
		};

		this.gridTemplateCols.push(-1);
		this.gridTemplateRows.push(-1);
		h += this.mainPanelContainer.HTML();

		l = this.bottomPanelContainers.length;
		this.noOfGridRows += 2 * l;
		for (i = 0; i < l; i++) {
			h += '<div id="topgrip_bottom_' + this.bottomPanelContainers[i].id + '" ' + attrGripStr + 'class="horPanelContainerGrip"></div>';
			this.gridTemplateRows.push(gripSize);
			h += this.bottomPanelContainers[i].HTML();
			this.gridTemplateRows.push(this.bottomPanelContainers[i].size);
		};
		h += '<div id="bottomgrip_main" ' + attrOnlyDropStr + 'class="horPanelContainerGrip onlyDropper"></div>';
		this.gridTemplateRows.push(dropSize);

		l = this.rightPanelContainers.length;
		this.noOfGridCols += 2 * l;
		for (i = 0; i < l; i++) {
			h += '<div id="leftgrip_right_' + this.rightPanelContainers[i].id + '" ' + attrGripStr + 'class="verPanelContainerGrip"></div>';
			h += '<div id="topgrip_right_' + this.rightPanelContainers[i].id + '" ' + attrOnlyDropStr + 'class="horPanelContainerGrip onlyDropper"></div>';
			this.gridTemplateCols.push(gripSize);
			h += this.rightPanelContainers[i].HTML();
			this.gridTemplateCols.push(this.rightPanelContainers[i].size);
			h += '<div id="bottomgrip_right_' + this.rightPanelContainers[i].id + '" ' + attrOnlyDropStr + 'class="horPanelContainerGrip onlyDropper"></div>';
		};
		h += '<div id="rightgrip_main" ' + attrOnlyDropStr + 'class="verPanelContainerGrip onlyDropper"></div>';
		this.gridTemplateCols.push(dropSize);

		h += '</div>';

		h += '<div id="guifloatpanels" class="guiFloatPanels">';
		l = this.floatPanels.length;
		for (i = 0; i < l; i++) {
			h += this.floatPanels[i].HTML(true, i);
		};
		h += '</div>';

		//if(System.IS_SAFARI){
		//	h+='<div id="appleshit" style="position:fixed;top:60px;width:100%;z-index:10001;">';
		//		h+=this.MenuHTML();
		//	h+='</div>';
		//};
		return h;
	}

	/** Combined key mapping of the most recent keydown event.
	 * @type {number}
	 */
	static LastDownKey = 0;
	/** Registers extra window-level event callbacks for this GUI.
	 * @param {Object} _events Map with optional keys: keyup, keydown, mousemove, mousewheel, resize.
	 */
	SetUpWindowEvents(_events) {
		this.extraKeyUpEvent = (_events.hasOwnProperty("keyup") ? _events.keyup : null);
		this.extraKeyDownEvent = (_events.hasOwnProperty("keydown") ? _events.keydown : null);
		this.extraMouseMoveEvent = (_events.hasOwnProperty("mousemove") ? _events.mousemove : null);
		this.extraMouseWheelEvent = (_events.hasOwnProperty("mousewheel") ? _events.mousewheel : null);
		this.extraResizeEvent = (_events.hasOwnProperty("resize") ? _events.resize : null);
	}

	/** Global keydown handler: tracks modifier state, triggers menu shortcuts, and forwards to the extra keydown callback.
	 * @param {KeyboardEvent} _ev Keyboard event.
	 */
	OnKeyDown(_ev) {
		var key = 0, menu, tn;
		//GUI.FixKeyEventBullShitTimer=setTimeout(GUI.FixKeyEventBullShitTimer,1000);
		if (curGUI.keyDowns[_ev.keyCode]) return;
		//if(!_ev.metaKey&&_ev.keyCode!=GUI.KEY.KEYCMDMACRIGHT&&_ev.keyCode!=GUI.KEY.KEYCMDMACLEFT)curGUI.keyDowns[_ev.keyCode]=true;
		if (curGUI.modalMode) return;
		tn = document.activeElement.tagName;
		if (tn == "INPUT" || tn == "TEXTAREA") return;
		if (_ev.target.nodeName == "TEXTAREA") return;
		key = GUI.GETKEYMAPPING(_ev);
		//log(GUI.KeyToStr(key).I18xTrans(),_ev);
		curGUI.specialKeyChange = 0;
		switch (_ev.keyCode) {
			case GUI.KEY.KEYCTRL:
				curGUI.ctrlKeyPressed = true;
				curGUI.specialKeyChange = GUI.KEY.KEYCTRL;
				break;
			case GUI.KEY.KEYALT:
				curGUI.altKeyPressed = true;
				curGUI.specialKeyChange = GUI.KEY.KEYALT;
				break;
			case GUI.KEY.KEYCMD:
				curGUI.cmdKeyPressed = true;
				curGUI.specialKeyChange = GUI.KEY.KEYCMD;
				break;
			case GUI.KEY.KEYCMDMACLEFT:
				curGUI.cmdKeyPressed = !curGUI.keyDowns[GUI.KEY.KEYCMDMACRIGHT];
				curGUI.specialKeyChange = GUI.KEY.KEYCMD;
				break;
			case GUI.KEY.KEYCMDMACRIGHT:
				curGUI.cmdKeyPressed = !curGUI.keyDowns[GUI.KEY.KEYCMDMACLEFT];
				curGUI.specialKeyChange = GUI.KEY.KEYCMD;
				break;
			case GUI.KEY.KEYSHIFT:
				curGUI.shiftKeyPressed = true;
				curGUI.specialKeyChange = GUI.KEY.KEYSHIFT;
				break;
		};
		GUI.LastDownKey = key;
		//log("DOKEY DOWN",key);
		if (curGUI.menuKeys.hasOwnProperty(key)) {
			menu = curGUI.menuKeys[key];
			//log("menuKeys.hasOwnProperty(key)");
			if (menu.Call()) _ev.preventDefault();
		};
		//log("DOWN2",key,_ev);
		if (curGUI.extraKeyDownEvent != null) curGUI.extraKeyDownEvent(_ev, key);
		_ev.preventDefault();
	}

	/** Global keyup handler: clears modifier state, handles modal dialog key shortcuts, and forwards to the extra keyup callback.
	 * @param {KeyboardEvent} _ev Keyboard event.
	 */
	OnKeyUp(_ev) {
		var key = 0, menu, tn;
		key = GUI.GETKEYMAPPING(_ev);
		tn = document.activeElement.tagName;
		if (tn == "INPUT" || tn == "TEXTAREA") return;
		if (_ev.target.nodeName == "TEXTAREA") return;
		curGUI.keyDowns[_ev.keyCode] = false;
		if (curGUI.modalMode) {
			if (GUI.modalKeyEvents.hasOwnProperty(key)) {
				if (!GUI.modalKeyEventButtonObjects[key].className.hasClass("disabled")) GUI.modalKeyEvents[key]({}, GUI.modalKeyEventButtonObjects[key]);
			};
			return;
		};
		//log("UP",key,_ev);
		switch (_ev.keyCode) {
			case GUI.KEY.KEYCTRL:
				curGUI.ctrlKeyPressed = false;
				curGUI.specialKeyChange = GUI.KEY.KEYCTRL;
				break;
			case GUI.KEY.KEYALT:
				curGUI.altKeyPressed = false;
				curGUI.specialKeyChange = GUI.KEY.KEYALT;
				break;
			case GUI.KEY.KEYCMD:
				curGUI.cmdKeyPressed = false;
				curGUI.specialKeyChange = GUI.KEY.KEYCMD;
				break;
			case GUI.KEY.KEYCMDMACLEFT:
				curGUI.cmdKeyPressed = !curGUI.keyDowns[GUI.KEY.KEYCMDMACRIGHT];
				curGUI.specialKeyChange = GUI.KEY.KEYCMD;
				break;
			case GUI.KEY.KEYCMDMACRIGHT:
				curGUI.cmdKeyPressed = !curGUI.keyDowns[GUI.KEY.KEYCMDMACLEFT];
				curGUI.specialKeyChange = GUI.KEY.KEYCMD;
				break;
			case GUI.KEY.KEYSHIFT:
				curGUI.shiftKeyPressed = false;
				curGUI.specialKeyChange = GUI.KEY.KEYSHIFT;
				break;
		};
		if (key != GUI.LastDownKey) {
			//log("DOKEY UP",key);
			GUI.LastDownKey = 0;
			if (curGUI.menuKeys.hasOwnProperty(key)) {
				menu = curGUI.menuKeys[key];
				if (menu.Call()) _ev.preventDefault();
			};
		};
		if (curGUI.extraKeyUpEvent != null) curGUI.extraKeyUpEvent(_ev, key);
		_ev.preventDefault();
	}

	/** Global mousedown handler; ignored while a modal dialog is open.
	 * @param {MouseEvent} _ev Mouse event.
	 */
	OnMouseDown(_ev) {
		if (curGUI.modalMode) return;
	}

	/** Global mouseup handler: finishes floating panel drag/resize and container-grip resize operations.
	 * @param {MouseEvent} _ev Mouse event.
	 */
	OnMouseUp(_ev) {
		var p, o;
		if (curGUI.modalMode) return;
		switch (curGUI.generalMouseMode) {
			case GUI.GENERALMOUSEMODE_FLOATPANELDRAG:
				PlaySound("button_up");
				p = curGUI.floatDragPanel.panel;
				o = document.getElementById("panel_" + p.id);
				o.className = o.className.removeClass("drag");
				o.className = o.className.removeClass("paneldock");
				curGUI.generalMouseMode = GUI.GENERALMOUSEMODE_NONE;
				GUI.SetGeneralCursor("");
				curGUI.SelectableForSizingGrips(true);
				curGUI.RemoveSelectableForDockingGrips();
				_ev.preventDefault();
				if (globalThis.MCEUnFreeze !== undefined) globalThis.MCEUnFreeze();
				break;
			case GUI.GENERALMOUSEMODE_FLOATPANELSIZE:
				PlaySound("button_up");
				p = curGUI.floatSizePanel.panel;
				o = document.getElementById("panel_" + p.id);
				o.className = o.className.removeClass("drag");
				curGUI.generalMouseMode = GUI.GENERALMOUSEMODE_NONE;
				GUI.SetGeneralCursor("");
				curGUI.SelectableForSizingGrips(true);
				if (curGUI) if (curGUI.isActive) if (p.eventHandler != null) {
					//p.eventHandler({type:Panel.EVENTTYPE_DOCKCHANGED,panel:p});
					p.eventHandler({ type: Panel.EVENTTYPE_SIZECHANGED, panel: p });
				}
				_ev.preventDefault();
				if (globalThis.MCEUnFreeze !== undefined) globalThis.MCEUnFreeze();
				break;
			case GUI.GENERALMOUSEMODE_PANELCONTAINERSIZE:
				curGUI.sizePanelContainer.domElement.className = curGUI.sizePanelContainer.domElement.className.removeClass("sel");
				PlaySound("button_up");
				curGUI.generalMouseMode = GUI.GENERALMOUSEMODE_NONE;
				_ev.preventDefault();
				break;
		};
	}

	/** Global mousemove handler: performs floating panel drag/resize and container-grip resizing, then forwards to the extra mousemove callback.
	 * @param {MouseEvent} _ev Mouse event.
	 */
	OnMouseMove(_ev) {
		var o, panelHeaderAndMenuHeight = 80, og, size, x, y, w, h, p;
		if (curGUI.modalMode) return;
		switch (curGUI.generalMouseMode) {
			case GUI.GENERALMOUSEMODE_FLOATPANELDRAG:
				og = document.getElementById("guifloatpanels");
				o = document.getElementById("panel_" + curGUI.floatDragPanel.panel.id);
				x = (_ev.clientX - curGUI.floatDragPanel.offX); // +panelHeaderAndMenuHeight
				y = (_ev.clientY - curGUI.floatDragPanel.offY);
				x = Math.range(x, 0 - og.clientWidth + 20, og.clientWidth - 20);
				y = Math.range(y, 0, og.clientHeight - 20);
				o.style.left = x + "px";
				o.style.top = y + "px";
				p = curGUI.floatDragPanel.panel;
				p.top = y;
				p.left = x;
				_ev.preventDefault();
				break;
			case GUI.GENERALMOUSEMODE_FLOATPANELSIZE:
				og = document.getElementById("guifloatpanels");
				o = document.getElementById("panel_" + curGUI.floatSizePanel.panel.id);
				w = (_ev.clientX - curGUI.floatSizePanel.startX + curGUI.floatSizePanel.startWidth);
				h = (_ev.clientY - curGUI.floatSizePanel.startY + curGUI.floatSizePanel.startHeight);
				w = Math.range(w, 40, og.clientWidth - 20);
				h = Math.range(h, 40, og.clientHeight - 40);
				o.style.width = w + "px";
				o.style.height = h + "px";
				p = curGUI.floatSizePanel.panel;
				p.width = w;
				p.height = h;
				if (p.eventHandler != null) p.eventHandler({ type: Panel.EVENTTYPE_SIZECHANGED, panel: p });
				_ev.preventDefault();
				break;
			case GUI.GENERALMOUSEMODE_PANELCONTAINERSIZE:
				switch (curGUI.sizePanelContainer.dir) {
					case "left":
						size = _ev.clientX - curGUI.sizePanelContainer.startX + curGUI.sizePanelContainer.size;
						if (size < 20) size = 20;
						if (size > curGUI.sizePanelContainer.maxSize) size = curGUI.sizePanelContainer.maxSize;
						curGUI.leftPanelContainers[curGUI.sizePanelContainer.no].size = size;
						curGUI.gridTemplateCols[curGUI.sizePanelContainer.rcno] = size;
						curGUI._SetUpGUIGridTemplate();
						_ev.preventDefault();
						break;
					case "right":
						size = curGUI.sizePanelContainer.startX - _ev.clientX + curGUI.sizePanelContainer.size;
						if (size < 20) size = 20;
						if (size > curGUI.sizePanelContainer.maxSize) size = curGUI.sizePanelContainer.maxSize;
						curGUI.rightPanelContainers[curGUI.sizePanelContainer.no].size = size;
						curGUI.gridTemplateCols[curGUI.sizePanelContainer.rcno] = size;
						curGUI._SetUpGUIGridTemplate();
						_ev.preventDefault();
						break;
					case "top":
						size = _ev.clientY - curGUI.sizePanelContainer.startY + curGUI.sizePanelContainer.size;
						if (size < 20) size = 20;
						if (size > curGUI.sizePanelContainer.maxSize) size = curGUI.sizePanelContainer.maxSize;
						curGUI.topPanelContainers[curGUI.sizePanelContainer.no].size = size;
						curGUI.gridTemplateRows[curGUI.sizePanelContainer.rcno] = size;
						curGUI._SetUpGUIGridTemplate();
						_ev.preventDefault();
						break;
					case "bottom":
						size = curGUI.sizePanelContainer.startY - _ev.clientY + curGUI.sizePanelContainer.size;
						if (size < 20) size = 20;
						if (size > curGUI.sizePanelContainer.maxSize) size = curGUI.sizePanelContainer.maxSize;
						curGUI.bottomPanelContainers[curGUI.sizePanelContainer.no].size = size;
						curGUI.gridTemplateRows[curGUI.sizePanelContainer.rcno] = size;
						curGUI._SetUpGUIGridTemplate();
						_ev.preventDefault();
						break;
				};
				break;
		};
		if (curGUI.extraMouseMoveEvent != null) curGUI.extraMouseMoveEvent(_ev);
	}

	/** Global mouse wheel handler; forwards to the extra mousewheel callback unless a modal dialog is open.
	 * @param {WheelEvent} _ev Wheel event.
	 */
	OnMouseWheel(_ev) {
		if (curGUI.modalMode) return;
		if (curGUI.extraMouseWheelEvent != null) curGUI.extraMouseWheelEvent(_ev);
	}

	/** Global contextmenu handler; suppresses the browser context menu.
	 * @param {MouseEvent} _ev Context menu event.
	 */
	OnContextMenu(_ev) {
		_ev.preventDefault();
	}

	/** Docks a panel into a panel container (at its start or end) and updates DOM, preferred position, and container grid.
	 * @param {string} _cName Container side name ("left", "right", "top", "bottom").
	 * @param {PanelContainer[]} _containers Container array of that side.
	 * @param {number} _cid Target container id.
	 * @param {Panel} _panel Panel to dock.
	 * @param {boolean} _atBegin True to insert as first panel, false to append.
	 */
	static InsertPanelIntoContainer(_cName, _containers, _cid, _panel, _atBegin) {
		var no = curGUI.GetPanelContainerNoOfId(_containers, _cid), mno = no, np = document.createElement("div"), i, l, o;
		_panel.isDocked = true;
		curGUI.floatPanels.RemoveElement(_panel);
		o = document.getElementById("panel_" + _panel.id);
		if (o) o.outerHTML = "";
		np.innerHTML = _panel.HTML(false);
		//log(no,_containers);
		if (_atBegin) {
			_containers[no].panels = ObjectUtils.insertFirstProperty(_containers[no].panels, _panel.id, _panel);
			document.getElementById("panelcontainer_" + _cid).insertBefore(np.firstChild, document.getElementById("panelcontainer_" + _cid).firstChild);
			if (_cName == "right" || _cName == "bottom") no = _containers.length - no - 1;
			_panel.prefContainer = _cName + "," + no + ",0";
		} else {
			_containers[no].panels[_panel.id] = _panel;
			document.getElementById("panelcontainer_" + _cid).appendChild(np.firstChild);
			if (_cName == "right" || _cName == "bottom") no = _containers.length - no - 1;
			_panel.prefContainer = _cName + "," + no + ",99";
		};
		_panel.visible = true;
		if (_panel.menu != null) _panel.menu.SetToggle(_panel.visible);
		if (_panel.eventHandler != null) _panel.eventHandler({ type: Panel.EVENTTYPE_DOCKCHANGED, panel: _panel });
		switch (_cName) {
			case "left": curGUI.leftPanelContainers[mno].SetUpContainerGrid(); break;
			case "right": curGUI.rightPanelContainers[mno].SetUpContainerGrid(); break;
			case "top": curGUI.topPanelContainers[mno].SetUpContainerGrid(); break;
			case "bottom": curGUI.bottomPanelContainers[mno].SetUpContainerGrid(); break;
		};
	}

	/** Creates a new docked panel container on the given side (before/after an existing container) and inserts its DOM/grid entries.
	 * @param {string} _caryName Side name ("left", "right", "top", "bottom").
	 * @param {number} _cid Existing container id to insert next to, or -1 for the outermost position.
	 * @param {number} [_size=150] Container size in pixels.
	 * @returns {number} Id of the newly created container (-1 on unknown side).
	 */
	static CreateNewPanelContainer(_caryName, _cid, _size) {
		var cno, ogui = document.getElementById("gui"), nc = document.createElement("div"), h = "", ncc, i, l;
		var attrOnlyDropStr = ' name="guigrip" onmouseenter="GUI.OnGripMouseEnter(event,this);" onmouseleave="GUI.OnGripMouseLeave(event,this);" onmouseup="GUI.OnGripMouseUp(event,this);" ', attrGripStr = ' name="guigrip" onmouseenter="GUI.OnGripMouseEnter(event,this);" onmouseleave="GUI.OnGripMouseLeave(event,this);" onmousedown="GUI.OnGripMouseDown(event,this);" onmouseup="GUI.OnGripMouseUp(event,this);" ';
		var ret = -1, l, wasGridChange = false;
		wasGridChange = true;
		if (_size === undefined) _size = 150;
		switch (_caryName) {
			case "left":
				if (_cid == -1) {
					curGUI.leftPanelContainers.unshift(new PanelContainer(_size));
					cno = 0;
				} else {
					cno = curGUI.GetPanelContainerNoOfId(curGUI.leftPanelContainers, _cid) + 1;
					curGUI.leftPanelContainers.splice(cno, 0, new PanelContainer(_size));
				};
				curGUI.gridTemplateCols.splice(cno * 2 + 1, 0, _size, 5);
				curGUI.noOfGridCols += 2;
				h += '<div id="topgrip_left_' + curGUI.leftPanelContainers[cno].id + '" ' + attrOnlyDropStr + 'class="horPanelContainerGrip onlyDropper"></div>';
				h += curGUI.leftPanelContainers[cno].HTML();
				h += '<div id="rightgrip_left_' + curGUI.leftPanelContainers[cno].id + '" ' + attrGripStr + 'class="verPanelContainerGrip"></div>';
				h += '<div id="bottomgrip_left_' + curGUI.leftPanelContainers[cno].id + '" ' + attrOnlyDropStr + 'class="horPanelContainerGrip onlyDropper"></div>';
				ret = curGUI.leftPanelContainers[cno].id;
				break;
			case "right":
				if (_cid == -1) {
					curGUI.rightPanelContainers.push(new PanelContainer(_size));
					cno = curGUI.rightPanelContainers.length - 1;
				} else {
					cno = curGUI.GetPanelContainerNoOfId(curGUI.rightPanelContainers, _cid);
					curGUI.rightPanelContainers.splice(cno, 0, new PanelContainer(_size));
				};
				l = curGUI.rightPanelContainers.length;
				curGUI.gridTemplateCols.splice(curGUI.leftPanelContainers.length * 2 + 2 + (cno) * 2, 0, 5, _size);
				curGUI.noOfGridCols += 2;
				h += '<div id="leftgrip_right_' + curGUI.rightPanelContainers[cno].id + '" ' + attrGripStr + 'class="verPanelContainerGrip"></div>';
				h += '<div id="topgrip_right_' + curGUI.rightPanelContainers[cno].id + '" ' + attrOnlyDropStr + 'class="horPanelContainerGrip onlyDropper"></div>';
				h += curGUI.rightPanelContainers[cno].HTML();
				h += '<div id="bottomgrip_right_' + curGUI.rightPanelContainers[cno].id + '" ' + attrOnlyDropStr + 'class="horPanelContainerGrip onlyDropper"></div>';
				ret = curGUI.rightPanelContainers[cno].id;
				break;
			case "top":
				if (_cid == -1) {
					curGUI.topPanelContainers.unshift(new PanelContainer(_size));
					cno = 0;
				} else {
					cno = curGUI.GetPanelContainerNoOfId(curGUI.topPanelContainers, _cid) + 1;
					curGUI.topPanelContainers.splice(cno, 0, new PanelContainer(_size));
				};
				curGUI.gridTemplateRows.splice(cno * 2 + 2, 0, _size, 5);
				curGUI.noOfGridRows += 2;
				h += curGUI.topPanelContainers[cno].HTML();
				h += '<div id="bottomgrip_top_' + curGUI.topPanelContainers[cno].id + '" ' + attrGripStr + 'class="horPanelContainerGrip"></div>';
				ret = curGUI.topPanelContainers[cno].id;
				break;
			case "bottom":
				if (_cid == -1) {
					curGUI.bottomPanelContainers.push(new PanelContainer(_size));
					cno = curGUI.bottomPanelContainers.length - 1;
				} else {
					cno = curGUI.GetPanelContainerNoOfId(curGUI.bottomPanelContainers, _cid);
					curGUI.bottomPanelContainers.splice(cno, 0, new PanelContainer(_size));
				};
				l = curGUI.bottomPanelContainers.length;
				curGUI.gridTemplateRows.splice(curGUI.topPanelContainers.length * 2 + 3 + (cno) * 2, 0, 5, _size);
				curGUI.noOfGridRows += 2;
				h += '<div id="topgrip_bottom_' + curGUI.bottomPanelContainers[cno].id + '" ' + attrGripStr + 'class="horPanelContainerGrip"></div>';
				h += curGUI.bottomPanelContainers[cno].HTML();
				ret = curGUI.bottomPanelContainers[cno].id;
				break;
		};
		nc.innerHTML = h;
		ncc = nc.childNodes;
		l = ncc.length;
		for (i = 0; i < l; i++)ogui.appendChild(ncc[0]);
		if (wasGridChange) curGUI._SetUpGUIGrid();
		return ret;
	}

	/** Mouseup handler on a grip element: docks the currently dragged floating panel into the container indicated by the grip.
	 * @param {MouseEvent} _ev Mouse event.
	 * @param {HTMLElement} _this Grip DOM element.
	 */
	static OnGripMouseUp(_ev, _this) {
		var g, p;
		if (curGUI != null) if (curGUI.isActive) {
			if (curGUI.generalMouseMode == GUI.GENERALMOUSEMODE_FLOATPANELDRAG) {
				// dock panel...
				PlaySound("button_up");
				p = curGUI.floatDragPanel.panel;
				if (p.eventHandler != null) p.eventHandler({ type: Panel.EVENTTYPE_WILLREMOVEDFROMDOM, panel: p });
				switch (curGUI.generalMouseMode) {
					case GUI.GENERALMOUSEMODE_FLOATPANELDRAG:
						g = _this.id.split("_");
						switch (g[1]) {
							case "main":
								switch (g[0]) {
									case "leftgrip":
										GUI.InsertPanelIntoContainer("left", curGUI.leftPanelContainers, GUI.CreateNewPanelContainer("left", -1), p, true);
										break;
									case "rightgrip":
										GUI.InsertPanelIntoContainer("right", curGUI.rightPanelContainers, GUI.CreateNewPanelContainer("right", -1), p, true);
										break;
									case "topgrip":
										GUI.InsertPanelIntoContainer("top", curGUI.topPanelContainers, GUI.CreateNewPanelContainer("top", -1), p, true);
										break;
									case "bottomgrip":
										GUI.InsertPanelIntoContainer("bottom", curGUI.bottomPanelContainers, GUI.CreateNewPanelContainer("bottom", -1), p, true);
										break;
								};
								break;
							case "left":
								switch (g[0]) {
									case "rightgrip":
										GUI.InsertPanelIntoContainer("left", curGUI.leftPanelContainers, GUI.CreateNewPanelContainer("left", parseInt(g[2], 10)), p, true);
										break;
									case "topgrip":
										GUI.InsertPanelIntoContainer("left", curGUI.leftPanelContainers, parseInt(g[2], 10), p, true);
										break;
									case "bottomgrip":
										GUI.InsertPanelIntoContainer("left", curGUI.leftPanelContainers, parseInt(g[2], 10), p, false);
										break;
								};
								break;
							case "right":
								switch (g[0]) {
									case "leftgrip":
										GUI.InsertPanelIntoContainer("right", curGUI.rightPanelContainers, GUI.CreateNewPanelContainer("right", parseInt(g[2], 10)), p, true);
										break;
									case "topgrip":
										GUI.InsertPanelIntoContainer("right", curGUI.rightPanelContainers, parseInt(g[2], 10), p, true);
										break;
									case "bottomgrip":
										GUI.InsertPanelIntoContainer("right", curGUI.rightPanelContainers, parseInt(g[2], 10), p, false);
										break;
								};
								break;
							case "top":
								switch (g[0]) {
									case "bottomgrip":
										GUI.InsertPanelIntoContainer("top", curGUI.topPanelContainers, parseInt(g[2], 10), p, false);
										break;
								};
								break;
							case "bottom":
								switch (g[0]) {
									case "topgrip":
										GUI.InsertPanelIntoContainer("bottom", curGUI.bottomPanelContainers, parseInt(g[2], 10), p, false);
										break;
								};
								break;
						};
						curGUI.generalMouseMode = GUI.GENERALMOUSEMODE_NONE;
						GUI.SetGeneralCursor("");
						curGUI.SelectableForSizingGrips(true);
						curGUI.RemoveSelectableForDockingGrips();
						break;
				};
			};
		};
	}

	/** Mouseenter handler on a grip element: highlights it as a docking target while a floating panel is dragged.
	 * @param {MouseEvent} _ev Mouse event.
	 * @param {HTMLElement} _this Grip DOM element.
	 */
	static OnGripMouseEnter(_ev, _this) {
		var po;
		if (curGUI != null) if (curGUI.isActive) {
			if (curGUI.generalMouseMode == GUI.GENERALMOUSEMODE_FLOATPANELDRAG) {
				switch (curGUI.generalMouseMode) {
					case GUI.GENERALMOUSEMODE_FLOATPANELDRAG:
						_this.className = _this.className.addClass("selectableForDocking");
						po = document.getElementById("panel_" + curGUI.floatDragPanel.panel.id);
						if (po) po.className = po.className.addClass("paneldock");
						_this.className = _this.className.addClass("selectableForDocking");
						//document.getElementById("body").className=document.getElementById("body").className.addClass("cursor_paneldock");
						break;
				};
			};
		};
	}

	/** Mouseleave handler on a grip element: removes the docking-target highlight.
	 * @param {MouseEvent} _ev Mouse event.
	 * @param {HTMLElement} _this Grip DOM element.
	 */
	static OnGripMouseLeave(_ev, _this) {
		var po;
		if (curGUI != null) if (curGUI.isActive) {
			if (curGUI.generalMouseMode == GUI.GENERALMOUSEMODE_FLOATPANELDRAG) {
				switch (curGUI.generalMouseMode) {
					case GUI.GENERALMOUSEMODE_FLOATPANELDRAG:
						_this.className = _this.className.removeClass("selectableForDocking");
						po = document.getElementById("panel_" + curGUI.floatDragPanel.panel.id);
						if (po) po.className = po.className.removeClass("paneldock");
						break;
				};
			};
		};
	}

	/** Finds the index of a panel container with the given id in a container array.
	 * @param {PanelContainer[]} _pcAry Container array.
	 * @param {number} _id Container id.
	 * @returns {number} Index in the array or -1 if not found.
	 */
	GetPanelContainerNoOfId(_pcAry, _id) {
		var ret = -1, i, l;
		l = _pcAry.length;
		for (i = 0; i < l; i++)if (_pcAry[i].id == _id) return i;
		return -1;
	}

	/** Locates the container that holds the panel with the given id.
	 * @param {string} _id Panel id.
	 * @returns {{container: string, no: number, pos: number}} Side name ("left"/"right"/"top"/"bottom"/"float" or ""), container index, and panel position.
	 */
	GetPanelContainerInfoOfPanelId(_id) {
		var i, l, j, p;
		l = this.leftPanelContainers.length;
		for (i = 0; i < l; i++) {
			j = 0;
			for (p in this.leftPanelContainers[i].panels) {
				if (p == _id) return { container: "left", no: i, pos: j };
				j++;
			};
		};
		l = this.rightPanelContainers.length;
		for (i = 0; i < l; i++) {
			j = 0;
			for (p in this.rightPanelContainers[i].panels) {
				if (p == _id) return { container: "right", no: i, pos: j };
				j++;
			};
		};
		l = this.topPanelContainers.length;
		for (i = 0; i < l; i++) {
			j = 0;
			for (p in this.topPanelContainers[i].panels) {
				if (p == _id) return { container: "top", no: i, pos: j };
				j++;
			};
		};
		l = this.bottomPanelContainers.length;
		for (i = 0; i < l; i++) {
			j = 0;
			for (p in this.bottomPanelContainers[i].panels) {
				if (p == _id) return { container: "bottom", no: i, pos: j };
				j++;
			};
		};
		l = this.floatPanels.length;
		for (i = 0; i < l; i++) {
			if (this.floatPanels[i].id == _id) return { container: "float", no: 0, pos: i };
		};
		return { container: "", no: 0, pos: 0 };
	}

	/** Mousedown handler on a sizing grip: starts the panel-container resize operation and computes size limits.
	 * @param {MouseEvent} _ev Mouse event.
	 * @param {HTMLElement} _this Grip DOM element.
	 */
	static OnGripMouseDown(_ev, _this) {
		var p, pn, og, i, l, maxWidth = 0, maxHeight = 0;
		if (curGUI != null) if (curGUI.isActive) {
			curGUI.Resize(true);
			PlaySound("button_down");
			og = document.getElementById("gui");
			l = curGUI.gridTemplateCols.length;
			for (i = 0; i < l; i++)if (curGUI.gridTemplateCols[i] != -1) maxWidth += curGUI.gridTemplateCols[i];
			maxWidth = og.clientWidth - 40 - maxWidth;
			l = curGUI.gridTemplateRows.length;
			for (i = 0; i < l; i++)if (curGUI.gridTemplateRows[i] != -1) maxHeight += curGUI.gridTemplateRows[i];
			maxHeight = og.clientHeight - 40 - 20 - maxHeight;
			curGUI.generalMouseMode = GUI.GENERALMOUSEMODE_PANELCONTAINERSIZE;
			_this.className = _this.className.addClass("sel");
			p = _this.id.split("_");
			pn = { dir: p[1], no: 0, rcno: 0, startX: _ev.clientX - 0, startY: _ev.clientY - 0, size: 0, maxSize: 0 };
			switch (p[1]) {
				case "left":
					pn.no = curGUI.GetPanelContainerNoOfId(curGUI.leftPanelContainers, parseInt(p[2], 10));
					pn.rcno = pn.no * 2 + 1;
					pn.size = curGUI.leftPanelContainers[pn.no].size;
					pn.maxSize = maxWidth + pn.size;
					break;
				case "right":
					pn.no = curGUI.GetPanelContainerNoOfId(curGUI.rightPanelContainers, parseInt(p[2], 10));
					pn.rcno = curGUI.leftPanelContainers.length * 2 + 2 + pn.no * 2 + 1;
					pn.size = curGUI.rightPanelContainers[pn.no].size;
					pn.maxSize = maxWidth + pn.size;
					break;
				case "top":
					pn.no = curGUI.GetPanelContainerNoOfId(curGUI.topPanelContainers, parseInt(p[2], 10));
					pn.rcno = pn.no * 2 + 2;
					pn.size = curGUI.topPanelContainers[pn.no].size;
					pn.maxSize = maxHeight + pn.size;
					break;
				case "bottom":
					pn.no = curGUI.GetPanelContainerNoOfId(curGUI.bottomPanelContainers, parseInt(p[2], 10));
					pn.rcno = curGUI.topPanelContainers.length * 2 + 4 + pn.no * 2;
					pn.size = curGUI.bottomPanelContainers[pn.no].size;
					pn.maxSize = maxHeight + pn.size;
					break;
			};
			pn.domElement = _this;
			curGUI.sizePanelContainer = pn;
		};
	}

	// Panel Handling
	/** Adds a panel to this GUI and calls its Init() if present.
	 * @param {Panel} _panel Panel to add.
	 * @param {Function} [_optNewPanelHandler] Optional event handler to assign to the panel.
	 */
	AddPanel(_panel, _optNewPanelHandler) {
		if (_optNewPanelHandler !== undefined) _panel.eventHandler = _optNewPanelHandler;
		this.panels[_panel.id] = _panel;
		if (_panel.hasOwnProperty("Init")) this.panels[_panel.id].Init();
	}

	/** Removes a panel from this GUI, closing it first if visible.
	 * @param {Panel} _panel Panel to remove.
	 */
	RemovePanel(_panel) {
		if (_panel.visible) if (_panel.hasOwnProperty("Close")) _panel.Close(true);
		delete this.panels[_panel.id];
	}

	/** Brings a floating panel to the front by reordering the float panel list and z-indexes.
	 * @param {Panel} _panel Floating panel to raise.
	 */
	Panel2Front(_panel) {
		var i, l = this.floatPanels.length, f = [], o;
		for (i = 0; i < l; i++)if (this.floatPanels[i].id != _panel.id) f.push(this.floatPanels[i]);
		f.push(_panel);
		this.floatPanels = f;
		if (this.isActive) {
			for (i = 0; i < l; i++) {
				if (this.floatPanels[i]) {
					o = document.getElementById("panel_" + this.floatPanels[i].id);
					if (o) o.style.zIndex = GUI.FLOATPANELZINDEXSTART + i;
				};
			};
		};
	}

	/** Returns the floating panel with the given id.
	 * @param {string} _id Panel id.
	 * @returns {?Panel} Floating panel or null if not found.
	 */
	FloatPanelOfId(_id) {
		var i, l = this.floatPanels.length;
		for (i = 0; i < l; i++)if (this.floatPanels[i].id == _id) return this.floatPanels[i];
		return null;
	}

	// Workspace Handling
	/** Builds panel containers for one side from workspace info and docks the referenced panels.
	 * @param {Object[]} _info Workspace container definitions ({panels, size} per container).
	 * @param {string} _prefId Side name for preferred-container strings ("left", "right", "top", "bottom").
	 * @returns {PanelContainer[]} Created containers.
	 */
	_ApplyContainerPanels(_info, _prefId) {
		var i, l, pc, p, q, containerAry = [], anyThere, w, z;
		l = _info.length;
		for (i = 0; i < l; i++) {
			anyThere = false;
			q = _info[i].panels.length;
			for (p = 0; p < q; p++)if (this.panels.hasOwnProperty(_info[i].panels[p].name)) { anyThere = true; break; };
			if (anyThere) {
				pc = new PanelContainer(_info[i].size);
				for (p = 0; p < q; p++) {
					if (this.panels.hasOwnProperty(_info[i].panels[p].name)) {
						w = _info[i].panels[p];
						z = this.panels[w.name];
						pc.AddPanel(z);
						z.isDocked = true;
						z.visible = true;
						if (z.menu != null) z.menu.SetToggle(z.visible);
						if (curGUI) if (curGUI.isActive) if (z.eventHandler != null) z.eventHandler({ type: Panel.EVENTTYPE_VISIBLECHANGED, panel: z });
						if (_prefId == "bottom" || _prefId == "right") {
							z.prefContainer = _prefId + "," + (l - i - 1) + "," + p;
						} else {
							z.prefContainer = _prefId + "," + i + "," + p;
						};
					};
				};
				containerAry.push(pc);
			};
		};
		return containerAry;
	}

	/** Applies a workspace definition: rebuilds all containers, float panels, and panel preferences, and re-renders if active.
	 * @param {Object} _workSpace Workspace definition (see GUI.EMPTYWORKSPACE).
	 * @param {boolean} [_callAWSEvent=false] Passed to the deferred ResizeViewPort call.
	 */
	ApplyWorkSpace(_workSpace, _callAWSEvent = false) {
		var i, l, p, f;
		this.isWorkSpaceApply = true;

		this.isMainFull = false;
		for (i in GUI.interGUIPanels) GUI.interGUIPanels[i].visible = false;
		this.RemovePanels();

		//log("ApplyWorkSpace",_workSpace);
		if (_workSpace === undefined) return;
		if (_workSpace.main.hasOwnProperty("name")) if (_workSpace.main.name != "") {
			if (this.panels.hasOwnProperty(_workSpace.main.name)) {
				this.panels[_workSpace.main.name].visible = true;
				this.mainPanelContainer.AddPanel(this.panels[_workSpace.main.name])
			};
		};
		this.leftPanelContainers = this._ApplyContainerPanels(_workSpace.lefts, "left");
		this.topPanelContainers = this._ApplyContainerPanels(_workSpace.tops, "top");
		this.bottomPanelContainers = this._ApplyContainerPanels(_workSpace.bottoms, "bottom");
		this.rightPanelContainers = this._ApplyContainerPanels(_workSpace.rights, "right");
		l = _workSpace.floats.length;
		this.floatPanels = [];
		for (i = 0; i < l; i++) {
			if (this.panels.hasOwnProperty(_workSpace.floats[i].name)) {
				f = _workSpace.floats[i];
				p = this.panels[f.name];
				this.floatPanels.push(p);
				p.top = f.top;
				p.left = f.left;
				p.width = f.width;
				p.height = f.height;
				p.isDocked = false;
				p.visible = true;
				if (p.menu != null) p.menu.SetToggle(p.visible);
				if (curGUI) if (curGUI.isActive) if (p.eventHandler != null) p.eventHandler({ type: Panel.EVENTTYPE_VISIBLECHANGED, panel: p });
				p.prefContainer = "float,pos," + f.left + "," + f.top + "," + f.width + "," + f.height;
			};
		};
		//log(_workSpace);
		f = _workSpace.prefs.panels;
		for (p in f) {
			if (this.panels[p]) if (f[p].container !== undefined) this.panels[p].prefContainer = f[p].container;
		};

		if (this.isActive) {
			document.getElementById(this.domElementId).innerHTML = this.HTML();
			this._SetUpGUIGrid();
			this.SelectableForSizingGrips(true);
			setTimeout(ResizeViewPort, 10, {}, _callAWSEvent);
		};
		this.isWorkSpaceApply = false;
	}

	/** Template for an empty workspace definition.
	 * @type {Object}
	 */
	static EMPTYWORKSPACE = { main: {}, tops: [], lefts: [], rights: [], bottoms: [], floats: [], prefs: { panels: {} } };
	/** Captures the current layout (main/side containers, float panels, preferences) as a workspace definition.
	 * @returns {Object} Workspace definition.
	 */
	GetWorkSpace() {
		var ret = ObjectUtils.clone(GUI.EMPTYWORKSPACE), i, l, panels, panel, p;
		if (ObjectUtils.countKeys(this.mainPanelContainer.panels) > 0) {
			ret.main.name = this.mainPanelContainer.panels[ObjectUtils.firstKey(this.mainPanelContainer.panels)].id;
		};
		l = this.leftPanelContainers.length;
		for (i = 0; i < l; i++) {
			panels = [];
			var p;
			for (p in this.leftPanelContainers[i].panels) {
				panels.push({ name: this.leftPanelContainers[i].panels[p].id });
			};
			ret.lefts.push({ panels: panels, size: this.leftPanelContainers[i].size });
		};
		l = this.rightPanelContainers.length;
		for (i = 0; i < l; i++) {
			panels = [];
			var p;
			for (p in this.rightPanelContainers[i].panels) {
				panels.push({ name: this.rightPanelContainers[i].panels[p].id });
			};
			ret.rights.push({ panels: panels, size: this.rightPanelContainers[i].size });
		};
		l = this.topPanelContainers.length;
		for (i = 0; i < l; i++) {
			panels = [];
			var p;
			for (p in this.topPanelContainers[i].panels) {
				panels.push({ name: this.topPanelContainers[i].panels[p].id });
			};
			ret.tops.push({ panels: panels, size: this.topPanelContainers[i].size });
		};
		l = this.bottomPanelContainers.length;
		for (i = 0; i < l; i++) {
			panels = [];
			var p;
			for (p in this.bottomPanelContainers[i].panels) {
				panels.push({ name: this.bottomPanelContainers[i].panels[p].id });
			};
			ret.bottoms.push({ panels: panels, size: this.bottomPanelContainers[i].size });
		};
		l = this.floatPanels.length;
		for (i = 0; i < l; i++) {
			if (!this.floatPanels[i].isDocked) {
				// ...!!!! workaround: error on other place in code!!!!
				this.floatPanels[i].prefContainer = "float,pos," + this.floatPanels[i].left + "," + this.floatPanels[i].top + "," + this.floatPanels[i].width + "," + this.floatPanels[i].height;
				ret.floats.push({ name: this.floatPanels[i].id, top: this.floatPanels[i].top, left: this.floatPanels[i].left, width: this.floatPanels[i].width, height: this.floatPanels[i].height });
			};
		};
		var p;
		for (p in this.panels) {
			ret.prefs.panels[p] = this.panels[p].prefContainer;
		};
		return ret;
	}

	/** Loads the workspace for this GUI from localStorage (falling back to a default) and applies it.
	 * @param {Object} _defaultWorkSpace Fallback workspace definition.
	 */
	GetLocalStorageWorkSpace(_defaultWorkSpace) {
		var ws = localStorage.Get("WorkSpace_" + this.id, _defaultWorkSpace);
		//console.error("GetLocalStorageWorkSpace",this.id,ws);
		this.ApplyWorkSpace(ws);
		this.SetLocalStorageWorkSpace(ws);
	}

	/** Stores a workspace (given or captured from the current layout) in localStorage and optionally applies it.
	 * @param {Object} [_defaultWorkSpace] Workspace to store; the current layout if omitted.
	 * @param {boolean} [_doApply=true] Whether to apply the workspace after storing.
	 */
	SetLocalStorageWorkSpace(_defaultWorkSpace, _doApply) {
		var ws;
		if (_doApply === undefined) _doApply = true;
		if (_defaultWorkSpace === undefined) {
			ws = this.GetWorkSpace();
		} else {
			ws = _defaultWorkSpace;
		};
		//console.error("SetLocalStorageWorkSpace",this.id,ws);
		localStorage.Set("WorkSpace_" + this.id, ws);
		if (_doApply) this.ApplyWorkSpace(ws, true);
	}

	/** Recomputes and applies the CSS grid templates of the GUI container and updates docked panel widths, firing size-changed events. */
	_SetUpGUIGridTemplate() {
		var i, l, c = [], r = [], og = document.getElementById("gui"), oc = document.getElementById("content"), p, po, w, ll, q;
		this.gridTemplateColsStr = "";
		this.gridTemplateColsSum = 0;
		this.gridTemplateRowsStr = "";
		this.gridTemplateRowsSum = 0;

		l = this.gridTemplateCols.length;
		for (i = 0; i < l; i++) {
			if (this.gridTemplateCols[i] == -1) {
				c.push("calc");
				// 1fr
			} else {
				c.push(this.gridTemplateCols[i] + "px");
				this.gridTemplateColsSum += this.gridTemplateCols[i];
			};
		};
		l = this.gridTemplateRows.length;
		for (i = 0; i < l; i++) {
			if (this.gridTemplateRows[i] == -1) {
				r.push("calc");
				// 1fr
			} else {
				r.push(this.gridTemplateRows[i] + "px");
				this.gridTemplateRowsSum += this.gridTemplateRows[i];
			};
		};

		q = this.mainPanelContainer.panels[ObjectUtils.firstKey(this.mainPanelContainer.panels)]
		if (q != null) if (q.eventHandler != null) q.eventHandler({ type: Panel.EVENTTYPE_SIZECHANGED, panel: q });

		this.gridTemplateColsStr = c.join(" ");
		og.style.gridTemplateColumns = this.gridTemplateColsStr.replace("calc", (oc.clientWidth - this.gridTemplateColsSum) + "px");
		this.gridTemplateRowsStr = r.join(" ");
		og.style.gridTemplateRows = this.gridTemplateRowsStr.replace("calc", (oc.clientHeight - this.gridTemplateRowsSum) + "px");

		// Set up panel widths...
		l = this.leftPanelContainers.length;
		for (i = 0; i < l; i++) {
			w = this.gridTemplateCols[i * 2 + 1];
			var p;
			for (p in this.leftPanelContainers[i].panels) {
				q = this.leftPanelContainers[i].panels[p];
				po = document.getElementById("panel_" + q.id);
				po.style.width = w + "px";
				if (q.eventHandler != null) q.eventHandler({ type: Panel.EVENTTYPE_SIZECHANGED, panel: q });
			};
		};
		ll = l;
		l = this.rightPanelContainers.length;
		for (i = 0; i < l; i++) {
			w = this.gridTemplateCols[ll * 2 + 3 + i * 2];
			var p;
			for (p in this.rightPanelContainers[i].panels) {
				q = this.rightPanelContainers[i].panels[p];
				po = document.getElementById("panel_" + q.id);
				po.style.width = w + "px";
				if (q.eventHandler != null) q.eventHandler({ type: Panel.EVENTTYPE_SIZECHANGED, panel: q });
			};
		};
		l = this.topPanelContainers.length;
		var p;
		for (i = 0; i < l; i++)for (p in this.topPanelContainers[i].panels) { q = this.topPanelContainers[i].panels[p]; if (q.eventHandler != null) q.eventHandler({ type: Panel.EVENTTYPE_SIZECHANGED, panel: q }); };
		l = this.bottomPanelContainers.length;
		var p;
		for (i = 0; i < l; i++)for (p in this.bottomPanelContainers[i].panels) { q = this.bottomPanelContainers[i].panels[p]; if (q.eventHandler != null) q.eventHandler({ type: Panel.EVENTTYPE_SIZECHANGED, panel: q }); };

	}

	/** Assigns grid positions to all panel containers and grips and applies the grid template. */
	_SetUpGUIGrid() {
		var om, opc, i, l, leftOff, topOff,
			om = document.getElementById("menu_" + this.id + "_" + this.id);

		this._SetUpGUIGridTemplate();

		l = this.leftPanelContainers.length;
		leftOff = l;
		for (i = 0; i < l; i++) {
			opc = document.getElementById("panelcontainer_" + this.leftPanelContainers[i].id);
			opc.style.gridColumnStart = i * 2 + 2;
			opc.style.gridColumnEnd = i * 2 + 3;
			opc.style.gridRowStart = 3;
			opc.style.gridRowEnd = this.noOfGridRows;
			opc = document.getElementById("topgrip_left_" + this.leftPanelContainers[i].id);
			opc.style.gridColumnStart = i * 2 + 2;
			opc.style.gridColumnEnd = i * 2 + 3;
			opc.style.gridRowStart = 2;
			opc.style.gridRowEnd = 3;
			opc = document.getElementById("bottomgrip_left_" + this.leftPanelContainers[i].id);
			opc.style.gridColumnStart = i * 2 + 2;
			opc.style.gridColumnEnd = i * 2 + 3;
			opc.style.gridRowStart = this.noOfGridRows;
			opc.style.gridRowEnd = this.noOfGridRows + 1;
			opc = document.getElementById("rightgrip_left_" + this.leftPanelContainers[i].id);
			opc.style.gridColumnStart = i * 2 + 3;
			opc.style.gridColumnEnd = i * 2 + 4;
			opc.style.gridRowStart = 3;
			opc.style.gridRowEnd = this.noOfGridRows;
			this.leftPanelContainers[i].SetUpContainerGrid();
		};
		l = this.rightPanelContainers.length;
		for (i = 0; i < l; i++) {
			opc = document.getElementById("panelcontainer_" + this.rightPanelContainers[i].id);
			opc.style.gridColumnStart = leftOff * 2 + 1 + i * 2 + 3;
			opc.style.gridColumnEnd = leftOff * 2 + 1 + i * 2 + 4;
			opc.style.gridRowStart = 3;
			opc.style.gridRowEnd = this.noOfGridRows;
			opc = document.getElementById("topgrip_right_" + this.rightPanelContainers[i].id);
			opc.style.gridColumnStart = leftOff * 2 + 1 + i * 2 + 3;
			opc.style.gridColumnEnd = leftOff * 2 + 1 + i * 2 + 4;
			opc.style.gridRowStart = 2;
			opc.style.gridRowEnd = 3;
			opc = document.getElementById("bottomgrip_right_" + this.rightPanelContainers[i].id);
			opc.style.gridColumnStart = leftOff * 2 + 1 + i * 2 + 3;
			opc.style.gridColumnEnd = leftOff * 2 + 1 + i * 2 + 4;
			opc.style.gridRowStart = this.noOfGridRows;
			opc.style.gridRowEnd = this.noOfGridRows + 1;
			opc = document.getElementById("leftgrip_right_" + this.rightPanelContainers[i].id);
			opc.style.gridColumnStart = leftOff * 2 + i * 2 + 3;
			opc.style.gridColumnEnd = leftOff * 2 + i * 2 + 4;
			opc.style.gridRowStart = 3;
			opc.style.gridRowEnd = this.noOfGridRows;
			this.rightPanelContainers[i].SetUpContainerGrid();
		};
		l = this.topPanelContainers.length;
		topOff = l;
		for (i = 0; i < l; i++) {
			opc = document.getElementById("panelcontainer_" + this.topPanelContainers[i].id);
			opc.style.gridColumnStart = leftOff * 2 + 2;
			opc.style.gridColumnEnd = leftOff * 2 + 1 + 2;
			opc.style.gridRowStart = 3 + i * 2;
			opc.style.gridRowEnd = 3 + i * 2 + 1;
			opc = document.getElementById("bottomgrip_top_" + this.topPanelContainers[i].id);
			opc.style.gridColumnStart = leftOff * 2 + 2;
			opc.style.gridColumnEnd = leftOff * 2 + 1 + 2;
			opc.style.gridRowStart = 3 + i * 2 + 1;
			opc.style.gridRowEnd = 3 + i * 2 + 1;
			this.topPanelContainers[i].SetUpContainerGrid();
		};
		l = this.bottomPanelContainers.length;
		for (i = 0; i < l; i++) {
			opc = document.getElementById("panelcontainer_" + this.bottomPanelContainers[i].id);
			opc.style.gridColumnStart = leftOff * 2 + 2;
			opc.style.gridColumnEnd = leftOff * 2 + 1 + 2;
			opc.style.gridRowStart = topOff * 2 + 5 + i * 2;
			opc.style.gridRowEnd = topOff * 2 + 5 + i * 2 + 1;
			opc = document.getElementById("topgrip_bottom_" + this.bottomPanelContainers[i].id);
			opc.style.gridColumnStart = leftOff * 2 + 2;
			opc.style.gridColumnEnd = leftOff * 2 + 1 + 2;
			opc.style.gridRowStart = topOff * 2 + 4 + i * 2;
			opc.style.gridRowEnd = topOff * 2 + 4 + i * 2 + 1;
			this.bottomPanelContainers[i].SetUpContainerGrid();
		};
		opc = document.getElementById("panelcontainer_" + this.mainPanelContainer.id);
		opc.style.gridColumnStart = leftOff * 2 + 2;
		opc.style.gridColumnEnd = leftOff * 2 + 3;
		opc.style.gridRowStart = topOff * 2 + 3;
		opc.style.gridRowEnd = topOff * 2 + 4;

		opc = document.getElementById("leftgrip_main");
		opc.style.gridColumnStart = 1;
		opc.style.gridColumnEnd = 2;
		opc.style.gridRowStart = 2;
		opc.style.gridRowEnd = this.noOfGridRows + 1;

		opc = document.getElementById("rightgrip_main");
		opc.style.gridColumnStart = this.noOfGridCols;
		opc.style.gridColumnEnd = this.noOfGridCols + 1;
		opc.style.gridRowStart = 2;
		opc.style.gridRowEnd = this.noOfGridRows + 1;

		opc = document.getElementById("topgrip_main");
		opc.style.gridColumnStart = leftOff * 2 + 2;
		opc.style.gridColumnEnd = leftOff * 2 + 3;
		opc.style.gridRowStart = 2;
		opc.style.gridRowEnd = 3;

		opc = document.getElementById("bottomgrip_main");
		opc.style.gridColumnStart = leftOff * 2 + 2;
		opc.style.gridColumnEnd = leftOff * 2 + 3;
		opc.style.gridRowStart = this.noOfGridRows;
		opc.style.gridRowEnd = this.noOfGridRows + 1;

		om.style.gridColumnStart = 1;
		om.style.gridColumnEnd = this.noOfGridCols + 1;
		om.style.gridRowStart = 1;
		om.style.gridRowEnd = 2;
	}

	/** Toggles full-screen mode for the main panel container and triggers a viewport resize.
	 * @param {boolean} _on True to show only the main container full-screen.
	 */
	SetUpMainFull(_on) {
		this.isMainFull = _on;
		ResizeViewPort({});
	}

	/** Recomputes the GUI grid for the current viewport size, scaling containers down if they exceed it; honors main-full mode.
	 * @param {boolean} [_doFix=false] True to write the scaled sizes back into the grid template arrays.
	 */
	Resize(_doFix) {
		var oc, og, ob, o;
		oc = document.getElementById("content");
		og = document.getElementById("gui");
		if (this.isMainFull) {
			o = document.getElementById("pageHeader");
			o.className = o.className.boolClass("mainfull", true)
			o = document.getElementById("pageFooter");
			o.className = o.className.boolClass("mainfull", true)
			o = document.getElementById("content");
			o.className = o.className.boolClass("mainfull", true)
			o = document.getElementById(this.topMenu.fullId);
			o.className = o.className.boolClass("hidden", true)
			var r = this.gridTemplateColsStr.split(" "), i, l = r.length;
			for (i = 0; i < l; i++) {
				if (r[i] == "calc") {
					r[i] = "100vw";
				} else {
					r[i] = "0px";
				};
			};
			og.style.gridTemplateColumns = r.join(" ");
			var r = this.gridTemplateRowsStr.split(" "), i, l = r.length;
			for (i = 0; i < l; i++) {
				if (r[i] == "calc") {
					r[i] = "100vh";
				} else {
					r[i] = "0px";
				};
			};
			og.style.gridTemplateRows = r.join(" ");
		} else {
			o = document.getElementById("pageHeader");
			o.className = o.className.boolClass("mainfull", false)
			o = document.getElementById("pageFooter");
			o.className = o.className.boolClass("mainfull", false)
			o = document.getElementById("content");
			o.className = o.className.boolClass("mainfull", false)
			o = document.getElementById(this.topMenu.fullId);
			o.className = o.className.boolClass("hidden", false)
			if (_doFix === undefined) _doFix = false;
			if (this.gridTemplateRowsSum >= oc.clientHeight) {
				var r = this.gridTemplateRowsStr.split(" "), i, l = r.length, s = 0;;
				for (i = 0; i < l; i++) {
					if (r[i] == "calc") {
						r[i] = "1px";
					} else {
						r[i] = parseInt(r[i], 10);
						r[i] = (oc.clientHeight * r[i] / this.gridTemplateRowsSum);
						s += r[i];
						if (_doFix) this.gridTemplateRows[i] = r[i];
						r[i] += "px";
					};
				};
				if (_doFix) this.gridTemplateRowsSum = s;
				og.style.gridTemplateRows = r.join(" ");
			} else {
				og.style.gridTemplateRows = this.gridTemplateRowsStr.replace(/calc/, (oc.clientHeight - this.gridTemplateRowsSum) + "px");
			};
			if (this.gridTemplateColsSum >= oc.clientWidth) {
				var r = this.gridTemplateColsStr.split(" "), i, l = r.length, s = 0;
				for (i = 0; i < l; i++) {
					if (r[i] == "calc") {
						r[i] = "1px";
					} else {
						r[i] = parseInt(r[i], 10);
						r[i] = (oc.clientWidth * r[i] / this.gridTemplateColsSum);
						s += r[i];
						if (_doFix) this.gridTemplateCols[i] = r[i];
						r[i] += "px";
					};
				};
				if (_doFix) this.gridTemplateColsSum = s;
				og.style.gridTemplateColumns = r.join(" ");
			} else {
				og.style.gridTemplateColumns = this.gridTemplateColsStr.replace(/calc/, (oc.clientWidth - this.gridTemplateColsSum) + "px");
			};
		};
	}

	/** Enables or disables the "selectableForSizing" state on all sizing grips (droppers excluded).
	 * @param {boolean} _enable True to enable sizing selection.
	 */
	SelectableForSizingGrips(_enable) {
		var i, l, o = document.getElementsByName("guigrip");
		l = o.length;
		if (_enable) {
			for (i = 0; i < l; i++)if (!o[i].className.hasClass("onlyDropper")) o[i].className = o[i].className.addClass("selectableForSizing");
		} else {
			for (i = 0; i < l; i++)if (!o[i].className.hasClass("onlyDropper")) o[i].className = o[i].className.removeClass("selectableForSizing");
		};
	}

	/** Removes the "selectableForDocking" highlight from all grips. */
	RemoveSelectableForDockingGrips() {
		var i, l, o = document.getElementsByName("guigrip");
		l = o.length;
		for (i = 0; i < l; i++)o[i].className = o[i].className.removeClass("selectableForDocking");
	}

	/** Makes this GUI the active one: installs window event handlers, renders the layout, applies the stored workspace, and calls AfterActivate if defined.
	 * @param {Object} [_actOpts={}] Activation options; supports insideDomElement (target element id, default "content").
	 */
	Activate(_actOpts) {
		var k, p, o;
		this.isMainFull = false;
		if (_actOpts === undefined) _actOpts = {};
		lastGUI = curGUI;
		if (curGUI != this && curGUI != null) curGUI.Deactivate();
		curGUI = this;
		curGUI.generalMouseMode = GUI.GENERALMOUSEMODE_NONE;
		for (p in GUI.interGUIPanels) {
			this.AddPanel(GUI.interGUIPanels[p]);
		};
		o = document.getElementById("guititle");
		if (o) o.innerHTML = DisributeText(this.title);

		this.keyDowns = {};
		GUI.modalKeyEvents = {};
		GUI.modalKeyEventButtonObjects = {};
		this.modalPanels = [];

		this.ctrlKeyPressed = false;
		this.cmdKeyPressed = false;
		this.altKeyPressed = false;
		this.shiftKeyPressed = false;
		this.specialKeyChange = 0x00;
		GUI.KEYSTRMAC_BYCODE = {};
		for (k in GUI.KEYSTRMAC) GUI.KEYSTRMAC_BYCODE[GUI.KEY[k]] = GUI.KEYSTRMAC[k];
		GUI.KEYSTR_BYCODE = {};
		for (k in GUI.KEYSTR) GUI.KEYSTR_BYCODE[GUI.KEY[k]] = GUI.KEYSTR[k];
		this.GetLocalStorageWorkSpace(this.stdWorkSpace);

		this.OldOnKeyDown = window.onkeydown;
		this.OldOnKeyUp = window.onkeyup;
		this.OldOnMouseDown = window.onmouseup;
		this.OldOnMouseUp = window.onmouseup;
		this.OldOnMouseMove = window.onmousemove;
		this.OldOnMouseWheel = window.onmousewheel;
		this.OldOnContextMenu = window.oncontextmenu;
		window.onkeydown = this.OnKeyDown;
		window.onkeyup = this.OnKeyUp;
		window.onmouseup = this.OnMouseUp;
		window.onmousedown = this.OnMouseDown;
		window.onmousemove = this.OnMouseMove;
		window.onmousewheel = this.OnMouseWheel;
		window.oncontextmenu = this.OnContextMenu;
		this.isActive = true;
		if (!_actOpts.hasOwnProperty("insideDomElement")) _actOpts.insideDomElement = "content";
		this.domElementId = _actOpts.insideDomElement;
		o = document.getElementById(this.domElementId);
		if (o) o.innerHTML = this.HTML();
		this.topMenu.SetUpPanelMenuReferences(this);
		for (p in this.panels) if (this.panels[p].menu != null) this.panels[p].menu.SetToggle(this.panels[p].visible);
		this._SetUpGUIGrid();
		this.SelectableForSizingGrips(true);
		for (p in this.panels) if (this.panels[p].visible) if (this.panels[p].eventHandler != null) this.panels[p].eventHandler({ type: Panel.EVENTTYPE_VISIBLECHANGED, panel: this.panels[p] });
		setTimeout(ResizeViewPort, 10);
		if (this.AfterActivate) this.AfterActivate(_actOpts);
	}

	/** Closes all panels in all containers (float, side, and main). */
	RemovePanels() {
		var i, l;
		l = this.floatPanels.length;
		for (i = l - 1; i >= 0; i--) {
			this.floatPanels[i].Close(true);
		};
		l = this.leftPanelContainers.length;
		for (i = l - 1; i >= 0; i--) {
			this.leftPanelContainers[i].CloseAllPanels();
		};
		l = this.topPanelContainers.length;
		for (i = l - 1; i >= 0; i--) {
			this.topPanelContainers[i].CloseAllPanels();
		};
		l = this.bottomPanelContainers.length;
		for (i = l - 1; i >= 0; i--) {
			this.bottomPanelContainers[i].CloseAllPanels();
		};
		l = this.rightPanelContainers.length;
		for (i = l - 1; i >= 0; i--) {
			this.rightPanelContainers[i].CloseAllPanels();
		};
		this.mainPanelContainer.CloseAllPanels();

		//for(i in GUI.interGUIPanels){
		//	this.RemovePanel(GUI.interGUIPanels[i]);
		//};
	}

	/** Deactivates this GUI: saves the workspace, closes panels/modal content, and restores the previous window event handlers. */
	Deactivate() {
		var o;
		this.SetLocalStorageWorkSpace(undefined, false);
		if (this.BeforeDeactivate) this.BeforeDeactivate();
		o = document.getElementById("guititle");
		if (o) o.innerHTML = "";
		this.modalPanels = [];
		this.RemoveModalContent();
		this.RemovePanels();

		this.isActive = false;
		curGUI = null;
		window.onkeydown = this.OldOnKeyDown;
		window.onkeyup = this.OldOnKeyUp;
		window.onmouseup = this.OldOnMousep;
		window.onmousedown = this.OldOnMouseDown;
		window.onmousemove = this.OldOnMouseMove;
		window.onmousewheel = this.OldOnMouseWheel;
		window.oncontextmenu = this.OldOnContextMenu;
	}

	/** Deactivates and immediately reactivates this GUI (only if it is the current one). */
	Reactivate() {
		if (curGUI == this) {
			this.Deactivate();
			this.Activate(this.domElementId);
		};
	}

	/** Propagates a user change to all GUIs that define OnUserChange. */
	OnUserChange() {
		var g;
		for (g in GUIS) if (GUIS[g].OnUserChange) GUIS[g].OnUserChange();
	}

	/** Placeholder to force a panel visible; currently a no-op.
	 * @param {Panel} _panel Panel to force visible.
	 */
	ForcePanelVisibile(_panel) {
	}

	/** Name of the currently applied general cursor class.
	 * @type {string}
	 */
	static LastGeneralCursor = "pointer";
	/** Sets a global cursor style via a "cursor_*" class on the body element.
	 * @param {string} _cursor Cursor name ("" to clear).
	 */
	static SetGeneralCursor(_cursor) {
		var o = document.getElementById("body");
		if (GUI.LastGeneralCursor != "") o.className = o.className.removeClass("cursor_" + GUI.LastGeneralCursor);
		if (GUI._cursor != "") o.className = o.className.addClass("cursor_" + _cursor);
		GUI.LastGeneralCursor = _cursor;
	}

	static { ENUMERATOR = 0; }
	/** Modal button id: Cancel.
	 * @type {number}
	 */
	static MODALBUTTON_CANCEL = ENUMERATOR++;
	/** Modal button id: Ok.
	 * @type {number}
	 */
	static MODALBUTTON_OK = ENUMERATOR++;
	/** Modal button id: No.
	 * @type {number}
	 */
	static MODALBUTTON_NO = ENUMERATOR++;
	/** Modal button id: Yes.
	 * @type {number}
	 */
	static MODALBUTTON_YES = ENUMERATOR++;
	/** Modal button id: Discard.
	 * @type {number}
	 */
	static MODALBUTTON_DISCARD = ENUMERATOR++;
	/** Modal button id: Save.
	 * @type {number}
	 */
	static MODALBUTTON_SAVE = ENUMERATOR++;
	/** Modal button id: extra (custom) button.
	 * @type {number}
	 */
	static MODALBUTTON_EXTRA = ENUMERATOR++;
	/** Modal button set: only an Ok button.
	 * @type {number}
	 */
	static MODALBUTTONSET_ONLYOK = ENUMERATOR++;
	/** Modal button set: No/Yes with Yes as default.
	 * @type {number}
	 */
	static MODALBUTTONSET_NO_YES_DEFAULTYES = ENUMERATOR++;
	/** Modal button set: No/Yes with No as default.
	 * @type {number}
	 */
	static MODALBUTTONSET_NO_YES_DEFAULTNO = ENUMERATOR++;
	/** Modal button set: Cancel/Ok with Cancel as default.
	 * @type {number}
	 */
	static MODALBUTTONSET_CANCEL_OK_DEFAULTCANCEL = ENUMERATOR++;
	/** Modal button set: "I don't agree"/"I agree".
	 * @type {number}
	 */
	static MODALBUTTONSET_DONTAGREE_AGREE = ENUMERATOR++;
	/** Modal button set: Cancel/Discard/Save.
	 * @type {number}
	 */
	static MODALBUTTONSET_CANCEL_DISCARD_SAVE = ENUMERATOR++;
	/** Default keyboard shortcuts (key codes) per modal button element id.
	 * @type {Object<string,number>}
	 */
	static ModalButtonStdKeys = { "modalCancelButton": GUI.KEY.ESCAPE, "modalOkButton": GUI.KEY.ENTER, "modalNoButton": GUI.KEY.ESCAPE, "modalYesButton": GUI.KEY.ENTER };
	/** Maps modal button element ids to MODALBUTTON_* ids.
	 * @type {Object<string,number>}
	 */
	static ModalButtonIds = { "modalCancelButton": GUI.MODALBUTTON_CANCEL, "modalOkButton": GUI.MODALBUTTON_OK, "modalNoButton": GUI.MODALBUTTON_NO, "modalYesButton": GUI.MODALBUTTON_YES, "modalDiscardButton": GUI.MODALBUTTON_DISCARD, "modalSaveButton": GUI.MODALBUTTON_SAVE, "modalExtraButton": GUI.MODALBUTTON_EXTRA };
	/** Registers a modal key shortcut bound to a button element.
	 * @param {HTMLElement} _butObj Button DOM element.
	 * @param {number} _key Key code.
	 * @param {Function} _eventHandler Handler invoked when the key is pressed.
	 */
	static ModalButtonKeyEventsSetUp(_butObj, _key, _eventHandler) {
		if (_butObj) {
			GUI.modalKeyEvents[_key] = _eventHandler;
			GUI.modalKeyEventButtonObjects[_key] = _butObj;
		};
	}

	/** Wires click and default key handlers to all standard modal buttons found in the DOM.
	 * @param {GUI} _gui GUI instance (unused).
	 * @param {Function} _eventHandler Handler invoked with (event, buttonElement).
	 */
	static ModalButtonEventsSetUp(_gui, _eventHandler) {
		var o, b;
		GUI.modalKeyEvents = {};
		GUI.modalKeyEventButtonObjects = {};
		for (b in GUI.ModalButtonIds) {
			o = document.getElementById(b);
			if (o) {
				ButtonAttributesToElement(o, _eventHandler);
				if (GUI.ModalButtonStdKeys[b] != 0) {
					GUI.modalKeyEvents[GUI.ModalButtonStdKeys[b]] = _eventHandler;
					GUI.ModalButtonKeyEventsSetUp(o, GUI.ModalButtonStdKeys[b], _eventHandler);
				};
			};
		};
	}

	/** Builds the HTML for a modal dialog button row.
	 * @param {number} _modalButtonSet One of the MODALBUTTONSET_* constants.
	 * @param {Function} [_extra_event=NOFUNCTION] Unused extra event placeholder.
	 * @param {?string} [_extraButton=null] Caption for an optional extra button.
	 * @returns {string} Buttons HTML.
	 */
	static ModalButtonsHTML(_modalButtonSet, _extra_event = NOFUNCTION, _extraButton = null) {
		var h = "", extraClass = "";
		switch (_modalButtonSet) {
			case GUI.MODALBUTTONSET_ONLYOK:
				if (_extraButton == null) extraClass = " single";
				break;
		};
		h += '<div class="subbuttons' + extraClass + '">';
		switch (_modalButtonSet) {
			case GUI.MODALBUTTONSET_ONLYOK:
				if (_extraButton != null) h += '<div id="modalExtraButton" class="button">' + _extraButton.HtmlEntities() + '</div>';
				h += '<div id="modalOkButton" onkeyup="if(event.keyCode==GUI.KEY.ENTER)" class="button">' + 'Ok<info context="button text"/>'.I18xTrans().HtmlEntities() + '</div>';
				break;
			case GUI.MODALBUTTONSET_CANCEL_OK_DEFAULTCANCEL:
				h += '<div id="modalCancelButton" onkeyup="if(event.keyCode==GUI.KEY.ESCAPE)" class="button">' + 'Cancel<info context="button text"/>'.I18xTrans().HtmlEntities() + '</div>';
				h += '<div id="modalOkButton" onkeyup="if(event.keyCode==GUI.KEY.ENTER)" class="button">' + 'Ok<info context="button text"/>'.I18xTrans().HtmlEntities() + '</div>';
				break;
			case GUI.MODALBUTTONSET_NO_YES_DEFAULTYES:
				h += '<div id="modalNoButton" onkeyup="if(event.keyCode==GUI.KEY.ESCAPE)" class="button">' + 'No<info context="button text"/>'.I18xTrans().HtmlEntities() + '</div>';
				h += '<div id="modalYesButton" onkeyup="if(event.keyCode==GUI.KEY.ENTER)" class="button">' + 'Yes<info context="button text"/>'.I18xTrans().HtmlEntities() + '</div>';
				break;
			case GUI.MODALBUTTONSET_NO_YES_DEFAULTNO:
				h += '<div id="modalNoButton" onkeyup="if(event.keyCode==GUI.KEY.ESCAPE)" class="button">' + 'No<info context="button text"/>'.I18xTrans().HtmlEntities() + '</div>';
				h += '<div id="modalYesButton" onkeyup="if(event.keyCode==GUI.KEY.ENTER)" class="button">' + 'Yes<info context="button text"/>'.I18xTrans().HtmlEntities() + '</div>';
				break;
			case GUI.MODALBUTTONSET_DONTAGREE_AGREE:
				h += '<div id="modalNoButton" class="button">' + "I dont't agree<info context=\"button text\">".I18xTrans().HtmlEntities() + '</div>';
				if (_extraButton != null) h += '<div id="modalExtraButton" class="button">' + _extraButton.HtmlEntities() + '</div>';
				h += '<div id="modalYesButton" class="button">' + 'I agree<info context="button text"/>'.I18xTrans().HtmlEntities() + '</div>';
				break;
			case GUI.MODALBUTTONSET_CANCEL_DISCARD_SAVE:
				h += '<div id="modalCancelButton" onkeyup="if(event.keyCode==GUI.KEY.ESCAPE)" class="button">' + "Cancel<info context=\"button text\">".I18xTrans().HtmlEntities() + '</div>';
				h += '<div id="modalDiscardButton" class="button">' + "Discard<info context=\"button text\">".I18xTrans().HtmlEntities() + '</div>';
				h += '<div id="modalSaveButton" onkeyup="if(event.keyCode==GUI.KEY.ENTER)" class="button">' + 'Save<info context="button text"/>'.I18xTrans().HtmlEntities() + '</div>';
				break;

		};
		h += '</div>';
		return h;
	}

	/** Click handler for a collapsible header: toggles its content; Alt-click collapses siblings, Ctrl-click syncs siblings.
	 * @param {MouseEvent} _ev Click event.
	 * @param {string} _id Header switch element id.
	 */
	static HeaderSwitch(_ev, _id) {
		var oc = document.getElementById("headerswitchcontent_" + _id), os = document.getElementById("headerswitch_" + _id), oh = document.getElementById("header_" + _id), od = document.getElementById(_id), n, i, oss, b;
		if (od) if (oc) if (oh) {
			if (oc.style.display == "none") {
				oc.style.display = oc.dataset.displayStyle;
				oh.className = oh.className.exchangeClass("closed", "open");
				os.className = os.className.exchangeClass("icon-circle-right", "icon-circle-down");
				//oh.scrollIntoView({block:"end",behavior:"smooth"});
				b = true;
			} else {
				oc.style.display = "none";
				oh.className = oh.className.exchangeClass("open", "closed");
				os.className = os.className.exchangeClass("icon-circle-down", "icon-circle-right");
				b = false;
			};
			if (_ev.altKey) {
				n = od.getAttribute("name");
				if (n != null && n != "") {
					oss = document.getElementsByName(n);
					for (i = 0; i < oss.length; i++) {
						if (oss[i].id != _id) GUI.HeaderSwitchSetSwitch(oss[i].id, false);
					};
				};
			} else if (_ev.ctrlKey) {
				n = od.getAttribute("name");
				if (n != null && n != "") {
					oss = document.getElementsByName(n);
					for (i = 0; i < oss.length; i++) {
						if (oss[i].id != _id) GUI.HeaderSwitchSetSwitch(oss[i].id, b);
					};
				};
			};
			if (od.dataset.onswitch != "") eval(od.dataset.onswitch);
		};
		//headerswitch
	}

	/** Programmatically opens or closes a collapsible header's content.
	 * @param {string} _id Header switch element id.
	 * @param {boolean} _onOff True to open, false to close.
	 */
	static HeaderSwitchSetSwitch(_id, _onOff) {
		var oc = document.getElementById("headerswitchcontent_" + _id), oh = document.getElementById("headerswitch_" + _id);
		if (oc) if (oh) {
			if (oc.style.display == "none" && _onOff) {
				oc.style.display = "block";
				oh.className = oh.className.exchangeClass("icon-circle-right", "icon-circle-down");
			} else if (oc.style.display == "block" && !_onOff) {
				oc.style.display = "none";
				oh.className = oh.className.exchangeClass("icon-circle-down", "icon-circle-right");
			};
		};
	}

	/** Opens or closes a collapsible header located inside a given div (scoped lookup).
	 * @param {HTMLElement} _div Container element providing GetElementById.
	 * @param {string} _id Header switch element id.
	 * @param {boolean} _onOff True to open, false to close.
	 */
	static HeaderSwitchInDivSetSwitch(_div, _id, _onOff) {
		var oc = _div.GetElementById("headerswitchcontent_" + _id), oh = _div.GetElementById("headerswitch_" + _id);
		if (oc) if (oh) {
			if (oc.style.display == "none" && _onOff) {
				oc.style.display = "block";
				oh.className = oh.className.exchangeClass("icon-circle-right", "icon-circle-down");
			} else if (oc.style.display == "block" && !_onOff) {
				oc.style.display = "none";
				oh.className = oh.className.exchangeClass("icon-circle-down", "icon-circle-right");
			};
		};
	}

	/** Shows or hides a header switch element entirely.
	 * @param {string} _id Element id.
	 * @param {boolean} _hidden True to hide.
	 */
	static HeaderSwitchHidden(_id, _hidden) {
		var o = document.getElementById(_id);
		if (o) o.className = o.className.boolClass("hidden", _hidden);
	}

	/** Replaces the content HTML of a collapsible header section.
	 * @param {string} _id Header switch element id.
	 * @param {string} _content New content HTML.
	 */
	static HeaderSwitchContent(_id, _content) {
		var o = document.getElementById("headerswitchcontent_" + _id);
		if (o) o.innerHTML = _content;
	}

	/** Sets the title text of a header switch element.
	 * @param {string} _id Header switch element id.
	 * @param {string} _title New title (HTML-escaped).
	 */
	static HeaderSwitchTitle(_id, _title) {
		var o = document.getElementById(_id + "_title");
		if (o) o.innerHTML = _title.HtmlEntities();
	}

	/** Builds a collapsible section with an H1 header and toggle button.
	 * @param {string} _id Element id.
	 * @param {string} _title Header title.
	 * @param {string} _html Content HTML.
	 * @param {Object} _opts Options (titleIsHTML, extraClass, contentClass, displayStyle, icon, subTitle, extraHTML, open, onswitch, name, sticky, hidden, selected, autowidth, noswitch, buttons, inlinebuttons, ...).
	 * @returns {string} Section HTML.
	 */
	static H1HeaderSwitch(_id, _title, _html, _opts) {
		var h = "", t = "", open, titleIsHTML = false, icon = "", contentClass = "", extraClass = "", displayStyle = "block";
		if (_opts.hasOwnProperty("titleIsHTML")) titleIsHTML = _opts.titleIsHTML;
		if (_opts.hasOwnProperty("extraClass")) extraClass = " " + _opts.extraClass;
		if (_opts.hasOwnProperty("contentClass")) contentClass = _opts.contentClass;
		if (_opts.hasOwnProperty("displayStyle")) displayStyle = _opts.displayStyle;
		if (_opts.hasOwnProperty("icon")) icon = _opts.icon;
		if (_opts.hasOwnProperty("subTitle")) {
			t = '<div class="headerswitchtext' + extraClass + '"><div dir="auto" id="' + _id + '_title" class="title">' + (titleIsHTML ? _title : _title.HtmlEntities()) + '</div>';
			if (_opts.subTitle != "" || _opts.hasOwnProperty("forceSubTitle")) t += '<div dir="auto" id="' + _id + '_subtitle" class="subtitle">' + _opts.subTitle.HtmlEntities() + '</div>';
			t += '</div>';
		} else {
			if (_opts.hasOwnProperty("extraHTML")) {
				t = '<div class="headerswitchtext' + extraClass + '"><div dir="auto" id="' + _id + '_title" class="title">' + (titleIsHTML ? _title : _title.HtmlEntities()) + '</div>' + _opts.extraHTML + '</div>';
			} else {
				t = '<span dir="auto" id="' + _id + '_title">' + (titleIsHTML ? _title : _title.HtmlEntities()) + '</span>';
			};
		};
		open = true; if (_opts.hasOwnProperty("open")) open = _opts.open;
		if (!_opts.hasOwnProperty("onswitch")) _opts.onswitch = "";
		h += '<div id="' + _id + '" data-onswitch="' + _opts.onswitch.HtmlEntities() + '"' + ((_opts.hasOwnProperty("name")) ? ' name="' + _opts.name + '"' : '') + ' class="headerswitch' + (_opts.hasOwnProperty("sticky") ? ' sticky' : '') + ((_opts.hasOwnProperty("hidden") && _opts.hidden) ? ' hidden' : '') + ((_opts.hasOwnProperty("selected") && _opts.selected) ? ' sel' : '') + ((_opts.hasOwnProperty("autowidth") && _opts.autowidth) ? ' autowidth' : '') + '">';
		h += '<h1 id="header_' + _id + '" class="' + (open ? 'open' : 'closed') + '"><span class="' + (_opts.hasOwnProperty("ellipsistext") ? ' ellipsistext' : '') + (_opts.hasOwnProperty("centertext") ? ' centertext' : '') + (_opts.hasOwnProperty("smalltext") ? ' smalltext' : '') + '">';
		if (!_opts.hasOwnProperty("noswitch")) h += '<span id="headerswitch_' + _id + '" class="button headerswitchbutton ' + (_opts.hasOwnProperty("buttonExtraClass") ? ' ' + _opts.buttonExtraClass + " " : '') + (open ? 'icon-circle-down' : 'icon-circle-right') + '"' + ButtonAttributes("GUI.HeaderSwitch(event,'" + _id + "');") + '></span>';
		h += '&nbsp;&nbsp;' + ((icon == "") ? "" : '<img style="display:inline-block" src="' + icon + '"/>') + t + (_opts.hasOwnProperty("inlinebuttons") ? _opts.inlinebuttons : '') + '</span>';
		if (_opts.hasOwnProperty("buttons")) if (_opts.buttons.length > 0) h += '<span class="headerbuttons">' + _opts.buttons.join("") + '</span>';
		if (_opts.hasOwnProperty("extraHTML") && _opts.hasOwnProperty("subTitle")) h += _opts.extraHTML;
		h += '</h1>';
		h += '<div style="display:' + (open ? displayStyle : 'none') + ';" data-display-style="' + displayStyle + '"' + (contentClass != "" ? ' class="' + contentClass + '"' : '') + ' id="headerswitchcontent_' + _id + '">' + _html + '</div>';
		h += '</div>';
		return h;
	}

	/** Builds a collapsible section with an H2 header and toggle button.
	 * @param {string} _id Element id.
	 * @param {string} _title Header title.
	 * @param {string} _html Content HTML.
	 * @param {Object} _opts Options (same as H1HeaderSwitch).
	 * @returns {string} Section HTML.
	 */
	static H2HeaderSwitch(_id, _title, _html, _opts) {
		var h = "", t = "", open, titleIsHTML = false, icon = "", contentClass = "", extraClass = "", displayStyle = "block";
		if (_opts.hasOwnProperty("titleIsHTML")) titleIsHTML = _opts.titleIsHTML;
		if (_opts.hasOwnProperty("extraClass")) extraClass = " " + _opts.extraClass;
		if (_opts.hasOwnProperty("contentClass")) contentClass = _opts.contentClass;
		if (_opts.hasOwnProperty("displayStyle")) displayStyle = _opts.displayStyle;
		if (_opts.hasOwnProperty("icon")) icon = _opts.icon;
		if (_opts.hasOwnProperty("subTitle")) {
			t = '<div class="headerswitchtext' + extraClass + '"><div dir="auto" id="' + _id + '_title" class="title">' + (titleIsHTML ? _title : _title.HtmlEntities()) + '</div>';
			if (_opts.subTitle != "" || _opts.hasOwnProperty("forceSubTitle")) t += '<div dir="auto" id="' + _id + '_subtitle" class="subtitle">' + _opts.subTitle.HtmlEntities() + '</div>';
			t += '</div>';
		} else {
			if (_opts.hasOwnProperty("extraHTML")) {
				t = '<div class="headerswitchtext' + extraClass + '"><div dir="auto" id="' + _id + '_title" class="title">' + (titleIsHTML ? _title : _title.HtmlEntities()) + '</div>' + _opts.extraHTML + '</div>';
			} else {
				t = '<span dir="auto" id="' + _id + '_title">' + (titleIsHTML ? _title : _title.HtmlEntities()) + '</span>';
			};
		};
		open = true; if (_opts.hasOwnProperty("open")) open = _opts.open;
		if (!_opts.hasOwnProperty("onswitch")) _opts.onswitch = "";
		h += '<div id="' + _id + '" data-onswitch="' + _opts.onswitch.HtmlEntities() + '"' + ((_opts.hasOwnProperty("name")) ? ' name="' + _opts.name + '"' : '') + ' class="headerswitch' + (_opts.hasOwnProperty("sticky") ? ' sticky' : '') + ((_opts.hasOwnProperty("hidden") && _opts.hidden) ? ' hidden' : '') + ((_opts.hasOwnProperty("selected") && _opts.selected) ? ' sel' : '') + ((_opts.hasOwnProperty("autowidth") && _opts.autowidth) ? ' autowidth' : '') + '">';
		h += '<h2 id="header_' + _id + '" class="' + (open ? 'open' : 'closed') + '"><span class="' + (_opts.hasOwnProperty("ellipsistext") ? ' ellipsistext' : '') + (_opts.hasOwnProperty("centertext") ? ' centertext' : '') + (_opts.hasOwnProperty("smalltext") ? ' smalltext' : '') + '">';
		if (!_opts.hasOwnProperty("noswitch")) h += '<span id="headerswitch_' + _id + '" class="button headerswitchbutton ' + (_opts.hasOwnProperty("buttonExtraClass") ? ' ' + _opts.buttonExtraClass + " " : '') + (open ? 'icon-circle-down' : 'icon-circle-right') + '"' + ButtonAttributes("GUI.HeaderSwitch(event,'" + _id + "');") + '></span>';
		h += '&nbsp;&nbsp;' + ((icon == "") ? "" : '<img style="display:inline-block" src="' + icon + '"/>') + t + (_opts.hasOwnProperty("inlinebuttons") ? _opts.inlinebuttons : '') + '</span>';
		if (_opts.hasOwnProperty("buttons")) if (_opts.buttons.length > 0) h += '<span class="headerbuttons">' + _opts.buttons.join("") + '</span>';
		if (_opts.hasOwnProperty("extraHTML") && _opts.hasOwnProperty("subTitle")) h += _opts.extraHTML;
		h += '</h2>';
		h += '<div style="display:' + (open ? displayStyle : 'none') + ';" data-display-style="' + displayStyle + '"' + (contentClass != "" ? ' class="' + contentClass + '"' : '') + ' id="headerswitchcontent_' + _id + '">' + _html + '</div>';
		h += '</div>';
		return h;
	}

	/** Builds a collapsible section with an H3 header and toggle button.
	 * @param {string} _id Element id.
	 * @param {string} _title Header title.
	 * @param {string} _html Content HTML.
	 * @param {Object} _opts Options (same as H1HeaderSwitch).
	 * @returns {string} Section HTML.
	 */
	static H3HeaderSwitch(_id, _title, _html, _opts) {
		var h = "", t = "", open, titleIsHTML = false, icon = "", contentClass = "", extraClass = "", displayStyle = "block";
		if (_opts.hasOwnProperty("titleIsHTML")) titleIsHTML = _opts.titleIsHTML;
		if (_opts.hasOwnProperty("extraClass")) extraClass = " " + _opts.extraClass;
		if (_opts.hasOwnProperty("contentClass")) contentClass = _opts.contentClass;
		if (_opts.hasOwnProperty("displayStyle")) displayStyle = _opts.displayStyle;
		if (_opts.hasOwnProperty("icon")) icon = _opts.icon;
		if (_opts.hasOwnProperty("subTitle")) {
			t = '<div class="headerswitchtext' + extraClass + '"><div dir="auto" id="' + _id + '_title" class="title">' + (titleIsHTML ? _title : _title.HtmlEntities()) + '</div>';
			if (_opts.subTitle != "" || _opts.hasOwnProperty("forceSubTitle")) t += '<div dir="auto" id="' + _id + '_subtitle" class="subtitle">' + _opts.subTitle.HtmlEntities() + '</div>';
			t += '</div>';
		} else {
			if (_opts.hasOwnProperty("extraHTML")) {
				t = '<div class="headerswitchtext' + extraClass + '"><div dir="auto" id="' + _id + '_title" class="title">' + (titleIsHTML ? _title : _title.HtmlEntities()) + '</div>' + _opts.extraHTML + '</div>';
			} else {
				t = '<span dir="auto" id="' + _id + '_title">' + (titleIsHTML ? _title : _title.HtmlEntities()) + '</span>';
			};
		};
		open = true; if (_opts.hasOwnProperty("open")) open = _opts.open;
		if (!_opts.hasOwnProperty("onswitch")) _opts.onswitch = "";
		h += '<div id="' + _id + '" data-onswitch="' + _opts.onswitch.HtmlEntities() + '"' + ((_opts.hasOwnProperty("name")) ? ' name="' + _opts.name + '"' : '') + ' class="headerswitch' + (_opts.hasOwnProperty("sticky") ? ' sticky' : '') + ((_opts.hasOwnProperty("hidden") && _opts.hidden) ? ' hidden' : '') + ((_opts.hasOwnProperty("selected") && _opts.selected) ? ' sel' : '') + ((_opts.hasOwnProperty("autowidth") && _opts.autowidth) ? ' autowidth' : '') + '">';
		h += '<h3 id="header_' + _id + '" class="' + (open ? 'open' : 'closed') + '"><span class="' + (_opts.hasOwnProperty("ellipsistext") ? ' ellipsistext' : '') + (_opts.hasOwnProperty("centertext") ? ' centertext' : '') + (_opts.hasOwnProperty("smalltext") ? ' smalltext' : '') + '">';
		if (!_opts.hasOwnProperty("noswitch")) h += '<span id="headerswitch_' + _id + '" class="button headerswitchbutton ' + (_opts.hasOwnProperty("buttonExtraClass") ? ' ' + _opts.buttonExtraClass + " " : '') + (open ? 'icon-circle-down' : 'icon-circle-right') + '"' + ButtonAttributes("GUI.HeaderSwitch(event,'" + _id + "');") + '></span>';
		h += '&nbsp;&nbsp;' + ((icon == "") ? "" : '<img style="display:inline-block" src="' + icon + '"/>') + t + (_opts.hasOwnProperty("inlinebuttons") ? _opts.inlinebuttons : '') + '</span>';
		if (_opts.hasOwnProperty("buttons")) if (_opts.buttons.length > 0) h += '<span class="headerbuttons">' + _opts.buttons.join("") + '</span>';
		if (_opts.hasOwnProperty("extraHTML") && _opts.hasOwnProperty("subTitle")) h += _opts.extraHTML;
		h += '</h3>';
		h += '<div style="display:' + (open ? displayStyle : 'none') + ';" data-display-style="' + displayStyle + '"' + (contentClass != "" ? ' class="' + contentClass + '"' : '') + ' id="headerswitchcontent_' + _id + '">' + _html + '</div>';
		h += '</div>';
		return h;
	}

	/** Builds a sub-headline div (optionally styled as alert).
	 * @param {string} _id Base element id (suffix "_subheadline").
	 * @param {string} [_title=""] Headline text.
	 * @param {Object} [_opts={}] Options: isAlert, extraClass, tooltip.
	 * @returns {string} Sub-headline HTML.
	 */
	static SubHeadlineHTML(_id, _title = "", _opts = {}) {
		var h = "";
		h += '<div class="modalSubHeadLine' + ((_opts.hasOwnProperty("isAlert") && _opts.isAlert) ? ' alert' : '') + (_opts.hasOwnProperty("extraClass") ? ' ' + _opts.extraClass : '') + '" id="' + _id + '_subheadline"' + (_opts.hasOwnProperty("tooltip") ? ' title="' + _opts.tooltip.HtmlEntities() + '"' : '') + '>';
		h += _title.HtmlEntities();
		h += '</div>';
		return h;
	}

	/** Toggles the alert style on a sub-headline.
	 * @param {string} _id Base element id.
	 * @param {boolean} _onOff True to enable alert styling.
	 */
	static SubHeadlineSetAlert(_id, _onOff) {
		var o = document.getElementById(_id + "_subheadline")
		if (o) o.className = o.className.boolClass("alert", _onOff);
	}

	/** Builds a container of input bars, each holding a group of input controls.
	 * @param {string[][]} _inputsHTMLs Array of input HTML groups (one array per bar).
	 * @param {Object} [_opts] Options: id, containerAlign, fullContainer, inputsAligns, context.
	 * @returns {string} Input bar container HTML.
	 */
	static InputBarHTML(_inputsHTMLs, _opts) {
		var h = "", i, l;
		if (_opts === undefined) _opts = { context: "panel" };
		l = _inputsHTMLs.length;
		h += '<div ' + ((_opts.hasOwnProperty("id")) ? 'id="' + _opts.id + '" ' : '') + 'class="inputbarcontainer' + ((_opts.hasOwnProperty("containerAlign")) ? ' ' + _opts.containerAlign : '') + ((_opts.hasOwnProperty("fullContainer")) ? ' full' : '') + '">'
		for (i = 0; i < l; i++) {
			h += '<div class="inputbar' + ((_opts.hasOwnProperty("inputsAligns")) ? ' ' + _opts.inputsAligns[i] : '') + '">';
			h += _inputsHTMLs[i].join("");
			//if(_opts.hasOwnProperty("texts"))if(_opts.texts[i]!="")h+='<div class="text">'+_opts.texts[i].HtmlEntities()+'</div>';
			h += '</div>';
		};
		h += '</div>';
		return h;
	}

	/** Language selector change handler for i18n text inputs: stores the current value and shows the value for the newly selected language.
	 * @param {string} _id Input element id.
	 */
	static TextInputHTMLI18xChange(_id) {
		var osel = document.getElementById(_id + "_sel"), oin = document.getElementById(_id), jerr;
		//log("oin.dataset.input",oin.dataset.inputs);
		var oldlid = oin.dataset.lid, newlid = osel.value, value, newvalue = {};
		try {
			value = JSON.parse(oin.dataset.inputs);
		} catch (jerr) {
			value = { "en-US": oin.dataset.inputs };
		};
		value[oldlid] = oin.value;
		var lid;
		for (lid in value) if (value[lid].trim() != "") newvalue[lid] = value[lid].trim();
		oin.dataset.inputs = JSON.stringify(value);
		oin.dataset.lid = newlid;
		oin.dir = i18x.LIDS_RTL.indexOf(newlid) >= 0 ? "rtl" : "ltr";
		if (value.hasOwnProperty(newlid)) {
			oin.value = value[newlid];
		} else {
			oin.value = "";
		};
	}

	/** Switches an i18n text input to a specific language.
	 * @param {string} _id Input element id.
	 * @param {string} _lid Language id (e.g. "en-US").
	 */
	static TextInputHTMLI18xSet(_id, _lid) {
		var osel = document.getElementById(_id + "_sel");
		if (osel) osel.value = _lid;
		GUI.TextInputHTMLI18xChange(_id);
	}

	/** Switches an i18n text input to the next available language variant (wraps to "en-US").
	 * @param {string} _id Input element id.
	 */
	static TextInputHTMLI18xNext(_id) {
		var osel = document.getElementById(_id + "_sel"), oin = document.getElementById(_id), value, key, nowkey, newkey = "", preWasNowKey = false;
		GUI.TextInputHTMLI18xChange(_id);
		try {
			value = JSON.parse(oin.dataset.inputs);
			nowkey = osel.value;
			var key;
			for (key in value) {
				if (preWasNowKey) newkey = key;
				if (key == nowkey) preWasNowKey = true;
			};
			if (newkey == "") newkey = "en-US";
			osel.value = newkey;
			GUI.TextInputHTMLI18xChange(_id);
		} catch (jerr) {
		};
	}

	/** Input handler for text inputs: clamps int/double values to min/max and runs the custom data-on-input code.
	 * @param {Event} _ev Input event.
	 * @param {string} _id Input element id.
	 */
	static TextInputHTMLOnInput(_ev, _id) {
		var o = document.getElementById(_id), min = Number.MIN_VALUE, max = Number.MAX_VALUE, value, _this = o;
		if (o.dataset.onType == "int") {
			min = Number.MIN_SAFE_INTEGER;
			max = Number.MAX_SAFE_INTEGER;
			if (o.min != "") min = parseInt(o.min, 10);
			if (o.max != "") max = parseInt(o.max, 10);
			value = Math.min(max, Math.max(min, parseInt(o.value, 10)));
			if (value != parseInt(o.value, 10)) o.value = value;
		} else if (o.dataset.onType == "double") {
			min = Number.MIN_VALUE;
			max = Number.MAX_VALUE;
			if (o.min != "") min = parseFloat(o.min);
			if (o.max != "") max = parseFloat(o.max);
			value = Math.min(max, Math.max(min, parseFloat(o.value))).SysClp();
			if (value != parseFloat(o.value)) o.value = value;
		};
		if (o.dataset.onInput) eval(o.dataset.onInput.str_replace('this', '_this'));
	}

	/** Builds a labeled text/number input field, optionally with i18n language selector.
	 * @param {string} _id Input element id.
	 * @param {string|boolean} _title Field label; false for no label.
	 * @param {Object} _opts Options (type, value, i18n, defLid, lidOpts, inline, full, disabled, onchange, oninput, format, min, max, placeholder, context, extraHTML, ...).
	 * @returns {string} Input field HTML.
	 */
	static TextInputHTML(_id, _title, _opts) {
		// !!! MA maxlen parameter!!!!!
		// !!! MA regex parameter!!!!
		var t = "", h = "", extraAttrs = "", value = "", trclass = "", i18txts, valueLid = "en-US", lidOpts = i18x.LIDS_CULTURES, defLid = i18x.curLid, itype = "text", l;
		//defLid = i18x.isAutoLid ? i18x.i18nBestLid : i18x.i18nLid
		if (!_opts.hasOwnProperty("context")) _opts.context = "panel";
		if (_opts.hasOwnProperty("defLid")) defLid = _opts.defLid;
		if (_opts.hasOwnProperty("lidOpts")) lidOpts = _opts.lidOpts;
		if (_opts.hasOwnProperty("type")) {
			switch (_opts.type) {
				case "int":
					itype = "number";
					break;
				case "double":
					itype = "number";
					break;
				case "text":
					itype = "text";
					break;
				default:
					itype = _opts.type;
					break;
			};
		};
		h += '<div class="inputField' + ((_opts.hasOwnProperty("inline") && _opts.inline) ? ' inline' : '') + ((_opts.hasOwnProperty("full") && _opts.full) ? ' full' : '') + '">';
		if (_title !== false) {
			if (_opts.context == "paneltable") _title = _title.wordWrap();
			t += '<div id="' + _id + '_title" class="title' + ((_opts.hasOwnProperty("inline") && _opts.inline) ? ' inline' : '') + '">' + _title.HtmlEntities() + '</div>';
		};
		if (_opts.hasOwnProperty("extraHTML")) h += _opts.extraHTML;
		if (_opts.hasOwnProperty("i18n")) {
			if (_opts.hasOwnProperty("value")) {
				try {
					extraAttrs += ' data-inputs="' + _opts.value.HtmlEntities() + '"';
					i18txts = JSON.parse(_opts.value);
					var l;
					for (l in i18txts) if (!lidOpts.hasOwnProperty(l)) if (i18x.LIDS_CULTURES.hasOwnProperty(l)) lidOpts[l] = i18x.LIDS_CULTURES[l];
					if (i18txts.hasOwnProperty(defLid)) {
						value = i18txts[defLid];
						valueLid = defLid;
						if (value == "") {
							if (i18txts.hasOwnProperty("en-US")) {
								if (i18txts["en-US"] != "") {
									valueLid = "en-US";
									value = i18txts["en-US"];
								};
							};
						};
					} else {
						if (i18txts.hasOwnProperty("en-US")) {
							value = i18txts["en-US"];
							valueLid = "en-US";
						};
					};
					extraAttrs += ' data-i18n="true"';
				} catch (jerr) {
					value = _opts.value;
					valueLid = "en-US";
					extraAttrs = ' data-i18n="true" data-inputs="' + _opts.value.HtmlEntities() + '"';
				};
			} else {
				valueLid = "en-US";
				extraAttrs += ' data-i18n="true" data-inputs=""';
			};
			extraAttrs += ' data-lid="' + valueLid + '"';
			t += '<select id="' + _id + '_sel" class="i18n" oninput="GUI.TextInputHTMLI18xChange(\'' + _id + '\');"/>';
			for (var lid in lidOpts) {
				t += '<option ' + ((valueLid == lid) ? "selected " : "") + 'value="' + lid + '">' + lidOpts[lid].HtmlEntities() + '</option>';
			};
			t += '</select>';
			t += '<span title="' + '...select international language variation...<info context="i18n button tooltip"/>'.I18xTrans().HtmlEntities() + '" onclick="GUI.TextInputHTMLI18xSet(\'' + _id + '\',\'en-US\');" class="icon-earth minibutton button cursor_handpointer"></span>';
			t += '<span title="' + '...select best local language variation...<info context="i18n button tooltip"/>'.I18xTrans().HtmlEntities() + '"onclick="GUI.TextInputHTMLI18xSet(\'' + _id + '\',\'' + i18x.i18nBestLid + '\');" class="icon-home3 minibutton button cursor_handpointer"></span>';
			t += '<span title="' + '...select next available language variation...<info context="i18n button tooltip"/>'.I18xTrans().HtmlEntities() + '"onclick="GUI.TextInputHTMLI18xNext(\'' + _id + '\');" class="icon-forward3 minibutton button cursor_handpointer"></span>';
		} else {
			value = _opts.value;
		};
		if (_opts.type == "int" || _opts.type == "double") if (_opts.hasOwnProperty("oninput") && !_opts.hasOwnProperty("onchange")) _opts.onchange = _opts.oninput;
		if (_opts.hasOwnProperty("format")) value = value.Format(_opts.format);
		h += '<div class="inputline' + (_opts.hasOwnProperty("inline") ? " inline" : "") + '">';
		h += '<input class="input"' +
			extraAttrs +
			' autocomplete="off" data-on-type="' + (_opts.hasOwnProperty("type") ? _opts.type : "text") + '"' +
			((_opts.hasOwnProperty("disabled") && _opts.disabled) ? ' disabled' : '') +
			(_opts.hasOwnProperty("spellcheck") ? ' spellcheck="true"' : ' spellcheck="false"') +
			' type="' + itype + '"' +
			((_opts.type != "int" && _opts.type != "double") ? ' oninput="GUI.TextInputHTMLOnInput(event,\'' + _id + '\');" ' : '') +
			(_opts.hasOwnProperty("onchange") ? ' onchange="' + _opts.onchange.HtmlEntities() + '"' : '') +
			(_opts.hasOwnProperty("oninput") ? ' data-on-input="' + _opts.oninput + '"' : '') +
			' id="' + _id + '"' +
			(_opts.hasOwnProperty("name") ? ' name="' + _opts.name + '"' : ' name="' + _id + '"') +
			' dir="' + (i18x.LIDS_RTL.indexOf(valueLid) >= 0 ? "rtl" : "ltr") + '"' +
			(_opts.hasOwnProperty("minwidth") ? ' style="min-width:' + _opts.minwidth + ';width:initial;"' : '') +
			(_opts.hasOwnProperty("width") ? ' style="width:' + _opts.width + ';min-width:initial;"' : '') +
			(_opts.hasOwnProperty("step") ? ' step="' + _opts.step + '"' : '') +
			(_opts.hasOwnProperty("min") ? ' min="' + _opts.min + '"' : '') +
			(_opts.hasOwnProperty("max") ? ' max="' + _opts.max + '"' : '') +
			(_opts.hasOwnProperty("placeholder") ? ' placeholder="' + _opts.placeholder.tHtmlEntities() + '"' : '') +
			(_opts.hasOwnProperty("value") ? ' value="' + value.tHtmlEntities() + '"' : '') +
			(_opts.hasOwnProperty("tooltip") ? ' title="' + _opts.tooltip.tHtmlEntities() + '"' : '') +
			(_opts.hasOwnProperty("check") ? ' data-check="' + JSON.stringify(_opts.check).HtmlEntities() + '"' : '') +
			(_opts.hasOwnProperty("onenterkey") ? ' onkeypress="if(event.keyCode==13){' + _opts.onenterkey + '}"' : '') +
			'/>';
		h += (_opts.hasOwnProperty("unit") ? '<div class="inputunit">' + _opts.unit.HtmlEntities() + '</div>' : '');
		if (_opts.hasOwnProperty("extrabuttons")) h += _opts.extrabuttons;
		h += '</div>';
		if (_opts.hasOwnProperty("button")) h += _opts.button;
		if (_opts.hasOwnProperty("note")) if (_opts.note != "") h += '<div class="note">*' + _opts.note.I18xTrans().HtmlEntities() + '</div>';
		if (_opts.hasOwnProperty("postExtraHTML")) h += _opts.postExtraHTML;
		h += '</div>';
		switch (_opts.context) {
			case "panel":
			case "modal":
				return t + h;
			case "paneltable":
				if (_opts.hasOwnProperty("trclass")) if (_opts.trclass != "") trclass = ' class="' + _opts.trclass + '"';
				return '<tr id="' + _id + '_inputField"' + trclass + '><td class="formtitle">' + t + '</td><td class="forminput">' + h + '</td>';
			default:
				return "";
		};
	}

	/** Enables or disables a text input inside a panel.
	 * @param {Panel} _panel Panel containing the input.
	 * @param {string} _id Input element id.
	 * @param {boolean} _enabled True to enable.
	 */
	static TextInputSetEnabled(_panel, _id, _enabled) {
		var o = _panel.contentDiv.GetElementById(_id);
		if (o) o.disabled = !_enabled;
	}

	/** Assigns a handler to a text input's onchange event (despite the "KeyPress" name).
	 * @param {Panel} _panel Panel containing the input.
	 * @param {string} _id Input element id.
	 * @param {Function} _onKeyPress Handler function.
	 */
	static TextInputSetOnKeyPress(_panel, _id, _onKeyPress) {
		var o = _panel.contentDiv.GetElementById(_id);
		if (o) o.onchange = _onKeyPress;
	}

	/** Sets the value of a text input inside a panel; supports i18n inputs (JSON value per language).
	 * @param {Panel} _panel Panel containing the input.
	 * @param {string} _id Input element id.
	 * @param {string} _value New value (JSON string for i18n inputs).
	 */
	static TextInputSetValue(_panel, _id, _value) {
		var o = _panel.contentDiv.GetElementById(_id), jerr, value;
		if (o) {
			if (o.dataset.i18n) {
				o.dataset.inputs = _value;
				try {
					value = JSON.parse(_value);
					if (o.dataset.lid == "en-US") {
						o.value = value["en-US"];
					} else {
						if (value.hasOwnProperty(o.dataset.lid)) {
							o.value = value[o.dataset.lid];
						} else {
							o.value = "";
						};
					};
				} catch (jerr) {
					if (o.dataset.lid == "en-US") {
						o.value = _value;
					} else {
						o.value = "";
					};
				};
			} else {
				o.value = _value;
			};
		};
	}

	/** Sets the minimum value attribute of a number input inside a panel.
	 * @param {Panel} _panel Panel containing the input.
	 * @param {string} _id Input element id.
	 * @param {number} _min New minimum.
	 */
	static TextInputSetMin(_panel, _id, _min) {
		var o = _panel.contentDiv.GetElementById(_id);
		if (o) o.min = _min;
	}

	/** Sets the maximum value attribute of a number input inside a panel.
	 * @param {Panel} _panel Panel containing the input.
	 * @param {string} _id Input element id.
	 * @param {number} _max New maximum.
	 */
	static TextInputSetMax(_panel, _id, _max) {
		var o = _panel.contentDiv.GetElementById(_id);
		if (o) o.max = _max;
	}

	/** Reads the value of a text input inside a panel; for i18n inputs returns a JSON string of all non-empty language variants (or a plain string if only "en-US").
	 * @param {Panel} _panel Panel containing the input.
	 * @param {string} _id Input element id.
	 * @param {string} [_defValue=""] Default if the input is missing.
	 * @returns {string} Input value.
	 */
	static TextInputValue(_panel, _id, _defValue = "") {
		var o = _panel.contentDiv.GetElementById(_id), value;
		if (o) {
			if (o.dataset.i18n == "true") {
				var osel = _panel.contentDiv.GetElementById(_id + "_sel");
				var tlid, lid = o.dataset.lid, newvalue = {};
				try {
					value = JSON.parse(o.dataset.inputs);
				} catch (jerr) {
					value = { "en-US": o.dataset.inputs };
				};
				value[lid] = o.value;
				for (tlid in value) if (value[tlid].trim() != "") newvalue[tlid] = value[tlid].trim();
				if (ObjectUtils.countKeys(newvalue) == 1 && newvalue.hasOwnProperty("en-US")) {
					return newvalue["en-US"];
				} else {
					value = JSON.stringify(newvalue);
					if (value == "{}") value = "";
					return value;
				};
			} else {
				return o.value;
			};
		} else {
			return _defValue;
		};
	}

	/** Reads a text input as integer, clamped to its min/max attributes (writes the clamped value back).
	 * @param {Panel} _panel Panel containing the input.
	 * @param {string} _id Input element id.
	 * @param {number} _defValue Default if the input is missing or empty.
	 * @returns {number} Integer value.
	 */
	static TextInputIntValue(_panel, _id, _defValue) {
		var o = _panel.contentDiv.GetElementById(_id), ret, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER;
		if (o) {
			if (o.value == null) return _defValue;
			if (o.min != "") min = parseInt(o.min, 10);
			if (o.max != "") max = parseInt(o.max, 10);
			ret = Math.min(max, Math.max(min, parseInt(o.value, 10)));
			if (ret != parseInt(o.value, 10)) o.value = ret;
			return ret;
		} else {
			return _defValue;
		};
	}

	/** Reads a text input as double, clamped to its min/max attributes and system-precision-clipped.
	 * @param {Panel} _panel Panel containing the input.
	 * @param {string} _id Input element id.
	 * @param {number} _defValue Default if the input is missing or empty.
	 * @returns {number} Double value.
	 */
	static TextInputDoubleValue(_panel, _id, _defValue) {
		var o = _panel.contentDiv.GetElementById(_id), ret, min = Number.MIN_VALUE, max = Number.MAX_VALUE;
		if (o) {
			if (o.value == null) return _defValue.SysClp();;
			if (o.min != "") min = parseFloat(o.min);
			if (o.max != "") max = parseFloat(o.max);
			ret = Math.min(max, Math.max(min, parseFloat(o.value))).SysClp();
			if (ret != parseFloat(o.value)) o.value = ret;
			return ret;
		} else {
			return _defValue.SysClp();;
		};
	}

	/** Opens the user page for a given user in the document viewer.
	 * @param {number} _uId User id.
	 * @param {string} _nickName User nickname (used as tab title).
	 */
	static UserInputShowDoc(_uId, _nickName) {
		var threadsIds = {};
		threadsIds['oxyduser_' + _uId] = { usersId: _uId, title: _nickName };
		globalThis.DocViewer.ShowDoc(threadsIds);
	}

	/** Builds a read-only user display field (avatar plus nickname, clickable to open the user page).
	 * @param {string} _id Element id.
	 * @param {string|boolean} _title Field label; false for no label.
	 * @param {Object} _opts Options: value (user id), avatar, nickName, inline, extraHTML, button, context ("panel", "modal", "paneltable").
	 * @returns {string} User field HTML.
	 */
	static UserInputHTML(_id, _title, _opts) {
		// currently only as disabled input to show an user.
		var t = "", h = "", e = "", extraAttrs = "", nullTimestampText = "./.", uid, nick, but = "", butclass = "";
		if (!_opts.hasOwnProperty("context")) _opts.context = "panel";
		h += '<div class="inputField' + ((_opts.hasOwnProperty("inline") && _opts.inline) ? ' inline' : '') + '">';
		if (_title !== false) {
			if (_opts.context == "paneltable") _title = _title.wordWrap();
			t += '<div id="' + _id + '_title" class="title' + ((_opts.hasOwnProperty("inline") && _opts.inline) ? ' inline' : '') + '">' + _title.HtmlEntities() + '</div>';
		};
		if (_opts.hasOwnProperty("extraHTML")) h += _opts.extraHTML;
		if (_opts.hasOwnProperty("value") && _opts.hasOwnProperty("avatar") && _opts.hasOwnProperty("nickName")) {
			nick = _opts.nickName;
			uid = _opts.value;
			e += '<img class="avatar" src="./dynrscs/avatars/' + _opts.avatar + '">';
			e += '<div class="nickname">' + nick.HtmlEntities() + '</div>';
			but = ' title="' + '...show user page...'.I18xTrans().HtmlEntities() + '" ' + ButtonAttributes("GUI.UserInputShowDoc(" + uid + ",'" + nick + "');");
			butclass = " button";
		} else {
			nick = 'Unkown<info context="unkown avatar nickname"/>'.I18xTrans();
			uid = 0;
			e += '<img class="avatar" src="./skins/' + SKIN + '/imgs/general/gui/unkownavatar.jpg">';
			e += '<div class="nickname">' + nick.HtmlEntities() + '</div>';
			but = "";
		};
		h += '<div class="userinfo' + butclass + '" ' + but + '>';
		h += e;
		h += '</div>';
		if (_opts.hasOwnProperty("button")) h += _opts.button;
		h += '</div>';
		switch (_opts.context) {
			case "panel":
			case "modal":
				return t + h;
			case "paneltable":
				return '<tr><td class="formtitle">' + t + '</td><td class="forminput">' + h + '</td>';
			default:
				return "";
		};
	}

	/** Computes star display states and a tooltip histogram from 1-5 star rating counts.
	 * @param {number[]} _values Counts per star level (index 0 = 1 star ... index 4 = 5 stars).
	 * @param {boolean} [_disabled=false] True if rating is disabled (adds a login hint to the tooltip).
	 * @returns {{title: string, starData: Object<number,string>, total: number}} Tooltip text, star states ("empty"/"half"/"full"), and total count.
	 */
	static GetRatingData(_values, _disabled = false) {
		var total, stars, title = "", numbers = [], maxlen, max, extraCharLength = new Array(5).fill(0), starData = {};
		total = _values[0] + _values[1] + _values[2] + _values[3] + _values[4];
		if (total > 0) {
			numbers[0] = _values[0].Format("int");
			numbers[1] = _values[1].Format("int");
			numbers[2] = _values[2].Format("int");
			numbers[3] = _values[3].Format("int");
			numbers[4] = _values[4].Format("int");
			if (numbers[0].indexOf(",") >= 0) extraCharLength[0] += numbers[0].split(",").length - 1;
			if (numbers[0].indexOf(".") >= 0) extraCharLength[0] += numbers[0].split(".").length - 1;
			if (numbers[1].indexOf(",") >= 0) extraCharLength[1] += numbers[1].split(",").length - 1;
			if (numbers[1].indexOf(".") >= 0) extraCharLength[1] += numbers[1].split(".").length - 1;
			if (numbers[2].indexOf(",") >= 0) extraCharLength[2] += numbers[2].split(",").length - 1;
			if (numbers[2].indexOf(".") >= 0) extraCharLength[2] += numbers[2].split(".").length - 1;
			if (numbers[3].indexOf(",") >= 0) extraCharLength[3] += numbers[3].split(",").length - 1;
			if (numbers[3].indexOf(".") >= 0) extraCharLength[3] += numbers[3].split(".").length - 1;
			if (numbers[4].indexOf(",") >= 0) extraCharLength[4] += numbers[4].split(",").length - 1;
			if (numbers[4].indexOf(".") >= 0) extraCharLength[4] += numbers[4].split(".").length - 1;

			maxlen = Math.max(numbers[0].length, numbers[1].length, numbers[2].length, numbers[3].length, numbers[4].length);
			max = Math.max(_values[0], _values[1], _values[2], _values[3], _values[4]);
			if (_disabled) {
				title = '...please log in to rate...<info context="GUI Rating Comment Tooltip"/>'.I18xTrans().HtmlEntities() + "\n";;
			} else {
				title = "";
			};
			title += '★☆☆☆☆ ' + "  ".repeat(maxlen - numbers[0].length) + (extraCharLength[0] > 0 ? " ".repeat(extraCharLength[0]) : "") + numbers[0] + " " + "█".repeat(Math.floor(_values[0] / max * 10)) + (((_values[0] / max * 10) % 1) > 0.0 ? "▌" : "") + "\n";
			title += '★★☆☆☆ ' + "  ".repeat(maxlen - numbers[1].length) + (extraCharLength[1] > 0 ? " ".repeat(extraCharLength[1]) : "") + numbers[1] + " " + "█".repeat(Math.floor(_values[1] / max * 10)) + (((_values[1] / max * 10) % 1) > 0.0 ? "▌" : "") + "\n";
			title += '★★★☆☆ ' + "  ".repeat(maxlen - numbers[2].length) + (extraCharLength[2] > 0 ? " ".repeat(extraCharLength[2]) : "") + numbers[2] + " " + "█".repeat(Math.floor(_values[2] / max * 10)) + (((_values[2] / max * 10) % 1) > 0.0 ? "▌" : "") + "\n";
			title += '★★★★☆ ' + "  ".repeat(maxlen - numbers[3].length) + (extraCharLength[3] > 0 ? " ".repeat(extraCharLength[3]) : "") + numbers[3] + " " + "█".repeat(Math.floor(_values[3] / max * 10)) + (((_values[3] / max * 10) % 1) > 0.0 ? "▌" : "") + "\n";
			title += '★★★★★ ' + "  ".repeat(maxlen - numbers[4].length) + (extraCharLength[4] > 0 ? " ".repeat(extraCharLength[4]) : "") + numbers[4] + " " + "█".repeat(Math.floor(_values[4] / max * 10)) + (((_values[4] / max * 10) % 1) > 0.0 ? "▌" : "");

			stars = (_values[0] * 1 + _values[1] * 2 + _values[2] * 3 + _values[3] * 4 + _values[4] * 5) / total;
			starData[0] = ((stars < 0.25) ? 'empty' : (stars < 0.75) ? 'half' : 'full');
			starData[1] = ((stars < 1.25) ? 'empty' : (stars < 1.75) ? 'half' : 'full');
			starData[2] = ((stars < 2.25) ? 'empty' : (stars < 2.75) ? 'half' : 'full');
			starData[3] = ((stars < 3.25) ? 'empty' : (stars < 3.75) ? 'half' : 'full');
			starData[4] = ((stars < 4.25) ? 'empty' : (stars < 4.75) ? 'half' : 'full');
		} else {
			if (_disabled) {
				title = '...please log in to rate...<info context="GUI Rating Comment Tooltip"/>'.I18xTrans().HtmlEntities();
			} else {
				title = '...still not rated...<info context="GUI Rating Comment Tooltip"/>'.I18xTrans().HtmlEntities();
			};
			starData[0] = "empty";
			starData[1] = "empty";
			starData[2] = "empty";
			starData[3] = "empty";
			starData[4] = "empty";
		};
		return { title: title, starData: starData, total: total };
	}

	/** Mousemove handler on a rating widget: previews the hovered star count.
	 * @param {MouseEvent} _ev Mouse event.
	 * @param {HTMLElement} _this Rating container element.
	 */
	static OnRatingStarMouseMove(_ev, _this) {
		var o, x, b = _this.getBoundingClientRect();
		if (_this.dataset.requestActive == 1) return;
		x = (_ev.pageX - b.x);
		x = Math.floor(x * 5 / _this.clientWidth);
		if (x > 4) x = 4;
		if (x < 0) x = 0;
		o = document.getElementById(_this.id + "_star0");
		if (o) o.className = "icon-star-" + (x >= 0 ? "full" : "empty");
		o = document.getElementById(_this.id + "_star1");
		if (o) o.className = "icon-star-" + (x >= 1 ? "full" : "empty");
		o = document.getElementById(_this.id + "_star2");
		if (o) o.className = "icon-star-" + (x >= 2 ? "full" : "empty");
		o = document.getElementById(_this.id + "_star3");
		if (o) o.className = "icon-star-" + (x >= 3 ? "full" : "empty");
		o = document.getElementById(_this.id + "_star4");
		if (o) o.className = "icon-star-" + (x >= 4 ? "full" : "empty");
	}

	/** Mouseleave handler on a rating widget: restores the stored star display.
	 * @param {MouseEvent} _ev Mouse event.
	 * @param {HTMLElement} _this Rating container element.
	 */
	static OnRatingStarMouseLeave(_ev, _this) {
		// restore original stars...
		var starData, o;
		if (_this.dataset.requestActive == 1) return;
		starData = JSON.parse(_this.dataset.starData);
		o = document.getElementById(_this.id + "_star0");
		if (o) o.className = "icon-star-" + starData[0];
		o = document.getElementById(_this.id + "_star1");
		if (o) o.className = "icon-star-" + starData[1];
		o = document.getElementById(_this.id + "_star2");
		if (o) o.className = "icon-star-" + starData[2];
		o = document.getElementById(_this.id + "_star3");
		if (o) o.className = "icon-star-" + starData[3];
		o = document.getElementById(_this.id + "_star4");
		if (o) o.className = "icon-star-" + starData[4];
	}

	/** Updates all read-only rating displays for the given rating id (tooltip and star states).
	 * @param {string} _id Rating id.
	 * @param {string} _title New tooltip text.
	 * @param {Object<number,string>} _stars Star states per index ("empty"/"half"/"full").
	 */
	static OnRatingByName(_id, _title, _stars) {
		// set up all disabled visible ratings...
		var i, s, o;
		o = document.getElementsByName("rating_" + _id);
		for (i = 0; i < o.length; i++) o[i].title = _title;
		for (s = 0; s < 5; s++) {
			o = document.getElementsByName("rating_" + _id + "_star" + s);
			for (i = 0; i < o.length; i++)o[i].className = "icon-star-" + _stars[s];
		};
	}

	/** Mouseup handler on a rating widget: submits the clicked star rating via REST and updates the display on success.
	 * @param {MouseEvent} _ev Mouse event.
	 * @param {HTMLElement} _this Rating container element.
	 */
	static OnRatingStarMouseUp(_ev, _this) {
		var o, x, b = _this.getBoundingClientRect(), request = new XMLHttpRequest();
		var idCmp = _this.id.split("_");
		PlaySound("button_up");
		if (_this.dataset.onChange == "") return;
		if (_this.dataset.requestActive == 1) return;
		_this.className = _this.className.addClass("requestrunning");
		_this.dataset.requestActive = 1;

		x = (_ev.pageX - b.x);
		x = Math.floor(x * 5 / _this.clientWidth);
		if (x > 4) x = 4;
		if (x < 0) x = 0;

		request.onreadystatechange = function () {
			if (this.readyState == 4) {
				var res = this.finish(), rdata, o;
				_this.className = _this.className.removeClass("requestrunning");
				_this.dataset.requestActive = 0;
				if (res.ok) {
					rdata = GUI.GetRatingData(res.output.starsCounts, Users.curUser.isLoggedIn);
					_this.title = rdata.title;
					_this.dataset.starData = JSON.stringify(rdata.starData);
					GUI.OnRatingStarMouseLeave({}, _this);
					_this.dataset.rated = 1;
					GUI.OnRatingByName(idCmp[1] , rdata.title, rdata.starData);
					o = document.getElementById('button_' + idCmp[1]  + '_mycomment');
					if (o) o.className = o.className.removeClass("disabled");
					if (_this.dataset.onChange != "") eval(_this.dataset.onChange.str_replace("_values", JSON.stringify(res.output.starsCounts)));
					PlaySound("ok");
				} else {
					PlaySound("no");
				};
			};
		};
		_this.dataset.myRate = (x + 1);
		request.rest("setRating", { rateRef: idCmp[1], rateStars: (x + 1), cache: JSON.parse(_this.dataset.cache) });
	}

	/** Mousedown handler on a rating widget: plays the button-down sound.
	 * @param {MouseEvent} _ev Mouse event.
	 * @param {HTMLElement} _this Rating container element.
	 */
	static OnRatingStarMouseDown(_ev, _this) {
		PlaySound("button_down");
	}

	/** Builds a five-star rating widget (interactive or read-only).
	 * @param {string} _id Rating id of the form "type_tablerefno" (e.g. "models_123").
	 * @param {number[]} _values Counts per star level (five integers).
	 * @param {boolean} [_disabled=false] True for a read-only display.
	 * @param {boolean} [_enabled=true] False to hide the stars.
	 * @param {boolean} [_onlyRated=false] True to render nothing if no ratings exist.
	 * @param {string} [_onChange=""] JS code evaluated after a successful rating (receives "_values").
	 * @param {string} [_extraHTML=""] Extra HTML appended inside the container.
	 * @param {string} [_extraClass=""] Extra CSS class for the container.
	 * @param {Object} [_cache={}] Cache data passed to the rating REST call.
	 * @returns {string} Rating widget HTML.
	 */
	static RatingHTML(_id, _values, _disabled = false, _enabled = true, _onlyRated = false, _onChange = "", _extraHTML = "", _extraClass = "", _cache = {}) {
		// id of form "type_tablerefno" e.g. "models_123"
		// values: an array of five integers (number of stars)
		var h = "", events = "", idTag = "id", attrs = "";
		var rdata = GUI.GetRatingData(_values, _disabled);
		if (_onlyRated && rdata.total == 0) return (_extraHTML == "") ? "" : '<div class="ratingcontainer"' + (_extraClass == "" ? "" : " " + _extraClass) + '">' + _extraHTML + '</div>';
		h += '<div class="ratingcontainer' + (_disabled ? " disabled" : "") + (_extraClass == "" ? "" : " " + _extraClass) + '">';
		if (_disabled || parseInt(_id.split("@")[1], 10) == NaN) {
			attrs = ' name="' + _id + '"';
			idTag = "name";
		} else {
			attrs = ' data-cache="' + JSON.stringify(_cache).HtmlEntities() + '"  data-request-active="0" data-my-rate="0" data-rated="0" data-star-data="' + JSON.stringify(rdata.starData).HtmlEntities() + '" onmousedown="GUI.OnRatingStarMouseDown(event,this);" onmouseup="GUI.OnRatingStarMouseUp(event,this);" onmouseenter="" onmousemove="GUI.OnRatingStarMouseMove(event,this);" onmouseleave="GUI.OnRatingStarMouseLeave(event,this);" data-on-change="' + _onChange + '"';
		};
		h += '<div ' + idTag + '="rating_' + _id + '" ' + ((_enabled) ? '' : ' style="display:none;" ') + 'title="' + rdata.title + '" class="stars"' + attrs + '>';
		h += '<span ' + idTag + '="rating_' + _id + '_star0" class="icon-star-' + rdata.starData[0] + '"></span>';
		h += '<span ' + idTag + '="rating_' + _id + '_star1" class="icon-star-' + rdata.starData[1] + '"></span>';
		h += '<span ' + idTag + '="rating_' + _id + '_star2" class="icon-star-' + rdata.starData[2] + '"></span>';
		h += '<span ' + idTag + '="rating_' + _id + '_star3" class="icon-star-' + rdata.starData[3] + '"></span>';
		h += '<span ' + idTag + '="rating_' + _id + '_star4" class="icon-star-' + rdata.starData[4] + '"></span>';
		h += '</div>';
		h += _extraHTML;
		h += '</div>';
		return h;
	}

	/** Reports a rating comment violation via REST and shows a confirmation or error dialog.
	 * @param {number} _id Rating comment id.
	 */
	static RatingCommentAlert(_id) {
		var request = new XMLHttpRequest();
		request.onreadystatechange = function () {
			if (this.readyState == 4) {
				var res = this.finish();
				curGUI.RemoveModalContent();
				if (res.ok) {
					curGUI.ShowInfo('Violation Rating Comment Report<info context="gui rating button text"/>'.I18xTrans(), 'Thank you for your cooperation and rating comment violation reporting.<newline/>Our team will check this violation soon as possible.<info context="Rating Comment Alert Message"/>'.I18xTrans());
				} else {
					curGUI.ShowAlert('Violation Rating Comment Report failed<info context="gui rating button text"/>'.I18xTrans(), 'Please try again later<info context="Rating Comment Alert Message"/>'.I18xTrans());
				};
			};
		};
		curGUI.ShowWaitMessage('Reporting rating comment violation, please wait...<info context="Wait Message"/>'.I18xTrans());
		request.rest("setRatingCommentAlert", { ratingsId: _id });
	}

	/** Removes the current user's rating comment via REST and refreshes the comment list.
	 * @param {string} _id Rating id.
	 * @param {number} _ratingsId Rating comment record id.
	 */
	static RatingCommentClear(_id, _ratingsId) {
		var request = new XMLHttpRequest();
		request.onreadystatechange = function () {
			if (this.readyState == 4) {
				var res = this.finish();
				curGUI.RemoveModalContent();
				if (res.ok) {
					GUI.RatingComments(_id);
				} else {
					curGUI.ShowAlert('Removing Your Comment failed<info context="GUI Rating Comment message text"/>'.I18xTrans(), 'Please try again later<info context="GUI Rating Comment Alert Message"/>'.I18xTrans());
				};
			};
		};
		curGUI.ShowWaitMessage('Removing your comment, please wait...<info context="Wait Message"/>'.I18xTrans());
		request.rest("clearRatingComment", { ratingsId: _ratingsId });
	}

	/** Toggles and loads the comment list for a rating (fetches JSON and renders the comments).
	 * @param {string} _id Rating id.
	 * @param {boolean} [_doUpdate=false] True to force a reload even if already visible.
	 */
	static RatingComments(_id, _doUpdate = false) {
		var request = new XMLHttpRequest(), o;
		o = document.getElementById("comments_" + _id + "_area");
		request.open("GET", "./dynrscs/comments/" + _id + ".json", true);
		request.setRequestHeader("Content-Type", "application/json");
		request.onreadystatechange = function () {
			var comments = null, c, comment, h = "", err;
			if (this.readyState == 4) {
				try { comments = JSON.parse(this.responseText); } catch (err) { };
				if (this.status == 200 && comments != null) {
					if (o) {
						// sort&filter...
						// ?!!!!
						var c;
						for (c in comments) {
							comment = comments[c];
							h += '<div class="ratingcomment">';
							h += '<div class="commenthead">';
							h += '<span class="icon-star-' + (comment.rateStars >= 1 ? "full" : "empty") + '"></span>';
							h += '<span class="icon-star-' + (comment.rateStars >= 2 ? "full" : "empty") + '"></span>';
							h += '<span class="icon-star-' + (comment.rateStars >= 3 ? "full" : "empty") + '"></span>';
							h += '<span class="icon-star-' + (comment.rateStars >= 4 ? "full" : "empty") + '"></span>';
							h += '<span class="icon-star-' + (comment.rateStars >= 5 ? "full" : "empty") + '"></span>';
							h += " · " + comment.timestamp.FormatTicks("stddatetime").HtmlEntities();
							if (Users.curUser.usersId == comment.usersId) {
								h += GUI.ButtonHTML(_id + "_" + c + "_ratealertbut", false, 'icon-status-edited', "GUI.RatingComment('" + _id + "');", { butclass: "button commentedit", tooltip: '...edit your comment...<info context="tooltip rating comment"/>'.I18xTrans() });
								h += GUI.ButtonHTML(_id + "_" + c + "_ratealertbut", false, 'icon-bin', "GUI.RatingCommentClear('" + _id + "'," + parseInt(c, 10) + ");", { butclass: "button commentalert", tooltip: '...remove your comment...<info context="tooltip rating comment"/>'.I18xTrans() });
							} else {
								h += GUI.ButtonHTML(_id + "_" + c + "_ratealertbut", false, 'icon-alert', "GUI.RatingCommentAlert(" + parseInt(c, 10) + ");", { butclass: "button commentalert", tooltip: '...report a comment violation...<info context="tooltip rating comment"/>'.I18xTrans() });
							};
							h += '</div>';
							h += '<div class="userinfo">';
							h += '<img class="avatar" src="./dynrscs/avatars/' + comment.avatar + '">';
							h += '<div class="nickname">' + comment.nickName.HtmlEntities() + '</div>';
							h += '</div>';
							h += '<div class="commenttext">';
							//if(??)
							h += comment.comment.i18n().HtmlEntities();
							h += '</div>';
							h += '</div>';
						};
						o.innerHTML = h;
					};
				} else {
					if (o) o.innerHTML = 'No comments available.<info context="rating comments no comment messaage"/>'.I18xTrans();
				};
			};
		};
		if (o) {
			if (o.className.hasClass("hidden") || _doUpdate) {
				o.className = o.className.removeClass("hidden");
				o.innerHTML = '<div class="wait"></div>';
				request.send(null);
			} else {
				o.className = o.className.addClass("hidden");
			};
		};
	}

	/** Opens a modal dialog to write or edit the current user's rating comment and submits it via REST.
	 * @param {string} _id Rating id.
	 */
	static RatingComment(_id) {
		var  commentModalPanel, h = "", commentRequest = new XMLHttpRequest(), loadRequest = new XMLHttpRequest(), smartscroll = null;
		var myRate = 0, o, myComment = "";
		o = document.getElementById("rating_" + _id);
		if (o) myRate = o.dataset.myRate;

		commentRequest.onreadystatechange = function () {
			if (this.readyState == 4) {
				var res = this.finish(), o;
				if (res.ok) {
					PlaySound("ok");
					curGUI.RemoveModalContent();
					o = document.getElementById("comments_" + _id + "_area");
					if (o) if (!o.className.hasClass("hidden")) GUI.RatingComments(_id, true);
				} else {
					curGUI.ShowAlert('Error by Sending Contact Message<info context="Alert Message Title"/>'.I18xTrans(), 'Unkown account. Please try again.<info context="Alert Message"/>'.I18xTrans(), ShowCommentPanel);
				};
			};
		};
		function HdlDialogPanel(_ev, _panel) {
			switch (_ev.type) {
				case Panel.EVENTTYPE_APPEARSINDOM:
					ButtonAttributesToElement(document.getElementById("modalCancelButton"), CancelButton);
					GUI.ModalButtonKeyEventsSetUp(document.getElementById("modalCancelButton"), GUI.KEY.ESCAPE, CancelButton);
					ButtonAttributesToElement(document.getElementById("modalSendButton"), SendButton);
					GUI.ModalButtonKeyEventsSetUp(document.getElementById("modalSendButton"), GUI.KEY.ENTER, SendButton);
					ButtonAttributesToElement(document.getElementById("modalSendButton"), SendButton);
					//document.getElementById("commenttext").oninput=HdlDialog;
					//HdlDialog();
					break;
				case Panel.EVENTTYPE_WILLREMOVEDFROMDOM:
					smartscroll = null;
					break;
				case Panel.EVENTTYPE_SIZECHANGED:
					setTimeout(UpdateUpScrollArea, 1000);
					smartscroll = commentModalPanel.SetUpScrollArea(smartscroll, "scrollarea", true);
					break;
			};
		};
		function UpdateUpScrollArea() {
			smartscroll = commentModalPanel.SetUpScrollArea(smartscroll, "scrollarea", true);
		};
		function CancelButton() {
			PlaySound("no");
			FinishCompleteModalDialogs();
		};
		function SendButton() {
			var comment = "";
			var ocot = document.getElementById("commenttext");
			PlaySound("yes");
			curGUI.ShowWaitMessage('Saving comment, please wait...<info context="Wait Message"/>'.I18xTrans());
			commentRequest.rest("setRating", { rateRef: _id, rateComment: commentModalPanel.TextAreaValue("commenttext") });
		};
		//function HdlDialog(){
		//var oct=document.getElementById("commenttext"),osb=document.getElementById("modalSendButton"),ok=true;
		//if(oct.value.trim()==""&&myComment=="")ok=false;
		//if(osb)osb.className=osb.className.boolClass("disabled",!ok);
		//if(osb)osb.className=osb.className.boolClass("disabled",false);
		//};
		function FinishCompleteModalDialogs() {
			curGUI.RemoveModalContent();
			commentModalPanel.Dispose();
		};
		function ShowCommentPanel() {
			curGUI.ShowModalPanel(commentModalPanel);
		};

		loadRequest.open("GET", "./dynrscs/comments/" + _id + ".json", true);
		loadRequest.setRequestHeader("Content-Type", "application/json");
		loadRequest.onreadystatechange = function () {
			var comments = null, c, comment, err;
			if (this.readyState == 4) {
				try { comments = JSON.parse(this.responseText); } catch (err) { };
				if (this.status == 200 && comments != null) {
					var c;
					for (c in comments) {
						if (comments[c].usersId == Users.curUser.usersId) {
							myComment = comments[c].comment;
							break;
						};
					};
				};
				commentModalPanel = new Panel("commentModalPanel", 'Your Comment<info context="Panel Title"/>'.I18xRegister(), Panel.TYPE_MODAL, HdlDialogPanel);
				h += '<div class="header">' + 'Your Comment<info context="Modal Dialog Headline"/>'.I18xTrans().HtmlEntities() + '</div>';
				if (myRate > 0) {
					h += '<div class="title">';
					h += '<span class="icon-star-' + (myRate >= 1 ? "full" : "empty") + '"></span>';
					h += '<span class="icon-star-' + (myRate >= 2 ? "full" : "empty") + '"></span>';
					h += '<span class="icon-star-' + (myRate >= 3 ? "full" : "empty") + '"></span>';
					h += '<span class="icon-star-' + (myRate >= 4 ? "full" : "empty") + '"></span>';
					h += '<span class="icon-star-' + (myRate >= 5 ? "full" : "empty") + '"></span>';
					h += '</div>';
				};
				h += '<div class="scrollArea" id="scrollarea">';
				h += GUI.TextAreaHTML("commenttext", false, { spellcheck: true, defLid: i18x.BrowserLid(), defEditLid: i18x.BrowserLid(), i18n: true, cols: 30, rows: 10, maxlen: 1000, value: myComment, note: (myComment != "") ? 'clear text and save to remove the existing comment.<info context="text area input note"/>' : "" });
				h += '</div>';
				h += '<div class="subbuttons">';
				h += '<div id="modalCancelButton" class="button">' + 'Cancel<info context="button text"/>'.I18xTrans().HtmlEntities() + '</div>';
				h += '<div id="modalSendButton" class="button">' + 'Save<info context="button text"/>'.I18xTrans().HtmlEntities() + '</div>';
				h += '</div>';
				commentModalPanel.contentDiv.innerHTML = h;
				ShowCommentPanel();
			};
		};
		loadRequest.send(null);
		curGUI.ShowWaitMessage('Loading comments, please wait...<info context="Wait Message"/>'.I18xTrans());
	}

	/** Edit-mode toggle for the rating display: switches rating (and dependent comments) on/off and evaluates the edit callback code.
	 * @param {string} _id Rating id.
	 * @param {string} _onedit JS code evaluated with ratingEnabled/commentsEnabled placeholders.
	 */
	static RatingEdit(_id, _onedit) {
		var br = document.getElementById(_id + "_editRating"), fr = document.getElementById("rating_" + _id);
		var bc = document.getElementById(_id + "_editComments"), fc = document.getElementById(_id + "_comments"), ac = document.getElementById("comments_" + _id + "_area");
		if (br) if (fr) if (bc) {
			if (br.className.indexOf("icon-ratingoff") >= 0) {
				br.className = br.className.exchangeClass("icon-ratingoff", "icon-ratingon");
				br.title = '...switch rating on...<info context="button tooltip"/>'.I18xTrans();
				fr.style.display = "none";
				if (bc.className.indexOf("icon-commentsoff") >= 0) {
					bc.className = bc.className.exchangeClass("icon-commentsoff", "icon-commentson");
					bc.title = '...switch comments on...<info context="button tooltip"/>'.I18xTrans();
					if (fc) fc.style.display = "none";
					if (ac) ac.className = ac.className.addClass("hidden");
				};
				bc.className = bc.className.boolClass("disabled", true);
			} else {
				fr.style.display = "block";
				br.className = br.className.exchangeClass("icon-ratingon", "icon-ratingoff");
				br.title = '...switch rating off...<info context="button tooltip"/>'.I18xTrans();
				bc.className = bc.className.boolClass("disabled", false);
			};
			eval(_onedit.I18xTrans({ ratingEnabled: br.className.indexOf("icon-ratingoff") >= 0, commentsEnabled: bc.className.indexOf("icon-commentsoff") >= 0 }));
		};
	}

	/** Edit-mode toggle for the comments display: switches comments on/off and evaluates the edit callback code.
	 * @param {string} _id Rating id.
	 * @param {string} _onedit JS code evaluated with ratingEnabled/commentsEnabled placeholders.
	 */
	static CommentsEdit(_id, _onedit) {
		var br = document.getElementById(_id + "_editRating");
		var bc = document.getElementById(_id + "_editComments"), fc = document.getElementById(_id + "_comments"), ac = document.getElementById("comments_" + _id + "_area");
		if (bc) {
			if (bc.className.indexOf("icon-commentsoff") >= 0) {
				bc.className = bc.className.exchangeClass("icon-commentsoff", "icon-commentson");
				bc.title = '...switch comments on...<info context="button tooltip"/>'.I18xTrans();
				if (fc) fc.style.display = "none";
				if (ac) ac.className = ac.className.addClass("hidden");
			} else {
				bc.className = bc.className.exchangeClass("icon-commentson", "icon-commentsoff");
				bc.title = '...switch comments off...<info context="button tooltip"/>'.I18xTrans();
				if (fc) fc.style.display = "block";
			};
			eval(_onedit.I18xTrans({ ratingEnabled: br.className.indexOf("icon-ratingoff") >= 0, commentsEnabled: bc.className.indexOf("icon-commentsoff") >= 0 }));
		};
	}

	/** Builds a full rating input field (stars, comment buttons, optional edit-mode buttons) with label.
	 * @param {string} _id Rating id.
	 * @param {string|boolean} _title Field label; false for no label.
	 * @param {Object} _opts Options: value, disabled, ratingEnabled, commentsEnabled, allowComments, onchange, cache, editRatingComments, onedit, inline, context ("panel", "modal", "paneltable", "headline", "headlinesmall").
	 * @returns {string} Rating input HTML.
	 */
	static RatingInputHTML(_id, _title, _opts) {
		var t = "", h = "", e = "", value = _opts.value, extraClass = "", editButs = "", editable = false;
		if (_title !== false) {
			if (_opts.context == "paneltable") _title = _title.wordWrap();
			t += '<div id="' + _id + '_title" class="title' + ((_opts.hasOwnProperty("inline") && _opts.inline) ? ' inline' : '') + '">' + _title.HtmlEntities() + '</div>';
		};
		if (_opts.disabled === undefined) _opts.disabled = false;
		if (_opts.ratingEnabled === undefined) _opts.ratingEnabled = true;
		if (_opts.commentsEnabled === undefined) _opts.commentsEnabled = true;
		if (!_opts.disabled) _opts.disabled = !Users.curUser.isLoggedIn;
		if (_opts.onchange === undefined) _opts.onchange = "";
		if (_opts.cache === undefined) _opts.cache = {};
		if (_opts.allowComments === undefined) _opts.allowComments = Users.curUser.isLoggedIn;
		if (_opts.editRatingComments) {
			editable = true;
			if (!_opts.ratingEnabled) _opts.commentsEnabled = false;
			editButs = '<div class="editbuttons">';
			editButs += GUI.ButtonHTML(_id + "_editRating", false, 'icon-rating' + (_opts.ratingEnabled ? 'off' : 'on'), 'GUI.RatingEdit("' + _id + '","' + _opts.onedit + '");', { tooltip: (_opts.ratingEnabled ? '...switch rating off...<info context="button tooltip"/>'.I18xTrans() : '...switch rating on...<info context="button tooltip"/>'.I18xTrans()) });
			editButs += GUI.ButtonHTML(_id + "_editComments", false, 'icon-comments' + (_opts.commentsEnabled ? 'off' : 'on'), 'GUI.CommentsEdit("' + _id + '","' + _opts.onedit + '");', { disabled: !_opts.ratingEnabled, tooltip: (_opts.commentsEnabled ? '...switch comments off...<info context="button tooltip"/>'.I18xTrans() : '...switch comments on...<info context="button tooltip"/>'.I18xTrans()) });
			if (_opts.editRatingCommentsExtraBut) editButs += _opts.editRatingCommentsExtraBut;
			editButs += '</div>';
		};
		if (_opts.allowComments) {
			e += '<div id="' + _id + '_comments" class="commentbuttons" style="display:' + ((_opts.commentsEnabled) ? 'block;"' : 'none;"') + '>';
			e += '<span id="button_' + _id + '_comments" title="' + '...show comments...<info context="rating comments text"/>'.I18xTrans().HtmlEntities() + '" class="button icon-bubbles2"' + ButtonAttributes("GUI.RatingComments('" + _id + "');") + '></span>';
			if (Users.curUser.isLoggedIn) e += '<span id="button_' + _id + '_mycomment" title="' + '...add/change/remove your comment...<info context="rating comment text"/>'.I18xTrans().HtmlEntities() + '" class="button disabled icon-bubble"' + ButtonAttributes("GUI.RatingComment('" + _id + "');") + '></span>';
			e += '</div>';
			e += '<div id="comments_' + _id + '_area" class="ratingcomments hidden">';
			e += '</div>';
		};
		if (_opts.context == "headline") extraClass = "headline";
		if (_opts.context == "headlinesmall") extraClass = "headlinesmall";
		h += GUI.RatingHTML(_id, _opts.value, _opts.disabled, _opts.ratingEnabled, false, _opts.onchange, e + editButs, extraClass + (editable ? " editable" : ""), _opts.cache);
		switch (_opts.context) {
			case "headline":
			case "headlinesmall":
				return h;
			case "panel":
			case "modal":
				return t + h;
			case "paneltable":
				return '<tr><td class="formtitle">' + t + '</td><td class="forminput">' + h + '</td>';
			default:
				return "";
		};
	}

	/** Placeholder to set rating/comments edit state; currently a no-op.
	 * @param {string} _id Rating id.
	 * @param {boolean} _ratingEnabled Rating enabled state.
	 * @param {boolean} _commentsEnabled Comments enabled state.
	 */
	static RatingInputSetEdit(_id, _ratingEnabled, _commentsEnabled) {
	}

	/** Builds a (typically read-only) text input showing a formatted timestamp.
	 * @param {string} _id Input element id.
	 * @param {string|boolean} _title Field label; false for no label.
	 * @param {Object} _opts Options: value (ticks; 0 shows nullText), nullText, disabled, inline, onchange, oninput, onenterkey, placeholder, tooltip, extraHTML, context.
	 * @returns {string} Timestamp field HTML.
	 */
	static TimestampInputHTML(_id, _title, _opts) {
		// currently only as disabled input to show a timestamp.
		var t = "", h = "", extraAttrs = "", nullTimestampText = "./.";
		if (!_opts.hasOwnProperty("context")) _opts.context = "panel";
		h += '<div class="inputField' + ((_opts.hasOwnProperty("inline") && _opts.inline) ? ' inline' : '') + '">';
		if (_title !== false) {
			if (_opts.context == "paneltable") _title = _title.wordWrap();
			t += '<div id="' + _id + '_title" class="title' + ((_opts.hasOwnProperty("inline") && _opts.inline) ? ' inline' : '') + '">' + _title.HtmlEntities() + '</div>';
		};
		if (_opts.hasOwnProperty("extraHTML")) h += _opts.extraHTML;
		if (_opts.hasOwnProperty("nullText")) nullTimestampText = _opts.nullText;
		h += '<input class="input" type="text" ' +
			extraAttrs +
			((_opts.hasOwnProperty("disabled") && _opts.disabled) ? ' disabled' : '') +
			(_opts.hasOwnProperty("onchange") ? ' onchange="' + _opts.onchange + '"' : '') +
			(_opts.hasOwnProperty("oninput") ? ' oninput="' + _opts.oninput + '"' : '') +
			' id="' + _id + '"' +
			(_opts.hasOwnProperty("placeholder") ? ' placeholder="' + _opts.placeholder.tHtmlEntities() + '"' : '') +
			(_opts.hasOwnProperty("value") ? ' value="' + ((_opts.value == 0) ? nullTimestampText : _opts.value.FormatTicks("stddatetime").HtmlEntities()) + '"' : '') +
			(_opts.hasOwnProperty("tooltip") ? ' title="' + _opts.tooltip.tHtmlEntities() + '"' : '') +
			(_opts.hasOwnProperty("onenterkey") ? ' onkeypress="if(event.keyCode==13){' + _opts.onenterkey + '}"' : '') +
			'/>';
		if (_opts.hasOwnProperty("button")) h += _opts.button;
		h += '</div>';
		switch (_opts.context) {
			case "panel":
			case "modal":
				return t + h;
			case "paneltable":
				return '<tr><td class="formtitle">' + t + '</td><td class="forminput">' + h + '</td>';
			default:
				return "";
		};
	}

	/** Sets a timestamp input's display value (formatted; "./." for 0).
	 * @param {Panel} _panel Panel containing the input (unused; global lookup).
	 * @param {string} _id Input element id.
	 * @param {number} _value Timestamp in ticks.
	 */
	static TimestampInputSetValue(_panel, _id, _value) {
		var o = document.getElementById(_id), nullTimestampText = "./.";
		if (o) o.value = ((_value == 0) ? nullTimestampText : _value.FormatTicks("stddatetime"));
	}

	/** Assigns an onchange handler to a range input (looked up by name).
	 * @param {Panel} _panel Panel containing the input.
	 * @param {string} _id Input name.
	 * @param {Function} _onchange Handler function.
	 */
	static RangeInputSetOnChange(_panel, _id, _onchange) {
		var o = _panel.contentDiv.GetElementsByName(_id), i, l;
		if (o) o.onchange = _onchange;
	}

	/** Input handler for the range slider: rounds the value, updates tooltip, runs custom input code, and syncs the text input.
	 * @param {Event} _ev Input event.
	 * @param {string} _id Range input base id.
	 */
	static RangeInputOnRangeInput(_ev, _id) {
		var or = document.getElementById(_id + '_range'), ot = document.getElementById(_id + '_text');
		if (or) {
			or.value = parseFloat(or.value).Frac(4);
			if (or.dataset.hasOwnProperty("ontooltip")) or.title = or.dataset.ontooltip.I18xTrans({ value: or.value });
			if (or.dataset.hasOwnProperty("oninput") && or.dataset.oninput != "") eval(or.dataset.oninput.str_replace('this', 'or'));
			if (ot) ot.value = or.value;
		};
	}

	/** Input handler for the range's companion text input: clamps the value and syncs the slider.
	 * @param {Event} _ev Input event.
	 * @param {string} _id Range input base id.
	 */
	static RangeInputOnTextInput(_ev, _id) {
		var or = document.getElementById(_id + '_range'), ot = document.getElementById(_id + '_text'), v, min, max;
		if (or) if (ot) {
			v = parseFloat(ot.value);
			if (isNaN(v)) v = 0;
			ot.value = parseFloat(ot.value).Frac(4);
			min = parseFloat(ot.min);
			max = parseFloat(ot.max);
			if (ot.value < min) ot.value = min;
			if (ot.value > max) ot.value = max;
			ot.value = parseFloat(ot.value);
			if (or.dataset.hasOwnProperty("oninput") && or.dataset.oninput != "") eval(ot.dataset.onInput.str_replace('this', 'ot'));
			or.value = ot.value;
		};
	}

	/** Builds a labeled range slider, optionally with unit labels and a synchronized number input.
	 * @param {string} _id Base element id ("_range"/"_text" suffixes).
	 * @param {string|boolean} _title Field label; false for no label.
	 * @param {Object} _opts Options: value, min, max, step, unit, units, unitsformat, oninput, onchange, tooltip, textinput, rangegrow, defvalue, extraHTML, context.
	 * @returns {string} Range input HTML.
	 */
	static RangeInputHTML(_id, _title, _opts) {
		var t = "", h = "", i, tooltip = "", tooltipData = "";
		if (!_opts.hasOwnProperty("context")) _opts.context = "panel";
		h += '<div class="inputField">';
		if (_title !== false) {
			if (_opts.context == "paneltable") _title = _title.wordWrap();
			t += '<div class="title" id="' + _id + '_title" class="inputField">' + _title.HtmlEntities() + '</div>';
		};
		if (_opts.hasOwnProperty("extraHTML")) h += _opts.extraHTML;
		if (_opts.hasOwnProperty("tooltip")) {
			if (_opts.tooltip.indexOf("<value") >= 0) {
				tooltipData = _opts.tooltip;
				tooltip = _opts.tooltip.I18xTrans({ value: _opts.value });
			} else {
				tooltip = _opts.tooltip;
			};
		};
		h += '<div style="flex-grow:' + (_opts.hasOwnProperty("rangegrow") ? _opts.rangegrow : '1') + ';">';
		h += '<div class="inputline">';
		h += '<input class="range" type="range"' +
			((tooltipData != "") ? ' data-ontooltip="' + tooltipData.HtmlEntities() + '"' : '') +
			(_opts.hasOwnProperty("oninput") ? ' data-oninput="' + _opts.oninput.HtmlEntities() + '"' : '') +
			' oninput="GUI.RangeInputOnRangeInput(event,\'' + _id + '\');"' +
			(_opts.hasOwnProperty("onchange") ? ' onchange="' + _opts.onchange + '"' : '') +
			' id="' + _id + '_range"' +
			(_opts.hasOwnProperty("step") ? ' step="' + _opts.step + '"' : '') +
			(_opts.hasOwnProperty("min") ? ' min="' + _opts.min + '"' : '') +
			(_opts.hasOwnProperty("max") ? ' max="' + _opts.max + '"' : '') +
			(_opts.hasOwnProperty("defvalue") ? ' data-def-value="' + _opts.value.tHtmlEntities() + '"' : '') +
			(_opts.hasOwnProperty("value") ? ' value="' + _opts.value.tHtmlEntities() + '"' : '') +
			(_opts.hasOwnProperty("tooltip") ? ' title="' + tooltip.tHtmlEntities() + '"' : '') +
			'/>';
		h += (_opts.hasOwnProperty("unit") ? '<div class="inputunit">' + _opts.unit.HtmlEntities() + '</div>' : '');
		h += '</div>';
		if (_opts.hasOwnProperty("units")) {
			if (_opts.units.length > 0) {
				h += '<div class="inputline">';
				h += '<div class="inputunits">';
				if (typeof _opts.units[0] == "string") {
					for (i = 0; i < _opts.units.length; i++)h += '<div class="rangeinputunit">' + _opts.units[i].HtmlEntities() + '</div>';
				} else {
					for (i = 0; i < _opts.units.length; i++)h += '<div class="rangeinputunit">' + (_opts.hasOwnProperty("unitsformat") ? _opts.units[i].Format(_opts.unitsformat).HtmlEntities() : _opts.units[i]) + (_opts.hasOwnProperty("unit") ? ' ' + _opts.unit.HtmlEntities() : '') + '</div>';
				};
				h += '</div>';
				h += (_opts.hasOwnProperty("unit") ? '<div class="inputunit" style="color:transparent">' + _opts.unit.HtmlEntities() + '</div>' : '');
				h += '</div>';
			};
			h += '</div>';
		};
		h += '</div>';
		if (_opts.hasOwnProperty("textinput")) {
			h += '<div class="inputline">';
			h += '<input class="input" type="number"' +
				(_opts.hasOwnProperty("value") ? ' value="' + _opts.value.tHtmlEntities() + '"' : '') +
				' id="' + _id + '_text"' +
				' required' +
				' oninput="GUI.RangeInputOnTextInput(event,\'' + _id + '\');"' +
				' onblur="GUI.RangeInputOnTextInput(event,\'' + _id + '\');"' +
				(_opts.hasOwnProperty("oninput") ? ' data-on-input="' + _opts.oninput + '"' : '') +
				(_opts.hasOwnProperty("onchange") ? ' onchange="' + _opts.onchange + '"' : '') +
				(_opts.hasOwnProperty("step") ? ' step="' + _opts.step + '"' : '') +
				(_opts.hasOwnProperty("min") ? ' min="' + _opts.min + '"' : '') +
				(_opts.hasOwnProperty("max") ? ' max="' + _opts.max + '"' : '') +
				'/>';
			h += (_opts.hasOwnProperty("unit") ? '<div class="inputunit">' + _opts.unit.HtmlEntities() + '</div>' : '');
			h += '</div>';
		};
		h += '</div>';
		switch (_opts.context) {
			case "panel":
			case "modal":
				return t + h;
			case "paneltable":
				return '<tr id="' + _id + '_inputField"><td class="formtitle">' + t + '</td><td class="forminput">' + h + '</td>';
			default:
				return "";
		};
	}

	/** Reads a range input's value as integer.
	 * @param {Panel} _panel Panel containing the input.
	 * @param {string} _id Range input base id.
	 * @param {number} _defValue Default if the input is missing.
	 * @returns {number} Integer value.
	 */
	static RangeInputIntValue(_panel, _id, _defValue) {
		var o = _panel.contentDiv.GetElementById(_id + "_range");
		if (o) {
			return parseInt(o.value, 10);
		} else {
			return _defValue;
		};
	}

	/** Reads a range input's value as double (system-precision-clipped).
	 * @param {Panel} _panel Panel containing the input.
	 * @param {string} _id Range input base id.
	 * @param {number} _defValue Default if the input is missing.
	 * @returns {number} Double value.
	 */
	static RangeInputDoubleValue(_panel, _id, _defValue) {
		var o = _panel.contentDiv.GetElementById(_id + "_range");
		if (o) {
			return parseFloat(o.value).SysClp();;
		} else {
			return _defValue.SysClp();
		};
	}

	/** Assigns an oninput handler to a range input.
	 * @param {Panel} _panel Panel containing the input.
	 * @param {string} _id Range input base id.
	 * @param {Function} _onInput Handler function.
	 */
	static RangeInputSetOnInput(_panel, _id, _onInput) {
		var o = _panel.contentDiv.GetElementById(_id + "_range");
		if (o) o.oninput = _onInput;
	}

	/** Sets a range input's value and triggers its input handling.
	 * @param {Panel} _panel Panel containing the input.
	 * @param {string} _id Range input base id.
	 * @param {number} _value New value.
	 */
	static RangeInputSetValue(_panel, _id, _value) {
		var o = _panel.contentDiv.GetElementById(_id + "_range");
		if (o) {
			o.value = _value;
			GUI.RangeInputOnRangeInput(null, _id);
		};
	}

	/** Parses a joint definition string into its physical parameters and derives the joint mode.
	 * @param {string} _j Comma-separated values: springConstant, shrunkenLength, neutralLength, effectStartLength, breakingLength.
	 * @returns {Object} Parsed values plus mode (0 universal, 1 rubber band, 2 spring, 3 rope, 4 pole).
	 */
	static JointInputInfo(_j) {
		var ret = {}, d = _j.split(",");
		ret.springConstant = parseFloat(d[0]);
		ret.shrunkenLength = parseFloat(d[1]);
		ret.neutralLength = parseFloat(d[2]);
		ret.effectStartLength = parseFloat(d[3]);
		ret.breakingLength = parseFloat(d[4]);
		ret.mode = 0;
		if (ret.effectStartLength == 0.0) {
			// it's a spring or a pole (this.springConstant>3.0)...
			ret.mode = (ret.springConstant > 10.0) ? 4 : 2;
			if (ret.mode == 2 && ret.neutralLength < ret.shrunkenLength) ret.mode = 0;
			if (ret.mode == 4 && ret.effectStartLength != 0) ret.mode = 0;
		} else {
			// it's a rubber band (this.neutralLength==this.shrunkenLength) or a rope
			ret.mode = (ret.springConstant > 10.0) ? 3 : 1;
			if (ret.mode == 1 && (ret.neutralLength != ret.shrunkenLength || ret.neutralLength != ret.effectStartLength || ret.effectStartLength != ret.shrunkenLength)) ret.mode = 0;
			if (ret.mode == 3 && (ret.effectStartLength != ret.neutralLength || ret.neutralLength != ret.shrunkenLength)) ret.mode = 0;
		};
		return ret;
	}

	/** Builds a compound joint editor (mode selector plus range/number inputs for all joint parameters).
	 * @param {string} _id Base element id.
	 * @param {string|boolean} _title Field label; false for no label.
	 * @param {Object} _opts Options: value (joint definition string), oninput, context.
	 * @returns {string} Joint editor HTML.
	 */
	static JointInputHTML(_id, _title, _opts) {
		var t = "", h = "", info = GUI.JointInputInfo(_opts.value);
		if (!_opts.hasOwnProperty("context")) _opts.context = "panel";
		h += '<div class="inputField">';
		if (_title !== false) {
			if (_opts.context == "paneltable") _title = _title.wordWrap();
			t += '<div class="title" id="' + _id + '_title" class="inputField">' + _title.HtmlEntities() + '</div>';
		};
		h += '<div class="inputline smalltitle">';
		h += 'Mode<info context="gui joint input"/>'.I18xTrans().HtmlEntities() + '&nbsp;&nbsp;';
		h += '<select id="' + _id + '_modesel" class="jointmode joint' + info.mode + '" onchange="GUI.JointInputOnInput(event,\'' + _id + '\',true);" data-oninput="' + _opts.oninput.HtmlEntities() + '"/>';
		h += '<option class="joint" value="0"' + ((info.mode == 0) ? 'selected' : '') + '>' + 'Universal<info context="gui joint input"/>'.I18xTrans().HtmlEntities() + '</option>';
		h += '<option class="joint" value="1"' + ((info.mode == 1) ? 'selected' : '') + '>' + 'Rubber Band<info context="gui joint input"/>'.I18xTrans().HtmlEntities() + '</option>';
		h += '<option class="joint" value="2"' + ((info.mode == 2) ? 'selected' : '') + '>' + 'Spring<info context="gui joint input"/>'.I18xTrans().HtmlEntities() + '</option>';
		h += '<option class="joint" value="3"' + ((info.mode == 3) ? 'selected' : '') + '>' + 'Rope<info context="gui joint input"/>'.I18xTrans().HtmlEntities() + '</option>';
		h += '<option class="joint" value="4"' + ((info.mode == 4) ? 'selected' : '') + '>' + 'Pole<info context="gui joint input"/>'.I18xTrans().HtmlEntities() + '</option>';
		h += '</select>';
		h += '</div>';

		h += '<div class="inputline smalltitle">' + 'Spring Constant<info context="gui joint input"/>'.I18xTrans().HtmlEntities() + '</div>';
		h += '<div class="inputline">';
		h += '<input id="' + _id + '_range_SpringConstant" oninput="GUI.JointInputOnInput(event,\'' + _id + '\',false);" class="range" type="range" min="0.0" step="0.1" value="' + info.springConstant + '"/>';
		h += '<div class="inputunit">N/m</div>';
		h += '</div>';
		h += '<div class="inputline">';
		h += '<div class="inputunits">';
		h += '<div id="' + _id + '_minUnitSpringConstant" class="rangeinputunit">' + '0 N/m'.HtmlEntities() + '</div>';
		h += '<div id="' + _id + '_maxUnitSpringConstant" class="rangeinputunit">' + '10 N/m'.HtmlEntities() + '</div>';
		h += '</div>';
		h += '</div>';
		h += '<div class="inputline joint">';
		h += '<input id="' + _id + '_text_SpringConstant" onchange="GUI.JointInputOnInput(event,\'' + _id + '\',false);" class="input" type="number" min="0.0" step="0.1" value="' + info.springConstant + '"/>';
		h += '<div class="inputunit">N/m</div>';
		h += '</div>';

		h += '<div class="inputline smalltitle">' + 'Shrunken Length<info context="gui joint input"/>'.I18xTrans().HtmlEntities() + '</div>';
		h += '<div class="inputline">';
		h += '<input id="' + _id + '_range_ShrunkenLength" oninput="GUI.JointInputOnInput(event,\'' + _id + '\',false);" class="range" type="range" min="0.0" step="0.1" value="' + info.shrunkenLength + '"/>';
		h += '<div class="inputunit">m</div>';
		h += '</div>';
		h += '<div class="inputline">';
		h += '<div class="inputunits">';
		h += '<div class="rangeinputunit">' + '0 m'.HtmlEntities() + '</div>';
		h += '<div id="' + _id + '_maxUnitShrunkenLength" class="rangeinputunit">' + '100 m'.HtmlEntities() + '</div>';
		h += '</div>';
		h += '</div>';
		h += '<div class="inputline joint">';
		h += '<input id="' + _id + '_text_ShrunkenLength" onchange="GUI.JointInputOnInput(event,\'' + _id + '\',false);" class="input" type="number" min="0.0" step="0.1"value="' + info.shrunkenLength + '"/>';
		h += '<div class="inputunit">m</div>';
		h += '</div>';

		h += '<div class="inputline smalltitle">' + 'Neutral Length<info context="gui joint input"/>'.I18xTrans().HtmlEntities() + '</div>';
		h += '<div class="inputline">';
		h += '<input id="' + _id + '_range_NeutralLength" oninput="GUI.JointInputOnInput(event,\'' + _id + '\',false);"class="range" type="range" min="0.0" step="0.1" value="' + info.neutralLength + '"/>';
		h += '<div class="inputunit">m</div>';
		h += '</div>';
		h += '<div class="inputline">';
		h += '<div class="inputunits">';
		h += '<div class="rangeinputunit">' + '0 m'.HtmlEntities() + '</div>';
		h += '<div id="' + _id + '_maxUnitNeutralLength" class="rangeinputunit">' + '100 m'.HtmlEntities() + '</div>';
		h += '</div>';
		h += '</div>';
		h += '<div class="inputline joint">';
		h += '<input id="' + _id + '_text_NeutralLength" onchange="GUI.JointInputOnInput(event,\'' + _id + '\',false);"class="input" type="number" min="0.0" step="0.1" value="' + info.neutralLength + '"/>';
		h += '<div class="inputunit">m</div>';
		h += '</div>';

		h += '<div class="inputline smalltitle">' + 'Effect Start Length<info context="gui joint input"/>'.I18xTrans().HtmlEntities() + '</div>';
		h += '<div class="inputline">';
		h += '<input id="' + _id + '_range_EffectStartLength" oninput="GUI.JointInputOnInput(event,\'' + _id + '\',false);"class="range" type="range" step="0.1" min="0.0" value="' + info.effectStartLength + '"/>';
		h += '<div class="inputunit">m</div>';
		h += '</div>';
		h += '<div class="inputline">';
		h += '<div class="inputunits">';
		h += '<div class="rangeinputunit">' + '0 m'.HtmlEntities() + '</div>';
		h += '<div id="' + _id + '_maxUnitEffectStartLength" class="rangeinputunit">' + '100 m'.HtmlEntities() + '</div>';
		h += '</div>';
		h += '</div>';
		h += '<div class="inputline joint">';
		h += '<input id="' + _id + '_text_EffectStartLength" onchange="GUI.JointInputOnInput(event,\'' + _id + '\');" class="input" type="number" min="0.0" step="0.1" value="' + info.effectStartLength + '"/>';
		h += '<div class="inputunit">m</div>';
		h += '</div>';

		h += '<div class="inputline smalltitle">' + 'Breaking Length<info context="gui joint input"/>'.I18xTrans().HtmlEntities() + '</div>';
		h += '<div class="inputline">';
		h += '<input id="' + _id + '_range_BreakingLength" class="range" oninput="GUI.JointInputOnInput(event,\'' + _id + '\');" type="range" min="0.0" max="100.0" step="0.1" value="' + info.breakingLength + '"/>';
		h += '<div class="inputunit">m</div>';
		h += '</div>';
		h += '<div class="inputline">';
		h += '<div class="inputunits">';
		h += '<div class="rangeinputunit">' + '0 m'.HtmlEntities() + '</div>';
		h += '<div class="rangeinputunit">' + '100 m'.HtmlEntities() + '</div>';
		h += '</div>';
		h += '</div>';
		h += '<div class="inputline joint">';
		h += '<input id="' + _id + '_text_BreakingLength" class="input" type="number" min="0.0" max="100.0" step="0.1"  onchange="GUI.JointInputOnInput(event,\'' + _id + '\');" value="' + info.breakingLength + '"/>';
		h += '<div class="inputunit">m</div>';
		h += '</div>';
		h += '<img src="./skins/' + SKIN + '/imgs/empty.png" class="empty" onload="GUI.JointInputOnInput(event,\'' + _id + '\',true,false);">';

		h += '</div>';
		switch (_opts.context) {
			case "panel":
			case "modal":
				return t + h;
			case "paneltable":
				return '<tr><td class="formtitle">' + t + '</td><td class="forminput">' + h + '</td>';
			default:
				return "";
		};
	}

	/** Input handler for the joint editor: syncs range/text inputs, enforces mode constraints, and evaluates the custom input code.
	 * @param {Event} _ev Input event.
	 * @param {string} _id Joint editor base id.
	 * @param {boolean} [_setMode=false] True when triggered by a mode change (recomputes limits).
	 * @param {boolean} [_doEval=true] False to skip evaluating the custom input code.
	 */
	static JointInputOnInput(_ev, _id, _setMode = false, _doEval = true) {
		var mode, omode = document.getElementById(_id + '_modesel'), maxLenValue, maxLenText, minSCValue, maxSCValue, inputType, inputId,
			osct = document.getElementById(_id + '_text_SpringConstant'),
			oscr = document.getElementById(_id + '_range_SpringConstant'),
			oscu1 = document.getElementById(_id + '_minUnitSpringConstant'),
			oscu2 = document.getElementById(_id + '_maxUnitSpringConstant'),

			oslt = document.getElementById(_id + '_text_ShrunkenLength'),
			oslr = document.getElementById(_id + '_range_ShrunkenLength'),
			oslu2 = document.getElementById(_id + '_maxUnitShrunkenLength'),

			onlt = document.getElementById(_id + '_text_NeutralLength'),
			onlr = document.getElementById(_id + '_range_NeutralLength'),
			onlu2 = document.getElementById(_id + '_maxUnitNeutralLength'),

			oelt = document.getElementById(_id + '_text_EffectStartLength'),
			oelr = document.getElementById(_id + '_range_EffectStartLength'),
			oelu2 = document.getElementById(_id + '_maxUnitEffectStartLength'),

			oblt = document.getElementById(_id + '_text_BreakingLength'),
			oblr = document.getElementById(_id + '_range_BreakingLength');

		if (oblt == null) return;
		omode.className = "jointmode joint" + omode.value;

		maxLenValue = parseFloat(oblr.value);
		if (_ev.srcElement) if (_ev.srcElement.id.indexOf("Breaking") > 0 || _setMode) {
			maxLenText = (maxLenValue.Format("floatfix2") + " m").HtmlEntities();
			oslr.min = 0;
			oslt.min = 0;
			oslr.max = maxLenValue;
			oslt.max = maxLenValue;
			oslu2.innerText = maxLenText;
			onlt.min = 0;
			onlr.min = 0;
			onlt.max = maxLenValue;
			onlr.max = maxLenValue;
			onlu2.innerText = maxLenText;
			oelt.min = 0;
			oelr.min = 0;
			oelt.max = maxLenValue;
			oelr.max = maxLenValue;
			oelu2.innerText = maxLenText;
		};

		mode = parseInt(omode.value, 10);
		if (_ev.srcElement) {
			if (_ev.srcElement.tagName == "INPUT") {
				inputId = _ev.srcElement.id.cutRestAtLastCharOf();
				inputType = _ev.srcElement.type;
				if (inputType == "range") {
					switch (inputId) {
						case "SpringConstant":
							osct.value = oscr.value;
							break;
						case "ShrunkenLength":
							oslt.value = oslr.value;
							break;
						case "NeutralLength":
							onlt.value = onlr.value;
							break;
						case "EffectStartLength":
							oelt.value = oelr.value;
							break;
						case "BreakingLength":
							oblt.value = oblr.value;
							break;
					};
				} else if (inputType == "number") {
					switch (inputId) {
						case "SpringConstant":
							oscr.value = osct.value;
							break;
						case "ShrunkenLength":
							oslr.value = oslt.value;
							break;
						case "NeutralLength":
							onlr.value = onlt.value;
							break;
						case "EffectStartLength":
							oelr.value = oelt.value;
							break;
						case "BreakingLength":
							oblr.value = oblt.value;
							break;
					};
				};
			};
		};

		switch (mode) {
			case 0:
				break;
			case 1:
				// rubber band
				onlt.value = oslt.value;
				onlr.value = oslr.value;
				oelt.value = oslt.value;
				oelr.value = oslr.value;
				break;
			case 2:
				// spring
				oelt.value = 0.0;
				oelr.value = 0.0;
				if (inputId == "ShrunkenLength") {
					if (parseFloat(onlr.value) < parseFloat(oslr.value)) {
						onlt.value = oslt.value;
						onlr.value = oslr.value;
					};
				} else {
					if (parseFloat(onlr.value) < parseFloat(oslr.value)) {
						oslt.value = onlt.value;
						oslr.value = onlr.value;
					};
				};
				break;
			case 3:
				// rope
				onlt.value = oslt.value;
				onlr.value = oslr.value;
				oelt.value = oslt.value;
				oelr.value = oslr.value;
				break;
			case 4:
				// pole
				onlt.value = oslt.value;
				onlr.value = oslr.value;
				oelt.value = 0.0;
				oelr.value = 0.0;
				break;
		};
		if (_setMode) {
			switch (mode) {
				case 0:
					// unviversal
					osct.disabled = false;
					osct.disabled = false;
					minSCValue = 0.0;
					maxSCValue = 30.0;
					osct.min = minSCValue;
					oscr.min = minSCValue;
					osct.max = maxSCValue;
					oscr.max = maxSCValue;
					oscu1.innerText = minSCValue.Format("floatfix2") + " N/m".HtmlEntities();
					oscu2.innerText = maxSCValue.Format("floatfix2") + " N/m".HtmlEntities();
					oslt.disabled = false;
					oslr.disabled = false;
					onlt.disabled = false;
					onlr.disabled = false;
					oelt.disabled = false;
					oelr.disabled = false;
					break;
				case 1:
					// rubber band
					osct.disabled = false;
					oscr.disabled = false;
					minSCValue = 0.0;
					maxSCValue = 10.0;
					osct.min = minSCValue;
					oscr.min = minSCValue;
					osct.max = maxSCValue;
					if (parseFloat(osct.value) > maxSCValue) osct.value = maxSCValue;
					oscr.max = maxSCValue;
					if (parseFloat(oscr.value) > maxSCValue) oscr.value = maxSCValue;
					oscu1.innerText = minSCValue.Format("floatfix2") + " N/m".HtmlEntities();
					oscu2.innerText = maxSCValue.Format("floatfix2") + " N/m".HtmlEntities();
					oslt.disabled = false;
					oslr.disabled = false;
					onlt.disabled = true;
					onlr.disabled = true;
					oelt.disabled = true;
					oelr.disabled = true;
					onlt.value = oslt.value;
					onlr.value = oslr.value;
					oelt.value = oelt.value;
					oelr.value = oslr.value;
					break;
				case 2:
					// spring
					osct.disabled = false;
					oscr.disabled = false;
					minSCValue = 0.0;
					maxSCValue = 10.0;
					osct.min = minSCValue;
					oscr.min = minSCValue;
					osct.max = maxSCValue;
					if (parseFloat(osct.value) > maxSCValue) osct.value = maxSCValue;
					oscr.max = maxSCValue;
					if (parseFloat(oscr.value) > maxSCValue) oscr.value = maxSCValue;
					oscu1.innerText = minSCValue.Format("floatfix2") + " N/m".HtmlEntities();
					oscu2.innerText = maxSCValue.Format("floatfix2") + " N/m".HtmlEntities();
					oslt.disabled = false;
					oslr.disabled = false;
					onlt.disabled = false;
					onlr.disabled = false;
					oelt.disabled = true;
					oelr.disabled = true;
					oelt.value = 0.0;
					oelr.value = 0.0;
					break;
				case 3:
					// rope
					minSCValue = 10.1;
					maxSCValue = 30.0;
					osct.min = minSCValue;
					oscr.min = minSCValue;
					osct.max = maxSCValue;
					if (parseFloat(osct.value) < minSCValue) osct.value = minSCValue;
					oscr.max = maxSCValue;
					if (parseFloat(oscr.value) < minSCValue) oscr.value = minSCValue;
					oscu1.innerText = minSCValue.Format("floatfix2") + " N/m".HtmlEntities();
					oscu2.innerText = maxSCValue.Format("floatfix2") + " N/m".HtmlEntities();
					osct.disabled = false;
					oscr.disabled = false;
					oslt.disabled = false;
					oslr.disabled = false;
					onlt.disabled = true;
					onlr.disabled = true;
					onlt.value = oslt.value;
					onlr.value = oslr.value;
					oelt.disabled = true;
					oelr.disabled = true;
					oelt.value = onlt.value;
					oelr.value = onlr.value;
					break;
				case 4:
					// pole
					minSCValue = 10.1;
					maxSCValue = 30.0;
					osct.min = minSCValue;
					oscr.min = minSCValue;
					osct.max = maxSCValue;
					if (parseFloat(osct.value) < minSCValue) osct.value = minSCValue;
					oscr.max = maxSCValue;
					if (parseFloat(oscr.value) < minSCValue) oscr.value = minSCValue;
					oscu1.innerText = minSCValue.Format("floatfix2") + " N/m".HtmlEntities();
					oscu2.innerText = maxSCValue.Format("floatfix2") + " N/m".HtmlEntities();
					osct.disabled = false;
					oscr.disabled = false;
					oslt.disabled = false;
					oslr.disabled = false;
					onlt.disabled = true;
					onlr.disabled = true;
					oelt.disabled = true;
					oelr.disabled = true;
					oslt.value = onlr.value;
					oslr.value = onlr.value;
					oelt.value = 0.0;
					oelr.value = 0.0;
					break;
			};
		};
		if (omode) if (omode.dataset.oninput != "" && _doEval) eval(omode.dataset.oninput);
	}

	/** Reads the joint editor values as a comma-separated joint definition string.
	 * @param {Panel} _panel Panel containing the editor.
	 * @param {string} _id Joint editor base id.
	 * @param {string} _defValue Default if the editor is missing.
	 * @returns {string} Joint definition string.
	 */
	static JointInputValue(_panel, _id, _defValue) {
		var oscr = _panel.contentDiv.GetElementById(_id + '_range_SpringConstant'),
			oslr = _panel.contentDiv.GetElementById(_id + '_range_ShrunkenLength'),
			onlr = _panel.contentDiv.GetElementById(_id + '_range_NeutralLength'),
			oelr = _panel.contentDiv.GetElementById(_id + '_range_EffectStartLength'),
			oblr = _panel.contentDiv.GetElementById(_id + '_range_BreakingLength');
		if (oscr) {
			return parseFloat(oscr.value).Frac(4) + "," + parseFloat(oslr.value).Frac(4) + "," + parseFloat(onlr.value).Frac(4) + "," + parseFloat(oelr.value).Frac(4) + "," + parseFloat(oblr.value).Frac(4);
		} else {
			return _defValue;
		};
	}

	/** Writes a joint definition string into all range/text inputs of the joint editor.
	 * @param {Panel} _panel Panel containing the editor.
	 * @param {string} _id Joint editor base id.
	 * @param {string} _value Joint definition string.
	 */
	static JointInputSetValue(_panel, _id, _value) {
		var i = GUI.JointInputInfo(_value),
			oscr = _panel.contentDiv.GetElementById(_id + '_range_SpringConstant'),
			oslr = _panel.contentDiv.GetElementById(_id + '_range_ShrunkenLength'),
			onlr = _panel.contentDiv.GetElementById(_id + '_range_NeutralLength'),
			oelr = _panel.contentDiv.GetElementById(_id + '_range_EffectStartLength'),
			oblr = _panel.contentDiv.GetElementById(_id + '_range_BreakingLength'),
			osct = _panel.contentDiv.GetElementById(_id + '_text_SpringConstant'),
			oslt = _panel.contentDiv.GetElementById(_id + '_text_ShrunkenLength'),
			onlt = _panel.contentDiv.GetElementById(_id + '_text_NeutralLength'),
			oelt = _panel.contentDiv.GetElementById(_id + '_text_EffectStartLength'),
			oblt = _panel.contentDiv.GetElementById(_id + '_text_BreakingLength');
		if (oscr) {
			oscr.value = i.springConstant;
			oslr.value = i.shrunkenLength;
			onlr.value = i.neutralLength;
			oelr.value = i.effectStartLength;
			oblr.value = i.breakingLength;
			osct.value = i.springConstant;
			oslt.value = i.shrunkenLength;
			onlt.value = i.neutralLength;
			oelt.value = i.effectStartLength;
			oblt.value = i.breakingLength;
		};
	}

	/** Draws the curve line and value points onto a curve editor canvas.
	 * @param {HTMLCanvasElement} _this Curve canvas (with curve state attached).
	 */
	static CurveInputDraw(_this) {
		var w = parseInt(_this.clientWidth, 10), h = parseInt(_this.clientHeight, 10), d, i, dl, ctx, x = 0, y = 0, xf, xo, yf, yo, dx, dy, dw, dh, dye;
		if (w == 0 || h == 0) {
			_this.curveArea = { dx: 0, dy: 0, dw: 0, dh: 0, xo: 0, yo: 0, xf: 0, yf: 0 };
			return;
		};
		ctx = _this.getContext("2d");
		_this.width = w;
		_this.height = h;
		dx = 8 + _this.maxYAxisTextWidth + 2 + 4;
		dw = w - dx - 8;
		dy = 8;
		dh = h - 24;
		dye = dy + dh;
		ctx.clearRect(0, 0, w, h);
		ctx.lineWidth = 1;
		d = _this.curCurve;
		dl = d.length;
		xo = _this.xMin;
		xf = (_this.xMax - _this.xMin);
		if (xf == 0) xf = 1;
		xf = dw / xf;
		yo = _this.yMin;
		yf = (_this.yMax - _this.yMin);
		if (yf == 0) yf = 1;
		yf = dh / yf;
		_this.curveArea = { dx: dx, dy: dy, dw: dw, dh: dh, xo: xo, yo: yo, xf: xf, yf: yf };
		// draw lines...
		ctx.strokeStyle = _this.styleLineColor;
		if (dl > 0) {
			ctx.moveTo((d[0][1] - xo) * xf + dx, dye - (d[0][0] - yo) * yf);
			for (i = 1; i < dl; i++)ctx.lineTo((d[i][1] - xo) * xf + dx, dye - (d[i][0] - yo) * yf);
			ctx.stroke();
		};
		// draw unselected value points...
		ctx.fillStyle = _this.stylePointColor;
		for (i = 0; i < dl; i++) {
			x = (d[i][1] - xo) * xf + dx;
			y = dye - (d[i][0] - yo) * yf;
			ctx.fillRect(x - 2, y - 2, 5, 5);
		};
		// draw selected value points...
		if (_this.selectedPointNo >= 0) {
			ctx.fillStyle = _this.stylePointSelectColor;
			x = (d[_this.selectedPointNo][1] - xo) * xf + dx;
			y = dye - (d[_this.selectedPointNo][0] - yo) * yf;
			ctx.fillRect(x - 2, y - 2, 5, 5);
		};
	}

	/** Draws the background grid and axis labels of a curve editor canvas.
	 * @param {HTMLCanvasElement} _this Background canvas (with cnv reference to the curve canvas).
	 */
	static CurveInputBgrdDraw(_this) {
		var w = parseInt(_this.clientWidth, 10), h = parseInt(_this.clientHeight, 10), d, i, dl, ctx, x = 0, y = 0, xf, xo, yf, yo, dx, dy, dw, dh, dye, cnv;
		var ytxts = [], maxYW = 0;
		if (w == 0 || h == 0) return;
		ctx = _this.getContext("2d");
		cnv = _this.cnv;
		_this.width = w;
		_this.height = h;

		dx = 8 + cnv.maxYAxisTextWidth + 2 + 4;
		dw = w - dx - 8;
		dy = 8;
		dh = h - 24;

		dye = dy + dh;
		ctx.fillStyle = cnv.styleBgrdColor;
		ctx.fillRect(0, 0, w, h);
		xo = cnv.xMin;
		xf = (cnv.xMax - cnv.xMin);
		if (xf == 0) xf = 1;
		xf = dw / xf;
		yo = cnv.yMin;
		yf = (cnv.yMax - cnv.yMin);
		if (yf == 0) yf = 1;
		yf = dh / yf;
		// draw grid lines...
		ctx.lineWidth = 1;
		ctx.strokeStyle = cnv.styleGridBgrdColor;
		ctx.rect(0, 0, w, w);
		for (x = 0; x <= 4; x++) {
			ctx.moveTo((dw) / 4 * x + dx, dy);
			ctx.lineTo((dw) / 4 * x + dx, dh - 1 + dy + ((x % 1 == 1) ? 0 : cnv.scaleMarkerSizeX));
		};
		for (y = 0; y <= 4; y++) {
			ctx.moveTo(dx - ((y % 1 == 1) ? 0 : cnv.scaleMarkerSizeY), (dh - 1) / 4 * y + dy);
			ctx.lineTo(dw + dx, (dh - 1) / 4 * y + dy);
		};
		ctx.stroke();

		ctx.imageSmoothingEnabled = true;
		ctx.font = cnv.styleTextBgrdFont;
		ctx.fillStyle = cnv.styleTextBgrdColor;

		function _xTxt(_x, _y, _minX, _maxX, _no) {
			var tw = cnv.xAxisTextWidths[_no];
			if (tw > 0) {
				_x = _x - tw / 2;
				if (_x + tw > _maxX) _x = _maxX - tw;
				if (_x < _minX) _x = _minX;
				ctx.fillText(cnv.xAxisTexts[_no], _x, _y + 8);
			};
		};
		if (cnv.scaleMarkerSizeX > 0) {
			y = dh + dy + cnv.scaleMarkerSizeX + 1;
			x = dx; _xTxt(x, y, 2, w - 4, 0);
			x = dw / 2 + dx; _xTxt(x, y, 2, w - 4, 1);
			x = dw - 1 + dx; _xTxt(x, y, 2, w - 4, 2);
		};

		function _yTxt(_x, _y, _no) {
			ctx.fillText(cnv.yAxisTexts[_no], _x, _y + 4);
		};
		if (cnv.scaleMarkerSizeY > 0) {
			ctx.textAlign = "right";
			x = dx - cnv.scaleMarkerSizeY - 0;
			y = dy; _yTxt(x, y, 0);
			y = dh / 2 + dy; _yTxt(x, y, 1);
			y = dh - 1 + dy; _yTxt(x, y, 2);
		};
	}

	/** Placeholder called when a curve point drag ends; currently a no-op.
	 * @param {HTMLCanvasElement} _cnv Curve canvas.
	 */
	static CurveInputEndPointMove(_cnv) {
	}

	/** Finds the curve point under the given page coordinates.
	 * @param {HTMLCanvasElement} _cnv Curve canvas.
	 * @param {number} _x Page x coordinate.
	 * @param {number} _y Page y coordinate.
	 * @returns {number} Point index or -1 if none hit.
	 */
	static CurveInputGetPointNo(_cnv, _x, _y) {
		var ret = -1, b = _cnv.getBoundingClientRect(), i, d, dl, x, y, xf, xo, yf, yo, h, dx, dy, dw, dh, dye;
		if (_cnv.curveArea.dw == 0 || _cnv.curveArea.dh == 0) return ret;
		_x -= b.x;
		_y -= b.y;
		d = _cnv.curCurve;
		dl = d.length;
		if (dl > 0) {
			xf = _cnv.curveArea.xf;
			xo = _cnv.curveArea.xo;
			yf = _cnv.curveArea.yf;
			yo = _cnv.curveArea.yo;;
			dx = _cnv.curveArea.dx;
			dy = _cnv.curveArea.dy;;
			dye = _cnv.curveArea.dy + _cnv.curveArea.dh;
			for (i = 0; i < dl; i++) {
				x = (d[i][1] - xo) * xf + dx;
				//log(x,_x,y,_y);
				if (_x >= (x - 2) && _x <= (x + 2)) {
					y = dye - (d[i][0] - yo) * yf;
					if (_y >= (y - 2) && _y <= (y + 2)) return i;
				};
			};
		};
		return ret;
	}

	/** Converts page coordinates into curve value coordinates (clamped to the axis ranges).
	 * @param {HTMLCanvasElement} _cnv Curve canvas.
	 * @param {number} _x Page x coordinate.
	 * @param {number} _y Page y coordinate.
	 * @returns {?number[]} [y, x] value pair or null if the curve area is empty.
	 */
	static CurveInputGetXY(_cnv, _x, _y) {
		var b = _cnv.getBoundingClientRect(), ret = null, x, y;
		if (_cnv.curveArea.dw == 0 || _cnv.curveArea.dh == 0) return ret;
		_x -= b.x;
		_y -= b.y;
		if (_x < _cnv.curveArea.dx) {
			x = _cnv.xMin;
		} else if (_x > _cnv.curveArea.dx + _cnv.curveArea.dw) {
			x = _cnv.xMax;
		} else {
			x = (_cnv.xMax - _cnv.xMin) * ((_x - _cnv.curveArea.dx) / _cnv.curveArea.dw);
		};
		if (_y < _cnv.curveArea.dy) {
			y = _cnv.yMax;
		} else if (_y > _cnv.curveArea.dy + _cnv.curveArea.dh) {
			y = _cnv.yMin;
		} else {
			y = (_cnv.yMax - _cnv.yMin) * (((_cnv.curveArea.dy + _cnv.curveArea.dh) - _y) / _cnv.curveArea.dh);
		};
		//log(x,y);
		return [y, x];
	}

	/** Checks whether the given page coordinates hit a curve segment and returns the insert position for a new point.
	 * @param {HTMLCanvasElement} _cnv Curve canvas.
	 * @param {number} _x Page x coordinate.
	 * @param {number} _y Page y coordinate.
	 * @returns {?Array} [precedingPointIndex, [y, x]] or null if no segment was hit.
	 */
	static CurveInputGetNewPointNo(_cnv, _x, _y) {
		var b = _cnv.getBoundingClientRect(), i, d, dl, xs, ys, xe, ye, xf, xo, yf, yo, dye, dx, dy, x, y;
		if (_cnv.curveArea.dw == 0 || _cnv.curveArea.dh == 0) return null;
		_x -= b.x;
		_y -= b.y;
		d = _cnv.curCurve;
		dl = d.length;
		if (dl > 0) {
			xf = _cnv.curveArea.xf;
			xo = _cnv.curveArea.xo;
			yf = _cnv.curveArea.yf;
			yo = _cnv.curveArea.yo;
			dx = _cnv.curveArea.dx;
			dy = _cnv.curveArea.dy;;
			dye = _cnv.curveArea.dy + _cnv.curveArea.dh;
			xs = (d[0][1] - xo) * xf + dx;
			for (i = 1; i < dl; i++) {
				xe = (d[i][1] - xo) * xf + dx;
				if (_x > xs && _x < xe) {
					ys = dye - (d[i - 1][0] - yo) * yf;
					ye = dye - (d[i][0] - yo) * yf;
					y = (ye - ys) * (_x - xs) / (xe - xs) + ys;
					//log(_y,y);
					if (_y > (y - 2) && _y < (y + 2)) {
						x = (d[i][1] - d[i - 1][1]);
						y = (d[i][0] - d[i - 1][0]);
						return [i - 1, GUI.CurveInputGetXY(_cnv, x + b.x, _y + b.y)];
					};
				};
				xs = xe;
			};
		};
		return null;
	}

	/** Writes a curve point's values into the x/y number inputs (applying return expressions if defined).
	 * @param {HTMLCanvasElement} _cnv Curve canvas.
	 * @param {number[]} _vp Value pair [y, x].
	 */
	static CurveInputSetToInputs(_cnv, _vp) {
		if (_cnv.returnYExpression != null) {
			_cnv.yInput.value = _cnv.returnYExpression.Exec(_vp[0]);
		} else {
			_cnv.yInput.value = _vp[0];
		};
		if (_cnv.returnXExpression != null) {
			_cnv.xInput.value = _cnv.returnXExpression.Exec(_vp[1]);
		} else {
			_cnv.xInput.value = _vp[1];
		};
	}

	/** Updates the selected curve point from the x/y number inputs (applying edit expressions and clamping) and redraws.
	 * @param {string} _id Curve canvas element id.
	 */
	static CurveInputSetFromInputs(_id) {
		var cnv = document.getElementById(_id), x, y, sp;
		if (cnv) if (cnv.selectedPointNo >= 0) {
			sp = cnv.selectedPointNo;
			y = parseFloat(cnv.yInput.value);
			x = parseFloat(cnv.xInput.value);
			if (cnv.editYExpression != null) y = cnv.editYExpression.Exec(y);
			if (cnv.editXExpression != null) x = cnv.editXExpression.Exec(x);
			if (y < cnv.yMin) y = cnv.yMin;
			if (y > cnv.yMax) y = cnv.yMax;
			if (x < cnv.xMin) x = cnv.xMin;
			if (x > cnv.xMax) x = cnv.xMax;
			if (sp == 0) {
				x = cnv.xMin;
			} else if (sp == cnv.curCurve.length - 1) {
				x = cnv.xMax;
			} else {
				if (x < cnv.curCurve[sp - 1][1]) x = cnv.curCurve[sp - 1][1];
				if (x > cnv.curCurve[sp + 1][1]) x = cnv.curCurve[sp + 1][1];
			};
			cnv.curCurve[sp][0] = y;
			cnv.curCurve[sp][1] = x;
			GUI.CurveInputDraw(cnv);
		};
	}

	/** Initializes a curve editor canvas: styles, axis labels, expressions, resize observers, and mouse interaction for point editing.
	 * @param {string} _id Curve canvas element id.
	 */
	static CurveInputInit(_id) {
		var cnv = document.getElementById(_id), cvsbgrd = document.getElementById(_id + "_bgrd"), d, i, k, ctx;
		if (cnv) {
			if (cnv.hasOwnProperty("isInit")) return;
			cnv.isInit = true;
			cnv.yInput = document.getElementById(_id + "_yinput");
			cnv.xInput = document.getElementById(_id + "_xinput");
			d = JSON.parse(cnv.dataset.opts);
			cnv.styleLineColor = GetCSSPropertyOfClass("canvas.curvelinecolor", "color");
			cnv.stylePointColor = GetCSSPropertyOfClass("canvas.curvepointcolor", "color");
			cnv.stylePointSelectColor = GetCSSPropertyOfClass("canvas.curvepointselectcolor", "color");
			cnv.styleBgrdColor = GetCSSPropertyOfClass("canvas.curvebgrd", "color");
			cnv.styleGridBgrdColor = GetCSSPropertyOfClass("canvas.curvebgrdgrid", "color");
			cnv.styleTextBgrdColor = GetCSSPropertyOfClass("canvas.curvebgrdtext", "color");
			cnv.styleTextBgrdFont = GetCSSPropertyOfClass("canvas.curvebgrdtext", "font");

			cnv.value = d.value;
			cnv.myHeight = d.height;
			cnv.curveArea = [0, 0, 0, 0];
			cvsbgrd.cnv = cnv;
			cnv.xMin = d.xMin;
			cnv.xMax = d.xMax;
			cnv.yMin = d.yMin;
			cnv.yMax = d.yMax;

			cnv.scaleMarkerSizeX = 0;
			cnv.scaleMarkerSizeY = 0;
			cnv.maxXAxisTextWidth = 0;
			cnv.maxYAxisTextWidth = 0;
			ctx = cnv.getContext("2d");
			ctx.font = "8px Open Sans";

			if (d.hasOwnProperty("xAxisScaleTextTemplate")) {
				cnv.xAxisTexts = [d.xAxisScaleTextTemplate.I18xTrans({ x: cnv.xMin }), d.xAxisScaleTextTemplate.I18xTrans({ x: (cnv.xMax + cnv.xMin) / 2 }), d.xAxisScaleTextTemplate.I18xTrans({ x: cnv.xMax })];
				cnv.xAxisTextWidths = [];
				for (i = 0; i < 3; i++) {
					k = ctx.measureText(cnv.xAxisTexts[i]).width;
					cnv.xAxisTextWidths.push(k);
					if (k > cnv.maxXAxisTextWidth) cnv.maxXAxisTextWidth = k;
				};
				cnv.scaleMarkerSizeX = 4;
			};
			if (d.hasOwnProperty("yAxisScaleTextTemplate")) {
				cnv.yAxisTexts = [d.yAxisScaleTextTemplate.I18xTrans({ y: cnv.yMax }), d.yAxisScaleTextTemplate.I18xTrans({ y: (cnv.yMax + cnv.yMin) / 2 }), d.yAxisScaleTextTemplate.I18xTrans({ y: cnv.yMin })];
				cnv.yAxisTextWidths = [];
				for (i = 0; i < 3; i++) {
					k = ctx.measureText(cnv.yAxisTexts[i]).width;
					cnv.yAxisTextWidths.push(k);
					if (k > cnv.maxYAxisTextWidth) cnv.maxYAxisTextWidth = k;
				};
				cnv.scaleMarkerSizeY = 4;
			};

			cnv.curveType = "linear";
			cnv.selectedPointNo = -1;
			cnv.isInPointMove = false;
			cnv.isMultiCurve = !Array.isArray(cnv.value);
			cnv.onchangeEval = null;
			cnv.oninputEval = null;
			if (d.hasOwnProperty("onchange")) cnv.onchangeEval = d.onchange;
			if (d.hasOwnProperty("oninput")) cnv.oninputEval = d.oninput;
			if (d.hasOwnProperty("editYExpression")) {
				cnv.editYExpression = new i18xExpression(d.editYExpression);
				if (cnv.isMultiCurve) {
					var k;
					for (k in cnv.value) for (i = 0; i < cnv.value[k].length; i++)cnv.value[k][i][0] = cnv.editYExpression.Exec(cnv.value[k][i][0]);
				} else {
					for (i = 0; i < cnv.value.length; i++)cnv.value[i][0] = cnv.editYExpression.Exec(cnv.value[i][0]);
				};
			};
			if (d.hasOwnProperty("returnYExpression")) {
				cnv.returnYExpression = new i18xExpression(d.returnYExpression);
			};
			if (d.hasOwnProperty("editXExpression")) {
				cnv.editXExpression = new i18xExpression(d.editXExpression);
			};
			if (d.hasOwnProperty("returnXExpression")) {
				cnv.returnXExpression = new i18xExpression(d.returnXExpression);
			};
			if (cnv.isMultiCurve) {
				cnv.curMultiCurveKey = ObjectUtils.firstKey(cnv.value);
				cnv.curCurve = cnv.value[cnv.curMultiCurveKey];
			} else {
				cnv.curCurve = cnv.value;
			};
			if (d.hasOwnProperty("returnExpression")) cnv.returnExpression = new i18xExpression(d.returnExpression);
			cvsbgrd.resizeObserver = new ResizeObserver(entries => { for (let entry of entries) { GUI.CurveInputBgrdDraw(entry.target); } });
			cvsbgrd.resizeObserver.observe(cvsbgrd);
			cnv.resizeObserver = new ResizeObserver(entries => { for (let entry of entries) { GUI.CurveInputDraw(entry.target); } });
			cnv.resizeObserver.observe(cnv);
			cnv.onmousedown = function (_ev) {
				var sp, np, vp;
				if (this.isInPointMove) GUI.CurveInputEndPointMove(this);
				sp = GUI.CurveInputGetPointNo(this, _ev.clientX, _ev.clientY);
				if (sp >= 0) {
					this.selectedPointNo = sp;
					this.isInPointMove = true;
					GUI.CurveInputSetToInputs(this, this.curCurve[sp]);
					GUI.CurveInputDraw(this);
					cnv.className = cnv.className.exchangeCursorClass("pointermove");
				} else {
					np = GUI.CurveInputGetNewPointNo(this, _ev.clientX, _ev.clientY);
					if (np != null) {
						vp = GUI.CurveInputGetXY(this, _ev.clientX, _ev.clientY);
						this.selectedPointNo = np[0] + 1;
						this.isInPointMove = true;
						this.curCurve.splice(np[0] + 1, 0, vp);
						GUI.CurveInputSetToInputs(this, vp);
						GUI.CurveInputDraw(this);
						cnv.className = cnv.className.exchangeCursorClass("pointermove");
					} else {
						cnv.className = cnv.className.exchangeCursorClass("pointer");
					};
				};
			};
			cnv.onmouseup = function (_ev) {
				var sp, vp;
				if (this.isInPointMove) {
					this.isInPointMove = false;
					vp = GUI.CurveInputGetXY(this, _ev.clientX, _ev.clientY);
					if (vp != null) {
						sp = this.selectedPointNo;
						if (sp != 0 && sp != this.curCurve.length - 1) {
							if ((vp[1] < this.curCurve[sp - 1][1]) || (vp[1] > this.curCurve[sp + 1][1])) {
								this.curCurve.splice(sp, 1);
							};
						};
					};
					if (this.onchangeEval != null) eval(this.onchangeEval);
				};
				GUI.CurveInputDraw(this);
				cnv.className = cnv.className.exchangeCursorClass("pointer");
			};
			cnv.onmousemove = function (_ev) {
				var sp, np, vp, canMove = false, delAtMouseUp = false;
				if (this.isInPointMove) {
					vp = GUI.CurveInputGetXY(this, _ev.clientX, _ev.clientY);
					if (vp != null) {
						sp = this.selectedPointNo;
						if (sp == 0) {
							vp[1] = this.xMin;
							canMove = true;
						} else if (sp == (this.curCurve.length - 1)) {
							vp[1] = this.xMax;
							canMove = true;
						} else {
							canMove = true;
							if (vp[1] < this.curCurve[sp - 1][1]) {
								delAtMouseUp = true;
								vp[1] = this.curCurve[sp - 1][1];
							} else if (vp[1] > this.curCurve[sp + 1][1]) {
								delAtMouseUp = true;
								vp[1] = this.curCurve[sp + 1][1];
							};
						};
						if (canMove) {
							GUI.CurveInputSetToInputs(this, vp);
							this.curCurve[sp] = vp;
							GUI.CurveInputDraw(this);
						};
						this.className = this.className.exchangeCursorClass(delAtMouseUp ? "pointerminus" : "pointermove");
					};
				} else {
					sp = GUI.CurveInputGetPointNo(this, _ev.clientX, _ev.clientY);
					//log(sp);
					if (sp < 0) {
						np = GUI.CurveInputGetNewPointNo(this, _ev.clientX, _ev.clientY);
						if (np != null) {
							this.className = cnv.className.exchangeCursorClass("pointerplus");
						} else {
							this
							this.className = this.className.exchangeCursorClass("pointer");
						};
					} else {
						this.className = this.className.exchangeCursorClass("handpointer");
					};
				};
			};
			cnv.onmousewheel = function (_ev) {
				cnv.myHeight += (_ev.deltaY / (3 * System.WHEELYSTEPSIZE));
				if (cnv.myHeight < 0) cnv.myHeight = 60;
				cnv.height = cnv.myHeight;
				cnv.style.height = cnv.myHeight + "px";
				cvsbgrd.height = cnv.myHeight;
				cvsbgrd.style.height = cnv.myHeight + "px";
				GUI.CurveInputDraw(this);
				GUI.CurveInputBgrdDraw(cvsbgrd);
				_ev.preventDefault();
			};
		};
	}

	/** Change handler for the multi-curve selector: switches the displayed curve.
	 * @param {HTMLSelectElement} _this Curve key select element.
	 * @param {string} _id Curve canvas element id.
	 */
	static CurveInputMultiCurveChange(_this, _id) {
		var cnv = document.getElementById(_id), key = document.getElementById(_id + "_curvekey");
		if (cnv) {
			if (cnv.value.hasOwnProperty(_this.value)) {
				cnv.curMultiCurveKey = _this.value;
				cnv.curCurve = cnv.value[_this.value];
				key.value = _this.value;
				GUI.CurveInputDraw(cnv);
				if (cnv.onchangeEval != null) eval(cnv.onchangeEval);
			};
		};
	}

	/** Removes the currently selected curve from a multi-curve editor (keeps at least one curve).
	 * @param {string} _id Curve canvas element id.
	 */
	static CurveInputMultiCurveRemove(_id) {
		var cnv = document.getElementById(_id), sel = document.getElementById(_id + "_select"), key = document.getElementById(_id + "_curvekey");
		if (cnv) if (sel) if (key) {
			if (ObjectUtils.countKeys(cnv.value) > 1) {
				delete cnv.value[sel.value];
				sel.Remove(sel.selectedIndex);
				key.value = sel.value;
				GUI.CurveInputMultiCurveChange(sel, _id);
				if (cnv.onchangeEval != null) eval(cnv.onchangeEval);
			};
		};
	}

	/** Adds a new curve (flat line) under the numeric key typed into the key input of a multi-curve editor.
	 * @param {string} _id Curve canvas element id.
	 */
	static CurveInputMultiCurveNew(_id) {
		var cnv = document.getElementById(_id), sel = document.getElementById(_id + "_select"), key = document.getElementById(_id + "_curvekey");
		var v, opt = document.createElement("option");
		if (cnv) if (sel) if (key) {
			v = parseInt(key.value, 10);
			if (!isNaN(v)) {
				if (cnv) {
					if (!cnv.value.hasOwnProperty(v)) {
						opt.value = v;
						opt.text = v;
						sel.add(opt);
						cnv.value[v] = [[(cnv.yMax + cnv.yMin) / 2, cnv.xMin], [(cnv.yMax + cnv.yMin) / 2, cnv.xMax]];
						sel.selectedIndex = sel.options.length - 1;
						GUI.CurveInputMultiCurveChange(sel, _id);
						if (cnv.onchangeEval != null) eval(cnv.onchangeEval);
					};
				};
			};
		};
	}

	/** Builds an interactive curve editor (canvas pair, x/y inputs, optional multi-curve selector).
	 * @param {string} _id Curve canvas element id.
	 * @param {string|boolean} _title Field label; false for no label.
	 * @param {Object} _opts Options: value (point array or keyed curves), xMin/xMax/yMin/yMax, height, yUnit, xUnit, axis text templates, expressions, onchange, oninput, inline, full, curveSelectText, trclass, context.
	 * @returns {string} Curve editor HTML.
	 */
	static CurveInputHTML(_id, _title, _opts) {
		var t = "", h = "", ch = "50px", trclass = "", isMultiCurve = false, s;
		if (!_opts.hasOwnProperty("value")) _opts.value = [[0, 0], [0, 100]];
		isMultiCurve = !Array.isArray(_opts.value);
		h += '<div class="inputField' + ((_opts.hasOwnProperty("inline") && _opts.inline) ? ' inline' : '') + ((_opts.hasOwnProperty("full") && _opts.full) ? ' full' : '') + '">';
		if (_title !== false) {
			if (_opts.context == "paneltable") _title = _title.wordWrap();
			t += '<div id="' + _id + '_title" class="title' + ((_opts.hasOwnProperty("inline") && _opts.inline) ? ' inline' : '') + '">' + _title.HtmlEntities() + '</div>';
		};
		if (isMultiCurve) {
			h += '<div class="inputline">';
			h += '<select id="' + _id + '_select" onchange="GUI.CurveInputMultiCurveChange(this,\'' + _id + '\');">';
			var s;
			for (s in _opts.value) h += '<option value="' + s.HtmlEntities() + '"/>' + s.HtmlEntities() + '</option>';
			h += '</select>';
			if (_opts.hasOwnProperty("curveSelectText")) h += '&nbsp' + _opts.curveSelectText.HtmlEntities();
			h += '<span title="' + '...delete curve key...<info context="i18n button tooltip"/>'.I18xTrans().HtmlEntities() + '" onclick="GUI.CurveInputMultiCurveRemove(\'' + _id + '\');" class="icon-bin minibutton button cursor_handpointer"></span>';
			h += '</div>';
			h += '<div class="inputline">';
			h += '<input id="' + _id + '_curvekey" type="number" value="' + ObjectUtils.firstKey(_opts.value) + '">';
			h += '<span title="' + '...create new curve key...<info context="i18n button tooltip"/>'.I18xTrans().HtmlEntities() + '" onclick="GUI.CurveInputMultiCurveNew(\'' + _id + '\');" class="icon-new minibutton button cursor_handpointer"></span>';
			h += '</div>';
		};
		if (_opts.hasOwnProperty("height")) ch = _opts.height + "px";
		h += '<div style="position:relative;width:100%;">';
		h += '<canvas id="' + _id + '_bgrd" class="curveeditbgrd" style="position:relative;top:0px;left:0px;width:100%;height:' + ch + '"></canvas>';
		h += '<canvas id="' + _id + '" class="curveedit cursor_pointer" style="position:absolute;position:absolute;top:0px;left:0px;width:100%;height:' + ch + '" data-opts="' + JSON.stringify(_opts).HtmlEntities() + '"></canvas>';
		h += '</div>';
		h += '<div class="inputline">';
		h += '<input id="' + _id + '_yinput" type="number" oninput="GUI.CurveInputSetFromInputs(\'' + _id + '\');">';
		h += (_opts.hasOwnProperty("yUnit") ? '<div class="inputunit">' + _opts.yUnit.HtmlEntities() + '</div>' : '') + "&nbsp;";
		h += '<input id="' + _id + '_xinput" type="number" oninput="GUI.CurveInputSetFromInputs(\'' + _id + '\');">';
		h += (_opts.hasOwnProperty("xUnit") ? '<div class="inputunit">' + _opts.xUnit.HtmlEntities() + '</div>' : '');
		h += '</div>';
		h += '<img src="./skins/' + SKIN + '/imgs/empty.png" class="empty" onload="GUI.CurveInputInit(\'' + _id + '\');">';
		h += '</div>';
		switch (_opts.context) {
			case "panel":
			case "modal":
				return t + h;
			case "paneltable":
				if (_opts.hasOwnProperty("trclass")) if (_opts.trclass != "") trclass = ' class="' + _opts.trclass + '"';
				return '<tr' + trclass + '><td class="formtitle">' + t + '</td><td class="forminput">' + h + '</td>';
			default:
				return "";
		};
	}

	/** Reads the current curve data of a curve editor.
	 * @param {Panel} _panel Panel containing the editor (unused; global lookup).
	 * @param {string} _id Curve canvas element id.
	 * @param {Object} [_defValue={}] Default if the editor is missing.
	 * @returns {Object|Array} Curve data (point array or keyed curves).
	 */
	static CurveInputValue(_panel, _id, _defValue = {}) {
		var cnv = document.getElementById(_id), x, y, sp;
		if (cnv) {
			return cnv.value;
		} else {
			return _defValue;
		};
	}

	/** Replaces the curve data of a curve editor and reinitializes it.
	 * @param {Panel} _panel Panel containing the editor (unused; global lookup).
	 * @param {string} _id Curve canvas element id.
	 * @param {Object|Array} _value New curve data.
	 */
	static CurveInputSetValue(_panel, _id, _value) {
		var cnv = document.getElementById(_id), d;
		if (cnv) {
			d = JSON.parse(cnv.dataset.opts);
			d.value = _value;
			cnv.dataset.opts = JSON.stringify(d);
			delete cnv.isInit;
			GUI.CurveInputInit(_id);
		};
	}

	/** Language selector change handler for i18n text areas: stores the current value and shows the value for the newly selected language.
	 * @param {string} _id Text area element id.
	 */
	static TextAreaHTMLI18xChange(_id) {
		var osel = document.getElementById(_id + "_sel"), oin = document.getElementById(_id), jerr;
		//log("oin.dataset.input",oin.dataset.inputs);
		var oldlid = oin.dataset.lid, newlid = osel.value, value, newvalue = {};
		try {
			value = JSON.parse(oin.dataset.inputs);
		} catch (jerr) {
			value = { "en-US": oin.dataset.inputs };
		};
		value[oldlid] = oin.value;
		var lid;
		for (lid in value) if (value[lid].trim() != "") newvalue[lid] = value[lid].trim();
		oin.dataset.inputs = JSON.stringify(value);
		oin.dataset.lid = newlid;
		oin.dir = i18x.LIDS_RTL.indexOf(newlid) >= 0 ? "rtl" : "ltr";
		if (value.hasOwnProperty(newlid)) {
			oin.value = value[newlid];
		} else {
			oin.value = "";
		};
	}

	/** Switches an i18n text area to a specific language.
	 * @param {string} _id Text area element id.
	 * @param {string} _lid Language id (e.g. "en-US").
	 */
	static TextAreaHTMLI18xSet(_id, _lid) {
		var osel = document.getElementById(_id + "_sel");
		if (osel) osel.value = _lid;
		GUI.TextAreaHTMLI18xChange(_id);
	}

	/** Switches an i18n text area to the next available language variant (wraps to "en-US").
	 * @param {string} _id Text area element id.
	 */
	static TextAreaHTMLI18xNext(_id) {
		var osel = document.getElementById(_id + "_sel"), oin = document.getElementById(_id), value, key, nowkey, newkey = "", preWasNowKey = false;
		GUI.TextInputHTMLI18xChange(_id);
		try {
			value = JSON.parse(oin.dataset.inputs);
			nowkey = osel.value;
			var key;
			for (key in value) {
				if (preWasNowKey) newkey = key;
				if (key == nowkey) preWasNowKey = true;
			};
			if (newkey == "") newkey = "en-US";
			osel.value = newkey;
			GUI.TextAreaHTMLI18xChange(_id);
		} catch (jerr) {
		};
	}

	/** Builds a labeled text area, optionally with i18n language selector and note text.
	 * @param {string} _id Text area element id.
	 * @param {string|boolean} _title Field label; false for no label.
	 * @param {Object} _opts Options: value, i18n, defLid, defEditLid, lidOpts, cols, rows, maxlen, spellcheck, note, disabled, onchange, oninput, context, ...
	 * @returns {string} Text area HTML.
	 */
	static TextAreaHTML(_id, _title, _opts) {
		var t = "", h = "", extraAttrs = ' data-i18n="false"', jerr, i18txts, value = "", valueLid = "en-US", lidOpts = i18x.LIDS_CULTURES, defLid = i18x.curLid, defEditLid = null;
		// defLid = i18x.isAutoLid ? i18x.i18nBestLid : i18x.i18nLid
		if (!_opts.hasOwnProperty("context")) _opts.context = "panel";
		if (_opts.hasOwnProperty("defLid")) defLid = _opts.defLid;
		if (_opts.hasOwnProperty("defEditLid")) defEditLid = _opts.defEditLid;
		if (_opts.hasOwnProperty("lidOpts")) lidOpts = _opts.lidOpts;
		h += '<div class="inputField">';
		if (_title !== false) {
			if (_opts.context == "paneltable") _title = _title.wordWrap();
			t += '<div class="title" id="' + _id + '_title" class="inputField">' + _title.HtmlEntities() + '</div>';
		};
		if (_opts.hasOwnProperty("i18n")) {
			if (_opts.hasOwnProperty("value")) {
				try {
					extraAttrs = ' data-inputs="' + _opts.value.HtmlEntities() + '"';
					i18txts = JSON.parse(_opts.value);
					var l;
					for (l in i18txts) if (!lidOpts.hasOwnProperty(l)) if (i18x.LIDS_CULTURES.hasOwnProperty(l)) lidOpts[l] = i18x.LIDS_CULTURES[l];
					if (i18txts.hasOwnProperty(defLid)) {
						value = i18txts[defLid];
						valueLid = defLid;
						if (value == "") {
							if (i18txts.hasOwnProperty("en-US")) {
								if (i18txts["en-US"] != "") {
									valueLid = "en-US";
									value = i18txts["en-US"];
								};
							};
						};
					} else {
						if (i18txts.hasOwnProperty("en-US")) {
							value = i18txts["en-US"];
							valueLid = "en-US";
						};
					};
					extraAttrs += ' data-i18n="true"';
				} catch (jerr) {
					if (defEditLid != null) {
						value = _opts.value;
						valueLid = defEditLid;
					} else {
						value = _opts.value;
						valueLid = "en-US";
					};
					extraAttrs = ' data-i18n="true" data-inputs="' + _opts.value.HtmlEntities() + '"';
				};
			} else {
				valueLid = "en-US";
				extraAttrs += ' data-i18n="true" data-inputs=""';
			};
			extraAttrs += ' data-lid="' + valueLid + '"';
			t += '<select id="' + _id + '_sel" class="i18n" oninput="GUI.TextAreaHTMLI18xChange(\'' + _id + '\');"/>';
			for (var lid in lidOpts) {
				t += '<option ' + ((valueLid == lid) ? "selected " : "") + 'value="' + lid + '">' + lidOpts[lid].HtmlEntities() + '</option>';
			};
			t += '</select>';
			t += '<span title="' + '...select international language variation...<info context="i18n button tooltip"/>'.I18xTrans().HtmlEntities() + '" onclick="GUI.TextAreaHTMLI18xSet(\'' + _id + '\',\'en-US\');" class="icon-earth minibutton button cursor_handpointer"></span>';
			t += '<span title="' + '...select best local language variation...<info context="i18n button tooltip"/>'.I18xTrans().HtmlEntities() + '"onclick="GUI.TextAreaHTMLI18xSet(\'' + _id + '\',\'' + i18x.i18nBestLid + '\');" class="icon-home3 minibutton button cursor_handpointer"></span>';
			t += '<span title="' + '...select next available language variation...<info context="i18n button tooltip"/>'.I18xTrans().HtmlEntities() + '"onclick="GUI.TextAreaHTMLI18xNext(\'' + _id + '\');" class="icon-forward3 minibutton button cursor_handpointer"></span>';
		} else {
			value = _opts.value;
		};
		if (_opts.hasOwnProperty("oninput")) extraAttrs += ' oninput="' + _opts.oninput + '"';
		if (_opts.hasOwnProperty("onchange")) extraAttrs += ' onchange="' + _opts.onchange + '"';
		if (_opts.hasOwnProperty("extraHTML")) h += _opts.extraHTML;
		h += '<textarea dir="' + (i18x.LIDS_RTL.indexOf(valueLid) >= 0 ? "rtl" : "ltr") + '" class="textarea"' + (_opts.hasOwnProperty("spellcheck") ? ' spellcheck="true"' : ' spellcheck=false') + (_opts.hasOwnProperty("cols") ? ' cols="' + _opts.cols + '"' : '') + (_opts.hasOwnProperty("rows") ? ' rows="' + _opts.rows + '"' : '') + ' id="' + _id + '"' + (_opts.hasOwnProperty("tooltip") ? ' title="' + _opts.tooltip.tHtmlEntities() + '"' : '') + extraAttrs + '>' + (_opts.hasOwnProperty("value") ? '' + value.HtmlEntities() : '') + '</textarea>';
		if (_opts.hasOwnProperty("note")) if (_opts.note != "") h += '<div class="note">*' + _opts.note.I18xTrans().HtmlEntities() + '</div>';
		h += '</div>';
		switch (_opts.context) {
			case "panel":
			case "modal":
				return t + h;
			case "paneltable":
				return '<tr id="' + _id + '_inputField"><td class="formtitle">' + t + '</td><td class="forminput">' + h + '</td>';
			default:
				return "";
		};
	}

	/** Reads the value of a text area; for i18n areas returns a JSON string of all non-empty language variants (or a plain string if only "en-US").
	 * @param {Panel} _panel Panel containing the text area.
	 * @param {string} _id Text area element id.
	 * @param {string} [_defValue=""] Default if the text area is missing.
	 * @returns {string} Text area value.
	 */
	static TextAreaValue(_panel, _id, _defValue = "") {
		var o = _panel.contentDiv.GetElementById(_id), value;
		if (o) {
			if (o.dataset.i18n == "true") {
				var osel = _panel.contentDiv.GetElementById(_id + "_sel");
				var tlid, lid = o.dataset.lid, newvalue = {};
				try {
					value = JSON.parse(o.dataset.inputs);
				} catch (jerr) {
					value = { "en-US": o.dataset.inputs };
				};
				value[lid] = o.value;
				for (tlid in value) if (value[tlid].trim() != "") newvalue[tlid] = value[tlid].trim();
				if (ObjectUtils.countKeys(newvalue) == 1 && newvalue.hasOwnProperty("en-US")) {
					return newvalue["en-US"];
				} else {
					value = JSON.stringify(newvalue);
					if (value == "{}") value = "";
					return value;
				};
			} else {
				return o.value;
			};
		} else {
			return _defValue;
		};
	}

	/** Assigns an oninput handler to a text area.
	 * @param {Panel} _panel Panel containing the text area.
	 * @param {string} _id Text area element id.
	 * @param {Function} _onInput Handler function.
	 */
	static TextAreaSetOnInput(_panel, _id, _onInput) {
		var o = _panel.contentDiv.GetElementById(_id);
		if (o) o.oninput = _onInput;
	}

	/** Sets the value of a text area; supports i18n areas (JSON value per language).
	 * @param {Panel} _panel Panel containing the text area.
	 * @param {string} _id Text area element id.
	 * @param {string} [_value=""] New value (JSON string for i18n areas).
	 */
	static TextAreaSetValue(_panel, _id, _value = "") {
		var o = _panel.contentDiv.GetElementById(_id), value;
		if (o) {
			if (o.dataset.i18n.ToBoolean()) {
				o.dataset.inputs = _value;
				try {
					value = JSON.parse(_value);
					if (o.dataset.lid == "en-US") {
						o.value = value["en-US"];
					} else {
						if (value.hasOwnProperty(o.dataset.lid)) {
							o.value = value[o.dataset.lid];
						} else {
							o.value = "";
						};
					};
				} catch (jerr) {
					if (o.dataset.lid == "en-US") {
						o.value = _value;
					} else {
						o.value = "";
					};
				};
			} else {
				o.value = _value;
			};
		};
	}

	/** Click handler for checkboxes: toggles the state, dims/undims dependent input fields, and dispatches a change event.
	 * @param {MouseEvent} _ev Click event.
	 * @param {HTMLInputElement} _this Checkbox element.
	 */
	static CheckBoxClick(_ev, _this) {
		var info, i, o, pref;
		_this.checked = !_this.checked;
		if (_this.dataset.hasOwnProperty("inputSwitches")) {
			if (_this.dataset.inputSwitches != "") {
				info = JSON.parse(_this.dataset.inputSwitches);
				if (info.hasOwnProperty(_this.checked ? 0 : 1)) {
					info = info[_this.checked ? 1 : 0];
					pref = _this.id.cutAtLastCharOf() + "_";
					for (i in info) {
						o = document.getElementById(pref + i + "_inputField");
						if (o) o.style.opacity = info[i] ? 1.0 : 0.3;
					};
				};
			};
		};
		if (_this.onchange != null) {
			var ev = new Event('change');
			_this.dispatchEvent(ev);
		};
	}

	/** Click handler for icon-button style checkboxes: toggles the stored value/highlight and runs the custom input code.
	 * @param {MouseEvent} _ev Click event.
	 * @param {HTMLElement} _this Button element.
	 * @param {string} _id Checkbox base id.
	 */
	static ChecBoxOnButtonClick(_ev, _this, _id) {
		_this.dataset.value = _this.dataset.value != "true";
		_this.className = _this.className.boolClass("highlight", _this.dataset.value == "true");
		if (_this.dataset.oninput != "") eval(_this.dataset.oninput);
	}

	/** Builds a labeled checkbox (or an icon toggle button when opts.icon is set).
	 * @param {string} _id Checkbox element id.
	 * @param {string|boolean} _title Field label; false for no label.
	 * @param {string} [_text=""] Text shown next to the checkbox.
	 * @param {Object} [_opts={}] Options: value, disabled, oninput/onchange, icon, color, tooltip, note, extraClass, extraHTML, postExtraHTML, textreplaces, intputSwitches, context ("panel", "modal", "pure", "paneltable", "paneltablecenter").
	 * @returns {string} Checkbox HTML.
	 */
	static CheckBoxHTML(_id, _title, _text = "", _opts = {}) {
		var t = "", h = "", p, inputSwitches = "", icon = "", color = "white", disabled = false;
		if (_opts.hasOwnProperty("disabled")) disabled = _opts.disabled;
		if (_opts.hasOwnProperty("oninput")) _opts.onchange = _opts.oninput;
		if (_opts.hasOwnProperty("icon")) icon = _opts.icon;
		if (!_opts.hasOwnProperty("context")) _opts.context = "panel";
		h += '<div class="inputField' + (_opts.hasOwnProperty("extraClass") ? ' ' + _opts.extraClass : '') + '">';
		if (icon == "") {
			if (_title !== false) {
				if (_opts.context == "paneltable") _title = _title.wordWrap();
				t += '<div class="title" id="' + _id + '_title" class="inputField">' + _title.HtmlEntities() + '</div>';
			};
			if (_opts.hasOwnProperty("intputSwitches")) inputSwitches += ' data-input-switches="' + JSON.stringify(_opts.intputSwitches).HtmlEntities() + '" ';
			if (_opts.hasOwnProperty("extraHTML")) h += _opts.extraHTML;
			h += '<div style="display:inline-box;">';
			h += '<input type="checkbox"' + inputSwitches + 'class="checkbox" onclick="return false;" ' + ButtonAttributes("GUI.CheckBoxClick(event,this);") + ' id="' + _id + '" ' + (_opts.hasOwnProperty("tooltip") ? ' title="' + _opts.tooltip.tHtmlEntities() + '"' : '') + ((_opts.hasOwnProperty("value") && _opts.value == true) ? ' checked' : '') + (disabled ? ' disabled ' : '') + (_opts.hasOwnProperty("onchange") ? ' onchange="' + _opts.onchange + '"' : '') + '>';
			h += '<span class="checkboxlabel ' + (disabled ? ' disabled ' : '') + '" id="' + _id + '_label">' + _text.HtmlEntities() + '</span>';
			h += '</div>';
			var p;
			if (_opts.hasOwnProperty("textreplaces")) for (p in _opts.textreplaces) h = h.str_replace(p, _opts.textreplaces[p]);
			if (_opts.hasOwnProperty("note")) if (_opts.note != "") h += '<div class="note">*' + _opts.note.I18xTrans().HtmlEntities() + '</div>';
			if (_opts.hasOwnProperty("postExtraHTML")) h += _opts.postExtraHTML;
		} else {
			if (_opts.hasOwnProperty("color")) color = _opts.color;
			h += GUI.ButtonHTML(_id + "_button", false, 'icon-' + icon + ' color-' + color, "GUI.ChecBoxOnButtonClick(event,this,'" + _id + "');", { data: _opts.value, oninput: _opts.oninput, butextraclass: (disabled ? ' disabled ' : '') + (_opts.butextraclass) + ((_opts.value) ? ' highlight' : ''), tooltip: _opts.tooltip });
		};
		h += '</div>';
		switch (_opts.context) {
			case "panel":
			case "modal":
				return t + h;
			case "pure":
				return h;
			case "paneltable":
				return '<tr id="' + _id + '_inputField"><td class="formtitle">' + t + '</td><td class="forminput">' + h + '</td>';
			case "paneltablecenter":
				return '<tr id="' + _id + '_inputField"><td class="center" colspan="2">' + t + ((t == "") ? '' : '&nbsp;') + h + '</td>';
			default:
				return "";
		};
	}

	/** Reads a checkbox's checked state.
	 * @param {Panel} _panel Panel containing the checkbox.
	 * @param {string} _id Checkbox element id.
	 * @param {boolean} _defValue Default if the checkbox is missing.
	 * @returns {boolean} Checked state.
	 */
	static CheckBoxValue(_panel, _id, _defValue) {
		var o = _panel.contentDiv.GetElementById(_id);
		if (o) {
			return o.checked;
		} else {
			return _defValue;
		};
	}

	/** Sets a checkbox's checked state.
	 * @param {Panel} _panel Panel containing the checkbox.
	 * @param {string} _id Checkbox element id.
	 * @param {boolean} _value New checked state.
	 */
	static CheckBoxSetValue(_panel, _id, _value) {
		var o = _panel.contentDiv.GetElementById(_id);
		if (o) o.checked = _value;
	}

	/** Assigns an onchange handler to a checkbox.
	 * @param {Panel} _panel Panel containing the checkbox.
	 * @param {string} _id Checkbox element id.
	 * @param {Function} _onInput Handler function.
	 */
	static CheckBoxSetOnInput(_panel, _id, _onInput) {
		var o = _panel.contentDiv.GetElementById(_id);
		if (o) o.onchange = _onInput;
	}

	/** Shows/hides div groups depending on a checkbox state.
	 * @param {HTMLInputElement} _this Checkbox element.
	 * @param {string[]} _offIds Element ids shown when unchecked.
	 * @param {string[]} _onIds Element ids shown when checked.
	 */
	static SwitchDivsByCheckBoxInput(_this, _offIds, _onIds) {
		var i, o;
		for (i = 0; i < _offIds.length; i++) {
			o = document.getElementById(_offIds[i]);
			if (o) o.style.display = _this.checked ? "none" : "block";
		};
		for (i = 0; i < _onIds.length; i++) {
			o = document.getElementById(_onIds[i]);
			if (o) o.style.display = _this.checked ? "block" : "none";
		};
	}

	/** Builds JS code that fires the onchange of the given checkboxes (to initialize div switching).
	 * @param {string[]} _CheckBoxInputIds Checkbox element ids.
	 * @returns {string} JS code string.
	 */
	static SwitchDivsByCheckBoxInputStartUpJS(_CheckBoxInputIds) {
		var ret = "", c;
		for (c = 0; c < _CheckBoxInputIds.length; c++) {
			ret += "document.getElementById('" + _CheckBoxInputIds[c] + "').onchange();";
		};
		return ret;
	}

	/** Builds an onload image tag that triggers the checkbox div switching once rendered.
	 * @param {string[]} _CheckBoxInputIds Checkbox element ids.
	 * @returns {string} HTML snippet.
	 */
	static SwitchDivsByCheckBoxInputStartUpHTML(_CheckBoxInputIds) {
		return ImgLoadHTML(GUI.SwitchDivsByCheckBoxInputStartUpJS(_CheckBoxInputIds));
		//return '<img src="./skins/'+SKIN+'/imgs/empty.png" class="empty" onload="'+GUI.SwitchDivsByCheckBoxInputStartUpJS(_CheckBoxInputIds)+'">';
	}

	/** Enables or disables a checkbox and its label.
	 * @param {Panel} _panel Panel containing the checkbox.
	 * @param {string} _id Checkbox element id.
	 * @param {boolean} _enabled True to enable.
	 */
	static CheckBoxSetEnabled(_panel, _id, _enabled) {
		var o = _panel.contentDiv.GetElementById(_id);
		if (o) o.disabled = !_enabled;
		var o = _panel.contentDiv.GetElementById(_id + "_label");
		if (o) o.className = o.className.boolClass("disabled", !_enabled);
	}

	/** Builds a group of checkboxes representing individual bits of a bitset value.
	 * @param {string} _id Base element id.
	 * @param {string|boolean} _title Field label; false for no label.
	 * @param {Object} [_opts={}] Options: value, bitsets ({bitValue: {title, icon, color, tooltip}}), separator, separtionType, onchange, note, button, inputclass, extraHTML, context.
	 * @returns {string} Bitset selector HTML.
	 */
	static BitsetSelectHTML(_id, _title, _opts = {}) {
		var t = "", h = "", k = "", s, q, value = 0, bitsets = [], separator = '', sepClass = "";
		if (_opts.hasOwnProperty("separtionType")) {
			switch (_opts.separtionType) {
				case "inline": sepClass = ""; break;
				case "block": sepClass = " column left"; break;
			};
		};
		if (_opts.hasOwnProperty("separator")) separator = _opts.separator;
		if (!_opts.hasOwnProperty("context")) _opts.context = "panel";
		if (_title !== false) {
			if (_opts.context == "paneltable") _title = _title.wordWrap();
			t += '<div class="title" id="' + _id + '_title">' + _title.HtmlEntities() + '</div>';
		};
		if (_opts.hasOwnProperty("extraHTML")) h += _opts.extraHTML;
		if (_opts.hasOwnProperty("value")) value = _opts.value;
		var s;
		for (s in _opts.bitsets) {
			q = _opts.bitsets[s];
			bitsets.push(parseInt(s, 10));
			k += '<span class="sep8"><input type="checkbox" class="checkbox" onclick="return false;" ' + ButtonAttributes("GUI.CheckBoxClick(event,this);") + ' id="' + _id + '_' + s + '" ' + (q.hasOwnProperty("tooltip") ? ' title="' + q.tooltip.HtmlEntities() + '"' : '') + ((((parseInt(s, 10)) & value) != 0) ? ' checked' : '') + (_opts.hasOwnProperty("onchange") ? ' onchange="' + _opts.onchange + '"' : '') + '>';
			if (q.hasOwnProperty("title")) k += q.title.HtmlEntities() + separator;
			if (q.hasOwnProperty("icon")) k += '<span style="vertical-align:middle;' + (q.hasOwnProperty("color") ? 'color:' + q.color + ";" : '') + 'font-size:14px" class="' + q.icon + '"></span>' + separator;
			k += '</span>';
		};
		h += '<div id="' + _id + '" data-bit-sets="' + JSON.stringify(bitsets).HtmlEntities() + '" class="inputField' + sepClass + (_opts.hasOwnProperty("inputclass") ? " " + _opts.inputclass : '') + '">';
		h += k;
		h += '</div>';
		if (_opts.hasOwnProperty("note")) if (_opts.note != "") h += '<div class="note">*' + _opts.note.I18xTrans().HtmlEntities() + '</div>';
		if (_opts.hasOwnProperty("button")) h += _opts.button;
		switch (_opts.context) {
			case "panel":
			case "modal":
				return t + h;
			case "paneltable":
				return '<tr id="' + _id + '_inputField"><td class="formtitle">' + t + '</td><td class="forminput">' + h + '</td>';
			default:
				return "";
		};
	}

	/** Reads the combined bitset value from a bitset selector's checkboxes.
	 * @param {Panel} _panel Panel containing the selector.
	 * @param {string} _id Base element id.
	 * @param {number} _defValue Default if the selector is missing.
	 * @returns {number} Combined bitset value.
	 */
	static BitsetSelectValue(_panel, _id, _defValue) {
		var o = _panel.contentDiv.GetElementById(_id), b = o.dataset.bitSets, ret = 0, i, l, ob;
		if (o) {
			if (b) {
				b = JSON.parse(b);
				l = b.length;
				for (i = 0; i < l; i++) {
					ob = _panel.contentDiv.GetElementById(_id + "_" + b[i]);
					if (ob) if (ob.checked) ret |= b[i];
				};
				return ret;
			} else {
				return _defValue;
			};
		} else {
			return _defValue;
		};
	}

	/** Sets the checkboxes of a bitset selector according to a bitset value.
	 * @param {Panel} _panel Panel containing the selector.
	 * @param {string} _id Base element id.
	 * @param {number} _value Bitset value.
	 */
	static BitsetSelectSetValue(_panel, _id, _value) {
		var o = _panel.contentDiv.GetElementById(_id), b = o.dataset.bitSets, ret = 0, i, l, ob;
		if (o) {
			if (b) {
				b = JSON.parse(b);
				l = b.length;
				for (i = 0; i < l; i++) {
					ob = _panel.contentDiv.GetElementById(_id + "_" + b[i]);
					if (ob) ob.checked = (_value & b[i]) != 0;
				};
			};
		};
	}

	/** Click handler for button-style select inputs: moves the highlight, stores the value, and runs change/input handling.
	 * @param {MouseEvent} _ev Click event.
	 * @param {HTMLElement} _this Clicked button element.
	 * @param {string} _id Select input base id.
	 * @param {string|number} _value Selected value.
	 */
	static SelectInputOnButtonClick(_ev, _this, _id, _value) {
		var o = document.getElementById(_id), bo = document.getElementById(_id + "_selbutton_" + o.dataset.value), bn = document.getElementById(_id + "_selbutton_" + _value), event = _ev;
		if (o) {
			if (bo) bo.className = bo.className.boolClass("highlight", false);
			if (bn) bn.className = bn.className.boolClass("highlight", true);
			o.dataset.value = _value;
			GUI.SelectInputOnChange(_ev, _this, _id);
			if (o.dataset.oninput != "") eval(o.dataset.oninput);
		};
	}

	/** Change handler for select inputs: updates the info text and dims/undims dependent input fields.
	 * @param {Event} _ev Change event.
	 * @param {HTMLElement} _this Select element or trigger.
	 * @param {string} _id Select input base id.
	 */
	static SelectInputOnChange(_ev, _this, _id) {
		var o = document.getElementById(_id), oi = document.getElementById(_id + "_info"), info, o, i, pref, value;
		if (o) if (oi) {
			if (o.dataset.value) {
				value = o.dataset.value;
			} else {
				value = o.value;
			};
			if (o.dataset.info != "") {
				info = JSON.parse(o.dataset.info);
				if (info.hasOwnProperty(value)) {
					oi.innerText = info[value].HtmlEntities();
				} else {
					oi.innerText = "";
				};
			};
			if (o.dataset.hasOwnProperty("inputSwitches")) {
				if (o.dataset.inputSwitches != "") {
					info = JSON.parse(o.dataset.inputSwitches);
					if (info.hasOwnProperty(value)) {
						info = info[value];
						pref = o.id.cutAtLastCharOf() + "_";
						var i;
						for (i in info) {
							o = document.getElementById(pref + i + "_inputField");
							if (o) o.style.opacity = info[i] ? 1.0 : 0.3;
						};
					};
				};
			};
		};
	}

	/** Builds a labeled select input, either as dropdown or as icon button group.
	 * @param {string} _id Select element base id.
	 * @param {string|boolean} _title Field label; false for no label.
	 * @param {Object<string,string>} _selects Map of option values to display texts.
	 * @param {Object} _opts Options: value, disabled, selectDropDown, selectIcons, selectInfo, intputSwitches, onchange, oninput, note, extraButtons, extraHTML, postExtraHTML, extraClass, butextraclass, icon, doicon, color, tooltip, context.
	 * @returns {string} Select input HTML.
	 */
	static SelectInputHTML(_id, _title, _selects, _opts) {
		var t = "", h = "", s, inputSwitches = "", cc = "", dropdown = true, disabled = false;
		if (!_opts.hasOwnProperty("context")) _opts.context = "panel";
		if (_opts.hasOwnProperty("disabled")) disabled = _opts.disabled;
		h += '<div class="inputField' + (_opts.hasOwnProperty("extraClass") ? ' ' + _opts.extraClass : '') + '">';
		if (_title !== false) {
			if (_opts.context == "paneltable") _title = _title.wordWrap();
			t += '<div class="inputField title" id="' + _id + '_title">' + _title.HtmlEntities() + '</div>';
		};
		if (_opts.hasOwnProperty("extraHTML")) h += _opts.extraHTML;
		if (_opts.hasOwnProperty("selectDropDown")) dropdown = _opts.selectDropDown;
		_opts.selectDropDown = dropdown;
		if (_opts.hasOwnProperty("intputSwitches")) inputSwitches += ' data-input-switches="' + JSON.stringify(_opts.intputSwitches).HtmlEntities() + '"';
		if (dropdown) {
			if (_opts.hasOwnProperty("selectInfo")) {
				var info = _opts.selectInfo;
				h += '<select id="' + _id + '"' + inputSwitches + (disabled ? ' disabled ' : '') + ' data-info="' + JSON.stringify(info).HtmlEntities() + '" onchange="GUI.SelectInputOnChange(event,this,\'' + _id + '\');' + (_opts.hasOwnProperty("onchange") ? _opts.onchange.HtmlEntities() : '') + '"' + (_opts.hasOwnProperty("oninput") ? ' oninput="' + _opts.oninput.HtmlEntities() + '"' : '') + '>';
			} else {
				h += '<select id="' + _id + '"' + inputSwitches + (disabled ? ' disabled ' : '') + (_opts.hasOwnProperty("onchange") ? ' onchange="' + _opts.onchange.HtmlEntities() + '"' : '') + (_opts.hasOwnProperty("oninput") ? ' oninput="' + _opts.oninput.HtmlEntities() + '"' : '') + '>';
			};
			var s;
			for (s in _selects) {
				h += '<option value="' + s.HtmlEntities() + '"' + ((s == _opts.value) ? ' selected' : '') + '>';
				h += _selects[s].HtmlEntities();
				h += '</option>';
			};
			h += '</select>';
			if (inputSwitches != "") h += '<img src="./skins/' + SKIN + '/imgs/empty.png" class="empty" onload="GUI.SelectInputOnChange(event,this,\'' + _id + '\');">';
		} else {
			if (_title == "") t = "";
			var butgroups = [], buts = [], orders = [], l, i, oninput = "";
			var s;
			for (s in _selects) orders.push(s | 0);
			orders.sort(function (a, b) { return a - b });
			l = orders.length;
			if (_opts.hasOwnProperty("oninput")) oninput = _opts.oninput;
			for (i = 0; i < l; i++) {
				s = orders[i];
				buts.push(GUI.ButtonHTML(_id + "_selbutton_" + s, false, 'icon-' + _opts.selectIcons[s], "GUI.SelectInputOnButtonClick(event,this,'" + _id + "'," + s + ");", { data: s, butextraclass: _opts.butextraclass + ((s == _opts.value) ? ' highlight' : ''), disabled: disabled, tooltip: _selects[s] }));
			};
			butgroups = [buts];
			h = GUI.ButtonBarsHTML(
				butgroups,
				{ buttonsAligns: ["extrabig center wrap noglass noborder", "right"], containerAlign: "center", fullContainer: true, extraAttrs: 'id="' + _id + '" data-value="' + _opts.value + '" data-oninput="' + oninput.HtmlEntities() + '" ' }
			);
		};
		if (_opts.hasOwnProperty("selectInfo")) h += '<div id="' + _id + '_info" class="selectinfo">' + (_opts.selectInfo.hasOwnProperty(_opts.value) ? _opts.selectInfo[_opts.value].HtmlEntities() : "") + '<div>';
		if (_opts.hasOwnProperty("note")) if (_opts.note != "") h += '<div class="note">*' + _opts.note.I18xTrans().HtmlEntities() + '</div>';
		if (_opts.hasOwnProperty("extraButtons")) h += _opts.extraButtons;
		if (_opts.hasOwnProperty("postExtraHTML")) h += _opts.postExtraHTML;

		if (_opts.context == "paneltable" || _opts.context == "paneltablecenter") {
			if (_opts.hasOwnProperty("icon") && _opts.hasOwnProperty("doicon") && _opts.doicon) {
				t = "";
				cc = "white";
				if (_opts.hasOwnProperty("color")) cc = _opts.color;
				t += '<div class="icon-' + _opts.icon + ' color-' + cc + '" ' + (_opts.hasOwnProperty("tooltip") ? ' title="' + _opts.tooltip.HtmlEntities() + '"' : '') + '>';
			};
		};
		h += '</div>';
		switch (_opts.context) {
			case "panel":
			case "modal":
				return t + h;
			case "paneltable":
				return '<tr id="' + _id + '_inputField"><td class="formtitle">' + t + '</td><td class="forminput">' + h + '</td>';
			case "paneltablecenter":
				return '<tr id="' + _id + '_inputField"><td class="center" colspan="2">' + t + ((t == "") ? '' : '&nbsp;') + h + '</td>';
			default:
				return "";
		};
	}

	/** Replaces all options of a select input and sets the current value.
	 * @param {Panel} _panel Panel containing the select.
	 * @param {string} _id Select element id.
	 * @param {Object<string,string>} _selects Map of option values to display texts.
	 * @param {string} _value Value to select.
	 */
	static SelectInputChangeSelects(_panel, _id, _selects, _value) {
		var o = _panel.contentDiv.GetElementById(_id), l, s, op;
		if (o) {
			l = o.length;
			//for(s=0;s<l;s++)if(o.options.hasOwnProperty(s))o.options[s].Remove();
			o.options.length = 0;
			var s;
			for (s in _selects) {
				op = document.createElement('option');
				op.value = s;
				op.innerHTML = _selects[s].HtmlEntities();
				o.appendChild(op);
			};
			o.value = _value;
		};
	}

	/** Sets a select input's value (dropdown or button group variant).
	 * @param {Panel} _panel Panel containing the select.
	 * @param {string} _id Select element id.
	 * @param {string|number} _value New value.
	 */
	static SelectInputSetValue(_panel, _id, _value) {
		var o = _panel.contentDiv.GetElementById(_id);
		if (o) {
			if (o.dataset.value) {
				GUI.SelectInputOnButtonClick(null, null, _id, _value);
			} else {
				o.value = _value;
			};
		};
	}

	/** Reads a select input's value (dropdown or button group variant).
	 * @param {Panel} _panel Panel containing the select.
	 * @param {string} _id Select element id.
	 * @param {string} _defValue Default if the select is missing.
	 * @returns {string} Selected value.
	 */
	static SelectInputValue(_panel, _id, _defValue) {
		var o = _panel.contentDiv.GetElementById(_id);
		if (o) {
			if (o.dataset.value) {
				return o.dataset.value;
			} else {
				return o.value;
			};
		} else {
			return _defValue;
		};
	}

	/** Reads a select input's value as integer.
	 * @param {Panel} _panel Panel containing the select.
	 * @param {string} _id Select element id.
	 * @param {number} _defValue Default if the select is missing.
	 * @returns {number} Selected value as integer.
	 */
	static SelectInputIntValue(_panel, _id, _defValue) {
		var o = _panel.contentDiv.GetElementById(_id);
		if (o) {
			if (o.dataset.value) {
				return parseInt(o.dataset.value, 10);
			} else {
				return parseInt(o.value, 10);
			};
		} else {
			return _defValue;
		};
	}

	/** Reads a select input's value as double (system-precision-clipped).
	 * @param {Panel} _panel Panel containing the select.
	 * @param {string} _id Select element id.
	 * @param {number} _defValue Default if the select is missing.
	 * @returns {number} Selected value as double.
	 */
	static SelectInputDoubleValue(_panel, _id, _defValue) {
		var o = _panel.contentDiv.GetElementById(_id);
		if (o) {
			return parseFloat(o.value).SysClp();;
		} else {
			return _defValue.SysClp();;
		};
	}

	/** Replaces the options of a select input, keeping the current value selected if still present.
	 * @param {Panel} _panel Panel containing the select.
	 * @param {string} _id Select element id.
	 * @param {Object<string,string>} _selects Map of option values to display texts.
	 */
	static SelectInputChangeOptions(_panel, _id, _selects) {
		var o = _panel.contentDiv.GetElementById(_id), s, v, i = 0;
		if (o) {
			v = o.value;
			o.options.length = 0;
			var s;
			for (s in _selects) o.options[i++] = new Option(_selects[s], s, 0, s == v);
		};
	}

	/** Enables or disables a select input.
	 * @param {Panel} _panel Panel containing the select.
	 * @param {string} _id Select element id.
	 * @param {boolean} _enabled True to enable.
	 */
	static SelectInputSetEnabled(_panel, _id, _enabled) {
		var o = _panel.contentDiv.GetElementById(_id);
		if (o) o.disabled = !_enabled;
	}

	/** Builds a labeled radio button group.
	 * @param {string} _id Radio group name.
	 * @param {string|boolean} _title Field label; false for no label.
	 * @param {Object} _opts Options: values ([{value, title, tooltip}]), value (selected), layout ("line"/"multiline"), onchange, note, extraHTML, context.
	 * @returns {string} Radio group HTML.
	 */
	static RadioInputHTML(_id, _title, _opts) {
		var t = "", h = "", vv, i, l, layout = "line", value = "";
		if (!_opts.hasOwnProperty("context")) _opts.context = "panel";
		if (_opts.hasOwnProperty("layout")) layout = _opts.layout;
		if (_opts.hasOwnProperty("value")) value = _opts.value;
		h += '<div class="inputField">';
		if (_title !== false) {
			if (_opts.context == "paneltable") _title = _title.wordWrap();
			t += '<div class="title" id="' + _id + '_title" class="inputField">' + _title.HtmlEntities() + '</div>';
		};
		if (_opts.hasOwnProperty("extraHTML")) h += _opts.extraHTML;
		l = _opts.values.length;
		for (i = 0; i < l; i++) {
			vv = _opts.values[i];
			//log(value,vv.value);
			h += '<input type="radio" class="radio" name="' + _id + '" ' + (vv.hasOwnProperty("tooltip") ? ' title="' + vv.tooltip.tHtmlEntities() + '"' : '') + ' value="' + vv.value.HtmlEntities() + '"' + ((value == vv.value) ? ' checked' : '') + (_opts.hasOwnProperty("onchange") ? ' onchange="' + _opts.onchange + '"' : '') + '>';
			h += vv.title.HtmlEntities();
			switch (layout) {
				case "multiline":
					h += '<br/>';
					break;
				case "line":
					h += '&nbsp;&nbsp;';
					break;
			};
		};
		if (_opts.hasOwnProperty("note")) if (_opts.note != "") h += '<div class="note">*' + _opts.note.I18xTrans().HtmlEntities() + '</div>';
		h += '</div>';
		switch (_opts.context) {
			case "panel":
			case "modal":
				return t + h;
			case "paneltable":
				return '<tr id="' + _id + '_inputField"><td class="formtitle">' + t + '</td><td class="forminput">' + h + '</td>';
			default:
				return "";
		};
	}

	/** Reads the value of the checked radio button in a group.
	 * @param {Panel} _panel Panel containing the group.
	 * @param {string} _id Radio group name.
	 * @param {string} _defValue Default if nothing is checked.
	 * @returns {string} Checked radio value.
	 */
	static RadioInputValue(_panel, _id, _defValue) {
		var o = _panel.contentDiv.GetElementsByName(_id), i, l;
		if (o) {
			l = o.length;
			for (i = 0; i < l; i++)if (o[i].checked) return o[i].value;
			return _defValue;
		} else {
			return _defValue;
		};
	}

	/** Reads the checked radio button's value; despite the name, the value is converted via ToBoolean().
	 * @param {Panel} _panel Panel containing the group.
	 * @param {string} _id Radio group name.
	 * @param {*} _defValue Default if nothing is checked.
	 * @returns {boolean|*} Converted value or the default.
	 */
	static RadioInputIntValue(_panel, _id, _defValue) {
		var o = _panel.contentDiv.GetElementsByName(_id), i, l;
		if (o) {
			l = o.length;
			for (i = 0; i < l; i++)if (o[i].checked) return (o[i].value + "").ToBoolean();
			return _defValue;
		} else {
			return _defValue;
		};
	}

	/** Sets the value on the radio group's "_option" elements collection.
	 * @param {Panel} _panel Panel containing the group.
	 * @param {string} _id Radio group name.
	 * @param {string} _value New value.
	 */
	static RadioInputSetValue(_panel, _id, _value) {
		var o = _panel.contentDiv.GetElementsByName(_id + "_option"), i, l;
		if (o) o.value = _value;
	}

	/** Assigns an onchange handler to the radio group's elements collection.
	 * @param {Panel} _panel Panel containing the group.
	 * @param {string} _id Radio group name.
	 * @param {Function} _onchange Handler function.
	 */
	static RadioInputSetOnChange(_panel, _id, _onchange) {
		var o = _panel.contentDiv.GetElementsByName(_id), i, l;
		if (o) o.onchange = _onchange;
	}

	/** Loads an image file into an image input: reads, resizes per resizeInfo options, updates the preview, and runs the custom input code.
	 * @param {Event} _ev Triggering event.
	 * @param {string} _id Image input base id.
	 * @param {File} _file Image file to load.
	 */
	static InputImageLoad(_ev, _id, _file) {
		var img = document.getElementById(_id + '_image'), opts = JSON.parse(img.dataset.opts), ri = opts.resizeInfo;
		var reader = new FileReader(), orgimg = new Image();
		if (!ri.hasOwnProperty("keepOrgIfPossible")) ri.keepOrgIfPossible = false;
		reader.onload = function (_le) {
			orgimg.onload = function () {
				orgimg.Resize(ri.boxWidth, ri.boxHeight, ri.suffix, ri.quality, ri.cutMode, ri.cutHorPos, ri.cutVerPos, ri.bgr, ri.maxSize,
					function (_newImg) {
						img.src = _newImg.src;
						if (opts.hasOwnProperty("oninput")) {
							eval(opts.oninput);
						};
					}, ri.keepOrgIfPossible
				);
			};
			orgimg.onerror = function () {
			};
			orgimg.src = _le.target.result;
		};
		reader.readAsDataURL(_file);
	}

	/** Change handler for the hidden file input of an image input: loads the selected file.
	 * @param {Event} _ev Change event.
	 * @param {string} _id Image input base id.
	 */
	static InputImageChange(_ev, _id) {
		var imginput = document.getElementById(_id + '_imageinput');
		if (imginput.files.length > 0) {
			GUI.InputImageLoad(_ev, _id, imginput.files[0]);
		};
	}

	/** Click handler for an image input: opens the hidden file selector.
	 * @param {MouseEvent} _ev Click event.
	 * @param {string} _id Image input base id.
	 */
	static InputImageClick(_ev, _id) {
		document.getElementById(_id + '_imageinput').click();
	}

	/** Drop handler for an image input: loads the dropped image file.
	 * @param {DragEvent} _ev Drop event.
	 * @param {string} _id Image input base id.
	 */
	static InputImageDrop(_ev, _id) {
		_ev.preventDefault();
		if (_ev.dataTransfer.files.length > 0) {
			GUI.InputImageLoad(_ev, _id, _ev.dataTransfer.files[0]);
		};
	}

	/** Builds an image input field (preview image with click-or-drop upload and automatic resizing).
	 * @param {string} _id Image input base id.
	 * @param {string|boolean} _title Field label; false for no label.
	 * @param {Object} _opts Options: value, defValue, resizeInfo, oninput, dynsize, note, context.
	 * @returns {string} Image input HTML.
	 */
	static ImageInputHTML(_id, _title, _opts) {
		var t = "", h = "", value;
		//onerrorDefValue
		if (!_opts.hasOwnProperty("value")) _opts.context = "";
		if (!_opts.hasOwnProperty("defValue")) _opts.defValue = "";
		if (!_opts.hasOwnProperty("context")) _opts.context = "panel";
		if (!_opts.hasOwnProperty("oninput")) _opts.oninput = "null";
		if (_title !== false) {
			if (_opts.context == "paneltable") _title = _title.wordWrap();
			t += '<div class="title" id="' + _id + '_title" class="inputField">' + _title.HtmlEntities() + '</div>';
		};
		value = _opts.value;
		if (value == "") value = _opts.defValue;
		h += '<div id="' + _id + '" class="inputField cursor_handpointer image limitedwidth" title="' + '...click or drop to change image...<info context="gui image input note"/>'.I18xTrans().HtmlEntities() + '" ondragover="event.preventDefault();" ondrop="GUI.InputImageDrop(event,\'' + _id + '\');" onclick="GUI.InputImageClick(event,\'' + _id + '\');">';
		h += '<img ' + (_opts.hasOwnProperty("dynsize") ? 'width="100%"' : '') + ' id="' + _id + '_image" data-opts="' + JSON.stringify(_opts).HtmlEntities() + '" src="' + value + '">';
		h += '<input id="' + _id + '_imageinput" style="display:none;" onchange="GUI.InputImageChange(event,\'' + _id + '\');" type="file" accept="image/' + '*"/>';
		h += '</div>';
		if (_opts.hasOwnProperty("note")) if (_opts.note != "") h += '<div class="note">*' + _opts.note.I18xTrans().HtmlEntities() + '</div>';

		switch (_opts.context) {
			case "panel":
			case "modal":
				if (_opts.hasOwnProperty("extraButtons")) h += '<div class="buttonbarcontainer nopadding center">' + _opts.extraButtons + '</div>';
				return t + h;
			case "paneltable":
				if (_opts.hasOwnProperty("extraButtons")) h += _opts.extraButtons;
				return '<tr id="' + _id + '_inputField"><td class="formtitle">' + t + '</td><td class="forminput">' + h + '</td>';
			default:
				return "";
		};
	}

	/** Reads the current image source of an image input.
	 * @param {Panel} _panel Panel containing the input.
	 * @param {string} _id Image input base id.
	 * @param {string} _defValue Default if the input is missing.
	 * @returns {string} Image source URL/data URI.
	 */
	static ImageInputValue(_panel, _id, _defValue) {
		var o = _panel.contentDiv.GetElementById(_id + '_image');
		if (o) {
			return o.src;
		} else {
			return _defValue;
		};
	}

	/** Returns the displayed width of an image input's image.
	 * @param {Panel} _panel Panel containing the input.
	 * @param {string} _id Image input base id.
	 * @param {number} _defValue Default if the input is missing.
	 * @returns {number} Image width in pixels.
	 */
	static ImageInputWidth(_panel, _id, _defValue) {
		var o = _panel.contentDiv.GetElementById(_id + '_image');
		if (o) {
			return o.width;
		} else {
			return _defValue;
		};
	}

	/** Returns the displayed height of an image input's image.
	 * @param {Panel} _panel Panel containing the input.
	 * @param {string} _id Image input base id.
	 * @param {number} _defValue Default if the input is missing.
	 * @returns {number} Image height in pixels.
	 */
	static ImageInputHeight(_panel, _id, _defValue) {
		var o = _panel.contentDiv.GetElementById(_id + '_image');
		if (o) {
			return o.height;
		} else {
			return _defValue;
		};
	}

	/** Sets the image source of an image input.
	 * @param {Panel} _panel Panel containing the input.
	 * @param {string} _id Image input base id.
	 * @param {string} _value New image source URL/data URI.
	 * @returns {string} The assigned source (if the element exists).
	 */
	static ImageInputSetValue(_panel, _id, _value) {
		var o = _panel.contentDiv.GetElementById(_id + "_image");
		if (o) return o.src = _value;
	}

	/** Loads a file into an audio input via FileReader, or clears the input when no file is given.
	 * @param {Event} _ev Triggering event (unused).
	 * @param {string} _id Audio input base id.
	 * @param {File|string} [_file=""] File to load; empty string clears the input.
	 */
	static InputAudioLoad(_ev, _id, _file = "") {
		var audio = document.getElementById(_id + '_audio'), ctrls = document.getElementById(_id + '_playbut'), opts = JSON.parse(audio.dataset.opts), audioremove = document.getElementById('removeaudio_' + _id), audioname = document.getElementById(_id + '_audioname'), ir = document.getElementById(_id + '_range');
		var reader = new FileReader(), opts;
		opts = JSON.parse(audio.dataset.opts);
		if (_file == "") {
			if (ctrls) ctrls.className = ctrls.className.boolClass("disabled", true);
			audio.src = "";
			audioname.style.display = "none";
			audioname.innerHTML = "";
			if (audioremove) audioremove.className = audioremove.className.boolClass("disabled", true);
			if (opts.hasOwnProperty("onchange")) eval(opts.onchange);
			if (ir) {
				ir.disabled = true;
				ir.max = 0;
				ir.value = 0;
			};
			GUI.InputAudioSetPlayTime(_id, true);
		} else {
			reader.onerror = function (_e) {
				audio.src = "";
				audio.name = "";
				audioname.style.display = "none";
				audioname.innerHTML = "";
				if (ctrls) ctrls.className = ctrls.className.boolClass("disabled", true);
				if (audioremove) audioremove.className = audioremove.className.boolClass("disabled", true);
				if (opts.hasOwnProperty("onchange")) eval(opts.onchange);
				if (ir) {
					ir.disabled = true;
					ir.max = 0;
					ir.value = 0;
				};
				GUI.InputAudioSetPlayTime(_id, true);
			};
			reader.onload = function (_e) {
				audio.src = _e.target.result;
				audio.name = _file.name.basename();
				audioname.style.display = "block";
				audioname.innerHTML = audio.name.HtmlEntities();
				if (ctrls) ctrls.className = ctrls.className.boolClass("disabled", false);
				if (audioremove) audioremove.className = audioremove.className.boolClass("disabled", false);
				if (opts.hasOwnProperty("onchange")) eval(opts.onchange);
				if (ir) {
					ir.disabled = false;
					ir.max = audio.duration;
					ir.value = 0;
				};
				GUI.InputAudioSetPlayTime(_id, false);
			};
			reader.readAsDataURL(_file);
		};
	}

	/** onloadeddata handler for an audio input; enables controls and initializes the seek range.
	 * @param {Event} _ev Load event.
	 * @param {string} _id Audio input base id.
	 */
	static InputAudioLoaded(_ev, _id) {
		var audio = document.getElementById(_id + '_audio');
		if (audio == null) return;
		var ctrls = document.getElementById(_id + '_playbut'), opts = JSON.parse(audio.dataset.opts), audioremove = document.getElementById('removeaudio_' + _id), audioname = document.getElementById(_id + '_audioname'), ir = document.getElementById(_id + '_range');
		if (ctrls) ctrls.className = ctrls.className.boolClass("disabled", false);
		if (ir) {
			ir.disabled = false;
			ir.max = audio.duration;
			ir.value = 0;
		};
		GUI.InputAudioSetPlayTime(_id, false);
	}

	/** onchange handler for the hidden file input; loads the selected audio file.
	 * @param {Event} _ev Change event.
	 * @param {string} _id Audio input base id.
	 */
	static InputAudioChange(_ev, _id) {
		var audioinput = document.getElementById(_id + '_audioinput');
		if (audioinput.files.length > 0) GUI.InputAudioLoad(_ev, _id, audioinput.files[0]);
	}

	/** Click handler for the upload button; opens the hidden file picker.
	 * @param {Event} _ev Click event.
	 * @param {string} _id Audio input base id.
	 */
	static InputAudioUploadClick(_ev, _id) {
		document.getElementById(_id + '_audioinput').click();
	}

	/** Click handler for the remove button; clears the loaded audio.
	 * @param {Event} _ev Click event.
	 * @param {string} _id Audio input base id.
	 */
	static InputAudioRemoveClick(_ev, _id) {
		GUI.InputAudioLoad(_ev, _id);
	}

	/** Updates the current/total play time label and seek range for an audio input.
	 * @param {string} _id Audio input base id.
	 */
	static InputAudioSetPlayTime(_id) {
		var ia = document.getElementById(_id + '_audio'), pt = document.getElementById(_id + '_playtext'), pb = document.getElementById(_id + '_playbut'), ir = document.getElementById(_id + '_range');
		var t, d;
		if (ia == null) {
			t = 0;
			d = 0;
		} else {
			t = ia.currentTime;
			d = ia.duration;
			if (GUI.InputAudioPlayingID == _id && ia.paused) GUI.InputAudioPlay(null, null, _id);
		};
		if (t >= 3600) t = 3599;
		if (d >= 3600) d = 3599;
		t = (Math.floor(t / 60) + "").PadStart(2, "0") + ":" + (((t | 0) % 60) + "").PadStart(2, "0")
		d = (Math.floor(d / 60) + "").PadStart(2, "0") + ":" + (((d | 0) % 60) + "").PadStart(2, "0")
		if (pt) pt.innerText = t + " / " + d;
		if (ir) ir.value = ia.currentTime;
	}

	/** oninput handler for the audio seek range slider; sets the audio currentTime.
	 * @param {Event} _ev Input event.
	 * @param {HTMLInputElement} _this Range input element.
	 * @param {string} _id Audio input base id.
	 */
	static InputAudioPlayRange(_ev, _this, _id) {
		var ia = document.getElementById(_id + '_audio')
		if (ia != null) ia.currentTime = parseFloat(_this.value);
	}

	/** Interval callback that refreshes the play time display of the given audio input.
	 * @param {string} _id Audio input base id.
	 */
	static InputAudioPlayTimer(_id) {
		GUI.InputAudioSetPlayTime(_id);
	}

	/** Id of the audio input that is currently playing (empty string if none). */
	static InputAudioPlayingID = null;
	/** handle of the setInterval timer used to update the play time display. */
	static InputAudioPlayInterval = null;
	/** Applies Config.MUSIC_VOL to the currently playing audio element. */
	static InputAudioPlaySetVolume() {
		if (GUI.InputAudioPlayingID != "") {
			var ia = document.getElementById(GUI.InputAudioPlayingID + '_audio');
			if (ia != null) ia.volume = Config.MUSIC_VOL;
		};
	}

	/** Play/pause click handler for an audio input; only one input may play at a time.
	 * @param {Event|null} _ev Click event (may be null when stopping programmatically).
	 * @param {HTMLElement|null} _this Play button element (null when stopping programmatically).
	 * @param {string} _id Audio input base id.
	 */
	static InputAudioPlay(_ev, _this, _id) {
		var ia = document.getElementById(_id + '_audio'), ctrls = document.getElementById(_id + '_playbut');
		if (_this != null) if (_this.className.hasClass("disabled")) return;
		if (ia == null || ia.src == "") {
			if (GUI.InputAudioPlayInterval != null) clearInterval(GUI.InputAudioPlayInterval);
			if (GUI.InputAudioPlayingID == _id) GUI.InputAudioPlayingID = "";
			return;
		};
		if (ia.playing) {
			ia.playing = false;
			ia.pause();
			if (GUI.InputAudioPlayInterval != null) clearInterval(GUI.InputAudioPlayInterval);
			if (ctrls) ctrls.className = ctrls.className.boolClasses("icon-play2", "icon-pause", true);
			GUI.InputAudioPlayingID = "";
			GUI.InputAudioPlayInterval = null;
		} else {
			if (GUI.InputAudioPlayingID != "") {
				GUI.InputAudioPlayingID = "";
				GUI.InputAudioPlay(null, null, GUI.InputAudioPlayingID);
			};
			if (ctrls) ctrls.className = ctrls.className.boolClasses("icon-play2", "icon-pause", false);
			ia.playing = true;
			ia.volume = Config.MUSIC_VOL;
			ia.play();
			GUI.InputAudioPlayInterval = setInterval(GUI.InputAudioPlayTimer, 100, _id);
			GUI.InputAudioPlayingID = _id;
		};
	}

	/** Builds a labeled audio upload/playback input field with play controls and file picker.
	 * @param {string} _id Input element base id.
	 * @param {string|boolean} _title Field label; false for no label.
	 * @param {Object} _opts Options (value, audioName, accepts, onchange, context, inputclass, loadButText, loadButIcon, removeButText, removeButIcon, extraButtons, ...).
	 * @returns {string} Audio input HTML.
	 */
	static AudioInputHTML(_id, _title, _opts) {
		var t = "", h = "", loadButText = false, loadButIcon = "icon-upload", loadButClass = "button", removeButText = false, removeButIcon = "icon-bin", removeButClass = "button";
		//onerrorDefValue
		if (!_opts.hasOwnProperty("context")) _opts.context = "panel";
		if (!_opts.hasOwnProperty("oninput")) _opts.oninput = "null";
		if (!_opts.hasOwnProperty("accepts")) _opts.accepts = "audio/mp3;audio/wav";
		if (!_opts.hasOwnProperty("audioName")) _opts.audioName = "";
		if (_title !== false) {
			if (_opts.context == "paneltable") _title = _title.wordWrap();
			t += '<div class="title" id="' + _id + '_title" class="inputField">' + _title.HtmlEntities() + '</div>';
		};
		h += '<div class="inputField' + (_opts.hasOwnProperty("inputclass") ? " " + _opts.inputclass : '') + '">';
		h += '<div>';
		h += '<span id="' + _id + '_playbut" onclick="GUI.InputAudioPlay(event,this,\'' + _id + '\');" style="color:white;" class="icon-play2 button disabled cursor_handpointer leftalign"></span>';
		//h+='<span id="'+_id+'_playloopbut" onclick="GUI.InputAudioLoop(event,this,\''+_id+'\');" style="color:white;" class="icon-playloop button disabled cursor_handpointer leftalign"></span>';
		h += ' <span id="' + _id + '_playtext" class="" type="range"/>00:00 / 00:00</span>';
		h += '<input disabled id="' + _id + '_range" oninput="GUI.InputAudioPlayRange(event,this,\'' + _id + '\');" class="range" type="range" min="0" max="0" step="0.1"/>';
		h += '</div>';
		h += '<audio controls onloadeddata="GUI.InputAudioLoaded(event,\'' + _id + '\');" style="display:none;opacity:0.5;" class="cursor_handpointer" id="' + _id + '_audio" data-opts="' + JSON.stringify(_opts).HtmlEntities() + '" src="' + _opts.value + '" name="' + _opts.audioName.HtmlEntities() + '"></audio>';
		h += '<input id="' + _id + '_audioinput" style="display:none;padding:8px;" onchange="GUI.InputAudioChange(event,\'' + _id + '\');" type="file" accept="' + _opts.accepts + '"/>';
		h += '<div id="' + _id + '_audioname" style="' + ((_opts.audioName == "") ? 'display:none;' : 'display:block;') + '">' + _opts.audioName.HtmlEntities() + '</div>';
		if (_opts.hasOwnProperty("loadButText")) loadButText = _opts.loadButText;
		if (_opts.hasOwnProperty("loadButIcon")) loadButIcon = _opts.loadButIcon;
		if (_opts.hasOwnProperty("loadButClass")) loadButClass = _opts.loadButClass;
		if (_opts.hasOwnProperty("removeButText")) removeButText = _opts.removeButText;
		if (_opts.hasOwnProperty("removeButIcon")) removeButIcon = _opts.removeButIcon;
		if (_opts.hasOwnProperty("removeButClass")) removeButClass = _opts.removeButClass;
		h += '<div class="buttonbarcontainer left leftalign">';
		h += GUI.ButtonHTML("loadaudio_" + _id, loadButText, loadButIcon, "GUI.InputAudioUploadClick(event,'" + _id + "');", { butclass: loadButClass, tooltip: '...upload audio file...<info context="gui audio input tooltip"/>'.I18xTrans() });
		h += GUI.ButtonHTML("removeaudio_" + _id, removeButText, removeButIcon, "GUI.InputAudioRemoveClick(event,'" + _id + "');", { disabled: (_opts.value == ""), butclass: removeButClass, tooltip: '...remove audio file...<info context="gui audio input tooltip"/>'.I18xTrans() });
		if (_opts.hasOwnProperty("extraButtons")) h += _opts.extraButtons;
		h += '</div>';
		h += '</div>';
		switch (_opts.context) {
			case "panel":
			case "modal":
				return t + h;
			case "paneltable":
				return '<tr id="' + _id + '_inputField"><td class="formtitle">' + t + '</td><td class="forminput">' + h + '</td>';
			default:
				return "";
		};
	}

	/** Returns the data URL or src of the audio element in a panel audio input.
	 * @param {Panel} _panel Panel hosting the input.
	 * @param {string} _id Audio input base id.
	 * @param {*} _defValue Value returned when the element is missing or empty.
	 * @returns {string} Audio src or _defValue.
	 */
	static AudioInputValue(_panel, _id, _defValue) {
		var o = _panel.contentDiv.GetElementById(_id + '_audio');
		if (o) {
			return (o.src == "" || o.src == o.baseURI) ? "" : o.src;
		} else {
			return _defValue;
		};
	}

	/** Returns the display name of the loaded audio file in a panel audio input.
	 * @param {Panel} _panel Panel hosting the input.
	 * @param {string} _id Audio input base id.
	 * @param {*} _defValue Value returned when the element is missing.
	 * @returns {string} Audio file name or _defValue.
	 */
	static AudioInputAudioName(_panel, _id, _defValue) {
		var o = _panel.contentDiv.GetElementById(_id + '_audio');
		if (o) {
			return o.name;
		} else {
			return _defValue;
		};
	}

	/** Loads a file into a panel audio input (or clears it when _value is empty).
	 * @param {Panel} _panel Panel hosting the input.
	 * @param {string} _id Audio input base id.
	 * @param {File|string} _value File to load.
	 */
	static AudioInputSetValue(_panel, _id, _value) {
		var o = _panel.contentDiv.GetElementById(_id + "_audio");
		if (o) GUI.InputAudioLoad({}, _id, _value);
	}

	/** Builds HTML for a compact SoundCloud iframe player for the given track id.
	 * @param {number} _trackId SoundCloud track id (0 returns empty string).
	 * @param {string} _extraStyle Inline CSS style for the player element.
	 * @returns {string} SoundCloud player HTML.
	 */
	static SoundCloudMiniPlayer(_trackId, _extraStyle) {
		var h = "", url, srcurl;
		if (_trackId == 0) return "";
		url = "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/" + _trackId + "&color=%230080ff&auto_play=" + System.IS_FIREFOX.toString() + "true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false";
		srcurl = url;
		if (Config.MUSIC_VOL == 0 && System.IS_CHROME) srcurl = "";
		if (AlienPolicy()) {
			//h+='<img src="./skins/'+SKIN+'/imgs/empty.png" class="empty" onload="MoveSC(this);">';
			h += '<iframe id="soundcloudiframe" class="soundcloudplayer" style="' + _extraStyle + '" width="100%" height="20px" scrolling="no" src="' + srcurl + '" data-soundcloudurl="' + url.HtmlEntities() + '" frameborder="no"></iframe>';
		} else {
			h += '<div id="soundcloudiframe" onclick="AlienPolicy(AlienFree);" class="soundcloudpreview height20" name="AlienFreeSoundCloud" style="' + _extraStyle + '"" data-height="20" data-soundcloudurl="' + srcurl.HtmlEntities() + '"></div>';
		};
		//return "";
		return h;
	}

	/** Replaces a SoundCloud preview div with a real iframe (AlienPolicy workaround).
	 * @param {HTMLElement} _this Preview div element to replace.
	 */
	static SoundCloudReWork(_this) {
		var h = "";
		h += '<iframe id="' + _this.id + '" style="display:' + ((_this.dataset.soundcloudurl == "") ? 'none;' : 'block;') + '" onload="if(this.clientWidth==0)GUI.SoundCloudBug(this);" class="soundcloudplayer" width="100%" scrolling="no" src="' + _this.dataset.soundcloudurl + '" data-soundcloudurl="' + _this.dataset.soundcloudurl.HtmlEntities() + '"></iframe>';
		_this.outerHTML = h;
	}

	/** Fixes SoundCloud iframe load failures by falling back to a clickable preview div.
	 * @param {HTMLElement} _this Trigger element (usually the empty load image).
	 */
	static SoundCloudBug(_this) {
		var h = "";
		if (_this.nextSibling == null) return;
		if (_this.nextSibling.tagName != "IFRAME") return;
		if (_this.nextSibling.clientWidth == 0) {
			h += '<div id="' + _this.nextSibling.id + '" onclick="GUI.SoundCloudReWork(this);" class="soundcloudpreview height20" data-soundcloudurl="' + _this.nextSibling.dataset.soundcloudurl.HtmlEntities() + '"></div>';
		} else {
			_this.nextSibling.src = _this.nextSibling.dataset.soundcloudurl;
		};
		_this.nextSibling.outerHTML = h;
	}

	/** onchange handler for a SoundCloud track id/url text input; updates the embedded player.
	 * @param {Event} _ev Change event.
	 * @param {HTMLInputElement} _this Track id input element.
	 */
	static SoundCloudInputChanged(_ev, _this) {
		var iframe = _this.parentNode.GetElementById(_this.id + "_iframe"), trackNo, n, url;
		trackNo = parseInt(_this.value.trim(), 10);
		if (isNaN(trackNo) || _this.value.indexOf("/tracks/") > 0) trackNo = parseInt(_this.value.substr(_this.value.indexOf("/tracks/") + 8), 10);
		if (isNaN(trackNo) || trackNo == 0) {
			_this.value = 0;
			iframe.style.display = "none";
			if (iframe.tagName == "IFRAME") { iframe.src = ""; iframe.dataset.soundcloudurl = ""; };
			if (iframe.tagName == "DIV") iframe.dataset.soundcloudurl = "";
		} else {
			_this.value = trackNo;
			iframe.style.display = "block";
			if (iframe.dataset.height == 20) {
				url = "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/" + trackNo + "&color=%230080ff&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false";
			} else {
				url = "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/" + trackNo + "&color=%230080ff&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true";
			};
			if (iframe.tagName == "IFRAME") { iframe.src = url; iframe.dataset.soundcloudurl = url; };
			if (iframe.tagName == "DIV") iframe.dataset.soundcloudurl = url;
		};
		eval(_this.dataset.onchange);
	}

	/** Builds a labeled SoundCloud track id input with an embedded player iframe/preview.
	 * @param {string} _id Input element id.
	 * @param {string|boolean} _title Field label; false for no label.
	 * @param {Object} _opts Options (value, height, onchange, context, inline, full, trclass, ...).
	 * @returns {string} SoundCloud input HTML.
	 */
	static SoundCloudInputHTML(_id, _title, _opts) {
		var t = "", h = "", trclass = "", height = 166, iframesrc = "", value = 0;
		if (!_opts.hasOwnProperty("context")) _opts.context = "panel";
		if (_opts.hasOwnProperty("height")) height = _opts.height;
		if (_opts.hasOwnProperty("value")) value = _opts.value;
		if (_title !== false) {
			if (_opts.context == "paneltable") _title = _title.wordWrap();
			t += '<div id="' + _id + '_title" class="title' + ((_opts.hasOwnProperty("inline") && _opts.inline) ? ' inline' : '') + '">' + _title.HtmlEntities() + '</div>';
		};
		h += '<div class="inputField' + ((_opts.hasOwnProperty("inline") && _opts.inline) ? ' inline' : '') + ((_opts.hasOwnProperty("full") && _opts.full) ? ' full' : '') + '">';
		h += '<input class="input" type="text" id="' + _id + '" class="input" data-onchange="' + (_opts.hasOwnProperty("onchange") ? _opts.onchange.HtmlEntities() : '') + '" onchange="GUI.SoundCloudInputChanged(event,this);" value="' + value.HtmlEntities() + '"/>';
		if (height == 20) {
			iframesrc = "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/" + value + "&color=%230080ff&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false";
		} else {
			iframesrc = "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/" + value + "&color=%230080ff&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true";
		};
		if (value == 0) iframesrc = "";
		if (AlienPolicy()) {
			h += '<img src="./skins/' + SKIN + '/imgs/empty.png" class="empty" onload="GUI.SoundCloudBug(this);">';
			h += '<iframe id="' + _id + '_iframe"  class="soundcloudplayer" style="display:' + ((iframesrc == "") ? "none" : "block") + ';" width="100%" data-height="' + height + '" height="' + height + 'px" scrolling="no" src="" data-soundcloudurl="' + iframesrc.HtmlEntities() + '" frameborder="no"></iframe>';
		} else {
			if (height == 20) {
				h += '<div id="' + _id + '_iframe" onclick="AlienPolicy(AlienFree);" style="display:' + ((iframesrc == "") ? "none" : "block") + ';" class="soundcloudpreview height20" name="AlienFreeSoundCloud" data-height="' + height + '" data-soundcloudurl="' + iframesrc.HtmlEntities() + '"></div>';
			} else {
				h += '<div id="' + _id + '_iframe" onclick="AlienPolicy(AlienFree);" style="display:' + ((iframesrc == "") ? "none" : "block") + ';" class="soundcloudpreview" name="AlienFreeSoundCloud" data-height="' + height + '" data-soundcloudurl="' + iframesrc.HtmlEntities() + '"></div>';
			};
		};
		//h+='<iframe width="100%" height="166" scrolling="no" frameborder="no" src="http://w.soundcloud.com/player/?url=http%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F{trackId}{widgetParams}"></iframe>';
		//h+='<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/396530439&color=%23ff5500&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false"></iframe>';
		h += '</div>';
		switch (_opts.context) {
			case "panel":
			case "modal":
				return t + h;
			case "paneltable":
				if (_opts.hasOwnProperty("trclass")) if (_opts.trclass != "") trclass = ' class="' + _opts.trclass + '"';
				return '<tr id="' + _id + '_inputField"' + trclass + '><td class="formtitle">' + t + '</td><td class="forminput">' + h + '</td>';
			default:
				return "";
		};
	}

	/** Returns the SoundCloud track id from a panel SoundCloud input.
	 * @param {Panel} _panel Panel hosting the input.
	 * @param {string} _id Input element id.
	 * @param {*} _defValue Value returned when the element is missing.
	 * @returns {number} Parsed track id or _defValue.
	 */
	static SoundCloudInputValue(_panel, _id, _defValue) {
		var o = _panel.contentDiv.GetElementById(_id);
		if (o) {
			return parseInt(o.value, 10);
		} else {
			return _defValue;
		};
	}

	/** Builds HTML for multiple aligned button bars in a single row container.
	 * @param {string[][]} _buttonHTMLs Array of button-bar rows (each row is an array of button HTML strings).
	 * @param {Object} [_opts] Layout options (context, containerAlign, fullContainer, buttonsAligns, texts, extraAttrs).
	 * @returns {string} Button bars container HTML.
	 */
	static ButtonBarsHTML(_buttonHTMLs, _opts) {
		var h = "", i, l;
		if (_opts === undefined) _opts = { context: "panel" };
		l = _buttonHTMLs.length;
		h += '<div ' + (_opts.hasOwnProperty("extraAttrs") ? _opts.extraAttrs + ' ' : '') + 'class="buttonbarcontainer' + ((_opts.hasOwnProperty("containerAlign")) ? ' ' + _opts.containerAlign : '') + ((_opts.hasOwnProperty("fullContainer")) ? ' full' : '') + '">'
		for (i = 0; i < l; i++) {
			h += '<div class="buttonbar' + ((_opts.hasOwnProperty("buttonsAligns")) ? ' ' + _opts.buttonsAligns[i] : '') + '">';
			h += _buttonHTMLs[i].join("");
			if (_opts.hasOwnProperty("texts")) if (_opts.texts[i] != "") h += '<div class="text">' + _opts.texts[i].HtmlEntities() + '</div>';
			h += '</div>';
		};
		h += '</div>';
		return h;
	}

	/** Builds HTML for a single icon/text button with optional tooltip and callback attributes.
	 * @param {string} _id Button element id.
	 * @param {string|boolean} _text Button label text; false for icon-only.
	 * @param {string|false} _icon Icon CSS class (false for text-only).
	 * @param {string} _callBackStr Inline event handler expression (passed to ButtonAttributes).
	 * @param {Object} [_opts] Options (context, butclass, butextraclass, disabled, sel, align, tooltip, style, data, oninput, tableTitle).
	 * @returns {string} Button HTML.
	 */
	static ButtonHTML(_id, _text, _icon, _callBackStr, _opts) {
		var t = "", h = "", contexts, tag = "div", data = "", style = "", butclass = "button", text = "";
		if (_icon === undefined) _icon = false;
		if (_callBackStr === undefined) _callBackStr = "";
		if (_opts === undefined) _opts = { context: "panel" };
		if (_opts.hasOwnProperty("context")) {
			contexts = _opts.context.split(" ");
			if (contexts.indexOf("header") >= 0) tag = "span";
		};
		if (_opts.hasOwnProperty("style")) data += ' style="' + _opts.style + '"';
		if (_opts.hasOwnProperty("data")) data += ' data-value="' + _opts.data.HtmlEntities() + '"';
		if (_opts.hasOwnProperty("oninput")) data += ' data-oninput="' + _opts.oninput.HtmlEntities() + '"';
		if (_opts.hasOwnProperty("butclass")) butclass = _opts.butclass;
		if (_opts.hasOwnProperty("butextraclass")) butclass += " " + _opts.butextraclass;
		if (_opts.hasOwnProperty("tableTitle")) t = _opts.tableTitle;
		text = ((_text !== false) ? _text.HtmlEntities() : '');
		if (text != "" && _icon != "") text = '<span class="buttonicontext">' + text + '</span>';
		h += '<' + tag + ' id="' + _id + '" ' + data + ' class="' + butclass + ((_icon !== false) ? ' ' + _icon : '') + ((_opts.hasOwnProperty("disabled") && _opts.disabled) ? ' disabled' : '') + ((style == "") ? '' : ' style="' + style + '"') + ((_opts.hasOwnProperty("sel") && _opts.disabled) ? ' sel' : '') + ((_opts.hasOwnProperty("align")) ? ' ' + _opts.align : '') + '"' + ((_opts.hasOwnProperty("tooltip")) ? ' title="' + _opts.tooltip.HtmlEntities() + '"' : '') + ((_callBackStr == "") ? "" : ButtonAttributes(_callBackStr)) + '>' + text + '</' + tag + '>';
		switch (_opts.context) {
			case "paneltable":
				return '<tr id="' + _id + '_inputField"><td class="formtitle">' + t + '</td><td class="forminput">' + h + '</td>';
		};
		return h;
	}

	/** Attaches button event handlers to a panel button element.
	 * @param {Panel} _panel Panel hosting the button.
	 * @param {string} _id Button element id.
	 * @param {string} _eventHandler Inline event handler expression.
	 */
	static ButtonSetAttributes(_panel, _id, _eventHandler) {
		var o = _panel.contentDiv.GetElementById(_id);
		if (o) ButtonAttributesToElement(o, _eventHandler);
	}

	/** Sets or clears the selected (sel) state of a panel button.
	 * @param {Panel} _panel Panel hosting the button.
	 * @param {string} _id Button element id.
	 * @param {boolean} _selected New selected state.
	 */
	static ButtonSetSelected(_panel, _id, _selected) {
		var o = _panel.contentDiv.GetElementById(_id);
		if (o) o.className = o.className.boolClass("sel", _selected);
	}

	/** Returns whether a panel button is in the selected (sel) state.
	 * @param {Panel} _panel Panel hosting the button.
	 * @param {string} _id Button element id.
	 * @returns {boolean} True when the button has the sel class.
	 */
	static ButtonSelected(_panel, _id) {
		var o = _panel.contentDiv.GetElementById(_id);
		if (o) return o.className.hasClass("sel");
		return false
	}

	/** Enables or disables a panel button (toggles the disabled CSS class).
	 * @param {Panel} _panel Panel hosting the button.
	 * @param {string} _id Button element id.
	 * @param {boolean} _enabled New enabled state.
	 */
	static ButtonSetEnabled(_panel, _id, _enabled) {
		var o = _panel.contentDiv.GetElementById(_id);
		if (o) o.className = o.className.boolClass("disabled", !_enabled);
	}

	/** Returns whether a panel button is enabled (does not have the disabled class).
	 * @param {Panel} _panel Panel hosting the button.
	 * @param {string} _id Button element id.
	 * @returns {boolean} True when the button is enabled.
	 */
	static ButtonEnabled(_panel, _id) {
		var o = _panel.contentDiv.GetElementById(_id);
		if (o) return !o.className.hasClass("disabled");
		return false
	}

	/** Sets or clears highlight styling on a panel button.
	 * @param {Panel} _panel Panel hosting the button.
	 * @param {string} _id Button element id.
	 * @param {boolean} _highlight True to highlight, false to remove highlight.
	 */
	static ButtonSetHighlight(_panel, _id, _highlight) {
		var o = _panel.contentDiv.GetElementById(_id);
		if (o) o.className = o.className.boolClass("highlight", !_highlight);
	}

	/** Shows or hides a panel button (toggles the hidden CSS class).
	 * @param {Panel} _panel Panel hosting the button.
	 * @param {string} _id Button element id.
	 * @param {boolean} _visible New visible state.
	 */
	static ButtonSetVisible(_panel, _id, _visible) {
		var o = _panel.contentDiv.GetElementById(_id);
		if (o) o.className = o.className.boolClass("hidden", !_visible);
	}

	/** Attaches oninput handlers to multiple dialog input fields on a panel.
	 * @param {Panel} _panel Panel hosting the inputs.
	 * @param {string[]} _ids Input element ids.
	 * @param {function} _hdlDialog oninput event handler.
	 */
	static SetHdlDialogInputs(_panel, _ids, _hdlDialog) {
		var i, l = _ids.length, o;
		for (i = 0; i < l; i++) {
			o = _panel.GetElementById(_ids[i]);
			if (o) o.oninput = _hdlDialog;
		};
	}

	/** Validates panel inputs against their dataset.check rules (ipv46, domain, email, regex, notempty).
	 * @param {Panel} _panel Panel hosting the inputs.
	 * @param {string[]} _ids Input element ids to validate.
	 * @param {boolean} [_markWrong=true] When true, marks invalid fields with the wrong CSS class on their title.
	 * @returns {boolean} True when all checks pass.
	 */
	static CheckInputs(_panel, _ids, _markWrong = true) {
		var i, l = _ids.length, o, ret = true, check, c, res, ot;
		for (i = 0; i < l; i++) {
			o = _panel.contentDiv.GetElementById(_ids[i]);
			if (o) {
				if (o.dataset.hasOwnProperty("check")) {
					check = JSON.parse(o.dataset.check);
					var c;
					for (c in check) {
						switch (c) {
							case "ipv46":
								res = REGEX_IPV46.test(o.value.trim());
								if (_markWrong) {
									ot = _panel.contentDiv.GetElementById(o.id + "_title");
									if (ot) ot.className = ot.className.boolClass("wrong", !res);
								};
								ret = ret && res;
								break;
							case "domain":
								res = REGEX_DOMAIN.test(o.value.trim());
								if (_markWrong) {
									ot = _panel.contentDiv.GetElementById(o.id + "_title");
									if (ot) ot.className = ot.className.boolClass("wrong", !res);
								};
								ret = ret && res;
								break;
							case "email":
								res = REGEX_EMAIL.test(o.value.trim());
								if (_markWrong) {
									ot = _panel.contentDiv.GetElementById(o.id + "_title");
									if (ot) ot.className = ot.className.boolClass("wrong", !res);
								};
								ret = ret && res;
								break;
							case "regex":
								res = (o.value.trim().exec(check[c]));
								if (_markWrong) {
									ot = _panel.contentDiv.GetElementById(o.id + "_title");
									if (ot) ot.className = ot.className.boolClass("wrong", !res);
								};
								ret = ret && res;
								break;
							case "notempty":
								res = (o.value.trim() != "");
								if (_markWrong) {
									ot = _panel.contentDiv.GetElementById(o.id + "_title");
									if (ot) ot.className = ot.className.boolClass("wrong", !res);
								};
								ret = ret && res;
								break;
						};
					};
				};
			};
		};
		return ret;
	}

	static { ENUMERATOR = 0; }
	/** Modal type: wait/spinner message (no panel restore). */
	static MODALTYPE_WAITMESSAGE = ENUMERATOR++;
	/** Modal type: alert dialog. */
	static MODALTYPE_ALERT = ENUMERATOR++;
	/** Modal type: info dialog. */
	static MODALTYPE_INFO = ENUMERATOR++;
	/** Modal type: confirmation dialog with multiple buttons. */
	static MODALTYPE_CONFIRMATION = ENUMERATOR++;
	/** Modal type: progress dialog (no panel restore). */
	static MODALTYPE_PROGRESS = ENUMERATOR++;

	/** Restores the previous modal from the stack after the current one is closed. */
	PerhapsReshowPreviousModalPanel() {
		var mpd;
		if (this.modalPanelData.length == 0) return;
		mpd = this.modalPanelData.pop();
		switch (mpd.type) {
			case GUI.MODALTYPE_WAITMESSAGE:
				break;
			case GUI.MODALTYPE_ALERT:
				this.ShowAlert(mpd.title, mpd.text, mpd.eventHandler);
				break;
			case GUI.MODALTYPE_INFO:
				this.ShowInfo(mpd.title, mpd.text, mpd.eventHandler);
				break;
			case GUI.MODALTYPE_CONFIRMATION:
				this.ShowConfirmation(mpd.title, mpd.text, mpd.buttons, mpd.eventHandler);
				break;
			case GUI.MODALTYPE_PROGRESS:
				break;
		};

	}

	/** Hides the overlay/modalcontent elements and disposes the active modal panel. */
	RemoveModalContent() {
		var oo = document.getElementById("overlay"), om = document.getElementById("modalcontent");
		/*-- @<BUILD_ONLY_ON_BUILDS:Debug --*/
		//console.error("RemoveModalContent");
		/*-- @>BUILD_ONLY_ON_BUILDS --*/
		if (this.modalPanel != null) {
			if (this.modalPanel.eventHandler != null) this.modalPanel.eventHandler({ type: Panel.EVENTTYPE_WILLREMOVEDFROMDOM, panel: this.modalPanel });
			this.modalPanel = null;
			delete this.panels[this.id];
		};
		if (oo) oo.className = oo.className.addClass("hidden");
		if (om) {
			om.className = om.className.addClass("hidden");
			om.className = om.className.removeClass("wait");
			om.innerHTML = "";
		};
		this.modalMode = false;
	}

	/** Shows a panel as modal inside the global modal overlay.
	 * @param {Panel} _panel Panel to display modally.
	 * @param {boolean} [_asWait=false] When true, adds the wait CSS class to the modal container.
	 */
	ShowModalPanel(_panel, _asWait) {
		var om = document.getElementById("modalcontent");
		this.RemoveModalContent();
		if (_asWait === undefined) _asWait = false;
		this.modalPanel = _panel;
		this.modalMode = true;
		_panel.ShowAsModal();
		if (_asWait) om.className = om.className.addClass("wait");
	}

	/** Builds the inner HTML for a modal wait/spinner message (optionally with progress bar).
	 * @param {string} _text Message body text.
	 * @param {string} _title Message title (empty string for no title).
	 * @param {boolean} [_withProgress=false] When true, includes a progress bar placeholder.
	 * @returns {string} Wait message HTML.
	 */
	static WaitMessageHTMLfunction(_text, _title, _withProgress = false) {
		var h = "", id = "gui";
		h += '<div id="modalwaitmessage">';
		if (_title != "") h += '<div class="title">' + _title.HtmlEntities() + '</div>';
		h += '<div class="ai white"></div>';
		if (_withProgress) {
			h += '<br/><br/><div id="progressbar_gui" class=" progressbar off"><div id="progressbarinner_gui" class="progressbarinner" data-source-text="" data-placeholders="{}" data-last-timestamp="' + NOW_TIMESTAMP() + '" data-start-timestamp="' + NOW_TIMESTAMP() + '" data-value="0" data-total="' + 0 + '"></div></div><br/>';
			h += '<div id="progressbartext_gui" class="off"></div>';
		};
		if (_text != "") h += '<div id="waitmessagetext_gui" class="text">' + _text.HtmlEntities() + '</div>';
		h += '</div>';
		return h;
	}

	/** Shows a modal wait/spinner message in the global overlay (blocks interaction).
	 * @param {string} [_text=""] Message body text.
	 * @param {string} [_title=""] Message title.
	 * @param {boolean} [_withProgress=false] When true, includes a progress bar placeholder.
	 */
	ShowWaitMessage(_text = "", _title = "", _withProgress = false) {
		var oo = document.getElementById("overlay"), om = document.getElementById("modalcontent"), h = "";
		if (this.modalPanel != null) this.RemoveModalContent();
		oo.className = oo.className.removeClass("hidden");
		om.className = om.className.removeClass("hidden");
		om.className = om.className.addClass("wait");
		h += GUI.WaitMessageHTMLfunction(_text, _title, _withProgress);
		om.innerHTML = h;
		this.modalMode = true;
	}

	/** Updates the text of the currently visible wait message.
	 * @param {string} _text New message text.
	 */
	ChangeWaitMessage(_text) {
		var o = document.getElementById("waitmessagetext_gui");
		if (o) o.innerHTML = _text.HtmlEntities();
	}

	/** Registry of active progress-bar update intervals keyed by progress bar id. */
	static progressBarIntervals = {};
	/** Last progress bar status text (shared across updates). */
	static progressBarText = "";
	/** Interval callback that refreshes the translated progress bar status text.
	 * @param {string} _id Progress bar base id.
	 */
	static ProgressBarInterval(_id) {
		var ob = document.getElementById("progressbar_" + _id), ot = document.getElementById("progressbartext_" + _id), o = ot, obi = document.getElementById("progressbarinner_" + _id);
		var duration = 0, timePerValue;
		if (ob) if (obi) if (ot) {
			//log("obi.dataset.placeholders",obi.dataset.placeholders);
			if (obi.dataset.total > 1 && obi.dataset.value > 0) {
				timePerValue = ((obi.dataset.lastTimestamp - obi.dataset.startTimestamp) / obi.dataset.value);
				duration = timePerValue * (obi.dataset.total - obi.dataset.value);
				duration -= NOW_TIMESTAMP() - obi.dataset.lastTimestamp;
				duration = Math.round(duration / 1000) * 1000;
				//log("duration",duration);
			};
			ot.innerHTML = obi.dataset.sourceText.I18xTrans(ObjMerge(JSON.parse(obi.dataset.placeholders), { done: obi.dataset.value, total: obi.dataset.total, duration: duration })).HtmlEntities();
		} else {
			if (GUI.progressBarIntervals.hasOwnProperty(_id)) {
				clearInterval(GUI.progressBarIntervals[_id]);
				GUI.progressBarIntervals[_id] = null;
			};
		};
	}

	/** Updates a progress bar element and optionally its status text with i18n placeholders.
	 * @param {string} _id Progress bar base id.
	 * @param {number} _value Current progress value.
	 * @param {string} [_text] Status text (i18n source); omit to keep the previous text.
	 * @param {number} [_total] Total value (required on first call or to change the maximum).
	 * @param {Object} [_placeholders] Placeholder map for I18xTrans (done, total, duration are merged automatically).
	 */
	static UpdateProgressBar(_id, _value, _text, _total, _placeholders) {
		var ob = document.getElementById("progressbar_" + _id);
		var obi = document.getElementById("progressbarinner_" + _id);
		var ot = document.getElementById("progressbartext_" + _id);
		var installInterval = true, startTimestamp, nowTimestamp;
		var duration = 0, timePerValue;
		if (obi) {
			if (_total === undefined) {
				_total = parseFloat(obi.dataset.total);
			} else {
				obi.dataset.total = _total;
			};
			if (_total > 1 && _value > 1) {
				startTimestamp = obi.dataset.startTimestamp;
				obi.dataset.lastTimestamp = NOW_TIMESTAMP();
				nowTimestamp = obi.dataset.lastTimestamp;
				obi.dataset.total = _total;
				obi.dataset.value = _value;
				timePerValue = ((nowTimestamp - startTimestamp) / _value);
				duration = timePerValue * (_total - _value);
				duration = Math.round(duration / 1000) * 1000;
			};
		};
		if (_text !== undefined) {
			if (ot) {
				if (typeof (_placeholders) === UNDEFINED) {
					ot.innerHTML = _text.HtmlEntities();
				} else {
					ot.innerHTML = _text.I18xTrans(ObjMerge(_placeholders, { done: _value, total: _total, duration: duration })).HtmlEntities();
				};
				if (_text.trim() == "") {
					ot.className = ot.className.exchangeClass("on", "off");
				} else {
					ot.className = ot.className.exchangeClass("off", "on");
				};
			};
		} else {
			_text = "";
		};
		if (typeof (_placeholders) == UNDEFINED) { installInterval = false; _placeholders = {}; };
		if (ob) if (obi) {
			obi.dataset.sourceText = _text;
			obi.dataset.placeholders = JSON.stringify(_placeholders);
			if (_total == 0) {
				ob.className = ob.className.exchangeClass("on", "off");
			} else {
				ob.className = ob.className.exchangeClass("off", "on");
				obi.style.width = (Math.min(100, Math.max(_value / _total * 100, 0))) + "%";
				if (installInterval) if (GUI.progressBarIntervals[_id] == null) GUI.progressBarIntervals[_id] = setInterval(GUI.ProgressBarInterval, 1000);
			};
		};
	}

	/** Running counter used to generate unique confirmation panel ids. */
	static ConfirmationPanelIds = 0;
	/** Shows a modal confirmation dialog with the given button set.
	 * @param {string} _title Dialog title.
	 * @param {string} _text Dialog body text (HTML or plain).
	 * @param {number} _buttons Button set (one of GUI.MODALBUTTONSET_*).
	 * @param {function} [_eventHandler=NOFUNCTION] Callback receiving { button: GUI.MODALBUTTON_* }.
	 * @param {Object} [_opts={}] Extra options (textExtraStyle, extraButton: { text, call }).
	 */
	ShowConfirmation(_title, _text, _buttons, _eventHandler = NOFUNCTION, _opts = {}) {
		var oo = document.getElementById("overlay"), om = document.getElementById("modalcontent"), h = "", confirmationPanel, self = this, txt, extraButtonCall = NOFUNCTION, extraButton = null;
		if (this.modalPanel != null) this.RemoveModalContent();
		this.ConfirmationPanelEventHandler = _eventHandler;
		oo.className = oo.className.removeClass("hidden");
		om.className = om.className.removeClass("hidden");

		function HdlButton(_ev, _this) {
			switch (_this.id) {
				case "modalCancelButton":
					PlaySound("no");
					break;
				case "modalOkButton":
					PlaySound("ok");
					break;
				case "modalNoButton":
					PlaySound("no");
					break;
				case "modalYesButton":
					PlaySound("yes");
					break;
				case "modalDiscardButton":
					PlaySound("no");
					break;
				case "modalSaveButton":
					PlaySound("yes");
					break;
				case "modalExtraButton":
					PlaySound("yes");
					extraButtonCall();
					return;
					break;

			};
			self.RemoveModalContent();
			self.modalPanelData.pop();
			_eventHandler({ button: GUI.ModalButtonIds[_this.id] });
			self.PerhapsReshowPreviousModalPanel();
		};

		function HdlConfirmationPanel(_ev) {
			var o;
			switch (_ev.type) {
				case Panel.EVENTTYPE_APPEARSINDOM:
					PlaySound("confirm");
					GUI.ModalButtonEventsSetUp(self, HdlButton);
					break;
				case Panel.EVENTTYPE_WILLREMOVEDFROMDOM:
					break;
			};
		};

		if (_opts.extraButton !== undefined) {
			extraButton = _opts.extraButton.text;
			extraButtonCall = _opts.extraButton.call;
		};
		this.modalPanelData.push(new GUIModalPanelData(GUI.MODALTYPE_CONFIRMATION, { title: _title, text: _text, buttons: _buttons, eventHandler: _eventHandler }));
		if (this.modalPanel != null) this.RemoveModalContent();
		GUI.ConfirmationPanelIds++;
		confirmationPanel = new Panel("confirmation_" + GUI.ConfirmationPanelIds, _title, Panel.TYPE_MODAL, HdlConfirmationPanel);
		h += '<div class="header">' + _title.HtmlEntities() + '</div>';
		h += '<div class="confirmation">';
		if (i18x.IsHTML(_text)) {
			txt = _text.I18xTrans();
		} else {
			txt = _text.HtmlEntities();
		};
		h += '<div class="text"' + ((_opts.textExtraStyle === undefined) ? "" : ' style="' + _opts.textExtraStyle + '"') + '>' + txt + '</div>';
		h += '</div>';
		h += GUI.ModalButtonsHTML(_buttons, NOFUNCTION, extraButton);
		confirmationPanel.contentDiv.innerHTML = h;
		this.ShowModalPanel(confirmationPanel);
	}

	/** Running counter used to generate unique alert panel ids. */
	static AlertPanelIds = 0;
	/** Shows a modal alert dialog with an error icon and OK button.
	 * @param {string} _title Dialog title.
	 * @param {string} _text Dialog body text.
	 * @param {function|null} _eventHandler Callback receiving { button: GUI.MODALBUTTON_OK } (null for no callback).
	 */
	ShowAlert(_title, _text, _eventHandler) {
		var h = "", oo = document.getElementById("overlay"), om = document.getElementById("modalcontent"), alertPanel, self = this, smartscroll = null;

		function HdlButton(_ev, _this) {
			PlaySound("ok");
			self.RemoveModalContent();
			self.modalPanelData.pop();
			if (_eventHandler != null) _eventHandler({ button: GUI.ModalButtonIds[_this.id] });
			self.PerhapsReshowPreviousModalPanel();
		};

		function HdlAlertPanel(_ev) {
			var o;
			switch (_ev.type) {
				case Panel.EVENTTYPE_APPEARSINDOM:
					GUI.ModalButtonEventsSetUp(self, HdlButton);
					break;
				case Panel.EVENTTYPE_WILLREMOVEDFROMDOM:
					smartscroll = alertPanel.RemoveScrollArea(smartscroll);
					break;
				case Panel.EVENTTYPE_SIZECHANGED:
					setTimeout(UpdateUpScrollArea, 1000);
					smartscroll = alertPanel.SetUpScrollArea(smartscroll, "scrollarea", true, "80vh");
					break;
			};
		};

		function UpdateUpScrollArea() {
			smartscroll = alertPanel.SetUpScrollArea(smartscroll, "scrollarea", true, "80vh");
		};

		console.error("ALERT:", _title, _text);
		this.modalPanelData.push(new GUIModalPanelData(GUI.MODALTYPE_ALERT, { title: _title, text: _text, eventHandler: _eventHandler }));
		if (this.modalPanel != null) this.RemoveModalContent();
		GUI.AlertPanelIds++;
		alertPanel = new Panel("alert_" + GUI.AlertPanelIds, _title, Panel.TYPE_MODAL, HdlAlertPanel);
		h += '<div class="header alert">' + _title.HtmlEntities() + '</div>';
		h += '<div class="alert">';
		h += '<div class="icon"></div>';
		h += '<div class="text scrollArea" id="scrollarea">' + _text.HtmlEntities() + '</div>';
		h += '</div>';
		h += GUI.ModalButtonsHTML(GUI.MODALBUTTONSET_ONLYOK, curGUI.RemoveModalContent);
		alertPanel.contentDiv.innerHTML = h;
		this.ShowModalPanel(alertPanel);
		PlaySound("error");
	}

	/** Running counter used to generate unique info panel ids. */
	static InfoPanelIds = 0;
	/** Shows a modal info dialog with an info icon and OK button.
	 * @param {string} _title Dialog title.
	 * @param {string} _text Dialog body text.
	 * @param {function|null} [_eventHandler=null] Callback receiving { button: GUI.MODALBUTTON_OK }.
	 * @param {boolean} [_isHTMLText=false] When true, _text is inserted as HTML instead of escaped text.
	 * @param {Object} [_opts={}] Extra options (extraButton: { text, call }).
	 */
	ShowInfo(_title, _text, _eventHandler = null, _isHTMLText = false, _opts = {}) {
		var h = "", oo = document.getElementById("overlay"), om = document.getElementById("modalcontent"), infoPanel, self = this, smartscroll = null, extraButtonCall = NOFUNCTION, extraButton = null;

		function HdlButton(_ev, _this) {
			switch (_this.id) {
				case "modalOkButton":
					PlaySound("ok");
					break;
				case "modalExtraButton":
					PlaySound("yes");
					extraButtonCall();
					return;
					break;
			};
			self.RemoveModalContent();
			self.modalPanelData.pop();
			if (_eventHandler !== null) _eventHandler({ button: GUI.ModalButtonIds[_this.id] });
			self.PerhapsReshowPreviousModalPanel();
		};

		function HdlInfoPanel(_ev) {
			var o;
			switch (_ev.type) {
				case Panel.EVENTTYPE_APPEARSINDOM:
					GUI.ModalButtonEventsSetUp(self, HdlButton);
					break;
				case Panel.EVENTTYPE_WILLREMOVEDFROMDOM:
					smartscroll = infoPanel.RemoveScrollArea(smartscroll);
					break;
				case Panel.EVENTTYPE_SIZECHANGED:
					setTimeout(UpdateUpScrollArea, 1000);
					smartscroll = infoPanel.SetUpScrollArea(smartscroll, "scrollarea", true, "80vh");
					break;
			};
		};

		function UpdateUpScrollArea() {
			smartscroll = infoPanel.SetUpScrollArea(smartscroll, "scrollarea", true, "80vh");
		};

		if (_opts.extraButton !== undefined) {
			extraButton = _opts.extraButton.text;
			extraButtonCall = _opts.extraButton.call;
		};
		//log("ShowInfo:",_title,_text);
		this.modalPanelData.push(new GUIModalPanelData(GUI.MODALTYPE_INFO, { title: _title, text: _text, eventHandler: _eventHandler, isHTMLText: _isHTMLText }));
		if (this.modalPanel != null) this.RemoveModalContent();
		GUI.InfoPanelIds++;
		infoPanel = new Panel("info_" + GUI.InfoPanelIds, _title, Panel.TYPE_MODAL, HdlInfoPanel);
		h += '<div class="header">' + _title.HtmlEntities() + '</div>';
		h += '<div class="info">';
		h += '<div class="icon"></div>';
		h += '<div class="text scrollArea" id="scrollarea">' + (_isHTMLText ? _text : _text.HtmlEntities()) + '</div>';
		h += '</div>';
		h += GUI.ModalButtonsHTML(GUI.MODALBUTTONSET_ONLYOK, curGUI.RemoveModalContent, extraButton);
		infoPanel.contentDiv.innerHTML = h;
		this.ShowModalPanel(infoPanel);
		PlaySound("confirm");
	}

	/** onerror handler for slideshow images (currently a no-op placeholder). */
	static SlideShowImageError() {
	}

	/** Shows a full-screen image slideshow in the modal overlay.
	 * @param {string} _title Document title for the slideshow (reserved).
	 * @param {Object} _imageList Image list object with an images array ({ url, title, width, height, thumbnailUrl, thumbnailWidth, thumbnailHeight }).
	 * @param {Object} [_opts={}] SmartScroll options (defaults to globalThis.SYSTEM_SMARTSCROLL_STD_DOCUMENT).
	 */
	OverlaySlideShow(_title, _imageList, _opts = {}) {
		var oo = document.getElementById("overlay"), om = document.getElementById("modalcontent"), h = "", images;
		var pageNo, noOfPages = 0;

		if (this.modalPanel != null) this.RemoveModalContent();
		oo.className = oo.className.removeClass("hidden");
		om.className = om.className.removeClass("hidden");
		om.className = om.className.addClass("wait");
		if (_opts == {}) _opts = globalThis.SYSTEM_SMARTSCROLL_STD_DOCUMENT;

		h += '<div id="slideshow" class="slideshowimages" ';
		h += ' data-doctitle="';
		//h+="Test Image <no/>".I18xTrans({no:1}).HtmlEntities();
		h += '">';
		images = _imageList.images;
		noOfPages = images.length;
		for (pageNo = 0; pageNo < noOfPages; pageNo++) {
			h += '<img style="display:none;width:' + images[pageNo].width + 'px;height:' + images[pageNo].height + 'px;" id="slideshowimage_' + pageNo + '" class="slideshowimage loading"';
			if (pageNo == 0) {
				h += ' src="' + images[pageNo].url + '"';
			} else {
				h += ' data-src="' + images[pageNo].url + '"';
			};
			h += ' data-imgtitle="' + images[pageNo].title.HtmlEntities() + '" data-thumbnail-src="' + images[pageNo].thumbnailUrl + '" data-thumbnail-width="' + images[pageNo].thumbnailWidth + '" data-thumbnail-height="' + images[pageNo].thumbnailHeight + '" onload="';
			h += 'this.className=this.className.removeClass(\'loading\');';
			//if(pageNo==_opts.startPageNo)h+=AutoSmartScrollHTMLOnLoadJS("slideshow",_opts);
			if (pageNo == 0) h += AutoSmartScrollHTMLOnLoadJS("slideshow", _opts);
			h += '" onerror="GUI.SlideShowImageError();" ';
			h += '/>';
		};
		h += '</div>';
		h += GUI.ButtonHTML("slideshowcloser", false, 'icon-cancel-circle', "curGUI.RemoveModalContent()", { butclass: "button bigicon modalcloser", tooltip: '...close image view...<info context="player gui button"/>'.I18xTrans() });

		om.innerHTML = h;
		this.modalMode = true;
	}

	/** Shows a modal progress panel (not yet implemented). */
	ProgressPanel(_title, _startText, _minValue, _maxValue) {
	}

	/** Updates the text of the active progress panel (not yet implemented). */
	ChangeProgressText(_text) {
	}

	/** Updates the current value of the active progress panel (not yet implemented). */
	ChangeProgressValue(_value) {
	}

	/** Updates the maximum value of the active progress panel (not yet implemented). */
	ChangeProgressMaxValue(_maxValue) {
	}

}


// ===========================================
// GLOBAL BINDINGS
// The GUI HTML generators emit inline event handlers (onmousedown="...",
// onload="..." etc.) which run in global scope, so the classes must be
// reachable via window. curGUI is exposed read-only the same way.
// ===========================================
if (typeof window !== 'undefined') {
	window.GUIParticles = GUIParticles;
	window.Menu = Menu;
	window.Panel = Panel;
	window.TabView = TabView;
	window.TabViews = TabViews;
	window.ToolBarButton = ToolBarButton;
	window.ToolBarGroup = ToolBarGroup;
	window.ToolBar = ToolBar;
	window.TreeViewEntry = TreeViewEntry;
	window.TreeView = TreeView;
	window.PanelContainer = PanelContainer;
	window.GUI = GUI;
	Object.defineProperty(window, 'curGUI', { get: () => curGUI, configurable: true });
	Object.defineProperty(window, 'GUIS', { get: () => GUIS, configurable: true });
}

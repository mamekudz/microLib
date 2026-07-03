// Minimal browser global stubs so µLib modules can be smoke-tested under plain Node.
class StorageStub {
	constructor() { this._data = {}; }
	getItem(_k) { return Object.prototype.hasOwnProperty.call(this._data, _k) ? this._data[_k] : null; }
	setItem(_k, _v) { this._data[_k] = String(_v); }
	removeItem(_k) { delete this._data[_k]; }
	clear() { this._data = {}; }
	key(_i) { return Object.keys(this._data)[_i] ?? null; }
	get length() { return Object.keys(this._data).length; }
}

const elementStub = () => ({
	style: {}, dataset: {}, className: "", innerHTML: "", value: "",
	appendChild() { }, removeChild() { }, setAttribute() { }, getAttribute() { return null; },
	addEventListener() { }, removeEventListener() { }
});

if (typeof globalThis.Storage === 'undefined') globalThis.Storage = StorageStub;
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
if (typeof globalThis.document === 'undefined') globalThis.document = {
	getElementById() { return null; },
	createElement() { return elementStub(); },
	createTreeWalker() { return { nextNode() { return null; } }; },
	body: elementStub(),
	location: { href: "http://localhost/", search: "" },
	cookie: ""
};
if (typeof globalThis.location === 'undefined') globalThis.location = { href: "http://localhost/", search: "", hostname: "localhost", protocol: "http:" };
if (typeof globalThis.localStorage === 'undefined') Object.defineProperty(globalThis, 'localStorage', { value: new StorageStub(), configurable: true });
if (typeof globalThis.sessionStorage === 'undefined') Object.defineProperty(globalThis, 'sessionStorage', { value: new StorageStub(), configurable: true });
if (typeof globalThis.navigator === 'undefined' || !globalThis.navigator.language) {
	Object.defineProperty(globalThis, 'navigator', { value: { language: "en-US", languages: ["en-US"], userAgent: "node", platform: "node" }, configurable: true });
}
if (typeof globalThis.XMLHttpRequest === 'undefined') globalThis.XMLHttpRequest = class { open() { } send() { } setRequestHeader() { } };

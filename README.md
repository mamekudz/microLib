# µLib™

**[English (US)](#english-us)** · **[Deutsch](#deutsch)**

---

<a id="english-us"></a>

# English (US)

**µLib™** is a modular JavaScript library system written in ES6 (`.mjs` modules) for web applications. The modules interlock and together form a lightweight application framework — from string, date and object utilities through sound, sprites and E-Ink rendering up to a complete panel/window GUI system. µLib™ supports **µCSS 2.5** and the **i18xe** localization engine and is used in the **Oxyd** project, among others.

© 1996–2026 Meinolf Amekudzi · Published under the [MIT license](#license)

---

## Features

- **Pure ES6 modules (`.mjs`)** — no build step required, usable directly in the browser via `import`
- **Built-in internationalization** through the i18xe engine (`i18x.mjs`), fallback: American English (`en-US`)
- **Complete GUI system** (`GUI.mjs`): panels, docking workspaces, menus, tab views, tool bars, tree views, modal dialogs and an extensive set of input controls
- **Version history via `releases.json`** with automatic i18xe registration of the release info texts and formatted console output
- **Prototype extensions** for `String`, `Number`, `Date`, `Array`, `Boolean`, `Math`, `JSON` and `Storage` — importable as side-effect modules
- **HTML API reference** generated from JSDoc comments in `src/µLib/` (`npm run docs`)

---

## Getting Started

µLib™ lives in the project as the module folder `src/µLib/` (in the distribution package directly as `µLib/`). The modules are imported relative to your own application — e.g. from an `app.mjs` located next to the `µLib/` folder:

```javascript
// class modules (default export)
import Config from "./µLib/Config.mjs";
import i18x from "./µLib/i18x.mjs";
import System from "./µLib/System.mjs";
import { GUI, Panel, Menu } from "./µLib/GUI.mjs";

// side-effect modules (prototype extensions)
import "./µLib/StringUtils.mjs";
import "./µLib/DateUtils.mjs";
import "./µLib/ArrayUtils.mjs";
import "./µLib/StorageUtils.mjs";
```

> **Note:** `i18x.mjs` should be imported before modules that use its string extensions (`I18xTrans`, `I18xRegister`, …) at load time.

---

## Module Overview

| Module | Description |
| --- | --- |
| `ArrayUtils.mjs` | `Array` extensions (searching, moving, set operations, Base64) |
| `BooleanUtils.mjs` | `Boolean` extensions (`asString`, `asNumber`) |
| `CodeScanners.mjs` | Barcode/code scanner integration |
| `Config.mjs` | Application configuration, audio settings, release/version management |
| `DateUtils.mjs` | `Date`/ticks extensions, holiday calculation |
| `EInk.mjs` / `EInkDef.mjs` | Rendering and definitions for E-Ink displays |
| `GeolocationPositionUtils.mjs` | Distance and position calculations for geolocation |
| `GUI.mjs` | Panel/workspace GUI system with menus, tab views, tool bars, tree views and input controls |
| `i18x.mjs` | i18xe localization engine: translation, formats, language/culture management |
| `ImageUtils.mjs` | Image processing and conversion |
| `JSONProtocol.mjs` / `JSONUtils.mjs` | JSON protocol helpers and extended (de-)serialization |
| `MathUtils.mjs` / `MathAniUtils.mjs` | `Math` extensions, random and animation/easing functions |
| `Musics.mjs` / `Sounds.mjs` / `SoundTools.mjs` | Music, sound and audio tools (WebAudio) |
| `NumberUtils.mjs` | `Number` extensions (formatting, padding) |
| `ObjectUtils.mjs` | Object tools (clone, merge, sorting, key access) |
| `RESTX.mjs` | Extended XMLHttpRequest for REST communication |
| `Speech.mjs` | Speech output |
| `SpriteTools.mjs` | Sprite processing and animation |
| `StorageUtils.mjs` | `localStorage`/`sessionStorage` extensions with app/client scopes |
| `StringUtils.mjs` | `String` extensions (HtmlEntities, MD5, compression, CSS class lists and much more) |
| `System.mjs` | Browser/platform detection and system environment |
| `User.mjs` / `Users.mjs` | User and role management |
| `Utils.mjs` | General helpers (JSON/text loading, `debounce`) |
| `WebUtils.mjs` | GET parameters, cookies, file loading |

---

## Internationalization (i18xe)

All GUI texts run through the i18xe engine. Texts are registered with a context and translated at runtime:

```javascript
import i18x from "./µLib/i18x.mjs";

let text = 'Save<context="button text"/>'.I18xTrans();
```

The default fallback is American English (`en-US`).

---

## Version History

The version history lives as [`releases.json`](./releases.json) in the project root (newest version first):

```json
[
	{
		"main": 0, "minor": 9, "revision": 0, "date": "2026-07-02 16:00", "beta": true,
		"info": [
			"Completed the ES module conversion ..."
		]
	}
]
```

Loading, automatic i18xe registration of the info texts and console output:

```javascript
import Config from "./µLib/Config.mjs";

await Config.LoadReleases();                    // loads ./releases.json
console.log(Config.GetCurrentVersionString());  // e.g. "V0.9.0β"
console.log(Config.GetReleasesConsoleString()); // formatted history as string
```

---

## GUI Quick Start

```javascript
import { GUI, Panel } from "./µLib/GUI.mjs";

let gui = new GUI("main", "My App");
let panel = new Panel("tools", 'Tools<context="panel title"/>');
gui.AddPanel(panel);
gui.Activate();
```

Since the GUI generators emit inline event handlers, `GUI.mjs` automatically binds its classes to `window`.

---

## API Documentation (JSDoc)

The modules in `src/µLib/` are documented with JSDoc (American English). To generate the HTML reference locally:

```bash
npm install          # devDependencies (once)
npm run docs         # gulp BUILD_DOCS → docs/api/
```

Then open `docs/api/index.html` in a browser. The generated output (`docs/api/`) is gitignored — regenerate it after source changes. Configuration: `jsdoc.config.json`, home page: `docs/JSDOC.md`.

After pushing to `main`, [GitHub Actions](.github/workflows/docs.yml) publishes the docs to **https://mamekudz.github.io/microLib/** (requires GitHub Pages source set to *GitHub Actions* in the repository settings).

---

## Packaging (Build)

µLib™ is directly usable without any build. For releases, the Gulp build system (`gulpfile.mjs`) additionally creates a **minimized distribution**:

```bash
npm install          # devDependencies (once)
npm run dist         # minimized modules into dist/µLib/
npm run package      # build dist/ + zip artifact into packages/
npm run build        # full run (clean + package)
npm run docs         # HTML API reference into docs/api/
npm run history      # version history (releases.json) in the console
```

The pipeline per module: [`gulp-mu-build-filter`](https://www.npmjs.com/package/gulp-mu-build-filter) (resolve build-type areas) → [`gulp-mu-js-cleanup`](https://www.npmjs.com/package/gulp-mu-js-cleanup) (strip comments/log calls) → `gulp-terser` (ESM minimization) → copyright/version banner → **`*.min.mjs`** file names with matching import paths. Every module is minimized **individually** — the ESM structure is preserved.

The release zip contains minimized modules only, e.g. `import Config from "./µLib/Config.min.mjs";`. Development uses the readable sources under `src/µLib/*.mjs`.

`releases.json` is the single source of the version: `BUILD_PACKAGE` stamps the current version into `package.json` and the artifact name (e.g. `microlib_V0.9.0_beta.zip`). The gulpfile carries µGulp metadata (`µDisplayName`, `µGroup`, …) and runs both in the µGulp dashboard and with the classic Gulp CLI.

---

## Status

µLib™ is migrating from a classic script library to pure ES6 modules. The core set (including `GUI.mjs`) is fully converted. Some legacy helpers (button input system, SmartScroll and others) are currently still resolved at runtime via `globalThis` and will receive their own modules in the future.

---

<a id="license"></a>

## License

MIT license · © 1996–2026 Meinolf Amekudzi

**µLib™** is a trademark of Meinolf Amekudzi. The brand name must always be written with the ™ suffix.

---

<a id="deutsch"></a>

# Deutsch

**µLib™** ist ein modulares JavaScript-Bibliothekssystem in ES6 (`.mjs`-Module) für Web-Anwendungen. Die Module greifen ineinander und bilden zusammen ein leichtgewichtiges Anwendungs-Framework — von String-, Datums- und Objekt-Utilities über Sound, Sprites und E-Ink-Rendering bis hin zu einem vollständigen Panel-/Fenster-GUI-System. µLib™ unterstützt **µCSS 2.5** und die **i18xe**-Lokalisierungs-Engine und wird u. a. im Projekt **Oxyd** eingesetzt.

© 1996–2026 Meinolf Amekudzi · Veröffentlicht unter der [MIT-Lizenz](#lizenz)

---

## Merkmale

- **Reine ES6-Module (`.mjs`)** — keine Build-Pflicht, direkt im Browser per `import` nutzbar
- **Integrierte Internationalisierung** über die i18xe-Engine (`i18x.mjs`), Fallback: American English (`en-US`)
- **Vollständiges GUI-System** (`GUI.mjs`): Panels, Docking-Workspaces, Menüs, TabViews, ToolBars, TreeViews, modale Dialoge und ein umfangreicher Satz an Eingabe-Steuerelementen
- **Versionshistorie per `releases.json`** mit automatischer i18xe-Registrierung der Release-Infos und aufbereiteter Konsolen-Ausgabe
- **Prototype-Erweiterungen** für `String`, `Number`, `Date`, `Array`, `Boolean`, `Math`, `JSON` und `Storage` — als Side-Effect-Module importierbar
- **HTML-API-Referenz** aus JSDoc-Kommentaren in `src/µLib/` (`npm run docs`)

---

## Einbindung

µLib™ liegt als Modulordner `src/µLib/` im Projekt (im Distributionspaket direkt als `µLib/`). Die Module werden relativ zur eigenen Anwendung importiert — z. B. aus einer `app.mjs`, die neben dem `µLib/`-Ordner liegt:

```javascript
// Klassen-Module (default export)
import Config from "./µLib/Config.mjs";
import i18x from "./µLib/i18x.mjs";
import System from "./µLib/System.mjs";
import { GUI, Panel, Menu } from "./µLib/GUI.mjs";

// Side-Effect-Module (Prototype-Erweiterungen)
import "./µLib/StringUtils.mjs";
import "./µLib/DateUtils.mjs";
import "./µLib/ArrayUtils.mjs";
import "./µLib/StorageUtils.mjs";
```

> **Hinweis:** `i18x.mjs` sollte vor Modulen importiert werden, die dessen String-Erweiterungen (`I18xTrans`, `I18xRegister`, …) zur Ladezeit verwenden.

---

## Modulübersicht

| Modul | Beschreibung |
| --- | --- |
| `ArrayUtils.mjs` | `Array`-Erweiterungen (Suchen, Verschieben, Mengenoperationen, Base64) |
| `BooleanUtils.mjs` | `Boolean`-Erweiterungen (`asString`, `asNumber`) |
| `CodeScanners.mjs` | Barcode-/Code-Scanner-Anbindung |
| `Config.mjs` | Anwendungs-Konfiguration, Audio-Einstellungen, Release-/Versionsverwaltung |
| `DateUtils.mjs` | `Date`-/Ticks-Erweiterungen, Feiertagsberechnung |
| `EInk.mjs` / `EInkDef.mjs` | Rendering und Definitionen für E-Ink-Anzeigen |
| `GeolocationPositionUtils.mjs` | Distanz- und Positionsberechnungen für Geolocation |
| `GUI.mjs` | Panel-/Workspace-GUI-System mit Menüs, TabViews, ToolBars, TreeViews und Eingabe-Steuerelementen |
| `i18x.mjs` | i18xe-Lokalisierungs-Engine: Übersetzung, Formate, Sprach-/Kulturverwaltung |
| `ImageUtils.mjs` | Bildverarbeitung und -konvertierung |
| `JSONProtocol.mjs` / `JSONUtils.mjs` | JSON-Protokoll-Helfer und erweitertes (De-)Serialisieren |
| `MathUtils.mjs` / `MathAniUtils.mjs` | `Math`-Erweiterungen, Zufalls- und Animations-/Easing-Funktionen |
| `Musics.mjs` / `Sounds.mjs` / `SoundTools.mjs` | Musik-, Sound- und Audio-Werkzeuge (WebAudio) |
| `NumberUtils.mjs` | `Number`-Erweiterungen (Formatierung, Padding) |
| `ObjectUtils.mjs` | Objekt-Werkzeuge (Clone, Merge, Sortierung, Key-Zugriffe) |
| `RESTX.mjs` | Erweiterter XMLHttpRequest für REST-Kommunikation |
| `Speech.mjs` | Sprachausgabe |
| `SpriteTools.mjs` | Sprite-Verarbeitung und -Animation |
| `StorageUtils.mjs` | `localStorage`/`sessionStorage`-Erweiterungen mit App-/Client-Ebenen |
| `StringUtils.mjs` | `String`-Erweiterungen (HtmlEntities, MD5, Kompression, CSS-Klassenlisten u. v. m.) |
| `System.mjs` | Browser-/Plattform-Erkennung und Systemumgebung |
| `User.mjs` / `Users.mjs` | Benutzer- und Rollenverwaltung |
| `Utils.mjs` | Allgemeine Helfer (JSON-/Text-Laden, `debounce`) |
| `WebUtils.mjs` | GET-Parameter, Cookies, Datei-Laden |

---

## Internationalisierung (i18xe)

Alle GUI-Texte laufen über die i18xe-Engine. Texte werden mit Kontext registriert und zur Laufzeit übersetzt:

```javascript
import i18x from "./µLib/i18x.mjs";

let text = 'Save<context="button text"/>'.I18xTrans();
```

Der Standard-Fallback ist amerikanisches Englisch (`en-US`).

---

## Versionshistorie

Die Versionshistorie liegt als [`releases.json`](./releases.json) im Projekt-Root (neueste Version zuerst):

```json
[
	{
		"main": 0, "minor": 9, "revision": 0, "date": "2026-07-02 16:00", "beta": true,
		"info": [
			"Completed the ES module conversion ..."
		]
	}
]
```

Laden, automatische i18xe-Registrierung der Info-Texte und Ausgabe in der Konsole:

```javascript
import Config from "./µLib/Config.mjs";

await Config.LoadReleases();                    // lädt ./releases.json
console.log(Config.GetCurrentVersionString());  // z. B. "V0.9.0β"
console.log(Config.GetReleasesConsoleString()); // aufbereitete Historie als String
```

---

## GUI-Schnellstart

```javascript
import { GUI, Panel } from "./µLib/GUI.mjs";

let gui = new GUI("main", "My App");
let panel = new Panel("tools", 'Tools<context="panel title"/>');
gui.AddPanel(panel);
gui.Activate();
```

Da die GUI-Generatoren Inline-Event-Handler erzeugen, bindet `GUI.mjs` seine Klassen automatisch an `window`.

---

## API-Dokumentation (JSDoc)

Die Module unter `src/µLib/` sind mit JSDoc dokumentiert (American English). HTML-Referenz lokal erzeugen:

```bash
npm install          # devDependencies (einmalig)
npm run docs         # gulp BUILD_DOCS → docs/api/
```

Anschließend `docs/api/index.html` im Browser öffnen. Die generierte Ausgabe (`docs/api/`) ist gitignored — nach Quelländerungen neu erzeugen. Konfiguration: `jsdoc.config.json`, Startseite: `docs/JSDOC.md`.

Nach Push auf `main` veröffentlicht [GitHub Actions](.github/workflows/docs.yml) die Docs unter **https://mamekudz.github.io/microLib/** (Repository-Einstellung: GitHub Pages-Quelle *GitHub Actions*).

---

## Paketisierung (Build)

µLib™ ist ohne Build direkt nutzbar. Für Veröffentlichungen erzeugt das Gulp-Build-System (`gulpfile.mjs`) zusätzlich eine **minimierte Distribution**:

```bash
npm install          # devDependencies (einmalig)
npm run dist         # minimierte Module nach dist/µLib/
npm run package      # dist/ bauen + Zip-Artefakt nach packages/
npm run build        # kompletter Durchlauf (clean + package)
npm run docs         # HTML-API-Referenz nach docs/api/
npm run history      # Versionshistorie (releases.json) in der Konsole
```

Die Pipeline pro Modul: [`gulp-mu-build-filter`](https://www.npmjs.com/package/gulp-mu-build-filter) (Build-Typ-Bereiche auflösen) → [`gulp-mu-js-cleanup`](https://www.npmjs.com/package/gulp-mu-js-cleanup) (Kommentare/Log-Aufrufe entfernen) → `gulp-terser` (ESM-Minimierung) → Copyright-/Versions-Banner → Dateinamen **`*.min.mjs`** mit passenden Importpfaden. Jedes Modul wird **einzeln** minimiert — die ESM-Struktur bleibt erhalten.

Das Release-Zip enthält nur minimierte Module, z. B. `import Config from "./µLib/Config.min.mjs";`. Für die Entwicklung gelten die lesbaren Quellen unter `src/µLib/*.mjs`.

`releases.json` ist die einzige Versionsquelle: `BUILD_PACKAGE` stempelt die aktuelle Version in `package.json` und den Artefaktnamen (z. B. `microlib_V0.9.0_beta.zip`). Das Gulpfile trägt µGulp-Metadaten (`µDisplayName`, `µGroup`, …) und läuft sowohl im µGulp-Dashboard als auch mit der klassischen Gulp-CLI.

---

## Status

µLib™ befindet sich in der Migration von einer klassischen Skript-Bibliothek zu reinen ES6-Modulen. Der Kernbestand (inkl. `GUI.mjs`) ist vollständig konvertiert. Einzelne Legacy-Helfer (Button-Eingabesystem, SmartScroll u. a.) werden derzeit noch zur Laufzeit über `globalThis` aufgelöst und erhalten künftig eigene Module.

---

<a id="lizenz"></a>

## Lizenz

MIT-Lizenz · © 1996–2026 Meinolf Amekudzi

**µLib™** ist eine Marke von Meinolf Amekudzi. Der Markenname ist stets mit dem Zusatz ™ zu führen.

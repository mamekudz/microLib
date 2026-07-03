//===============================================================
// µLib™ library package builder gulp script
// © 1996-2026 Meinolf Amekudzi
//
// how to use:
// gulp CLEAN                 => remove tmp/, dist/ and packages/
// gulp BUILD_DIST            => build the minimized distribution into dist/
// gulp BUILD_PACKAGE         => build dist/ and zip it into packages/
// gulp SHOW_VERSION_HISTORY  => print the formatted release history (releases.json)
// gulp BUILD_ALL             => clean + package
// (or: npm run clean / npm run dist / npm run package / npm run history / npm run build)
//
// Versioning: releases.json at the project root is the single source of truth
// (main/minor/revision/date/beta plus i18xe-translatable info strings).
// BUILD_PACKAGE stamps that version into package.json and the artifact name.
//
// Pipeline per module (µLib/*.mjs):
//   gulp-mu-build-filter  => resolves @<BUILD_ONLY_AT_RELEASES:...> areas (Production)
//   gulp-mu-js-cleanup    => strips comments, empty lines and stray log() calls
//   gulp-terser           => minimizes the ES module (module mode)
//   gulp-inject-string    => prepends the copyright/version banner
//
// The file is a plain ESM module exporting task functions with µGulp
// metadata tags — it runs under the µGulp dashboard, the gulp CLI and
// plain node alike. Heavy modules (gulp, terser, ...) are loaded via
// "await import()" inside the task bodies (µGulp preload rule).
//===============================================================

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { finished } from 'node:stream/promises';
import fs from 'node:fs';

const PROJECT_ROOT = dirname(fileURLToPath(import.meta.url));
const TMP_PATH = join(PROJECT_ROOT, 'tmp');
const DIST_PATH = join(PROJECT_ROOT, 'dist');
const PACKAGES_PATH = join(PROJECT_ROOT, 'packages');
const RELEASES_FILE = join(PROJECT_ROOT, 'releases.json');

const BUILD = 'Production';
const CLIENT = 'std';

// Library sources going through the minimize pipeline.
const LIB_GLOBS = [
	'src/µLib/*.mjs',
];

// Files copied 1:1 next to the minimized modules.
const DIST_EXTRAS = [
	'releases.json',
	'README.md',
];

function _GetCurrentRelease() {
	let releases = JSON.parse(fs.readFileSync(RELEASES_FILE, 'utf8'));
	if (!Array.isArray(releases) || releases.length == 0) throw new Error('releases.json is empty or invalid.');
	return releases[0];
}

function _GetVersionString(_release) {
	return _release.main + '.' + _release.minor + '.' + _release.revision;
}

function _GetBanner(_release) {
	let versionString = 'V' + _GetVersionString(_release) + (_release.beta ? 'ß' : '');
	return '/* µLib™ ' + versionString + ' © 1996-2026 Meinolf Amekudzi, ' + Date() + ' */\n';
}

// ---------------------------------------------------------------
// CLEAN
// ---------------------------------------------------------------

export async function CLEAN() {
	for (let folder of [TMP_PATH, DIST_PATH, PACKAGES_PATH]) {
		if (fs.existsSync(folder)) {
			fs.rmSync(folder, { recursive: true, force: true });
			console.log('removed ' + folder);
		}
	}
	console.log('clean done.');
}
CLEAN.µDisplayName = 'Clean Output';
CLEAN.µDescription = 'Removes tmp/, dist/ and packages/ (write lock: must run exclusively).';
CLEAN.µIcon = '\u2716';
CLEAN.µGroup = 'Build/Maintenance';
CLEAN.µExecutionConcurrency = false;

// ---------------------------------------------------------------
// BUILD_DIST
// ---------------------------------------------------------------

export async function BUILD_DIST() {
	let release = _GetCurrentRelease();
	let versionString = _GetVersionString(release);
	console.log('building minimized distribution V' + versionString + (release.beta ? 'ß' : '') + ' -> ' + DIST_PATH);

	// Heavy pipeline modules — loaded only when needed (µGulp preload rule).
	const { default: gulp } = await import('gulp');
	const { default: mubuildfilter } = await import('gulp-mu-build-filter');
	const { default: mujscleanup } = await import('gulp-mu-js-cleanup');
	const { default: gulpTerser } = await import('gulp-terser');
	const { default: inject } = await import('gulp-inject-string');

	fs.rmSync(DIST_PATH, { recursive: true, force: true });

	// 1. minimize pipeline: build filter -> cleanup -> terser -> banner
	await finished(
		gulp.src(LIB_GLOBS, { cwd: PROJECT_ROOT })
			.pipe(mubuildfilter({ release: BUILD, client: CLIENT, version: release.main + '.' + release.minor }))
			.pipe(mujscleanup(BUILD == 'Production', false))
			.pipe(gulpTerser({ module: true }).on('error', function (_error) {
				console.log('terser error:', _error.message);
				throw _error;
			}))
			.pipe(inject.prepend(_GetBanner(release)))
			.pipe(gulp.dest(join(DIST_PATH, 'µLib')))
	);
	console.log('minimized modules -> ' + join(DIST_PATH, 'µLib'));

	// 2. copy the accompanying files
	for (let extra of DIST_EXTRAS) {
		let source = join(PROJECT_ROOT, extra);
		if (fs.existsSync(source)) fs.copyFileSync(source, join(DIST_PATH, extra));
	}
	console.log('dist ready.');
}
BUILD_DIST.µDisplayName = 'Build Distribution';
BUILD_DIST.µDescription = 'Builds the minimized µLib™ distribution (build filter, cleanup, terser, banner) into dist/.';
BUILD_DIST.µTooltip = 'Every µLib/*.mjs module is minimized individually — the ESM structure stays untouched.';
BUILD_DIST.µIcon = '\u25A3';
BUILD_DIST.µGroup = 'Build';
BUILD_DIST.µExecutionConcurrency = false;

// ---------------------------------------------------------------
// BUILD_PACKAGE
// ---------------------------------------------------------------

export async function BUILD_PACKAGE() {
	let release = _GetCurrentRelease();
	let versionString = _GetVersionString(release);

	// releases.json is the version source of truth — keep package.json in sync.
	let manifestPath = join(PROJECT_ROOT, 'package.json');
	let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
	if (manifest.version !== versionString) {
		manifest.version = versionString;
		fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, '\t') + '\n');
		console.log('package.json version synced to ' + versionString + ' (from releases.json)');
	}

	await BUILD_DIST();

	// The staged manifest must not carry dev-only fields; inside dist/ the
	// library lives at µLib/ (not src/µLib/), so the files list is rewritten.
	let stagedManifest = { ...manifest };
	delete stagedManifest.devDependencies;
	delete stagedManifest.scripts;
	stagedManifest.files = ['µLib', 'releases.json', 'README.md'];
	fs.writeFileSync(join(DIST_PATH, 'package.json'), JSON.stringify(stagedManifest, null, '\t') + '\n');

	let packageName = 'microlib_V' + versionString + (release.beta ? '_beta' : '') + '.zip';
	console.log('building ' + packageName + ' package...');

	const { default: gulp } = await import('gulp');
	const { default: zip } = await import('gulp-zip');

	fs.mkdirSync(PACKAGES_PATH, { recursive: true });
	await finished(
		gulp.src('dist/**/*', { cwd: PROJECT_ROOT, base: DIST_PATH, encoding: false })
			.pipe(zip(packageName))
			.pipe(gulp.dest(PACKAGES_PATH))
	);

	let artifactPath = join(PACKAGES_PATH, packageName);
	console.log('created ' + artifactPath);
	console.log('build ready');
	return artifactPath;
}
BUILD_PACKAGE.µDisplayName = 'Build Package';
BUILD_PACKAGE.µDescription = 'Builds dist/ and zips it into packages/ (version stamped from releases.json).';
BUILD_PACKAGE.µTooltip = 'Output goes to packages/. Write-locks the whole project while running.';
BUILD_PACKAGE.µIcon = '\u25C8';
BUILD_PACKAGE.µGroup = 'Build';
BUILD_PACKAGE.µExecutionConcurrency = false;

// ---------------------------------------------------------------
// SHOW_VERSION_HISTORY
// ---------------------------------------------------------------

export async function SHOW_VERSION_HISTORY() {
	let releases = JSON.parse(fs.readFileSync(RELEASES_FILE, 'utf8'));
	let lines = [];
	for (let release of releases) {
		lines.push('V' + _GetVersionString(release) + (release.beta ? 'ß' : '') + ' — ' + release.date);
		for (let info of release.info) lines.push('  - ' + info.replace(/<context="[^"]*"\s*\/>/g, ''));
		lines.push('');
	}
	console.log(lines.join('\n'));
}
SHOW_VERSION_HISTORY.µDisplayName = 'Show Version History';
SHOW_VERSION_HISTORY.µDescription = 'Prints the formatted release history from releases.json to the console.';
SHOW_VERSION_HISTORY.µTooltip = 'Read-only: renders every release (version, date, beta flag, info lines).';
SHOW_VERSION_HISTORY.µIcon = '\u2630';
SHOW_VERSION_HISTORY.µGroup = 'Info';
SHOW_VERSION_HISTORY.µExecutionConcurrency = true;

// ---------------------------------------------------------------
// BUILD_ALL
// ---------------------------------------------------------------

export async function BUILD_ALL() {
	await CLEAN();
	await BUILD_PACKAGE();
	console.log('full build ready.');
}
BUILD_ALL.µDisplayName = 'Build All';
BUILD_ALL.µDescription = 'Full pipeline: clean + minimized distribution + publishable zip package.';
BUILD_ALL.µIcon = '\u2699';
BUILD_ALL.µGroup = 'Build';
BUILD_ALL.µExecutionConcurrency = false;

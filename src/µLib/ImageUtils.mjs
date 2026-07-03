// ===========================================
// ImageUtils.js
// © 1996-2026 Meinolf Amekudzi
// (published under MIT license)
// ===========================================

/** Image helper functions.
 * @module ImageUtils
 */

import ObjectUtils from "./ObjectUtils.mjs";

/** Class with image helper functions.
 * @class ImageUtils
 */
export default class ImageUtils {
	/** Reference to an external EXIF library; must be set by the application to enable EXIF orientation handling (null = disabled). */
	static EXIF = null;

	/** Resize cut mode: no resizing calculation is applied. */
	static IMAGERESIZE_CUTMODE_NONE = 0;
	/** Resize cut mode: the whole image fits inside the box, the box is shrunk to the image aspect ratio (image may be blown up). */
	static IMAGERESIZE_CUTMODE_INSIDE = 1;
	/** Resize cut mode: like INSIDE, but the image is never enlarged beyond its original size. */
	static IMAGERESIZE_CUTMODE_INSIDE_NOBLOWUP = 2;
	/** Resize cut mode: the whole image fits inside the box, remaining box space is kept (filled) and the image is centered. */
	static IMAGERESIZE_CUTMODE_INSIDE_FILL = 3;
	/** Resize cut mode: the image covers the box completely; the resulting size may exceed the box in one dimension. */
	static IMAGERESIZE_CUTMODE_OUTSIDE = 4;
	/** Resize cut mode: like OUTSIDE, but the image is cut to the exact box size at the given cut positions. */
	static IMAGERESIZE_CUTMODE_OUTSIDE_CUT = 5;
	/** Resize cut mode: the image is scaled to the exact box size, ignoring the aspect ratio (image may be distorted). */
	static IMAGERESIZE_CUTMODE_ASPECT = 6;

	/** Resizes an image to fit a given box using one of the IMAGERESIZE_CUTMODE_* modes and returns the result asynchronously via callback.
	 * The callback receives an object {width, height, src, exif} on success or false on error.
	 * @param {Image} _img    Source image element to resize.
	 * @param {function} _callBack    Callback function called with the result object ({width, height, src, exif}) or false on error.
	 * @param {number} [_boxWidth=0]    Target box width in pixels (0 = unlimited).
	 * @param {number} [_boxHeight=0]    Target box height in pixels (0 = unlimited).
	 * @param {string} [_suffix="jpeg"]    Output image format suffix (e.g. "jpeg", "png").
	 * @param {number} [_quality=-1]    Output quality in percent (0-100; -1 = default).
	 * @param {number|boolean} [_cutMode=ImageUtils.IMAGERESIZE_CUTMODE_INSIDE]    One of the IMAGERESIZE_CUTMODE_* constants (false = INSIDE, true = ASPECT).
	 * @param {number} [_cutHorPos=50]    Horizontal cut position in percent (0-100), used by OUTSIDE_CUT mode.
	 * @param {number} [_cutVerPos=50]    Vertical cut position in percent (0-100), used by OUTSIDE_CUT mode.
	 * @param {boolean|string|number} [_bgr=false]    Background fill: false = none, a CSS color string, or true = use the canvas' top-left pixel color.
	 * @param {number} [_maxSize=0]    Maximum output size (0 = unlimited; currently unused).
	 * @param {boolean} [_keepOrgIfPossible=false]    If true, the original image source is kept when the size did not change.
	 */
	static imageResize = function (_img, _callBack, _boxWidth, _boxHeight, _suffix, _quality, _cutMode, _cutHorPos, _cutVerPos, _bgr, _maxSize, _keepOrgIfPossible = false) {
		// _cutHorPos and _cutVerPos are %-values (0-100)
		let img, canvas, ctx, ret = "", orgWidth, orgHeight, cutWidth, cutHeight, k, posX = 0, posY = 0, exifok = false,
			orientation = 1, orgexifdata, resWidth, resHeight, fac, fw, fh;
		if (_boxWidth === undefined) _boxWidth = 0;
		if (_boxHeight === undefined) _boxHeight = 0;
		if (_suffix === undefined) _suffix = "jpeg";
		if (_quality === undefined) _quality = -1;
		if (_cutMode === undefined) _cutMode = ImageUtils.IMAGERESIZE_CUTMODE_INSIDE;
		if (_cutHorPos === undefined) _cutHorPos = 50;
		if (_cutVerPos === undefined) _cutVerPos = 50;
		if (_bgr === undefined) _bgr = false;
		if (_maxSize === undefined) _maxSize = 0;
		
		if (_quality == -1) _quality = 0;
		if (_boxWidth == 0 && _boxHeight != 0) _boxWidth = 9999999;
		if (_boxWidth != 0 && _boxHeight == 0) _boxHeight = 9999999;
		if (_cutMode === false) _cutMode = IMAGERESIZE_CUTMODE_INSIDE;
		if (_cutMode === true) _cutMode = IMAGERESIZE_CUTMODE_ASPECT;
		
		/** Draws an image onto a canvas and scales it down to the configured maximum width.
		 * @param {Image} _img2Scale    Image to scale.
		 * @param {function} _callback    Callback function called with the resulting canvas.
		 */
		function scale2Canvas(_img2Scale, _callback) {
			let canvas = document.createElement('canvas');
			canvas.width = _img2Scale.width;
			canvas.height = _img2Scale.height;
			canvas.getContext('2d').drawImage(_img2Scale, 0, 0, canvas.width, canvas.height);
			while (canvas.width >= (2 * this.config.maxWidth)) canvas = getHalfScaleCanvas(canvas);
			if (canvas.width > this.config.maxWidth) canvas = scaleCanvasWithAlgorithm(canvas);
			if (typeof (_callback) == "function") _callback(canvas);
		}
		
		/** Creates a new canvas with half the size of the given canvas.
		 * @param {HTMLCanvasElement} canvas    Source canvas.
		 * @returns {HTMLCanvasElement}    New canvas scaled to half width and height.
		 */
		function getHalfScaleCanvas(canvas) {
			let halfCanvas = document.createElement('canvas');
			halfCanvas.width = canvas.width / 2;
			halfCanvas.height = canvas.height / 2;
			halfCanvas.getContext('2d').drawImage(canvas, 0, 0, halfCanvas.width, halfCanvas.height);
			return halfCanvas;
		}
		
		/** Scales a canvas to the configured maximum width using bilinear interpolation.
		 * @param {HTMLCanvasElement} canvas    Source canvas.
		 * @returns {HTMLCanvasElement}    New canvas scaled to the maximum width.
		 */
		function scaleCanvasWithAlgorithm(canvas) {
			let scaledCanvas = document.createElement('canvas');
			let scale = this.config.maxWidth / canvas.width;
			let srcImgData, destImgData;
			scaledCanvas.width = canvas.width * scale;
			scaledCanvas.height = canvas.height * scale;
			srcImgData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
			destImgData = scaledCanvas.getContext('2d').createImageData(scaledCanvas.width, scaledCanvas.height);
			applyBilinearInterpolation(srcImgData, destImgData, scale);
			scaledCanvas.getContext('2d').putImageData(destImgData, 0, 0);
			return scaledCanvas;
		}
		
		/** Copies pixel data from a source image data object to a destination image data object using bilinear interpolation.
		 * @param {ImageData} srcCanvasData    Source canvas image data.
		 * @param {ImageData} destCanvasData    Destination canvas image data (written in place).
		 * @param {number} scale    Scale factor between source and destination.
		 */
		function applyBilinearInterpolation(srcCanvasData, destCanvasData, scale) {
			let i, j;
			let iyv, iy0, iy1, ixv, ix0, ix1;
			let idxD, idxS00, idxS10, idxS01, idxS11;
			let dx, dy;
			let r, g, b, a;
			
			/** Interpolates a single channel value bilinearly from four neighboring pixel values.
			 * @param {number} f00    Value at the top-left pixel.
			 * @param {number} f10    Value at the top-right pixel.
			 * @param {number} f01    Value at the bottom-left pixel.
			 * @param {number} f11    Value at the bottom-right pixel.
			 * @param {number} x    Horizontal interpolation fraction (0-1).
			 * @param {number} y    Vertical interpolation fraction (0-1).
			 * @returns {number}    Interpolated channel value.
			 */
			function inner(f00, f10, f01, f11, x, y) {
				let un_x = 1.0 - x;
				let un_y = 1.0 - y;
				return (f00 * un_x * un_y + f10 * x * un_y + f01 * un_x * y + f11 * x * y);
			}
			
			for (i = 0; i < destCanvasData.height; ++i) {
				iyv = i / scale;
				iy0 = Math.floor(iyv);
				iy1 = (Math.ceil(iyv) > (srcCanvasData.height - 1) ? (srcCanvasData.height - 1) : Math.ceil(iyv));
				for (j = 0; j < destCanvasData.width; ++j) {
					ixv = j / scale;
					ix0 = Math.floor(ixv);
					ix1 = (Math.ceil(ixv) > (srcCanvasData.width - 1) ? (srcCanvasData.width - 1) : Math.ceil(ixv));
					idxD = (j + destCanvasData.width * i) * 4;
					idxS00 = (ix0 + srcCanvasData.width * iy0) * 4;
					idxS10 = (ix1 + srcCanvasData.width * iy0) * 4;
					idxS01 = (ix0 + srcCanvasData.width * iy1) * 4;
					idxS11 = (ix1 + srcCanvasData.width * iy1) * 4;
					dx = ixv - ix0;
					dy = iyv - iy0;
					r = inner(srcCanvasData.data[idxS00], srcCanvasData.data[idxS10], srcCanvasData.data[idxS01], srcCanvasData.data[idxS11], dx, dy);
					destCanvasData.data[idxD] = r;
					g = inner(srcCanvasData.data[idxS00 + 1], srcCanvasData.data[idxS10 + 1], srcCanvasData.data[idxS01 + 1], srcCanvasData.data[idxS11 + 1], dx, dy);
					destCanvasData.data[idxD + 1] = g;
					b = inner(srcCanvasData.data[idxS00 + 2], srcCanvasData.data[idxS10 + 2], srcCanvasData.data[idxS01 + 2], srcCanvasData.data[idxS11 + 2], dx, dy);
					destCanvasData.data[idxD + 2] = b;
					a = inner(srcCanvasData.data[idxS00 + 3], srcCanvasData.data[idxS10 + 3], srcCanvasData.data[idxS01 + 3], srcCanvasData.data[idxS11 + 3], dx, dy);
					destCanvasData.data[idxD + 3] = a;
				}
			}
		}
		
		img = document.createElement("img");
		img.onerror = function () {
			if (typeof (_callBack) == "function") _callBack(false);
		}
		img.onload = function () {
			canvas = document.createElement("canvas");
			orgWidth = img.width;
			orgHeight = img.height;
			resWidth = orgWidth;
			resHeight = orgHeight;
			if (!((orgWidth == _boxWidth) && (orgHeight == _boxHeight) || (_boxWidth == 0 || _boxHeight == 0))) {
				if ((orgWidth > 0) && (orgHeight > 0) && ((_boxWidth > 0) && (_boxHeight > 0))) {
					// calculate new image size...
					switch (_cutMode) {
						case ImageUtils.IMAGERESIZE_CUTMODE_NONE:
							break;
						case ImageUtils.IMAGERESIZE_CUTMODE_INSIDE_NOBLOWUP:
							// do not cut the image; the complete image will be inside without blow up...
							if ((orgWidth / orgHeight) > (_boxWidth / _boxHeight)) {
								// original image height is greater than box aspecz...
								cutWidth = _boxWidth;
								cutHeight = (orgHeight * _boxWidth) / orgWidth;
							} else {
								// original image width is greater than box aspect...
								cutWidth = (orgWidth * _boxHeight) / orgHeight;
								cutHeight = _boxHeight;
							}
							resWidth = cutWidth;
							resHeight = cutHeight;
							if (orgWidth < resWidth && orgHeight < resHeight) {
								resWidth = orgWidth;
								resHeight = orgHeight;
							}
							break;
						case ImageUtils.IMAGERESIZE_CUTMODE_INSIDE:
							// do not cut the image; blow up the given box so the complete image will be inside...
							if ((orgWidth / orgHeight) > (_boxWidth / _boxHeight)) {
								// original image height is greater than box aspecz...
								cutWidth = _boxWidth;
								cutHeight = (orgHeight * _boxWidth) / orgWidth;
							} else {
								// original image width is greater than box aspect...
								cutWidth = (orgWidth * _boxHeight) / orgHeight;
								cutHeight = _boxHeight;
							}
							resWidth = cutWidth;
							resHeight = cutHeight;
							break;
						case ImageUtils.IMAGERESIZE_CUTMODE_OUTSIDE:
							// do not cut the image; shrink image so the complete image will be inside the box...
							if ((orgWidth / orgHeight) > (_boxWidth / _boxHeight)) {
								// original image height is greater than box...
								// set new image height to original height...
								cutWidth = (orgWidth * _boxHeight) / orgHeight;
								cutHeight = _boxHeight;
							} else {
								// original image width is greater than box...
								// set new image width to original width...
								cutWidth = _boxWidth;
								cutHeight = (orgHeight * _boxWidth) / orgWidth;
							}
							resWidth = cutWidth;
							resHeight = cutHeight;
							break;
						case ImageUtils.IMAGERESIZE_CUTMODE_INSIDE_FILL:
							// do not cut the image; blow up the given box so the complete image will be inside...
							if ((orgWidth / orgHeight) > (_boxWidth / _boxHeight)) {
								// original image height is greater than box aspecz...
								cutWidth = _boxWidth;
								cutHeight = (orgHeight * _boxWidth) / orgWidth;
								posY = (_boxHeight - cutHeight) / 2;
							} else {
								// original image width is greater than box aspect...
								cutWidth = (orgWidth * _boxHeight) / orgHeight;
								cutHeight = _boxHeight;
								posX = (_boxWidth - cutWidth) / 2;
							}
							resWidth = _boxWidth;
							resHeight = _boxHeight;
							break;
						case ImageUtils.IMAGERESIZE_CUTMODE_OUTSIDE_CUT:
							// like OUTSITE but image is cutted to given box and position by given cutposisitons...
							resWidth = _boxWidth;
							resHeight = _boxHeight;
							cutWidth = orgWidth;
							cutHeight = orgHeight;
							if ((orgWidth / orgHeight) > (_boxWidth / _boxHeight)) {
								// original image width is greater than box aspect, so cut width...
								//cutWidth=((orgWidth*_boxWidth)/_boxHeight);
								cutWidth = ((_boxHeight / _boxWidth) * orgHeight);
								posX = (_cutHorPos * (orgWidth - cutWidth)) / 100;
							} else {
								// original image height is greater than box aspect, so cut height...
								//cutHeight=((orgWidth*_boxHeight)/_boxWidth);
								cutHeight = ((_boxWidth / _boxHeight) * orgWidth);
								posY = (_cutVerPos * (orgHeight - cutHeight)) / 100;
							}
							break;
						//log(posX,posY,cutWidth,cutHeight);
						case ImageUtils.IMAGERESIZE_CUTMODE_ASPECT:
							// shrink original image to box, image will be possible disorted...
							resWidth = _boxWidth;
							resHeight = _boxHeight;
							break;
					}
				}
			} else {
				posX = 0;
				posY = 0;
				cutWidth = orgWidth;
				cutHeight = orgHeight;
			}
			if (true) {
				ret = {width: resWidth, height: resHeight};
				if (orientation > 4) {
					canvas.width = resWidth;
					canvas.height = resHeight;
				} else {
					canvas.width = resWidth;
					canvas.height = resHeight;
				}
				ctx = canvas.getContext("2d");
				//log("ORIENTATION 1:",orientation);
				if (_bgr !== false) {
					if (_bgr === 0) {
					} else if (typeof (_bgr) == "string") {
						ctx.fillStyle = _bgr;
					} else if (_bgr === true) {
						let p = ctx.getImageData(0, 0, 1, 1).data;
						ctx.fillStyle = '#' + p[0].toString(16).PreZero(2) + p[1].toString(16).PreZero(2) + p[2].toString(16).PreZero(2);
					}
					ctx.fillRect(0, 0, resWidth, resHeight);
				}
				switch (orientation) {
					case 1:
						ctx.transform(1, 0, 0, 1, 0, 0);
						break;
					case 2:
						ctx.transform(-1, 0, 0, 1, resWidth, 0);
						break;
					case 3:
						ctx.transform(-1, 0, 0, -1, resWidth, resHeight);
						break;
					case 4:
						ctx.transform(1, 0, 0, -1, 0, resHeight);
						break;
					case 5:
						ctx.transform(0, 1, 1, 0, 0, 0);
						break;
					case 6:
						ctx.transform(0, 1, -1, 0, resHeight, 0);
						break;
					case 7:
						ctx.transform(0, -1, -1, 0, resHeight, resWidth);
						break;
					case 8:
						ctx.transform(0, -1, 1, 0, 0, resWidth);
						break;
				}
				ctx = canvas.getContext("2d");
				switch (_cutMode) {
					case ImageUtils.IMAGERESIZE_CUTMODE_ASPECT:
						ctx.drawImage(img, 0, 0, orgWidth, orgHeight, 0, 0, resWidth, resHeight);
						break;
					case ImageUtils.IMAGERESIZE_CUTMODE_INSIDE_FILL:
						ctx.drawImage(img, 0, 0, orgWidth, orgHeight, posX, posY, cutWidth, cutHeight);
						break;
					case ImageUtils.IMAGERESIZE_CUTMODE_OUTSIDE_CUT:
						ctx.drawImage(img, posX, posY, cutWidth, cutHeight, 0, 0, resWidth, resHeight);
						break;
					default:
						ctx.drawImage(img, posX, posY, resWidth, resHeight);
				}
				ret.exif = orgexifdata;
				if (orgWidth == _img.width && orgHeight == _img.height && _keepOrgIfPossible) {
					ret.src = _img.src;
				} else {
					ret.src = canvas.toDataURL("image/" + _suffix, _quality / 100);
				}
				if (typeof (_callBack) == "function") _callBack(ret);
			} else {
				scale2Canvas(img, function (_canvas) {
					let ret = canvas.toDataURL("image/" + _suffix, _quality / 100);
					if (typeof (_callBack) == "function") _callBack(ret);
				});
			}
		}

		if (ImageUtils.EXIF != null) {
			exifok = ImageUtils.EXIF.getData(_img, function () {
				if (this.exifdata.hasOwnProperty("Orientation")) orientation = this.exifdata.Orientation;
				//log(this.exifdata);
				orgexifdata = this.exifdata;
				/*-- @<BUILD_ONLY_AT_RELEASES:Never ----
				log("ORIENTATION 1:",orientation);
				if(orientation!=1){
					canvas=document.createElement("canvas");
					if(orientation>4){
						canvas.width=_img.height;
						canvas.height=_img.width;
					}else{
						canvas.width=_img.width;
						canvas.height=_img.height;
					}
					ctx=canvas.getContext("2d");
					switch(orientation){
						case 1:ctx.transform(1,0,0,1,0,0);break;
						case 2:ctx.transform(-1,0,0,1,_img.width,0);break;
						case 3:ctx.transform(-1,0,0,-1,_img.width,_img.height);break;
						case 4:ctx.transform(1,0,0,-1,0,_img.height);break;
						case 5:ctx.transform(0,1,1,0,0,0);break;
						case 6:ctx.transform(0,1,-1,0,_img.height,0);break;
						case 7:ctx.transform(0,-1,-1,0,_img.height,_img.width);break;
						case 8:ctx.transform(0,-1,1,0,0,_img.width);break;
					}
					ctx.drawImage(_img,0,0);
					_img.onload=function(){img.src=_img.src;};
					_img.src=canvas.toDataURL("image/png");
				}else{
					img.src=_img.src;
				}
				---- @>BUILD_ONLY_AT_RELEASES --*/
				img.src = _img.src;
			});
		}
		if (!exifok) img.src = _img.src;

	}


	/** Returns HTML attribute markup that prevents default mouse and touch actions (e.g. image dragging) on an element.
	 * @returns {string}    Attribute string with onmousedown and ontouchstart handlers.
	 */
	static preventImageDefaults = function () {
		return ' onmousedown="event.preventDefault();" ontouchstart="event.preventDefault();" ';
	}

	/** Converts an image to grayscale using the given channel weights and returns the result asynchronously via callback.
	 * The callback receives an object {width, height, src} on success or false on error.
	 * @param {string} _imgSrc    Source image URL or data URL.
	 * @param {number} _red    Weight of the red channel (e.g. 0.299).
	 * @param {number} _green    Weight of the green channel (e.g. 0.587).
	 * @param {number} _blue    Weight of the blue channel (e.g. 0.114).
	 * @param {function} _callBack    Callback function called with the result object ({width, height, src}) or false on error.
	 */
	static makeGrayScale = function (_imgSrc, _red, _green, _blue, _callBack) {
		let img;
		img = document.createElement("img");
		img.onerror = function () {
			if (typeof (_callBack) == "function") _callBack(false);
		}
		img.onload = function () {
			let canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
			let width = this.width, height = this.height, pixels, data, i, l, b, ret = false;
			canvas.width = width;
			canvas.height = height;
			ctx.drawImage(this, 0, 0);
			pixels = ctx.getImageData(0, 0, width, height);
			data = pixels.data;
			l = data.length
			for (i = 0; i < l; i += 4) {
				b = _red * data[i] + _green * data[i + 1] + _blue * data[i + 2];
				data[i] = b;
				data[i + 1] = b;
				data[i + 2] = b;
			}
			ret = {width: width, height: height};
			ctx.putImageData(pixels, 0, 0, 0, 0, pixels.width, pixels.height);
			ret.src = canvas.toDataURL();
			if (typeof (_callBack) == "function") _callBack(ret);
		}

		img.src = _imgSrc;
	}
}

/** Image prototype extensions for resizing.
 * @class Image
 */

/** Resizes this image to fit a given box using one of the IMAGERESIZE_CUTMODE_* modes and returns the result asynchronously via callback (see ImageUtils.imageResize).
 * @param {number} [_boxWidth=0]    Target box width in pixels (0 = unlimited).
 * @param {number} [_boxHeight=0]    Target box height in pixels (0 = unlimited).
 * @param {string} [_suffix="jpeg"]    Output image format suffix (e.g. "jpeg", "png").
 * @param {number} [_quality=-1]    Output quality in percent (0-100; -1 = default).
 * @param {number|boolean} [_cutMode=ImageUtils.IMAGERESIZE_CUTMODE_INSIDE]    One of the IMAGERESIZE_CUTMODE_* constants (false = INSIDE, true = ASPECT).
 * @param {number} [_cutHorPos=50]    Horizontal cut position in percent (0-100), used by OUTSIDE_CUT mode.
 * @param {number} [_cutVerPos=50]    Vertical cut position in percent (0-100), used by OUTSIDE_CUT mode.
 * @param {boolean|string|number} [_bgr=false]    Background fill: false = none, a CSS color string, or true = use the canvas' top-left pixel color.
 * @param {number} [_maxSize=0]    Maximum output size (0 = unlimited; currently unused).
 * @param {function} _callBack    Callback function called with the result object ({width, height, src, exif}) or false on error.
 * @param {boolean} [_keepOrgIfPossible=false]    If true, the original image source is kept when the size did not change.
 */
Image.prototype.Resize = function (_boxWidth, _boxHeight, _suffix, _quality, _cutMode, _cutHorPos, _cutVerPos, _bgr, _maxSize, _callBack, _keepOrgIfPossible = false) {
	ImageUtils.imageResize(this, _callBack, _boxWidth, _boxHeight, _suffix, _quality, _cutMode, _cutHorPos, _cutVerPos, _bgr, _maxSize, _keepOrgIfPossible);
}


/** Global browser export of the ImageUtils class. */
if (typeof window !== 'undefined') window.ImageUtils = ImageUtils;

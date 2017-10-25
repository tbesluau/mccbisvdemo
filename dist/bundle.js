/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var Imager = __webpack_require__(1);
__webpack_require__(3);

// in the demo we're simply showing 4
// statically hosted images
var images = [
	'/img/myimage01.png',
	'/img/myimage02.png',
	'/img/myimage03.png',
	'/img/myimage04.jpg'
];


var workspace = document.createElement('DIV');
workspace.id = 'workspace';
document.body.appendChild(workspace);

// creating the 4 images and sending them to
// our "imager" logic that will create and listen
// to the various asset creation buttons
var imager = new Imager();
var image, imageWrapper;
for (var i = 0; i < images.length; i++) {
	image = document.createElement('IMG');
	imageWrapper = document.createElement('DIV');
	image.src = images[i];
	imageWrapper.id = images[i].split('.')[0].split('/')[2];
	image.className = 'myimage';
	imageWrapper.className = 'myimagewrapper';
	imageWrapper.appendChild(image);
	workspace.appendChild(imageWrapper);
	imager.add(imageWrapper.id);
}

imager.checkStatus();


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var Api = __webpack_require__(2);

module.exports = function () {
	var self = this;

	this.api = new Api();
	this.images = {};
	this.blocks = {};
	this.templates = {};

	// the function below can take an image URL and load it
	// as a file so we can extract base64 encoded data
	// from our own non-CB images and add them to CB
	this.toDataURL = function (url, callback) {
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
			var reader = new FileReader();
			reader.onloadend = function() {
				callback(reader.result);
			};
			reader.readAsDataURL(xhr.response);
		};
		xhr.open('GET', url);
		xhr.responseType = 'blob';
		xhr.send();
	};

	// this is unelegant: we're getting the assets
	// each time something changes to repaint the
	// action buttons
	this.checkStatus = function () {
		if (self.checking) {
			return;
		}
		self.checking = true;
		self.api.getFolderContents(function (contents) {
			self.checking = false;
			self.contents = contents.items;
			self.markButtons();
		});
	};

	// this styles the buttons so it's clear
	// which asset has already been created and
	// which asset cannot be created yet because its
	// requirements are not met
	this.markButtons = function () {
		var item, name, id, block, template;
		for (var i = 0; i < self.contents.length; i++) {
			item = self.contents[i];
			name = item.name;
			if (name.indexOf('template') !== -1) {
				id = name.replace('template', '');
				self.templates[id].className = 'existing';
				self.templates[id].disabled = true;
			} else if (name.indexOf('block') !== -1) {
				id = name.replace('block', '');
				self.blocks[id].className = 'existing';
				self.blocks[id].disabled = true;
				if (!self.templates[id].hasAttribute('class')) {
					self.templates[id].className = 'enabled';					
					self.templates[id].disabled = false;
				}
			} else {
				id = name;
				self.images[id].className = 'existing';
				self.images[id].disabled = true;
				if (!self.blocks[id].hasAttribute('class')) {
					self.blocks[id].className = 'enabled';					
					self.blocks[id].disabled = false;
				}
			}
		}
		for (var blck in self.blocks) {
			block = self.blocks[blck];
			if (block.className === 'enabled') {
				block.disabled = false;
			} else {
				block.disabled = true;
			}
		}
		for (var tmpl in self.templates) {
			template = self.templates[tmpl];
			if (template.className === 'enabled') {
				template.disabled = false;
			} else {
				template.disabled = true;
			}
		}
	};

	// find an asset in the existing assets list
	// under our demo folder
	this.getExisting = function (name) {
		if (!this.contents) {
			return;
		}
		results = this.contents.filter(function (a) {
			return a.name === name;
		});
		return results.length > 0 && results[0] || null;
	};

	// this creates the image UI and adds
	// listeners to the various creation buttons
	this.add = function (imageId) {
		var div = document.getElementById(imageId);
		var img = document.querySelector('#' + imageId + ' .myimage');
		var src = img.src;
		var ext = src.split('.');
		ext = ext[ext.length - 1];
		var btnImg = document.createElement('BUTTON');
		btnImg.innerText = 'Create as CB Image';
		btnImg.className = 'image';
		var btnBlock = document.createElement('BUTTON');
		btnBlock.innerText = 'Create as CB Block (requires image)';
		var btnTemplate = document.createElement('BUTTON');
		btnTemplate.innerText = 'Create as CB Template (requires block)';
		div.appendChild(btnImg);
		div.appendChild(btnBlock);
		div.appendChild(btnTemplate);
		this.images[imageId] = btnImg;
		this.blocks[imageId] = btnBlock;
		this.templates[imageId] = btnTemplate;
		btnImg.onclick = function () {
			self.toDataURL(src, function (base64) {
				self.api.addImage(imageId, base64.split('base64,')[1], ext, function () {
					self.checkStatus();
				});
			});
		};
		btnBlock.onclick = function () {
			self.api.addBlock(imageId + 'block', self.getExisting(imageId), function () {
				self.checkStatus();
			});
		};
		btnTemplate.onclick = function () {
			self.api.addTemplate(imageId + 'template', self.getExisting(imageId + 'block'), function () {
				self.checkStatus();
			});
		};
	};
}; 



/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = function () {
	
	var self = this;

	// the UI needs to send API calls to the node proxy
	// the node proxy is identified by the prefix below
	// and will pass it through to the MC API
	this.endpoint = '/proxy/';
	
	// hardcoded category ID for this demo
	this.category = 1975383;

	// all calls will use this base set of headers
	this.headers = {
		'Accept': 'application/json',
		'Content-Type': 'application/json',
		'Cache': 'no-cache'
	};

	// simple API get call with callback
	this._get = function (url, cb) {
		fetch(self.endpoint + url, {
			method: 'GET',
			headers: self.headers,
			credentials: 'include',
			mode: 'no-cors'
		}).then(function (response) {
			cb(response);
		});
	};

	// simple API post with callback
	this._post = function (url, data, cb) {
		fetch(self.endpoint + url, {
			method: 'POST',
			body: JSON.stringify(data),
			headers: self.headers,
			credentials: 'include',
			mode: 'no-cors'
		}).then(function (res) {
			return res.json();
		}).then(function (data) {
			cb(data);
		});
	};

	// list all assets under a given folder
	this.getFolderContents = function (cb) {
		this._post('asset/v1/content/assets/query', {
			query: {
				property: "category.id",
				simpleOperator: "equals",
				value: self.category
			}
		}, cb);
	};

	// generates an image creation payload
	// all we need is a name and the image file base64 encoded
	// as well as the assetType or extension
	this.addImage = function (name, base64File, ext, cb) {
		// figure out assetType based on the file extension
		var typeID = ext === 'png' && 28 || ext === 'jpg' && 23 || 0;
		if (!typeID) {
			return;
		}
		this._post('asset/v1/content/assets', {
			assetType: {
				id: typeID
			},
			category: {
				id: self.category
			},
			name: name,
			file: base64File
		}, cb);
	};

	// generates a block creation payload based on an image
	// we make an imageblock, and get the URL to display
	// from the image asset passed to the function
	this.addBlock = function (name, img, cb) {
		this._post('asset/v1/content/assets', {
			assetType: {
				id: 199
			},
			category: {
				id: self.category
			},
			name: name,
			// the src in the content below is the published URL of the image asset
			content: '<img src="' + img.fileProperties.publishedURL + '" />'
		}, cb);
	};

	// generates a template creation payload based on a block
	// we create a slot with the block in it
	this.addTemplate = function (name, block, cb) {
		this._post('asset/v1/content/assets', {
			assetType: {
				id: 4
			},
			category: {
				id: self.category
			},
			name: name,
			// very minimalistic body for demo purposes
			// needs a head, header, and footer at least
			content: '<html><body><div><div data-type="slot" data-key="myslot"></div></div></html>',
			slots: {
				myslot: {
					content: '<div data-type="block" data-key="myblock"></div>',
					blocks: {
						myblock: block
					}
				}
			}
		}, cb);
	};
};


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(4);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(6)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./styles.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./styles.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(5)(undefined);
// imports


// module
exports.push([module.i, "#workspace div.myimagewrapper {\n\twidth: 600px;\n\theight: 320px;\n\tposition: relative;\n\tdisplay: inline-block;\n\tmargin: 3px 10px 6px 5px;\n}\n\n#workspace div.myimagewrapper img.myimage {\n\tdisplay: block;\n\tposition: absolute;\n\twidth: 100%;\n\theight: 100%;\n\ttop: 0;\n\tbottom: 0;\n\tleft: 0;\n\tright: 0;\n}\n\n#workspace div.myimagewrapper button {\n\tz-index: 5;\n\tposition: relative;\n\tdisplay: block;\n\tvisibility: hidden;\n\twidth: 300px;\n\tpadding: 1rem;\n\tmargin: 30px auto;\n\tborder-radius: 0.25rem;\n\tborder: 1px solid #d8dde6;\n\tcolor: #d8dde6;\n\tbackground-color: #fff;\n\tfont-size: 0.8rem;\n}\n\n#workspace div.myimagewrapper:hover button {\n\tvisibility: inherit;\n}\n\n#workspace div.myimagewrapper button {\n\tcolor: #d8dde6;\n}\n\n#workspace div.myimagewrapper button.image {\n\tcolor: #0070d2;\n}\n\n#workspace div.myimagewrapper button.enabled {\n\tcolor: #0070d2;\n}\n\n#workspace div.myimagewrapper button.existing {\n\tcolor: #d8dde6;\n\tbackground-color: #dfd;\n\tbackground: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAflBMVEUQexD///8RexERhBEQfRADdAOJvokRghFFmEUQfxDN5M0Jdwnw9/D19vUjhSPp6+kfhB+muqa72bs4izjG4Mbp8+lUl1Run27U2tR7pHtHkEeQrZAbhhsqjCqdtp2QwpCywrJtn211onXN1c1nnme7yLvd7N1lqmWp0KlPnU/vaxTcAAAAxklEQVQYlVXQ2xaCIBAF0ANihJNIWZYmZvf6/x8Mprw0D6zFBgY4EFz3mwd8tc55hjhcK2MQSpmyH7BrmWKZ5PLFLlGYKjlHvLZzC9oFrMwERCSVL3CfWfp+WYI+4hZQErEtV+KZwjTw0awjybaIqw4ydLKPLYgtndrbTGxobjYed5nY7kZzqNRPR1Ml1vFJ4arsNJzVNfJSscrxivYA0Sd/vwwbYyCXP9VNztHtZzHppviF3HnNrHRb50Pyojg2VsKV9YGnH2iKCdqYoemjAAAAAElFTkSuQmCC\") white no-repeat left 7px top 13px;\n}\n", ""]);

// exports


/***/ }),
/* 5 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			var styleTarget = fn.call(this, selector);
			// Special case to return head of iframe instead of iframe itself
			if (styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[selector] = styleTarget;
		}
		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(7);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertInto + " " + options.insertAt.before);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 7 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ })
/******/ ]);
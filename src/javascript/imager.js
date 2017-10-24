var Api = require('./api.js');

module.exports = function () {
	var self = this;

	this.api = new Api();
	this.images = {};
	this.blocks = {};
	this.templates = {};
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

	this.markButtons = function () {
		var item, name, id;
		for (var blck in self.blocks) {
			self.blocks[blck].disabled = true;
		}
		for (var tmpl in self.templates) {
			self.templates[tmpl].disabled = true;
		}
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
	};

	this.getExisting = function (name) {
		if (!this.contents) {
			return;
		}
		results = this.contents.filter(function (a) {
			return a.name === name;
		});
		return results.length > 0 && results[0] || null;
	};

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


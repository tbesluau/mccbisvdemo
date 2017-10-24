module.exports = function () {
	var self = this;
	this.endpoint = '/proxy/';
	this.category = 1975383;

	this.headers = {
		'Accept': 'application/json',
		'Content-Type': 'application/json',
		'Cache': 'no-cache'
	};

	/*fetch('/refresh', {
		method: 'GET',
		headers: self.headers,
		credentials: 'include',
		mode: 'cors'
	}).then(function (response) {
		return response.json();
	}).then(function (body) {
		self.token = body.accessToken;
		self.endpoint = body.endpoint;
		self.headers.Authorization = 'Bearer' + self.token;
	});*/
	

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

	this.getFolderContents = function (cb) {
		this._post('asset/v1/content/assets/query', {
			query: {
				property: "category.id",
				simpleOperator: "equals",
				value: self.category
			}
		}, cb);
	};

	this.addImage = function (name, base64File, ext, cb) {
		var typeID = ext === 'png' && 28 || ext === 'jpg' && 23 || 0;
		if (!typeID) {
			return;
		}
		this._post('asset/v1/content/assets', {
			assetType: {
				id: 28
			},
			category: {
				id: self.category
			},
			name: name,
			file: base64File
		}, cb);
	};
	this.addBlock = function (name, img, cb) {
		this._post('asset/v1/content/assets', {
			assetType: {
				id: 199
			},
			category: {
				id: self.category
			},
			name: name,
			content: '<img src="' + img.fileProperties.publishedURL + '" />'
		}, cb);
	};
	this.addTemplate = function (name, block, cb) {
		this._post('asset/v1/content/assets', {
			assetType: {
				id: 4
			},
			category: {
				id: self.category
			},
			name: name,
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

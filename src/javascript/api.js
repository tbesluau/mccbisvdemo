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

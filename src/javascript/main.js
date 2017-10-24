var Imager = require('./imager.js');
require('../css/styles.css');

var images = [
	'/img/myimage01.png',
	'/img/myimage02.png',
	'/img/myimage03.png',
	'/img/myimage04.jpg'
]


var workspace = document.createElement('DIV');
workspace.id = 'workspace';
document.body.appendChild(workspace);

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


/*setTimeout(function () {
	api.get('asset/v1/content/assets/140442', function (response) {
		console.log(response);
	});
}, 2000);
setTimeout(function () {
	api.get('asset/v1/assettypes', function (response) {
		console.log(response);
	});
}, 4000);*/

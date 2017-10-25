var Imager = require('./imager.js');
require('../css/styles.css');

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

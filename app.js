var express = require('express');
var session = require('express-session');
var proxy = require('http-proxy-middleware');
var bodyParser = require('body-parser');
var jwt = require('jwt-simple');
var request = require('request');

var secret = process.env.APP_SIGNATURE;
var clientId = process.env.CLIENT_ID;
var clientSecret = process.env.CLIENT_SECRET;


var app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
	name: 'mcisv',
	secret: 'my-app-super-secret-session-token',
	cookie: {
		maxAge: 1000 * 60 * 60 * 24,
		secure: false
	},
	saveUninitialized: true,
	resave: false
}));
app.use(express.static('dist'));


/*app.get('/refresh', function (req, res, next) {
	mcapi = req.session;
	request.post(mcapi.authEndpoint, {form: {
		clientId: clientId,
		clientSecret: clientSecret,
		refreshToken: mcapi.refreshToken,
		accessType: 'offline'
	}}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var result = JSON.parse(body);
			mcapi.refreshToken = result.refreshToken;
			res.json({
				accessToken: result.accessToken,
				endpoint: mcapi.apiEndpoint
			});
			console.log('success', result.accessToken);
		}
		next();
	});
});*/

app.use('/proxy', proxy({
	logLevel: 'debug',
	changeOrigin: true,
	target: 'https://www.exacttargetapis.com/',
	onError: function (err, req, res) {console.log(err);},
	protocolRewrite: 'https',
	pathRewrite: {
		'^/proxy': ''
	},
	secure: false,
	onProxyReq: function(proxyReq, req, res) {
		proxyReq.setHeader('Authorization', 'Bearer ' + req.session.accessToken);
		proxyReq.setHeader('Content-Type', 'application/json');
		console.log(proxyReq._headers, Object.keys(proxyReq));
	},
	onProxyRes: function (proxyRes, req, res) {
		//console.log(proxyRes);
	}
}));

/*app.all('/proxy/:route', function (req, res, next) {
	console.log(req.sessionID);

	next();
});*/

app.post('/login', function (req, res, next) {
	var encodedJWT = req.body.jwt;
	var decodedJWT = jwt.decode(encodedJWT, secret);
	var restInfo = decodedJWT.request.rest;
	//console.log(req.sessionID);
	//console.log('refresh: ', restInfo.refreshToken);
	request.post(restInfo.authEndpoint, {form: {
		clientId: clientId,
		clientSecret: clientSecret,
		refreshToken: restInfo.refreshToken,
		accessType: 'offline'
	}}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var result = JSON.parse(body);
			req.session.refreshToken = result.refreshToken;
			req.session.accessToken = result.accessToken;
			//console.log(req.session);
			//console.log(req.sessionID);
			req.session.save();
			
		}
		next();
	});
	
	res.redirect('/');
});

app.listen(process.env.PORT || 3003, function () {
	console.log('App listening on port ' + (process.env.PORT || 3003));
});

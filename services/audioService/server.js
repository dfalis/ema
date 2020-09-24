/* Node modules */
const http = require('http');

/* NPM modules */
const express = require('express');
const bodyParser = require('body-parser');

/* Own modules */
const config = require('./config/config');

process.env.private_key = config.PRIVATEKEY;
const PORT = config.AUDIOSERVICEPORT;

// imports database
require('./api/models/db');
// creates express app
const app = express();
// imports router
const api = require('./api/router');

// removes header "x-powered-by" for security reasons
app.disable('x-powered-by');
// parser for json data
app.use(bodyParser.json());
// parser for urlencoded data
app.use(bodyParser.urlencoded({ extended: false }));

// router for every call from client side
app.use('/', api);
// for every other route -> send notFound error
app.get('/*', (req, res) => {
	return res.status(404).json({ message: 'urlNotFound' });
});

// creates server
const httpserver = http.createServer(app);
httpserver.listen(PORT, () => {
	console.log('Audio service listening on port ' + PORT);
});

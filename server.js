/* Node modules */
const http = require('http');
const path = require('path');

/* NPM modules */
const express = require('express');
const bodyParser = require('body-parser');

/* Own modules */
const config = require('./config/config');
const decodeToken = require('./api/helpers/decodeToken');

process.env.private_key = config.PRIVATEKEY;
const PORT = config.MAINPORT;

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
// sets static folder for servering files for index.html
app.use(express.static(path.join(__dirname, 'client/dist/ema')));

// router for every call from client side
app.use('/api', api);
// for every other route -> send app to client
app.get('/*', (req, res) => {
	res.sendFile(path.join(__dirname, 'client/dist/ema/index.html'));
});

// creates server
const httpserver = http.createServer(app);
// creates socket
const io = require('socket.io')(httpserver);

io.on('connection', socket => {
	console.log(`User ${decodeToken(socket.request)._id} connected`);

	socket.on('lobby', lobbyID => {
		console.log('lobby: ', lobbyID);
		socket.join(lobbyID);
		// socket.broadcast.emit('message', message);
	});

	socket.on('play', data => {
		if (data)
			io.sockets.to(data.room).emit('play', {
				songid: data.songid || null,
				from: decodeToken(socket.request)._id || 403
			});
	});
	socket.on('pause', data => {
		if (data)
			io.sockets.to(data.room).emit('pause', {
				from: decodeToken(socket.request)._id || 403
			});
	});

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
});

httpserver.listen(PORT, () => {
	console.log('Server listening on port ' + PORT);
});

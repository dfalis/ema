/* NPM modules*/
const mongoose = require('mongoose');

/* Load config file */
const config = require('../../config/config');
const dbURL = config.dbUrl;

// Connects to database
mongoose.connect(dbURL, { useNewUrlParser: true });

// Prints message after establishing database connection
mongoose.connection.on('connected', () => {
	console.log('Audio service connected to ' + dbURL);
});
// Prints message on error occurence
mongoose.connection.on('error', err => {
	console.log('Audio service connection error: ' + err);
});
// Prints message after disconnecting from database
mongoose.connection.on('disconnected', () => {
	console.log('Audio service disconnected');
});

// Schemas & Models imports
require('./audio');

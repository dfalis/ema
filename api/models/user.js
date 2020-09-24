const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const NUMBER_OF_ITERATIONS = 1000;

// creates user schema with data structure
const userSchema = new mongoose.Schema({
	name: {
		required: true,
		type: String
	},
	email: {
		required: true,
		unique: true,
		type: String
	},
	hash: {
		required: true,
		type: String
	},
	salt: {
		required: true,
		type: String
	}
});

/**
 * Sets user's password
 * @param {String} password User's password
 */
userSchema.methods.setPassword = function(password) {
	// creates 16 random bytes that are converted to string for hashing password
	this.salt = crypto.randomBytes(16).toString('hex');

	// hash password with 16 byte long salt, 10000 iterations and sha512 encoding, and returns buffer that is converted into string
	this.hash = crypto
		.pbkdf2Sync(password, this.salt, NUMBER_OF_ITERATIONS, 64, 'sha512')
		.toString('hex');

	// salt and hash are saved into user object
};

/**
 * This will validate password
 * @param {String} password
 * @returns {Boolean} True if password is valid
 */
userSchema.methods.validPassword = function(password) {
	// creates hash buffer that is converted into string
	let hash = crypto
		.pbkdf2Sync(password, this.salt, NUMBER_OF_ITERATIONS, 64, 'sha512')
		.toString('hex');

	// checks if hash from database matches hash created above
	return this.hash === hash;
};

/**
 * Generage JsonWebToken for user's authentication
 * @returns {String} token
 */
userSchema.methods.generateJwt = function() {
	// creates expiration date for token
	let expiry = new Date();
	// changes expiration date to 7 days from now
	expiry.setDate(expiry.getDate() + 7);

	// signs token with private_key, token contains data about user
	// and expiration date, may be removed later and replaced with cookie expiration
	return jwt.sign(
		{
			_id: this._id,
			email: this.email,
			name: this.name,
			exp: parseInt(expiry.getTime() / 1000)
		},
		process.env.private_key
	);
};

// exports userSchema as User model
mongoose.model('User', userSchema);

// import NPM modules
const mongoose = require('mongoose');
const User = mongoose.model('User');
const logger = require('../helpers/logger');

const COOKIE_EXPIRATION_IN_SECONDS = 60 * 60 * 24 * 7;

/**
 * Logins user
 * @param {Request} req
 * @param {Response} res
 */
module.exports.login = (req, res) => {
	if (!req.body.email || !req.body.password) {
		logger.log('Login', 'Missing credentials');
		return res.status(400).json({
			error: 'missingCredentials'
		});
	} else {
		User.findOne({ email: req.body.email }, (err, user) => {
			if (err) {
				console.log(err);
				return res.status(400).json({ error: err });
			}

			if (!user || !user.validPassword(req.body.password)) {
				logger.log('Login', 'Bad credentials');
				return res.status(400).json({ error: 'badCredentials' });
			}

			logger.log('Login', 'Logged in user: ' + user.email);
			let token = user.generateJwt();
			return res
				.status(200)
				.cookie('token', token, {
					expires: new Date(Date.now() + 1000 * COOKIE_EXPIRATION_IN_SECONDS),
					httpOnly: true
				})
				.json({ loggedin: true, name: user.name, _id: user._id });
		});
	}
};

/**
 * Registers user
 * @param {Request} req
 * @param {Response} res
 */
module.exports.register = (req, res) => {
	// if body doesnt contain name, email, password return missingCredentials
	if (!req.body.name || !req.body.email || !req.body.password) {
		logger.log('Register', 'Missing credentials');
		return res.status(400).json({ error: 'missingCredentials' });
	}

	// Defining REGEX for email and name checking
	const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	const NAME_REGEX = /\S\w{3,}/g;

	const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;

	// tests email and name regex, and if password is from 8 to 32 chars long
	if (
		!EMAIL_REGEX.test(email) ||
		!NAME_REGEX.test(name) ||
		(password.length < 8 || password.length > 32)
	) {
		logger.log('Register', 'Invalid credentials');
		return res.status(400).json({ error: 'invalidCredentials' });
	}

	logger.log(
		'Register',
		`Registering "${req.body.name}"`,
		`email: "${req.body.email}"`,
		`password: "${req.body.password}"`
	);

	// creates new user, sets name, email, salt and hash from password, and saves user to database
	let newUser = new User();
	newUser.name = name;
	newUser.email = email;
	newUser.setPassword(password);
	newUser.save(err => {
		if (err) {
			logger.log('Login', 'Error while saving user', err);
			// if user exists return emailExists
			if (err.code == 11000) {
				logger.log('Register', 'Error while registering user', 'Email exists');
				return res.status(400).json({ error: 'emailExists' });
			}
			logger.log('Register', 'Error while registering', err);
			return res.status(400).json({ error: err });
		}
		logger.log('Register', `User ${newUser.email} registered`);
		// generate signed token
		let token = newUser.generateJwt();
		// respond with status 200, set cookie and send response
		return res
			.status(200)
			.cookie('token', token, {
				expires: new Date(Date.now() + 1000 * COOKIE_EXPIRATION_IN_SECONDS),
				httpOnly: true
			})
			.json({ loggedin: true, name: newUser.name, _id: newUser._id });
	});
};
/**
 * Logs out user
 * @param {Request} req
 * @param {Response} res
 */
module.exports.logout = (req, res) => {
	logger.log('Logout', 'Logging out');
	return res
		.status(200)
		.clearCookie('token', { httpOnly: true })
		.json({ success: true });
};

/* Import NPM modules */
const jwt = require('jsonwebtoken');
const logger = require('./logger');

/**
 * Authentication check
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
module.exports = req => {
	logger.log('DecodeToken', 'Checking cookie');

	const cookie = req.headers.cookie;
	const tokenCookie = /token=([^;]+)/.exec(cookie);

	if (!tokenCookie) {
		logger.log('DecodeToken', 'No token included - couldnt verify user');
		return null;
	}

	const token = tokenCookie[1];
	return jwt.verify(token, process.env.private_key, (err, decoded) => {
		if (err) {
			logger.log('DecodeToken', err.message);
			return null;
		}
		if (!decoded._id) {
			logger.log('DecodeToken', 'No id included in token');
			return null;
		}

		return decoded;
	});
};

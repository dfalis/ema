/* Import NPM modules */
const jwt = require('jsonwebtoken');
const logger = require('../helpers/logger');

/**
 * Authentication middleware
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
module.exports = (req, res, next) => {
	logger.log('AuthMiddleware', 'Checking cookie');
	// check if has cookie, if not then send something like status code
	// in angular check for that status code with interceptor maybe
	const cookie = req.headers.cookie;
	const tokenCookie = /token=([^;]+)/.exec(cookie);

	if (!tokenCookie) {
		logger.log('AuthMiddleware', 'No token included - couldnt verify user');
		return res.status(403).json({ message: 'noTokenIncluded' });
	}

	const token = tokenCookie[1];

	jwt.verify(token, process.env.private_key, (err, decoded) => {
		if (err) {
			logger.log('AuthMiddleware', err.message);
			return res.status(403).json({ message: 'invalidToken' });
		}
		if (!decoded._id) {
			logger.log('AuthMiddleware', 'No id included in token');
			return res.status(401).json({ message: 'unauthorized' });
		}

		req.payload = decoded;
		return next();
	});
};

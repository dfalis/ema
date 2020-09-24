/**
 * Loggs events
 * @param {String} type Type of logged message
 * @param {any} message Logged message
 * @param {any[]} args Other messages
 */
module.exports.log = (type, message, ...args) => {
	if (args.length == 0) {
		console.log(`[${type}]: `, message);
	} else if (args.length == 1) {
		console.log(`[${type}]: `, `${message} => ${args[0]}`);
	} else {
		console.log(`[${type}]: `, `${message} => ${args[0]}`);
		for (let i = 1; i < args.length; i++) {
			console.log(`\t\t\t=> ${args[i]}`);
		}
	}
};

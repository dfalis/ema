/* Import NPM modules */
const logger = require('../helpers/logger');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Event = mongoose.model('Event');

module.exports.listEvents = (req, res) => {
	const owner = req.payload._id;
	logger.log('ListEvent', 'Listing events of user', owner);

	Event.find({ owner: owner }).exec((err, events) => {
		if (err) {
			return res.status(400).json(err);
		}

		return res.status(200).json(events);
	});
};

module.exports.getEvent = (req, res) => {
	const eventID = req.params.id;
	const owner = req.payload._id;
	logger.log('GetEvent', 'Getting event for user', owner);

	Event.findOne({ owner: owner, _id: eventID })
		.select('+notes')
		.exec((err, event) => {
			if (err) {
				logger.log('GetEvent', 'Error occured while getting event, err', err);
				return res.status(400).json(err);
			}

			return res.status(200).json(event);
		});
};

module.exports.createEvent = (req, res) => {
	// check for user_id
	// check if event name is valid and longer than 3 characters
	if (!req.body.name || req.body.name.trim().length < 4) {
		logger.log('CreateEvent', 'Invalid name');
		return res.status(400).json({ message: 'invalidName' });
	}

	// remove whitespaces at the beginning and at the end
	const name = req.body.name.trim();
	const owner = req.payload._id;
	logger.log('CreateEvent', `Adding ${name} for user ${owner}`);

	// create event and set owner, name
	// than save it to database, check for errors and return id and name of event
	let event = new Event();
	event.owner = owner;
	event.name = name;
	event.save((err, event) => {
		if (err) {
			logger.log('CreateEvent', 'Error occured while saving event, err', err);
			return res.status(500).json(err);
		} else {
			return res.status(200).json({ _id: event._id, name: event.name });
		}
	});
};

module.exports.saveEvent = (req, res) => {
	if (!req.body._id) return res.status(400).json({ message: 'noEventId' });

	let saveData = {};
	if (req.body.name && req.body.name.trim().length > 3) {
		// save name
		console.log('saving name');
		saveData.name = req.body.name;
	}
	if (req.body.notes && Array.isArray(req.body.notes)) {
		// save notes
		saveData.notes = [];

		for (let i = 0; i < req.body.notes.length; i++) {
			// TODO: check if typ is normal, important or song
			const typ =
				Number.isInteger(req.body.notes[i].typ) &&
				req.body.notes[i].typ >= 0 &&
				req.body.notes[i].typ <= 2
					? Math.floor(req.body.notes[i].typ)
					: 0;
			saveData.notes.push({
				typ: typ,
				content: '' + req.body.notes[i].content
			});
		}
	}

	if (
		!(
			Object.entries(saveData).length === 0 && saveData.constructor === Object
		)
	) {
		Event.findOneAndUpdate(
			{ _id: req.body._id, owner: req.payload._id },
			{ $set: saveData },
			(err, event) => {
				if (err) {
					console.log(err);
					return res.status(500).json({ message: 'cantUpdateEvent' });
				} else {
					console.log('Event updated');
					return res.status(200).json({ success: 'eventUpdated' });
				}
			}
		);
	} else {
		return res.status(400).json({ message: 'invalidData' });
	}
};

module.exports.deleteEvent = (req, res) => {
	const eventID = req.params.id;
	const owner = req.payload._id;
	logger.log('DeleteEvent', `Deleting event ${eventID} for user ${owner}`);

	Event.findOneAndDelete({ owner: owner, _id: eventID }).exec(
		(err, deletedEvent) => {
			if (err) {
				logger.log(
					'DeleteEvent',
					'Error occured while deleting event, err',
					err
				);
				return res.status(500).json(err);
			}
			return res.status(200).json(deletedEvent);
		}
	);
};

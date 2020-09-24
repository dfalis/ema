/* Import NPM modules */
const express = require('express');

const router = express.Router();
const auth = require('./middlewares/authentication');

const ctrlAuth = require('./controllers/authentication');
const ctrlEvents = require('./controllers/events');

// Authentication routes
router.post('/login', ctrlAuth.login);
router.post('/register', ctrlAuth.register);
router.post('/logout', ctrlAuth.logout);

// Event routes
router.get('/events', auth, ctrlEvents.listEvents);
router.get('/event/:id', auth, ctrlEvents.getEvent);
router.post('/event/create', auth, ctrlEvents.createEvent);
router.post('/event/save', auth, ctrlEvents.saveEvent);
router.delete('/event/:id', auth, ctrlEvents.deleteEvent);

module.exports = router;

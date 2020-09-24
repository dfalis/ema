/* NPM modules */
const express = require('express');
const cors = require('cors');

/* Own modules */
const auth = require('./middlewares/authentication');
const config = require('../config/config');

const ctrlUpload = require('./controllers/audio');

// Creates express router object
const router = express.Router();

// Production CORS settings
// const corsOptions = {
// 	origin: config.mainServerUrl,
// 	optionsSuccessStatus: 200,
// 	credentials: true
// };

// Development CORS settings
const corsOptions = {
	origin: function(origin, callback) {
		callback(null, true);
	},
	optionsSuccessStatus: 200,
	credentials: true
};

router.all('*', cors(corsOptions));

// Audio routes
router.get('/audios', auth, ctrlUpload.getListOfAudios);
router.post('/audio/upload', auth, ctrlUpload.uploadAudio);
router.get('/audio/:id', auth, ctrlUpload.downloadAudio);
router.delete('/audio/:id', auth, ctrlUpload.deleteAudio);
router.post('/audiosByIds', auth, ctrlUpload.getAudiosFromIds);

module.exports = router;

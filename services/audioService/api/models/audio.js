const mongoose = require('mongoose');

const audioSchema = new mongoose.Schema({
	originalname: String,
	owner: mongoose.Schema.Types.ObjectId,
	duration: Number,

	createdAt: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Audio', audioSchema);

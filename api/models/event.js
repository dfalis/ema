const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
	{
		typ: Number,
		content: String
	},
	{
		_id: false
	}
);

const eventSchema = new mongoose.Schema(
	{
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			select: false
		},
		name: {
			type: String,
			required: true
		},
		__v: {
			type: Number,
			select: false
		},
		notes: {
			type: [noteSchema],
			select: false
		},
		createdAt: {
			type: Date,
			select: false
		},
		updatedAt: {
			type: Date,
			select: false
		}
	},
	{
		timestamps: true
		// ,_id: false
	}
);

mongoose.model('Event', eventSchema);

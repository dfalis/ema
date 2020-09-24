/* NPM modules */
const logger = require('../helpers/logger');
const multer = require('multer');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const AudioFile = mongoose.model('Audio');

/* Node modules */
const fs = require('fs');
const child_process = require('child_process');
const path = require('path');

const allowedAudioTypes = /mp3|m4a|ogg|flac|aac|mpeg|mp4|webm/;
const ffmpegParams = '-vn -acodec aac';

// creates disk storage for multer to temporary store files
const tempDiskStorage = multer.diskStorage({
	// destination for temporary files
	destination: function(req, file, callback) {
		callback(null, './temp');
	},
	// sets name of files to {DATE}.{FILENAME}.{EXTENSION}
	// for example: "2019-03-18T19:14:40.filename.mp3"
	filename: function(req, file, callback) {
		// add UTC time before file name
		callback(
			null,
			`${new Date().toISOString().split('.', 1)[0]}.${file.originalname}`
		);
	}
});

// method for saving temporary files
const tempSaveFile = multer({
	// sets file storage to file system
	storage: tempDiskStorage,
	// limits for accepted form-data
	limits: {
		files: 1,
		parts: 2,
		fileSize: 1024 * 1024 * 25
	},
	// filter files for unwanted file types
	fileFilter: function(req, file, callback) {
		//check files mimetype (real file type) if is allowed
		let mimetype = allowedAudioTypes.test(file.mimetype.toLowerCase());

		// check files extension if is allowed
		let extname = allowedAudioTypes.test(
			path.extname(file.originalname).toLowerCase()
		);
		console.log(
			'[TempSaveFile]: ',
			`mimetype: ${file.mimetype}`,
			`ext: ${path.extname(file.originalname).toLowerCase()}`
		);
		// checks if mimetype and extension are allowed -> allow to save file
		if (mimetype && extname) {
			return callback(null, true);
		}
		// else return err in callback
		callback(
			'Error: File upload only supports the following filetypes - ' +
				allowedAudioTypes
		);
	}
}).single('file');

/**
 * Saves audio temporary, converts to m4a if necessary, saves audio to data folder and deletes temporary saved audio
 * @param {Request} req
 * @param {Response} res
 */
module.exports.uploadAudio = (req, res) => {
	logger.log('UploadAudio', 'Uploading audio');
	if (!req.payload._id) {
		logger.log('UploadAudio', 'No id included in token');
		return res.status(401).json({
			error: 'Unauthorized'
		});
	}

	// temporary save file from form-data
	tempSaveFile(req, res, err => {
		// return uploadFailed message on error while saving temp file
		if (err) {
			console.log('[TempSaveFile]: ', err);
			return res.status(500).json({ error: 'uploadFailed' });
		}
		// return noFileIncluded message if file row is not populated
		else if (!req.file) {
			logger.log('TempSaveFile', 'File not inluced');
			return res.status(200).json({ error: 'fileNotIncluded' });
		}
		logger.log('TempSaveFile', 'Temp file saved');

		const input = req.file.filename;
		const inputPath = `./temp/${input}`;

		// check if file exists
		fs.stat(inputPath, (err, stats) => {
			logger.log(
				'FsStat',
				'File does exist',
				'Trying to save metadata to database'
			);

			// create audio object from model and assign values
			let audio = new AudioFile();
			audio.originalname = path
				.basename(input, path.extname(input))
				.split(/\.(.+)/)[1];
			audio.owner = req.payload._id;

			// create document in db to save audio with id as name
			audio.save((err, savedAudio) => {
				if (err) {
					logger.log('AudioSave', 'Error while saving audio', err);
					fs.unlinkSync(inputPath, err => {
						return res.status(500).json({ error: err });
					});
				}
				let outputPath = `./data/${req.payload._id}/`;

				// create dir if it doesnt exist
				if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath);

				// convert file to .m4a, then save to db
				// create ffmpeg process to convert allowed types to m4a
				logger.log('FFMPEG', 'Started converting file');
				child_process.exec(
					`ffmpeg -i "${inputPath}" ${ffmpegParams} "${outputPath}${
						savedAudio._id
					}.m4a"`,
					(err, stdout, stderr) => {
						if (stdout || err) console.log(`'${stdout}'\n${err}`);
						logger.log('FFMPEG', 'Done converting file');

						// if file exists, unlink it
						fs.stat(inputPath, (err, stats) => {
							// console.log(stats);
							if (err) {
								console.log(err);
							}
							fs.unlink(inputPath, err => {
								if (err) {
									console.log(err);
								}
								logger.log('FsUnlink', 'Input file removed');
							});
						});

						// get duration from audio file
						child_process.exec(
							`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outputPath}${
								savedAudio._id
							}.m4a"`,
							(err, stdout, stderr) => {
								// add duration to document and update it
								savedAudio.duration = stdout || 0;
								savedAudio.save((err, resavedAudio) => {
									// return saved document
									if (err) {
										console.log(err);
										return res.status(500).json({ message: err });
									}
									return res.status(200).json(savedAudio);
								});
							}
						);
					}
				);
			});
		});
	});
};

/**
 * Sends audio data to user, sends parts if range header is included
 * @param {Request} req
 * @param {Response} res
 */
module.exports.downloadAudio = (req, res) => {
	const id = req.params.id;
	const filePath = `./data/${req.payload._id}/${id}.m4a`;

	// check if file exists
	fs.stat(filePath, (err, stats) => {
		if (err) {
			// return error if not found
			return res.status(404).json({ message: 'fileNotFound' });
		}

		// gets ranges and filesize
		const range = req.headers.range;
		const fileSize = stats.size;
		if (range) {
			// get desired values
			const parts = range.replace(/bytes=/, '').split('-');
			const start = parseInt(parts[0], 10);
			let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
			let chunksize = end - start + 1;

			// send just 1 MB or less if file ends
			const maxChunk = 1024 * 1024;
			if (chunksize > maxChunk) {
				end = start + maxChunk - 1;
				chunksize = end - start + 1;
			}

			// create head for partial file
			const head = {
				'Content-Range': `bytes ${start}-${end}/${fileSize}`,
				'Accept-Ranges': 'bytes',
				'Content-Length': chunksize,
				'Content-Type': 'audio/mp4'
			};
			console.log(`start: ${start}, end: ${end}, chunksize: ${chunksize}`);

			// write head to response with partial content status code
			res.writeHead(206, head);

			// create stream and send parts of file
			let stream = fs
				.createReadStream(filePath, { start: start, end: end })
				.on('open', () => {
					stream.pipe(res);
				})
				.on('error', err => {
					console.log('error', err);
					res.end(err);
				})
				.on('end', number => {
					console.log('end');
				});
		} else {
			// create head for whole file
			const head = {
				'Content-Length': fileSize,
				'Content-Type': 'audio/mp4'
			};
			logger.log('DownloadAudio', 'Sending whole file');

			// write head to response with success status code
			res.writeHead(200, head);

			//send whole file
			let stream = fs
				.createReadStream(filePath)
				.on('open', () => {
					stream.pipe(res);
				})
				.on('error', err => {
					console.log('error', err);
					res.end(err);
				})
				.on('end', number => {
					console.log('end');
				});
		}
	});
};

/**
 * Get list of audio files
 * @param {Request} req
 * @param {Response} res
 */
module.exports.getListOfAudios = (req, res) => {
	logger.log(
		'GetListOfAudios',
		'Getting list of audios for user ' + req.payload._id
	);

	// find all audio files that belong to owner
	AudioFile.find({ owner: req.payload._id }).exec((err, audios) => {
		if (err) {
			logger.log('GetListOfAudios', 'Error while getting audios', err);
			return res.status(400).json({ error: err });
		}

		// send array of infos of audio files
		return res.status(200).json(audios);
	});
};

/**
 * Deletes audio by id from database
 * @param {Request} req
 * @param {Response} res
 */
module.exports.deleteAudio = (req, res) => {
	logger.log('DeleteAudio', 'Deleting audio');
	const id = mongodb.ObjectId(req.params.id);

	// find audio file by id and owner, than remove it from database
	AudioFile.findOneAndDelete({ _id: id, owner: req.payload._id }).exec(
		(err, audio) => {
			if (err) {
				// error occured while deleting file from db
				logger.log('DeleteAudio', 'Error while deleting file from db', err);
				return res.status(500).json({ error: err });
			} else if (audio == null) {
				// file was not found
				return res.status(404).json({ error: 'fileNotFound' });
			}
			// delete file from filesystem
			fs.unlink(`./data/${req.payload._id}/${id}.m4a`, err => {
				if (err) {
					console.log(err);
				}
			});

			// return info of deleted audio
			return res.status(200).json(audio);
		}
	);
};

module.exports.getAudiosFromIds = (req, res) => {
	logger.log('GetAudiosFromIds', 'getting audios');

	if (!Array.isArray(req.body.ids)) {
		return res.status(400).json({ message: 'invalidData' });
	}

	AudioFile.find({
		_id: { $in: req.body.ids },
		owner: req.payload._id
	})
		.select('-__v')
		.exec((err, audios) => {
			return res.status(200).json(audios);
		});
};

// Node modules
const fs = require('fs');
const pathModule = require('path');

const deleteFolderRecursive = path => {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function(file, index) {
			const curPath = pathModule.join(path, file);
			// var curPath = path + '/' + file;
			if (fs.lstatSync(curPath).isDirectory()) {
				// recurse
				deleteFolderRecursive(curPath);
			} else {
				// delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
};

modules.export = deleteFolderRecursive;

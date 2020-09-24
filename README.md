# ROP

Old school project from 2018. First time trying to use microservices architecture.

My part was backend in NodeJS Express and small help in Angular.
My friends part was frontend in Angular.

Frontend is not working. Backend paths should work without frontend.

## Prerequisites

Project was developed under these technologies.

```
MongoDB: any version
Node: 8+
Angular: version 7.2.1
```

# TODOS:

1. Place inside authentication middleware

   ```javascript
   if (!req.payload._id) {
   	logger.log('ListEvent', 'No id included in token');
   	return res.status(401).json({
   		message: 'Unauthorized'
   	});
   }
   ```

2. Name of the audio can exist in temp folder, try to do with audioID from db instead {hexstring}.m4a
   ```javascript
   const tempDiskStorage = multer.diskStorage({
   	destination: function(req, file, callback) {
   		callback(null, './temp');
   	},
   	filename: function(req, file, callback) {
   		crypto.randomBytes(16, (err, buf) => {
   			if (err) {
   				console.log('[Temp Disk Storage]: ', err);
   				callback(err);
   			}
   			const filename = buf.toString('hex') + path.extname(file.originalname);
   			callback(null, filename);
   		});
   	}
   });
   ```

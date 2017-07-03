var multer = require('multer');

function FileHelper(){

	this.upload = multer({
	     storage: multer.diskStorage({
		     destination: function(dir, req, file, callback) {
		         callback(null, dir);
		     },
		     filename: function(dir, req, file, callback) {
		     	 var fileName = file.fieldname + "_" + Date.now() + "_" + file.originalname;		     	 
		         callback(null, fileName);
		     }	     
		})
	}).array("imgUploader", 1); //Field name and max count	
}

module.exports = new FileHelper();
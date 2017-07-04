var base64Img = require('base64-img');

function FileHelper(){

	this.uploadProfileImage = function(profile_image, profileImagePath, callback){
		var profileImagePath = "uploads/profile_images";
    	              
      if(profile_image != ""){
          var profileImageName = new Date().getTime();
          var imageTypeRegularExpression      = /\/(.*?)$/;
          var matches = profile_image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);// splitit base64 data.
          
          var imageTypeDetected   = matches[1].match(imageTypeRegularExpression);// get image type from base64 data.

          if(imageTypeDetected.length && (imageTypeDetected[1] == "jpeg" || imageTypeDetected[1] == "jpg" || imageTypeDetected[1] == "png")){
              profile_image = base64Img.imgSync(profile_image, profileImagePath, profileImageName);// upload the image on server

            if(profile_image){
              profile_image = profileImageName+"."+imageTypeDetected[1];// the name of image on server and which is to be stored in DB
              callback(null, profile_image);
            }else{
              callback("Image not uploaded on server.");
            }  
          }else{
            callback("Image format is not valid.");
          }
          
          
        }


	};
	
}

module.exports = new FileHelper();
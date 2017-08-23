var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
/*var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');*/
var handlebars = require('handlebars');
var fs = require('fs');

var config = require('./../../../config');
var connection = require('./../../../database');
//var userHelper = require('./../helpers/user-helper');
var commonHelper = require('./../../helpers/common-helper');
var fileHelper = require('./../../helpers/file-helper');
var base64Img = require('base64-img');
var dbModel = require('./../../models/db-model');
//var userModel = require('./../../../user-model');

var confirmed = status = 1;

function VendorController() {

  // Authenticate Vendor User in DB
  this.login=function(req,res){

    var data = req.body;
  
    var email=req.body.email;
    var password=req.body.password;

    var cond = [
      { 'email' : { 'val': data.email, 'cond': '='} }
      //{ 'status' : { 'val': status, 'cond': '='} },
    ];

    dbModel.find("vendor", "id,password,parent_id,name,email,phone_number,status,CONCAT('"+config.RESOURCE_URL+"',REPLACE(profile_image, '+','%2B')) as profile_image", cond, '', '', function(error, result){
      if(error){
          res.status(config.HTTP_SERVER_ERROR).send({
            status:config.ERROR,
            code: config.HTTP_SERVER_ERROR,
            message:'Unable to process request!'
          });        
      }else{

        if(result.length > 0 && result[0].id > 0){

          if(result[0].status == status){

            bcrypt.compare(password, result[0].password, function(err, response) {

              if(err) {
                //console.log(err);
                res.status(config.HTTP_BAD_REQUEST).send({
                  status:config.ERROR,
                  code: config.HTTP_BAD_REQUEST,             
                  message:"Username & Password does not exist"
                 });                    
              }else{

                // Password Matched
                if(response == true){

                  var token=jwt.sign({id: result[0].id, parent_id : result[0].parent_id, role: config.ROLE_VENDOR},process.env.SECRET_KEY,{
                      expiresIn:3000
                  });

                  res.status(config.HTTP_SUCCESS).send({
                    status:config.SUCCESS,
                    code: config.HTTP_SUCCESS,
                    message:'Logged in successfully.',
                    token: token,
                    result:{
                      name: result[0].name,
                      email: result[0].email,
                      phone_number : result[0].phone_number,
                      profile_image : result[0].profile_image
                    }

                  }); 

                }else{
                  res.status(config.HTTP_BAD_REQUEST).send({
                    status:config.ERROR,
                    code: config.HTTP_BAD_REQUEST, 
                    message:"Username & Password does not exist"
                  });                          
                }
              }              

            });

          }else{

            res.status(config.HTTP_FORBIDDEN).send({
              status:config.ERROR,
              code: config.HTTP_FORBIDDEN,
              message:'Please contact with administrator.'
            });            

          }


        }else{

          res.status(config.HTTP_NOT_FOUND).send({
            status:config.ERROR,
            code: config.HTTP_NOT_FOUND,
            message:'Username & Password does not exist'
          });

        }
      }
    });
  }

  // Get Vendor Profile Information 
  this.view = function(req, res) {

    if(req.decoded.role != config.ROLE_VENDOR){
        res.status(config.HTTP_FORBIDDEN).send({
          status: config.ERROR, 
          code : config.HTTP_FORBIDDEN, 
          message: "You dont have permission to view vendor!"
        });       
      }else{
          
        var id = req.decoded.id; // Get Vendor Id 
        dbModel.find("vendor", "id,parent_id,name,email,phone_number, CONCAT('"+config.RESOURCE_URL+"',REPLACE(profile_image, '+','%2B')) as profile_image", "id="+id, "", "", function(error, result){
          if (error) {          
              res.status(config.HTTP_BAD_REQUEST).send({
              status: config.ERROR, 
              code : config.HTTP_BAD_REQUEST, 
              message: "Failed to get Customer Information",
              error: error
            });          
          }else{

            if(result.length > 0){

              res.status(config.HTTP_SUCCESS).send({
                status: config.SUCCESS,
                code: config.HTTP_SUCCESS,
                message:"Vendor information found",
                result: result[0]                       
              });

            }else{
              
              res.status(config.HTTP_NOT_FOUND).send({
                status:config.ERROR,
                code: config.HTTP_NOT_FOUND, 
                message:"Failed to get Customer Information"
              });

            }
          }
        });
      }
  };

  // Update Vendor Profile
  this.update=function(req,res){
    var data = req.body;
    
    if(req.decoded.role != config.ROLE_VENDOR){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to update vendor!"
      });       
    }else{

      var currDate = new Date();
      var id = req.decoded.id; // Get Vendor Id 

      var post = {
          name: data.name,
          //email: data.email,
          profile_image: data.profile_image,
          phone_number: data.phone_number,
          updated_at: currDate
      };      

      if(data.password != '' && data.password != undefined){
        post.password = bcrypt.hashSync(data.password, config.SALT_ROUND);
      }    


      dbModel.findOne('vendor', 'id', id, function(err, result) {
          if (err) {
              res.status(config.HTTP_SERVER_ERROR).send({
                  status: config.ERROR,
                  code: config.HTTP_SERVER_ERROR,
                  message: "Vendor has been not updated.",
                  errors: err
              });
          } else {
              if (!result.length) {
                  res.status(config.HTTP_NOT_FOUND).send({
                      status: config.ERROR,
                      code: config.HTTP_NOT_FOUND,
                      message: "The vendor not found."
                  });
              } else {
                  var vendorImagePath = "public/uploads/profile";
                  if (post.profile_image) {
                      fileHelper.uploadImage(post.profile_image, vendorImagePath, function(err, image) {
                          if (err) {
                              res.status(config.HTTP_BAD_REQUEST).send({
                                status: config.ERROR,
                                code: config.HTTP_BAD_REQUEST,
                                message: err
                              });
                          } else {
                              post.profile_image = image;
                          }
                      });
                  } else {
                      if(result[0].profile_image) {
                          post.profile_image = result[0].profile_image;
                      }
                  }

                  dbModel.save('vendor', post, id, function(err, result) {
                      //console.log(err)
                      if (err) {
                          res.status(config.HTTP_SERVER_ERROR).send({
                            status: config.ERROR,
                            code: config.HTTP_SERVER_ERROR,
                            message: 'Vendor has been not updated.'
                          });
                      } else {
                          res.status(config.HTTP_SUCCESS).send({
                            status: config.SUCCESS,
                            code: config.HTTP_SUCCESS,
                            message: 'Vendor has been updated successfully.'
                          });
                      }
                  });
              }
          }
      });
    }  
  }

  // Change vendor user password
  this.changePassword = function(req,res){
    if(req.decoded.role != config.ROLE_VENDOR){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to update vendor password!"
      });       
    }else{
      
      var id = req.decoded.id;
      var oldPassword = req.body.old_password;
      var newPassword = req.body.new_password;
      var newPasswordConfirmation = req.body.new_password_confirmation;

      if(newPassword !== newPasswordConfirmation){
        res.status(config.HTTP_BAD_REQUEST).send({
            status: config.ERROR,
            code: config.HTTP_BAD_REQUEST,
            message: "Password and confirmed password not matched."
        });   

        return;     
      }

      dbModel.findOne('vendor', 'id', id, function(err, results) {
        if(err){
          res.status(config.HTTP_SERVER_ERROR).send({
              status: config.ERROR,
              code: config.HTTP_SERVER_ERROR,
              message: "Unable to update Password.",
              errors: err
          });          
        }else{
          if(results.length > 0){
            bcrypt.compare(oldPassword, results[0].password, function(err, response) {
              if(err) {
                res.status(config.HTTP_BAD_REQUEST).send({
                  status:config.ERROR,
                  code: config.HTTP_BAD_REQUEST,             
                  message:"Old Password not matched"
                 });                    
              }else{
                if(response == true){
                  var hashedPassword = bcrypt.hashSync(newPassword, config.SALT_ROUND);

                  var data = {
                    "password": hashedPassword
                  };

                  dbModel.save("vendor",data, id, function(error, result){
                    if(error){
                      res.status(config.HTTP_SERVER_ERROR).send({
                        status:config.ERROR,
                        code: config.HTTP_SERVER_ERROR,
                        message:'Unable to update Password.'
                      });                        
                    }else{
                      if(result.affectedRows > 0){
                        res.status(config.HTTP_SUCCESS).send({
                          status:config.SUCCESS,
                          code: config.HTTP_SUCCESS,
                          message:"Password updated successfully!"
                        });                         
                      } else {
                        res.status(config.HTTP_SERVER_ERROR).send({
                          status:config.ERROR,
                          code:config.HTTP_SERVER_ERROR,
                          message:"Unable to update Password."
                        });
                      }
                    }
                  });

                } else {
                  res.status(config.HTTP_BAD_REQUEST).send({
                    status:config.ERROR,
                    code: config.HTTP_BAD_REQUEST,             
                    message:"Old Password not matched"
                  }); 
                }
              }
            });

          }else{
            res.status(config.HTTP_SERVER_ERROR).send({
              status: config.ERROR,
              code: config.HTTP_SERVER_ERROR,
              message: "Unable to update Password.",
            });
          }
        }
      });

    } // else close    

  }

/*  // delete admin users 
  this.deleteUser = function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to create user!"
      });       
    }else{
      
      var id = req.body.id;

      connection.acquire(function(err, con) {
        con.query('SELECT * FROM users WHERE id = ?',[id], function (error, results, fields) {
          if (error) {
              res.status(config.HTTP_SERVER_ERROR).send({
                status:config.ERROR,
                code: config.HTTP_SERVER_ERROR,
                message:'There are some error with query'
              })
          }else{
            
              con.query('delete from users where id = ? and type = 2',[id], function (error, results, fields) {
                con.release();
                if (error) {
                    res.status(config.HTTP_SERVER_ERROR).send({
                      status:config.ERROR,
                      code: config.HTTP_SERVER_ERROR,
                      message:'Unable to delete User.'
                    });
                }else{
                  if(results.affectedRows > 0){
                    res.status(config.HTTP_SUCCESS).send({
                      status:config.SUCCESS,
                      code: config.HTTP_SUCCESS,
                      message:'User deleted successfully.'
                    });
                  }else{
                    res.status(config.HTTP_NOT_FOUND).send({
                      status:config.ERROR,
                      code: config.HTTP_NOT_FOUND,
                      message:'User not found.'
                    });
                  }
                }
              });
            
          }
        });
      });

    } // else close    

  }

  // get all users
  this.getAllUsers = function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to view users!"
      });       
    }else{

      var name = req.body.name;
      var email = req.body.email;
      var queryString = "SELECT `id`, `name`, `email`, `country_id`, `province_id`, `address`, `phone_number`, `profile_image`, `confirmed`, `status`, `type` FROM users WHERE `type` = 2 ";

      if(name != "" && name != undefined){
        queryString += " and `name` like '%"+name+"%'";
      }
      if(email != "" && email != undefined){
          queryString += " and `email` like '%"+email+"%'";
      }
      

      connection.acquire(function(err, con) {
        con.query(queryString, function (error, results, fields) {
          con.release();

          if (error) {
              res.status(config.HTTP_SERVER_ERROR).send({
                status:config.ERROR,
                code: config.HTTP_SERVER_ERROR,
                message:'There are some error with query'
              })
          }else{
            if(results.length > 0){
              res.status(config.HTTP_SUCCESS).send({
                  status: config.SUCCESS,
                  code: config.HTTP_SUCCESS,
                  message: results.length+" User found",
                  result:results
              });
            }else{
              res.status(config.HTTP_BAD_REQUEST).send({
                  status:config.ERROR,
                  code: config.HTTP_BAD_REQUEST, 
                  message:"No users found"
              }); 
            } 

          }
        });
      });

    } // else close    

  }



  // Forget Password
  this.forgetPassword = function(req, res){
    //console.log(commonHelper.generatePassword(10));
    var email=req.body.email;
    connection.acquire(function(err, con) {
      if (err) {
        res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR,          
            message: "Unable to process request!",
            errors : err
        });
      } else {
        con.query('SELECT id,name FROM users WHERE email = ? AND confirmed = ? AND status = ?', [email, confirmed, status], function(err, result){
          con.release();
          if (err) {
            res.status(config.HTTP_SERVER_ERROR).send({
              status: config.ERROR, 
              code : config.HTTP_SERVER_ERROR, 
              message : "Unable to process request!", 
              errors : err
            });
          }else{
            if(result.length > 0 && result[0].id > 0){
              smtpTransport = config.SMTP_TRANSPORT;
              password = commonHelper.generatePassword(10);

             //update password query
              var hashedUpdatedPassword = bcrypt.hashSync(password, config.SALT_ROUND);
              var resetQuery = "update `users` set `password` = '"+hashedUpdatedPassword+"' where `id` = '"+result[0].id+"'";
              con.query(resetQuery, function (error, results, fields) {
                  console.log(results);
                  if (error) {
                          res.status(config.HTTP_SERVER_ERROR).send({
                            status:config.ERROR,
                            code: config.HTTP_SERVER_ERROR,
                            message:'Unable to process request!'
                          });
                      }
              });
             //end update password query  

              // Send on email Updated Password
              fs.readFile(config.PROJECT_DIR + '/templates/adminForgetPassword.html', {encoding: 'utf-8'}, function (err, html) {
                if (err) {
                  res.status(config.HTTP_SERVER_ERROR).send({
                      status: config.ERROR, 
                      code : config.HTTP_SERVER_ERROR,          
                      message: "Unable to process request!"
                  });
                } else {
                    
                  var confirmation_code = crypto.randomBytes(64).toString('hex');
                  //console.log(smtpTransport);
                  var template = handlebars.compile(html);
                  var replacements = {
                       userName: result[0].name,
                       //resetLink : config.BASE_URL+"/api/admin/reset/"+confirmation_code,
                       adminLink : config.baseUrl+"/admin/",
                       userEmail: email,
                       userPassword : password,
                  };

                  var htmlToSend = template(replacements);
                  var mailOptions = {
                      from: config.ADMIN_FROM_EMAIL,
                      to : email,
                      subject : 'Your password reset link to change password.',
                      html : htmlToSend
                   };
                
                  smtpTransport.sendMail(mailOptions, function (error, response) {
                    if (error) {
                        console.log(error);
                        res.status(config.HTTP_SERVER_ERROR).send({
                            status: config.ERROR, 
                            code : config.HTTP_SERVER_ERROR,          
                            message: "Unable to process request!",
                        });                                
                    }else{
                  

                      // Update databse to save reset token.
                      res.status(config.HTTP_SUCCESS).send({
                        status: config.SUCCESS, 
                        code : config.HTTP_SUCCESS, 
                        message: "Check your inbox for a password reset message."
                      });
                    }
                  });
                }
              });
            }else{
              res.status(config.HTTP_NOT_FOUND).send({
                status: config.ERROR, 
                code : config.HTTP_NOT_FOUND, 
                message: "You are not registered with us."
              });
            }
          }
        });
      }
    });
  }*/

}

module.exports = new VendorController();
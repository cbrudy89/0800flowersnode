var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
/*var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');*/
var handlebars = require('handlebars');
var fs = require('fs');

var config = require('./../../config');
var connection = require('./../../database');
//var userHelper = require('./../helpers/user-helper');
var commonHelper = require('./../helpers/common-helper');
var fileHelper = require('./../helpers/file-helper');
var base64Img = require('base64-img');
//var userModel = require('./../../../user-model');

var confirmed = status = 1;

function AdminController() {

  // Create New Admin User
  this.create=function(req,res,next){

    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to create user!"
      });       
    }else{

      var name=req.body.name;
      var email=req.body.email;
      var password=req.body.password;
      var country_id = req.body.country_id;
      var province_id = req.body.province_id;
      var address = req.body.address;
      var phone_no = req.body.phone_no;
      var status = req.body.status;
      var type = 2; // 2 For Sub admin
      var profile_image = "";
      if(req.body.profile_image != ""){
        profile_image = req.body.profile_image;
      }

      /*var confirmed = 1;
      var status = 1;*/
      var confirmation_code = crypto.createHash('sha512').update(email).digest('hex');

      connection.acquire(function(err, con) {
        bcrypt.hash(password, config.SALT_ROUND, function(err, hash) {
          if (err) {
            console.log(err);
            res.status(config.HTTP_SERVER_ERROR).send({
              status: config.ERROR, 
              code : config.HTTP_SERVER_ERROR, 
              message: "Unable to register user!"
            });
          }else{

            // Checking if user email already exist in database
            con.query('SELECT id FROM users WHERE email = ?', [email], function(err, result){
              if (err) {
                res.status(config.HTTP_SERVER_ERROR).send({
                  status: config.ERROR, 
                  code : config.HTTP_SERVER_ERROR, 
                  message : "Unable to register user!", 
                  errors : err
                });
              }else{
                if(result.length > 0 && result[0].id > 0){
                  res.status(config.HTTP_ALREADY_EXISTS).send({
                    status: config.ERROR, 
                    code : config.HTTP_ALREADY_EXISTS, 
                    message: "The specified account already exists."
                  });
                }else{
                    
                  var hashedPassword = hash;
                  var profileImagePath = "uploads/profile_images";
                  

                    if(profile_image != ""){

                      fileHelper.uploadImage(profile_image, profileImagePath, function(err, result){
                        if(err){
                          res.status(config.HTTP_BAD_REQUEST).send({
                            status: config.ERROR, 
                            code : config.HTTP_BAD_REQUEST, 
                            message: err
                          });
                        }else{
                          profile_image = result;
                        }

                      });

                      
                      
                      
                    }
                    
                  
                  

                  // Store hash in your password DB.
                  con.query('INSERT INTO users(name,email,password,country_id,province_id,address,phone_number,profile_image,confirmed,status,type,confirmation_code) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',[name,email,hashedPassword,country_id,province_id,address,phone_no,profile_image,confirmed,status,type,confirmation_code], function (err, results, fields) {
                    con.release();
                    if (err) {
                      console.log(err);
                      res.status(config.HTTP_ALREADY_EXISTS).send({
                        status: config.ERROR, 
                        code : config.HTTP_ALREADY_EXISTS, 
                        message: 'Unable to register user!'
                      });
                    }else{
                      res.status(config.HTTP_SUCCESS).send({
                        status: config.SUCCESS, 
                        code : config.HTTP_SUCCESS, 
                        message: 'User register successfully!'
                      });
                    }
                  });
                }
              }
            });
          }        
        });
      });      
    }    
  }
  
  // Authenticate Admin User in DB
  this.login=function(req,res){
  
    var email=req.body.email;
    var password=req.body.password;
    var type=req.body.type;

    connection.acquire(function(err, con) {
      con.query('SELECT * FROM users WHERE email = ? AND confirmed = ? AND status = ?',[email, confirmed, status], function (error, results, fields) {
        con.release();
        if (error) {
          res.status(config.HTTP_SERVER_ERROR).send({
            status:config.ERROR,
            code: config.HTTP_SERVER_ERROR,
            message:'Unable to login!'
          });
        }else{
          if(results.length >0){
            bcrypt.compare(password, results[0].password, function(err, response) {
                // res == true 
              if(err) {
                res.status(config.HTTP_BAD_REQUEST).send({
                  status:config.ERROR,
                  code: config.HTTP_BAD_REQUEST,             
                  message:"Email and password does not match"
                 });                    
              }else{

                // Password Matched
                if(response == true){
                  var token=jwt.sign({id: results[0].id, role : config.ROLE_ADMIN},process.env.SECRET_KEY,{
                      expiresIn:3000
                  });
                  res.status(config.HTTP_SUCCESS).send({
                      status: config.SUCCESS,
                      code: config.HTTP_SUCCESS,
                      message:"Logged in successfully!",
                      token: token,
                      result:{
                        name: results[0].name,
                        email: results[0].email,
                        country_id: results[0].country_id,
                        province_id : results[0].province_id,
                        address : results[0].address,
                        phone_number : results[0].phone_number,
                        profile_image : results[0].profile_image
                      }
                  });

                }else{
                  res.status(config.HTTP_BAD_REQUEST).send({
                    status:config.ERROR,
                    code: config.HTTP_BAD_REQUEST, 
                    message:"Email and password does not match"
                  });                          
                }
              }
            });           
          }
          else{
            res.status(config.HTTP_NOT_FOUND).send({
              status:config.ERROR,
              code:config.HTTP_NOT_FOUND,
              message:"Email does not exits"
            });
          }
        }
      });
    });
  }

  // Update admins profile
  this.updateProfile=function(req,res){

    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to create user!"
      });       
    }else{
      
      var id = req.body.id;
      var name = req.body.name;
      var email = req.body.email;
      var password = req.body.password;
      var countryId = req.body.country_id;
      var provinceId = req.body.province_id;
      var address = req.body.address;
      var phoneNumber=req.body.phone_number;
      var status=req.body.status;
      var profile_image = "";
      if(req.body.profile_image != ""){
        profile_image = req.body.profile_image;
      }

      connection.acquire(function(err, con) {

        var query = "update `users` set `name` = '"+name+"', `email` = '"+email+"', `country_id` = '"+countryId+"', `province_id` = '"+provinceId+"', `address` = '"+address+"', `phone_number` = '"+phoneNumber+"', `status` = '"+status+"'";        

        if(password != "" && password != undefined){
          hashedPassword = bcrypt.hashSync(password, config.SALT_ROUND);
          query += ", `password` = '"+hashedPassword+"'";  
            
        }
        if(profile_image != ""){
          var profileImagePath = "uploads/profile_images";
                  
          if(profile_image != ""){
            
            fileHelper.uploadImage(profile_image, profileImagePath, function(err, result){
              if(err){
                res.status(config.HTTP_BAD_REQUEST).send({
                  status: config.ERROR, 
                  code : config.HTTP_BAD_REQUEST, 
                  message: err
                });
              }else{
                profile_image = result;
              }

            });
              
            query += ", `profile_image` = '"+profile_image+"'";    
            
            
          }
        }
        query += " where `id` = '"+id+"'";
        
                
        con.query(query, function (error, results, fields) {
          con.release();
          if (error) {
              res.status(config.HTTP_SERVER_ERROR).send({
                status:config.ERROR,
                code: config.HTTP_SERVER_ERROR,
                message:'Unable to update user.'
              });
          }else{
            if(results.affectedRows >0){
              res.status(config.HTTP_SUCCESS).send({
                status:config.SUCCESS,
                code: config.HTTP_SUCCESS,
                message:"User updated successfully!"
              });             
            }
            else{
              res.send({
                status:config.ERROR,
                code:config.HTTP_FORBIDDEN,
                message:"Unable to update user."
              });
            }
          }
        });
      });
    }  
  }

  // change admin user password
  this.changePassword = function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to create user!"
      });       
    }else{
      
      var id = req.decoded.id;
      var oldPassword = req.body.old_password;
      var newPassword = req.body.new_password;
      var newPasswordConfirmation = req.body.new_password_confirmation;

      connection.acquire(function(err, con) {
        con.query('SELECT * FROM users WHERE id = ?',[id], function (error, results, fields) {
          if (error) {
              res.status(config.HTTP_SERVER_ERROR).send({
                status:config.ERROR,
                code: config.HTTP_SERVER_ERROR,
                message:'There are some error with query'
              })
          }else{
            if(results.length >0){
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
                    var query = "update `users` set `password` = '"+hashedPassword+"' where `id` = '"+id+"'";
                    con.query(query, function (error, results, fields) {
                      con.release();
                      if (error) {
                          res.status(config.HTTP_SERVER_ERROR).send({
                            status:config.ERROR,
                            code: config.HTTP_SERVER_ERROR,
                            message:'Unable to update Password.'
                          });
                      }else{
                        if(results.affectedRows >0){
                           res.status(config.HTTP_SUCCESS).send({
                                status:config.SUCCESS,
                                code: config.HTTP_SUCCESS,
                                message:"Password updated successfully!"
                            });
                         
                        }
                        else{
                          res.send({
                            status:config.ERROR,
                            code:config.HTTP_FORBIDDEN,
                            message:"Unable to update Password."
                          });
                        }
                      }
                    });

                  } else{
                    res.status(config.HTTP_BAD_REQUEST).send({
                      status:config.ERROR,
                      code: config.HTTP_BAD_REQUEST,             
                      message:"Old Password not matched"
                    }); 
                  }
                }
              });
            }
          }
        });
      });

    } // else close    

  }

  // delete admin users 
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
        message: "You dont have permission to create user!"
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

  // Get User Information 
  this.getUser = function(req, res) {

    if(req.decoded.role != config.ROLE_ADMIN){
        res.status(config.HTTP_FORBIDDEN).send({
          status: config.ERROR, 
          code : config.HTTP_FORBIDDEN, 
          message: "You dont have permission to create Country!"
        });       
      }else{
        var id = req.params.id;
          connection.acquire(function(err, con) {
            if (err) {
                res.status(config.HTTP_BAD_REQUEST).send({
                status: config.ERROR, 
                code : config.HTTP_BAD_REQUEST, 
                message: "sdfsdf"
              });  
            }   
            con.query('select id, name, email, country_id, province_id, address, phone_number, profile_image, status from users where id = ?', [id], function(err, result) {
              if (err) {
                res.status(config.HTTP_NOT_FOUND).send({
                          status:config.ERROR,
                          code: config.HTTP_NOT_FOUND,             
                          message:"No records found"
                         });
              } else {
                if(result.length > 0){
                  result[0].profile_image = '/uploads/profile_image/'+result[0].profile_image;

                  res.status(config.HTTP_SUCCESS).send({
                              status: config.SUCCESS,
                              code: config.HTTP_SUCCESS,
                              message:"User found",
                              result: result[0]
                          
                  });
                }else{
                  res.status(config.HTTP_BAD_REQUEST).send({
                      status:config.ERROR,
                      code: config.HTTP_BAD_REQUEST, 
                      message:"Failed to get Customer Information"
                  }); 
                }
              }        
              con.release();
            });
          });

      }
  };

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
  }


}

module.exports = new AdminController();
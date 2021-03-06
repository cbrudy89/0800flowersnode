var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var async = require('async');
var Sync = require('sync');
var handlebars = require('handlebars');
var fs = require('fs');

var Joi = require('joi');

var config = require('./../../config');
var connection = require('./../../database');
//var userHelper = require('./../helpers/user-helper');
var customerModel = require('./../models/customer-model');
var notificationModel = require('./../models/admin/notification-model');
var dbModel = require('./../models/db-model');
var commonHelper = require('./../helpers/common-helper');

function UserController() {

  // Register New Frontend User
  this.register = function(req,res,next){   
    
    var first_name=req.body.first_name;
    var last_name=req.body.last_name;
    var email=req.body.email;
    var confirm_email = req.body.confirm_email;
    var password = req.body.password;
    var confirm_password = req.body.confirm_password;

    connection.acquire(function(err, con) {
      bcrypt.hash(password, config.SALT_ROUND, function(err, hash) {
        if (err) {
          console.log(err);
          res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR, 
            message: "Due to some error, customer is not registered yet. Please try again!"
          });
        }else{

          // Checking if user email already exist in database
          customerModel.isEmailExist(email, function(err, result){
            if (err) {
              res.status(config.HTTP_SERVER_ERROR).send({
                status: config.ERROR, 
                code : config.HTTP_SERVER_ERROR, 
                message : "Due to some error, customer is not registered yet. Please try again!"
              });
            }else{
              if(result.length > 0 && result[0].id > 0){
                res.status(config.HTTP_ALREADY_EXISTS).send({
                  status: config.ERROR, 
                  code : config.HTTP_ALREADY_EXISTS, 
                  message: "The email has already been taken."
                });
              }else{
                
                var userData = {
                  first_name : first_name,
                  last_name : last_name,
                  email : email,
                  password: hash,
                  confirmation_code: 0,
                  status : 1
                }

                // Store hash in your password DB.

                customerModel.create(userData, function (err, results) {
                  if (err) {
                    console.log(err);
                    res.status(config.HTTP_SERVER_ERROR).send({
                      status: config.ERROR, 
                      code : config.HTTP_SERVER_ERROR, 
                      message: 'Due to some error, customer is not registered yet. Please try again!'
                    });
                  }else{

                    // Insert Into Notification Table
                    var curr_date  = new Date();

                    notifyData = {
                        'from_id':results.insertId,
                        'to_id':1,
                        'type':'Customer',
                        'action':'Register',
                        'msg':'New user (<i>'+first_name+' '+last_name+'</i>) has been registered',
                        'status':'0',
                        'details':"{'first_name': '"+first_name+"','last_name':'"+last_name+"','email':'"+email+"','user_id':'"+results.insertId+"'}",
                        'created_at':curr_date,
                        'updated_at':curr_date
                    };

                    // Save notification to table
                    notificationModel.create(notifyData, function(err, result){
                       if(err) {
                          res.status(config.HTTP_SERVER_ERROR).send({
                              status: config.ERROR, 
                              code : config.HTTP_SERVER_ERROR,          
                              message: "Due to some error, customer is not registered yet. Please try again!"
                          });                         
                       }else{
                          
                          // Send on email
                          fs.readFile(config.PROJECT_DIR + '/templates/welcome.html', {encoding: 'utf-8'}, function (err, html) {
                            if (err) {
                              console.log(err);
                            } else {
                                
                              var template = handlebars.compile(html);
                              var replacements = {
                                   first_name: first_name,
                                   adminLink : config.SITE_URL,
                              };

                              var htmlToSend = template(replacements);
                              var mailOptions = {
                                  from: config.ADMIN_FROM_EMAIL,
                                  to : email,
                                  subject : 'Welcome to 18FInternational',
                                  html : htmlToSend
                               };
                              
                              smtpTransport = config.SMTP_TRANSPORT;
                              smtpTransport.sendMail(mailOptions, function (error, response) {
                                if (error) {
                                  console.log(error);                         
                                }                         
                              });
                            }
                          });
                          // Fs End Here

                          var token=jwt.sign({id: results.insertId, role : config.ROLE_CUSTOMER},process.env.SECRET_KEY,{
                            expiresIn:3000
                          });

                          res.status(config.HTTP_SUCCESS).send({
                            status: config.SUCCESS, 
                            code : config.HTTP_SUCCESS, 
                            message: 'Thank you for registering with us!',
                            token : token,
                            result:{
                              first_name: first_name,
                              last_name: last_name,
                              email : email
                            }
                          });                         

                       }
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

  // Authenticate Frontend User
  this.login=function(req,res){
  
    var email=req.body.email;
    var password=req.body.password;

    var cond = [
      { 'email' : { 'val': email, 'cond': '='} },
      { 'status' : { 'val': 1, 'cond': '='} },
    ];

    customerModel.query('customers', cond,'','', function (error, results) {
      if (error) {
        res.status(config.HTTP_SERVER_ERROR).send({
          status:config.ERROR,
          code: config.HTTP_SERVER_ERROR,
          message:'Due to some error, unable to login. Please try again!'
        });
      }else{

        if(results.length >0){
          bcrypt.compare(password, results[0].password, function(err, response) {
              // res == true 
            if(err) {
              res.status(config.HTTP_SERVER_ERROR).send({
                status:config.ERROR,
                code: config.HTTP_SERVER_ERROR,             
                message:"Due to some error, unable to login. Please try again!"
               });                    
            }else{

              // Password Matched
              if(response == true){
                var token=jwt.sign({id: results[0].id, role : config.ROLE_CUSTOMER},process.env.SECRET_KEY,{
                    expiresIn:config.JWT_EXPIRATION_TIME
                });
                res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS,
                    code: config.HTTP_SUCCESS,
                    message:"Logged in successfully!",
                    token: token,
                    result:{
                      id: results[0].id,
                      first_name: results[0].first_name,
                      last_name: results[0].last_name,
                      email: results[0].email
                      /*country_id: results[0].country_id,
                      province_id : results[0].province_id,
                      address : results[0].address,
                      phone_number : results[0].phone_number,
                      profile_image : results[0].profile_image*/
                    }
                });

              }else{
                res.status(config.HTTP_NOT_FOUND).send({
                  status:config.ERROR,
                  code: config.HTTP_NOT_FOUND, 
                  message:"Email & Password not correct. Please try again."
                });                          
              }
            }
          });           
        }
        else{
          res.status(config.HTTP_NOT_FOUND).send({
            status:config.ERROR,
            code:config.HTTP_NOT_FOUND,
            message:"Email & Password not correct. Please try again."
          });
        }
      }
    });
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

        var cond = [
          { 'email' : { 'val': email, 'cond': '='} },
          { 'status' : { 'val': 1, 'cond': '='} },
        ];

        customerModel.query('customers', cond, '', '', function(err, results){
          if (err) {
            res.status(config.HTTP_SERVER_ERROR).send({
              status: config.ERROR, 
              code : config.HTTP_SERVER_ERROR, 
              message : "Unable to process request!", 
              errors : err
            });
          }else{
            if(results.length > 0 && results[0].id > 0){

              var confirmation_code = crypto.randomBytes(64).toString('hex');

              var data = {
                confirmation_code: confirmation_code
              };
              
              // Update databse to save reset verification code.
              customerModel.update(data, results[0].id, function(err, result){
                if (err) {
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR, 
                    message : "Unable to process request!", 
                    errors : err
                  });                  
                }else{

                  smtpTransport = config.SMTP_TRANSPORT;

                  // Send password reset email with verification link.
                  fs.readFile(config.PROJECT_DIR + '/templates/resetpassword.html', {encoding: 'utf-8'}, function (err, html) {
                    if (err) {
                      res.status(config.HTTP_SERVER_ERROR).send({
                          status: config.ERROR, 
                          code : config.HTTP_SERVER_ERROR,          
                          message: "Unable to process request!"
                      });
                    } else {
                        
                      //console.log(smtpTransport);
                      var template = handlebars.compile(html);
                      var replacements = {
                           userName: results[0].first_name,
                           verification_link : config.SITE_URL+"/reset-password/"+confirmation_code,
                      };

                      var htmlToSend = template(replacements);
                      var mailOptions = {
                          from: config.ADMIN_FROM_EMAIL,
                          to : email,
                          subject : 'Reset Password.',
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

                          res.status(config.HTTP_SUCCESS).send({
                            status: config.SUCCESS, 
                            code : config.HTTP_SUCCESS, 
                            message: "The reset password link has been sent to your email. Please check and reset your password."
                          });
                        }
                      });
                    }
                  }); 
                }
              });

            }else{
              res.status(config.HTTP_NOT_FOUND).send({
                status: config.ERROR, 
                code : config.HTTP_NOT_FOUND, 
                message: "Email is not registered with us. Please enter correct email id!"
              });
            }
          }
        });
      }
    });
  }

  // Verify Confirmation Code
  this.verifyCode = function(req, res){
    var confirmation_code = req.body.confirmation_code;

    var cond = [
      { 'confirmation_code' : { 'val': confirmation_code, 'cond': '='} },
      { 'status' : { 'val': 1, 'cond': '='} },
    ];    

    customerModel.query('customers', cond, '', '', function(err, results){
      if (err) {
        res.status(config.HTTP_SERVER_ERROR).send({
          status: config.ERROR, 
          code : config.HTTP_SERVER_ERROR, 
          message : "Unable to process request!", 
          errors : err
        });
      }else{
        if(results.length > 0 && results[0].id > 0){
          res.status(config.HTTP_SUCCESS).send({
            status: config.SUCCESS, 
            code : config.HTTP_SUCCESS, 
            message : "Confirmation code matched!"
          });
        }else{
          res.status(config.HTTP_BAD_REQUEST).send({
            status: config.ERROR, 
            code : config.HTTP_BAD_REQUEST, 
            message : "Confirmation link has expired!", 
          });          
        }
      }
    });
  }
    // Update Customer Profile
  this.updateProfile = function(req, res){
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var user_id = req.body.user_id;
    //console.log('UPDATE customers SET first_name ="'+first_name+'", last_name ="'+last_name+'" WHERE user_id='+ user_id);return;
    dbModel.rawQuery('UPDATE customers SET first_name ="'+first_name+'", last_name ="'+last_name+'" WHERE id='+ user_id, function(err, results){
      if (err) {
        res.status(config.HTTP_SERVER_ERROR).send({
          status: config.ERROR, 
          code : config.HTTP_SERVER_ERROR, 
          message : "Unable to process request!", 
          errors : err
        });
      }else{
        //console.log(results);return;
        if(results.affectedRows > 0 ){
          res.status(config.HTTP_SUCCESS).send({
            status: config.SUCCESS, 
            code : config.HTTP_SUCCESS, 
            message : "You have successfully updated the profile."
          });
        }else{
          res.status(config.HTTP_BAD_REQUEST).send({
            status: config.ERROR, 
            code : config.HTTP_BAD_REQUEST, 
            message : "Something went wrong please check again.", 
          });          
        }
      }
    });
  }
  // Fetch all addresses
  this.fetchAllAddresses = function(req, res){
    var user_id = req.body.user_id;
    //console.log('UPDATE customers SET first_name ="'+first_name+'", last_name ="'+last_name+'" WHERE user_id='+ user_id);return;
    dbModel.rawQuery('SELECT * FROM address_book WHERE user_id='+ user_id, function(err, results){
      if (err) {
        res.status(config.HTTP_SERVER_ERROR).send({
          status: config.ERROR, 
          code : config.HTTP_SERVER_ERROR, 
          message : "Unable to process request!", 
          errors : err
        });
      }else{
        //console.log(results);return;
        if(results.length > 0 && results[0].id > 0 ){
          res.status(config.HTTP_SUCCESS).send({
            status: config.SUCCESS, 
            code : config.HTTP_SUCCESS, 
            results : results
          });
        }else{
          res.status(config.HTTP_BAD_REQUEST).send({
            status: config.ERROR, 
            code : config.HTTP_BAD_REQUEST, 
            message : "Something went wrong please check again.", 
          });          
        }
      }
    });
  }
    // Fetch all addresses
  this.editAddress = function(req, res){
    var user_id = req.body.user_id;
    var id = req.body.address_id;
    //console.log('SELECT * FROM address_book WHERE id = '+id+ ' user_id = '+ user_id);return;
    dbModel.rawQuery('SELECT * FROM address_book WHERE id ='+id+ ' AND user_id ='+ user_id, function(err, results){
      if (err) {
        res.status(config.HTTP_SERVER_ERROR).send({
          status: config.ERROR, 
          code : config.HTTP_SERVER_ERROR, 
          message : "Unable to process request!", 
          errors : err
        });
      }else{
        //console.log(results);return;
        if(results.length > 0 && results[0].id > 0 ){
          res.status(config.HTTP_SUCCESS).send({
            status: config.SUCCESS, 
            code : config.HTTP_SUCCESS, 
            results : results
          });
        }else{
          res.status(config.HTTP_BAD_REQUEST).send({
            status: config.ERROR, 
            code : config.HTTP_BAD_REQUEST, 
            message : "Something went wrong please check again.", 
          });          
        }
      }
    });
  }

  // Update address of customers
  this.updateAddress = function(req, res){
    var user_id = req.body.user_id;
    var address_id = req.body.id;
    var location_type = req.body.location_type;
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var address_line1 = req.body.address_line1;
    var address_line2 = req.body.address_line2;
    var city = req.body.city;
    var province = req.body.province;
    var country_delivery_id = req.body.country_id;
    var zip_code = req.body.zip_code;
    var phone = req.body.phone;
    //console.log('UPDATE customers SET first_name ="'+first_name+'", last_name ="'+last_name+'" WHERE user_id='+ user_id);return;
    var prepare_query = 'UPDATE address_book SET delivery_type ="'+location_type+'", first_name ="'+first_name+'", last_name ="'+last_name+'", address_line1 ="'+address_line1+'", address_line2 ="'+address_line2+'", city ="'+city+'", province ="'+province+'", country_delivery_id ="'+country_delivery_id+'", zip_code ="'+zip_code+'", phone_line ="'+phone+'" WHERE user_id= '+ user_id +' AND id= '+address_id;
    //console.log(prepare_query);
    dbModel.rawQuery(prepare_query, function(err, results){
      if (err) {
        res.status(config.HTTP_SERVER_ERROR).send({
          status: config.ERROR, 
          code : config.HTTP_SERVER_ERROR, 
          message : "Unable to process request!", 
          errors : err
        });
      }else{
        //console.log(results);return;
         if(results.affectedRows > 0 ){
          res.status(config.HTTP_SUCCESS).send({
            status: config.SUCCESS, 
            code : config.HTTP_SUCCESS, 
            message : "You have successfully updated your address."
          });
        }else{
          res.status(config.HTTP_BAD_REQUEST).send({
            status: config.ERROR, 
            code : config.HTTP_BAD_REQUEST, 
            message : "Something went wrong please check again.", 
          });          
        }
      }
    });
  }


  // Reset Password
  this.resetPassword = function(req, res){

    var confirmation_code = req.body.confirmation_code;
    var password = req.body.password;
    var confirm_password = req.body.confirm_password;

    var error = 0;
    var errors = {};

    if(password !== confirm_password){
        errors['confirm_password'] = 'Please enter same password as above.';
        error = 1;
    }

    if(error == 1){
      res.status(config.HTTP_BAD_REQUEST).send({
        status: config.ERROR,
        code : config.HTTP_BAD_REQUEST, 
        message: "Validation errors!",
        errors: errors
      });  
      return false;    
    }

    var cond = [
      { 'confirmation_code' : { 'val': confirmation_code, 'cond': '='} },
      { 'status' : { 'val': 1, 'cond': '='} },
    ];     

    customerModel.query('customers', cond, '', '', function(err, results){
      if (err) {
        res.status(config.HTTP_SERVER_ERROR).send({
          status: config.ERROR, 
          code : config.HTTP_SERVER_ERROR, 
          message : "Unable to process request!", 
          errors : err
        });
      }else{
        if(results.length > 0 && results[0].id > 0){

          // Generate new password
          var hashedPassword = bcrypt.hashSync(password, config.SALT_ROUND);

          var data = {
            password: hashedPassword,
            confirmation_code: ""
          };                    
          
          // Update new password in database for customer.
          customerModel.update(data, results[0].id, function(err, result){
            if (err) {
              res.status(config.HTTP_SERVER_ERROR).send({
                status: config.ERROR, 
                code : config.HTTP_SERVER_ERROR, 
                message : "Unable to process request!", 
                errors : err
              });                  
            }else{

              //Password is successfully reset
              res.status(config.HTTP_SUCCESS).send({
                status: config.SUCCESS, 
                code : config.HTTP_SUCCESS, 
                message : "Password is successfully reset!"
              });
            }
          });

        }else{
          res.status(config.HTTP_NOT_FOUND).send({
            status: config.ERROR, 
            code : config.HTTP_NOT_FOUND, 
            message : "Confirmation link has expired!", 
          });          
        }
      }
    });    
    
  }


  // Customer Feedback
  this.feedback = function(req, res){

    var first_name=req.body.first_name;
    var last_name=req.body.last_name;
    var email=req.body.email;
    var phone_number=req.body.phone_number;
    var subject=req.body.subject;
    var order_confirmation_no=req.body.order_confirmation_no;
    var order_date=req.body.order_date;
    var recipient_first_name=req.body.recipient_first_name;
    var recipient_last_name=req.body.recipient_last_name;    
    var comment=req.body.comment;

    /*smtpTransport = config.SMTP_TRANSPORT;

    // Send password reset email with verification link.
    fs.readFile(config.PROJECT_DIR + '/templates/resetpassword.html', {encoding: 'utf-8'}, function (err, html) {
      if (err) {
        res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR,          
            message: "Unable to process request!"
        });
      } else {
          
        //console.log(smtpTransport);
        var template = handlebars.compile(html);
        var replacements = {
             userName: results[0].first_name,
             verification_link : config.SITE_URL+"/forgetpassword/"+confirmation_code,
        };

        var htmlToSend = template(replacements);
        var mailOptions = {
            from: 'dinesh@mobikasa.com',
            to : email,
            subject : 'Reset Password.',
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

            res.status(config.HTTP_SUCCESS).send({
              status: config.SUCCESS, 
              code : config.HTTP_SUCCESS, 
              message: "Reset password link sent to your email.Please check and reset your password!"
            });
          }
        });
      }*/

  }

    // Get all saved credit cards for customer
  this.getSavedCards = function(req, res, next){

    var token = req.headers['token'] || '' ;
    var customer_id = 0;
    Sync(function(){
        if(token != '' && token != undefined){
          var decoded = commonHelper.getUserId.sync(null, token);
          //console.log('i am hrere');
          if(decoded != '' && decoded != undefined && decoded.id > 0){
            customer_id = decoded.id;
          }
        }  
        
        if(customer_id > 0){
            dbModel.find('customer_cards','id,name_on_card,card_last4digits,card_expiry', 'customer_id='+customer_id, '', '', function(error, result) {
              if (error) {              
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status:config.ERROR,
                    code: config.HTTP_SERVER_ERROR,
                    message:'Unable to process result!'
                  });
              }else{
                  res.status(config.HTTP_SUCCESS).send({
                      status: config.SUCCESS,
                      code: config.HTTP_SUCCESS,
                      message: result.length+" customer cards found",
                      result: result
                  });
              }
          });
        } else {
            res.status(config.HTTP_BAD_REQUEST).send({
                status:config.ERROR,
                code: config.HTTP_BAD_REQUEST, 
                message:"Invalid customer id"
            }); 
        }
    }); 
    
  }

  // change user password
  this.changePassword = function(req,res){
    
    if(req.decoded.role != config.ROLE_CUSTOMER){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to change password!"
      });       
    }else{
      
      var id = req.decoded.id;
      var oldPassword = req.body.old_password;
      var newPassword = req.body.new_password;
      var newPasswordConfirmation = req.body.new_password_confirmation;

      connection.acquire(function(err, con) {
        con.query('SELECT * FROM customers WHERE id = ?',[id], function (error, results, fields) {
          if (error) {
              res.status(config.HTTP_SERVER_ERROR).send({
                status:config.ERROR,
                code: config.HTTP_SERVER_ERROR,
                message:'Unable to process request'
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
                    var query = "UPDATE `customers` SET `password` = '"+hashedPassword+"' WHERE `id` = '"+id+"'";
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

}

module.exports = new UserController();
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
      var type = 2; // 2 For Sub admin
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
              con.release();
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
                  //var data = [name,email,hashedPassword,country_id,province_id,address,phone_no,1,1,type];

                  // Store hash in your password DB.
                  con.query('INSERT INTO users(name,email,password,country_id,province_id,address,phone_number,confirmed,status,type,confirmation_code) VALUES(?,?,?,?,?,?,?,?,?,?,?)',[name,email,hashedPassword,country_id,province_id,address,phone_no,confirmed,status,type,confirmation_code], function (err, results, fields) {
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
            })
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
                        data:{
                          userId : results[0].id,
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
      var countryName = req.body.country_name;
      var provinceName = req.body.province_name;
      var address = req.body.address;
      var phoneNumber=req.body.phone_number;
      var inputStatus=req.body.inputStatus;

      connection.acquire(function(err, con) {

        var query = "update `users` set `name` = '"+name+"', `email` = '"+email+"', `country_id` = '"+countryName+"', `province_id` = '"+provinceName+"', `address` = '"+address+"', `phone_number` = '"+phoneNumber+"', `status` = '"+inputStatus+"'";        

        if(password != ""){
          hashedPassword = bcrypt.hashSync(password, config.SALT_ROUND);
          query += ", `password` = '"+hashedPassword+"' where `id` = '"+id+"'";  
            
        }else{
          query += " where `id` = '"+id+"'";
        }
                
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
          con.release();
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
  this.delete = function(req,res){
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
          con.release();
          if (error) {
              res.status(config.HTTP_SERVER_ERROR).send({
                status:config.ERROR,
                code: config.HTTP_SERVER_ERROR,
                message:'There are some error with query'
              })
          }else{
            
              con.query('delete from users where id = ?',[id], function (error, results, fields) {
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

      var search = req.body.search;
      

      connection.acquire(function(err, con) {
        con.query('SELECT * FROM users WHERE id = ?',[id], function (error, results, fields) {
          con.release();
          if (error) {
              res.status(config.HTTP_SERVER_ERROR).send({
                status:config.ERROR,
                code: config.HTTP_SERVER_ERROR,
                message:'There are some error with query'
              })
          }else{
              con.query('delete from users where id = ?',[id], function (error, results, fields) {
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

  // Get User Information 
  this.getUser = function(id, res) {

    connection.acquire(function(err, con) {
      if (err) {
        res.send({status: 1, message: err});
      }      
      con.query('select * from users where id = ?', [id], function(err, result) {
        if (err) {
          res.send({status: 1, message: 'Failed to get'});
        } else {
          if(result.length > 0){
            res.send({status: 0, message: 'Address Found!', response: result});
          }else{
            res.send({status: 1, message: 'Failed to get address'});
          }
        }        
        con.release();
      });
    });
  };

  // Forget Password
  this.forgetPassword = function(req, res){
    var email=req.body.email;
    connection.acquire(function(err, con) {
      if (err) {
        res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR,          
            message: "Unable to process request!"
        });
      } else {
        con.query('SELECT id,name FROM users WHERE email = ? AND confirmed = ? AND status = ?', [email, confirmed, status], function(err, result){
          con.release();
          if (err) {
            res.status(config.HTTP_SERVER_ERROR).send({
              status: config.ERROR, 
              code : config.HTTP_SERVER_ERROR, 
              message : "Email does not exist!", 
              errors : err
            });
          }else{
            if(result.length > 0 && result[0].id > 0){
                /*smtpTransport = nodemailer.createTransport(smtpTransport({
                    host: 'smtp.gmail.com',
                    secure: 'tls',
                    port: '465',
                    auth: {
                        user: 'test@mobikasa.com',
                        pass: '123456'
                    }
                }));  */

                smtpTransport = config.SMTP_TRANSPORT;

                // Send Password Reset Link
                fs.readFile(config.PROJECT_DIR + '/templates/forgetPassword.html', {encoding: 'utf-8'}, function (err, html) {
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
                             resetLink : config.BASE_URL+"/api/admin/reset/"+confirmation_code,
                        };

                        var htmlToSend = template(replacements);
                        var mailOptions = {
                            from: 'dinesh@mobikasa.com',
                            to : email,
                            subject : 'Your password reset link to change password.',
                            html : htmlToSend
                         };
                        smtpTransport.sendMail(mailOptions, function (error, response) {
                            if (error) {
                                //console.log(error);
                                res.status(config.HTTP_SERVER_ERROR).send({
                                    status: config.ERROR, 
                                    code : config.HTTP_SERVER_ERROR,          
                                    message: "Unable to process request!"
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
                  message: "Email does not exist."
                });
            }
          }
        });
      }
    });
  }



/*  this.create = function(users, res, colu) {    
    address = colu.hdwallet.getAddress();
    id = users.id;
    connection.acquire(function(err, con) {
      con.query('insert into users(address,user_id) values(?,?)', [address,id], function(err, result) {
        con.release();
        if (err) {
          res.send({status: 1, message: 'User creation failed'});
        } else {
          res.send({status: 0, message: 'User created successfully'});
        }
      });
    });
  };*/

/*  this.update = function(todo, res) {
    connection.acquire(function(err, con) {
      con.query('update todo_list set ? where id = ?', [todo, todo.id], function(err, result) {
        con.release();
        if (err) {
          res.send({status: 1, message: 'TODO update failed'});
        } else {
          res.send({status: 0, message: 'TODO updated successfully'});
        }
      });
    });
  };

  this.delete = function(id, res) {
    connection.acquire(function(err, con) {
      con.query('delete from todo_list where id = ?', [id], function(err, result) {
        con.release();
        if (err) {
          res.send({status: 1, message: 'Failed to delete'});
        } else {
          res.send({status: 0, message: 'Deleted successfully'});
        }
      });
    });
  };*/
}

module.exports = new AdminController();
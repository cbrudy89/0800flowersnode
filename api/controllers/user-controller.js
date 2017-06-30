var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var config = require('./../../config');
var connection = require('./../../database');
//var userHelper = require('./../helpers/user-helper');
var notificationModel = require('./../models/admin/notification-model');

function UserController() {

  // Register New Frontend User
  this.register = function(req,res,next){

    var first_name=req.body.first_name;
    var last_name=req.body.last_name;
    var email=req.body.email;
    var confirm_email = req.body.confirm_email;
    var password = req.body.password;
    var confirm_password = req.body.confirm_password;

    var errors = array();

    if(email !== confirm_email){
        errors['confirm_email'] = 'Please enter same email as above.';
    }

    if(password !== confirm_password){
        errors['confirm_password'] = 'Please enter same password as above.';
    }

    if(errors || errors.length > 0){
      res.status(config.HTTP_BAD_REQUEST).send({
        status: config.ERROR,
        code : config.HTTP_BAD_REQUEST, 
        message: "Validation errors!",
        errors: errors
      });      
    }

    //var confirmation_code = crypto.createHash('sha512').update(email).digest('hex');

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
          con.query('SELECT id FROM users WHERE email = ?', [email], function(err, result){
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
                  status : 1
                }

                // Store hash in your password DB.
                con.query('INSERT INTO customers SET ?', userData, function (err, results) {
                  con.release();
                  if (err) {
                    console.log(err);
                    res.status(config.HTTP_ALREADY_EXISTS).send({
                      status: config.ERROR, 
                      code : config.HTTP_ALREADY_EXISTS, 
                      message: 'Due to some error, customer is not registered yet. Please try again!'
                    });
                  }else{

                    // Insert Into Notification Table
                    var curr_date  = new Date();

                    notifyData = {
                        'from_id':23,
                        'to_id':1,
                        'type':'Customer',
                        'action':'Register',
                        'msg':'New user (<i>Web Tester</i>) has been registered',
                        'status':'0',
                        'details':"{'first_name':'Web','last_name':'Tester','email':'iweb@gmail.com','user_id':23}",
                        'created_at':curr_date,
                        'updated_at':curr_date
                    };

                    // Save notification to table
                    notificationModel.create(notifyData, function(err, result){
                       if(err) {
                          console.log(err);
                       }else{
                          
                          // Send on email
                          fs.readFile(config.PROJECT_DIR + '/templates/welcome.html', {encoding: 'utf-8'}, function (err, html) {
                            if (err) {
                              res.status(config.HTTP_SERVER_ERROR).send({
                                  status: config.ERROR, 
                                  code : config.HTTP_SERVER_ERROR,          
                                  message: "Due to some error, customer is not registered yet. Please try again!"
                              });
                            } else {
                                
                              //var confirmation_code = crypto.randomBytes(64).toString('hex');
                              //console.log(smtpTransport);
                              var template = handlebars.compile(html);
                              var replacements = {
                                   first_name: first_name,
                                   //resetLink : config.BASE_URL+"/api/admin/reset/"+confirmation_code,
                                   adminLink : config.SITE_URL,
                              };

                              var htmlToSend = template(replacements);
                              var mailOptions = {
                                  from: 'dinesh@mobikasa.com',
                                  to : email,
                                  subject : 'Welcome to 18FInternational',
                                  html : htmlToSend
                               };
                            
                              smtpTransport.sendMail(mailOptions, function (error, response) {
                                if (error) {
                                    console.log(error);
                                    res.status(config.HTTP_SERVER_ERROR).send({
                                        status: config.ERROR, 
                                        code : config.HTTP_SERVER_ERROR,          
                                        message: "Due to some error, customer is not registered yet. Please try again!",
                                    });                                
                                }else{

                                  // Update databse to save reset token.

                                    var token=jwt.sign({id: results[0].id, role : config.ROLE_CUSTOMER},process.env.SECRET_KEY,{
                                      expiresIn:3000
                                    });

                                    res.status(config.HTTP_SUCCESS).send({
                                      status: config.SUCCESS, 
                                      code : config.HTTP_SUCCESS, 
                                      message: 'Thank you for registering with us!',
                                      token : token,
                                      result:{
                                        first_name: results[0].first_name,
                                        last_name: results[0].last_name,
                                        email : results[0].address
                                      }
                                    });                       
                              
                                }                          
                              });

                            }
                          });
                          // Fs End Here

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

  this.saveNotification = function(req, res, next){

      var curr_date  = new Date();

      notifyData = {
          'from_id':23,
          'to_id':1,
          'type':'Customer',
          'action':'Register',
          'msg':'New user (<i>Web Tester</i>) has been registered',
          'status':'0',
          'details':"{'first_name':'Web','last_name':'Tester','email':'iweb@gmail.com','user_id':23}",
          'created_at':curr_date,
          'updated_at':curr_date
      };

      // Save notification to table
      notificationModel.create(notifyData, function(err, result){
         if(err) {
            console.log(err);
         }else{
            res.status(config.HTTP_SUCCESS).send({
              status: config.SUCCESS, 
              code : config.HTTP_SUCCESS, 
              message: 'Thank you for registering with us!',
              data : result
            });
         }
      });

  }

  
}

module.exports = new UserController();
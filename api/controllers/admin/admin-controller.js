var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var config = require('./../../../config');
var connection = require('./../../../database');
//var userHelper = require('./../helpers/user-helper');
//var userModel = require('./../../../user-model');

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
      var confirmed = 1;
      var status = 1;
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
                  //var data = [name,email,hashedPassword,country_id,province_id,address,phone_no,1,1,type];

                  // Store hash in your password DB.
                  con.query('INSERT INTO users(name,email,password,country_id,province_id,address,phone_number,confirmed,status,type,confirmation_code) VALUES(?,?,?,?,?,?,?,?,?,?,?)',[name,email,hashedPassword,country_id,province_id,address,phone_no,confirmed,status,type,confirmation_code], function (err, results, fields) {
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
      con.query('SELECT * FROM users WHERE email = ? AND confirmed = ? AND status = ?',[email,1,1], function (error, results, fields) {
        if (error) {
            res.status(config.HTTP_SERVER_ERROR).send({
              status:config.ERROR,
              code: config.HTTP_SERVER_ERROR,
              message:'There are some error with query'
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
                        expiresIn:1440
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
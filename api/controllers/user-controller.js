var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var config = require('./../../config');
var connection = require('./../../database');
//var userHelper = require('./../helpers/user-helper');
//var userModel = require('./../../../user-model');

function UserController() {

  // Register New User
  this.register=function(req,res,next){
    
    var name=req.body.name;
    var email=req.body.email;
    var password=req.body.password;
    var country_id = req.body.country_id;
    var province_id = req.body.province_id;
    var address = req.body.address;
    var phone_no = req.body.phone_no;
    var type=req.body.type;

    connection.acquire(function(err, con) {
      bcrypt.hash(password, config.SALT_ROUND, function(err, hash) {
        if (err) {
          console.log(err);
          res.send({status: false, message: 'Unable to register user!' + err});
        }else{
/*          var isExist = isUserExist(req, res, email);
          if(isExist)
            console.log(isExist);*/

        /*if(userHelper.isUserExist(req, res, email)){
            res.send({status: false, message : 'User already registered with this email!'});
          }else{*/
            var hashedPassword = hash;
            //var data = [name,email,hashedPassword,country_id,province_id,address,phone_no,1,1,type];

            // Store hash in your password DB.
            con.query('INSERT INTO users(name,email,password,country_id,province_id,address,phone_number,confirmed,status,type,confirmation_code) VALUES(?,?,?,?,?,?,?,?,?,?,?)',[name,email,hashedPassword,country_id,province_id,address,phone_no,1,1,type,''], function (err, results, fields) {
              if (err) {
                console.log(err);
                res.send({status: false, message: 'Unable to register user!' + err});
              }else{
                res.send({status: true, message: 'User register successfully!'});
              }
            });
          /*}*/

        }        
      });
    });
  }  

  // Authenticate User in DB
  this.login=function(req,res){
  
    var email=req.body.email;
    var password=req.body.password;
    var type=req.body.type;

    connection.acquire(function(err, con) {
      con.query('SELECT * FROM users WHERE email = ?',[email], function (error, results, fields) {
        if (error) {
            res.send({
              status:false,
              message:'there are some error with query'
              })
        }else{
          if(results.length >0){
            bcrypt.compare(password, results[0].password, function(err, response) {
                // res == true 
                if(err) {
                  res.send({
                    status:false,                  
                    message:"Email and password does not match"
                   });                    
                }else{

                  // Password Matched
                  if(response == true){
                    var token=jwt.sign(results[0],process.env.SECRET_KEY,{
                        expiresIn:5000
                    });
                    res.send({
                        status:true,
                        token:token
                    });

                  }else{
                    res.send({status:false, message:"Email and password does not match"});                          
                  }

                }
            });
           
          }
          else{
            res.send({
                status:false,
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

function isUserExist(req, res, email) {
  connection.acquire(function(err, con){
    if (err) {
      res.send({status: false, message: err});
    }else{

      // Check if user already exist in databse
      con.query('SELECT id FROM users WHERE email = ?', [email], function(err, result){
        if (err) {
          res.send({status: false, message : err});
        }else{
          if(result.length > 0 && result[0].id > 0){
              return true;
          }else{
              return false;
          }
        }
      });
    }
  });
}

module.exports = new UserController();
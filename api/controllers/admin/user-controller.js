var jwt=require('jsonwebtoken');
var connection = require('./../../../database');

function AuthenticateController() {

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


  this.authenticate=function(req,res){
  
    var email=req.body.email;
    var password=req.body.password;
    
    connection.acquire(function(err, con) {
      con.query('SELECT * FROM users WHERE email = ?',[email], function (error, results, fields) {
        if (error) {
            res.json({
              status:false,
              message:'there are some error with query'
              })
        }else{
          if(results.length >0){
              if(password==results[0].password){
                  var token=jwt.sign(results[0],process.env.SECRET_KEY,{
                      expiresIn:5000
                  });
                  res.json({
                      status:true,
                      token:token
                  })
              }else{
                  res.json({
                    status:false,                  
                    message:"Email and password does not match"
                   });
              }
           
          }
          else{
            res.json({
                status:false,
              message:"Email does not exits"
            });
          }
        }
      });
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

module.exports = new AuthenticateController();

module.exports.authenticate=function(req,res){
    
    var email=req.body.email;
    var password=req.body.password;
    
    db.query('SELECT * FROM users WHERE email = ?',[email], function (error, results, fields) {
      if (error) {
          res.json({
            status:false,
            message:'there are some error with query'
            })
      }else{
        if(results.length >0){
            if(password==results[0].password){
                var token=jwt.sign(results[0],process.env.SECRET_KEY,{
                    expiresIn:5000
                });
                res.json({
                    status:true,
                    token:token
                })
            }else{
                res.json({
                  status:false,                  
                  message:"Email and password does not match"
                 });
            }
         
        }
        else{
          res.json({
              status:false,
            message:"Email does not exits"
          });
        }
      }
    });
}
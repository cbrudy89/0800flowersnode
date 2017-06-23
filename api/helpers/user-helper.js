var config = require('./../../config');
var connection = require('./../../database');

function UserHelper() {

  // Is User Exist in Database
  this.isUserExist = function(req, res, email) {
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
                res.send(true);
            }else{
                res.send(false);
            }
          }
        });
      }
    });
  }
}

module.exports = new UserHelper();
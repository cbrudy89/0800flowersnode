var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var config = require('./../../config');
var connection = require('./../../database');
//var userHelper = require('./../helpers/user-helper');
//var userModel = require('./../../../user-model');

function CommonController() {

    // Get countries data
  this.countries = function(id, res) {

    connection.acquire(function(err, con) {
      if (err) {
        res.send({status: 1, message: err});
      }      
      con.query('select id,country_name from country_list where status = 1', function(err, result) {
        if (err) {
          res.status(config.HTTP_BAD_REQUEST).send({
                    status:config.ERROR,
                    code: config.HTTP_BAD_REQUEST,             
                    message:"No records found"
                   });
        } else {
          if(result.length > 0){
            res.status(config.HTTP_SUCCESS).send({
                        status: config.SUCCESS,
                        code: config.HTTP_SUCCESS,
                        message:"Countries found",
                        result:result
            });
          }else{
            res.status(config.HTTP_BAD_REQUEST).send({
                status:config.ERROR,
                code: config.HTTP_BAD_REQUEST, 
                message:"Failed to get countries"
            }); 
          }
        }        
        con.release();
      });
    });
  };
  // Get province data
  this.province = function(req, res) {
    var country_id=req.body.country_id;
    //console.log(country_id);
    connection.acquire(function(err, con) {
      if (err) {
        res.send({status: 1, message: err});
      }  
      con.query('SELECT id,province_name FROM provinces WHERE country_id = ?',[country_id], function(err, result) {
        if (err) {
          res.status(config.HTTP_BAD_REQUEST).send({
                    status:config.ERROR,
                    code: config.HTTP_BAD_REQUEST,             
                    message:"No records found"
                   });
        } else {
          if(result.length > 0){
            res.status(config.HTTP_SUCCESS).send({
                        status: config.SUCCESS,
                        code: config.HTTP_SUCCESS,
                        message:"Provinces found",
                        result:result
            });
          }else{
            res.status(config.HTTP_BAD_REQUEST).send({
                status:config.ERROR,
                code: config.HTTP_BAD_REQUEST, 
                message:"Failed to get provinces"
            }); 
          }
        }       
        con.release();
      });
    });
  };


}

module.exports = new CommonController();
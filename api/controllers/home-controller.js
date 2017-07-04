var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var config = require('./../../config');
var connection = require('./../../database');
var dbModel = require('./../models/db-model');

function HomeController() {

  // Get curriencies data
  this.curriencies = function(req, res) {

    connection.acquire(function(err, con) {
      if (err) {
        res.status(config.HTTP_SERVER_ERROR).send({
          status:config.ERROR,
          code: config.HTTP_SERVER_ERROR,
          message:'Unable to get currencies!',
          errors : err
        });
      }      
      con.query('SELECT id,currency_code,symbol,default_currency FROM currency WHERE status = 1', function(err, result) {
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
              message:"Curriencies found",
              result:result
            });
          }else{
            res.status(config.HTTP_BAD_REQUEST).send({
              status:config.ERROR,
              code: config.HTTP_BAD_REQUEST, 
              message:"Failed to get currencies"
            }); 
          }
        }        
        con.release();
      });
    });
  };

  // Get language data
  this.languages = function(req, res) {

    connection.acquire(function(err, con) {
      if (err) {
        res.status(config.HTTP_SERVER_ERROR).send({
          status:config.ERROR,
          code: config.HTTP_SERVER_ERROR,
          message:'Unable to get languages!',
          errors : err
        });
      }      
      con.query('SELECT id,name FROM languages WHERE status = 1', function(err, result) {
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
              message:"Languages found",
              result:result
            });
          }else{
            res.status(config.HTTP_BAD_REQUEST).send({
              status:config.ERROR,
              code: config.HTTP_BAD_REQUEST, 
              message:"Failed to get languages"
            }); 
          }
        }        
        con.release();
      });
    });
  };

  // Subscribe NewsLetter
  this.subscribe  = function(req, res) {

    var email=req.body.email;

    var cond = [
      { 'subscribe_email' : { 'val': email, 'cond': '='} }
    ];    

    dbModel.find('subscribe_newsletter','id',cond,'','', function(err, results){

      if (err) {
        console.log(err);
        res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR,          
            message: "Unable to process request, Please try again!",
            errors : err
        });
      } else {
        if(results.length > 0 && results[0].id > 0){
          
          res.status(config.HTTP_ALREADY_EXISTS).send({
            status: config.ERROR, 
            code : config.HTTP_ALREADY_EXISTS, 
            message: "This email address is already registered."
          });

        }else{

          var data = {
            subscribe_email: email
          };

          // Save email in system for newsletter subscription
          dbModel.save('subscribe_newsletter', data, '', function(err, result){
            if(err) {
              res.status(config.HTTP_SERVER_ERROR).send({
                status: config.ERROR, 
                code : config.HTTP_SERVER_ERROR, 
                message: "Unable to process request, Please try again!"
              });
            }else{
              
              // Save data into notification table.
              var curr_date  = new Date();

              notifyData = {
                  'from_id':0,
                  'to_id':1,
                  'type':'Guest',
                  'action':'Subscribe',
                  'msg':'New subscription by '+email,
                  'status':'0',
                  'details':"{'email': '"+email+"'}",
                  'created_at':curr_date,
                  'updated_at':curr_date
              };

              // Save notification to table
              dbModel.save('notifications', notifyData, '', function(err, result){
                 if(err) {
                    res.status(config.HTTP_SERVER_ERROR).send({
                        status: config.ERROR, 
                        code : config.HTTP_SERVER_ERROR,          
                        message: "Unable to process request, Please try again!"
                    });                         
                 }else{

                  res.status(config.HTTP_SUCCESS).send({
                      status: config.SUCCESS, 
                      code : config.HTTP_SUCCESS, 
                      message: email+' has been subscribed successfully'
                  });
                 }
              });
            }
          });
        }
      }
    });
  }

  
}

module.exports = new HomeController();
var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var async = require('async');
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

    // Get home offer data
  this.homeoffer = function(req, res) {

    connection.acquire(function(err, con) {
      if (err) {
        res.status(config.HTTP_SERVER_ERROR).send({
          status:config.ERROR,
          code: config.HTTP_SERVER_ERROR,
          message:'Unable to get currencies!',
          errors : err
        });
      }      
      con.query('SELECT id, line1, line2, line3, line4 FROM home_offer', function(err, result) {
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

  // Home page data
  this.home  = function(req, res) {


      var return_data = {};

      //This functions will be executed at the same time
      async.parallel([
          function currencies(callback){

              dbModel.find('currency','id,currency_code,symbol,default_currency', 'status=1', '', '', function(err, result) {
                 if (err) return callback(err);
                 return_data.currencies = result;
                 callback();
              });            

          },
          function languages(callback){

              dbModel.find('languages','id,name', 'status=1', '', '', function(err, result) {
                 if (err) return callback(err);
                 return_data.languages = result;
                 callback();
              });
          },
          function homeoffer(callback){

              dbModel.find('home_offer','id, line1, line2, line3, line4', '', '', '', function(err, result) {
                 if (err) return callback(err);
                 return_data.home_offer = result;
                 callback();
              });

          },
          function topcountries(callback){

              dbModel.rawQuery('SELECT country_id, country_name,product_image FROM top_country, country_list WHERE  top_country.country_id=country_list.id AND is_display=1 AND country_list.status=1', function(err, result) {
                 if (err) return callback(err);
                 return_data.topcountries = result;
                 callback();
              });

          }              
      ], function (err, result) {

          if (err) {
              res.status(config.HTTP_SERVER_ERROR).send({
                  status: config.ERROR, 
                  code : config.HTTP_SERVER_ERROR,          
                  message: "Unable to process request, Please try again!",
                  err: err
              }); 
          }else{
            res.status(config.HTTP_SUCCESS).send({
                status: config.SUCCESS, 
                code : config.HTTP_SUCCESS, 
                message: 'Record found!',
                result : return_data
            });           
          }
      });

  }
  
}

module.exports = new HomeController();
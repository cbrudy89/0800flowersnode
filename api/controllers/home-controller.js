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
      con.query('SELECT id,currency_code,symbol,currency_name,default_currency FROM currency WHERE status = 1', function(err, result) {
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
      con.query('SELECT id,name,lang_icon,short_code2 AS "language_code" FROM languages WHERE status = 1', function(err, result) {
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
/*  this.homeoffer = function(req, res) {

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
  };*/

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

      var language_id = req.params.langauge_code;
      if(language_id == undefined){
        language_id = process.env.SITE_LANGUAGE;
      }

      var return_data = {};

      //This functions will be executed at the same time
      async.parallel([
          function currencies(callback){

              dbModel.find('currency','id,currency_code,symbol,currency_name,default_currency', 'status=1', '', '', function(err, result) {
                 if (err) return callback(err);
                 return_data.currencies = result;
                 callback();
              });            

          },
          function languages(callback){

              dbModel.find('languages','id,name,lang_icon,short_code2 AS "code"', 'status=1', '', '', function(err, result) {
                 if (err) return callback(err);
                 return_data.languages = result;
                 callback();
              });
          },
          function topcountries(callback){

              sql = "SELECT tc.product_image, tc.country_id, cl.country_name, cl.redirect_url, cl.country_flag, cl.country_domain FROM top_country tc JOIN country_list cl ON(tc.country_id = cl.id) WHERE tc.status = 1 ORDER BY tc.order_by ASC LIMIT 5";

              dbModel.rawQuery(sql, function(err, result) {
                 if (err) return callback(err);
                 return_data.top_countries = result;
                 callback();
              });

          },
          function orderByPhone(callback){

              sql = "SELECT country_name,country_flag,phone FROM country_list WHERE status = 1 AND is_display = 1 LIMIT 4";

              dbModel.rawQuery(sql, function(err, result) {
                 if (err) return callback(err);
                 return_data.order_by_phone = result;
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
          function site_content(callback){

              sql = "SELECT c.id,c.page_name,c.slug,c.page_title,c.placement,c.canonical_url,c.meta_keywords,c.meta_description,c.image,cl.h1_text,cl.description FROM cms c LEFT JOIN cms_language cl ON(c.id = cl.cms_id) WHERE cl.language_id = "+language_id+" AND c.status = 1";

              dbModel.rawQuery(sql, function(err, result) {
                 if (err) return callback(err);
                 return_data.site_content = result;
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
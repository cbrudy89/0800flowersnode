var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var async = require('async');
var config = require('./../../config');
var connection = require('./../../database');
var dbModel = require('./../models/db-model');
var commonModel = require('./../helpers/common-helper');

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
          
          res.status(config.HTTP_SUCCESS).send({
            status: config.SUCCESS, 
            code : config.HTTP_SUCCESS, 
            message: "Thankyou for registering with us."
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
          function topbanner(callback){
             commonModel.getPromoBanner(language_id, 'home', function(err, result) {
                 if (err) return callback(err);
                 else {
                    if(result.length > 0 && result[0].description != ''){
                      return_data.topbanner = result[0].description;
                    }
                    callback();                      
                 }
              });
          },        
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

              sql = "SELECT CONCAT('"+config.RESOURCE_URL+"','/trending_products/', tc.product_image) as product_image, tc.country_id, cl.country_name, cl.redirect_url, CONCAT('"+config.RESOURCE_URL+"','/flag/',cl.country_flag) as country_flag, cl.country_domain FROM top_country tc JOIN country_list cl ON(tc.country_id = cl.id) WHERE tc.status = 1 ORDER BY tc.order_by ASC LIMIT 5";

              dbModel.rawQuery(sql, function(err, result) {
                 if (err) return callback(err);
                 return_data.top_countries = result;
                 callback();
              });

          },
          function orderByPhone(callback){

              sql = "SELECT country_name, CONCAT('"+config.RESOURCE_URL+"','/flag/',country_flag) as country_flag,phone FROM country_list WHERE status = 1 AND is_display = 1 LIMIT 4";

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
          function countriesprovinces(callback) {
            var country = [];
            

              dbModel.rawQuery("SELECT id, country_name, redirect_url, CONCAT(country_name,',',country_alias) as alias,short_code,iso_code,CONCAT('"+config.RESOURCE_URL+"','/flag/',country_flag) as country_flag, show_state FROM country_list WHERE status = 1", function(err, countries) {
                if (err) return callback(err);
                else 
                  if(countries.length > 0){

                      sql = "SELECT country_id,id,province_name FROM provinces WHERE status = 1";

                      //console.log(sql);
                        
                      dbModel.rawQuery(sql, function(err, provinces) {
                        if (err) return callback(err);
                        else 
                          if(provinces.length > 0){

                            for ( var i=0 ; i < countries.length; i++) {

                              var province = [];

                              country_id = countries[i].id;
                              country_name = countries[i].country_name;
                              alias = countries[i].alias;
                              short_code = countries[i].short_code;
                              iso_code = countries[i].iso_code;
                              country_flag = countries[i].country_flag;
                              show_state = countries[i].show_state;
                              redirect_url = countries[i].redirect_url;


                                for ( var j=0 ; j < provinces.length; j++) {

                                  if(country_id == provinces[j].country_id){
                                    
                                    //console.log(provinces[j].province_name);
                                    province.push({
                                      "provience_id" : provinces[j].id,
                                      "provience_name" :  provinces[j].province_name
                                    });

                                  }
                                    
                                }                              

                                country.push({
                                  "country_id": country_id, 
                                  "country_name": country_name, 
                                  "alias": alias, 
                                  "short_code": short_code, 
                                  "iso_code": iso_code, 
                                  "country_flag": country_flag, 
                                  "show_state": show_state, 
                                  "provinces": province,
                                  "redirect_url":redirect_url
                                });
                            } 


                            return_data.countries_and_proviences = country;
                            callback();
                         }

                      });
                      
                    

                 }else{
                    callback(null, []);
                 }

              });

          },      
          function translation_content(callback){

            sql = "SELECT translation.lkey as 'key',translated_text FROM language_translation, translation, languages WHERE language_translation.translation_id=translation.id AND language_translation.language_id=languages.id AND languages.id= "+language_id;
            //console.log(sql);
            dbModel.rawQuery(sql, function(err, result) {
               if (err) return callback(err);
               return_data.translation_content = result;
               callback();
            });           

          },            
          /*function site_content(callback){

              sql = "SELECT c.id,c.page_name,c.slug,c.page_title,c.placement,c.canonical_url,c.meta_keywords,c.meta_description,c.image,cl.h1_text,cl.description FROM cms c LEFT JOIN cms_language cl ON(c.id = cl.cms_id) WHERE cl.language_id = "+language_id+" AND c.status = 1";

              dbModel.rawQuery(sql, function(err, result) {
                 if (err) return callback(err);
                 return_data.site_content = result;
                 callback();
              });
          } */

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
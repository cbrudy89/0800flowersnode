var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var async = require('async');
var Sync = require('sync');
var config = require('./../../config');
var connection = require('./../../database');
var dbModel = require('./../models/db-model');
var commonHelper = require('./../helpers/common-helper');
var fs = require('fs');

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
            message: "Confirmed- Thank You! You've been added to our email list!"
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
                      //message: "Confirmed- Thank You! You've been added to our email list!"
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

      var language_id = req.query.langauge_code || '';
      var country_shortcode = req.query.country_shortcode || '';
      var token = req.headers['token'] || '' ;
      var cart_key = req.headers['cart_key'] || '';
      var user_id = 0;

      if(language_id == undefined){
        language_id = process.env.SITE_LANGUAGE;
      }


      Sync(function(){

        if(token != '' && token != undefined){
          var decoded = commonHelper.getUserId.sync(null, token);
          //console.log('i am hrere');
          if(decoded != '' && decoded != undefined && decoded.id > 0){
            user_id = decoded.id;
          }
        }        
      
        var return_data = {};

        country = commonHelper.countrydetails.sync(null,country_shortcode, '');
        if(country.length > 0){
          
          var country_id= country[0].country_id;
          language_id= country[0].language_id;

          return_data.default_country_details = country[0];
          return_data.default_logo = country[0].default_logo;  
        }      

        //This functions will be executed at the same time
        async.parallel([
            function topbanner(callback){
               commonHelper.getPromoBanner(language_id, 'home', function(err, result) {
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

                dbModel.find('languages','id,name, CONCAT("'+config.RESOURCE_URL+'", REPLACE(lang_icon, "+","%2B")) as lang_icon,short_code2 AS "code"', 'status=1', '', '', function(err, result) {
                   if (err) return callback(err);
                   return_data.languages = result;
                   callback();
                });
            },
            function topcountries(callback){

                sql = "SELECT CONCAT('"+config.RESOURCE_URL+"', REPLACE(tc.product_image, '+','%2B')) as product_image, tc.country_id, cl.country_name as default_country_name, cl.country_name, REPLACE(LCASE(cl.country_name),' ','-') as country_slug, cl.redirect_url, CONCAT('"+config.RESOURCE_URL+"', REPLACE(cl.country_flag, '+','%2B')) as country_flag, CONCAT('"+config.RESOURCE_URL+"', REPLACE(cl.company_logo, '+','%2B')) as company_logo, cl.country_domain, cl.preferred_currency_id, (SELECT currency_code FROM currency WHERE id = cl.preferred_currency_id) as preferred_currency_code,cl.language_id, (SELECT short_code2 FROM languages WHERE id = cl.language_id AND status = 1) as language_code FROM top_country tc JOIN country_list cl ON(tc.country_id = cl.id) WHERE tc.status = 1 ORDER BY tc.order_by ASC LIMIT 5";

                dbModel.rawQuery(sql, function(err, result) {
                   if (err) return callback(err);
                   return_data.top_countries = result;
                   callback();
                });

            },
            function orderByPhone(callback){

                sql = "SELECT country_name, CONCAT('"+config.RESOURCE_URL+"', REPLACE(country_flag, '+','%2B')) as country_flag,phone FROM country_list WHERE status = 1 AND is_display = 1 LIMIT 4";

                dbModel.rawQuery(sql, function(err, result) {
                   if (err) return callback(err);
                   return_data.order_by_phone = result;
                   callback();
                });

            },   
            /*function homeoffer(callback){

                dbModel.find('home_offer','id, line1, line2, line3, line4', '', '', '', function(err, result) {
                   if (err) return callback(err);
                   return_data.home_offer = result;
                   callback();
                });

            },
            */
            function continentcountries(callback) {
                
                var continent = [];
                dbModel.rawQuery("SELECT id, continent_name FROM continents WHERE status = 1", function(err, continents) {
                  if (err) return callback(err);
                  else 
                    if(continents.length > 0){

                        sql = "SELECT continent_id, phone, id, country_name, redirect_url, TRIM(TRAILING ',' FROM CONCAT(country_name,',',country_alias)) as alias,short_code,iso_code,CONCAT('"+config.RESOURCE_URL+"', REPLACE(country_flag, '+','%2B')) as country_flag,CONCAT('"+config.RESOURCE_URL+"', REPLACE(company_logo, '+','%2B')) as company_logo, show_state, preferred_currency_id, (SELECT currency_code FROM currency WHERE id = preferred_currency_id) as preferred_currency_code,language_id, (SELECT short_code2 FROM languages WHERE id = language_id AND status = 1) as language_code, language_supported FROM country_list WHERE status = 1 ORDER BY country_name ASC";
                        //console.log(sql);
                          
                        dbModel.rawQuery(sql, function(err, countries) {
                          if (err) return callback(err);
                          else 
                            if(countries.length > 0){

                              Sync(function(){
                                for ( var i=0 ; i < continents.length; i++) {
                                  var country = [];

                                  id = continents[i].id;
                                  continent_name = continents[i].continent_name;

                                    for ( var j=0 ; j < countries.length; j++) {

                                      if(id == countries[j].continent_id){
                                        
                                        var supported_language_ids = '';
                                        var supported_languages = [];

                                        if(countries[j].language_supported != null && countries[j].language_supported != ''){
                                          supported_language_ids =  countries[j].language_id + "," + countries[j].language_supported;
                                        }else if(countries[j].language_id != null && countries[j].language_id != ''){
                                          supported_language_ids = countries[j].language_id
                                        }

                                          //console.log(supported_language_ids);
                                          if(supported_language_ids != ''){
                                            supported_languages = getSupportedLanguages.sync(null, supported_language_ids );
                                          }

                                          //console.log(supported_languages);

                                          if(supported_languages.length > 1){

                                            for(var k=0; k < supported_languages.length; k++){

                                              country.push({
                                                "country_id": countries[j].id,
                                                "default_country_name": countries[j].country_name + ' ('+supported_languages[k].name+')',
                                                "country_name": countries[j].country_name + ' ('+supported_languages[k].name+')',
                                                "country_slug": countries[j].country_name.toLowerCase().replace(" ","-"),
                                                "alias": countries[j].alias,
                                                "short_code": countries[j].short_code,
                                                "iso_code": countries[j].iso_code,
                                                "country_flag": countries[j].country_flag,
                                                "show_state": countries[j].show_state,
                                                "redirect_url": countries[j].redirect_url,
                                                "preferred_currency_id": countries[j].preferred_currency_id,
                                                "preferred_currency_code": countries[j].preferred_currency_code,
                                                "language_id": supported_languages[k].language_id,
                                                "language_code": supported_languages[k].language_code,
                                                "company_logo": countries[j].company_logo,
                                                "phone": countries[j].phone
                                              });                                            
                                            }

                                          }else{

                                            //console.log(countries[j]);
                                            country.push({
                                              "country_id": countries[j].id,
                                              "default_country_name": countries[j].country_name,
                                              "country_name": countries[j].country_name,
                                              "country_slug": countries[j].country_name.toLowerCase().replace(" ","-"),
                                              "alias": countries[j].alias,
                                              "short_code": countries[j].short_code,
                                              "iso_code": countries[j].iso_code,
                                              "country_flag": countries[j].country_flag,
                                              "show_state": countries[j].show_state,
                                              "redirect_url": countries[j].redirect_url,
                                              "preferred_currency_id": countries[j].preferred_currency_id,
                                              "preferred_currency_code": countries[j].preferred_currency_code,
                                              "language_id": countries[j].language_id,
                                              "language_code": countries[j].language_code,
                                              "language_supported": countries[j].language_supported,
                                              "company_logo": countries[j].company_logo,
                                              "phone": countries[j].phone
                                            });
                                          
                                          }                                        

                                          //console.log(supported_languages);

                                      }
                                    }                              

                                    continent.push({
                                      "continent_id": id, 
                                      "continent_name": continent_name,
                                      "countries": country
                                    });
                                }

                                return_data.continents_and_countries = continent;
                                callback();

                            });

                           }                        

                        });
                     

                   }else{
                      callback(null, []);
                   }

                });

            },
            function countriesprovinces(callback) {
              var country = [];
            
                dbModel.rawQuery("SELECT id, country_name, redirect_url, TRIM(TRAILING ',' FROM CONCAT(country_name,',',country_alias)) as alias,short_code,iso_code,CONCAT('"+config.RESOURCE_URL+"', REPLACE(country_flag, '+','%2B')) as country_flag,CONCAT('"+config.RESOURCE_URL+"', REPLACE(company_logo, '+','%2B')) as company_logo, show_state, preferred_currency_id, (SELECT currency_code FROM currency WHERE id = preferred_currency_id) as preferred_currency_code,language_id, (SELECT short_code2 FROM languages WHERE id = language_id AND status = 1) as language_code FROM country_list WHERE status = 1 ORDER BY country_name ASC", function(err, countries) {
                  if (err) return callback(err);
                  else 
                    if(countries.length > 0){

                    for ( var i=0 ; i < countries.length; i++) {
                      country_id = countries[i].id;
                      country_name = countries[i].country_name;
                      alias = countries[i].alias;
                      short_code = countries[i].short_code;
                      iso_code = countries[i].iso_code;
                      country_flag = countries[i].country_flag;
                      show_state = countries[i].show_state;
                      redirect_url = countries[i].redirect_url;
                      preferred_currency_id = countries[i].preferred_currency_id;
                      preferred_currency_code = countries[i].preferred_currency_code;
                      language_id = countries[i].language_id;
                      language_code = countries[i].language_code;                    
                      company_logo = countries[i].company_logo;

                      var alias_arr = alias.split(',');

                      if(alias_arr.length > 1){

                        for(var k=0; k < alias_arr.length; k++){             

                          country.push({
                            "country_id": country_id, 
                            "default_country_name": country_name,
                            "country_name": alias_arr[k],
                            "country_slug": country_name.toLowerCase().replace(" ","-"),
                            "alias": alias_arr[k], 
                            "short_code": short_code, 
                            "iso_code": iso_code, 
                            "country_flag": country_flag, 
                            "show_state": show_state,
                            "redirect_url": redirect_url,
                            "preferred_currency_id": preferred_currency_id,
                            "preferred_currency_code": preferred_currency_code,
                            "language_id": language_id,
                            "language_code": language_code,
                            "company_logo": company_logo
                          });

                        }

                      } else {

                          country.push({
                            "country_id": country_id, 
                            "default_country_name": country_name,
                            "country_name": country_name,
                            "country_slug": country_name.toLowerCase().replace(" ","-"),
                            "alias": alias, 
                            "short_code": short_code, 
                            "iso_code": iso_code, 
                            "country_flag": country_flag, 
                            "show_state": show_state,
                            "redirect_url": redirect_url,
                            "preferred_currency_id": preferred_currency_id,
                            "preferred_currency_code": preferred_currency_code,
                            "language_id": language_id,
                            "language_code": language_code,
                            "company_logo": company_logo
                          });                        

                      }




                    }

                        /*sql = "SELECT country_id,id,province_name FROM provinces WHERE status = 1";
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
                                    "provinces": province
                                  });
                              }

                              return_data.countries_and_provinces = country;
                              callback();
                           }

                        });*/

                      return_data.countries_and_provinces = country;
                      callback();  
                        
                      

                   }else{
                      callback(null, []);
                   }

                });

            },      
            function translation_content(callback){

              var translated_content = [];

              sql = "SELECT translation.lkey as 'key',translated_text FROM language_translation, translation, languages WHERE language_translation.translation_id=translation.id AND language_translation.language_id=languages.id AND languages.id= "+language_id;
              //console.log(sql);
              dbModel.rawQuery(sql, function(err, result) {
                 if (err) return callback(err);
                 else{
                    if(result.length > 0){

                      var data = {};
                      for(var i=0; i<result.length;i++){

                        data[result[i].key] = result[i].translated_text;

                      }
                      
                      translated_content.push(data);
                      return_data.translated_content = translated_content;

                    }else{
                      return_data.translation_content = [];
                    }
                  callback();
                 }
              });           

            },       
            function cartCount(callback){

                commonHelper.cartCount(user_id, cart_key, function(error, cartCount){
                  if(error){
                    callback(error)
                  }else{
                    return_data.cartCount = cartCount;
                    callback();
                  }

                });

                /*
                return_data.cartCount = cartCount;
                callback();

                var cartCount = 0;
                //return_data.cartCount = cartCount;

                if(user_id > 0 || (cart_key != '' && cart_key != undefined)){
                  
                  var sql = "SELECT COUNT(cp.quantity) AS total FROM cart c INNER JOIN cart_products cp ON (c.id = cp.cart_id)";

                  if(user_id > 0){
                    sql += " WHERE c.user_id ="+user_id;
                  }else{
                    sql += " WHERE c.cart_key = '"+cart_key+"'";
                  }

                  console.log(sql);

                  dbModel.rawQuery(sql, function(err, result) {
                    if (err){
                      return callback(err);
                    } else{
                      if(result.length > 0){
                        return_data.cartCount = result[0].total;
                      }else{
                        return_data.cartCount = cartCount;
                      }
                      callback();
                    }
                  });
                  
                }else{
                  return_data.cartCount = cartCount;
                  callback();
                }
  */
            },
            function wishlistCount(callback){

                var wishlistCount = 0;

                if(user_id > 0){
                  
                  var sql = "SELECT COUNT(w.qty) AS total FROM wishlist w ";
                      sql += " WHERE w.user_id ="+user_id;

                  dbModel.rawQuery(sql, function(err, result) {
                    if (err){
                      return callback(err);
                    } else{
                      if(result.length > 0){
                        return_data.wishlistCount = result[0].total;
                      }else{
                        return_data.wishlistCount = wishlistCount;
                      }
                      callback();
                    }
                  });
                  
                }else{
                  return_data.wishlistCount = wishlistCount;
                  callback();
                }

            }
            /*,
            function notificationCount(callback){
                var notificationCount = 0;
                return_data.notificationCount = notificationCount;
                callback();

            } */              
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

    });

  }
  
}

function getSupportedLanguages(language_ids, callback){

  var sql = "SELECT id as language_id,name,short_code2 as 'language_code' FROM languages WHERE id IN ("+language_ids+")";
  //console.log(sql);

  dbModel.rawQuery(sql, function(error, result){
    if(error){
      callback(error);
    }else{
      if(result.length > 0){
        callback(null, result);
      }else{
        callback(null, []);
      }
    }

  });

}

module.exports = new HomeController();

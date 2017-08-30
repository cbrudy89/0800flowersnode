var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var async = require('async');
var Sync = require('sync');
var config = require('./../../config');
var connection = require('./../../database');
var dbModel = require('./../models/db-model');
var commonModel = require('./../helpers/common-helper');
var fs = require('fs');
//var userHelper = require('./../helpers/user-helper');
//var userModel = require('./../../../user-model');

function CommonController() {

  // Get countries data
  this.countries = function(req, res) {

    connection.acquire(function(err, con) {
      if (err) {
        res.send({status: 1, message: err});
      }      
      con.query('select * from country_list where status = 1 AND  is_display = 1', function(err, result) {
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
  // Get country province data
  this.province = function(req, res) {
    var country_id=req.params.country_id;
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
  // Get all province data
  this.allprovince = function(req, res) {
    //console.log(country_id);
    connection.acquire(function(err, con) {
      if (err) {
        res.send({status: 1, message: err});
      }  
      con.query('SELECT country_id,id,province_name FROM provinces order by country_id', function(err, result) {
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

  // Get all countries list
  this.countrieslist = function(req, res) {

    var limit = req.params.limit;

    $sql = "SELECT country_name,is_display,country_flag,phone,redirect_url,country_flag,country_domain FROM country_list WHERE status = 1 LIMIT "+limit;

    dbModel.rawQuery($sql, function(err, result) {
       if (err) {
          res.status(config.HTTP_BAD_REQUEST).send({
            status:config.ERROR,
            code: config.HTTP_BAD_REQUEST,             
            message:"Unable to process request"
          });
       }else{

          if(result.length > 0){
            res.status(config.HTTP_SUCCESS).send({
              status: config.SUCCESS,
              code: config.HTTP_SUCCESS,
              message: result.length +" Countries found",
              result:result
            });
          }else{
            res.status(config.HTTP_NOT_FOUND).send({
              status:config.ERROR,
              code: config.HTTP_NOT_FOUND, 
              message:"Failed to get Countries"
            }); 
          }
       }
    });   

  };
  // Get all content based on country
  this.countrylanguage = function(req, res) {

    var language_id=req.params.langauge_code;

    if(language_id == undefined){
      language_id = process.env.SITE_LANGUAGE;
    }
    //console.log(country_id);
    $sql = "SELECT translation.key,translated_text FROM language_translation, translation, languages WHERE language_translation.translation_id=translation.id AND language_translation.language_id=languages.id AND languages.id= "+language_id;

    dbModel.rawQuery($sql, function(err, result) {
       if (err) {
          res.status(config.HTTP_BAD_REQUEST).send({
            status:config.ERROR,
            code: config.HTTP_BAD_REQUEST,             
            message:"Unable to process request"
          });
       }else{

          if(result.length > 0){
            res.status(config.HTTP_SUCCESS).send({
              status: config.SUCCESS,
              code: config.HTTP_SUCCESS,
              message:"Language data found",
              result:result
            });
          }else{
            res.status(config.HTTP_NOT_FOUND).send({
              status:config.ERROR,
              code: config.HTTP_NOT_FOUND, 
              message:"Failed to get language data"
            }); 
          }
       }
    });
  };

  // Get page data on the basis of page id
  this.page = function(req, res){

      var language_id = req.params.langauge_code;
      var slug = req.params.slug;
      if(language_id == undefined){
        language_id = process.env.SITE_LANGUAGE;
      }

      sql = "SELECT c.id,c.page_name,c.slug,c.page_title,c.placement,c.canonical_url,c.meta_keywords,c.meta_description,c.image,cl.h1_text,cl.description FROM cms c LEFT JOIN cms_language cl ON(c.id = cl.cms_id) WHERE cl.language_id = "+language_id+" AND c.slug = '"+slug+"' AND c.status = 1";

      dbModel.rawQuery(sql, function(err, result) {

          if (err) {
              res.status(config.HTTP_SERVER_ERROR).send({
                  status: config.ERROR, 
                  code : config.HTTP_SERVER_ERROR,          
                  message: "Unable to process request, Please try again!",
                  err: err
              }); 
          }else{
            if(result.length > 0){
              res.status(config.HTTP_SUCCESS).send({
                status: config.SUCCESS,
                code: config.HTTP_SUCCESS,
                message:"Record found",
                result:result
              });
            }else{
              res.status(config.HTTP_NOT_FOUND).send({
                status:config.ERROR,
                code: config.HTTP_NOT_FOUND, 
                message:"Page not found"
              }); 
            }
          }

      });      

  }

  // Header Page API (Countries, Province, Language, Currency, Language Translation Content)
  this.header = function(req, res) {
    var country_shortcode = req.headers['country_shortcode'] || '';
    var country_slug = req.headers['country_slug'] || '';
    var language_id = req.params.langauge_code|| '';

    var token = req.headers['token'] || 0 ;
    var cart_key = req.headers['cart_key'] || '';
    var user_id = 0;

    if(country_shortcode == '' && country_slug == ''){
      return res.status(config.HTTP_SERVER_ERROR).send({
          status: config.ERROR, 
          code : config.HTTP_SERVER_ERROR,          
          message: "country short code OR country slug is missing"
      }); 
    }
    
    if(language_id == undefined){
      language_id = process.env.SITE_LANGUAGE;
    }


    Sync(function(){

      if(token){
        var decoded = commonModel.getUserId.sync(null, token);
        user_id = decoded.id;
      }

      var return_data = {};
      
      country = commonModel.countrydetails.sync(null,country_shortcode, country_slug);
      if(country.length > 0){

        var country_id= country[0].country_id;
        language_id= country[0].language_id;

        return_data.default_country_details = country[0];
        return_data.default_logo = country[0].default_logo;  
      }

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

              dbModel.find('languages','id,name, CONCAT("'+config.RESOURCE_URL+'", REPLACE(lang_icon, "+","%2B")) as lang_icon,short_code2 AS "code"', 'status=1', '', '', function(err, result) {
                 if (err) return callback(err);
                 return_data.languages = result;
                 callback();
              });
          },
          function continentcountries(callback) {
                
              var continent = [];
              dbModel.rawQuery("SELECT id, continent_name FROM continents WHERE status = 1", function(err, continents) {
                if (err) return callback(err);
                else 
                  if(continents.length > 0){

                      sql = "SELECT continent_id, phone, id, country_name, redirect_url, TRIM(TRAILING ',' FROM CONCAT(country_name,',',country_alias)) as alias,short_code,iso_code,CONCAT('"+config.RESOURCE_URL+"', REPLACE(country_flag, '+','%2B')) as country_flag,CONCAT('"+config.RESOURCE_URL+"', REPLACE(company_logo, '+','%2B')) as company_logo, show_state, preferred_currency_id, (SELECT currency_code FROM currency WHERE id = preferred_currency_id) as preferred_currency_code,language_id, (SELECT short_code2 FROM languages WHERE id = language_id AND status = 1) as language_code FROM country_list WHERE status = 1";
                      //console.log(sql);
                        
                      dbModel.rawQuery(sql, function(err, countries) {
                        if (err) return callback(err);
                        else 
                          if(countries.length > 0){
                            for ( var i=0 ; i < continents.length; i++) {
                              var country = [];

                              id = continents[i].id;
                              continent_name = continents[i].continent_name;

                                for ( var j=0 ; j < countries.length; j++) {

                                  if(id == countries[j].continent_id){
                                    
                                    //console.log(countries[j]);
                                    country.push({
                                      "country_id": countries[j].id,
                                      "country_name": countries[j].country_name,
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
                                      "company_logo": countries[j].company_logo,
                                      "phone": countries[j].phone
                                    });

                                  }
                                }                              

                                continent.push({
                                  "continent_id": id, 
                                  "country_name": continent_name,
                                  "countries": country
                                });
                            }

                            return_data.continents_and_countries = continent;
                            callback();
                         }                        

                      });
                   

                 }else{
                    callback(null, []);
                 }

              });

          },        
          function countriesprovinces(callback) {
            var country = [];

              dbModel.rawQuery("SELECT id, country_name, TRIM(TRAILING ',' FROM CONCAT(country_name,',',country_alias)) as alias,short_code,iso_code,CONCAT('"+config.RESOURCE_URL+"', REPLACE(country_flag, '+','%2B')) as country_flag,CONCAT('"+config.RESOURCE_URL+"', REPLACE(company_logo, '+','%2B')) as company_logo, show_state, preferred_currency_id, (SELECT currency_code FROM currency WHERE id = preferred_currency_id) as preferred_currency_code,language_id, (SELECT short_code2 FROM languages WHERE id = language_id AND status = 1) as language_code FROM country_list WHERE status = 1", function(err, countries) {
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


                      country.push({
                        "country_id": country_id, 
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

              var cartCount = 0;
              //return_data.cartCount = cartCount;

              if(user_id > 0 || (cart_key != '' && cart_key != undefined)){
                
                var sql = "SELECT COUNT(cp.quantity) AS total FROM cart c INNER JOIN cart_products cp ON (c.id = cp.cart_id)";

                if(user_id > 0){
                  sql += " WHERE c.user_id ="+user_id;
                }else{
                  sql += " WHERE c.cart_key = '"+cart_key+"'";
                }

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

          },
          function notificationCount(callback){
              var notificationCount = 0;
              return_data.notificationCount = notificationCount;
              callback();

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
    
    });

  }

  /****************************** Calendar Setting    ***************************/
  // Get all vendors list based on country id data
  this.venderListByCountryId = function(req, res) {

      var country_id = req.body.country_id;
      var sql= 'select vendor.id,vendor.name FROM vendor LEFT JOIN country_vendor ON  vendor.id=country_vendor.vendor_id where country_vendor.country_id='+country_id;
      dbModel.rawQuery(sql, function(err, result) {
        if (err) {
            res.status(config.HTTP_SERVER_ERROR).send({
                status: config.ERROR, 
                code : config.HTTP_SERVER_ERROR, 
                message : "Unable to process request!", 
                errors : err
          });
        } else {
          if(result.length > 0){
            res.status(config.HTTP_SUCCESS).send({
              status: config.SUCCESS,
              code: config.HTTP_SUCCESS,
              message:"Record found",
              result:result
            });
          }else{
             res.status(config.HTTP_NOT_FOUND).send({
                status:config.ERROR,
                code: config.HTTP_NOT_FOUND, 
                message:"No record found"
              }); 
          }
        }        
        
      });
    
  }
  
   // Get all product list based on vendor id data
  this.productListByVendorId = function(req, res) {

      var vendor_id = req.body.vendor_id;
      var sql= 'select products.id,products.product_code,language_product.product_name from products  left join language_product on  products.id=language_product.product_id WHERE products.product_status=1 AND  language_product.language_id=1 AND admin_confirm=1 AND  products.vendor_id ='+vendor_id;
      dbModel.rawQuery(sql, function(err, result) {
        if (err) {
            res.status(config.HTTP_SERVER_ERROR).send({
                status: config.ERROR, 
                code : config.HTTP_SERVER_ERROR, 
                message : "Unable to process request!", 
                errors : err
          });
        } else {
          if(result.length > 0){
            res.status(config.HTTP_SUCCESS).send({
              status: config.SUCCESS,
              code: config.HTTP_SUCCESS,
              message:"Record found",
              result:result
            });
          }else{
             res.status(config.HTTP_NOT_FOUND).send({
                status:config.ERROR,
                code: config.HTTP_NOT_FOUND, 
                message:"No record found"
              }); 
          }
        }        
        
      });
    
  }
  /******************************  END   *****************************************/
}

module.exports = new CommonController();
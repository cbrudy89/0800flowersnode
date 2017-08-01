var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var async = require('async');
var config = require('./../../config');
var connection = require('./../../database');
var dbModel = require('./../models/db-model');
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

    var language_id=req.params.langauge_code;

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
        function countriesprovinces(callback) {
          var country = [];

            dbModel.rawQuery("SELECT id, country_name, TRIM(TRAILING ',' FROM CONCAT(country_name,',',country_alias)) as alias,short_code,iso_code,CONCAT('"+config.RESOURCE_URL+"',country_flag) as country_flag,CONCAT('"+config.RESOURCE_URL+"',company_logo) as company_logo, show_state, preferred_currency_id FROM country_list WHERE status = 1", function(err, countries) {
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
                    company_logo = countries[i].company_logo;


                    country.push({
                      "country_id": country_id, 
                      "country_name": country_name, 
                      "alias": alias, 
                      "short_code": short_code, 
                      "iso_code": iso_code, 
                      "country_flag": country_flag, 
                      "show_state": show_state,
                      "redirect_url": redirect_url,
                      "preferred_currency_id": preferred_currency_id,
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

          sql = "SELECT translation.lkey as 'key',translated_text FROM language_translation, translation, languages WHERE language_translation.translation_id=translation.id AND language_translation.language_id=languages.id AND languages.id= "+language_id;
          //console.log(sql);
          dbModel.rawQuery(sql, function(err, result) {
             if (err) return callback(err);
             return_data.translation_content = result;
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

module.exports = new CommonController();
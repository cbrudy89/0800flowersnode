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


}

module.exports = new CommonController();
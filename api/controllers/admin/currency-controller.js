var jwt = require('jsonwebtoken');
var async = require('async');
var Sync = require('sync');
var request = require('request');
var config = require('./../../../config');
var connection = require('./../../../database');
var dbModel = require('./../../models/db-model');
var commonHelper = require('./../../helpers/common-helper');

function CurrencyController() {

    this.getallcurrencies = function(req, res) {
        if(req.decoded.role != config.ROLE_ADMIN){
            res.status(config.HTTP_FORBIDDEN).send({
              status: config.ERROR, 
              code : config.HTTP_FORBIDDEN, 
              message: "You dont have permission to create Province!"
            });       
        }else{

            var currency_name = req.body.currency_name;
            var currency_code = req.body.currency_code;

            var string='';
            var string1='';
            var queryString= 'Select * from currency';
            if(currency_name != "" && currency_name != undefined){
                string += " `currency_name` like '%"+currency_name+"%'";
            }
            if(currency_code != "" && currency_code != undefined){
                string1 += " `currency_code` like '%"+currency_code+"%'";
            }
            if(string != "" || string1 != ""){
                queryString += " WHERE ";
            }
            queryString += string;

            if(string != "" && string1 != ""){
                queryString += " AND ";
            }
            queryString += string1;

            dbModel.rawQuery(queryString, function(err, result) {
              if (err) {
                res.status(config.HTTP_BAD_REQUEST).send({
                  status: config.ERROR, 
                  code : config.HTTP_BAD_REQUEST, 
                  message: err
                });
              }
              else{
                    if(result.length > 0){
                        res.status(config.HTTP_SUCCESS).send({
                          status: config.SUCCESS,
                          code: config.HTTP_SUCCESS,
                          message:"currencies found",
                          result: result
                        });
                    }
                    else {
                        res.status(config.HTTP_BAD_REQUEST).send({
                          status:config.ERROR,
                          code: config.HTTP_BAD_REQUEST, 
                          message:"Failed to get currencies"
                      }); 
                    }
              }
            });
        }
    }
    //edit currency
    this.editcurrency = function(req, res) {
        if(req.decoded.role != config.ROLE_ADMIN){
            res.status(config.HTTP_FORBIDDEN).send({
              status: config.ERROR, 
              code : config.HTTP_FORBIDDEN, 
              message: "You dont have permission to create Province!"
            });       
        }else{
            var id= req.body.id;
            var post = {
                currency_name: req.body.currency_name,
                currency_code: req.body.currency_code,
                currency_numeric_code: req.body.currency_numeric_code,
                symbol: req.body.symbol,
                status: req.body.status,
                prefix: req.body.prefix,
                suffix: req.body.suffix,
                exchange_rate: req.body.exchange_rate,
                default_currency: req.body.default_currency
            };  

            var queryString="SELECT * FROM currency WHERE currency_code="+currency_code+" AND id <> "+id;
            dbModel.rawQuery(queryString, function(err, result) {
              if (err) {
                res.status(config.HTTP_BAD_REQUEST).send({
                  status: config.ERROR, 
                  code : config.HTTP_BAD_REQUEST, 
                  message: err
                });
              }
              else{
                    if(result.length > 0){
                        res.status(config.HTTP_SUCCESS).send({
                          status: config.SUCCESS,
                          code: config.HTTP_SUCCESS,
                          message:"The currency code has already been saved.",
                          result: result
                        });
                    }
                    else {
                        dbModel.save('currency',post,id, function(err, result) {
                              if (err) {
                                res.status(config.HTTP_BAD_REQUEST).send({
                                  status: config.ERROR, 
                                  code : config.HTTP_BAD_REQUEST, 
                                  message: err
                                });
                              }
                              else{
                                    res.status(config.HTTP_SUCCESS).send({
                                          status: config.SUCCESS, 
                                          code : config.HTTP_SUCCESS, 
                                          message: 'currency saved'
                                    });               
                              }
                        });
                    }
              }
            });

            
        }
    }
    //delete currency
    this.deletecurrency = function(req, res) {
        if(req.decoded.role != config.ROLE_ADMIN){
            res.status(config.HTTP_FORBIDDEN).send({
              status: config.ERROR, 
              code : config.HTTP_FORBIDDEN, 
              message: "You dont have permission to create Province!"
            });       
        }else{
            var id= req.body.id;

            dbModel.delete('currency','id='+id, function(err, result) {
              if (err) {
                res.status(config.HTTP_BAD_REQUEST).send({
                  status: config.ERROR, 
                  code : config.HTTP_BAD_REQUEST, 
                  message: err
                });
              }
              else{
                    res.status(config.HTTP_SUCCESS).send({
                          status: config.SUCCESS, 
                          code : config.HTTP_SUCCESS, 
                          message: 'currency deleted'
                    });            
              }
            });
        }
    }
    //Add new currency
    this.addcurrency = function(req, res) {
        if(req.decoded.role != config.ROLE_ADMIN){
            res.status(config.HTTP_FORBIDDEN).send({
              status: config.ERROR, 
              code : config.HTTP_FORBIDDEN, 
              message: "You dont have permission to create Province!"
            });       
        }else{
            var post = {
                currency_code: req.body.currency_code,
                currency_numeric_code: req.body.currency_numeric_code,
                currency_name: req.body.currency_name,
                symbol: req.body.symbol,
                status: req.body.status,
                prefix: req.body.prefix,
                suffix: req.body.suffix,
                exchange_rate: req.body.exchange_rate,
                default_currency: req.body.default_currency
            };  
            var queryString="SELECT * FROM currency WHERE currency_code="+currency_code;
            dbModel.rawQuery(queryString, function(err, result) {
              if (err) {
                res.status(config.HTTP_BAD_REQUEST).send({
                  status: config.ERROR, 
                  code : config.HTTP_BAD_REQUEST, 
                  message: err
                });
              }
              else{
                    if(result.length > 0){
                        res.status(config.HTTP_SUCCESS).send({
                          status: config.SUCCESS,
                          code: config.HTTP_SUCCESS,
                          message:"The currency code has already been saved.",
                          result: result
                        });
                    }
                    else {
                        dbModel.save('currency',post, '',function(err, result) {
                          if (err) {
                            res.status(config.HTTP_BAD_REQUEST).send({
                              status: config.ERROR, 
                              code : config.HTTP_BAD_REQUEST, 
                              message: err
                            });
                          }
                          else{
                                res.status(config.HTTP_SUCCESS).send({
                                      status: config.SUCCESS, 
                                      code : config.HTTP_SUCCESS, 
                                      message: 'Currency has been inserted successfully!'
                                });               
                          }
                        });
                    }
              }
            });
            
        }
    }

}



module.exports = new CurrencyController();
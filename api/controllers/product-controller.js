var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var async = require('async');
var config = require('./../../config');
var connection = require('./../../database');
var dbModel = require('./../models/db-model');

function ProductController() {
  // Collection page data
  this.productdetails  = function(req, res) {
      var return_data = {};
      // Product name, image. description, price converted, related products, recent viewd products, disabled dates, calendar
      //This functions will be executed at the same time
      async.parallel([

          function getCustomDeliveryDate(callback){

            

            dbModel.rawQuery(queryString, function(err, result) {
              console.log
                 if (err) return callback(err);
                 return_data.getProductlistwithcountry = result;
                 callback();
              });
          },
        
          
          function homeoffer(callback){

              dbModel.find('home_offer','id, line1, line2, line3, line4', '', '', '', function(err, result) {
                 if (err) return callback(err);
                 return_data.home_offer = result;
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

module.exports = new ProductController();
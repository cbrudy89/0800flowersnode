var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var async = require('async');
var config = require('./../../config');
var connection = require('./../../database');
var dbModel = require('./../models/db-model');

function ProductController() {
  // Collection page data
  this.collections  = function(req, res) {
      var return_data = {};
      //This functions will be executed at the same time
      async.parallel([

          function getProductlistwithcountry(callback){
            var delivery_to = req.headers.delivery_to;
            var language_id = req.headers.language_id;
            var queryString = "select * from `products` inner join `location_product` on `products`.`id` = `location_product`.`product_id` inner join `methods` on `methods`.`id` = `products`.`delivery_method_id` inner join `vendor` on `vendor`.`id` = `products`.`vendor_id`";
                 queryString += " WHERE ";
                 queryString += "`product_status` = 1";
                 queryString += " AND ";
                 queryString += "`products`.`admin_confirm` = 1";
                 queryString += " AND ";
                 queryString += "`products`.`frontend_show` = 1";
                 queryString += " AND ";
                 queryString += "`vendor`.`status` = 1";
                 queryString += " AND ";
                 queryString += "`vendor`.`status` = 1";
                 queryString += " AND ";
                 queryString += "`location_product`.`country_id` = '"+delivery_to+"'";
                 queryString += "group by `location_product`.`product_id`";
                 //language_product, language_id, product_id 
             console.log(queryString);
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
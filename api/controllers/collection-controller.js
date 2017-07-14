var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var async = require('async');
var Sync = require('sync');

var config = require('./../../config');
/*var connection = require('./../../database');*/
var dbModel = require('./../models/db-model');
var commonModel = require('./../helpers/common-helper');

function CollectionController() {
  // Collection page data
  this.collections  = function(req, res) {
      var return_data = {};
      var delivery_country_id = req.params.delivery_country_id;
      var province_id = req.params.delivery_province_id;
      var language_id = req.params.langauge_code;
      var order_by = req.params.order_by;
      var page = req.params.page;

      //This functions will be executed at the same time
      async.parallel([
          function topbanner(callback){
             commonModel.getPromoBanner(language_id, 'collections', function(err, result) {
                 if (err) return callback(err);
                 else {
                    if(result.length > 0 && result[0].description != ''){
                      return_data.topbanner = result[0].description;
                      callback();                      
                    }
                 }
              });
          },
          function upcomingoccasion(callback){
            var date = new Date();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var upcomings_data = [];
            var upcomings = "SELECT occasion_name,occasion_day,occasion_month FROM `occasions` INNER JOIN `occasion_country` ON(`occasions`.`id` = `occasion_country`.`occasion_id`) WHERE `occasion_country`.`country_id` = '"+delivery_country_id+"' AND `occasion_status` = 1 AND `i_mark` = 1 AND `occasion_month` >= '"+month+"' ORDER BY `occasion_month` ASC, `occasion_day` ASC LIMIT 3";
            dbModel.rawQuery(upcomings, function(err, result) {
              if (err) return callback(err);
              else{
                if(result.length > 0){
                  for ( var i=0 ; i < result.length; i++) {
                      if(result[0].occasion_month>=month){
                        if(result[0].occasion_month==month && result[0].occasion_day>day){
                               upcomings_data.push(result);
                            }else if(result[0].occasion_month>month){
                               upcomings_data.push(result);
                            }
                      }
                   } 
                 return_data.upcomingoccasion = upcomings_data;
                }
                 return_data.upcomingoccasion = result;
                 callback();
              }
            });
          },
          function getProductlistwithcountry(callback){
            
            var products = [];

            var totalRec = 0,
                limit  = 30,
                pageCount = 0,
                start = 0,
                currentPage = 1;


            var countSql = 'SELECT count(DISTINCT(products.id)) as total FROM products INNER JOIN location_product ON (products.id = location_product.product_id) INNER JOIN methods ON(methods.id = products.delivery_method_id) INNER JOIN vendor ON(vendor.id = products.vendor_id)';
            countSql += " WHERE ";
            countSql += "products.product_status = 1";
            countSql += " AND ";
            countSql += "products.admin_confirm = 1";
            countSql += " AND ";
            countSql += "products.frontend_show = 1";
            countSql += " AND ";
            countSql += "vendor.status = 1";
            countSql += " AND ";
            countSql += "vendor.status = 1";
            countSql += " AND ";
            countSql += "location_product.country_id = '"+delivery_country_id+"'";
            if(province_id != undefined){
               countSql += " AND ";
               countSql += "location_product.province_id = '"+province_id+"'";                  
            }

            //console.log(countSql);

            dbModel.rawQuery(countSql, function(err, result) {
              if (err) {
                return callback(err);
              } else {

                totalRec  = result[0].total;
                pageCount =  Math.ceil(totalRec /  limit);
                if (typeof page !== 'undefined') {
                   currentPage = page;
                }
              }
            });

            if(currentPage >1){
              start = (currentPage - 1) * limit;
            }            

            // Get preferred_currency_id from country 
            var queryString = "SELECT products.id AS 'product_id',products.product_code,products.slug,products.atlas_product_name,products.vendor_id,products.product_picture,methods.delivery_method,methods.delivery_within,methods.delivery_charge,methods.delivery_days,methods.delivery_hour,methods.delivery_minute,methods.delivery_policy_id FROM products INNER JOIN location_product ON (products.id = location_product.product_id) INNER JOIN methods ON(methods.id = products.delivery_method_id) INNER JOIN vendor ON(vendor.id = products.vendor_id)";
            queryString += " WHERE ";
            queryString += "products.product_status = 1";
            queryString += " AND ";
            queryString += "products.admin_confirm = 1";
            queryString += " AND ";
            queryString += "products.frontend_show = 1";
            queryString += " AND ";
            queryString += "vendor.status = 1";
            queryString += " AND ";
            queryString += "vendor.status = 1";
            queryString += " AND ";
            queryString += "location_product.country_id = '"+delivery_country_id+"'";
            if(province_id != undefined){
               queryString += " AND ";
               queryString += "location_product.province_id = '"+province_id+"'";                  
            }
            queryString += " GROUP BY location_product.product_id";
            queryString += " ORDER BY products.frontend_serial_number ASC";
            queryString += " LIMIT "+start+","+limit;
            
            //console.log(queryString);

            dbModel.rawQuery(queryString, function(err, result) {
              if (err) {
                return callback(err);
              } else {
                var products = [];


                Sync(function(){
                  
                  for ( var i=0 ; i < result.length; i++) {
                    
                      var item = [];                        
                      item = result[i];

                      // Function.prototype.sync() interface is same as Function.prototype.call() - first argument is 'this' context 
                      var price_data = getproductprices.sync(null, result[i].product_id, delivery_country_id, 0);

                      if(price_data != ''){

                          $actPrice = number_format((price_data.product_result[0].price_value * price_data.currency_result[0].exchange_rate), 2);
                          $compPrice = number_format((price_data.product_result[0].compare_price * price_data.currency_result[0].exchange_rate), 2);

                          var $current_currency = price_data.currency_result[0].symbol+" "+price_data.currency_result[0].currency_code;
                          var $currentCurrSymbl = price_data.currency_result[0].symbol;
                          if($current_currency.indexOf("USD") === false){ 
                              $actPrice = roundToNineNine($actPrice, $current_currency);
                          }
                          if ($compPrice > $actPrice) {
                             item.compPrice = $currentCurrSymbl + $compPrice;
                             item.price = $currentCurrSymbl + $actPrice;
                          } else {
                             item.price = $currentCurrSymbl + $actPrice;
                          }

                      }
                                            
                      products.push(item);
                    
                    }

                   return_data.getProductlistwithcountry =  products;
                   callback();                        
                 
                });

               }
            });
          },
          function homeoffer(callback){
              dbModel.find('home_offer','id, line1, line2, line3, line4', '', '', '', function(err, result) {
                 if (err) return callback(err);
                 return_data.home_offer = result;
                 callback();
              });

          },
          function getColorFilterByCountryProvince(callback){
            
            var sql = "SELECT `colors`.`id`, `colors`.`color_name` FROM `products` INNER JOIN `color_product` on `products`.`id` = `color_product`.`product_id` INNER JOIN `colors` on `colors`.`id` = `color_product`.`color_id` INNER JOIN `location_product` on `products`.`id` = `location_product`.`product_id` INNER JOIN `vendor` on `vendor`.`id` = `products`.`vendor_id` WHERE `products`.`product_status` = 1 AND `products`.`frontend_show` = 1 and `vendor`.`status` = 1 and `products`.`admin_confirm` = 1 and `location_product`.`country_id` = "+delivery_country_id+" GROUP BY `colors`.`id`";

              dbModel.rawQuery(sql, function(err, result) {
                if (err) return callback(err);
                else {
                  if(result.length > 0){
                    return_data.filterColors = result;
                    callback();                    
                  }                  
                }
              });            
          },
          function getFlowerTypeFilterByCountryProvince(callback){
            
            var sql = "SELECT `flower_types`.`id`, `flower_types`.`flower_type` FROM `products` INNER JOIN `flower_type_product` on `products`.`id` = `flower_type_product`.`product_id` INNER JOIN `flower_types` on `flower_types`.`id` = `flower_type_product`.`flower_type_id` INNER JOIN `location_product` on `products`.`id` = `location_product`.`product_id` INNER JOIN `vendor` on `vendor`.`id` = `products`.`vendor_id` WHERE `vendor`.`status` = 1 and `products`.`product_status` = 1 and `products`.`frontend_show` = 1 and `products`.`admin_confirm` = 1";
            sql += " AND `location_product`.`country_id` = "+delivery_country_id;
            if(province_id != undefined){
               sql += " AND ";
               sql += "location_product.province_id = '"+province_id+"'";                  
            }
            sql += " GROUP BY `flower_types`.`id`";            

            dbModel.rawQuery(sql, function(err, result) {
              if (err) return callback(err);
              else {
                if(result.length > 0){
                  return_data.filterFlowerTypes = result;
                  callback();              
                }
              }
            }); 
          }, 
          function getOccasionsFilterByCountryProvince(callback){

            var sql = "select `occasions`.`id`, `occasions`.`occasion_name` from `products` inner join `occasion_product` on `products`.`id` = `occasion_product`.`product_id` inner join `occasions` on `occasions`.`id` = `occasion_product`.`occasion_id` inner join `location_product` on `products`.`id` = `location_product`.`product_id` inner join `occasion_country` on `occasions`.`id` = `occasion_country`.`occasion_id` inner join `vendor` on `vendor`.`id` = `products`.`vendor_id` where `vendor`.`status` = 1 and `products`.`product_status` = 1 and `products`.`frontend_show` = 1 and `products`.`admin_confirm` = 1 and `occasions`.`collection_filter` = 1";
            sql += " AND `location_product`.`country_id` = "+delivery_country_id;
            sql += " AND `occasion_country`.`country_id` = "+delivery_country_id;
            if(province_id != undefined){
               sql += " AND ";
               sql += "location_product.province_id = '"+province_id+"'";                  
            }
            sql += " GROUP BY `occasions`.`id`";            

            dbModel.rawQuery(sql, function(err, result) {
              if (err) return callback(err);
              else {
                if(result.length > 0){
                  return_data.filterOccasions = result;
                  callback();              
                }
              }
            }); 
          }, 
          function getSympathyTypeFilterByCountryProvince(callback){

            var sql = "select `sympathy_types`.`id`, `sympathy_types`.`sympathy_type` from `products` inner join `sympathy_type_product` on `products`.`id` = `sympathy_type_product`.`product_id` inner join `sympathy_types` on `sympathy_types`.`id` = `sympathy_type_product`.`sympathy_type_id` inner join `location_product` on `products`.`id` = `location_product`.`product_id` inner join `vendor` on `vendor`.`id` = `products`.`vendor_id` where `vendor`.`status` = 1 and `products`.`product_status` = 1 and `products`.`frontend_show` = 1 and `products`.`admin_confirm` = 1";
            sql += " AND `location_product`.`country_id` = "+delivery_country_id;
            if(province_id != undefined){
               sql += " AND ";
               sql += "location_product.province_id = '"+province_id+"'";                  
            }
            sql += " GROUP BY `sympathy_types`.`id`";            

            dbModel.rawQuery(sql, function(err, result) {
              if (err) return callback(err);
              else {
                if(result.length > 0){
                  return_data.filterSympathyTypes = result;
                  callback();              
                }
              }
            }); 
          },     
/*
          function getDeliveryMethodFilterByCountryProvince(callback){

            var today = 0;
            var tomorrow = 1;
            var delivery = [];

            Sync(function(){
    
              var sql = "select count(*) as aggregate from `products` inner join `methods` on `methods`.`id` = `products`.`delivery_method_id` inner join `vendor` on `vendor`.`id` = `products`.`vendor_id` inner join `location_product` on `products`.`id` = `location_product`.`product_id` where `vendor`.`status` = 1 and `products`.`product_status` = 1 and `products`.`frontend_show` = 1 and `products`.`admin_confirm` = 1";
                sql += " AND `methods`.`delivery_within` = "+today;
                sql += " AND `location_product`.`country_id` = "+delivery_country_id;
                if(province_id != undefined){
                   sql += " AND ";
                   sql += "location_product.province_id = '"+province_id+"'";                  
                }
                sql += " GROUP BY `methods`.`id`";            

                dbModel.rawQuery(sql, function(err, result) {
                  if (err) return callback(err);
                  else {
                    if(result.length > 0){
                      
                      delivery.push({
                        "0" : "Can deliver today"
                      });
                    }
                  }
                }); 


                var sql = "select count(*) as aggregate from `products` inner join `methods` on `methods`.`id` = `products`.`delivery_method_id` inner join `vendor` on `vendor`.`id` = `products`.`vendor_id` inner join `location_product` on `products`.`id` = `location_product`.`product_id` where `vendor`.`status` = 1 and `products`.`product_status` = 1 and `products`.`frontend_show` = 1 and `products`.`admin_confirm` = 1";
                sql += " AND `methods`.`delivery_within` = "+tomorrow;
                sql += " AND `location_product`.`country_id` = "+delivery_country_id;
                if(province_id != undefined){
                   sql += " AND ";
                   sql += "location_product.province_id = '"+province_id+"'";                  
                }
                sql += " GROUP BY `methods`.`id`";   

                dbModel.rawQuery(sql, function(err, result) {
                  if (err) return callback(err);
                  else {
                    if(result.length > 0){
                      delivery.push({
                        "1" : "Deliver tomorrow"
                      });
                     
                    }
                  }
                });                 


                return result;
                
            }, function(err, result){ // <-- standard callback 
                
                if (err) return callback(err); // something went wrong 
                
                // The result which was returned from Sync body function 
                return_data.delivery = result;
                callback();
            })


          }, */                              
                      
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

function getColorFilterByCountryProvince(){
  $sql = "SELECT `colors`.`id`, `colors`.`color_name` FROM `products` INNER JOIN `color_product` on `products`.`id` = `color_product`.`product_id` INNER JOIN `colors` on `colors`.`id` = `color_product`.`color_id` INNER JOIN `location_product` on `products`.`id` = `location_product`.`product_id` INNER JOIN `vendor` on `vendor`.`id` = `products`.`vendor_id` WHERE `products`.`product_status` = 1 AND `products`.`frontend_show` = 1 and `vendor`.`status` = 1 and `products`.`admin_confirm` = 1 and `location_product`.`country_id` = 4 GROUP BY `colors`.`id`";


}

function getproductprices($product_id = NULL, $country_id = null, $sale = NULL, callback)
{
    var data = {};
    // Select product price on basis of product id
    var sql = "SELECT pp.* FROM products p JOIN product_prices pp ON(p.id = pp.product_id) WHERE p.product_status = 1 AND p.id = "+$product_id+" ORDER BY pp.price_value ASC";

    dbModel.rawQuery(sql, function(err, product_result) {
       if (err) return callback(err);
       if (product_result.length > 0){

         // Get price details from currency tables by country
         var sql = "SELECT c.* FROM country_list cl JOIN currency c ON(cl.preferred_currency_id = c.id) WHERE cl.id = "+$country_id+" AND c.status = 1";

          dbModel.rawQuery(sql, function(err, currency_result) {
            if (err) return callback(err);
            if (currency_result.length > 0){

               data.product_result = product_result;
               data.currency_result = currency_result;

               callback(null, data);
                              
            }
          });
       }
    });
}


function number_format (number, decimals, decPoint, thousandsSep) { // eslint-disable-line camelcase
 
  number = (number + '').replace(/[^0-9+\-Ee.]/g, '')
  var n = !isFinite(+number) ? 0 : +number
  var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
  var sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep
  var dec = (typeof decPoint === 'undefined') ? '.' : decPoint
  var s = ''
  var toFixedFix = function (n, prec) {
    var k = Math.pow(10, prec)
    return '' + (Math.round(n * k) / k)
      .toFixed(prec)
  }
  // @todo: for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.')
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || ''
    s[1] += new Array(prec - s[1].length + 1).join('0')
  }
  return s.join(dec)
}

function roundToNineNine($actPrice, $current_currency){ 
    $newPrice = false;
    if($actPrice != '' && $actPrice != undefined){
        //$parse = explode(".", $actPrice);
        $parse = $actPrice.split(".");

        if($current_currency.indexOf("INR") !== false){
            $price = $parse[0];
            $priceLength = $price.length;
                    
            switch ($priceLength) {
                case 1: 
                    //$newPrice = substr($price, 0, -1) . '9';
                    $newPrice = $price.substring(0, -1) + '9';
                    break;
                case 2: 
                    //$newPrice = substr($price, 0, -2) . '99';
                    $newPrice = $price.substring(0, -2) + '99';
                    break;
                default:
                    //$newPrice = substr($price, 0, -2) . '99';
                    $newPrice = $price.substring(0, -2) + '99';
                    break;
            }
        }else{ 
            $newPrice = $parse[0]+".99";
        }
    }
    return $newPrice;
} 

module.exports = new CollectionController();
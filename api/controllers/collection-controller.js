var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var async = require('async');
var config = require('./../../config');
var connection = require('./../../database');
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

      //This functions will be executed at the same time
      async.parallel([
          function topbanner(callback){
             commonModel.getPromoBanner(language_id, 'collections', function(err, result) {
                 if (err) return callback(err);
                 return_data.topbanner = result;
                 callback();
              });
          },
          function upcomingoccasion(callback){
            var date = new Date();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var upcomings_data = [];
            var upcomings = "select * from `occasions` inner join `occasion_country` on `occasions`.`id` = `occasion_country`.`occasion_id` where `occasion_country`.`country_id` = '"+delivery_country_id+"' and `occasion_status` = 1 and `i_mark` = 1 and `occasion_month` >= '"+month+"' order by `occasion_month` asc, `occasion_day` asc limit 3";
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
            // Get preferred_currency_id from country 
                var queryString = "select *, products.id as prduct_id from `products` inner join `location_product` on `products`.`id` = `location_product`.`product_id` inner join `methods` on `methods`.`id` = `products`.`delivery_method_id` inner join `vendor` on `vendor`.`id` = `products`.`vendor_id`";
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
                 queryString += "`location_product`.`country_id` = '"+delivery_country_id+"'";
                 if(province_id != undefined){
                   queryString += " AND ";
                   queryString += "`location_product`.`province_id` = '"+province_id+"'";                  
                 }
                 queryString += "group by `location_product`.`product_id`";
             //console.log(queryString);
            dbModel.rawQuery(queryString, function(err, result) {
                 if (err) return callback(err);
                 var data = [];
                 var item = [];
                  result.forEach(function(item, index){
                      getproductprices(item.product_id, delivery_country_id, 0, function(err, price_data){
                        if (err) return callback(err);
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

                        }else{
                          item.price = '';
                        }
                       // console.log(item.price);
                       // console.log(item);
                         
                         result.push( "price", item.price );
                      });
                      //console.log(item);
                      
                      
                    /*  console.log(data);
                      data.push(item);*/
                     // console.log(data);

                  });

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
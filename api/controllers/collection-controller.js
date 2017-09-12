var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var async = require('async');
var Sync = require('sync');

var config = require('./../../config');
/*var connection = require('./../../database');*/
var dbModel = require('./../models/db-model');
var commonHelper = require('./../helpers/common-helper');

var showCheckDisable = 0;

function CollectionController() {
  // Collection page data
  this.collection_promotion = function(req, res){

    var return_data = {};
    var delivery_country_id = req.params.delivery_country_id;
    var province_id = req.params.delivery_province_id;
    var language_id = req.params.langauge_code;

    //This functions will be executed at the same time
    async.parallel([
      function topbanner(callback){
         commonHelper.getPromoBanner(language_id, 'collections', function(err, result) {
             if (err) return callback(err);
             else {
                if(result.length > 0 && result[0].description != ''){
                  return_data.topbanner = result[0].description;
                }else{
                  return_data.topbanner = '';
                }
                callback();
             }
          });
      },
      function upcomingoccasion(callback){
        var date = new Date();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var upcomings_data = [];
        var sql = "SELECT `language_types`.name as occasion_name,occasion_day,occasion_month FROM `occasions`";
        sql += " INNER JOIN `occasion_country` ON(`occasions`.`id` = `occasion_country`.`occasion_id`)";
        sql += " INNER JOIN `language_types` ON(`occasions`.`id` = `language_types`.`type_id`)";
        sql += "  WHERE `occasion_country`.`country_id` = '"+delivery_country_id+"'";
        sql += "  AND `language_types`.language_id = "+language_id;
        sql += "  AND `occasion_status` = 1";
        sql += "  AND `i_mark` = 1";
        sql += "  AND `occasion_month` >= '"+month+"'";
        sql += "  AND `type` = 'occasion'";
        sql += "  ORDER BY `occasion_month` ASC, `occasion_day` ASC LIMIT 3";

       // console.log(sql);
        dbModel.rawQuery(sql, function(err, result) {
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
      }
     /* ,
      function homeoffer(callback){
          dbModel.find('home_offer','id, line1, line2, line3, line4', '', '', '', function(err, result) {
            if (err) return callback(err);
            else {
              return_data.home_offer = result;
              callback();
            }
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

  this.collections  = function(req, res) {

      var return_data = {};
      var reqData = {};

      var delivery_country_id = req.body.delivery_country_id;
      var province_id = req.body.delivery_province_id;
      var language_id = req.body.langauge_code;
      var currency_id = req.body.currency_id;

      var page = req.body.page;
      var limit = req.body.limit;
      var order_by = req.body.order_by;

      var filter_keyword = req.body.filter_keyword;
      var delivery_methods = req.body.delivery_methods;
      var price = req.body.price;
      var occasions = req.body.occasions;
      var sympathy = req.body.sympathy;
      var colors = req.body.colors;
      var flower_types = req.body.flower_types;
      var mixed_bouquet_types = req.body.mixed_bouquet_types;

      if(limit == undefined || limit == ''){
        limit = 30;
      }

      if (page == undefined || page == '') {
         page = 1;
      }

      var start = 0;    

    Sync(function(){

      if(page >1){
        start = (page - 1) * limit;
      }       

      // Getting Currency Details from current country
      var $currency_details = commonHelper.getCurrencyDetails.sync(null, currency_id, delivery_country_id);
      //console.log($currency_details);

      reqData = {
        "delivery_country_id": delivery_country_id,
        "province_id": province_id,
        "language_id": language_id,
        "currency_id": $currency_details[0].id,
        "exchange_rate": $currency_details[0].exchange_rate,
        "start": start,
        "limit": limit,
        "order_by":order_by,
        "filter_keyword": filter_keyword,
        "delivery_methods": delivery_methods,
        "price": price,
        "occasions": occasions,
        "sympathy": sympathy,
        "colors": colors,
        "flower_types": flower_types,
        "mixed_bouquet_types": mixed_bouquet_types
      };

      var $result = getProductlistwithfilters.sync(null, reqData, false);      
      if($result.length <= 0){
        
        var final_data  = {
          "preferred_currency_code": $currency_details[0].currency_code,
          "page": 0,
          "productList": [],
          "filter_orderby": [],
          "filter_productdeliverymethod": [],
          "filter_productprice": [],
          "filter_productcolor": [],
          "filter_productoccasion": [],
          "filter_productsympahty": [],
          "filter_productflowertype": []
          //"filter_productmixedbouquet": $colors
        };

        res.status(config.HTTP_SUCCESS).send({
            status: config.SUCCESS, 
            code : config.HTTP_SUCCESS, 
            message: "Showing "+$result.length + " products",
            result : final_data
        });

      }else{

        // Append Product Price in Products result
        /*var products = [];        
        for ( var i=0 ; i < $result.length; i++) {
                    
          var item = [];                        
          item = $result[i];

          var price_data = getproductprices.sync(null, $result[i].id, delivery_country_id, $currency_details[0].id, 0);

          //console.log(price_data);
          if(price_data != '' && price_data.currency_result.length > 0){

              var $actPrice = number_format((price_data.product_result[0].price_value * price_data.currency_result[0].exchange_rate), 2);
              var $compPrice = number_format((price_data.product_result[0].compare_price * price_data.currency_result[0].exchange_rate), 2);

              //var $current_currency = price_data.currency_result[0].symbol+" "+price_data.currency_result[0].currency_code;
              var $current_currency = price_data.currency_result[0].currency_code;

              var $currentCurrSymbl = price_data.currency_result[0].symbol;
              if($current_currency !== "USD"){ 
                  $actPrice = roundToNineNine($actPrice, $current_currency);
              }
              if ($compPrice > $actPrice) {
                 item.compPrice = $currentCurrSymbl + $compPrice;
                 item.price = $currentCurrSymbl + $actPrice;
              } else {
                 item.price = $currentCurrSymbl + $actPrice;
              }
              item.product_name = price_data.product_result[0].price_name;
              //console.log(item);
          }else{
            //console.log('No price');
          }
          products.push(item);
        }*/


        var products = [];        
        for ( var j=0 ; j < $result.length; j++) {
                    
          var item = [];                        
          item = $result[j];

          var $variants=[];

          $variantdetails = getVariantDetails.sync(null, $result[j].id);

          //console.log($variantdetails);
                                
          if($variantdetails.length > 0 && $currency_details.length > 0){
              var comPrice = price = '';
              for(var i=0; i < $variantdetails.length; i++){
                   //console.log($variantdetails[i].price_value);
                  var $actPrice = commonHelper.number_format.sync(null, ($variantdetails[i].price_value * $currency_details[0].exchange_rate), 2, '.', ',');
                  var $compPrice = commonHelper.number_format.sync(null, ($variantdetails[i].compare_price * $currency_details[0].exchange_rate), 2, '.', ',');

                  //var $current_currency = price_data.currency_result[0].symbol+" "+price_data.currency_result[0].currency_code;
                  var $current_currency = $currency_details[0].currency_code;

                  var $currentCurrSymbl = $currency_details[0].symbol;
                  if($current_currency !== "USD"){ 
                      $actPrice = commonHelper.roundToNineNine.sync(null, $actPrice, $current_currency);
                  }

                  if ($compPrice > $actPrice) {
                     comPrice += $currentCurrSymbl + $compPrice;
                     price += $currentCurrSymbl + $actPrice;
                  } else {
                     price += $currentCurrSymbl + $actPrice;
                  }

                  if(i < ($variantdetails.length - 1)){
                    comPrice += "-";
                    price += "-";
                  }
                 
              }
              
              item.compare_price = comPrice;  
              item.price = price;
          }

          products.push(item);
        }

        result = products;

        var $total_products = getProductlistwithfilters.sync(null, reqData, true);
        var product_ids = getProductIds.sync(null, $result);
        var $colors=[];
        //var $colors = getColorFilterByCountryProvince.sync(null, delivery_country_id, province_id, product_ids, language_id);
        var $flowers = getFlowerTypeFilterByCountryProvince.sync(null, delivery_country_id, province_id, product_ids,language_id);
        var $occasions = getOccasionsFilterByCountryProvince.sync(null, delivery_country_id, province_id, product_ids, language_id);
        var $sympathy = getSympathyTypeFilterByCountryProvince.sync(null, delivery_country_id, province_id, product_ids, language_id);

        //console.log($colors);

        // Translating Text for Price filter on basis of key
        var $orless_andabove = language.sync(null, language_id, "'andabove','orless'");
        var $priceFilter = getPriceFilter.sync(null, $orless_andabove, $currency_details, $result);
        
        // Append Product Price in Price Filter
        var priceFilter = [];        
        if($priceFilter.length > 0) {

          $priceFilter.forEach(function(pfilter, index){
            for( var key in pfilter ) {
              //console.log(key);

              var item = {};
              var price_filter = getPriceFilterByCountryProvince.sync(null, key, delivery_country_id, province_id, product_ids);

              //console.log(price_filter);
              if(price_filter.length > 0 && price_filter[0].aggregate > 0){
                  //item[key] = pfilter[key];
                  if(showCheckDisable){
                    priceFilter.push({
                      "id" : key,
                      "name" : pfilter[key],
                      "checked": false,
                      "disabled": false
                    });                    

                  }else{
                    priceFilter.push({
                      "id" : key,
                      "name" : pfilter[key]                      
                    });
                  }
              }          
              
            }
          });

        }

        $priceFilter = priceFilter;
        //console.log($priceFilter);
        
        // Translating Text for delivery filter on basis of key
        var $delivery_translation = language.sync(null, language_id, "'candeliver','delivertom'");
        var $delivery = getDeliveryFilters.sync(null, $result, $delivery_translation);

        //console.log($total_products.length);
        if($total_products.length > limit*page){
          page = parseInt(page)+1;
        }else{
          page = "";
        }

        //var $orderby_translation = language.sync(null, language_id, "'candeliver','delivertom'")

        var $orderby = [
          { "id": "default", "name": "Our Favorites"},
          { "id": "name-asc", "name": "Name: A to Z"},
          { "id": "name-desc", "name": "Name: Z to A"},
          { "id": "price-asc", "name": "Price: Low to High"},
          { "id": "price-desc", "name": "Price: High to Low"}
        ];        

        var final_data  = {
          "preferred_currency_code": $currency_details[0].currency_code,
          "page": page,
          "productList": $result,
          "filter_orderby": $orderby,
          "filter_productdeliverymethod": $delivery,
          "filter_productprice": $priceFilter,
        //  "filter_productcolor": $colors,
          "filter_productoccasion": $occasions,
          "filter_productsympahty": $sympathy,
          "filter_productflowertype": $flowers
          //"filter_productmixedbouquet": $colors
        };

        res.status(config.HTTP_SUCCESS).send({
            status: config.SUCCESS, 
            code : config.HTTP_SUCCESS, 
            //message: $result.length + " products found out of "+$total_products.length,
            message: "Showing "+$result.length + " products",
            result : final_data
        });
      }
    });
  }
}

/*
function convertPriceToNineNine($price){
    $currentCurrSymbl = Session::get('current_currencysymbol');
    $currentCurrId = Session::get('current_currency_id');
    $getCurrency = Currency::where(array('id' => $currentCurrId))->get();

    $newPrice = number_format(($price * $getCurrency[0]->exchange_rate), 2);
                
    if(strpos(Session::get('current_currency'), "USD") === false){ 
        $newPrice = roundToNineNine($newPrice); 
    }
                
    Session::put('exchange_rate', $getCurrency[0]->exchange_rate);

    return $currentCurrSymbl . $newPrice;
}
*/

function getPriceFilterByCountryProvince(amount, delivery_country_id, province_id, product_ids, callback){

  var priceArr = amount.split("-");
  var sql = "SELECT COUNT(*) AS aggregate FROM `products`";
  sql += " INNER JOIN `product_prices` ON `products`.`id` = `product_prices`.`product_id`";
  sql += " INNER JOIN `vendor` on `vendor`.`id` = `products`.`vendor_id`";
  sql += " INNER JOIN `location_product` on `products`.`id` = `location_product`.`product_id`";
  sql += " WHERE `vendor`.`status` = 1";
  sql += " AND `products`.`product_status` = 1";
  sql += " AND `products`.`frontend_show` = 1";
  sql += " AND `products`.`admin_confirm` = 1";
  sql += " AND `product_prices`.`price_value` >= "+priceArr[0];
  sql += " AND `product_prices`.`price_value` < "+parseInt(priceArr[1]+'0.01');
  sql += " AND `location_product`.`country_id` = "+delivery_country_id;

  if(province_id != undefined && province_id != '' ){
     sql += " AND `location_product`.`province_id` = '"+province_id+"'";
  }

  if(product_ids != '' && product_ids != undefined){  
    sql += " AND `products`.`id` in ("+product_ids+")";
  }

  sql += " GROUP BY `products`.`id`";
  //console.log(sql);

  dbModel.rawQuery(sql, function(err, result) {
    if (err) return callback(err);
    else 
       callback(null, result);
  });

}

function language(language_id, lkey, callback){

  var sql = "SELECT lt.translated_text FROM language_translation lt INNER JOIN translation t ON(t.id = lt.translation_id) WHERE lt.language_id = "+language_id+" AND t.lkey IN ("+lkey+") ORDER BY lt.translated_text ASC";

  //console.log(sql);

  dbModel.rawQuery(sql, function(err, result) {
    if (err) return callback(err);
    else 
       callback(null, result);
  });  

}

function getDeliveryFilters($result, $delivery_translation, callback){

    $final_filter = [];

    for(var i =0; i < $result.length; i++){    

      if($result[i].delivery_within == 0)
      {

        key = 0;
        value = $delivery_translation[0].translated_text;

      }else if($result[i].delivery_within == 1) {
        key = 1;
        value = $delivery_translation[1].translated_text;
      }else {
        key = 2;
        value = $delivery_translation[1].translated_text;
      }

      /*var dataKey = {};
      dataKey[key] = value;*/

      $final_filter.push({
        "id": key,
        "name" : value
      });      

    } 

    // Removing Duplicate from Array Object
    var myData = $final_filter;
    $final_filter = Array.from(new Set(myData.map(JSON.stringify))).map(JSON.parse);

    callback(null, $final_filter);

}


function getPriceFilter(orless_andabove, currency_details, filter_product_results, callback){

  $final_filter = [];

  $filterPrices = config.price_filter;

  $flag =1;

  for(var key in $filterPrices){
      if($flag==1){

         $pricearray = $filterPrices[key].split('or');
         $newPrice = number_format(($pricearray[0].trim() * currency_details[0].exchange_rate), 2);
         if(currency_details[0].currency_code !== "USD"){ 
            $newPrice = roundToNineNine($newPrice, currency_details[0].currency_code); 
         }

         $priceshow  = currency_details[0].symbol+$newPrice+" "+orless_andabove[1].translated_text;


      }else if($flag==4){

         $pricearray = $filterPrices[key].split('and');
         $newPrice = number_format(($pricearray[0].trim() * currency_details[0].exchange_rate), 2);
         if(currency_details[0].currency_code !== "USD"){ 
            $newPrice = roundToNineNine($newPrice, currency_details[0].currency_code); 
         }

         $priceshow  = currency_details[0].symbol+$newPrice+" "+orless_andabove[0].translated_text;

      }else{
         var $new_explode_min =  $new_explode_max = '';

         $pricearray = $filterPrices[key].split('-');
         $new_explode_min = number_format(($pricearray[0].trim() * currency_details[0].exchange_rate), 2);
         if(currency_details[0].currency_code !== "USD"){ 
            $new_explode_min = roundToNineNine($new_explode_min, currency_details[0].currency_code); 
         }

         $new_explode_max = number_format(($pricearray[1].trim() * currency_details[0].exchange_rate), 2);
         if(currency_details[0].currency_code !== "USD"){ 
            $new_explode_max = roundToNineNine($new_explode_max, currency_details[0].currency_code); 
         }         

         $priceshow  = currency_details[0].symbol+$new_explode_min+'-'+currency_details[0].symbol+$new_explode_max; 
      }

      //console.log(key+':'+$filterPrices[key]);
      //console.log(key);      

      var dataKey = {};
      dataKey[key] = $priceshow;

      $final_filter.push(dataKey);

      $flag++;
  }

  //console.log($final_filter);

  callback(null, $final_filter);


}

function getProductIds(data, callback){
  //console.log(data);

  if(data.length > 0){

      var product_ids = '';

      for(var i=0; i < data.length; i++){

        product_ids += data[i].id ;      

        if(i < (data.length - 1) ){
          product_ids += ',';
        }

      }

      callback(null, product_ids);

  }else{
    callback(null);
  }


}

function getColorFilterByCountryProvince(delivery_country_id, province_id, product_ids, language_id, callback){

  var sql = "SELECT `colors`.`id`, `language_types`.`name` as 'name', `colors`.`color_code`";

  if(showCheckDisable){

    sql += " ,CASE colors.id WHEN colors.id > 0 THEN 'false' ELSE 'false' END AS 'checked'"; // Create Fake Columns 
    sql += " ,CASE colors.id WHEN colors.id > 0 THEN 'false' ELSE 'false' END AS 'disabled'"; // Create Fake Columns  
  }

    sql += " FROM `products`"; 
    sql += " INNER JOIN `color_product` on `products`.`id` = `color_product`.`product_id`"; 
    sql += " INNER JOIN `colors` on `colors`.`id` = `color_product`.`color_id`"; 
    sql += " INNER JOIN `location_product` on `products`.`id` = `location_product`.`product_id`"; 
    sql += " INNER JOIN `vendor` on `vendor`.`id` = `products`.`vendor_id`"; 
/*  sql += " INNER JOIN `translation` ON `translation`.`id` = `colors`.`translation_id`";
    sql += " INNER JOIN `language_translation` ON `language_translation`.`translation_id` = `translation`.`id`";*/
    sql += " INNER JOIN `language_types` ON `language_types`.`type_id` = `colors`.`id`";
    sql += " WHERE `products`.`product_status` = 1"; 
    sql += " AND `products`.`frontend_show` = 1"; 
    sql += " and `vendor`.`status` = 1"; 
    sql += " and `products`.`admin_confirm` = 1"; 
    sql += " and `location_product`.`country_id` = "+delivery_country_id; 

    if(province_id != undefined && province_id != '' ){
       sql += " AND location_product.province_id = '"+province_id+"'";
    } 

    if(product_ids != '' && product_ids != undefined){  
      sql += " AND `color_product`.`product_id` in ("+product_ids+")";
    }

    sql += " AND `language_types`.`type` = 'color'";
    sql += " AND `language_types`.`language_id` = "+language_id;
    sql += " GROUP BY `colors`.`id`,`language_types`.`name`";
    sql += " ORDER BY `language_types`.`name` ASC";
/*  sql += " AND `language_translation`.`language_id` = "+language_id;
    sql += " GROUP BY `colors`.`id`,`language_translation`.`translated_text`";
    sql += " ORDER BY `language_translation`.`translated_text` ASC";*/
  //console.log(sql);

    dbModel.rawQuery(sql, function(err, colors) {
      if (err) return callback(err);
      else {
        callback(null, colors);                    
      }
    });            
}

function getFlowerTypeFilterByCountryProvince(delivery_country_id, province_id, product_ids,language_id, callback){

  var sql = "SELECT `flower_types`.`id`, `language_types`.`name` as 'name'";
  if(showCheckDisable){
    
    sql += " ,CASE flower_types.id WHEN flower_types.id > 0 THEN 'false' ELSE 'false' END AS 'checked'"; // Create Fake Columns 
    sql += " ,CASE flower_types.id WHEN flower_types.id > 0 THEN 'false' ELSE 'false' END AS 'disabled'"; // Create Fake Columns
  }
    sql += " FROM `products`"; 
    sql += " INNER JOIN `flower_type_product` on `products`.`id` = `flower_type_product`.`product_id`"; 
    sql += " INNER JOIN `flower_types` on `flower_types`.`id` = `flower_type_product`.`flower_type_id`"; 
    sql += " INNER JOIN `location_product` on `products`.`id` = `location_product`.`product_id`"; 
    sql += " INNER JOIN `vendor` on `vendor`.`id` = `products`.`vendor_id`"; 
    sql += " INNER JOIN `language_types` ON `language_types`.`type_id` = `flower_types`.`id`";
    //sql += " INNER JOIN `translation` ON `translation`.`id` = `flower_types`.`translation_id`";
    //sql += " INNER JOIN `language_translation` ON `language_translation`.`translation_id` = `translation`.`id`";
    sql += " WHERE `vendor`.`status` = 1"; 
    sql += " and `products`.`product_status` = 1"; 
    sql += " and `products`.`frontend_show` = 1"; 
    sql += " and `products`.`admin_confirm` = 1"; 
    sql += " AND `location_product`.`country_id` = "+delivery_country_id; 
    
    if(province_id != undefined && province_id != '' ){
       sql += " AND location_product.province_id = '"+province_id+"'";
    }    
    
    if(product_ids != '' && product_ids != undefined){    
      sql += " AND `flower_type_product`.`product_id` in ("+product_ids+")";
    }

    sql += " AND `language_types`.`type` = 'flower'";
    sql += " AND `language_types`.`language_id` = "+language_id;
    sql += " GROUP BY `flower_types`.`id`,`language_types`.`name`";
    sql += " ORDER BY `language_types`.`name` ASC";
    //sql += " AND `language_translation`.`language_id` = "+language_id;
    //sql += " GROUP BY `flower_types`.`id`,`language_translation`.`translated_text`";
    //sql += " ORDER BY `language_translation`.`translated_text` ASC";
  
  //console.log(sql);       

  dbModel.rawQuery(sql, function(err, result) {
    if (err) return callback(err);
    else {
        callback(null, result);             
    }
  }); 
}

function getOccasionsFilterByCountryProvince(delivery_country_id, province_id, product_ids,language_id, callback){

  var sql = "select `occasions`.`id`,`language_types`.`name` as 'name'";
  if(showCheckDisable){

    sql += " ,CASE occasions.id WHEN occasions.id > 0 THEN 'false' ELSE 'false' END AS 'checked'"; // Create Fake Columns 
    sql += " ,CASE occasions.id WHEN occasions.id > 0 THEN 'false' ELSE 'false' END AS 'disabled'"; // Create Fake Columns  
  }
    sql += " from `products`";
    sql += " inner join `occasion_product` on `products`.`id` = `occasion_product`.`product_id`";
    sql += " inner join `occasions` on `occasions`.`id` = `occasion_product`.`occasion_id` ";
    sql += " inner join `location_product` on `products`.`id` = `location_product`.`product_id`";
    sql += " inner join `occasion_country` on `occasions`.`id` = `occasion_country`.`occasion_id`";
    sql += " inner join `vendor` on `vendor`.`id` = `products`.`vendor_id`";
    sql += " INNER JOIN `language_types` ON `language_types`.`type_id` = `occasions`.`id`";
    /*sql += " INNER JOIN `translation` ON `translation`.`id` = `occasions`.`translation_id`";
    sql += " INNER JOIN `language_translation` ON `language_translation`.`translation_id` = `translation`.`id`";*/
    sql += " where `vendor`.`status` = 1";
    sql += " and `products`.`product_status` = 1";
    sql += " and `products`.`frontend_show` = 1";
    sql += " and `products`.`admin_confirm` = 1";
    sql += " and `occasions`.`collection_filter` = 1";
    sql += " AND `location_product`.`country_id` = "+delivery_country_id;
    sql += " AND `occasion_country`.`country_id` = "+delivery_country_id;
    
    if(province_id != undefined && province_id != '' ){
       sql += " AND location_product.province_id = '"+province_id+"'";                  
    }

    if(product_ids != '' && product_ids != undefined){    
      sql += " AND `occasion_product`.`product_id` in ("+product_ids+")";
    }     

    sql += " AND `language_types`.`type` = 'occasion'";
    sql += " AND `language_types`.`language_id` = "+language_id;
    sql += " GROUP BY `occasions`.`id`,`language_types`.`name`";
    sql += " ORDER BY `language_types`.`name` ASC";

    /*sql += " AND `language_translation`.`language_id` = "+language_id;
    sql += " GROUP BY `occasions`.`id`,`language_translation`.`translated_text`";
    sql += " ORDER BY `language_translation`.`translated_text` ASC";*/

  //console.log(sql);

  dbModel.rawQuery(sql, function(err, result) {
    if (err) return callback(err);
    else {
       callback(null, result);               
    }
  }); 
}                   
  
function getSympathyTypeFilterByCountryProvince(delivery_country_id, province_id, product_ids, language_id, callback){

  var sql = "SELECT `sympathy_types`.`id`, `language_types`.`name` as 'name'";
  if(showCheckDisable){

    sql += " ,CASE sympathy_types.id WHEN sympathy_types.id > 0 THEN 'false' ELSE 'false' END AS 'checked'"; // Create Fake Columns 
    sql += " ,CASE sympathy_types.id WHEN sympathy_types.id > 0 THEN 'false' ELSE 'false' END AS 'disabled'"; // Create Fake Columns    
  }
    sql += " FROM `products`";
    sql += " inner join `sympathy_type_product` on `products`.`id` = `sympathy_type_product`.`product_id`";
    sql += " inner join `sympathy_types` on `sympathy_types`.`id` = `sympathy_type_product`.`sympathy_type_id`";
    sql += " inner join `location_product` on `products`.`id` = `location_product`.`product_id`"
    sql += " inner join `vendor` on `vendor`.`id` = `products`.`vendor_id`";
    /*sql += " INNER JOIN `translation` ON `translation`.`id` = `sympathy_types`.`translation_id`"
    sql += " INNER JOIN `language_translation` ON `language_translation`.`translation_id` = `translation`.`id`" */
    sql += " INNER JOIN `language_types` ON `language_types`.`type_id` = `sympathy_types`.`id`" 
    sql += " where `vendor`.`status` = 1";
    sql += " and `products`.`product_status` = 1"
    sql += " and `products`.`frontend_show` = 1"
    sql += " and `products`.`admin_confirm` = 1";
    sql += " AND `location_product`.`country_id` = "+delivery_country_id;
    
    if(province_id != undefined && province_id != '' ){
       sql += " AND location_product.province_id = '"+province_id+"'";
    }
    
    if(product_ids != '' && product_ids != undefined){     
      sql += " AND `sympathy_type_product`.`product_id` in ("+product_ids+")";
    }

    /*sql += " AND `language_translation`.`language_id` = "+language_id;
    sql += " GROUP BY `sympathy_types`.`id`,`language_translation`.`translated_text`";
    sql += " ORDER BY `language_translation`.`translated_text` ASC";*/
    sql += " AND `language_types`.`type` = 'sympathy'";
    sql += " AND `language_types`.`language_id` = "+language_id;
    sql += " GROUP BY `sympathy_types`.`id`,`language_types`.`name`";
    sql += " ORDER BY `language_types`.`name` ASC";

  //console.log(sql);             

  dbModel.rawQuery(sql, function(err, result) {
    if (err) return callback(err);
    else {
      callback(null, result);              
    }
  });

}


function getCurrencyDetails($currency_id = null, $country_id, callback){

  // Get price details from currency tables by country
  //var sql = "SELECT c.* FROM country_list cl LEFT JOIN currency c ON(cl.preferred_currency_id = c.id) WHERE cl.id = "+$country_id+" AND c.status = 1";
  var sql = "SELECT * from `currency` WHERE id = "+$currency_id;

  dbModel.rawQuery(sql, function(err, currency_result) {
    if (err) return callback(err);
    else if (currency_result.length > 0){
       callback(null, currency_result);
                      
    }else{

      // If Preferred Currency Id not found for selected country then Use selected Currency Rate
      var sql = "SELECT * from `currency` WHERE id = "+$currency_id;

      dbModel.rawQuery($sql, function(err, currency_result) {
        if (err) return callback(err);
        else 
            callback(null, currency_result);

      });
    }
  });

}


/*function getProductFilterList($data, callback) {

  $currentCurrId = $data.currency_id;
  $item_per_page = $data.limit;
  
  $productList = getProductlistwithfilters($data, $item_per_page);
  
  var  $filter_productcolor = $filter_productoccasion = $filter_productprice = $filter_productsympahty = $filter_productmixedbouquet = $filter_productflowertype = $filter_productdeliverymethod = [];
  $fetched_items = $productList->toArray();

  if (isset($data['sort']) && $data['sort'] == 1) {
      
  }else{
      $fetched_items  = $fetched_items['data'];
  }
 //echo "<pre>"; print_r($fetched_items);die;delivery_within
  foreach ($fetched_items as $val) {
      foreach ($val['productcolor'] as $v) {
          if(!in_array($v['id'], $filter_productcolor)){
              $filter_productcolor[]=$v['id'];
          }
      }
      foreach ($val['productoccasion'] as $v) {
          if(!in_array($v['id'], $filter_productoccasion)){
              $filter_productoccasion[]=$v['id'];
          }
      }
      foreach ($val['fetchproductpriceonly'] as $v) {

          $p_value = "";
          $p_value = $v['price_value'];
          $p_value = number_format(($p_value * $data.exchange_rate), 2);
          if(!in_array($p_value, $filter_productprice)){
              $filter_productprice[]=$p_value;
          }
      }
      foreach ($val['productsympahty'] as $v) {
          if(!in_array($v['id'], $filter_productsympahty)){
              $filter_productsympahty[]=$v['id'];
          }
      }
      foreach ($val['productmixedbouquet'] as $v) {
          if(!in_array($v['id'], $filter_productmixedbouquet)){
              $filter_productmixedbouquet[]=$v['id'];
          }
      }
      foreach ($val['productflowertype'] as $v) {
          if(!in_array($v['id'], $filter_productflowertype)){
              $filter_productflowertype[]=$v['id'];
          }
      }
      if(!in_array($val['delivery_within'], $filter_productdeliverymethod)){
              $filter_productdeliverymethod[]=$val['delivery_within'];
      }
  }
  if (isset($data['sort']) && $data['sort'] == 1) {
      $totalproducts = $data['totalproduct'];
      $total_pages = ceil($totalproducts / $item_per_page);
  } else {
      $totalproducts = $productList->total();
      $total_pages = ceil($totalproducts / $item_per_page);
      $productList->setPath(URL::to('filterProductList'));
  }
  $result['total_pages'] = $total_pages;
  $result['product_list'] = $productList;
  $result['total_products'] = $totalproducts;
  $result['filter_productcolor']=$filter_productcolor;
  $result['filter_productoccasion']=$filter_productoccasion;
  $result['filter_productprice']=$filter_productprice;
  $result['filter_productsympahty']=$filter_productsympahty;
  $result['filter_productmixedbouquet']=$filter_productmixedbouquet;
  $result['filter_productflowertype']=$filter_productflowertype;
  $result['filter_productdeliverymethod']=$filter_productdeliverymethod;
  return $result;
}*/


function getProductlistwithfilters($filters, $find_total = false, callback) {

    if($find_total == false){
      
      var $sql = "SELECT `products`.`id`, views, CONCAT('"+config.RESOURCE_URL+"',REPLACE(`products`.`product_picture`, '+','%2B')) as product_picture, `products`.`product_code`, `products`.`slug`, `methods`.`delivery_method`,`methods`.`delivery_within`, (CASE WHEN `methods`.`delivery_within` = 0 THEN 'candeliver' WHEN `methods`.`delivery_within` = 1 THEN 'delivertom' WHEN `methods`.`delivery_within` = 2 THEN 'delivertom' END) AS 'delivery_within_key',`language_product`.`product_name`";
    }else{
      var $sql = "SELECT COUNT(*) AS total_products";
    }

    $sql += " FROM `products`";
    $sql += " INNER JOIN `product_prices` ON `products`.`id` = `product_prices`.`product_id`";
    $sql += " INNER JOIN `location_product` ON `location_product`.`product_id` = `products`.`id`";
    $sql += " INNER JOIN `methods` ON `methods`.`id` = `products`.`delivery_method_id`";
    $sql += " INNER JOIN `vendor` ON `vendor`.`id` = `products`.`vendor_id`";
    $sql += " INNER JOIN `language_product` ON `language_product`.`product_id` = `products`.`id`";
    
    if($filters.occasions != undefined && $filters.occasions != ''){
      $sql += " INNER JOIN `occasion_product` ON `occasion_product`.`product_id` = `products`.`id`";
    }

    if($filters.sympathy != undefined && $filters.sympathy != ''){

      $sql += " INNER JOIN `sympathy_type_product` ON `sympathy_type_product`.`product_id` = `products`.`id`";
    }

    if($filters.colors != undefined && $filters.colors != ''){

     $sql += " INNER JOIN `color_product` ON `color_product`.`product_id` = `products`.`id`";

    }

    if($filters.flower_types != undefined && $filters.flower_types != ''){

       $sql += " INNER JOIN `flower_type_product` ON `flower_type_product`.`product_id` = `products`.`id`";
    }

/*    if($filters.flower_types != undefined && $filters.flower_types != ''){

       $sql += " INNER JOIN `flower_type_product` ON `flower_type_product`.`product_id` = `products`.`id`";
    }   */   


    if($filters.mixed_bouquet_types != undefined && $filters.mixed_bouquet_types != ''){

       $sql += " INNER JOIN `mixed_bouquet_product` ON `mixed_bouquet_product`.`product_id` = `products`.`id`";
    }  

//console.log($sql);
    $sql += " WHERE `vendor`.`status` = 1";
    $sql += " AND `language_product`.`language_id` = "+$filters.language_id;
    $sql += " AND `location_product`.`country_id` = "+$filters.delivery_country_id;

    //console.log($sql);
    if($filters.province_id != undefined && $filters.province_id != '' ){
       $sql += " AND location_product.province_id = '"+$filters.province_id+"'";
    }      

    if($filters.filter_keyword != undefined && $filters.filter_keyword != ''){

        //var filter_keyword = $filters.filter_keyword;
        $filters.filter_keyword = $filters.filter_keyword.trim();        

        $sql += " AND `language_product`.`product_name` LIKE '%"+$filters.filter_keyword+"%'";
    }

    if($filters.delivery_methods != undefined && $filters.delivery_methods != ''){

        $sql += " AND `methods`.`delivery_within` IN ("+$filters.delivery_methods+")";
    }

    if($filters.occasions != undefined && $filters.occasions != ''){

        $sql += " AND `occasion_product`.`occasion_id` IN ("+$filters.occasions+")";
    } 


    if($filters.sympathy != undefined && $filters.sympathy != ''){

        $sql += " AND `sympathy_type_product`.`sympathy_type_id` IN ("+$filters.sympathy+")";
    }                

    if($filters.colors != undefined && $filters.colors != ''){

        $sql += " AND `color_product`.`color_id` IN ("+$filters.colors+")";
    }  

    if($filters.flower_types != undefined && $filters.flower_types != ''){

        $sql += " AND `flower_type_product`.`flower_type_id` IN ("+$filters.flower_types+")";
    }
    
    if($filters.mixed_bouquet_types != undefined && $filters.mixed_bouquet_types != ''){

        $sql += " AND `mixed_bouquet_product`.`mixed_bouquet_id` IN ("+$filters.mixed_bouquet_types+")";
    }    

    if($filters.price != undefined && $filters.price != ''){

        var price = $filters.price;

        var $priceArr = price.split('-');
        if($priceArr[0] == '150'){
          $sql += " AND `product_prices`.`price_value` >= "+$priceArr[0];
        }else{
           var newprice = parseInt($priceArr[1] + 0.01);
           $sql += " AND `product_prices`.`price_value` >= "+$priceArr[0]+" AND `product_prices`.`price_value` < "+newprice;
        }

    }


    $sql += " AND `products`.`product_status` = 1";
    $sql += " AND `products`.`admin_confirm` = 1";
    $sql += " AND `products`.`frontend_show` = 1";
    $sql += " GROUP BY `products`.`id`,`language_product`.`product_name`";
    
    if($find_total == false){
      
      if($filters.order_by != undefined && $filters.order_by != ''){

          if ($filters.order_by == 'name-asc') {
              $sql += " ORDER BY `language_product`.`product_name` ASC";
          } else if($filters.order_by == 'name-desc') {
              $sql += " ORDER BY `language_product`.`product_name` DESC";
          } else if($filters.order_by == 'price-asc') {
              $sql += " ORDER BY `product_prices`.`price_value` ASC";
          } else if($filters.order_by == 'price-desc') {
              $sql += " ORDER BY `product_prices`.`price_value` DESC";
          } else {
             $sql += " ORDER BY `products`.`frontend_serial_number` ASC";
          }
      }

      $sql += " LIMIT "+$filters.start+","+$filters.limit;
    }

    //console.log($sql);
    dbModel.rawQuery($sql, function(err, $productList) {
      if (err) return callback(err);
      else {
        callback(null, $productList)
      }

    });

}

function getproductprices($product_id = null, $country_id = null, $currency_id = null, $sale = null, callback)
{
    var data = {};
    // Select product price on basis of product id
    var sql = "SELECT pp.* FROM products p JOIN product_prices pp ON(p.id = pp.product_id) WHERE p.product_status = 1 AND p.id = "+$product_id+" ORDER BY pp.price_value ASC";

    //console.log(sql);

    dbModel.rawQuery(sql, function(err, product_result) {
       if (err) return callback(err);
       if (product_result.length > 0){

         // Get price details from currency tables by country
         var sql = "SELECT c.* FROM country_list cl LEFT JOIN currency c ON(cl.preferred_currency_id = c.id) WHERE cl.id = "+$country_id+" AND c.status = 1";

         //console.log(sql);

          dbModel.rawQuery(sql, function(err, currency_result) {
            if (err) return callback(err);
            else if (currency_result.length > 0){

               data.product_result = product_result;
               data.currency_result = currency_result;

              //console.log(data);

               callback(null, data);
                              
            }else{

              // If Preferred Currency Id not found for selected country then Use selected Currency Rate
              var $sql = "SELECT * from `currency` WHERE id = "+$currency_id;

              dbModel.rawQuery($sql, function(err, currency_result) {
                if (err) return callback(err);
                else if (currency_result.length > 0){

                     data.product_result = product_result;
                     data.currency_result = currency_result;

                     callback(null, data);
                                    
                }else{

                   data.product_result = product_result;
                   data.currency_result = [];

                   callback(null, data);

                }
              });
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
        $parse = $actPrice.split(".");

        if($current_currency === "INR"){
            $price = $parse[0];
            $priceLength = $price.length;
                    
            switch ($priceLength) {
                case 1: 
                    $newPrice = $price.substring(0, 1) + '9';
                    
                    break;
                case 2: 
                    $newPrice = $price.substring(0, 2) + '99';
                    
                    break;                    
                case 3: 
                    $newPrice = $price.substring(0, 1) + '99'; // Below 999
                    
                    break;
                case 4: 
                    $newPrice = $price.substring(0, 2) + '99'; // For 1000 or < 9999
                    
                    break;                    

                case 5: 
                      $newPrice = $price.substring(0, 3) + '99'; // For 1,000/10000 or < 9,999
                    
                    break;
                case 6: 
                    $newPrice = $price.substring(0, 4) + '99'; // For 10,000/100000
                    
                    break;
                case 7: 
                    $newPrice = $price.substring(0, 5) + '99'; // For 1000000
                    break;

                case 8: 
                    $newPrice = $price.substring(0, 6) + '99'; // For 1,00,000/10000000
                    break;
            }
        }else{ 
            $newPrice = $parse[0]+".99";
        }
    }
    return $newPrice;
}

function getVariantDetails($product_id,callback){
    $sql = "Select `product_prices`.`price_name`,`product_prices`.`price_value`,`product_prices`.`compare_price`,  CONCAT('"+config.RESOURCE_URL+"', REPLACE(`product_prices`.`image`, '+','%2B')) AS variant_picture,sku from `product_prices` ";
    $sql += "INNER JOIN `products` ON `product_prices`.`product_id` = `products`.`id` ";
    $sql += "WHERE  `products`.`id`="+$product_id;
    //console.log("Variant Query: "+$sql);
    dbModel.rawQuery($sql, function(err, $product_variant) {
        if (err) return callback(err);
        else callback(null,$product_variant);
    });
}


module.exports = new CollectionController();
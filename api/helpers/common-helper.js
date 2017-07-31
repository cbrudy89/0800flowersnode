var request = require('request');
var config = require('./../../config');
var dbModel = require('./../models/db-model');

function CommonHelper(){
	
	this.generatePassword = function(length = 10) {
		var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	    var result = '';
	    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
	    return result;
	}


	// get country code
	this.countrycode=function (countryid,callback) {
	    dbModel.rawQuery('SELECT iso_code FROM country_list WHERE id = '+countryid, function(err, result) {  
	    	//console.log(result);
	        if (err) return callback(err,null);
	        else
	            callback(null,result);
	    });

	}

	this.getPromoBanner = function(language_id, type, callback ){

	    var sql = "SELECT description FROM `snipes` inner join `snipe_language` on `snipes`.`id` = `snipe_language`.`snipe_id` WHERE (`snipes`.`type` = '"+type+"' and `snipes`.`status` = 1 and `snipe_language`.`language_id` = "+language_id+") order by RAND() limit 1";
	    //console.log(sql);
	    dbModel.rawQuery(sql, function(err, result) {
	        if (err) return callback(err);
	        else{
	        	callback(null, result);
	        }
	    });

	}

	this.executeCommonCurl = function($curlUrl, $curlData, callback){

        // Set the headers
        var headers = {
            'Content-Type':'application/json',
            'X-IBM-Client-Id':config.atlas_order.client_id,
            'X-IBM-Client-Secret':config.atlas_order.client_secret
        }

        // Configure the request
        var options = {
            url: $curlUrl,
            method: 'POST',
            headers: headers,
            form: $curlData
        }
        
        //console.log(options);
        // Start the request
        request(options, function (err, response, body) {
        	if(err){
             	//console.log("ERROR: " + error + "\n\n");
        		callback(err);	
        	} 
        	else{
              //console.log("STATUS CODE: " + response.statusCode + "\n\n");
              //console.log("RESPONSE BODY: " + response.body + "\n\n");        	

              //console.log("RESPONSE BODY: " + body + "\n\n");
        		callback(null, response);
        	}
        });

	}

	this.getCurrencyDetails = function($currency_id = null, $country_id, callback){

	  // Get price details from currency tables by country
	  var sql = "SELECT c.* FROM country_list cl LEFT JOIN currency c ON(cl.preferred_currency_id = c.id) WHERE cl.id = "+$country_id+" AND c.status = 1";

	  //console.log(sql);

	  dbModel.rawQuery(sql, function(err, currency_result) {
	    if (err) return callback(err);
	    else if (currency_result.length > 0){
	       callback(null, currency_result);
	                      
	    }else{

	      // If Preferred Currency Id not found for selected country then Use selected Currency Rate
	      var $sql = "SELECT * from `currency` WHERE id = "+$currency_id;

	      dbModel.rawQuery($sql, function(err, currency_result) {
	        if (err) return callback(err);
	        else 
	            callback(null, currency_result);

	      });
	    }
	  });

	}

	this.number_format = function(number, decimals, decPoint, thousandsSep, callback) { // eslint-disable-line camelcase
		  number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
		  var n = !isFinite(+number) ? 0 : +number;
		  var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals);
		  var sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep;
		  var dec = (typeof decPoint === 'undefined') ? '.' : decPoint;
		  var s = '';
		  var toFixedFix = function (n, prec) {
		    var k = Math.pow(10, prec);
		    return '' + (Math.round(n * k) / k).toFixed(prec);
		  }
		  // @todo: for IE parseFloat(0.55).toFixed(0) = 0;
		  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.')
		  if (s[0].length > 3) {
		    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
		  }
		  if ((s[1] || '').length < prec) {
		    s[1] = s[1] || '';
		    s[1] += new Array(prec - s[1].length + 1).join('0');
		  }
		  //console.log(s.join(dec));
		  callback(null, s.join(dec));
	}

	this.roundToNineNine = function($actPrice, $current_currency, callback){ 
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
	    callback(null, $newPrice);
	}

	/*this.checkCalSurcharge = function($date, $vendor_id, $country_id, $product_id){

	    var sql = "SELECT description FROM `snipes` inner join `snipe_language` on `snipes`.`id` = `snipe_language`.`snipe_id` WHERE (`snipes`.`type` = '"+type+"' and `snipes`.`status` = 1 and `snipe_language`.`language_id` = "+language_id+") order by RAND() limit 1";
	    //console.log(sql);
	    dbModel.rawQuery(sql, function(err, result) {
	        if (err) return callback(err);
	        else{
	        	callback(null, result);
	        }
	    });

	}*/


	/*this.getproductlanguage =function ($product_id = NULL, $language = NULL, $field = 'product_name')
	{
	    if(empty($language)) $language=1;
	    $sql="Select `product_name`, `product_description`, `product_content`, `language_id` from `products` 
	    inner join `language_product` on `products`.`id` = `language_product`.`product_id` 
	    where (`product_status` = 1 and `language_product`.`language_id` = "+$language+" and `language_product`.`product_id` = "+$product_id+") limit 1";
	    connection.acquire(function(err, con) {
		      if (err) {
		        res.send({status: 1, message: err});
		      }      
		      con.query($sql, function(err, result) {
		        if (err) {
		          res.status(config.HTTP_BAD_REQUEST).send({
		            status:config.ERROR,
		            code: config.HTTP_BAD_REQUEST,             
		            message:"No record found"
		           });
		        } else {
		          if(result.length > 0){
		            res.status(config.HTTP_SUCCESS).send({
		              status: config.SUCCESS,
		              code: config.HTTP_SUCCESS,
		              message:"record found",
		              result:result
		            });
		          }else{
		            res.status(config.HTTP_BAD_REQUEST).send({
		              status:config.ERROR,
		              code: config.HTTP_BAD_REQUEST, 
		              message:"Failed to get record"
		            }); 
		          }
		        }        
		        con.release();
	      });
	    });
	    $productname =result;
	    return $productname->$field;
	    
	}
	// fetch related product for a product
	this.getRelatedproducts = function ($product_id = NULL, $language = NULL) {
		$sql="select `product_name`, `slug`, `product_picture` from `products` 
		inner join `language_product` on `products`.`id` = `language_product`.`product_id` 
		where (`product_status` = 1 and `language_product`.`language_id1` = "+$language+" and `language_product`.`product_id` = "+$product_id+") limit 1";
        connection.acquire(function(err, con) {
		      if (err) {
		        res.send({status: 1, message: err});
		      }      
		      con.query($sql, function(err, result) {
		        if (err) {
		          res.status(config.HTTP_BAD_REQUEST).send({
		            status:config.ERROR,
		            code: config.HTTP_BAD_REQUEST,             
		            message:"No record found"
		           });
		        } else {
		          if(result.length > 0){
		            res.status(config.HTTP_SUCCESS).send({
		              status: config.SUCCESS,
		              code: config.HTTP_SUCCESS,
		              message:"record found",
		              result:result
		            });
		          }else{
		            res.status(config.HTTP_BAD_REQUEST).send({
		              status:config.ERROR,
		              code: config.HTTP_BAD_REQUEST, 
		              message:"Failed to get record"
		            }); 
		          }
		        }        
		        con.release();
	      });
	    });
    	return result;
    }*/
}

module.exports = new CommonHelper();

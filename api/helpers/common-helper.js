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

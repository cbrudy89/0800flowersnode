var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var async = require('async');
var config = require('./../../config');
var connection = require('./../../database');
var dbModel = require('./../models/db-model');
var commonHelper = require('./../helpers/common-helper');
var request = require('request');
var base64 = require('base-64');
var Sync = require('sync');

function ProductController() {

  this.productdetails  = function(req, res) {
  		var return_data = {};
  		var $slug = req.body.slug;
        var $sessLang = req.body.language_id;
        var $currentCountry = req.body.country_id;
        var $province_id = req.body.province_id;
        var $postalcode=req.body.postalcode;

  		async.parallel([
	          function topbanner(callback){
	             commonHelper.getPromoBanner($sessLang, 'product_detail', function(err, result) {
	                 if (err) return callback(err);
	                 else {
	                    if(result.length > 0 && result[0].description != ''){
	                      return_data.topbanner = result[0].description;
	                      callback();                      
	                    }
	                 }
	              });
	          },
	          function productdata(callback){	            

			        $sql  ="Select `product_name`, `product_description`, `product_content`, products.*, sku from `products` "; 
			        $sql +="INNER JOIN `language_product` on `products`.`id` = `language_product`.`product_id` ";
			        $sql +="INNER JOIN `product_prices` ON `product_prices`.`product_id` = `language_product`.`product_id` ";
			        $sql +="where (`product_status` = 1 and `language_product`.`language_id` = "+$sessLang+" and `products`.`slug` = '"+$slug+"') limit 1";
			        //console.log($sql);
			        $product=[];
				        dbModel.rawQuery($sql, function(err, $product) {
				           if (err) return callback(err);
				           else{
				             if($product.length > 0) {
					                /////////////////////Product data/////////////////////////////////
					                $title =  $product[0].product_name +'-' + config.SITE_TITLE;
					                $resAtlasDDOrg  = null;
					                $AtlasDate      = [];                        
					                    
					                $postalcode = !($postalcode) ? $postalcode : config.DEFAULT_ZIPCODE;
					               // $resAtlasDDOrg={};
					               // $resAtlasDDOrg=getCustomDeliveryDate($product[0].product_code, $product[0].sku, $postalcode, $currentCountry);

					               // console.log('resAtlasDDOrg-'+$resAtlasDDOrg);
					               /* if($resAtlasDDOrg && $resAtlasDDOrg != 'undefined'){
					                    $resAtlasDD = JSON.parse($resAtlasDDOrg);                    
					                    if( $resAtlasDD.length && $resAtlasDD.deliveryCalendar && $resAtlasDD.deliveryCalendar && $resAtlasDD.deliveryCalendar.dateArray && $resAtlasDD.deliveryCalendar.dateArray) {
					                        $AtlasDate  = $resAtlasDD.deliveryCalendar.dateArray;
					                    }
					                }*/
				           		   // console.log($title);

				              

					                //Check Current Product Is Related To The Selected Country/Province Or Not
					                //------------------------------------------------------------------------
					               /* if ($province_id == '' || $province_id == 0) {
					                select * from `location_product` where `product_id1` = 24 and `country_id` = 10
					                    $chkCountryProvince = ProductLocation::where('product_id', '=', $product[0].id)
					                            ->where('country_id', '=', $currentCountry)
					                            ->get();
					                } else {
					                    $chkCountryProvince = ProductLocation::where('product_id', '=', $product->id)
					                            ->where('country_id', '=', $requests->session()->get('delivery_to.country_id'))
					                            ->where('province_id', '=', $requests->session()->get('delivery_to.province_id'))
					                            ->get();
					                }

					                if (count($chkCountryProvince) > 0) {
					                    
					                } else {
					                    abort(404);
					                }*/
					                $vendorId = $product[0].vendor_id;
					                //Check Vendor Has Made The Delivey Methods Or Not
					                var $productMethod = {};
					                Sync(function(){
					                	var $delivery_method_id = $product[0].delivery_method_id;
					                	$sql ="Select * from `method_vendor` where `method_id` = "+$delivery_method_id+" and ";
					                	$sql +="`vendor_id` = "+$vendorId+" limit 1";

					                	$productMethod = productMethod.sync(null, $sql, $delivery_method_id);

					                	if ($province_id != '' && $province_id != 0) {
                                           // $stoppage_time = stoppageTimePart($province_id);
                                          //  $currentTime = getCurrentDateTime($province_id);
                                        } else {
                                        	console.log($productMethod);
                                            $stoppage_time = stoppageTimePartForCountry($currentCountry);
                                           // $currentTime = getCurrentDateTimeForCountry($currentCountry);
                                            
                                        }     

                                       /**********/
								        /*$param = array(
								            'date' => '',
								            'delivery_days' => $productMethod->delivery_days,
								            'delivery_within' => $productMethod->delivery_within,
								            'vendor_id' => $product->vendor_id,
								            'country_id' => Session::get('delivery_to')['country_id'],
								            'product_id' => $product->id,
								            'stoppage_time' => $stoppage_time 
								        );
								        //echo '<pre>';print_r($param);print_r($dateArray);die;
								        $firstEnableDate = getThreeEnableDates($param, $dateArray);
								        echo $firstEnableDate; 
								        //$nextEnableDate = getNextEnableDate('', json_decode($productMethod->delivery_days), $productMethod->delivery_within, $product->vendor_id, Session::get('delivery_to')['country_id'], $product->id, $stoppage_time);
								        $chkDate = strtoupper(date("j-M-y", strtotime($firstEnableDate)));
								        if(in_array($chkDate, $dateArray)){
								            echo 'found<br/>';
								        }else{
								            echo 'notfound<br/>';
								        }
								        //$nextEnableDate = getNextEnableDate($nextEnableDate, json_decode($productMethod->delivery_days), $productMethod->delivery_within, $product->vendor_id, Session::get('delivery_to')['country_id'], $product->id, $stoppage_time);
								        //echo '<br/>2. '.$nextEnableDate.'<br/>';
								        die;*/
								        /**********/  
								        $week_days = config.week_days;
						                
			                 		});

				         }
			           }
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

function productMethod($sql, $delivery_method_id, callback){

	dbModel.rawQuery($sql, function(err, $productMethod) {
        if (err) return callback(err);
			else{
            if($productMethod.length == 0){
                $sql="Select * from `method_vendor` where `method_id` = "+$delivery_method_id+" limit 1";
                dbModel.rawQuery($sql, function(err, $productMethod) {
                    if (err) return callback(err);
					else{
						callback(null, $productMethod);                  
                    }
            	});
            }else{
            	callback(null, $productMethod);
            }
        }
    });

}

function stoppageTimePart($province_id, $vendor_id = NULL, callback)
{
    var d = new Date();
    var $current_hour = d.getHours();
    var $current_minute = d.getMinutes();

    if ($vendor_id !=NULL && $vendor_id != '') {
        $sql='select * from `provinces` inner join `group_vendor` on `group_vendor`.`timezone_id` = `provinces`.`timezone_id` inner join `timezones` on `timezones`.`id` = `provinces`.`timezone_id` where (`provinces`.`id` = '+$province_id+' and `provinces`.`status` = 1 and `group_vendor`.`vendor_id` = '+$vendor_id+') group by `provinces`.`timezone_id`';        
    } else {
        $sql='select `group_vendor`.`stoppage_hour`, `group_vendor`.`stoppage_minute` from `provinces` inner join `group_vendor` on `group_vendor`.`timezone_id` = `provinces`.`timezone_id` inner join `timezones` on `timezones`.`id` = `provinces`.`timezone_id` inner join `vendor` on `vendor`.`id` = `group_vendor`.`vendor_id` where (`provinces`.`id` = '+$province_id+' and `provinces`.`status` = 1) and `group_vendor`.`stoppage_hour` >= '+$current_hour+' and `vendor`.`status` = 1 and (`group_vendor`.`stoppage_hour` > '+$current_hour+' or `group_vendor`.`stoppage_minute` >= '+$current_minute+') order by `group_vendor`.`stoppage_hour` asc, `group_vendor`.`stoppage_minute` asc';
    }
    $province_group_vendor={};
    dbModel.rawQuery($sql, function(err, $province_group_vendor) {
        if (err) return callback(err);
    });
    console.log($province_group_vendor);

    $sql='select * from `provinces` inner join `timezones` on `timezones`.`id` = `provinces`.`timezone_id` where (`provinces`.`id` = '+$province_id+' and `status` = 1)';
    $province ='' /////////
    
    if ($province_group_vendor.length && $province_group_vendor[0].length) {
        if ($vendor_id!=NULL && $vendor_id != '') {
            $stoppage_hour = $province_group_vendor[0].stoppage_hour;
            $stoppage_minute = $province_group_vendor[0].stoppage_minute;
        } else {
            if ($province_group_vendor[0].stoppage_hour <= $province[0].stoppage_hour && ($province_group_vendor[0].stoppage_hour < $province[0].stoppage_hour || $province_group_vendor[0].stoppage_minute <= $province[0].stoppage_minute)) {
                $stoppage_hour = $province_group_vendor[0].stoppage_hour;
                $stoppage_minute = $province_group_vendor[0].stoppage_minute;
            } else if($province[0].stoppage_hour >= $current_hour && ($province[0].stoppage_hour > $current_hour || $province[0].stoppage_minute >= $current_minute) ){
                $stoppage_hour = $province[0].stoppage_hour;
                $stoppage_minute = $province[0].stoppage_minute;
            }else {
                $stoppage_hour = $province_group_vendor[0].stoppage_hour;
                $stoppage_minute = $province_group_vendor[0].stoppage_minute;
            }
        }

    } else {
        if( ($vendor_id!=NULL && $vendor_id != '') || $province[0].stoppage_hour >= $current_hour && ($province[0].stoppage_hour > $current_hour || $province[0].stoppage_minute >= $current_minute) ){
            $stoppage_hour = $province[0].stoppage_hour;
            $stoppage_minute = $province[0].stoppage_minute;
        }else{
            $sql='select `group_vendor`.`stoppage_hour`, `group_vendor`.`stoppage_minute`, `method_vendor`.`delivery_within` from `provinces` inner join `group_vendor` on `group_vendor`.`timezone_id` = `provinces`.`timezone_id` inner join `timezones` on `timezones`.`id` = `provinces`.`timezone_id` inner join `method_vendor` on `method_vendor`.`vendor_id` = `group_vendor`.`vendor_id` inner join `vendor` on `vendor`.`id` = `group_vendor`.`vendor_id` where (`provinces`.`id` = '+$province_id+' and `provinces`.`status` = 1) and `vendor`.`status` = 1 order by `method_vendor`.`delivery_within` asc, `group_vendor`.`stoppage_hour` asc, `group_vendor`.`stoppage_minute` asc limit 1';
            ///$method_vendor =

            if(sizeof($method_vendor)){
                $stoppage_hour      = $method_vendor['stoppage_hour'];
                $stoppage_minute    = $method_vendor['stoppage_minute'];
                $time               = $stoppage_hour + ':' + $stoppage_minute + ':00';

                if($method_vendor['delivery_within'] == 0){
                    $method_vendor['delivery_within']   = 1;
                }

                $cutoff_time = Date.parse( date('Y-m-d H:i:s', Date.parse('+'+$method_vendor['delivery_within']+' day',Date.parse($time) / 1000 ) / 1000 ) ) / 1000;

                return $cutoff_time;
                exit;

            }else{
                $sql='select `timezones`.`stoppage_hour`, `timezones`.`stoppage_minute`, `methods`.`delivery_within` from `provinces` inner join `timezones` on `timezones`.`id` = `provinces`.`timezone_id` inner join `location_product` on `location_product`.`province_id` = `provinces`.`id` inner join `products` on `products`.`id` = `location_product`.`product_id` inner join `methods` on `methods`.`id` = `products`.`delivery_method_id` inner join `vendor` on `vendor`.`id` = `products`.`vendor_id` where (`provinces`.`id` = '+$province_id+' and `provinces`.`status` = 1) and `vendor`.`status` = 1 order by `methods`.`delivery_within` asc, `timezones`.`stoppage_hour` asc, `timezones`.`stoppage_minute` asc limit 1';
                //$method_country =
                

                if(sizeof($method_country)){
                    $stoppage_hour      = $method_country['stoppage_hour'];
                    $stoppage_minute    = $method_country['stoppage_minute'];
                    $time               = $stoppage_hour + ':' + $stoppage_minute + ':00';

                    if($method_country['delivery_within'] == 0){
                        $method_country['delivery_within']  = 1;
                    }

                    $cutoff_time        = Date.parse( date('Y-m-d H:i:s', Date.parse('+'+$method_country['delivery_within']+' day',Date.parse($time) / 1000) / 1000 ) ) / 1000;

                    return $cutoff_time;
                    exit;

                }else{
                    $stoppage_hour      = $province[0].stoppage_hour;
                    $stoppage_minute    = $province[0].stoppage_minute;

                    $time               = $stoppage_hour + ':' + $stoppage_minute + ':00';
                    $cutoff_time        = Date.parse( date('Y-m-d H:i:s', Date.parse('+1 day',Date.parse($time) / 1000) / 1000 ) ) / 1000;

                    return $cutoff_time;
                    exit;
                }


                /*$current_time     = strtotime(date('Y-m-d H:i:s'));

                $seconds    = $cutoff_time - $current_time;
                $hours      = floor($seconds / 3600);
                $mins       = floor(($seconds - ($hours*3600)) / 60);

                $stoppage_hour      = $hours;
                $stoppage_minute    = $mins;*/
            }
        }
        /*$stoppage_hour = $province[0]->stoppage_hour;
        $stoppage_minute = $province[0]->stoppage_minute;*/
    }


    $stoppageTime = '';
    if ($stoppage_hour < 10) {
        $stoppage_hour = '0' + $stoppage_hour;
    }
    if ($stoppage_minute < 10) {
        $stoppage_minute = '0' + $stoppage_minute;
    }
    $stoppageTime = $stoppage_hour + ':' + $stoppage_minute + ':59';

    return Date.parse($stoppageTime) / 1000;
}
function getCustomDeliveryDate($product_code, $productSku, $zipCode, $currentCountry) {
        if (!$productSku && !$zipCode) return false;
        var $params ={};  
        var $productSku=$zipCode=''; 
        var $deliveryCalendar = 'NotFoundProductSku';
        var $result = false;    
        commonHelper.countrycode($currentCountry, function(err, res){
            if(err) console.log(err);
            else { 
                    $params = {
                        country : res[0].iso_code,
                        productSku : $productSku,
                        zipCode : $zipCode
                    };
                    //return getDeliveryCalendar($params);

                    
                    $responseDlvrCal = getDeliveryCalendar($params);
                    // if ($responseDlvrCal.getDlvrCalResponse.responseStatus == 'SUCCESS') {
                     if ($responseDlvrCal != 'undefined') {
                     /*  $getDates = $responseDlvrCal.getDlvrCalResponse.getDlvrCalResult.dlvrCalDeliveryDates.dlvrCalDeliveryDate;
                        if ($getDates.length > 0) {
                             for ( var i=0 ; i < $getDates.length; i++) {
                             	//for($getDates as $key => $item) {
                                $mobArray = array('option' => date('d-m-Y', strtotime($item->deliveryDate)), 'text' => date('D, M d', strtotime($item->deliveryDate)));
                                if ($item->totSurcharge == '0.0') {
                                    $totSurcharge = $item->totSurcharge;
                                } else {
                                    $totSurcharge = number_format(currency(urlencode('USD'), urlencode('CAD'), $item->totSurcharge), 2);
                                }

                                $infoArray[$item->deliveryDate] = array('deliveryDate' => $item->deliveryDate, 'mobInfo' => $mobArray, 'totSurcharge' => $totSurcharge);
                                $dateArray[] = $item->deliveryDate;
                                $surchargeArray[] = $totSurcharge;
                            }
                            $deliveryCalendar = array('dateArray' => $dateArray, 'surchargeArray' => $surchargeArray, 'infoArray' => $infoArray, 'currencyPrefix' => Session::get('current_currencysymbol'), 'currencySuffix' => '');
                            $result = true;
                        } else {
                            $deliveryCalendar = 'ZeroDeliveryDate';
                            $result = false;
                        }
                    } else {
                         /*if(isset($responseDlvrCal) && isset($responseDlvrCal->getDlvrCalResponse) && isset($responseDlvrCal->getDlvrCalResponse->getDlvrCalResult) && isset($responseDlvrCal->getDlvrCalResponse->getDlvrCalResult->flwsErrors) && isset($responseDlvrCal->getDlvrCalResponse->getDlvrCalResult->flwsErrors->flwsError) && isset($responseDlvrCal->getDlvrCalResponse->getDlvrCalResult->flwsErrors->flwsError->errorMessage) && $responseDlvrCal->getDlvrCalResponse->getDlvrCalResult->flwsErrors->flwsError->errorMessage != ''){
                          $deliveryCalendar = $responseDlvrCal->getDlvrCalResponse->getDlvrCalResult->flwsErrors->flwsError->errorMessage;
                          } 
                        $deliveryCalendar = 'SkuNotAvailable';
                        $result = false;
                    }*/
                }
                else if ($productSku !='' && $zipCode !='') {
                    $deliveryCalendar = 'NotFoundProductSku';
                    $result = false;
                } else {
                    $deliveryCalendar = 'NotFoundSkuAndZipcode';
                    $result = false;
                }

                
                return {'result' : $result, 'deliveryCalendar' : $deliveryCalendar};
            }
        });
        
        
}


function getDeliveryCalendar($params){
    $curlData = {
        "getDlvrCalRequest" : {
            "partnerId" : "123",
            "customerId" : config.atlas_order.customer_id,
            "customerType": config.atlas_order.customer_type,
            "country" : $params.country,
            "deliveryDate" : "",
            "locationType": "1",
            "productSku" : $params.productSku,
            "backupSku" : "",
            "backupSkuBrandCode" : "",
            "siteId" : config.atlas_order.site_id,
            "startDate" : "",
            "sourceSystem" : config.atlas_order.source_system,
            "zipCode" : $params.zipCode,
            "brandCode" : config.atlas_order.brand_code
        }
    };
   // console.log($curlData);
    //$curlData = JSON.stringify($curlData);         
    $getResult = _executeCommonCurl(config.atlas_order.get_delivery_calendar_url, $curlData, 'getDeliveryCalendar');  

    return $getResult;
}
 function _executeCommonCurl($curlUrl, $curlData, $hitFile){
 		//$Authorization = 'Bearer ' + base64.encode(config.atlas_order.client_id + ':' + config.atlas_order.client_secret);
        // Set the headers
        var headers = {
           // 'Authorization': $Authorization,
           // 'SOAPAction': $hitFile,
            'Content-Type':'application/x-www-form-urlencoded',
            'X-IBM-Client-Id':config.atlas_order.client_id,
            'X-IBM-Client-Secret':config.atlas_order.client_secret
            //'Accept-Language:en-US'
        }

        // Configure the request
        var options = {
            url: $curlUrl,
            method: 'POST',
            headers: headers,
            form: $curlData
        }
        // Start the request
        request(options, function (error, response, body) {
              //console.log("ERROR: " + error + "\n\n");
             // console.log("STATUS CODE: " + response.statusCode + "\n\n");
             // console.log("RESPONSE BODY: " + body + "\n\n");
             // var st= body.getDlvrCalRequest;
              //console.log("RESPONSE BODY: " + body + "\n\n");
            //  console.log('getDlvrCalResponse---'+response.getDlvrCalResponse);
            if (response.statusCode == 200) {

            	//console.log(response.getDlvrCalResponse);
                // Print out the response body
                //console.log(body+'---'+response);
                return body;
            }
        });

}

function stoppageTimePartForCountry($country_id, $vendor_id = null)
{
    var d = new Date();
    var $current_hour = d.getHours();
    var $current_minute = d.getMinutes();
    
    if ($vendor_id !=null && $vendor_id != '') {
        $sql='Select * from `group_vendor` where (`country_id` = '+$country_id+' and `vendor_id` = '+$vendor_id+')';
    } else {
        $sql  ='Select * from `group_vendor` ';
        $sql +='inner join `vendor` on `vendor`.`id` = `group_vendor`.`vendor_id` ';
        $sql +='where `country_id` = '+$country_id+' and `vendor`.`status` = 1 and ';
        $sql +='`stoppage_hour` >= '+$current_hour+' and (`group_vendor`.`stoppage_hour` > '+$current_hour+' or ';
        $sql +='`group_vendor`.`stoppage_minute` >= '+$current_minute+') order by `stoppage_hour` asc, `stoppage_minute` asc';         
    }
    console.log($sql);
    dbModel.rawQuery($sql, function(err, $country_group_vendor) {
           if (err) {
              res.status(config.HTTP_BAD_REQUEST).send({
                status:config.ERROR,
                code: config.HTTP_BAD_REQUEST,             
                message:"Unable to process request"
              });
           }else{
           		console.log($country_group_vendor);
           		$sql  ='Select * from `provinces` inner join `timezones` on `timezones`.`id` = `provinces`.`timezone_id` ';
           		$sql +='where `country_id` = '+$country_id;
                dbModel.rawQuery($sql, function(err, $country) {
			          if (err) {
			              res.status(config.HTTP_SERVER_ERROR).send({
			                  status: config.ERROR, 
			                  code : config.HTTP_SERVER_ERROR,          
			                  message: "Unable to process request, Please try again!",
			                  err: err
			              }); 
			          }else{
			          	console.log($country);
			            if($country.length > 0){						                
			                if($country_group_vendor.length > 0){
								if ($vendor_id !=NULL && $vendor_id != '') {
			                        $stoppage_hour = $country_group_vendor[0].stoppage_hour;
			                        $stoppage_minute = $country_group_vendor[0].stoppage_minute;
			                    } else {
			                    	if ($country_group_vendor[0].stoppage_hour <= $country[0].stoppage_hour && ($country_group_vendor[0].stoppage_hour < $country[0].stoppage_hour || $country_group_vendor[0].stoppage_minute <= $country[0].stoppage_minute)) {
			                            $stoppage_hour = $country_group_vendor[0].stoppage_hour;
			                            $stoppage_minute = $country_group_vendor[0].stoppage_minute;
			                        }else if($country[0].stoppage_hour >= $current_hour && ($country[0].stoppage_hour > $current_hour || $country[0].stoppage_minute >= $current_minute) ){
			                            $stoppage_hour = $country[0].stoppage_hour;
			                            $stoppage_minute = $country[0].stoppage_minute;
			                        }else {
			                            $stoppage_hour = $country_group_vendor[0].stoppage_hour;
			                            $stoppage_minute = $country_group_vendor[0].stoppage_minute;
			                        }  

			                    }
			                } else {
			                    
			                    if( ($vendor_id !=null && $vendor_id != '') || $country[0].stoppage_hour >= $current_hour && ($country[0].stoppage_hour > $current_hour || $country[0].stoppage_minute >= $current_minute) ){
			                        $stoppage_hour = $country[0].stoppage_hour;
			                        $stoppage_minute = $country[0].stoppage_minute;
			                    }else {
			                        $sql ='Select `group_vendor`.`stoppage_hour`, `group_vendor`.`stoppage_minute`, `method_vendor`.`delivery_within` from `group_vendor` ';
			                        $sql +='inner join `method_vendor` on `method_vendor`.`vendor_id` = `group_vendor`.`vendor_id` ';
			                        $sql +='inner join `vendor` on `vendor`.`id` = `group_vendor`.`vendor_id` where `country_id` = '+$country_id+' and ';
			                        $sql +='`vendor`.`status` = 1 order by `method_vendor`.`delivery_within` asc, `stoppage_hour` asc, `stoppage_minute1` asc limit 1';
			                        $method_vendor = '';
			                        if($method_vendor.length){
			                            $stoppage_hour      = $method_vendor['stoppage_hour'];
			                            $stoppage_minute    = $method_vendor['stoppage_minute'];
			                            $time               = $stoppage_hour + ':' + $stoppage_minute + ':00';
			                            
			                            if($method_vendor['delivery_within'] == 0){
			                                $method_vendor['delivery_within']   = 1;
			                            }
			                            $cutoff_time = Date.parse( date('Y-m-d H:i:s', Date.parse('+'+$method_vendor['delivery_within']+' day',Date.parse($time) / 1000) / 1000 ) ) / 1000;
			                    
			                            return $cutoff_time;
			                            exit;
			                    
			                        }else{
			                            $sql  ='Select `timezones`.`stoppage_hour`,`timezones`.`stoppage_minute`, `methods`.`delivery_within` from `provinces` ';
			                            $sql +='inner join `timezones` on `timezones`.`id` = `provinces`.`timezone_id` ';
			                            $sql +='inner join `location_product` on `location_product`.`province_id` = `provinces`.`id` ';
			                            $sql +='inner join `products` on `products`.`id` = `location_product`.`product_id` ';
			                            $sql +='inner join `methods` on `methods`.`id` = `products`.`delivery_method_id` ';
			                            $sql +='inner join `vendor` on `vendor`.`id` = `products`.`vendor_id` ';
			                            $sql +='where `provinces`.`country_id` = '+$country_id+' and `vendor`.`status` = 1 ';
			                            $sql +='order by `methods`.`delivery_within` asc, `timezones`.`stoppage_hour` asc, `timezones`.`stoppage_minute1` asc limit 1';
			                            
			                            $method_country = '';
			                            
			                            if($method_country.length){
			                                $stoppage_hour      = $method_country['stoppage_hour'];
			                                $stoppage_minute    = $method_country['stoppage_minute'];
			                                $time               = $stoppage_hour + ':' + $stoppage_minute + ':00';
			                            
			                                if($method_country['delivery_within'] == 0){
			                                    $method_country['delivery_within']  = 1;
			                                }
			                            
			                                $cutoff_time        = Date.parse( date('Y-m-d H:i:s', Date.parse('+'+$method_country['delivery_within']+' day',Date.parse($time) / 1000) / 1000 ) ) / 1000;
			                            
			                                return $cutoff_time;
			                                exit;
			                            
			                            }else{
			                                $stoppage_hour      = $country[0].stoppage_hour;
			                                $stoppage_minute    = $country[0].stoppage_minute;
			                        
			                                $time               = $stoppage_hour + ':' + $stoppage_minute + ':00';
			                                $cutoff_time        = Date.parse( date('Y-m-d H:i:s', Date.parse('+1 day',Date.parse($time) / 1000) / 1000 ) ) / 1000;
			                        
			                                return $cutoff_time;
			                                exit;
			                            }
			                        }
			                    }
			                    
			                    /*if (sizeof($country)) {
			                        $stoppage_hour = $country[0]->stoppage_hour;
			                        $stoppage_minute = $country[0]->stoppage_minute;
			                    } else {
			                        $stoppage_hour = 0;
			                        $stoppage_minute = 0;
			                    }*/
			                }		                                
			            }else{
			              res.status(config.HTTP_NOT_FOUND).send({
			                status:config.ERROR,
			                code: config.HTTP_NOT_FOUND, 
			                message:"Page not found"
			              }); 
			            }
			          }

			      });




                $stoppageTime = '';

                if ($stoppage_hour < 10) {
                    $stoppage_hour = '0' . $stoppage_hour;
                }

                if ($stoppage_minute < 10) {
                    $stoppage_minute = '0' . $stoppage_minute;
                }

                $stoppageTime = $stoppage_hour + ':' + $stoppage_minute + ':59';
                
                return Date.parse($stoppageTime) / 1000;                   
            }
     }); 

}

module.exports = new ProductController();
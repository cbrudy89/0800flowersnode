var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var async = require('async');
var config = require('./../../config');
var connection = require('./../../database');
var dbModel = require('./../models/db-model');
var commonHelper = require('./../helpers/common-helper');
var request = require('request');

function ProductController() {

  this.productdetails  = function(req, res) {

	        /*if (Session::has('delivery_to')) {
	            $redirectTo = redirect(strtolower(Session::get('locale')) . '/' . strtolower(Session::get('delivery_to')['country']) . '/products');
	        } else {
	            return redirect('/');
	        }*/
	        var $slug = req.body.slug;
	        var $sessLang = req.body.language_id;
	        var $currentCountry = req.body.country_id;
	        var $province_id = req.body.province_id;
	        var $postalcode=req.body.postalcode;

	        $sql="Select `product_name`, `product_description`, `product_content`, products.*, sku from `products` inner join `language_product` on `products`.`id` = `language_product`.`product_id` INNER JOIN `product_prices` ON `product_prices`.`product_id` = `language_product`.`product_id` where (`product_status` = 1 and `language_product`.`language_id` = "+$sessLang+" and `products`.`slug` = '"+$slug+"') limit 1";
	        //console.log($sql);
	        $product=[];
		        dbModel.rawQuery($sql, function(err, $product) {
		           if (err) {
		              res.status(config.HTTP_BAD_REQUEST).send({
		                status:config.ERROR,
		                code: config.HTTP_BAD_REQUEST,             
		                message:"Unable to process request"
		              });
		           }else{
		             if($product.length > 0) {
			                res.status(config.HTTP_SUCCESS).send({
			                    status:config.ERROR,
			                    code: config.HTTP_SUCCESS,             
			                    message:"Product found ",
			                    result: $product
			                });

			                /////////////////////Product data/////////////////////////////////
			                $title =  $product[0].product_name +'-' + config.SITE_TITLE;
			                $resAtlasDDOrg  = null;
			                $AtlasDate      = [];                        
			                    
			                $postalcode = !($postalcode) ? $postalcode : config.DEFAULT_ZIPCODE;
			                //$resAtlasDDOrg={};
			                $resAtlasDDOrg=getCustomDeliveryDate($product[0].product_code, $product[0].sku, $postalcode, $currentCountry);
			                //console.log($resAtlasDDOrg);
			                /*if($resAtlasDDOrg.length){
			                    $resAtlasDD = JSON.parse($resAtlasDDOrg);                    
			                    if( $resAtlasDD.length && $resAtlasDD.deliveryCalendar && $resAtlasDD.deliveryCalendar && $resAtlasDD.deliveryCalendar.dateArray && $resAtlasDD.deliveryCalendar.dateArray) {
			                        $AtlasDate  = $resAtlasDD.deliveryCalendar.dateArray;
			                    }
			                }*/

		              

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
		                $title = getproductlanguage($product->id, $sessLang, 'product_name') . ' - ' . Config::get('constants.site_title');

		                if (count($chkCountryProvince) > 0) {
		                    
		                } else {
		                    abort(404);
		                }*/
		                $vendorId = $product[0].vendor_id;

		                //Check Vendor Has Made The Delivey Methods Or Not
		                //------------------------------------------------
		                $sql="Select * from `method_vendor` where `method_id` = "+$product[0].delivery_method_id+" and `vendor_id` = "+$vendorId+" limit 1";
		                //console.log($sql);
		                dbModel.rawQuery($sql, function(err, $productMethod) {
		                   if (err) {
		                      res.status(config.HTTP_BAD_REQUEST).send({
		                        status:config.ERROR,
		                        code: config.HTTP_BAD_REQUEST,             
		                        message:"Unable to process request"
		                      });
		                   }else{
		                        if($productMethod.length == 0){

		                            $sql="Select * from `method_vendor` where `method_id` = "+$product[0].delivery_method_id+" limit 1";
		                            //console.log($sql);
		                            dbModel.rawQuery($sql, function(err, $productMethod) {
		                               if (err) {
		                                  res.status(config.HTTP_BAD_REQUEST).send({
		                                    status:config.ERROR,
		                                    code: config.HTTP_BAD_REQUEST,             
		                                    message:"Unable to process request"
		                                  });
		                               }else{
		                                    if($productMethod.length > 0){

		                                        //if ($province_id != '' && $province_id != 0) {
		                                        //    $stoppage_time = stoppageTimePart($province_id);
		                                        //    $currentTime = getCurrentDateTime($province_id);
		                                        //} else {
		                                            $stoppage_time = stoppageTimePartForCountry($currentCountry);
		                                        //    $currentTime = getCurrentDateTimeForCountry($currentCountry);
		                                            
		                                       // }        
		                                    }                    
		                                    else{
		                                        // No product found
		                                          res.status(config.HTTP_NOT_FOUND).send({
		                                            status:config.ERROR,
		                                            code: config.HTTP_NOT_FOUND,             
		                                            message:"Method not found"
		                                          });                

		                                    }
		                                // $week_days = config.week_days;
		                                }
				                	});
				                }
		              		}
		              	});
	                 } /////////////////////////////Product data end////////////////////////////////////////////////
		             else {
		                    // No product found
		                  res.status(config.HTTP_NOT_FOUND).send({
		                    status:config.ERROR,
		                    code: config.HTTP_NOT_FOUND,             
		                    message:"Method not found"
		                  });                

		             }
	           }
	        });
	  
	}
    
}



function getCustomDeliveryDate($product_code, $productSku, $zipCode, $currentCountry) {
        if (!$productSku && !$zipCode) return false;
        var $params ={};        
        commonHelper.countrycode($currentCountry, function(err, res){
            if(err) console.log(err);
            else { 
                    $params = {
                        country : res[0].iso_code,
                        productSku : $productSku,
                        zipCode : $zipCode
                    };
                    getDeliveryCalendar($params);
                    //$responseDlvrCal = JSON.parse(getDeliveryCalendar($params));
        
                   /* if ($responseDlvrCal->getDlvrCalResponse->responseStatus == 'SUCCESS') {
                        $getDates = $responseDlvrCal->getDlvrCalResponse->getDlvrCalResult->dlvrCalDeliveryDates->dlvrCalDeliveryDate;
                        if (count($getDates) > 0) {
                            foreach ($getDates as $key => $item) {
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
                         if(isset($responseDlvrCal) && isset($responseDlvrCal->getDlvrCalResponse) && isset($responseDlvrCal->getDlvrCalResponse->getDlvrCalResult) && isset($responseDlvrCal->getDlvrCalResponse->getDlvrCalResult->flwsErrors) && isset($responseDlvrCal->getDlvrCalResponse->getDlvrCalResult->flwsErrors->flwsError) && isset($responseDlvrCal->getDlvrCalResponse->getDlvrCalResult->flwsErrors->flwsError->errorMessage) && $responseDlvrCal->getDlvrCalResponse->getDlvrCalResult->flwsErrors->flwsError->errorMessage != ''){
                          $deliveryCalendar = $responseDlvrCal->getDlvrCalResponse->getDlvrCalResult->flwsErrors->flwsError->errorMessage;
                          } 
                        $deliveryCalendar = 'SkuNotAvailable';
                        $result = false;
                    }
                } else if (empty($productSku) && !empty($zipCode)) {
                    $deliveryCalendar = 'NotFoundProductSku';
                    $result = false;
                } else {
                    $deliveryCalendar = 'NotFoundSkuAndZipcode';
                    $result = false;
                }

                if (Request::ajax()) {
                    echo json_encode(array('result' => $result, 'deliveryCalendar' => $deliveryCalendar));
                } else {
                    return json_encode(array('result' => $result, 'deliveryCalendar' => $deliveryCalendar));
                }*/
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
    $curlData = JSON.stringify($curlData);         
    $getResult = _executeCommonCurl(config.atlas_order.get_earliest_delivery_date_url, $curlData, 'getDeliveryCalendar');  

    return $getResult;
}
 function _executeCommonCurl($curlUrl, $curlData, $hitFile){

        // Set the headers
        var headers = {
            'Content-Type':'application/x-www-form-urlencoded',
            'X-IBM-Client-Id':config.atlas_order.client_id,
            'X-IBM-Client-Secret':config.atlas_order.client_secret
        }

        // Configure the request
        var options = {
            url: $curlUrl,
            method: 'POST',
            headers: headers,
            form: $curlData.getDlvrCalRequest
        }
        console.log(options);
        // Start the request
        request(options, function (error, response, body) {
              //console.log("ERROR: " + error + "\n\n");
              //console.log("STATUS CODE: " + response.statusCode + "\n\n");
              //console.log("RESPONSE BODY: " + response.body + "\n\n");
            if (!error && response.statusCode == 200) {
                // Print out the response body
                console.log(body+'---'+response);
                //return body;
            }
        });

}

function stoppageTimePartForCountry($country_id, $vendor_id = null)
{
    var d = new Date();
    var $current_hour = d.getHours();
    var $current_minute = d.getMinutes();
    
    if ($vendor_id !=null && $vendor_id != '') {
        $sql='select * from `group_vendor` where (`country_id` = '+$country_id+' and `vendor_id` = '+$vendor_id+')';
    } else {
        $sql='select * from `group_vendor` inner join `vendor` on `vendor`.`id` = `group_vendor`.`vendor_id` where `country_id` = '+$country_id+' and `vendor`.`status` = 1 and `stoppage_hour` >= '+$current_hour+' and (`group_vendor`.`stoppage_hour` > '+$current_hour+' or `group_vendor`.`stoppage_minute` >= '+$current_minute+') order by `stoppage_hour` asc, `stoppage_minute` asc';         
    }
    dbModel.rawQuery($sql, function(err, $country_group_vendor) {
           if (err) {
              res.status(config.HTTP_BAD_REQUEST).send({
                status:config.ERROR,
                code: config.HTTP_BAD_REQUEST,             
                message:"Unable to process request"
              });
           }else{

           		$sql='select * from `provinces` inner join `timezones` on `timezones`.`id` = `provinces`.`timezone_id` where `country_id` = '+$country_id;
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
                    }else{
                        $sql=' select `group_vendor`.`stoppage_hour`, `group_vendor`.`stoppage_minute`, `method_vendor`.`delivery_within` from `group_vendor` inner join `method_vendor` on `method_vendor`.`vendor_id` = `group_vendor`.`vendor_id` inner join `vendor` on `vendor`.`id` = `group_vendor`.`vendor_id` where `country_id` = 15 and `vendor`.`status` = 1 order by `method_vendor`.`delivery_within` asc, `stoppage_hour` asc, `stoppage_minute1` asc limit 1';
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
                            $sql='select `timezones`.`stoppage_hour`, `timezones`.`stoppage_minute`, `methods`.`delivery_within` from `provinces` inner join `timezones` on `timezones`.`id` = `provinces`.`timezone_id` inner join `location_product` on `location_product`.`province_id` = `provinces`.`id` inner join `products` on `products`.`id` = `location_product`.`product_id` inner join `methods` on `methods`.`id` = `products`.`delivery_method_id` inner join `vendor` on `vendor`.`id` = `products`.`vendor_id` where `provinces`.`country_id` = 15 and `vendor`.`status` = 1 order by `methods`.`delivery_within` asc, `timezones`.`stoppage_hour` asc, `timezones`.`stoppage_minute1` asc limit 1';
                            
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
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
	        if (err) callback(err);
	        else callback(null, result);	        
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

	/* Get all admin resticted dates  */

    this.adminRestictedRates= function ($vendor_id, $country_id, $product_id, callback) {
    $sql = "SELECT DATE_FORMAT(`restrict_calendar_dates`.`start_date`,'%y-%m-%d') AS start_date";
    $sql += " FROM `restrict_calendar_dates`";
    $sql += " INNER JOIN `product_restrict_calendar_date` on `product_restrict_calendar_date`.`restrict_calendar_date_id` = `restrict_calendar_dates`.`id`";
    $sql += " WHERE `restrict_calendar_dates`.`vendor_id` = " + $vendor_id + "";
    $sql += " AND `restrict_calendar_dates`.`country_id` = " + $country_id + "";
    $sql += " AND `product_restrict_calendar_date`.`product_id` = " + $product_id + "";
    $sql += " AND `restrict_calendar_dates`.`status` = 1";
    //console.log($sql);

    dbModel.rawQuery($sql, function(err, $restrictCalDate) {
        if (err) callback(err);
        else {
            var $restricted = [];
            if ($restrictCalDate.length > 0) {
                for(var i=0; i < $restrictCalDate.length; i++){
                    $newDt= $restrictCalDate[i].start_date;
                    $dt = $newDt.split('-');
                    var monthname=["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
                    $restrictCalDate[i].start_date = $dt[2]+'-'+monthname[parseInt($dt[1])-1]+'-'+$dt[0]; // Formatting date 27-JUL-2017
                    $restricted.push($restrictCalDate[i].start_date);
                }
                callback(null, $restricted);
            } else {
                callback(null, []);
            }
        }
    });
}

/* Get all vendor holiday list  */

this.vendorHolidayList = function ($vendor_id, $country_id, callback) {
    $sql = "SELECT DATE_FORMAT(`holiday_date`,'%y-%m-%d') AS holiday_date";
   // $sql = "SELECT `holidays`.`id`, `holidays`.`holiday_name`, `holidays`.`holiday_date`, `holidays`.`vendor_id`";
    $sql += "  FROM `holidays`";
    $sql += "  INNER JOIN `country_holiday` on `country_holiday`.`holiday_id` = `holidays`.`id`";
    $sql += "  WHERE `holidays`.`vendor_id` = " + $vendor_id;
    $sql += "  AND `country_holiday`.`country_id` = " + $country_id;
    $sql += "  AND `holidays`.`status` = 1";
    //console.log($sql);
    dbModel.rawQuery($sql, function(err, $getHolidayRecord) {
        if (err) callback(err);
        else {
            var $restricted = [];
            if ($getHolidayRecord.length > 0) {
                for(var i=0; i < $getHolidayRecord.length; i++){
                    $newDt= $getHolidayRecord[i].holiday_date;
                    $dt = $newDt.split('-');
                    var monthname=config.monthnamecaps;
                    $getHolidayRecord[i].start_date = $dt[2]+'-'+monthname[parseInt($dt[1])-1]+'-'+$dt[0]; // Formatting date 27-JUL-2017
                    $restricted.push($getHolidayRecord[i].start_date);
                }
                callback(null, $restricted);
            } else {
                callback(null, []);
            }
        }
    });    
}

//get deliver calendar
this.getCustomDeliveryDate = function ($countryiso_code, $currencydetails, $product_code, $productSku, $zipCode, $currentCountry, callback) {
    if (!$productSku && !$zipCode) return callback(false);
    var $params = {};
    var $deliveryCalendar = 'NotFoundProductSku';
    var $result = false;
    
    $curlData = {
        "getDlvrCalRequest": {
            "partnerId": "123",
            "customerId": config.atlas_order.customer_id,
            "customerType": config.atlas_order.customer_type,
            //"country": "IRE",
            "country" : $countryiso_code,
            "deliveryDate": "",
            "locationType": "1",
           // "productSku": "1120RD",
            "productSku" : $productSku,
            "backupSku": "",
            "backupSkuBrandCode": "",
            "siteId": config.atlas_order.site_id,
            "startDate": "",
            "sourceSystem": config.atlas_order.source_system,
            //"zipCode": "11514",
            "zipCode" : $zipCode,
            "brandCode": config.atlas_order.brand_code
        }
    };
    $curlData = JSON.stringify($curlData);
    //$Authorization = 'Bearer ' + base64.encode(config.atlas_order.client_id + ':' + config.atlas_order.client_secret);
    // Set the headers
    var headers = {
        // 'Authorization': $Authorization,
        // 'SOAPAction': 'getDeliveryCalendar',
        'Content-Type': 'application/json',
        'X-IBM-Client-Id': config.atlas_order.client_id,
        'X-IBM-Client-Secret': config.atlas_order.client_secret
        //'Accept-Language:en-US'
    }

    // Configure the request
    var options = {
        url: config.atlas_order.get_delivery_calendar_url,
        method: 'POST',
        headers: headers,
        body: $curlData
    }
    // Start the request
    request(options, function(error, response, body) {
        if (error) callback(error);
        else {
            callback(null, body);
        }
    });

}
///convert with conversion rate
this.getSurchargeConverted = function ($amount, callback) {


    // if ($resAtlasDDOrg.totSurcharge == '0.0') {
    //    $totSurcharge = $item.totSurcharge;
    // } else {
    //     $totSurcharge = number_format(currency(urlencode('USD'), urlencode('CAD'), $item.totSurcharge), 2);
    var options = {
        url: "http://www.google.com/finance/converter?a=" + $amount + "&from=USD&to=CAD",
        method: 'POST'
    }
    // Start the request
    request(options, function(error, response, data) {
        var startPos = data.search('<div id=currency_converter_result>');
        var endPos = data.search('<input type=submit value="Convert">');
        if (startPos > 0) {
            result = data.substring(startPos, endPos);
            result = result.replace('<div id=currency_converter_result>', '');
            result = result.replace('<span class=bld>', '');
            result = result.replace('</span>', '');
            result = result.replace('CAD\n', '');
            result = result.split('=');
        }
        var convertedamount = result[1];
        convertedamount = convertedamount.trim();
        callback(null, convertedamount);
    });
    // }
}

this.stoppageTimePartForCountry = function ($vendor_id = null, $country_id, callback) {
    var d = new Date();
    var $current_hour = d.getHours();
    var $current_minute = d.getMinutes();
    var current_date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();

    var $stoppageTime = $stoppage_hour = $stoppage_minute = 0;
    if ($vendor_id != null && $vendor_id != '') {
        $sql = 'SELECT * FROM `group_vendor` WHERE (`country_id` = ' + $country_id + ' AND `vendor_id` = ' + $vendor_id + ')';
    } else {
        $sql = 'SELECT * FROM `group_vendor` ';
        $sql += 'INNER JOIN `vendor` ON `vendor`.`id` = `group_vendor`.`vendor_id` ';
        $sql += 'WHERE `country_id` = ' + $country_id + ' AND `vendor`.`status` = 1 AND ';
        $sql += '`stoppage_hour` >= ' + $current_hour + ' AND (`group_vendor`.`stoppage_hour` > ' + $current_hour + ' OR ';
        $sql += '`group_vendor`.`stoppage_minute` >= ' + $current_minute + ') ORDER BY `stoppage_hour` ASC, `stoppage_minute` ASC';
    }
    dbModel.rawQuery($sql, function(err, $country_group_vendor) {
        if (err) callback(err);
        else {
            //console.log($country_group_vendor);
            $sql = 'SELECT * FROM `provinces` INNER JOIN `timezones` ON `timezones`.`id` = `provinces`.`timezone_id` ';
            $sql += 'WHERE `country_id` = ' + $country_id;
            dbModel.rawQuery($sql, function(err, $country) {
                if (err) callback(err);
                else {
                    if ($country.length > 0) {
                        if ($country_group_vendor.length > 0) {
                            if ($vendor_id != undefined && $vendor_id != '') {
                                $stoppage_hour = $country_group_vendor[0].stoppage_hour;
                                $stoppage_minute = $country_group_vendor[0].stoppage_minute;
                            } else {
                                if ($country_group_vendor[0].stoppage_hour <= $country[0].stoppage_hour && ($country_group_vendor[0].stoppage_hour < $country[0].stoppage_hour || $country_group_vendor[0].stoppage_minute <= $country[0].stoppage_minute)) {
                                    $stoppage_hour = $country_group_vendor[0].stoppage_hour;
                                    $stoppage_minute = $country_group_vendor[0].stoppage_minute;
                                } else if ($country[0].stoppage_hour >= $current_hour && ($country[0].stoppage_hour > $current_hour || $country[0].stoppage_minute >= $current_minute)) {
                                    $stoppage_hour = $country[0].stoppage_hour;
                                    $stoppage_minute = $country[0].stoppage_minute;
                                } else {
                                    $stoppage_hour = $country_group_vendor[0].stoppage_hour;
                                    $stoppage_minute = $country_group_vendor[0].stoppage_minute;
                                }

                            }
                        } else {
                            if (($vendor_id != null && $vendor_id != '') || $country[0].stoppage_hour >= $current_hour && ($country[0].stoppage_hour > $current_hour || $country[0].stoppage_minute >= $current_minute)) {
                                $stoppage_hour = $country[0].stoppage_hour;
                                $stoppage_minute = $country[0].stoppage_minute;
                            } else {
                                $sql = 'SELECT `group_vendor`.`stoppage_hour`, `group_vendor`.`stoppage_minute`, `method_vendor`.`delivery_within` FROM `group_vendor` ';
                                $sql += 'INNER JOIN `method_vendor` on `method_vendor`.`vendor_id` = `group_vendor`.`vendor_id` ';
                                $sql += 'INNER JOIN `vendor` on `vendor`.`id` = `group_vendor`.`vendor_id` WHERE `country_id` = ' + $country_id + ' AND ';
                                $sql += '`vendor`.`status` = 1 ORDER BY `method_vendor`.`delivery_within` ASC, `stoppage_hour` ASC, `stoppage_minute` ASC LIMIT 1';
                                //////////////
                                dbModel.rawQuery($sql, function(err, $method_vendor) {
                                    if (err) callback(err);
                                    else {
                                        if ($method_vendor.length) {
                                            $stoppage_hour = $method_vendor[0].stoppage_hour;
                                            $stoppage_minute = $method_vendor[0].stoppage_minute;
                                            $time = $stoppage_hour + ':' + $stoppage_minute + ':00 Z';

                                            if ($method_vendor[0].delivery_within == 0) {
                                                $method_vendor[0].delivery_within = 1;
                                            }

                                            $cutoff_time = new Date(current_date + ' ' + $time);
                                            $cutoff_time.setDate($cutoff_time.getDate() + $method_vendor[0].delivery_within);
                                            $cutoff_time = $cutoff_time.getTime() / 1000;

                                            callback(null, $cutoff_time);

                                        } else {
                                            $sql = 'SELECT `timezones`.`stoppage_hour`,`timezones`.`stoppage_minute`, `methods`.`delivery_within` FROM `provinces` ';
                                            $sql += 'INNER JOIN `timezones` ON `timezones`.`id` = `provinces`.`timezone_id` ';
                                            $sql += 'INNER JOIN `location_product` ON `location_product`.`province_id` = `provinces`.`id` ';
                                            $sql += 'INNER JOIN `products` ON `products`.`id` = `location_product`.`product_id` ';
                                            $sql += 'INNER JOIN `methods` ON `methods`.`id` = `products`.`delivery_method_id` ';
                                            $sql += 'INNER JOIN `vendor` ON `vendor`.`id` = `products`.`vendor_id` ';
                                            $sql += 'WHERE `provinces`.`country_id` = ' + $country_id + ' AND `vendor`.`status` = 1 ';
                                            $sql += 'ORDER BY `methods`.`delivery_within` ASC, `timezones`.`stoppage_hour` ASC, `timezones`.`stoppage_minute1` ASC LIMIT 1';
                                            dbModel.rawQuery($sql, function(err, $method_country) {
                                                if (err) callback(err);
                                                else {
                                                    if ($method_country.length) {
                                                        $stoppage_hour = $method_country[0].stoppage_hour;
                                                        $stoppage_minute = $method_country[0].stoppage_minute;
                                                        $time = $stoppage_hour + ':' + $stoppage_minute + ':00 Z';

                                                        if ($method_country[0].delivery_within == 0) {
                                                            $method_country[0].delivery_within = 1;
                                                        }

                                                        $cutoff_time = new Date(current_date + ' ' + $time);
                                                        $cutoff_time.setDate($cutoff_time.getDate() + $method_country[0].delivery_within);
                                                        $cutoff_time = $cutoff_time.getTime() / 1000;

                                                        callback(null, $cutoff_time);

                                                    } else {
                                                        $stoppage_hour = $country[0].stoppage_hour;
                                                        $stoppage_minute = $country[0].stoppage_minute;

                                                        $time = $stoppage_hour + ':' + $stoppage_minute + ':00 Z';

                                                        $cutoff_time = new Date(current_date + ' ' + $time);
                                                        $cutoff_time.setDate($cutoff_time.getDate() + 1);
                                                        $cutoff_time = $cutoff_time.getTime() / 1000;

                                                        callback(null, $cutoff_time);
                                                    }
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }

                        /*if (sizeof($country)) {
                            $stoppage_hour = $country[0]->stoppage_hour;
                            $stoppage_minute = $country[0]->stoppage_minute;
                        } else {
                            $stoppage_hour = 0;
                            $stoppage_minute = 0;
                        }*/

                        if ($stoppage_hour < 10) {
                            $stoppage_hour = '0'.$stoppage_hour;
                        }

                        if ($stoppage_minute < 10) {
                            $stoppage_minute = '0'.$stoppage_minute;
                        }

                        $time = $stoppage_hour + ':' + $stoppage_minute + ':59 Z';

                        $stoppageTime = (new Date(current_date + ' ' + $time)).getTime() / 1000;
                        //console.log($stoppageTime);
                        
                    }
    
                }

                callback(null, $stoppageTime);

            });

        }
    });

}

this.getCurrentDateTimeForCountry = function ($province_id=null,$country_id,callback)
{
    if($province_id == '' || $province_id == null ) {
        $sql ='SELECT offset FROM `provinces`';
        $sql +=' INNER JOIN timezones ON timezones.id=provinces.timezone_id';
        $sql +=' WHERE `country_id` = '+$country_id;
    }else{
        $sql ='SELECT offset FROM `provinces`';
        $sql +=' INNER JOIN timezones ON timezones.id=provinces.timezone_id';
        $sql +=' WHERE `country_id` = '+$country_id+' and `id` = '+$province_id;
    }
    //console.log('$sql-'+$sql);
    dbModel.rawQuery($sql, function(err, $timezonedata) {
           if (err) callback(err);
           else{
                if ($timezonedata.length) {
                    offset = $timezonedata[0].offset;
                    offset = offset.trim();
                } else {
                    offset = '-08.00';
                }
                var currenttime=new Date( new Date().getTime() + offset * 3600 * 1000).toUTCString().replace( / GMT$/, "" );
                //console.log(currenttime);

                callback(null,currenttime);
            }
    });         

}

this.getCurrentonlyTimeForCountry = function ($country_id,callback)
{
    $sql ='SELECT offset FROM `provinces`';
    $sql +=' INNER JOIN timezones ON timezones.id=provinces.timezone_id';
    $sql +=' WHERE `country_id` = '+$country_id;
   // console.log('$sql-'+$sql);
    dbModel.rawQuery($sql, function(err, $timezonedata) {
           if (err) callback(err);
           else{
                //console.log('tttt');
                if ($timezonedata.length) {
                    offset = $timezonedata[0].offset;
                    offset = offset.trim();
                } else {
                    offset = '-08.00';
                }
                d = new Date();
                localTime = d.getTime();
                localOffset = d.getTimezoneOffset() * 60000;
                utc = localTime + localOffset;
                converteddate = utc + (3600000*offset);
                nd = new Date(converteddate); 
                //var currentitme=nd.toLocaleTimeString();
                currenttime=nd.getHours()+':'+nd.getMinutes()+':'+nd.getSeconds();
                callback(null,currenttime); //date("H:i:s");
            } 
    });         
}

this.checkCalSurcharge = function ($date, $vendor_id, $country_id, $product_id, callback) {
    $sql = "SELECT `surcharge_calendars`.`id`, `surcharge_calendars`.`vendor_id`, `surcharge_calendars`.`country_id`, `surcharge_calendars`.`start_date`, `surcharge_calendars`.`surcharge`";
    $sql += " FROM `surcharge_calendars`";
    $sql += " INNER JOIN `product_surcharge_calendar` on `product_surcharge_calendar`.`surcharge_calendar_id` = `surcharge_calendars`.`id`";
    $sql += " WHERE `surcharge_calendars`.`vendor_id` = " + $vendor_id;
    $sql += " AND `surcharge_calendars`.`start_date` = '" + $date + "'";
    $sql += " AND `surcharge_calendars`.`country_id` = " + $country_id;
    $sql += " AND `product_surcharge_calendar`.`product_id` = " + $product_id;
    $sql += " AND `surcharge_calendars`.`status` = 1";
    //console.log($sql);
    dbModel.rawQuery($sql, function(err, $surchargeCalDate) {
        if (err) return callback(err);
        else {
            if ($surchargeCalDate.length > 0) callback(null, $surchargeCalDate[0].surcharge);
            else return callback(null, false);
        }
    });
}

/* For currunt date is a restict day or not  */

this.checkIsDateRestrict =function ($date, $vendor_id, $country_id, $product_id, callback) {
    $sql = "SELECT `restrict_calendar_dates`.`id`, `restrict_calendar_dates`.`vendor_id`, `restrict_calendar_dates`.`start_date`";
    $sql += " FROM `restrict_calendar_dates`";
    $sql += " INNER JOIN `product_restrict_calendar_date` on `product_restrict_calendar_date`.`restrict_calendar_date_id` = `restrict_calendar_dates`.`id`";
    $sql += " WHERE `restrict_calendar_dates`.`vendor_id` = " + $vendor_id + "";
    $sql += " AND `restrict_calendar_dates`.`start_date` = '" + $date + "'";
    $sql += " AND `restrict_calendar_dates`.`country_id` = " + $country_id + "";
    $sql += " AND `product_restrict_calendar_date`.`product_id` = " + $product_id + "";
    $sql += " AND `restrict_calendar_dates`.`status` = 1";
    //console.log($sql);

    dbModel.rawQuery($sql, function(err, $restrictCalDate) {
        if (err) callback(err);
        else {
            if ($restrictCalDate.length > 0) {
                callback(null, 'true');
            } else {
                callback(null, 'false');
            }
        }
    });
}


/* For currunt date  is not a holiday   */

this.checkIsDateHoliday = function ($date, $vendor_id, $country_id, callback) {

    $sql = "SELECT `holidays`.`id`, `holidays`.`holiday_name`, `holidays`.`holiday_date`, `holidays`.`vendor_id`";
    $sql += "  FROM `holidays`";
    $sql += "  INNER JOIN `country_holiday` on `country_holiday`.`holiday_id` = `holidays`.`id`";
    $sql += "  WHERE `holidays`.`vendor_id` = " + $vendor_id;
    $sql += "  AND `holidays`.`holiday_date` = '" + $date + "'";
    $sql += "  AND `country_holiday`.`country_id` = " + $country_id;
    $sql += "  AND `holidays`.`status` = 1";
    //console.log($sql);
    dbModel.rawQuery($sql, function(err, $getHolidayRecord) {
        if (err) callback(err);
        else {
            if ($getHolidayRecord.length > 0) {
                callback(null, 'true');
            } else {
                callback(null, 'false');
            }
        }
    });
}


/* For currunt week day(Like sunday,monday) is available for delivery or not  */

this.checkIsDaydisable = function ($method_days, $curruntday, callback)
{

    if ($method_days.length > 0) {
        if ($method_days.indexOf($curruntday + 1)) {
            callback(null, 'false');
        } else {
            callback(null, 'true');
        }
    }
}

this.checkTodayEnable =function ($isDateRestrict, $isDateHoliday, $checkCalDate, $delivery_days, $delivery_within, $vendor_id, $country_id, $product_id, $stoppage_time, $AtlasDate = '',callback) {

    var d = new Date();
    $dayNum = d.getDay() + 1;

    var hours = d.getHours();
    var minutes = d.getMinutes();
    var seconds = d.getSeconds();
    var time = hours + ":" + minutes + ":" + seconds;
    //$wdayNum = date('D', strtotime($checkCalDate));

    /*if (date('H:i:s') < $stoppage_time) {
        $todayEnable = TRUE;
    } else {
        $todayEnable = FALSE;
    }*/

    var monthNames = config.months_short;

    if ($isDateRestrict == false && $isDateHoliday == false) {

        if ($delivery_days.indexOf($dayNum) && (time < $stoppage_time) && $delivery_within == 0) {

            //$date_according_atlas           = date('j-F-y', strtotime($checkCalDate));
            $date_according_atlas_arr = $checkCalDate.split('-');
            $date_according_atlas_arr[1] = monthNames[$date_according_atlas_arr[1]].toUpperCase();
            $date_according_atlas = $date_according_atlas_arr.join("-");

            if ($AtlasDate.length > 0 && $AtlasDate) {
                if ($date_according_atlas.indexOf($AtlasDate)) {
                    $enable = true;
                } else {
                    $enable = false;
                }
            } else {
                $enable = false;
            }

        } else {
            $enable = false;
        }
    } else {
        $enable = false;
    }
    
    //console.log($enable);
    callback(null, $enable);
}



this.getNextEnableDate = function ($checkCalDate='',$delivery_days,$delivery_within,$vendor_id,$country_id, $product_id, $stoppage_time, $AtlasDate = '', callback)
{
    //console.log('Input Date'+ $checkCalDate);

    if ($checkCalDate == '') {
        $checkCalDate = currentformatted_date('Y-m-d',1);
    } else {
        //console.log('Date:'+ $checkCalDate);

        dd = (new Date($checkCalDate)).getDate();
        mm = (new Date($checkCalDate)).getMonth() + 1;
        yyyy = (new Date($checkCalDate)).getFullYear();

/*      console.log('Day:'+ dd);
        console.log('Month:'+ mm);
        console.log('Year:'+ yyyy);*/

        dd += 1;
        if(dd > 31){
            dd = 1;
            mm += 1;
        }       

        if (dd < 10) {
            dd = '0' + dd
        }
        if (mm < 10) {
            mm = '0' + mm
        }

        $checkCalDate = yyyy+'-'+mm+'-'+dd;

        //console.log('FinalDate:'+$checkCalDate);

    }


/*    $dwCounter = 0;

    var $weekday=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    //var monthname=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    var d = new Date();
    var $current_hour = d.getHours();
    var $current_minute = d.getMinutes();
    var $current_date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + (d.getDate() + 1);
    var $checkCalDate = '';

    $nextDay = (new Date($current_date + ' Z')).getTime() / 1000;
    $checkCalDate = $current_date;*/

    //$dayNum = (new Date($current_date)).getDay();
    //$wdayNum = $weekday[$dayNum];

    callback(null, $checkCalDate);

    /*
    if (date('H:i:s') < $stoppage_time) {
        $todayEnable = TRUE;
    } else {
        if ($delivery_within == 0) {
            //$nextDay = strtotime(date('Y-m-d') . "+1 days");
            $checkCalDate = date('Y-m-d', $nextDay);
            $dayNum = date('w', strtotime($checkCalDate));
            $wdayNum = date('D', strtotime($checkCalDate));
            $todayEnable = FALSE;
        } else {
            $todayEnable = FALSE;
        }
    }

    if ($delivery_within == 0) {
        for ($i = 1; $i <= 60; $i++) {
            $dayNum += 1;

            if (checkIsDateRestrict($checkCalDate, $vendor_id, $country_id, $product_id) === false &&
                checkIsDateHoliday($checkCalDate, $vendor_id, $country_id) === false
            ) {
                
                if (in_array($dayNum, $delivery_days) ) {
                    $dwCounter++;
                }
                
            }
            if ($dwCounter == 1) {

                $date_according_atlas           = date('j-F-y', strtotime($checkCalDate));
                $date_according_atlas_arr       = explode('-', $date_according_atlas);
                $date_according_atlas_arr[1]    = strtoupper($date_according_atlas_arr[1]);
                $date_according_atlas           = implode($date_according_atlas_arr, '-');

                if(!empty($AtlasDate) && sizeof($AtlasDate)){
                    if (in_array($date_according_atlas, $AtlasDate) ) {
                        $flag = true;
                        return $checkCalDate;
                        break;
                    }else{
                        $dwCounter--;
                    }
                }else{
                    
                    $flag = true;
                    return $checkCalDate;
                    break;
                }

            } else {
                //$nextDay = strtotime($checkCalDate . "+1 days");
                $checkCalDate = date('Y-m-d', $nextDay);
                $dayNum = date('w', $nextDay);
                $wdayNum = date('D', $nextDay);
            }
        }
    } else {

        for ($i = 1; $i <= 60; $i++) {
            $dayNum += 1;

            if (checkIsDateRestrict($checkCalDate, $vendor_id, $country_id, $product_id) === false &&
                checkIsDateHoliday($checkCalDate, $vendor_id, $country_id) === false
            ) {
                    
                if (in_array($dayNum, $delivery_days)) {
                    $dwCounter++;                    
                }
            }


            if ($dwCounter == $delivery_within) {

                $date_according_atlas           = date('j-F-y', strtotime($checkCalDate));
                $date_according_atlas_arr       = explode('-', $date_according_atlas);
                $date_according_atlas_arr[1]    = strtoupper($date_according_atlas_arr[1]);
                $date_according_atlas           = implode($date_according_atlas_arr, '-');

                if(!empty($AtlasDate) && sizeof($AtlasDate)){
                    if (in_array($date_according_atlas, $AtlasDate) ) {
                        $flag = true;
                        return $checkCalDate;
                        break;
                    }else{
                        $dwCounter--;
                    }
                }else{
                    
                    $flag = true;
                    return $checkCalDate;
                    break;
                }
                
            } else {
                
               // $nextDay = strtotime($checkCalDate . "+1 days");
                $checkCalDate = date('Y-m-d', $nextDay);
                $dayNum = date('w', $nextDay);
                $wdayNum = date('D', $nextDay);
            }
        }
    }*/
}

//////"d-m-Y"
this.currentformatted_date= function (template, adddays = 0) {

	currentformatted_date(template, adddays);
}

this.getSurcharge = function ($product_id, $country_id, $vendor_id, callback) {

    $sql = "SELECT `id`, `admin_confirm`, `surcharge` FROM `products` WHERE `id` = " + $product_id + " AND `admin_confirm` = 1";
    dbModel.rawQuery($sql, function(err, $productSurcharge) {
        if (err) return callback(err);
        else {
            if ($productSurcharge.length > 0 && $productSurcharge[0].surcharge > 0) {
                if ($productSurcharge[0].surcharge != '') callback(null, parseFloat($productSurcharge[0].surcharge).toFixed(2));
                else callback(null, false);
            } else {
                $sql = "SELECT `id`, `status`, `surcharge` FROM `vendor` WHERE `id` = " + $vendor_id + " AND `status` = 1";
    
                dbModel.rawQuery($sql, function(err, $vendorSurcharge) {
                    if (err) callback(err);
                    else {
                        if ($vendorSurcharge.length > 0 && $vendorSurcharge[0].surcharge > 0) {
                            callback(null, parseFloat($vendorSurcharge[0].surcharge).toFixed(2));
                        } else {
                            $sql = "SELECT `id`, `status`, `surcharge` FROM `country_list` WHERE `id` = " + $country_id + " AND `status` = 1";
                            dbModel.rawQuery($sql, function(err, $countrySurcharge) {
                                if (err) callback(err);
                                else {
                                    if ($countrySurcharge[0].surcharge != '') callback(null, parseFloat($countrySurcharge[0].surcharge).toFixed(2));
                                    else callback(null, false);
                                }
                            });
                        }
                    }
                });
            }
        }
    });
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
    
    
    //  take user input in different format , make datetime for mysql using  new Date() Object
    // for format 3 : need to pass current date object as inputDate 
    // for format 1,2 : need to pass user input and then format into mysql date type
    this.formatDateToMysqlDateTime = function( inputDate ,format ) {

       if(format == 1){

            // mm/dd/yyyy   03/16/2017
           var dateArr = inputDate.split("/");
           var newdate = dateArr[2]+'-'+ dateArr[0]+'-'+dateArr[1];
       }
       else if(format == 2){

           // dd/mm/yyyy   13-01-2017
           var dateArr = inputDate.split("/");
           var newdate = dateArr[2]+'-'+ dateArr[1]+'-'+dateArr[0];
       }    
       else if(format == 3){

           // new Date() 
           // YYYY-MM-DD HH:MM:SS' 
           
           var newdate = inputDate.getFullYear()+'-'+ (inputDate.getMonth() + 1 )+ '-'+inputDate.getDate()+' '+inputDate.getHours()+':'+inputDate.getMinutes()+':'+inputDate.getSeconds();
       }

       return newdate;

       //return datetime.toISOString().substring(0, 19).replace('T', ' ')
   }                      
   
}

function currentformatted_date(template, adddays = 0){
	var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;

    if(adddays > 0){
        dd += adddays;
        if(dd > 31){
            dd = 1;
            mm += 1;
        }

    }

    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    if (template == 'd-m-Y') return dd + '-' + mm + '-' + yyyy;
    if (template == 'Y-m-d') return yyyy + '-' + mm + '-' + dd;
}

module.exports = new CommonHelper();

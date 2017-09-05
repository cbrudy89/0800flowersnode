var jwt = require('jsonwebtoken');
var async = require('async');
var Sync = require('sync');
var request = require('request');
var config = require('./../../config');
var connection = require('./../../database');
var dbModel = require('./../models/db-model');
var commonHelper = require('./../helpers/common-helper');

function ProductController() {

    this.productdetails = function(req, res) {
        var return_data = {};

        var $slug = req.body.slug;
        var $sessLang = req.body.language_id;
        var $currentCountry = req.body.country_id;
        var $currency_id = req.body.currency_id;
        var $province_id = '' //var $province_id = req.body.province_id;
        var $recent_products = req.body.recent_products;

        var $current_date = commonHelper.currentformatted_date('Y-m-d');
        var $next_date = commonHelper.currentformatted_date('Y-m-d',1);

        async.parallel([
            function topbanner(callback) {
                commonHelper.getPromoBanner($sessLang, 'product_detail', function(err, result) {
                    if (err) return callback(err);
                    else {
                        if (result.length > 0 && result != null) {
                            return_data.topbanner = result[0].description;
                            callback();
                        } else {
                            return_data.topbanner = '';
                            callback();
                        }
                    }
                });
            },
            function productdata(callback) {

                $sql = "Select `product_name`, `product_description`, `product_specification`, `product_content`, `products`.`id`, `views`,`products`.`product_code`,`products`.`slug`, `products`.`delivery_method_id`,`products`.`vendor_id` from `products` ";
                $sql += "INNER JOIN `language_product` on `products`.`id` = `language_product`.`product_id` ";
                $sql += "INNER JOIN `location_product` on `products`.`id` = `location_product`.`product_id` ";
                $sql += "WHERE (`product_status` = 1 and `language_product`.`language_id` = " + $sessLang + " and `products`.`slug` = '" + $slug + "') ";
                $sql += "AND `location_product`.`country_id` = " + $currentCountry;
                //console.log($sql);

                if ($province_id != undefined && $province_id != '') {
                    $sql += " AND `location_product`.`province_id` = '" + $province_id + "'";
                }
                $sql += " LIMIT 1";
                $product = [];
                dbModel.rawQuery($sql, function(err, $product) {
                    if (err) return callback(err);
                    else {
                        if ($product.length > 0) {

                            /////////////////////Product data/////////////////////////////////
                            $title = $product[0].product_name + '-' + config.SITE_TITLE;
                            Sync(function() {
                                commonHelper.incrementProductViews.sync(null, $product[0].id);
                                $variantdetails = getVariantDetails.sync(null, $product[0].id);
                                $currencydetails = commonHelper.getCurrencyDetails.sync(null, $currency_id, $currentCountry);
                                // For Related Products---------------------
                                $delivery_country_show_state = 0;
                                $relatedProductsData = $relatedProducts=[];
                                $relatedProducts = getRelatedProducts.sync(null, $product[0].id);
                               
                                if($relatedProducts.length > 0){
                                    $counter = 0;
                                    for(i=0; i<$relatedProducts.length; i++){
                                        var $prds = {};
                                        $counts = getCounts.sync(null, $currentCountry, $relatedProducts[i].related_product_id);
                                        //console.log($counts);
                                        if ($delivery_country_show_state == 1) {
                                            if ($counts.length > 0 && $counts[0].aggregate > 0) {
                                                $prds = getProduct.sync(null, null, $relatedProducts[i].related_product_id, $sessLang);
                                                $relatedProductsData.push($prds);
                                                //console.log($relatedProductsData);
                                            }
                                        } else {
                                            $prds = getProduct.sync(null, null, $relatedProducts[i].related_product_id, $sessLang);
                                            $relatedProductsData.push($prds);
                                        }
                                        //endif;
                                        $counter++;
                                    }

                                }else{

                                    //To check if related product not associated
                                    $productList = [];
                                    $productList = getProductlistwithcountry.sync(null, $currentCountry, 0, 6);
                                    for ( var i = 0; i < $productList.length; i++) {
                                        var $prds = {};
                                        $prds = getProduct.sync(null, null, $productList[i].id, $sessLang);
                                        $relatedProductsData.push($prds);
                                        //console.log($relatedProductsData);
                                    }
                                }  
                                //End to check if relatated product not associated

                                ////////////////// Recent viewed product Functionality //////////////////////////////
                                $recentlyViewedProducts = [];
                                $recentViewed = $recent_products.split(',');
                                for(var i=0; i< $recentViewed.length; i++){
                                    var $prds = {};
                                    $prds = getProduct.sync(null, $currentCountry, $recentViewed[i], $sessLang);
                                    $recentlyViewedProducts.push($prds);
                                    
                                }
                                
                                var $variants=[];
                                
                                if($variantdetails.length > 0 && $currencydetails.length > 0){
                                    for(var i=0; i < $variantdetails.length; i++){
                                           //console.log($variantdetails[i].price_value);
                                          var $actPrice = commonHelper.number_format.sync(null, ($variantdetails[i].price_value * $currencydetails[0].exchange_rate), 2, '.', ',');
                                          var $compPrice = commonHelper.number_format.sync(null, ($variantdetails[i].compare_price * $currencydetails[0].exchange_rate), 2, '.', ',');

                                          //var $current_currency = price_data.currency_result[0].symbol+" "+price_data.currency_result[0].currency_code;
                                          var $current_currency = $currencydetails[0].currency_code;

                                          var $currentCurrSymbl = $currencydetails[0].symbol;
                                          if($current_currency !== "USD"){ 
                                              $actPrice = commonHelper.roundToNineNine.sync(null, $actPrice, $current_currency);
                                          }

                                          if ($compPrice > $actPrice) {
                                             $variantdetails[i].compare_price = $currentCurrSymbl + $compPrice;
                                             $variantdetails[i].price_value = $currentCurrSymbl + $actPrice;
                                          } else {
                                             $variantdetails[i].price_value = $currentCurrSymbl + $actPrice;
                                          }
                                         
                                          $variants.push($variantdetails[i]);
                                      }
                                }

                               //console.log($variants);
                                $response = {
                                    "preferred_currency_code" : $currencydetails[0].currency_code,
                                    'productDetails': $product,
                                    'variants': $variants,
                                    'relatedProductsData': $relatedProductsData,
                                    'recentlyViewedProducts': $recentlyViewedProducts
                                };
                              // console.log($response);


                                return_data.results = $response;    
                                callback();                     

                            });

                        }
                    }
                });

            }


        ], function(err, result) {

            if (err) {
                res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR,
                    code: config.HTTP_SERVER_ERROR,
                    message: "Unable to process request, Please try again!",
                    err: err
                });
            } else {
                res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS,
                    code: config.HTTP_SUCCESS,
                    message: 'Record found!',
                    result: return_data
                });
            }
        });
    }

    //Get delivery calender
    this.productdeliverycalender = function(req, res) {
        var return_data = {};
        var $sku = req.body.sku;
        var $sessLang = req.body.language_id;
        var $currentCountry = req.body.country_id;
        var $postalcode = req.body.postalcode;
        var $currency_id = req.body.currency_id;
        var $province_id = req.body.province_id;

        var $current_date = commonHelper.currentformatted_date('Y-m-d');
        var $next_date = commonHelper.currentformatted_date('Y-m-d',1);

        //console.log("current_date "+ $current_date);
        //console.log("next_date "+ $next_date);

        async.parallel([
            function calendardata(callback) {

                $sql = "Select `products`.`id`, `products`.`product_code`, `products`.`delivery_method_id`,`products`.`vendor_id` from `products` ";
                $sql += "INNER JOIN `language_product` on `products`.`id` = `language_product`.`product_id` ";
                $sql += "INNER JOIN `location_product` on `products`.`id` = `location_product`.`product_id` ";
                $sql += "INNER JOIN `product_prices` ON `products`.`id` = `product_prices`.`product_id` ";
                $sql += "WHERE (`product_status` = 1 and `language_product`.`language_id` = " + $sessLang + " and `product_prices`.`sku`  = '" + $sku + "') ";
                $sql += "AND `location_product`.`country_id` = " + $currentCountry;

                if ($province_id != undefined && $province_id != '') {
                    $sql += " AND `location_product`.`province_id` = '" + $province_id + "'";
                }

                $sql += " LIMIT 1";
                $product = [];

                dbModel.rawQuery($sql, function(err, $product) {
                    if (err) return callback(err);
                    else {
                        if ($product.length > 0) {
                            
                            /////////////////////Product data/////////////////////////////////
                            $resAtlasDDOrg = null;
                            $AtlasDate = [];
                            //console.log($product);
                            $postalcode = ($postalcode) ? $postalcode : config.DEFAULT_ZIPCODE;
                            // $resAtlasDDOrg={};
                            Sync(function() {
                                $vendorId = $product[0].vendor_id;
                                $country = commonHelper.countrycode.sync(null, $currentCountry);                                
                                $currencydetails = commonHelper.getCurrencyDetails.sync(null, $currency_id, $currentCountry);                                
                                $adminRestictedRates= commonHelper.adminRestictedRates.sync(null, $vendorId, $currentCountry, $product[0].id); ///get admin restricted dates
                                $vendorHolidayList= commonHelper.vendorHolidayList.sync(null, $vendorId, $currentCountry); ///get vendor restricted holidays

                                //console.log($vendorHolidayList);
                                $resAtlasDDOrg = commonHelper.getCustomDeliveryDate.sync(null, $country[0].iso_code,$currencydetails, $product[0].product_code, $sku, $postalcode, $currentCountry);
                                //console.log($resAtlasDDOrg);
                                body = JSON.parse($resAtlasDDOrg);
                                responseStatus = body["getDlvrCalResponse"]["responseStatus"];
                                $responseDlvrCal = body["getDlvrCalResponse"];
                                if (responseStatus == 'SUCCESS') {
                                    $getDates = body["getDlvrCalResponse"]["getDlvrCalResult"]["dlvrCalDeliveryDates"]["dlvrCalDeliveryDate"];
                                    if ($getDates.length > 0) {
                                        var $mobArray = [];
                                        var $dateArray = [];
                                        var $surchargeArray = [];
                                        var $infoArray = {};
                                        var $deldate = '';
                                        for (var $item in $getDates) {
                                            $deldate = $getDates[$item].deliveryDate;
                                            
                                            if($adminRestictedRates.indexOf($deldate) >= 0 ){
                                                continue; //admin date found
                                            } 
                                            if($vendorHolidayList.indexOf($deldate) >= 0 ){
                                                continue; //vendor restricted holiday found
                                            } 
                                                
                                            var $totSurcharge = '';
                                            $totSurcharge = $getDates[$item].totSurcharge;

                                            if ($totSurcharge != '0.0') {
                                                $totSurcharge = commonHelper.getSurchargeConverted.sync(null, $totSurcharge);
                                                $totSurcharge = parseFloat($totSurcharge).toFixed(2);
                                            }

                                            var currentDate = new Date($deldate); 
                                            var twoDigitMonth=((currentDate.getMonth()+1)>=10)? (currentDate.getMonth()+1) : '0' + (currentDate.getMonth()+1);  
                                            var twoDigitDate=((currentDate.getDate())>=10)? (currentDate.getDate()) : '0' + (currentDate.getDate());
                                            var caldate = currentDate.getFullYear() + "-" + twoDigitMonth + "-" + twoDigitDate; 
                                            
                                            $customtextdate = commonHelper.getCalenderCustomTextDates.sync(null, caldate, $vendorId, $currentCountry, $product[0].id);
                                            
                                            $infoArray[$deldate] = {
                                                'deliveryDate': $deldate,
                                                'totSurcharge': $totSurcharge,
                                                'customtext' : $customtextdate
                                            };

                                            $dateArray.push($deldate);
                                            $surchargeArray.push($totSurcharge);
                                        }

                                        $deliveryCalendar = {
                                            //'dateArray': $dateArray,
                                            //'surchargeArray': $surchargeArray,
                                            'infoArray': $infoArray,
                                            'currencyPrefix': $currencydetails[0].symbol,
                                            'currencySuffix': ''
                                        };
                                        $AtlasDate = $dateArray;
                                        $result = true;
                                    } else {
                                        $deliveryCalendar = 'No delivery date found.';
                                        $result = false;
                                    }

                                } else {
                                    if ($responseDlvrCal.length && $responseDlvrCal["getDlvrCalResponse"].length && $responseDlvrCal["getDlvrCalResponse"]["getDlvrCalResult"] && $responseDlvrCal["getDlvrCalResponse"]["getDlvrCalResult"]["flwsErrors"] && $responseDlvrCal["getDlvrCalResponse"]["getDlvrCalResult"]["flwsErrors"]["flwsError"] && $responseDlvrCal["getDlvrCalResponse"]["getDlvrCalResult"]["flwsErrors"]["flwsError"]["errorMessage"] && $responseDlvrCal["getDlvrCalResponse"]["getDlvrCalResult"]["flwsErrors"]["flwsError"]["errorMessage"] != '') {
                                        $deliveryCalendar = $responseDlvrCal["getDlvrCalResponse"]["getDlvrCalResult"]["flwsErrors"]["flwsError"]["errorMessage"];
                                    }
                                    $deliveryCalendar = 'SKU is not available.';
                                    $result = false;
                                }
                                //console.log($deliveryCalendar);
                                ///////////////////API response end///////////////////////////////// 
                                
                                //////Check Vendor Has Made The Delivey Methods Or Not
                                var $productMethod = {};
                                var $currenttime=$currentdateTime =$stoppage_time ='';

                                var $delivery_method_id = $product[0].delivery_method_id;
                                $sql = "SELECT * FROM `method_vendor` WHERE `method_id` = " + $delivery_method_id + " AND ";
                                $sql += "`vendor_id` = " + $vendorId + " LIMIT 1";

                                $productMethod = productMethod.sync(null, $sql, $delivery_method_id);

                                if ($province_id != undefined && $province_id != '') {
                                    //$stoppage_time = stoppageTimePart.sync(null,null, $province_id);
                                    //  $currentTime = getCurrentDateTime($province_id);
                                } else {
                                    $stoppage_time = commonHelper.stoppageTimePartForCountry.sync(null, null, $currentCountry);
                                    $currentdateTime = commonHelper.getCurrentDateTimeForCountry.sync(null,null, $currentCountry);
                                }
                                $currenttime= commonHelper.getCurrentonlyTimeForCountry.sync(null,$currentCountry);
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

                                ///////////////////////////////////////////////////////////////////////////// 
                                //Check Today Date
                                var d = new Date();

                                //$todayAnchorId = currentformatted_date("d-m-Y");
                                $todayAnchorId = $current_date;

                                var formatter = new Intl.DateTimeFormat("en", {
                                        month: "short"
                                }),
                                $todayDate = formatter.format(d) + ' ' + d.getDate();
                                $today = $todayDate;
                                ///////$today = strtoupper(date("M jS"));
                                $todayIsSaturday = d.getDay();
                                
                                $admCalSurcharge_ctd = commonHelper.checkCalSurcharge.sync(null, $todayAnchorId, $vendorId, $currentCountry, $product[0].id);

                                $todayExtraCharge = commonHelper.getSurcharge.sync(null, $product[0].id, $currentCountry, $vendorId);
                                if ($admCalSurcharge_ctd !== false) {
                                    $todayExtraCharge = $todayExtraCharge + $admCalSurcharge_ctd;
                                }


                                //Check Today Surcharge
                                //---------------------
                                if ($todayExtraCharge !== false) {
                                    if ($todayIsSaturday == 6) {
                                        $todayExtraCharge = config.saturday_charge;
                                    }
                                } else {
                                    $todayExtraCharge = '0.00';
                                }
                                $dayNum = (new Date($current_date)).getDay();

                                $isDateRestrict = commonHelper.checkIsDateRestrict.sync(null, $next_date, $vendorId, $currentCountry, $product[0].id);
                                $isDateHoliday = commonHelper.checkIsDateHoliday.sync(null, $current_date, $vendorId, $currentCountry);
                                $isDayDisable = commonHelper.checkIsDaydisable.sync(null, $productMethod[0].delivery_days, $dayNum);

                                //Check Today Is Restrict Date Or Not
                                //----------------------------------- 
                                $checkTodayEnableDate = commonHelper.checkTodayEnable.sync(null, $isDateRestrict, $isDateHoliday, $todayAnchorId, $productMethod[0].delivery_days, $productMethod[0].delivery_within, $vendorId, $currentCountry, $product[0].id, $stoppage_time, $AtlasDate);
                                if ($checkTodayEnableDate === false) {
                                    $todayRestrict = 'yes';
                                } else {
                                    $todayRestrict = 'no';
                                }

                                //if today is unavailable then use it for first date
                                $todayEnableDate = $current_date;
                                //console.log("todayEnableDate"+ $todayEnableDate);

                                if($todayRestrict == 'yes'){
                                    $firstEnableDate = commonHelper.getNextEnableDate.sync(null, '', $productMethod[0].delivery_days, $productMethod[0].delivery_within, $vendorId, $currentCountry, $product[0].id, $stoppage_time, $AtlasDate);
                                }else{
                                    $firstEnableDate = $todayEnableDate;
                                }

                                //console.log("firstEnableDate"+ $firstEnableDate);                            

                                //console.log($firstEnableDate);
                                $admCalSurcharge_cndd = commonHelper.checkCalSurcharge.sync(null, $firstEnableDate, $vendorId, $currentCountry, $product[0].id);
                                $firstExtraCharge = commonHelper.getSurcharge.sync(null, $product[0].id, $currentCountry, $vendorId);
                                if ($admCalSurcharge_cndd !== false) {
                                    $firstExtraCharge = $firstExtraCharge + $admCalSurcharge_cndd;
                                }
                                
                                $firstIsSaturday = (new Date($firstEnableDate)).getDay(); // Wrong Day Coming 6 against 3.
                                //console.log("firstIsSaturday"+ $firstIsSaturday);
                                //Check Next day Surcharge
                                //------------------------
                                if ($firstExtraCharge !== false) {
                                    if ($firstIsSaturday == 6) {
                                        $firstExtraCharge = parseFloat($firstExtraCharge) + parseFloat(config.saturday_charge);
                                    }
                                } else {
                                    $firstExtraCharge = '0.00';
                                }
                        
                                //Check Next Day Date
                                //-------------------   
                                $nextEnableDate = commonHelper.getNextEnableDate.sync(null, $firstEnableDate, $productMethod[0].delivery_days, $productMethod[0].delivery_within, $vendorId, $currentCountry, $product[0].id, $stoppage_time, $AtlasDate);
                                //console.log("nextEnableDate"+ $nextEnableDate);

                                $nextToNextEnableDate = commonHelper.getNextEnableDate.sync(null, $nextEnableDate, $productMethod[0].delivery_days, $productMethod[0].delivery_within, $vendorId, $currentCountry, $product[0].id, $stoppage_time, $AtlasDate);
                                //console.log("nextToNextEnableDate" + $nextToNextEnableDate);
                                $nextIsSaturday = (new Date($nextEnableDate)).getDay();
                                $admCalSurcharge_cndd = commonHelper.checkCalSurcharge.sync(null, $nextEnableDate, $vendorId, $currentCountry, $product[0].id);
                                $nextExtraCharge = commonHelper.getSurcharge.sync(null, $product[0].id, $currentCountry, $vendorId);
                                if ($admCalSurcharge_cndd !== false) {
                                    $nextExtraCharge += $admCalSurcharge_cndd;
                                }

                                //Check Next day Surcharge
                                //------------------------
                                if ($nextExtraCharge !== false) {
                                    if ($nextIsSaturday == 6) {
                                        $nextExtraCharge += config.saturday_charge;
                                    }
                                } else {
                                    $nextExtraCharge = '0.00';
                                }

                                //Check Next day Is Restrict Date Or Not
                                //--------------------------------------                    

                                //$nextDay = (new Date($current_date + ' Z')).getTime() / 1000;
                                //$nextDay = strtotime(date('Y-m-d') . "+1 days");

                                if ($isDateRestrict == true || $isDayDisable == true || $isDateHoliday == true) {
                                    $nextRestrict = 'yes';
                                } else {                                
                                    var monthname=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                                    var $nextDate = (new Date($next_date)).getDate();
                                    var $nextMonth = (new Date($next_date)).getMonth();
                                    var $nextYear = (new Date($next_date)).getFullYear();

                                    $nextDay = $nextDate+'-'+monthname[$nextMonth]+'-'+$nextYear; // Formatting date 27-JUL-2017
                                    $date_according_atlas_arr       = $nextDay.split('-');
                                    $date_according_atlas_arr[1]    = $date_according_atlas_arr[1].toUpperCase();
                                    $date_according_atlas           = $date_according_atlas_arr.join('-');

                                    if($AtlasDate != '' && $AtlasDate.length > 0){
                                        if ($AtlasDate.indexOf($date_according_atlas) > 0) {
                                            $nextRestrict = 'no';
                                        }else{
                                            $nextRestrict = 'yes';
                                        }
                                    }else{
                                        $nextRestrict = 'no';
                                    }
                                }

                                //Check Day After Tomorrow Date----------------------------  
                                $datIsSaturday = (new Date($nextToNextEnableDate)).getDay();

                                //console.log($nextToNextEnableDate);
                                $admCalSurcharge_cdatd = commonHelper.checkCalSurcharge.sync(null, $nextToNextEnableDate, $vendorId, $currentCountry, $product[0].id);
                                $datExtraCharge = commonHelper.getSurcharge.sync(null, $product[0].id, $currentCountry, $vendorId);
                                if ($admCalSurcharge_cdatd !== false) {
                                    $datExtraCharge += $admCalSurcharge_cdatd;
                                }

                                //Check Day After Tomorrow Surcharge
                                //----------------------------------
                                if ($datExtraCharge != false) {
                                    if ($datIsSaturday == 6) {
                                        $datExtraCharge += config.saturday_charge;
                                    }
                                } else {
                                    $datExtraCharge = '0.00';
                                }

                                $response = {
                                    'Weekday': JSON.stringify(config.week_days),
                                    //'adminRestictedRates': $adminRestictedRates,
                                    'currentdateTime': $currentdateTime,
                                    'currenttime': $currenttime,
                                    'stoppage_time': $stoppage_time,
                                    'currentCountry': $currentCountry,
                                    'todayAnchorId': $todayAnchorId,
                                    'todayExtraCharge': parseFloat($todayExtraCharge).toFixed(2),
                                    'todayRestrict': $todayRestrict,
                                    'firstEnableDate': $firstEnableDate,
                                    'firstExtraCharge': parseFloat($firstExtraCharge).toFixed(2),
                                    'nextEnableDate': $nextEnableDate,
                                    'nextExtraCharge': parseFloat($nextExtraCharge).toFixed(2),
                                    'nextRestrict': $nextRestrict,
                                    'nextToNextEnableDate': $nextToNextEnableDate,
                                    'datExtraCharge': $datExtraCharge,
                                    'deliveryCalendar': $deliveryCalendar,
                                    'AtlasDate': $AtlasDate
                                };

                                return_data.results = $response;
                                callback();
                                
                            });
                        }
                    }
                });
            }

        ], function(err, result) {

            if (err) {
                res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR,
                    code: config.HTTP_SERVER_ERROR,
                    message: "Unable to process request, Please try again!",
                    err: err
                });
            } else {
                res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS,
                    code: config.HTTP_SUCCESS,
                    message: 'Record found!',
                    result: return_data
                });
            }
        });

    }

}

function getProductlistwithcountry($country_id, $provience_id = 0 , $limit = 15, callback){

    //$sql = "SELECT p.*, lp.country_id, lp.province_id, m.delivery_method, m.delivery_within";
    $sql = "SELECT p.*, lp.country_id, m.delivery_method, m.delivery_within";
    $sql += " FROM products p";
    $sql += " INNER JOIN location_product lp ON(p.id = lp.product_id)";
    $sql += " INNER JOIN methods m ON(m.id = p.delivery_method_id)";
    $sql += " INNER JOIN vendor v ON(v.id = p.vendor_id)";
    $sql += " WHERE p.product_status = 1";
    $sql += " AND p.admin_confirm = 1";
    $sql += " AND frontend_show = 1";
    $sql += " AND v.status = 1";
    $sql += " AND lp.country_id = "+$country_id;

    
/*  if($provience_id != undefined && $provience_id > 0){
        $sql += " AND lp.province_id = 6";
    }
*/
    $sql += " GROUP BY lp.product_id";
    $sql += " ORDER BY p.frontend_serial_number ASC";
    $sql += " LIMIT 0,"+$limit;

    //console.log($sql);
    dbModel.rawQuery($sql, function(error, productList){
        if(error) callback(error);
        else{
            callback(null, productList);
        }
    });
}

function getRelatedProducts(product_id, callback){

    // Getting All related products for product_id
    var $sql  = "SELECT `related_product`.`related_product_id` FROM `products` INNER JOIN related_product";
        $sql += " ON (products.id = related_product.product_id)";
        $sql += " WHERE products.id = "+product_id;
        $sql += " AND products.product_status = 1";
        //console.log($sql);

        dbModel.rawQuery($sql, function(error, related_products){
            if(error) callback(error);
            else{
                if(related_products.length > 0) callback(null, related_products);
                else callback(null, []);
            }
        });


}

function getCounts($delivery_country_id, $product_id, callback){

    var $sql  = "SELECT COUNT(*) AS aggregate FROM `location_product`"
        $sql += " INNER JOIN `products` ON `location_product`.`product_id` = `products`.`id`";
        $sql += " WHERE `country_id` = "+$delivery_country_id;
/*      if($province_id != undefined && $province_id > 0){
            $sql += " AND `province_id` = "+$province_id;           
        }*/
        $sql += " AND `product_id` = "+$product_id;
        //console.log($sql);

        dbModel.rawQuery($sql, function(error, result){
            if(error) callback(error);
            else{
                callback(null, result);
            }
        });

}

function getProduct($country_id = null, $product_id, $language_id, callback){

    // For Getting Product 
    var $sql = "SELECT `products`.`id` as product_id, `product_name`, `slug`, `product_picture`";
        $sql += " FROM `products`";
        $sql += " INNER JOIN `language_product` ON `products`.`id` = `language_product`.`product_id`";
        if($country_id != undefined && $country_id != null){
            $sql += " INNER JOIN location_product lp ON(`products`.id = lp.product_id)";
        }
        $sql += " WHERE (`product_status` = 1"
        $sql += " AND `language_product`.`language_id` = "+$language_id;
        $sql += " AND `language_product`.`product_id` = "+$product_id+")";

        if($country_id != undefined && $country_id != null){
            $sql += " AND lp.country_id = "+$country_id;
        }

        $sql += "  LIMIT 1";

        //console.log($sql);

        dbModel.rawQuery($sql, function(error, result){
            if(error) callback(error);
            else{
                callback(null, result);
            }
        });
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

function productMethod($sql, $delivery_method_id, callback) {

    dbModel.rawQuery($sql, function(err, $productMethod) {
        if (err) return callback(err);
        else {
            if ($productMethod.length == 0) {
                $sql = "Select * from `method_vendor` where `method_id` = " + $delivery_method_id + " limit 1";
                dbModel.rawQuery($sql, function(err, $productMethod) {
                    if (err) return callback(err);
                    else {
                        callback(null, $productMethod);
                    }
                });
            } else {
                callback(null, $productMethod);
            }
        }
    });

}

module.exports = new ProductController();
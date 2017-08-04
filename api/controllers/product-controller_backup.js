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
        var $province_id = req.body.province_id;
        var $postalcode = req.body.postalcode;
        var $currency_id = req.body.currency_id;
        var $recent_products = req.body.recent_products;

        var $current_date = currentformatted_date('Y-m-d');
        var $next_date = currentformatted_date('Y-m-d',1);

/*        console.log('Curr Date'+ $current_date);
        console.log('Next Date'+ $next_date);*/

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

                $sql = "Select `product_name`, `product_description`, `product_content`, `products`.`id`, `products`.`product_code`,`products`.`slug`, `products`.`delivery_method_id`,`products`.`vendor_id` from `products` ";
                $sql += "INNER JOIN `language_product` on `products`.`id` = `language_product`.`product_id` ";
                $sql += "INNER JOIN `location_product` on `products`.`id` = `location_product`.`product_id` ";
                $sql += "WHERE (`product_status` = 1 and `language_product`.`language_id` = " + $sessLang + " and `products`.`slug` = '" + $slug + "') ";
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
                            $title = $product[0].product_name + '-' + config.SITE_TITLE;
                            $resAtlasDDOrg = null;
                            $AtlasDate = [];

                            $postalcode = !($postalcode) ? $postalcode : config.DEFAULT_ZIPCODE;
                            // $resAtlasDDOrg={};
                            Sync(function() {
                                $variantdetails = getVariantDetails.sync(null, $product[0].id);
                                $currencydetails = commonHelper.getCurrencyDetails.sync(null, $currency_id = null, $currentCountry);
                                $resAtlasDDOrg = getCustomDeliveryDate.sync(null, $currencydetails, $product[0].product_code, $variantdetails[0].sku, $postalcode, $currentCountry);
                                //console.log($resAtlasDDOrg);
                                //if ($resAtlasDDOrg.statusCode == 200) {
                                //response=JSON.parse(JSON.stringify($resAtlasDDOrg));
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
                                        //for ( var i=0 ; i < $getDates.length; i++) {
                                        for (var $item in $getDates) {
                                            $deldate = $getDates[$item].deliveryDate;
                                            //console.log($deldate);
                                            //////////////////////Mobile calendar////////////////
                                            /*var d = new Date($deldate),month =''+(d.getMonth()+1),day=''+d.getDate(),year=d.getFullYear();
                                                if (month.length < 2) month = '0' + month;
                                                if (day.length < 2) day = '0' + day;
                                                $deliveryDate= [day,month,year].join('-');

                                                var d=new Date($deldate);
                                                var weekday=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
                                                var monthname=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                                                var $deliverydateformatted = weekday[d.getDay()] + ", "+d.getDate() + " "+monthname[d.getMonth()];

                                                $mobArray = {'option' : $deliveryDate, 'text' : $deliverydateformatted };
                                                $infoArray[$deldate] = {'deliveryDate' : $deldate, 'mobInfo' : $mobArray, 'totSurcharge' : $totSurcharge};*/
                                            //////////////////////Mobile calendar END////////////////
                                            var $totSurcharge = '';
                                            $totSurcharge = $getDates[$item].totSurcharge;

                                            if ($totSurcharge != '0.0') {
                                                $totSurcharge = getSurchargeConverted.sync(null, $totSurcharge);
                                                $totSurcharge = parseFloat($totSurcharge).toFixed(2);
                                            }

                                            //console.log($totSurcharge);

                                            $infoArray[$deldate] = {
                                                'deliveryDate': $deldate,
                                                'totSurcharge': $totSurcharge
                                            };

                                            $dateArray.push($deldate);
                                            $surchargeArray.push($totSurcharge);
                                        }
                                        // }
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
                                        $deliveryCalendar = 'ZeroDeliveryDate';
                                        $result = false;
                                    }

                                } else {
                                    if ($responseDlvrCal.length && $responseDlvrCal["getDlvrCalResponse"].length && $responseDlvrCal["getDlvrCalResponse"]["getDlvrCalResult"] && $responseDlvrCal["getDlvrCalResponse"]["getDlvrCalResult"]["flwsErrors"] && $responseDlvrCal["getDlvrCalResponse"]["getDlvrCalResult"]["flwsErrors"]["flwsError"] && $responseDlvrCal["getDlvrCalResponse"]["getDlvrCalResult"]["flwsErrors"]["flwsError"]["errorMessage"] && $responseDlvrCal["getDlvrCalResponse"]["getDlvrCalResult"]["flwsErrors"]["flwsError"]["errorMessage"] != '') {
                                        $deliveryCalendar = $responseDlvrCal["getDlvrCalResponse"]["getDlvrCalResult"]["flwsErrors"]["flwsError"]["errorMessage"];
                                    }
                                    $deliveryCalendar = 'SkuNotAvailable';
                                    $result = false;
                                }

                                //  }
                                ///////////////////API response end/////////////////////////////////
                                /*console.log($responseDlvrCal);
                                if($responseDlvrCal != 'undefined'){
                                    if($responseDlvrCal.deliveryCalendar && $responseDlvrCal.deliveryCalendar.dateArray) {
                                        $AtlasDate  = $responseDlvrCal.deliveryCalendar.dateArray;
                                    }
                                }*/
                                //console.log($AtlasDate);

                                //$currencydetails=getCurrencyDetails.sync(null, $product[0].id, $currentCountry, $currentCountry);


                                $vendorId = $product[0].vendor_id;
                                //Check Vendor Has Made The Delivey Methods Or Not
                                var $productMethod = {};

                                var $delivery_method_id = $product[0].delivery_method_id;
                                $sql = "SELECT * FROM `method_vendor` WHERE `method_id` = " + $delivery_method_id + " AND ";
                                $sql += "`vendor_id` = " + $vendorId + " LIMIT 1";

                                $productMethod = productMethod.sync(null, $sql, $delivery_method_id);

                                if ($province_id != undefined && $province_id != '') {
                                    //$stoppage_time = stoppageTimePart.sync(null,null, $province_id);
                                    //  $currentTime = getCurrentDateTime($province_id);
                                } else {
                                    $stoppage_time = stoppageTimePartForCountry.sync(null, null, $currentCountry);
                                    //$currentTime = getCurrentDateTimeForCountry.sync(null,null, $currentCountry);
                                }

                                //console.log('Stoppage Time'+ $stoppage_time);

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
                                //$today = strtoupper(date("M jS"));
                                $todayIsSaturday = d.getDay();

                                //$todaySurcharge = checkCalSurcharge(date('Y-m-d'), $product->vendor_id, Session::get('delivery_to')['country_id'],$product->id); 
                                //$admCalSurcharge_ctd = checkCalSurcharge.sync(null, $todayAnchorId, $vendorId, $currentCountry, $product[0].id);
                                $admCalSurcharge_ctd = checkCalSurcharge.sync(null, $todayAnchorId, $vendorId, $currentCountry, $product[0].id);

                                $todayExtraCharge = getSurcharge.sync(null, $product[0].id, $currentCountry, $vendorId);
                                if ($admCalSurcharge_ctd !== false) {
                                    $todayExtraCharge = Number($todayExtraCharge) + Number($admCalSurcharge_ctd);
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

                                $isDateRestrict = checkIsDateRestrict.sync(null, $next_date, $vendorId, $currentCountry, $product[0].id);
                                $isDateHoliday = checkIsDateHoliday.sync(null, $current_date, $vendorId, $currentCountry);
                                $isDayDisable = checkIsDaydisable.sync(null, $productMethod[0].delivery_days, $dayNum);

                                //Check Today Is Restrict Date Or Not
                                //----------------------------------- 
                                $checkTodayEnableDate = checkTodayEnable.sync(null, $isDateRestrict, $isDateHoliday, $todayAnchorId, $productMethod[0].delivery_days, $productMethod[0].delivery_within, $vendorId, $currentCountry, $product[0].id, $stoppage_time, $AtlasDate);
                                if ($checkTodayEnableDate === false) {
                                    $todayRestrict = 'yes';
                                } else {
                                    $todayRestrict = 'no';
                                }

                                //if today is unavailable then use it for first date
                                $todayEnableDate = $current_date;
                                //console.log("todayEnableDate"+ $todayEnableDate);

                                if($todayRestrict == 'yes'){
                                    $firstEnableDate = getNextEnableDate.sync(null, '', $productMethod[0].delivery_days, $productMethod[0].delivery_within, $vendorId, $currentCountry, $product[0].id, $stoppage_time, $AtlasDate);
                                }else{
                                    $firstEnableDate = $todayEnableDate;
                                }

                                //console.log("firstEnableDate"+ $firstEnableDate);                            

                                //console.log($firstEnableDate);
                                $admCalSurcharge_cndd = checkCalSurcharge.sync(null, $firstEnableDate, $vendorId, $currentCountry, $product[0].id);
                                $firstExtraCharge = getSurcharge.sync(null, $product[0].id, $currentCountry, $vendorId);
                                if ($admCalSurcharge_cndd !== false) {
                                    $firstExtraCharge += $admCalSurcharge_cndd;
                                }
                                
                                //console.log($firstEnableDate);
                                $firstIsSaturday = (new Date($firstEnableDate)).getDay(); // Wrong Day Coming 6 against 3.
                                //console.log("firstIsSaturday"+ $firstIsSaturday);
                                //Check Next day Surcharge
                                //------------------------
                                if ($firstExtraCharge !== false) {
                                    if ($firstIsSaturday == 6) {
                                        $firstExtraCharge += config.saturday_charge;
                                    }
                                } else {
                                    $firstExtraCharge = '0.00';
                                }
                        
                                //Check Next Day Date
                                //-------------------   
                                $nextEnableDate = getNextEnableDate.sync(null, $firstEnableDate, $productMethod[0].delivery_days, $productMethod[0].delivery_within, $vendorId, $currentCountry, $product[0].id, $stoppage_time, $AtlasDate);
                                //console.log("nextEnableDate"+ $nextEnableDate);

                                $nextToNextEnableDate = getNextEnableDate.sync(null, $nextEnableDate, $productMethod[0].delivery_days, $productMethod[0].delivery_within, $vendorId, $currentCountry, $product[0].id, $stoppage_time, $AtlasDate);
                                //console.log("nextToNextEnableDate" + $nextToNextEnableDate);
                                $nextIsSaturday = (new Date($nextEnableDate)).getDay();
                                $admCalSurcharge_cndd = checkCalSurcharge.sync(null, $nextEnableDate, $vendorId, $currentCountry, $product[0].id);
                                $nextExtraCharge = getSurcharge.sync(null, $product[0].id, $currentCountry, $vendorId);
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

                               // console.log($AtlasDate);
                                //console.log('Here 1');
                                //console.log('----'+$isDateRestrict);
                                if ($isDateRestrict == true || $isDayDisable == true || $isDateHoliday == true) {
                                    $nextRestrict = 'yes';
                                } else {

                                    //Working Here
                                    var monthname=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                                    var $nextDate = (new Date($next_date)).getDate();
                                    var $nextMonth = (new Date($next_date)).getMonth();
                                    var $nextYear = (new Date($next_date)).getFullYear();

                                    //$date_according_atlas           = date('j-F-y', strtotime($nextDay)); // Need to convert days
                                    $nextDay = $nextDate+'-'+monthname[$nextMonth]+'-'+$nextYear; // Formatting date 27-JUL-2017
                                    $date_according_atlas_arr       = $nextDay.split('-');
                                    $date_according_atlas_arr[1]    = $date_according_atlas_arr[1].toUpperCase();
                                    $date_according_atlas           = $date_according_atlas_arr.join('-');

                                    if($AtlasDate != '' && $AtlasDate.length > 0){
                                        //if (in_array($date_according_atlas, $AtlasDate) ) {
                                        if ($AtlasDate.indexOf($date_according_atlas) > 0) {
                                            $nextRestrict = 'no';
                                        }else{
                                            $nextRestrict = 'yes';
                                        }
                                    }else{
                                        $nextRestrict = 'no';
                                    }
                                }
                                //Check Day After Tomorrow Date
                                //-----------------------------  
                                $datIsSaturday = (new Date($nextToNextEnableDate)).getDay();

        //console.log($nextToNextEnableDate);
                                $admCalSurcharge_cdatd = checkCalSurcharge.sync(null, $nextToNextEnableDate, $vendorId, $currentCountry, $product[0].id);
                                $datExtraCharge = getSurcharge.sync(null, $product[0].id, $currentCountry, $vendorId);
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


                                // For Related Products
                                // ---------------------
                                //console.log($product[0].id);
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
                                //console.log('recentlyViewedProducts--'+$recentlyViewedProducts);

                                // Getting Currency Details from current country
                                //var $currency_details = getCurrencyDetails.sync(null, currency_id, delivery_country_id);

                                //var price_data = getproductprices.sync(null, $product[i].id, currentCountry, $currency_details[0].id, 0);
                                
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
                                    'currency_id': $currencydetails[0].id,
                                    'productDetails': $product,
                                    'variants': $variants,
                                    'Weekday': JSON.stringify(config.week_days),
                                    'todayAnchorId': $todayAnchorId,
                                    'nextEnableDate': $nextEnableDate,
                                    'currentCountry': $currentCountry,
                                    'todayExtraCharge': $todayExtraCharge,
                                    'nextExtraCharge': $nextExtraCharge,
                                    'todayRestrict': $todayRestrict ,
                                    'nextRestrict': $nextRestrict,
                                    'nextExtraCharge': $nextExtraCharge,
                                    'nextToNextEnableDate': $nextToNextEnableDate,
                                    'datExtraCharge': $datExtraCharge,
                                    'deliveryCalendar': $deliveryCalendar,
                                    'AtlasDate': $AtlasDate,
                                    'firstEnableDate': $firstEnableDate,
                                    'firstExtraCharge': $firstExtraCharge,
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


/**
 * Date to timestamp
 * @param  string template
 * @param  string date
 * @return string
 * @example         datetotime("d-m-Y", "26-02-2012") return 1330207200000
 */
function datetotime(template, date) {
    date = date.split(template[1]);
    template = template.split(template[1]);
    date = date[template.indexOf('m')] +
        "/" + date[template.indexOf('d')] +
        "/" + date[template.indexOf('Y')];

    return (new Date(date).getTime());
}
//////"d-m-Y"
function currentformatted_date(template, adddays = 0) {
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


function getSurchargeConverted($amount, callback) {


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

function checkCalSurcharge($date, $vendor_id, $country_id, $product_id, callback) {
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

function getSurcharge($product_id, $country_id, $vendor_id, callback) {
    $surcharge = false;
    $sql = "SELECT `id`, `admin_confirm`, `surcharge` FROM `products` WHERE `id` = " + $product_id + " AND `admin_confirm` = 1";
    dbModel.rawQuery($sql, function(err, $productSurcharge) {
        if (err) return callback(err);
        else {
            if ($productSurcharge.length > 0 && $productSurcharge[0].surcharge > 0) {
                callback(null, formatPrice($productSurcharge[0].surcharge));
            } else {
                $sql = "SELECT `id`, `status`, `surcharge` FROM `vendor` WHERE `id` = " + $vendor_id + " AND `status` = 1";
    
                dbModel.rawQuery($sql, function(err, $vendorSurcharge) {
                    if (err) callback(err);
                    else {
                        if ($vendorSurcharge.length > 0 && $vendorSurcharge[0].surcharge > 0) {
                            callback(null, $vendorSurcharge[0].surcharge);
                        } else {
                            $sql = "SELECT `id`, `status`, `surcharge` FROM `country_list` WHERE `id` = " + $country_id + " AND `status` = 1";
                            dbModel.rawQuery($sql, function(err, $countrySurcharge) {
                                if (err) callback(err);
                                else {
                                    if ($countrySurcharge.length > 0) callback(null, formatPrice($countrySurcharge[0].surcharge));
                                    else callback(null, false);
                                }
                            });
                        }
                    }
                });
            }
        }
    });
    //return $surcharge;
}

function formatPrice($price) {
    if ($price != '') {
        return $price.toFixed(2);
    } else {
        return '0.00';
    }
}

function checkTodayEnable($isDateRestrict, $isDateHoliday, $checkCalDate, $delivery_days, $delivery_within, $vendor_id, $country_id, $product_id, $stoppage_time, $AtlasDate = '',callback) {

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

/* For currunt date is a restict day or not  */

function checkIsDateRestrict($date, $vendor_id, $country_id, $product_id, callback) {
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

/* For currunt week day(Like sunday,monday) is available for delivery or not  */

function checkIsDaydisable($method_days, $curruntday, callback)
{

    if ($method_days.length > 0) {
        if ($method_days.indexOf($curruntday + 1)) {
            callback(null, 'false');
        } else {
            callback(null, 'true');
        }
    }
}


/* For currunt date  is not a holiday   */

function checkIsDateHoliday($date, $vendor_id, $country_id, callback) {

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


function getNextEnableDate($checkCalDate='',$delivery_days,$delivery_within,$vendor_id,$country_id, $product_id, $stoppage_time, $AtlasDate = '', callback)
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

function stoppageTimePartForCountry($vendor_id = null, $country_id, callback) {
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

/*function stoppageTimePart($vendor_id = null, $province_id, callback) {
    var d = new Date();
    var $current_hour = d.getHours();
    var $current_minute = d.getMinutes();

    if ($vendor_id != null && $vendor_id != '') {
        $sql = 'Select * from `provinces` inner join `group_vendor` on `group_vendor`.`timezone_id` = `provinces`.`timezone_id` inner join `timezones` on `timezones`.`id` = `provinces`.`timezone_id` where (`provinces`.`id` = ' + $province_id + ' and `provinces`.`status` = 1 and `group_vendor`.`vendor_id` = ' + $vendor_id + ') group by `provinces`.`timezone_id`';
    } else {
        $sql = 'select `group_vendor`.`stoppage_hour`, `group_vendor`.`stoppage_minute` from `provinces` inner join `group_vendor` on `group_vendor`.`timezone_id` = `provinces`.`timezone_id` inner join `timezones` on `timezones`.`id` = `provinces`.`timezone_id` inner join `vendor` on `vendor`.`id` = `group_vendor`.`vendor_id` where (`provinces`.`id` = ' + $province_id + ' and `provinces`.`status` = 1) and `group_vendor`.`stoppage_hour` >= ' + $current_hour + ' and `vendor`.`status` = 1 and (`group_vendor`.`stoppage_hour` > ' + $current_hour + ' or `group_vendor`.`stoppage_minute` >= ' + $current_minute + ') order by `group_vendor`.`stoppage_hour` asc, `group_vendor`.`stoppage_minute` asc';
    }
    dbModel.rawQuery($sql, function(err, $country_group_vendor) {
        if (err) callback(err);
        else {
            $sql = 'select * from `provinces` inner join `timezones` on `timezones`.`id` = `provinces`.`timezone_id` where (`provinces`.`id` = ' + $province_id + ' and `status` = 1)';
            dbModel.rawQuery($sql, function(err, $province) {
                if (err) callback(err);
                else {
                    // console.log($province_group_vendor);                     
                    if ($province_group_vendor.length && $province_group_vendor[0].length) {
                        if ($vendor_id != null && $vendor_id != '') {
                            $stoppage_hour = $province_group_vendor[0].stoppage_hour;
                            $stoppage_minute = $province_group_vendor[0].stoppage_minute;
                        } else {
                            if ($province_group_vendor[0].stoppage_hour <= $province[0].stoppage_hour && ($province_group_vendor[0].stoppage_hour < $province[0].stoppage_hour || $province_group_vendor[0].stoppage_minute <= $province[0].stoppage_minute)) {
                                $stoppage_hour = $province_group_vendor[0].stoppage_hour;
                                $stoppage_minute = $province_group_vendor[0].stoppage_minute;
                            } else if ($province[0].stoppage_hour >= $current_hour && ($province[0].stoppage_hour > $current_hour || $province[0].stoppage_minute >= $current_minute)) {
                                $stoppage_hour = $province[0].stoppage_hour;
                                $stoppage_minute = $province[0].stoppage_minute;
                            } else {
                                $stoppage_hour = $province_group_vendor[0].stoppage_hour;
                                $stoppage_minute = $province_group_vendor[0].stoppage_minute;
                            }
                        }

                    } else {
                        if (($vendor_id != null && $vendor_id != '') || $province[0].stoppage_hour >= $current_hour && ($province[0].stoppage_hour > $current_hour || $province[0].stoppage_minute >= $current_minute)) {
                            $stoppage_hour = $province[0].stoppage_hour;
                            $stoppage_minute = $province[0].stoppage_minute;
                        } else {
                            $sql = 'Select `group_vendor`.`stoppage_hour`, `group_vendor`.`stoppage_minute`, `method_vendor`.`delivery_within` from `provinces` INNER JOIN `group_vendor` on `group_vendor`.`timezone_id` = `provinces`.`timezone_id` inner join `timezones` on `timezones`.`id` = `provinces`.`timezone_id` INNER JOIN `method_vendor` on `method_vendor`.`vendor_id` = `group_vendor`.`vendor_id` INNER JOIN `vendor` on `vendor`.`id` = `group_vendor`.`vendor_id` where (`provinces`.`id` = ' + $province_id + ' and `provinces`.`status` = 1) and `vendor`.`status` = 1 order by `method_vendor`.`delivery_within` asc, `group_vendor`.`stoppage_hour` asc, `group_vendor`.`stoppage_minute` asc limit 1';
                            dbModel.rawQuery($sql, function(err, $country_group_vendor) {
                                if (err) callback(err);
                                else {
                                    if ($method_vendor.length) {
                                        $stoppage_hour = $method_vendor[0].stoppage_hour;
                                        $stoppage_minute = $method_vendor[0].stoppage_minute;
                                        $time = $stoppage_hour + ':' + $stoppage_minute + ':00';

                                        if ($method_vendor[0].delivery_within == 0) {
                                            $method_vendor[0].delivery_within = 1;
                                        }
                                        // $cutoff_time     = strtotime( date('Y-m-d H:i:s', strtotime('+'.$method_vendor['delivery_within'].' day',strtotime($time)) ) );
                                        //$cutoff_time = Date.parse( date('Y-m-d H:i:s', Date.parse('+'+$method_vendor[0].delivery_within+' day',Date.parse($time) / 1000 ) / 1000 ) ) / 1000;

                                        $cutoff_time = d.getTime() + ($method_vendor[0].delivery_within * 24 * 60 * 60 * 1000) + (Date.parse($time) / 1000);

                                        return $cutoff_time;
                                        exit;

                                    } else {
                                        $sql = 'Select `timezones`.`stoppage_hour`, `timezones`.`stoppage_minute`, `methods`.`delivery_within` from `provinces` INNER JOIN `timezones` on `timezones`.`id` = `provinces`.`timezone_id` INNER JOIN `location_product` on `location_product`.`province_id` = `provinces`.`id` inner join `products` on `products`.`id` = `location_product`.`product_id` INNER JOIN `methods` on `methods`.`id` = `products`.`delivery_method_id` inner join `vendor` on `vendor`.`id` = `products`.`vendor_id` where (`provinces`.`id` = ' + $province_id + ' and `provinces`.`status` = 1) and `vendor`.`status` = 1 order by `methods`.`delivery_within` asc, `timezones`.`stoppage_hour` asc, `timezones`.`stoppage_minute` asc limit 1';
                                        //$method_country =
                                        dbModel.rawQuery($sql, function(err, $method_country) {
                                            if (err) callback(err);
                                            else {
                                                if ($method_country.length) {
                                                    $stoppage_hour = $method_country[0].stoppage_hour;
                                                    $stoppage_minute = $method_country[0].stoppage_minute;
                                                    $time = $stoppage_hour + ':' + $stoppage_minute + ':00';

                                                    if ($method_country[0].delivery_within == 0) {
                                                        $method_country[0].delivery_within = 1;
                                                    }

                                                    // $cutoff_time = Date.parse( date('Y-m-d H:i:s', Date.parse('+'+$method_country[0].delivery_within+' day',Date.parse($time) / 1000) / 1000 ) ) / 1000;
                                                    $cutoff_time = d.getTime() + ($method_vendor[0].delivery_within * 24 * 60 * 60 * 1000);

                                                    return $cutoff_time;
                                                    exit;

                                                } else {
                                                    $stoppage_hour = $province[0].stoppage_hour;
                                                    $stoppage_minute = $province[0].stoppage_minute;

                                                    $time = $stoppage_hour + ':' + $stoppage_minute + ':00';
                                                    $cutoff_time = Date.parse(date('Y-m-d H:i:s', Date.parse('+1 day', Date.parse($time) / 1000) / 1000)) / 1000;

                                                    return $cutoff_time;
                                                    exit;
                                                }

                                            }
                                        });
                                        ///$current_time     = strtotime(date('Y-m-d H:i:s'));

                                        //$seconds    = $cutoff_time - $current_time;
                                        //$hours      = floor($seconds / 3600);
                                       // $mins       = floor(($seconds - ($hours*3600)) / 60);

                                        //$stoppage_hour      = $hours;
                                       // $stoppage_minute    = $mins;
                                    }
                                }
                            });
                        }
                        //$stoppage_hour = $province[0]->stoppage_hour;
                       // $stoppage_minute = $province[0]->stoppage_minute;
                    }
                }
            });

        }
    });


    $stoppageTime = '';
    if ($stoppage_hour < 10) {
        $stoppage_hour = '0' + $stoppage_hour;
    }
    if ($stoppage_minute < 10) {
        $stoppage_minute = '0' + $stoppage_minute;
    }
    $stoppageTime = $stoppage_hour + ':' + $stoppage_minute + ':59';

    return Date.parse($stoppageTime) / 1000;
}*/

function getCustomDeliveryDate($currencydetails, $product_code, $productSku, $zipCode, $currentCountry, callback) {
    if (!$productSku && !$zipCode) return callback(false);
    var $params = {};
    var $productSku = $zipCode = '';
    var $deliveryCalendar = 'NotFoundProductSku';
    var $result = false;
    commonHelper.countrycode($currentCountry, function(err, res) {
        if (err) callback(err);
        else {
            $curlData = {
                "getDlvrCalRequest": {
                    "partnerId": "123",
                    "customerId": config.atlas_order.customer_id,
                    "customerType": config.atlas_order.customer_type,
                    "country": "USA",
                    //            "country" : res[0].iso_code,
                    "deliveryDate": "",
                    "locationType": "1",
                    "productSku": "1120RD",
                    //            "productSku" : $productSku,
                    "backupSku": "",
                    "backupSkuBrandCode": "",
                    "siteId": config.atlas_order.site_id,
                    "startDate": "",
                    "sourceSystem": config.atlas_order.source_system,
                    "zipCode": "11514",
                    //            "zipCode" : $zipCode,
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
    });


}


/*function getDeliveryCalendar($params){
    $curlData = {
        "getDlvrCalRequest" : {
            "partnerId" : "123",
            "customerId" : config.atlas_order.customer_id,
            "customerType": config.atlas_order.customer_type,
            "country" : "USA",
//            "country" : $params.country,
            "deliveryDate" : "",
            "locationType": "1",
            "productSku" : "1120RD",
//            "productSku" : $params.productSku,
            "backupSku" : "",
            "backupSkuBrandCode" : "",
            "siteId" : config.atlas_order.site_id,
            "startDate" : "",
            "sourceSystem" : config.atlas_order.source_system,
            "zipCode" : "11514",
//            "zipCode" : $params.zipCode,
            "brandCode" : config.atlas_order.brand_code
        }
    };
    $curlData = JSON.stringify($curlData);         
    $getResult = _executeCommonCurl(config.atlas_order.get_delivery_calendar_url, $curlData, 'getDeliveryCalendar');  
    console.log("getResult---"+$getResult);
    return $getResult;
}

 function _executeCommonCurl($curlUrl, $curlData, $hitFile){
        //$Authorization = 'Bearer ' + base64.encode(config.atlas_order.client_id + ':' + config.atlas_order.client_secret);
        // Set the headers
        var headers = {
           // 'Authorization': $Authorization,
           // 'SOAPAction': $hitFile,
            'Content-Type':'application/json',
            'X-IBM-Client-Id':config.atlas_order.client_id,
            'X-IBM-Client-Secret':config.atlas_order.client_secret
            //'Accept-Language:en-US'
        }

        // Configure the request
        var options = {
            url: $curlUrl,
            method: 'POST',
            headers: headers,
            body: $curlData
        }
        //console.log(options);
        // Start the request
        request(options, function (error, response, body) {
             
            if (response.statusCode == 200) {
                 response=JSON.parse(JSON.stringify(response));
                 body=JSON.parse(body);
                 responseStatus=body["getDlvrCalResponse"]["responseStatus"];
                if(responseStatus=='SUCCESS'){
                    flwsError=body["getDlvrCalResponse"]["getDlvrCalResult"]["flwsErrors"]["flwsError"];  
                    if(flwsError.length) return flwsError;
                    else {
                        dlvrCalDeliveryDates=body["getDlvrCalResponse"]["getDlvrCalResult"]["dlvrCalDeliveryDates"]["dlvrCalDeliveryDate"];
                    }
                }
                console.log(dlvrCalDeliveryDates);
                return dlvrCalDeliveryDates;
            } 
            else return false;
        });

}*/





/*function getCurrentDateTimeForCountry($province_id=null,$country_id,callback)
{
    if($province_id == '' || $province_id == null ) {
        $sql='Select * from `provinces` where `country_id` = '+$country_id;
    }else{
        $sql='Select * from `provinces` where `country_id` = '+$country_id+' and `id` = '+$province_id;
    }
    //console.log('$sql-'+$sql);
    dbModel.rawQuery($sql, function(err, $provinces) {
           if (err) callback(err);
           else{
                //console.log('$provinces-'+$provinces);
                if ($provinces.length) {
                    $timezone = $provinces[0].timezone;
                    $timezone = $timezone.trim();
                } else {
                    //$timezone = date_default_timezone_get();
                }
                console.log('$timezone-'+$timezone);
                /*date_default_timezone_set($timezone);
                
                $date_time  = language(date("l"))+", ".language(date("M"))+ date(" d h:i a");
                $date_time  = explode(' ', $date_time);
                if($date_time !='' && $date_time[3] != null){
                    $date_time[3]   = ltrim($date_time[3], '0');                    
                    $date_time      = implode(' ', $date_time);
                    return $date_time;
                }else{
                    return language(date("l"))+", "+language(date("M"))+ date(" d h:i a");
                }
            }
    });         

}*/
/*function getCurrentDateTime($province_id)
{
    $sql='select * from `provinces` where (`id` = '+$province_id+' and `status` = 1)';
    $province ='';
    //Province::with('timezone')->where(array('id' => $province_id, 'status' => 1))->get();
    $timezone = trim($province[0].timezone.timezone);
    date_default_timezone_set($timezone);
    
    //$date_time = date("l, M d h:i a");
    $date_time = language(date("l"))+", "+language(date("M"))+ date(" d h:i a");
    $date_time  = explode(' ', $date_time);
         
    if(sizeof($date_time) && isset($date_time[3])){
        $date_time[3]   = ltrim($date_time[3], '0');
        
        $date_time      = implode(' ', $date_time);
        return $date_time;
    }else{
        return language(date("l"))+", "+language(date("M"))+ date(" d h:i a");
    }
    
}*/

/*function getCurrencyDetails($currency_id = null, $country_id, callback) {

    // Get price details from currency tables by country
    var sql = "SELECT c.* FROM country_list cl LEFT JOIN currency c ON(cl.preferred_currency_id = c.id) WHERE cl.id = " + $country_id + " AND c.status = 1";

    //console.log(sql);

    dbModel.rawQuery(sql, function(err, currency_result) {
        if (err) return callback(err);
        else if (currency_result.length > 0) {
            callback(null, currency_result);

        } else {

            // If Preferred Currency Id not found for selected country then Use selected Currency Rate
            var $sql = "SELECT * from `currency` WHERE id = " + $currency_id;

            dbModel.rawQuery($sql, function(err, currency_result) {
                if (err) return callback(err);
                else
                    callback(null, currency_result);

            });
        }
    });

}*/

module.exports = new ProductController();
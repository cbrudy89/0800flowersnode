var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var async = require('async');
var config = require('./../../config');
var connection = require('./../../database');
var dbModel = require('./../models/db-model');
var commonHelper = require('./../helpers/common-helper');
var request = require('request');
var Sync = require('sync');

function ProductController() {

  this.productdetails  = function(req, res) {
  		var return_data = {};
  		var $slug = req.body.slug;
        var $sessLang = req.body.language_id;
        var $currentCountry = req.body.country_id;
        var $province_id = req.body.province_id;
        var $postalcode=req.body.postalcode;
        var $currency_id=req.body.currency_id;

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
					                Sync(function(){					                	
					                	$currenydetails=getCurrencyDetails.sync(null, $currency_id = null, $currentCountry);
						                $resAtlasDDOrg=getCustomDeliveryDate.sync(null,$currenydetails,$product[0].product_code, $product[0].sku, $postalcode, $currentCountry);

						                $resAtlasDDOrg=getSurchargeConverted.sync(null,$resAtlasDDOrg);
						                 //console.log($resAtlasDDOrg);
						                if($resAtlasDDOrg != 'undefined'){
						                    if($resAtlasDDOrg.deliveryCalendar && $resAtlasDDOrg.deliveryCalendar.dateArray) {
						                        $AtlasDate  = $resAtlasDDOrg.deliveryCalendar.dateArray;
						                    }
						                }

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
					                
					                	var $delivery_method_id = $product[0].delivery_method_id;
					                	$sql ="Select * from `method_vendor` where `method_id` = "+$delivery_method_id+" and ";
					                	$sql +="`vendor_id` = "+$vendorId+" limit 1";

					                	$productMethod = productMethod.sync(null, $sql, $delivery_method_id);

					                	if ($province_id != undefined && $province_id != '') {
					                		$stoppage_time = stoppageTimePart.sync(null,null, $province_id);
                                          //  $currentTime = getCurrentDateTime($province_id);
                                        } else {
                                            $stoppage_time = stoppageTimePartForCountry.sync(null,null, $currentCountry);
                                            //$currentTime = getCurrentDateTimeForCountry.sync(null,null, $currentCountry);
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





								        ///////////////////////////////////////////////////////////////////////////// 
								        //Check Today Date
								        var d=new Date();
								        $todayAnchorId = currentformatted_date("d-m-Y");
								        var formatter = new Intl.DateTimeFormat("en", { month: "short" }),
										$todayDate =formatter.format(d)+' '+d.getDate();
										//$today = strtoupper(date("M jS"));
								        $todayIsSaturday = d.getDay();
										
								        // $todaySurcharge = checkCalSurcharge(date('Y-m-d'), $product->vendor_id, Session::get('delivery_to')['country_id'],$product->id); 
								        $admCalSurcharge_ctd = checkCalSurcharge.sync(null, $todayAnchorId, $vendorId, $currentCountry, $product[0].id);
								        
								        $todayExtraCharge = getSurcharge.sync(null,$product[0].id, $currentCountry, $vendorId);
								        if ($admCalSurcharge_ctd !== false) {
								            $todayExtraCharge = Number($todayExtraCharge)+Number($admCalSurcharge_ctd);
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
								        //Check Today Is Restrict Date Or Not
								        //----------------------------------- 
								        $checkTodayEnableDate = checkTodayEnable($todayAnchorId, $productMethod[0].delivery_days, $productMethod[0].delivery_within, $vendorId, $currentCountry, $product[0].id, $stoppage_time, $AtlasDate);
								        if ($checkTodayEnableDate === false) {
								            $todayRestrict = 'yes';
								        } else {
								            $todayRestrict = 'no';
								        }
										
								        //if today is unavailable then use it for first date
								        $todayEnableDate    = currentformatted_date("d-m-Y");
								        /*if($todayRestrict == 'yes'){
								            $firstEnableDate = getNextEnableDate('', $productMethod[0].delivery_days, $productMethod[0].delivery_within, $vendorId, $currentCountry, $product[0].id, $stoppage_time, $AtlasDate);
								        }else{
								            $firstEnableDate    = $todayEnableDate;
								        }*/
										/*
								        $admCalSurcharge_cndd = checkCalSurcharge(date('Y-m-d', strtotime($firstEnableDate)), $product->vendor_id, Session::get('delivery_to')['country_id'], $product->id);
								        $firstExtraCharge = getSurcharge($product->id, Session::get('delivery_to')['country_id'], $product->vendor_id);
								        if ($admCalSurcharge_cndd !== false) {
								            $firstExtraCharge += $admCalSurcharge_cndd;
								        }
								        $firstIsSaturday = date('w', strtotime($firstEnableDate));
								        //Check Next day Surcharge
								        //------------------------
								        if ($firstExtraCharge !== false) {
								            if ($firstIsSaturday == 6) {
								                $firstExtraCharge += Config::get('constants.saturday_charge');
								            }
								        } else {
								            $firstExtraCharge = '0.00';
								        }
								        //Check Next Day Date
								        //-------------------   
								        $nextEnableDate = getNextEnableDate($firstEnableDate, json_decode($productMethod->delivery_days), $productMethod->delivery_within, $product->vendor_id, Session::get('delivery_to')['country_id'], $product->id, $stoppage_time, $AtlasDate);

								        $nextToNextEnableDate = getNextEnableDate($nextEnableDate, json_decode($productMethod->delivery_days), $productMethod->delivery_within, $product->vendor_id, Session::get('delivery_to')['country_id'], $product->id, $stoppage_time, $AtlasDate);

								        $nextIsSaturday = date('w', strtotime($nextEnableDate));
								        // $nextSurcharge = checkCalSurcharge(date('Y-m-d', strtotime($nextEnableDate)), $product->vendor_id, Session::get('delivery_to')
								          ['country_id'], $product->id); 

								        $admCalSurcharge_cndd = checkCalSurcharge(date('Y-m-d', strtotime($nextEnableDate)), $product->vendor_id, Session::get('delivery_to')['country_id'], $product->id);
								        $nextExtraCharge = getSurcharge($product->id, Session::get('delivery_to')['country_id'], $product->vendor_id);
								        if ($admCalSurcharge_cndd !== false) {
								            $nextExtraCharge += $admCalSurcharge_cndd;
								        }

								        //Check Next day Surcharge
								        //------------------------
								        if ($nextExtraCharge !== false) {
								            if ($nextIsSaturday == 6) {
								                $nextExtraCharge += Config::get('constants.saturday_charge');
								            }
								        } else {
								            $nextExtraCharge = '0.00';
								        }

								        //Check Next day Is Restrict Date Or Not
								        //--------------------------------------
								        $nextDay = strtotime(date('Y-m-d') . "+1 days");

								        if (checkIsDateRestrict(date('Y-m-d', $nextDay), $product->vendor_id, Session::get('delivery_to')['country_id'], $product->id) === true) {
								            $nextRestrict = 'yes';
								        } elseif (checkIsDaydisable(json_decode($productMethod->delivery_days), date('w', $nextDay)) === true) {
								            $nextRestrict = 'yes';
								        } elseif (checkIsDateHoliday(date('Y-m-d', $nextDay), $product->vendor_id, Session::get('delivery_to')['country_id']) === true) {
								            $nextRestrict = 'yes';
								        } else {
								            $date_according_atlas           = date('j-F-y', strtotime($nextDay));
								            $date_according_atlas_arr       = explode('-', $date_according_atlas);
								            $date_according_atlas_arr[1]    = strtoupper($date_according_atlas_arr[1]);
								            $date_according_atlas           = implode($date_according_atlas_arr, '-');

								            if(!empty($AtlasDate) && sizeof($AtlasDate)){
								                if (in_array($date_according_atlas, $AtlasDate) ) {
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
								        $datIsSaturday = date('w', strtotime($nextToNextEnableDate));

								        // $datSurcharge = checkCalSurcharge(date('Y-m-d', strtotime($nextToNextEnableDate)), $product->vendor_id, Session::get
								          ('delivery_to')['country_id'], $product->id); 
								        $admCalSurcharge_cdatd = checkCalSurcharge(date('Y-m-d', strtotime($nextToNextEnableDate)), $product->vendor_id, Session::get('delivery_to')['country_id'], $product->id);
								        $datExtraCharge = getSurcharge($product->id, Session::get('delivery_to')['country_id'], $product->vendor_id);
								        if ($admCalSurcharge_cdatd !== false) {
								            $datExtraCharge += $admCalSurcharge_cdatd;
								        }

								        //Check Day After Tomorrow Surcharge
								        //------------------------
								        if ($datExtraCharge != false) {
								            if ($datIsSaturday == 6) {
								                $datExtraCharge += Config::get('constants.saturday_charge');
								            }
								        } else {
								            $datExtraCharge = '0.00';
								        }

								        // For Related Products
								        // --------------------
								        $relatedProductsData = array();
								        if ($product->relatedproduct):
								            $counter = 0;
								            foreach ($product->relatedproduct as $relProd):
								                //if ($counter < 4):
								                if (Session::get('delivery_to')['show_state'] == 1) {
								                    $productlocation = new ProductLocation;
								                    $counts = $productlocation->product_province_check(Session::get('delivery_to')['country_id'], Session::get('delivery_to')['province_id'], $relProd->related_product_id);
								                    if ($counts > 0) {
								                        $prds = relatedProductDetails($relProd->related_product_id, $sessLang);
								                        $relatedProductsData[] = $prds;
								                    }
								                } else {
								                    $prds = relatedProductDetails($relProd->related_product_id, $sessLang);
								                    $relatedProductsData[] = $prds;
								                }
								                //endif;
								                $counter++;
								            endforeach;
								        endif;

								        //To check if related product not associated              
								        if (!sizeof($relatedProductsData)) {
								            $productList = array();
								            $productList = $product->getProductlistwithcountry(Session::get('delivery_to')['country_id'], Session::get('delivery_to')['province_id'], 'products.id', 6);
								            foreach ($productList as $list) {//echo "<pre>";print_r($list->id);die;
								                $prds = relatedProductDetails($list->id, $sessLang);
								                $relatedProductsData[] = $prds;
								            }
								        }
								        //End to check if relatated product not associated

								        ////////////////// Recent viewed product Functionality //////////////////////////////
								        $country_id = Session::get('delivery_to')['country_id'];
								        $recent_views = array();
								        $val = array();

								        if (isset($_COOKIE['recent_view'])) {
								            $val = unserialize($_COOKIE['recent_view']);
								        }

								        if (sizeof($val)) {
								            if (is_array($val)) {
								                $recent_views = $val;

								                if (array_key_exists($country_id, $recent_views)) {
								                    if (!in_array($product->id, $val[$country_id]))
								                        $recent_views[$country_id][] = $product->id;
								                }else {
								                    $recent_views[$country_id][] = $product->id;
								                }
								            } else {
								                $recent_views[$country_id][] = $product->id;
								            }
								        } else {
								            $recent_views[$country_id][] = $product->id;
								        }

								        setcookie('recent_view', serialize($recent_views));

								        //////////////////////// End Recent viewed product Functionality //////////////////////////
								        if (isset($_COOKIE['recent_view'])) {
								            $recent_views = unserialize($_COOKIE['recent_view']);
								            $recent_views = $recent_views[$country_id];
								        } else {
								            if (isset($recent_views[$country_id])) {
								                $recent_views = $recent_views[$country_id];
								            } else {
								                $recent_views = array();
								            }
								        }

								        if (!in_array($product->id, $recent_views)) {
								            $recent_views[] = $product->id;
								        } else {
								            $recent_views_key = array_search($product->id, $recent_views);
								            unset($recent_views[$recent_views_key]);
								            $recent_views[] = $product->id;
								        }


								        $recents = array();
								        $k = 0;
								        if (sizeof($recent_views)) {
								            krsort($recent_views);
								            foreach ($recent_views as $key => $value) {
								                $recents[$k] = relatedProductDetails($value, $sessLang);
								                $k++;
								            }
								        }*/
						                
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

/**
 * Date to timestamp
 * @param  string template
 * @param  string date
 * @return string
 * @example         datetotime("d-m-Y", "26-02-2012") return 1330207200000
 */
function datetotime(template, date){
    date = date.split( template[1] );
    template = template.split( template[1] );
    date = date[ template.indexOf('m') ]
        + "/" + date[ template.indexOf('d') ]
        + "/" + date[ template.indexOf('Y') ];

    return (new Date(date).getTime());
}
//////"d-m-Y"
function currentformatted_date(template, adddays=0){
    var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+adddays; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
	    dd = '0'+dd
	} 
	if(mm<10) {
	    mm = '0'+mm
	} 
	if(template=='d-m-Y') return dd + '-' + mm + '-' + yyyy;
	if(template=='Y-m-d') return yyyy + '-' + mm + '-' + dd;
}

function getSurchargeConverted($resAtlasDDOrg, callback){


	// if ($resAtlasDDOrg.totSurcharge == '0.0') {
    //    $totSurcharge = $item.totSurcharge;
   // } else {
   //     $totSurcharge = number_format(currency(urlencode('USD'), urlencode('CAD'), $item.totSurcharge), 2);
			/*var options = {
		        url: "http://www.google.com/finance/converter?a="+$amount+"&from=USD&to=CAD",
		        method: 'POST'
		    }
		    // Start the request
		    request(options, function (error, response, data) {	
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
		        console.log(result[1]);
		    });*/
   // }
}

function checkCalSurcharge($date, $vendor_id, $country_id, $product_id,callback)
{
    	$sql="SELECT `surcharge_calendars`.`id`, `surcharge_calendars`.`vendor_id`, `surcharge_calendars`.`country_id`, `surcharge_calendars`.`start_date`, `surcharge_calendars`.`surcharge`";
    	$sql +=" FROM `surcharge_calendars`";
    	$sql +=" INNER JOIN `product_surcharge_calendar` on `product_surcharge_calendar`.`surcharge_calendar_id` = `surcharge_calendars`.`id`";
    	$sql +=" WHERE `surcharge_calendars`.`vendor_id` = "+$vendor_id;
    	$sql +=" AND `surcharge_calendars`.`start_date` = '"+$date+"'";
    	$sql +=" AND `surcharge_calendars`.`country_id` = "+$country_id;
    	$sql +=" AND `product_surcharge_calendar`.`product_id` = "+$product_id;
    	$sql +=" AND `surcharge_calendars`.`status` = 1";    	
    	dbModel.rawQuery($sql, function(err, $surchargeCalDate) {
            if (err) return callback(err);
			else{
				if ($surchargeCalDate.length > 0) callback(null, $surchargeCalDate[0].surcharge); 
				else return callback(null,false);               
            }
    	});	    
}

function getSurcharge($product_id, $country_id, $vendor_id, callback){
    $surcharge = false;
    $sql="SELECT `id`, `admin_confirm`, `surcharge` FROM `products` WHERE `id` = "+$product_id+" AND `admin_confirm` = 1";
    dbModel.rawQuery($sql, function(err, $productSurcharge) {
            if (err) return callback(err);
			else{
				if($productSurcharge.length > 0 && $productSurcharge[0].surcharge > 0){
				    callback(null, formatPrice($productSurcharge[0].surcharge));
				}else{
				    $sql="SELECT `id`, `status`, `surcharge` FROM `vendor` WHERE `id` = "+$vendor_id+" AND `status` = 1";
					dbModel.rawQuery($sql, function(err, $vendorSurcharge) {
			            if (err) return callback(err);
						else{
							if($vendorSurcharge.length > 0 && $vendorSurcharge[0].surcharge > 0){ 
								callback(null, $vendorSurcharge[0].surcharge); 
							}
							else {
					        	$sql="SELECT `id`, `status`, `surcharge` FROM `country_list` WHERE `id` = "+$country_id+" AND `status` = 1";
					        	dbModel.rawQuery($sql, function(err, $countrySurcharge) {
						            if (err) return callback(err);
									else{
										if ($countrySurcharge.length > 0) callback(null, formatPrice($countrySurcharge[0].surcharge)); 
										else return callback(null,false);               
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

function formatPrice($price)
{
    if ($price !='') {
        return $price.toFixed(2);
    } else {
        return '0.00';
    }
}

function checkTodayEnable($checkCalDate, $delivery_days, $delivery_within, $vendor_id, $country_id, $product_id, $stoppage_time, $AtlasDate = '')
{

    var d=new Date();
	$dayNum = d.getDay()+1;

	var hours = d.getHours();
	var minutes = d.getMinutes();
	var seconds = d.getSeconds();
	var time=hours + ":" + minutes + ":" + seconds;
    //$wdayNum = date('D', strtotime($checkCalDate));

    /*if (date('H:i:s') < $stoppage_time) {
        $todayEnable = TRUE;
    } else {
        $todayEnable = FALSE;
    }*/
	
	var monthNames=config.months_short;

    if (checkIsDateRestrict($checkCalDate, $vendor_id, $country_id, $product_id) === false &&
        checkIsDateHoliday($checkCalDate, $vendor_id, $country_id) === false
    ) {

        if ($delivery_days.indexOf($dayNum) && (time < $stoppage_time) && $delivery_within == 0) {

            //$date_according_atlas           = date('j-F-y', strtotime($checkCalDate));
            $date_according_atlas_arr       = $checkCalDate.split('-');
            $date_according_atlas_arr[1]    = monthNames[$date_according_atlas_arr[1]].toUpperCase();
            $date_according_atlas           = $date_according_atlas_arr.join("-");

            if($AtlasDate.length > 0 && $AtlasDate){
                if ($date_according_atlas.indexOf($AtlasDate)) {
                        $enable = true;
                }else{
                    $enable = false;
                }
            }else{
                $enable = false;
            }
            
        } else {
            $enable = false;
        }
    } else {
        $enable = false;
    }
    return $enable;
}

/* For currunt date is a restict day or not  */

function checkIsDateRestrict($date, $vendor_id, $country_id, $product_id)
{
	$sql="SELECT `restrict_calendar_dates`.`id`, `restrict_calendar_dates`.`vendor_id`, `restrict_calendar_dates`.`start_date`"; 
	$sql +=" FROM `restrict_calendar_dates`"; 
	$sql +=" INNER JOIN `product_restrict_calendar_date` on `product_restrict_calendar_date`.`restrict_calendar_date_id` = `restrict_calendar_dates`.`id`"; 
	$sql +=" WHERE `restrict_calendar_dates`.`vendor_id` = "+$vendor_id+""; 
	$sql +=" AND `restrict_calendar_dates`.`start_date` = '"+$date+"'"; 
	$sql +=" AND `restrict_calendar_dates`.`country_id` = "+$country_id+""; 
	$sql +=" AND `product_restrict_calendar_date`.`product_id` = "+$product_id+""; 
	$sql +=" AND `restrict_calendar_dates`.`status` = 1";
    
    dbModel.rawQuery($sql, function(err, $restrictCalDate) {
        if (err) return err;
		else{
			if ($restrictCalDate.length > 0) {
		        return true;
		    } else {
		        return false;
		    }            
        }
	});	     
}

/* For currunt date  is not a holiday   */

function checkIsDateHoliday($date, $vendor_id, $country_id)
{
    
	$sql="SELECT `holidays`.`id`, `holidays`.`holiday_name`, `holidays`.`holiday_date`, `holidays`.`vendor_id`"; 
	$sql +="  FROM `holidays`"; 
	$sql +="  INNER JOIN `country_holiday` on `country_holiday`.`holiday_id` = `holidays`.`id`"; 
	$sql +="  WHERE `holidays`.`vendor_id` = "+$vendor_id; 
	$sql +="  AND `holidays`.`holiday_date` = '"+$date+"'"; 
	$sql +="  AND `country_holiday`.`country_id` = "+$country_id; 
	$sql +="  AND `holidays`.`status1` = 1";
    dbModel.rawQuery($sql, function(err, $getHolidayRecord) {
        if (err) return err;
		else{
			if ($getHolidayRecord.length > 0) {
		        return true;
		    } else {
		        return false;
		    }            
        }
	});
}


/*function getNextEnableDate($checkCalDate='',$delivery_days,$delivery_within,$vendor_id,$country_id, $product_id, $stoppage_time, $AtlasDate = '')
{

    $dwCounter = 0;
	//var d=new Date();
	//$dayNum = d.getDay()+1;



    if ($checkCalDate == '') {
        $nextDay = Date.parse(currentformatted_date('Y-m-d', 1)) / 1000;
        $checkCalDate = date('Y-m-d', $nextDay);
        $dayNum = date('w', strtotime($checkCalDate));
        $wdayNum = date('D', strtotime($checkCalDate));
    } else {
        $delivery_within = 1;//for nextToNext checking
        $nextDay = strtotime($checkCalDate + "+1 days");
        $checkCalDate = date('Y-m-d', $nextDay);
        $dayNum = date('w', strtotime($checkCalDate));
        $wdayNum = date('D', strtotime($checkCalDate));
    }

    if (date('H:i:s') < $stoppage_time) {
        $todayEnable = TRUE;
    } else {
        if ($delivery_within == 0) {
            $nextDay = strtotime(date('Y-m-d') . "+1 days");
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
                $nextDay = strtotime($checkCalDate . "+1 days");
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
                
                $nextDay = strtotime($checkCalDate . "+1 days");
                $checkCalDate = date('Y-m-d', $nextDay);
                $dayNum = date('w', $nextDay);
                $wdayNum = date('D', $nextDay);
            }
        }
    }

}*/
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

function stoppageTimePartForCountry($vendor_id = null,$country_id,  callback)
{
    var d = new Date();
    var $current_hour = d.getHours();
    var $current_minute = d.getMinutes();
    var $stoppageTime = $stoppage_hour= $stoppage_minute='';
    if ($vendor_id != null && $vendor_id != '')  {
        $sql='Select * from `group_vendor` where (`country_id` = '+$country_id+' and `vendor_id` = '+$vendor_id+')';
    } else {
        $sql  ='Select * from `group_vendor` ';
        $sql +='inner join `vendor` on `vendor`.`id` = `group_vendor`.`vendor_id` ';
        $sql +='where `country_id` = '+$country_id+' and `vendor`.`status` = 1 and ';
        $sql +='`stoppage_hour` >= '+$current_hour+' and (`group_vendor`.`stoppage_hour` > '+$current_hour+' or ';
        $sql +='`group_vendor`.`stoppage_minute` >= '+$current_minute+') order by `stoppage_hour` asc, `stoppage_minute` asc';         
    }
    dbModel.rawQuery($sql, function(err, $country_group_vendor) {
           if (err) callback(err);
           else{
           		//console.log($country_group_vendor);
           		$sql  ='Select * from `provinces` inner join `timezones` on `timezones`.`id` = `provinces`.`timezone_id` ';
           		$sql +='where `country_id` = '+$country_id;
                dbModel.rawQuery($sql, function(err, $country) {
			          if (err) callback(err);
           			  else{
			            if($country.length > 0){						                
			                 if($country_group_vendor.length > 0){
								if ($vendor_id != undefined && $vendor_id != '')  {
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
			                    if( ($vendor_id != null && $vendor_id != '')  || $country[0].stoppage_hour >= $current_hour && ($country[0].stoppage_hour > $current_hour || $country[0].stoppage_minute >= $current_minute) ){
			                        $stoppage_hour = $country[0].stoppage_hour;
			                        $stoppage_minute = $country[0].stoppage_minute;
			                    }else {
			                        $sql ='Select `group_vendor`.`stoppage_hour`, `group_vendor`.`stoppage_minute`, `method_vendor`.`delivery_within` from `group_vendor` ';
			                        $sql +='INNER JOIN `method_vendor` on `method_vendor`.`vendor_id` = `group_vendor`.`vendor_id` ';
			                        $sql +='INNER JOIN `vendor` on `vendor`.`id` = `group_vendor`.`vendor_id` where `country_id` = '+$country_id+' and ';
			                        $sql +='`vendor`.`status` = 1 order by `method_vendor`.`delivery_within` asc, `stoppage_hour` asc, `stoppage_minute1` asc limit 1';
			                        //////////////
					               dbModel.rawQuery($sql, function(err, $method_vendor) {
								          if (err) callback(err);
           								  else{
					                        if($method_vendor.length){
					                            $stoppage_hour      = $method_vendor[0].stoppage_hour;
					                            $stoppage_minute    = $method_vendor[0].stoppage_minute;
					                            $time               = $stoppage_hour + ':' + $stoppage_minute + ':00';
					                            
					                            if($method_vendor[0].delivery_within == 0){
					                                $method_vendor[0].delivery_within   = 1;
					                            }
					                            $cutoff_time = Date.parse( date('Y-m-d H:i:s', Date.parse('+'+$method_vendor[0].delivery_within+' day',Date.parse($time) / 1000) / 1000 ) ) / 1000;
					                    
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
					                            dbModel.rawQuery($sql, function(err, $method_country) {
											        if (err) callback(err);
           											else{					                            
							                            if($method_country.length){
							                                $stoppage_hour      = $method_country[0].stoppage_hour;
							                                $stoppage_minute    = $method_country[0].stoppage_minute;
							                                $time               = $stoppage_hour + ':' + $stoppage_minute + ':00';
							                            
							                                if($method_country[0].delivery_within == 0){
							                                    $method_country[0].delivery_within  = 1;
							                                }
							                            
							                                $cutoff_time        = Date.parse( date('Y-m-d H:i:s', Date.parse('+'+$method_country[0].delivery_within+' day',Date.parse($time) / 1000) / 1000 ) ) / 1000;
							                            
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
							                     });
					                        }
					                      }
					                });
					                }
			                    }
			                }  
			                }  
			             });
			                    /*if (sizeof($country)) {
			                        $stoppage_hour = $country[0]->stoppage_hour;
			                        $stoppage_minute = $country[0]->stoppage_minute;
			                    } else {
			                        $stoppage_hour = 0;
			                        $stoppage_minute = 0;
			                    }*/

                if ($stoppage_hour < 10) {
                    $stoppage_hour = '0' . $stoppage_hour;
                }

                if ($stoppage_minute < 10) {
                    $stoppage_minute = '0' . $stoppage_minute;
                }

                $stoppageTime = $stoppage_hour + ':' + $stoppage_minute + ':59';
                
                return callback(null,Date.parse($stoppageTime) / 1000);                   
            }
     }); 

}

function stoppageTimePart($vendor_id = null,$province_id,  callback)
{
    var d = new Date();
    var $current_hour = d.getHours();
    var $current_minute = d.getMinutes();

    if ($vendor_id !=null && $vendor_id != '') {
        $sql='Select * from `provinces` inner join `group_vendor` on `group_vendor`.`timezone_id` = `provinces`.`timezone_id` inner join `timezones` on `timezones`.`id` = `provinces`.`timezone_id` where (`provinces`.`id` = '+$province_id+' and `provinces`.`status` = 1 and `group_vendor`.`vendor_id` = '+$vendor_id+') group by `provinces`.`timezone_id`';        
    } else {
        $sql='select `group_vendor`.`stoppage_hour`, `group_vendor`.`stoppage_minute` from `provinces` inner join `group_vendor` on `group_vendor`.`timezone_id` = `provinces`.`timezone_id` inner join `timezones` on `timezones`.`id` = `provinces`.`timezone_id` inner join `vendor` on `vendor`.`id` = `group_vendor`.`vendor_id` where (`provinces`.`id` = '+$province_id+' and `provinces`.`status` = 1) and `group_vendor`.`stoppage_hour` >= '+$current_hour+' and `vendor`.`status` = 1 and (`group_vendor`.`stoppage_hour` > '+$current_hour+' or `group_vendor`.`stoppage_minute` >= '+$current_minute+') order by `group_vendor`.`stoppage_hour` asc, `group_vendor`.`stoppage_minute` asc';
    }
    dbModel.rawQuery($sql, function(err, $country_group_vendor) {
       if (err) callback(err);
       else{
    		$sql='select * from `provinces` inner join `timezones` on `timezones`.`id` = `provinces`.`timezone_id` where (`provinces`.`id` = '+$province_id+' and `status` = 1)';	
    		dbModel.rawQuery($sql, function(err, $province) {
		       if (err) callback(err);
		       else{
					   // console.log($province_group_vendor);					    
					    if ($province_group_vendor.length && $province_group_vendor[0].length) {
					        if ($vendor_id!=null && $vendor_id != '') {
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
					        if( ($vendor_id!=null && $vendor_id != '') || $province[0].stoppage_hour >= $current_hour && ($province[0].stoppage_hour > $current_hour || $province[0].stoppage_minute >= $current_minute) ){
					            $stoppage_hour = $province[0].stoppage_hour;
					            $stoppage_minute = $province[0].stoppage_minute;
					        }else{
					            $sql='Select `group_vendor`.`stoppage_hour`, `group_vendor`.`stoppage_minute`, `method_vendor`.`delivery_within` from `provinces` INNER JOIN `group_vendor` on `group_vendor`.`timezone_id` = `provinces`.`timezone_id` inner join `timezones` on `timezones`.`id` = `provinces`.`timezone_id` INNER JOIN `method_vendor` on `method_vendor`.`vendor_id` = `group_vendor`.`vendor_id` INNER JOIN `vendor` on `vendor`.`id` = `group_vendor`.`vendor_id` where (`provinces`.`id` = '+$province_id+' and `provinces`.`status` = 1) and `vendor`.`status` = 1 order by `method_vendor`.`delivery_within` asc, `group_vendor`.`stoppage_hour` asc, `group_vendor`.`stoppage_minute` asc limit 1';
						           dbModel.rawQuery($sql, function(err, $country_group_vendor) {
							       if (err) callback(err);
							       else{
							            if($method_vendor.length){
							                $stoppage_hour      = $method_vendor[0].stoppage_hour;
							                $stoppage_minute    = $method_vendor[0].stoppage_minute;
							                $time               = $stoppage_hour + ':' + $stoppage_minute + ':00';

							                if($method_vendor[0].delivery_within == 0){
							                    $method_vendor[0].delivery_within   = 1;
							                }
							               // $cutoff_time		= strtotime( date('Y-m-d H:i:s', strtotime('+'.$method_vendor['delivery_within'].' day',strtotime($time)) ) );
							                //$cutoff_time = Date.parse( date('Y-m-d H:i:s', Date.parse('+'+$method_vendor[0].delivery_within+' day',Date.parse($time) / 1000 ) / 1000 ) ) / 1000;

							                $cutoff_time = d.getTime() + ($method_vendor[0].delivery_within * 24 * 60 * 60 * 1000)+ (Date.parse($time) / 1000);

							                return $cutoff_time;
							                exit;

							            }else{
							                $sql='Select `timezones`.`stoppage_hour`, `timezones`.`stoppage_minute`, `methods`.`delivery_within` from `provinces` INNER JOIN `timezones` on `timezones`.`id` = `provinces`.`timezone_id` INNER JOIN `location_product` on `location_product`.`province_id` = `provinces`.`id` inner join `products` on `products`.`id` = `location_product`.`product_id` INNER JOIN `methods` on `methods`.`id` = `products`.`delivery_method_id` inner join `vendor` on `vendor`.`id` = `products`.`vendor_id` where (`provinces`.`id` = '+$province_id+' and `provinces`.`status` = 1) and `vendor`.`status` = 1 order by `methods`.`delivery_within` asc, `timezones`.`stoppage_hour` asc, `timezones`.`stoppage_minute` asc limit 1';
								                //$method_country =
								               dbModel.rawQuery($sql, function(err, $method_country) {
											       if (err) callback(err);
											       else{
										                if($method_country.length){
										                    $stoppage_hour      = $method_country[0].stoppage_hour;
										                    $stoppage_minute    = $method_country[0].stoppage_minute;
										                    $time               = $stoppage_hour + ':' + $stoppage_minute + ':00';

										                    if($method_country[0].delivery_within == 0){
										                        $method_country[0].delivery_within  = 1;
										                    }

										                   // $cutoff_time = Date.parse( date('Y-m-d H:i:s', Date.parse('+'+$method_country[0].delivery_within+' day',Date.parse($time) / 1000) / 1000 ) ) / 1000;
										                   $cutoff_time = d.getTime() + ($method_vendor[0].delivery_within * 24 * 60 * 60 * 1000);

										                   return $cutoff_time;
										                   exit;

										                }else{
										                    $stoppage_hour   = $province[0].stoppage_hour;
										                    $stoppage_minute = $province[0].stoppage_minute;

										                    $time        = $stoppage_hour + ':' + $stoppage_minute + ':00';
										                    $cutoff_time = Date.parse( date('Y-m-d H:i:s', Date.parse('+1 day',Date.parse($time) / 1000) / 1000 ) ) / 1000;

										                    return $cutoff_time;
										                    exit;
										                }

								                	}
									            });
								                /*$current_time     = strtotime(date('Y-m-d H:i:s'));

								                $seconds    = $cutoff_time - $current_time;
								                $hours      = floor($seconds / 3600);
								                $mins       = floor(($seconds - ($hours*3600)) / 60);

								                $stoppage_hour      = $hours;
								                $stoppage_minute    = $mins;*/
								            }
						           		}
			    					});
						    }
					        /*$stoppage_hour = $province[0]->stoppage_hour;
					        $stoppage_minute = $province[0]->stoppage_minute;*/
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
}

function getCustomDeliveryDate($currenydetails,$product_code, $productSku, $zipCode, $currentCountry, callback) {
        if (!$productSku && !$zipCode) return callback(false);
        var $params ={};  
        var $productSku=$zipCode=''; 
        var $deliveryCalendar = 'NotFoundProductSku';
        var $result = false;    
        commonHelper.countrycode($currentCountry, function(err, res){
            if(err) callback(err);
            else { 
                    $curlData = {
				        "getDlvrCalRequest" : {
				            "partnerId" : "123",
				            "customerId" : config.atlas_order.customer_id,
				            "customerType": config.atlas_order.customer_type,
				            "country" : "USA",
				//            "country" : res[0].iso_code,
				            "deliveryDate" : "",
				            "locationType": "1",
				            "productSku" : "1120RD",
				//            "productSku" : $productSku,
				            "backupSku" : "",
				            "backupSkuBrandCode" : "",
				            "siteId" : config.atlas_order.site_id,
				            "startDate" : "",
				            "sourceSystem" : config.atlas_order.source_system,
				            "zipCode" : "11514",
				//            "zipCode" : $zipCode,
				            "brandCode" : config.atlas_order.brand_code
				        }
				    };
                    $curlData = JSON.stringify($curlData); 
                    //$Authorization = 'Bearer ' + base64.encode(config.atlas_order.client_id + ':' + config.atlas_order.client_secret);
			        // Set the headers
			        var headers = {
			           // 'Authorization': $Authorization,
			           // 'SOAPAction': 'getDeliveryCalendar',
			            'Content-Type':'application/json',
			            'X-IBM-Client-Id':config.atlas_order.client_id,
			            'X-IBM-Client-Secret':config.atlas_order.client_secret
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
			        request(options, function (error, response, body) {			             
			            if (response.statusCode == 200) {
				             response=JSON.parse(JSON.stringify(response));
				             body=JSON.parse(body);
				             responseStatus=body["getDlvrCalResponse"]["responseStatus"];
				             $responseDlvrCal=body["getDlvrCalResponse"];
				            if(responseStatus=='SUCCESS'){
				           			$getDates=body["getDlvrCalResponse"]["getDlvrCalResult"]["dlvrCalDeliveryDates"]["dlvrCalDeliveryDate"];
			                        if ($getDates.length > 0) {
			                        	var $mobArray =[]; 
			                        	var $dateArray =[]; 
			                        	var $surchargeArray =[];
			                        	var $infoArray = {};
			                            //for ( var i=0 ; i < $getDates.length; i++) {
			                             	for(var $item in $getDates) {
			                             		$deldate=$getDates[$item].deliveryDate;
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
				                                $totSurcharge ='';
				                                $totSurcharge = $getDates[$item].totSurcharge;
				                               // if ($item.totSurcharge == '0.0') {
				                                //    $totSurcharge = $item.totSurcharge;
				                               // } else {
				                               //     $totSurcharge = number_format(currency(urlencode('USD'), urlencode('CAD'), $item.totSurcharge), 2);
				                               // }
				                               	
				                                $infoArray[$deldate] = {'deliveryDate' : $deldate, 'totSurcharge' : $totSurcharge};

				                                $dateArray.push($deldate);
				                                $surchargeArray.push($totSurcharge);
				                            }
			                           // }
			                           $deliveryCalendar = {'dateArray' : $dateArray, 'surchargeArray' : $surchargeArray, 'infoArray' : $infoArray, 'currencyPrefix' : $currenydetails[0].symbol, 'currencySuffix' : ''};
			                            $result = true;
			                        } else {
			                            $deliveryCalendar = 'ZeroDeliveryDate';
			                            $result = false;
			                        }
			                    } else {
				                         if($responseDlvrCal.length && $responseDlvrCal["getDlvrCalResponse"].length && $responseDlvrCal["getDlvrCalResponse"]["getDlvrCalResult"] && $responseDlvrCal["getDlvrCalResponse"]["getDlvrCalResult"]["flwsErrors"] && $responseDlvrCal["getDlvrCalResponse"]["getDlvrCalResult"]["flwsErrors"]["flwsError"] && $responseDlvrCal["getDlvrCalResponse"]["getDlvrCalResult"]["flwsErrors"]["flwsError"]["errorMessage"] && $responseDlvrCal["getDlvrCalResponse"]["getDlvrCalResult"]["flwsErrors"]["flwsError"]["errorMessage"] != ''){
				                          $deliveryCalendar = $responseDlvrCal["getDlvrCalResponse"]["getDlvrCalResult"]["flwsErrors"]["flwsError"]["errorMessage"];
				                          } 
				                        $deliveryCalendar = 'SkuNotAvailable';
				                        $result = false;
				                }
				            }
			                return callback(null,{'result' : $result, 'deliveryCalendar' : $deliveryCalendar});
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



function stoppageTimePart($vendor_id = null,$province_id )
{
    var d = new Date();
    var $current_hour = d.getHours();
    var $current_minute = d.getMinutes();

    if ($vendor_id !=null && $vendor_id != '') {
        $sql='select * from `provinces` inner join `group_vendor` on `group_vendor`.`timezone_id` = `provinces`.`timezone_id` inner join `timezones` on `timezones`.`id` = `provinces`.`timezone_id` where (`provinces`.`id` = '+$province_id+' and `provinces`.`status` = 1 and `group_vendor`.`vendor_id` = '+$vendor_id+') group by `provinces`.`timezone_id`';        
    } else {
        $sql='select `group_vendor`.`stoppage_hour`, `group_vendor`.`stoppage_minute` from `provinces` inner join `group_vendor` on `group_vendor`.`timezone_id` = `provinces`.`timezone_id` inner join `timezones` on `timezones`.`id` = `provinces`.`timezone_id` inner join `vendor` on `vendor`.`id` = `group_vendor`.`vendor_id` where (`provinces`.`id` = '+$province_id+' and `provinces`.`status` = 1) and `group_vendor`.`stoppage_hour` >= '+$current_hour+' and `vendor`.`status` = 1 and (`group_vendor`.`stoppage_hour` > '+$current_hour+' or `group_vendor`.`stoppage_minute` >= '+$current_minute+') order by `group_vendor`.`stoppage_hour` asc, `group_vendor`.`stoppage_minute` asc';
    }
    $province_group_vendor={};
    dbModel.rawQuery($sql, function(err, $province_group_vendor) {
        if (err) return err;
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

function getCurrencyDetails($currency_id = null, $country_id, callback){

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

module.exports = new ProductController();
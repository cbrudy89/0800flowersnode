var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var async = require('async');
var config = require('./../../config');
var connection = require('./../../database');
var dbModel = require('./../models/db-model');

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
        var $postalcode=req.body.postalcode;

        $sql="Select `product_name`, `product_description`, `product_content`, products.* from `products` inner join `language_product` on `products`.`id` = `language_product`.`product_id` where (`product_status` = 1 and `language_product`.`language_id` = "+$sessLang+" and `products`.`slug` = '"+$slug+"') limit 1";

        $product=[];
        dbModel.rawQuery($sql, function(err, $product) {
           if (err) {
              res.status(config.HTTP_BAD_REQUEST).send({
                status:config.ERROR,
                code: config.HTTP_BAD_REQUEST,             
                message:"Unable to process request"
              });
           }else{
             if($product.length > 0){
                 res.status(config.HTTP_SUCCESS).send({
                    status:config.ERROR,
                    code: config.HTTP_SUCCESS,             
                    message:"Product found found",
                    result: $product
                });

                /////////////////////Product data/////////////////////////////////
                $title =  $product[0].product_name +' - ' + config.SITE_TITLE;
                $resAtlasDDOrg  = null;
                $AtlasDate      = [];                        
                    
                $postalcode = !($postalcode) ? $postalcode : config.DEFAULT_ZIPCODE;
                /*
                $resAtlasDDOrg=getCustomDeliveryDate($product[0].product_code, $postalcode);
                if(sizeof($resAtlasDDOrg) ){
                    $resAtlasDD = json_decode($resAtlasDDOrg);
                    
                    /*if( $resAtlasDD.length && isset($resAtlasDD->deliveryCalendar) && sizeof($resAtlasDD->deliveryCalendar) && isset($resAtlasDD->deliveryCalendar->dateArray) && sizeof($resAtlasDD->deliveryCalendar->dateArray) ) {
                        $AtlasDate  = $resAtlasDD->deliveryCalendar->dateArray;
                    }*/
                //} 

              /*

                //Check Current Product Is Related To The Selected Country/Province Or Not
                //------------------------------------------------------------------------
                if ($requests->session()->get('delivery_to.province_id') == '' || $requests->session()->get('delivery_to.province_id') == 0) {
                    $chkCountryProvince = ProductLocation::where('product_id', '=', $product->id)
                            ->where('country_id', '=', $requests->session()->get('delivery_to.country_id'))
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
               
                        /////////////////////////////Product data end////////////////////////////////////////////////
             }else{
                // No product found
              res.status(config.HTTP_NOT_FOUND).send({
                status:config.ERROR,
                code: config.HTTP_NOT_FOUND,             
                message:"Page not found"
              });                

             }
           }
        });

  }
  
}
/*
function getCustomDeliveryDate($product_code, $postalcode) {
    if (Request::ajax()) {
            $input = Input::all();
            $productSku = $input['prod_sku'];
            $zipCode = $input['zip_code'];
        } else {
            
        }


        if (!empty($productSku) && !empty($zipCode)) {
            $params = array(
                'country' => Session::get('delivery_to')['country_short_code'],
                //'country' => 'IRL',
                'productSku' => $productSku,
                'zipCode' => $zipCode
            );
            $objAtlasOrder = new \App\Libraries\AtlasOrder;
            $responseDlvrCal = json_decode($objAtlasOrder->getDeliveryCalendar($params));

            if ($responseDlvrCal->getDlvrCalResponse->responseStatus == 'SUCCESS') {
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
        }
}
    function getDeliveryCalendar($params){
        $curlData = array(
            "getDlvrCalRequest" => array(
                "partnerId" => "123",
                "customerId" => Config.atlas_order[0]._customer_id,
                "customerType" => Config.atlas_order[0]._customer_type,
                "country" => $params['country'],
                "deliveryDate" => "",
                "locationType" => "1",
                "productSku" => $params['productSku'],
                "backupSku" => "",
                "backupSkuBrandCode" => "",
                "siteId" => Config.atlas_order[0]._site_id,
                "startDate" => "",
                "sourceSystem" => Config.atlas_order[0]._source_system,
                "zipCode" => $params['zipCode'],
                "brandCode" => Config.atlas_order[0]._brand_code
            )
        );
        $curlData = json_encode($curlData); 
        
        $getResult = $this->_executeCommonCurl(Config.atlas_order[0].get_earliest_delivery_date_url, $curlData, 'getDeliveryCalendar');  

        return $getResult;
    }
 function _executeCommonCurl($curlUrl, $curlData, $hitFile){
        //$Authorization = 'Bearer' . ' ' . $accessToken;
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $curlUrl);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            //'Authorization:' . $Authorization,
            //'SOAPAction:'.$hitFile,
            'Content-Type:application/json',
            'X-IBM-Client-Id:' . Config.atlas_order[0]._client_id,
            'X-IBM-Client-Secret:' . Config.atlas_order[0]._client_secret
            //'Accept-Language:en-US'
        ));
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $curlData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $result = curl_exec($ch);
        return $result;
    }*/
module.exports = new ProductController();
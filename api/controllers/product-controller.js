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
                console.log($product); return;
                        /*$title =  $product[0].product_name +' - ' + config.SITE_TITLE;
                        $resAtlasDDOrg  = null;
                        $AtlasDate      = [];                        
                        if (count($product) > 0) {
                            
                            $postalcode = !empty(Session::get('delivery_to')['postalcode']) ? Session::get('delivery_to')['postalcode'] : Config::get('constants.default_zipcode');
                            
                            $resAtlasDDOrg = $this->getCustomDeliveryDate($product->product_code, $postalcode);

                            if(sizeof($resAtlasDDOrg) ){
                                $resAtlasDD = json_decode($resAtlasDDOrg);
                                
                                if( sizeof($resAtlasDD) && isset($resAtlasDD->deliveryCalendar) && sizeof($resAtlasDD->deliveryCalendar) && isset($resAtlasDD->deliveryCalendar->dateArray) && sizeof($resAtlasDD->deliveryCalendar->dateArray) ) {
                                    $AtlasDate  = $resAtlasDD->deliveryCalendar->dateArray;
                                }
                            }

                          

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
                            }
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

module.exports = new ProductController();
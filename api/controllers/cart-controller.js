var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var async = require('async');
var Sync = require('sync');

var config = require('./../../config');
/*var connection = require('./../../database');*/
var dbModel = require('./../models/db-model');
var commonHelper = require('./../helpers/common-helper');

function CartController() {
  // Cart page data
  this.addToCart = function(req, res){

    var return_data = {};
    var quantity = 1;
    
    var product_id = req.body.product_id;
    var product_variant_id = req.body.product_variant_id;
    var language_id = req.body.langauge_code;
    //var user_id = req.body.user_id ? req.body.user_id : 0;
    var delivery_date = req.body.delivery_date;
    var country_id = req.body.country_id;
    var sku = req.body.product_sku;
    var prod_delivery_method_id = req.body.prod_delivery_method_id ? req.body.prod_delivery_method_id : 0;
    //var extra_charge = req.body.extra_charge ? req.body.extra_charge : 0;
    var postalcode = req.body.postalcode ? req.body.postalcode : "00000";
    var location = req.body.location

    var token = req.headers['token'] || '' ;
    var cart_id = '';
    var cart_key = req.headers['cart_key'] || '';
    var user_id = 0;

    /*console.log(token);
    console.log(cart_key);*/

    Sync(function(){

        if(token != '' && token != undefined){
          var decoded = commonHelper.getUserId.sync(null, token);
          //console.log('i am hrere');
          if(decoded != '' && decoded != undefined && decoded.id > 0){
            user_id = decoded.id;
          }
        }      
        var cartData = 0;

        if(cart_key != '' && cart_key != undefined){
            
            // Check if cart is exist
            cartData = isCartKeyExist.sync(null, cart_key);      
        }

        if(!cartData || user_id > 0){

          // Logged In User
          if(user_id != '' && user_id != undefined && user_id > 0){

            // Check User has cart
            var userCart = getUserCart.sync(null, user_id);
            if(userCart){

                // Generate Unique cart key
                cart_key = userCart[0].cart_key;
                cart_id = userCart[0].id;

            }else{

              // Generate Unique cart key
              cart_key = crypto.createHash('sha256').update(Math.random().toString()).digest('hex');
            }

          }else{

            // Guest User
            // Generate Unique cart key
            cart_key = crypto.createHash('sha256').update(Math.random().toString()).digest('hex');

          }
          
        }else{
          cart_id = cartData[0].id;
          user_id = cartData[0].user_id;
          country_id = cartData[0].country_id;
        }

        //console.log(cart_key);

        // Check Product Exist in Cart
        var cartId = isCartProductExist.sync(null, cart_key, product_id, product_variant_id, delivery_date);
        if(cartId){

          //console.log("Existing cart : "+ cart_key);
          
          // Update cart product quantity if product exist
          var isUpdated = updateCartProductQuantity.sync(null, cartId, product_id, product_variant_id, delivery_date);

          // If unable to updated cart product quantity show error.
          if(isUpdated){

            var cartCount = commonHelper.cartCount.sync(null, user_id, cart_key);

            res.status(config.HTTP_SUCCESS).send({
                status: config.SUCCESS, 
                code : config.HTTP_SUCCESS, 
                message: 'Cart updated!',
                cartCount: cartCount
            });

          }else{

            res.status(config.HTTP_SERVER_ERROR).send({
                status: config.ERROR, 
                code : config.HTTP_SERVER_ERROR,          
                message: "Unable to process request, Please try again!"
            });            

          }

        }else{

          //console.log("New cart : "+cart_key);

          var cart_data = {
            "cart_key": cart_key,
            "user_id" : user_id,
            "country_id" : country_id
          };

          dbModel.save('cart', cart_data, cart_id, function(error, result){
            if(error) {
                res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR,          
                    message: "Unable to process request, Please try again!",
                    err: error
                });

            } else{
              //console.log(result);

              if(result.insertId > 0 || result.affectedRows > 0){

                if(result.insertId > 0){
                  cart_id = result.insertId;                  
                }

                var cart_products = {
                  "cart_id": cart_id,
                  "product_id": product_id,
                  "product_variant_id" : product_variant_id,
                  "quantity" : quantity,
                  "type": "product",
                  "prod_delivery_method_id": prod_delivery_method_id
                };

                dbModel.save('cart_products', cart_products, '', function(error, result_cart_product){
                  //console.log(error);
                  if(error) {
                      res.status(config.HTTP_SERVER_ERROR).send({
                          status: config.ERROR, 
                          code : config.HTTP_SERVER_ERROR,          
                          message: "Unable to process request, Please try again!",
                          err: error
                      });

                  }else { 

                      //console.log(result_cart_product);
                    Sync(function(){                    

                      if(result_cart_product.insertId > 0){
                        // Return cart id to user


                        var cartCount = commonHelper.cartCount.sync(null, user_id, cart_key);

                        var resp = {
                          "cart_key" : cart_key,
                          "cartCount" : cartCount
                        };

                        res.status(config.HTTP_SUCCESS).send({
                            status: config.SUCCESS, 
                            code : config.HTTP_SUCCESS, 
                            message: 'Product Added to cart!',
                            result : resp
                        });

                      }else{

                        res.status(config.HTTP_SERVER_ERROR).send({
                            status: config.ERROR, 
                            code : config.HTTP_SERVER_ERROR,          
                            message: "Unable to process request, Please try again!",
                            err: error
                        });
                      }

                    });
                    
                  }

                });
                
              }else{

                res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR,          
                    message: "Unable to process request, Please try again!",
                    err: error
                });

              }
            }

          });          
        }
    });

  }

/*  this.updateCartProductQuantity = function(req, res){

    var return_data = {};
    
    var cart_key = req.body.cart_key;
    var product_id = req.body.product_id;
    var quantity = req.body.quantity;

    Sync(function(){
      
      // Check if cart key exist or not.
      var isCartExist = isCartProductExist.sync(null, cart_key, product_id);
      if(isCartExist){

        // Working Here

        // Update product in cart

        dbModel.save('cart_products', cart_products, '', function(error, result_cart_product){

        });


      }else{

        res.status(config.HTTP_NOT_FOUND).send({
            status: config.ERROR, 
            code : config.HTTP_NOT_FOUND,          
            message: "Unable to process request, Please try again!",
            err: []
        });

      }

    });

  }

  this.updateCart = function(req, res){

  }*/

  this.removeCartProduct = function(req, res){

    var return_data = {};
    
    var cart_product_id = req.body.cart_product_id;
    var product_id = req.body.product_id;
    var product_variant_id = req.body.product_variant_id;
    //var country_id = req.body.country_id;

    var token = req.headers['token'] || '' ;
    var cart_id = '';
    var cart_key = req.headers['cart_key'] || '';
    var user_id = 0;

    Sync(function(){

        if(token != '' && token != undefined){
          var decoded = commonHelper.getUserId.sync(null, token);
          //console.log('i am hrere');
          if(decoded != '' && decoded != undefined && decoded.id > 0){
            user_id = decoded.id;
          }
        }      
        
        var cartData = 0;
        if(cart_key != '' && cart_key != undefined){
            
            // Check if cart is exist
            cartData = isCartKeyExist.sync(null, cart_key);      
        }

        if(cartData || user_id > 0){

          // Logged In User
          if(user_id != '' && user_id != undefined && user_id > 0){

            // Check User has cart
            var userCart = getUserCart.sync(null, user_id);
            if(userCart){

                cart_key = userCart[0].cart_key;
                cart_id = userCart[0].id;

            }else{

              res.status(config.HTTP_SERVER_ERROR).send({
                  status: config.ERROR, 
                  code : config.HTTP_SERVER_ERROR,          
                  message: "Unable to delete cart product"
              });

            }

          }else if (cartData[0].id > 0){

            cart_id = cartData[0].id; 
            cart_key = cartData[0].cart_key;

          }else{

            res.status(config.HTTP_SERVER_ERROR).send({
                status: config.ERROR, 
                code : config.HTTP_SERVER_ERROR,          
                message: "Unable to delete cart product"
            }); 

          }
          
        }else{

            res.status(config.HTTP_SERVER_ERROR).send({
                status: config.ERROR, 
                code : config.HTTP_SERVER_ERROR,          
                message: "Unable to delete cart product"
            }); 

        }

        // Check Product Exist in Cart
        var isDeleted = isCartProductDeleted.sync(null, cart_id, cart_product_id, product_id, product_variant_id);
        //console.log(isDeleted);
        if(isDeleted){

          res.status(config.HTTP_NOT_FOUND).send({
              status: config.ERROR, 
              code : config.HTTP_NOT_FOUND,          
              message: "Product already removed!"
          });

        }else{

          // Delete products from cart
          var cond = [
              {'id': {'val': cart_product_id, 'cond': '='}},
              {'cart_id': {'val': cart_id, 'cond': '='}},
              {'product_id': {'val': product_id, 'cond': '='}},
              {'product_variant_id': {'val': product_variant_id, 'cond': '='}}
          ];

          dbModel.delete("cart_products", cond, function(error, result){
            
            if(error){

              res.status(config.HTTP_SERVER_ERROR).send({
                  status: config.ERROR, 
                  code : config.HTTP_SERVER_ERROR,          
                  message: "Unable to delete cart product",
                  error: error
              });

            }else{

              Sync(function(){

                // Check cart quanity grater then Zero.
                var cartCount = commonHelper.cartCount.sync(null, user_id, cart_key);
                var resp = {
                  "cart_key" : null,
                  "cartCount" : cartCount
                };

                if(cartCount != undefined && cartCount <= 0){

                  var cond1 = [{
                    'cart_id': {
                      'val': cart_id, 
                      'cond': '='
                    }
                  }];

                  dbModel.delete("cart", cond1, function(error, result){});

                  res.status(config.HTTP_SUCCESS).send({
                      status: config.SUCCESS, 
                      code : config.HTTP_SUCCESS,          
                      message: "Cart is empty!",
                      result: resp
                  });                  

                }else{

                  resp.cart_key = cart_key;

                  res.status(config.HTTP_SUCCESS).send({
                      status: config.SUCCESS, 
                      code : config.HTTP_SUCCESS,          
                      message: "Product removed from cart!",
                      result: resp
                  });
                  
                }

              });

            }

          });

        }
    });

  }

  this.getCart = function(req, res){

    var language_code = req.headers['language_code'];
    var country_id = req.headers['country_id'] || '';
    var currency_id = req.headers['currency_id'] || '';

    var token = req.headers['token'] || '' ;
    var cart_id = '';
    var cart_key = req.headers['cart_key'] || '';
    var user_id = 0;

    Sync(function(){

        if(token != '' && token != undefined){
          var decoded = commonHelper.getUserId.sync(null, token);
          //console.log('i am hrere');
          if(decoded != '' && decoded != undefined && decoded.id > 0){
            user_id = decoded.id;
          }
        }      
        
        var cartData = 0;
        if(cart_key != '' && cart_key != undefined){
            
            // Check if cart is exist
            cartData = isCartKeyExist.sync(null, cart_key);      
        }

        if(cartData || user_id > 0){

          // Logged In User
          if(user_id != '' && user_id != undefined && user_id > 0){

            // Check User has cart
            var userCart = getUserCart.sync(null, user_id);
            if(userCart){

              cart_key = userCart[0].cart_key;
              cart_id = userCart[0].id;

            }

          }

          if (cartData[0].id > 0){

            cart_id = cartData[0].id; 
            cart_key = cartData[0].cart_key;

          }

          if(cart_id == '' && cart_id == undefined && cart_key == '' && cart_key == undefined){

            return res.status(config.HTTP_SERVER_ERROR).send({
                status: config.ERROR, 
                code : config.HTTP_SERVER_ERROR,          
                message: "Unable to get cart product"
            });

          }
          
        }else{

            return res.status(config.HTTP_SERVER_ERROR).send({
                status: config.ERROR, 
                code : config.HTTP_SERVER_ERROR,          
                message: "Unable to get cart product"
            });

        }

        // Getting Currency Details from current country
        var currency_details = commonHelper.getCurrencyDetails.sync(null, currency_id, 0);

        // Get Cart Products
        var cartItems = getCartProdcuts.sync(null, cart_id, language_code);


        //var cartProducts = [];
        if(cartItems.length > 0 && currency_details.length > 0){

          for(var i=0; i < cartItems.length; i++){

              //console.log(cartItems);

               //console.log($variantdetails[i].price_value);
              var actPrice = commonHelper.number_format.sync(null, (cartItems[i].price_value * currency_details[0].exchange_rate), 2, '.', ',');

              //var $current_currency = price_data.currency_result[0].symbol+" "+price_data.currency_result[0].currency_code;
              var current_currency = currency_details[0].currency_code;

              var currentCurrSymbl = currency_details[0].symbol;
              if(current_currency !== "USD"){ 
                  actPrice = commonHelper.roundToNineNine.sync(null, actPrice, current_currency);
              }
              
              price = currentCurrSymbl + actPrice;
              cartItems[i].price_value = price;

          }
            
        }

        //console.log(cartItems);


/*        $cartItems = Cart::all();
        $title = 'Shopping Cart - ' . Config::get('constants.site_title');

        foreach ($cartItems as $items) {
            $productMethod = MethodVendor::where('method_id', '=', $items->attributes['delivery_method_id'])
                            ->where('vendor_id', '=', $items->attributes['vendor_id'])->first();

            if (count($productMethod) == 0) {
                //Get The Default Delivery Method Created By Admin
                //------------------------------------------------
                $productMethod = Method::where('id', $items->attributes['delivery_method_id'])->first();
            }
            $attributes = $items->attributes;
            $attributes['productMethod'] = $productMethod;

            Cart::update($items->__raw_id, array('attributes' => $attributes));
        }*/



        var resp = {
          "cartCount": 0,
          "cartItems": cartItems
        }

        return res.status(config.HTTP_SUCCESS).send({
            status: config.SUCCESS, 
            code : config.HTTP_SUCCESS,          
            message: "Products in cart",
            result: resp
        });      

    });


  }

  this.applyPromoCode = function(req, res){



  }

  this.removePromoCode = function(req, res){

  }


}

/*function calculateCartTotal()
{
    $cartItems = Cart::all();
    $cartTotal = 0;
    $extraCharges = 0;
    if (Cart::countRows() > 0) {
        foreach ($cartItems as $item) {
            $extra_charge = 0;

            if ($item['attributes']['extra_charge'] != '' && $item['attributes']['extra_charge'] > 0) {
                $extra_charge = $item['attributes']['extra_charge'];
            }
            $addonsTotal = 0;
            if (count($item['attributes']['addons']) > 0) {
                $addonItems = $item['attributes']['addons'];

                foreach ($addonItems as $adnItem) {
                    $addonsTotal += $adnItem['addon_price_value'];
                }
            }

            $extraCharges += $extra_charge + $addonsTotal;
        }//end foreach cart items
    }//end cart count rows

    $cartTotal = (Cart::total() + $extraCharges);
    return $cartTotal;
}*/

function isExistsDiscountAccordingToCountry($code, $delivery_country_id){
  
  var sql = "SELECT * from `discounts` inner join `discount_country_list`";
    sql += " ON `discount_country_list`.`discount_id` = `discounts`.`id`";
    sql += " WHERE `discount_code` = '"+$code+"'";
    sql += " AND `limit_usage_by` > 0 AND `status` = 1"
    sql += " AND `discount_country_list`.`country_id` = "+$delivery_country_id;

    dbModel.rawQuery(sql, function(error, result){
      if(error){
        callback(error);
      }else{  
        if(result.length > 0){
          callback(null, result);
        }else{
          callback(null, []);
        }
      }

    });

}

function checkDiscountCodeForDiscount($code, $delivery_country_id, callback)
{
    $country_id = $delivery_country_id;
    $discount = isExistsDiscountAccordingToCountry.sync($code, $country_id);

    if(!discount && discount.length <= 0){
      return res.status(config.HTTP_NOT_FOUND).send({
          status: config.ERROR, 
          code : config.HTTP_NOT_FOUND,          
          message: "Not a valid discount code."
      });
    }else{

        /*$cartTotal = calculateCartTotal();
        $returnData = array();

        $tax = 0;
        $service_charge = 0;
        $total_service_charge = 0;
        $delivery_charge = 0;
        $total_delivery_charge = 0;
        $surcharge = 0;
        $product_count = 0;

        $discount_product_tax = 0;
        $discount_total = 0;
        $discount_tax = 0;
        $addons_charge = 0;
        $total_addon_charge = 0;

        $cart_data = Session::get('cart');
        foreach ($cart_data['default'] as $key => $value) {
            $data = json_decode($value);
            $product_count += $data->qty;
            $province_id = $data->attributes->province_id;
            $province_data = Province::where('id', '=', $province_id)->first();

            $location_tax_percentage = 0;
            if (isset($province_data) && sizeof($province_data)) {
                $location_tax_percentage = $province_data['location_tax'];
            }

            $methods = Method::where('id', '=', $data->attributes->delivery_method_id)->first();
            if ($data->attributes->delivery_method_id == 1) {
                $service_charge = $methods['delivery_charge'];
                $delivery_charge = 0;
            } else {
                $service_charge = 0;
                $delivery_charge = $methods['delivery_charge'];
            }
            $total_service_charge += $service_charge;
            $total_delivery_charge += $delivery_charge;

            $extra_charge = 0;
            if ($data->attributes->extra_charge != '' && $data->attributes->extra_charge > 0) {
                $extra_charge = $data->attributes->extra_charge;
            }
            $surcharge += $extra_charge;

            if (isset($data->attributes->addons) && sizeof($data->attributes->addons)) {
                $addonItems = $data->attributes->addons;


                foreach ($addonItems as $k => $adnItem) {
                    $addons_charge += $adnItem->addon_price_value;

                    $addon_tax_amount =$addon_service_charge_amount = $addon_discount_amount =$addon_discount_amount_percent = $addon_shipping_charge_amount = $addon_gift_certificate_amount =0;
                    $addon_tax_amount = (($adnItem->addon_price_value + $addon_service_charge_amount
                            ) * ($location_tax_percentage / 100));

                    $addOn     = $value['attributes'];

                    $addOn['addons'][$k]['addon_tax_amount'] = $addon_tax_amount;
                    $addOn['addons'][$k]['addon_service_charge_amount'] = $addon_service_charge_amount;
                    $addOn['addons'][$k]['addon_discount_amount'] = $addon_discount_amount;
                    $addOn['addons'][$k]['addon_discount_amount_percent'] = $addon_discount_amount_percent;
                    $addOn['addons'][$k]['addon_shipping_charge_amount'] = $addon_shipping_charge_amount;
                    $addOn['addons'][$k]['addon_gift_certificate_amount'] = $addon_gift_certificate_amount;
                    Cart::update($value['__raw_id'], array('attributes' => $addOn));

                }
            }

            $total_addon_charge += $addons_charge;

            $particular_tax = (($data->total + $service_charge + $delivery_charge + $extra_charge + $addons_charge) * ($location_tax_percentage / 100));
            $tax = $tax + $particular_tax;

            $attributes     = $value['attributes'];
            $attributes['tax_amount'] = $particular_tax;
            $attributes['service_charge_amount'] = $service_charge;
            $attributes['shipping_charge_amount'] = 0.00;
            $attributes['gift_certificate_amount'] = 0.00;
            $attributes['discount_amount'] = 0;
            $attributes['discount_amount_percent'] = 0;

            Cart::update($value['__raw_id'], array('attributes' => $attributes));

        }

        Session::put('tax', $tax);
        Session::put('service_charge', $total_service_charge);

        if ($product_count > 1) {
            //$cartTotal += 2;
            //$surcharge += 2;
        }

        Session::put('total_amount', ($total_service_charge + $tax + $cartTotal + $total_delivery_charge));
        Session::put('addons_charge', $addons_charge);
        Session::put('delivery_charge', $total_delivery_charge);
        Session::put('total_amount_before_tax', ($total_service_charge + $cartTotal + $total_delivery_charge));

        Session::put('surcharge', $surcharge);

        if (count($discount) > 0) {
            $discount = $discount[0];
            if ($discount['apply_on'] == 'merchandise') {
                switch ($discount['discount_apply_on']) {
                    case 1:

                        $product_numbers = explode(',', $discount['product_sku']);

                        $product_exist = 0;
                        $product_code = 0;
                        $varient_id = 0;
                        $product_price = 0;
                        $tax = 0;
                        $total_addon_charge = 0;
                        $row_id = 0;
                        foreach ($cart_data['default'] as $key => $value) {
                            $data = json_decode($value);
                            $province_id = $data->attributes->province_id;
                            $province_data = Province::where('id', '=', $province_id)->first();
                            $location_tax_percentage = 0;
                            if (isset($province_data) && sizeof($province_data)) {
                                $location_tax_percentage = $province_data['location_tax'];
                            }
                            if ($data->attributes->delivery_method_id == 1) {
                                $service_charge = $methods['delivery_charge'];
                                $delivery_charge = 0;
                            } else {
                                $service_charge = 0;
                                $delivery_charge = $methods['delivery_charge'];
                            }
                            $addons_charge = 0;
                            $extra_charge = $data->attributes->extra_charge;

                            if (isset($data->attributes->addons) && sizeof($data->attributes->addons)) {
                                $addonItems = $data->attributes->addons;

                                foreach ($addonItems as $k => $adnItem) {
                                    $addons_charge += $adnItem->addon_price_value;

                                    $addon_tax_amount =$addon_service_charge_amount = $addon_discount_amount =$addon_discount_amount_percent = $addon_shipping_charge_amount = $addon_gift_certificate_amount =0;
                                    $addon_tax_amount = (($adnItem->addon_price_value + $addon_service_charge_amount
                                        ) * ($location_tax_percentage / 100));

                                    $addOn     = $value['attributes'];

                                    $addOn['addons'][$k]['addon_tax_amount'] = $addon_tax_amount;
                                    $addOn['addons'][$k]['addon_service_charge_amount'] = $addon_service_charge_amount;
                                    $addOn['addons'][$k]['addon_discount_amount'] = $addon_discount_amount;
                                    $addOn['addons'][$k]['addon_discount_amount_percent'] = $addon_discount_amount_percent;
                                    $addOn['addons'][$k]['addon_shipping_charge_amount'] = $addon_shipping_charge_amount;
                                    $addOn['addons'][$k]['addon_gift_certificate_amount'] = $addon_gift_certificate_amount;
                                    Cart::update($value['__raw_id'], array('attributes' => $addOn));
                                }
                            }
                            $total_addon_charge += $addons_charge;
                            if (in_array($data->attributes->code, $product_numbers)) {
                                $product_exist = 1;
                                $product_code = $data->attributes->code;
                                $varient_id = $data->attributes->varient_id;
                                $row_id = $value['__raw_id'];
                                $product_price = $data->price;
                                $discount_total = $data->total + $service_charge + $delivery_charge + $extra_charge + $addons_charge;
                                $discount_tax = $location_tax_percentage / 100;
                                //break;
                            } else {
                                $tax = $tax + (($data->total + $service_charge + $delivery_charge + $extra_charge + $addons_charge) * ($location_tax_percentage / 100));
                            }


                        }

                        Session::put('tax', $tax);
                        Session::put('total_amount', ($total_service_charge + $tax + $cartTotal + $total_delivery_charge));
                        Session::put('total_amount_before_tax', ($total_service_charge + $cartTotal + $total_delivery_charge));

                        //Check cart on product number
                        //---------------------------
                        if (!$product_code) {
                            $discountMsg = 'The promotion code is not valid for the selected products.';
                            $discountArray = array(
                                'discount_value' => 0,
                                'discount_value_type' => '',
                                'discount_amount' => 0,
                                'discount_code' => '',
                                'discount_type' => '',
                                'discount_format' => '',
                                'apply_on' => '',
                                'discount_apply_on' => 0
                            );

                            Session::put('discount', $discountArray);
                            $returnData = array('success' => false, 'discountMsg' => $discountMsg, 'tax' => convertPrice(Session::get('tax')), 'service_charge' => convertPrice(Session::get('service_charge')), 'total_amount' => convertPrice(Session::get('total_amount')), 'delivery_charge' => convertPrice(Session::get('delivery_charge')), 'surcharge' => convertPrice(Session::get('surcharge')), 'total_amount_before_tax' => convertPrice(Session::get('total_amount_before_tax')), 'before_convert_total_amount' => Session::get('total_amount'), 'before_convert_total_amount_before_tax' => Session::get('total_amount_before_tax'), 'apply_on' => 'merchandise');
                        } else {
                            //Check discount start/end date
                            //-----------------------------
                            if ((date("Y-m-d") >= $discount['start_date']) && (date("Y-m-d") <= $discount['expiry_date'])) {

                                //Check code limit usage
                                //----------------------
                                if ($discount['limit_usage_by'] >= 1) {
                                    $discountValue = $discount['discount_value'];
                                    $discountValueType = $discount['discount_value_type'];
                                    $discountCode = $discount['discount_code'];
                                    $discount_type = $discount['discount_type'];
                                    $discount_format = $discount['discount_format'];
                                    $apply_on = $discount['apply_on'];
                                    $discount_apply_on = $discount['discount_apply_on'];

                                    $product_details = '';
                                    //Check code type
                                    //---------------
                                    if ($discountValueType == '%') {
                                        $discountAmount = ((($product_price + $total_addon_charge) * $discountValue) / 100);
                                    } else if ($discountValueType == '$') {
                                        $discountAmount = $discountValue;
                                    } else {
                                        $discountAmount = 0;
                                    }

                                    $discountArray = array(
                                        'discount_value' => $discountValue,
                                        'discount_value_type' => $discountValueType,
                                        'discount_amount' => $discountAmount,
                                        'discount_code' => $discountCode,
                                        'discount_type' => $discount_type,
                                        'discount_format' => $discount_format,
                                        'apply_on' => $apply_on,
                                        'discount_apply_on' => $discount_apply_on
                                    );

                                    $particular_tax = (($discount_total - $discountAmount) * $discount_tax);
                                    $tax = $tax + $particular_tax;
                                    Session::put('tax', $tax);


                                    foreach ($cart_data['default'] as $key => $value){

                                        if($value['__raw_id'] == $row_id) {
                                            $attributes     = $value['attributes'];
                                            $attributes['tax_amount'] = $particular_tax;
                                            $attributes['discount_amount'] = number_format($discountAmount,2);
                                            $attributes['discount_amount_percent'] = $discountValue;

                                            Cart::update($value['__raw_id'], array('attributes' => $attributes));
                                        }
                                    }


                                    $total_amount = ($total_service_charge + $tax + $cartTotal + $total_delivery_charge) - $discountAmount;

                                    Session::put('total_amount', $total_amount);
                                    Session::put('total_amount_before_tax', ($total_amount - $tax));

                                    $discountMsg = 'Promo Code Applied Successfully';
                                    Session::put('discount', $discountArray);
                                    
                                    $round99_total_amount = cartAmountToNineNine(Session::get('service_charge')+Session::get('delivery_charge')+Session::get('surcharge')+Session::get('tax'), $discountAmount);
                                    $round99_total_amount_before_tax = cartAmountToNineNine(Session::get('service_charge')+Session::get('delivery_charge')+Session::get('surcharge'), $discountAmount); 
                                    
                                    $returnData = array('success' => true, 'discountMsg' => $discountMsg, 'round99_total_amount' => $round99_total_amount, 'round99_total_amount_before_tax' => $round99_total_amount_before_tax, 'actDiscountAmount' => $discountAmount, 'discountAmount' => convertPrice($discountAmount), 'tax' => convertPrice(Session::get('tax')), 'service_charge' => convertPrice(Session::get('service_charge')), 'total_amount' => convertPrice(Session::get('total_amount')), 'delivery_charge' => convertPrice(Session::get('delivery_charge')), 'surcharge' => convertPrice(Session::get('surcharge')), 'total_amount_before_tax' => convertPrice(Session::get('total_amount_before_tax')), 'before_convert_total_amount' => Session::get('total_amount'), 'before_convert_total_amount_before_tax' => Session::get('total_amount_before_tax'), 'apply_on' => 'merchandise');
                                } else {
                                    $discountMsg = 'The coupon has been reached to its maximum usage';
                                    $discountArray = array(
                                        'discount_value' => 0,
                                        'discount_value_type' => '',
                                        'discount_amount' => 0,
                                        'discount_code' => '',
                                        'discount_type' => '',
                                        'discount_format' => '',
                                        'apply_on' => '',
                                        'discount_apply_on' => 0
                                    );

                                    Session::put('discount', $discountArray);
                                    $returnData = array('success' => false, 'discountMsg' => $discountMsg, 'tax' => convertPrice(Session::get('tax')), 'service_charge' => convertPrice(Session::get('service_charge')), 'total_amount' => convertPrice(Session::get('total_amount')), 'delivery_charge' => convertPrice(Session::get('delivery_charge')), 'surcharge' => convertPrice(Session::get('surcharge')), 'total_amount_before_tax' => convertPrice(Session::get('total_amount_before_tax')), 'before_convert_total_amount' => Session::get('total_amount'), 'before_convert_total_amount_before_tax' => Session::get('total_amount_before_tax'), 'apply_on' => 'merchandise');
                                }
                            } else {
                                Session::forget('discount');

                                $discountMsg = 'The promotion code has been expired';
                                $returnData = array('success' => false, 'discountMsg' => $discountMsg, 'tax' => convertPrice(Session::get('tax')), 'service_charge' => convertPrice(Session::get('service_charge')), 'total_amount' => convertPrice(Session::get('total_amount')), 'delivery_charge' => convertPrice(Session::get('delivery_charge')), 'surcharge' => convertPrice(Session::get('surcharge')), 'total_amount_before_tax' => convertPrice(Session::get('total_amount_before_tax')), 'before_convert_total_amount' => Session::get('total_amount'), 'before_convert_total_amount_before_tax' => Session::get('total_amount_before_tax'), 'apply_on' => 'merchandise');
                            }
                        }

                        break;

                    case 2:

                        break;

                    case 3:

                        //Discount Applied On Cart Total Min Amount Only
                        //----------------------------------------------

                        if ($cartTotal <= $discount['fixed_amount']) {
                            $discountMsg = 'The promotion code applies for a minimum order value of $' . $discount['fixed_amount'];
                            $discountArray = array(
                                'discount_value' => 0,
                                'discount_value_type' => '',
                                'discount_amount' => 0,
                                'discount_code' => '',
                                'discount_type' => '',
                                'discount_format' => '',
                                'apply_on' => '',
                                'discount_apply_on' => 0
                            );

                            Session::put('discount', $discountArray);
                            $returnData = array('success' => false, 'discountMsg' => $discountMsg, 'tax' => convertPrice(Session::get('tax')), 'service_charge' => convertPrice(Session::get('service_charge')), 'total_amount' => convertPrice(Session::get('total_amount')), 'delivery_charge' => convertPrice(Session::get('delivery_charge')), 'surcharge' => convertPrice(Session::get('surcharge')), 'total_amount_before_tax' => convertPrice(Session::get('total_amount_before_tax')), 'before_convert_total_amount' => Session::get('total_amount'), 'before_convert_total_amount_before_tax' => Session::get('total_amount_before_tax'), 'apply_on' => 'merchandise');
                        } else {
                            //Check discount start/end date
                            //-----------------------------
                            if ((date("Y-m-d") >= $discount['start_date']) && (date("Y-m-d") <= $discount['expiry_date'])) {

                                //Check code limit usage
                                //----------------------
                                if ($discount['limit_usage_by'] >= 1) {
                                    $tax = 0;
                                    $discountValue = $discount['discount_value'];
                                    $discountValueType = $discount['discount_value_type'];
                                    $discountCode = $discount['discount_code'];
                                    $discount_type = $discount['discount_type'];
                                    $discount_format = $discount['discount_format'];
                                    $apply_on = $discount['apply_on'];
                                    $discount_apply_on = $discount['discount_apply_on'];

                                    //Check code type
                                    //---------------
                                    if ($discountValueType == '%') {
                                        $discountAmount = ((Cart::total() + $total_addon_charge) * $discountValue) / 100;
                                    } else if ($discountValueType == '$') {
                                        $discountAmount = $discountValue;
                                    } else {
                                        $discountAmount = 0;
                                    }


                                    $discountArray = array(
                                        'discount_value' => $discountValue,
                                        'discount_value_type' => $discountValueType,
                                        'discount_amount' => $discountAmount,
                                        'discount_code' => $discountCode,
                                        'discount_type' => $discount_type,
                                        'discount_format' => $discount_format,
                                        'apply_on' => $apply_on,
                                        'discount_apply_on' => $discount_apply_on
                                    );

                                    $discountMsg = 'Promo Code Applied Successfully';
                                    Session::put('discount', $discountArray);

                                    $tax = (($cartTotal - $discountAmount) * ($location_tax_percentage / 100));
                                    Session::put('tax', $tax);



                                    $total_amount = ($total_service_charge + $tax + $cartTotal + $total_delivery_charge) - $discountAmount;
                                    Session::put('total_amount', $total_amount);
                                    Session::put('total_amount_before_tax', ($total_amount - $tax));


                                    foreach ($cart_data['default'] as $key => $value) {
                                        $data = json_decode($value);
                                        $province_id = $data->attributes->province_id;
                                        $province_data = Province::where('id', '=', $province_id)->first();
                                        $location_tax_percentage = 0;
                                        if (isset($province_data) && sizeof($province_data)) {
                                            $location_tax_percentage = $province_data['location_tax'];
                                        }
                                        if ($data->attributes->delivery_method_id == 1) {
                                            $service_charge = $methods['delivery_charge'];
                                            $delivery_charge = 0;
                                        } else {
                                            $service_charge = 0;
                                            $delivery_charge = $methods['delivery_charge'];
                                        }
                                        $addons_charge = 0;
                                        $extra_charge = $data->attributes->extra_charge;

                                        if (isset($data->attributes->addons) && sizeof($data->attributes->addons)) {
                                            $addonItems = $data->attributes->addons;

                                            foreach ($addonItems as $k => $adnItem) {
                                                $addons_charge += $adnItem->addon_price_value;

                                                $addon_tax_amount =$addon_service_charge_amount = $addon_discount_amount =$addon_discount_amount_percent = $addon_shipping_charge_amount = $addon_gift_certificate_amount =0;
                                                $addon_tax_amount = (($adnItem->addon_price_value + $addon_service_charge_amount
                                                    ) * ($location_tax_percentage / 100));

                                                $addOn     = $value['attributes'];

                                                $addOn['addons'][$k]['addon_tax_amount'] = $addon_tax_amount;
                                                $addOn['addons'][$k]['addon_service_charge_amount'] = $addon_service_charge_amount;
                                                $addOn['addons'][$k]['addon_discount_amount'] = $addon_discount_amount;
                                                $addOn['addons'][$k]['addon_discount_amount_percent'] = $addon_discount_amount_percent;
                                                $addOn['addons'][$k]['addon_shipping_charge_amount'] = $addon_shipping_charge_amount;
                                                $addOn['addons'][$k]['addon_gift_certificate_amount'] = $addon_gift_certificate_amount;
                                                Cart::update($value['__raw_id'], array('attributes' => $addOn));
                                            }
                                        }
                                        //Check code type
                                        //---------------
                                        if ($discountValueType == '%') {
                                            $product_discountAmount = (($data->total + $addons_charge) * $discountValue) / 100;
                                        } else if ($discountValueType == '$') {
                                            $product_discountAmount = $discountValue;
                                        } else {
                                            $product_discountAmount = 0;
                                        }

                                        $tax = (($data->total - $product_discountAmount) * ($location_tax_percentage / 100));

                                        $attributes     = $value['attributes'];
                                        $attributes['tax_amount'] = $tax;
                                        $attributes['discount_amount'] = number_format($product_discountAmount,2);
                                        $attributes['discount_amount_percent'] = $discountValue;

                                        //echo "<pre>";print_r($attributes);
                                        Cart::update($value['__raw_id'], array('attributes' => $attributes));

                                    }//die();
                                    $round99_total_amount = cartAmountToNineNine(Session::get('service_charge')+Session::get('delivery_charge')+Session::get('surcharge')+Session::get('tax'), $discountAmount);
                                    $round99_total_amount_before_tax = cartAmountToNineNine(Session::get('service_charge')+Session::get('delivery_charge')+Session::get('surcharge'), $discountAmount);
                                    
                                    $returnData = array('success' => true, 'discountMsg' => $discountMsg, 'round99_total_amount' => $round99_total_amount, 'round99_total_amount_before_tax' => $round99_total_amount_before_tax, 'actDiscountAmount' => $discountAmount, 'discountAmount' => convertPrice($discountAmount), 'tax' => convertPrice(Session::get('tax')), 'service_charge' => convertPrice(Session::get('service_charge')), 'total_amount' => convertPrice(Session::get('total_amount')), 'delivery_charge' => convertPrice(Session::get('delivery_charge')), 'surcharge' => convertPrice(Session::get('surcharge')), 'total_amount_before_tax' => convertPrice(Session::get('total_amount_before_tax')), 'before_convert_total_amount' => Session::get('total_amount'), 'before_convert_total_amount_before_tax' => Session::get('total_amount_before_tax'), 'apply_on' => 'merchandise');
                                } else {
                                    $discountMsg = 'The coupon has been reached to its maximum usage';
                                    $discountArray = array(
                                        'discount_value' => 0,
                                        'discount_value_type' => '',
                                        'discount_amount' => 0,
                                        'discount_code' => '',
                                        'discount_type' => '',
                                        'discount_format' => '',
                                        'apply_on' => '',
                                        'discount_apply_on' => 0
                                    );

                                    Session::put('discount', $discountArray);
                                    $returnData = array('success' => false, 'discountMsg' => $discountMsg, 'tax' => convertPrice(Session::get('tax')), 'service_charge' => convertPrice(Session::get('service_charge')), 'total_amount' => convertPrice(Session::get('total_amount')), 'delivery_charge' => convertPrice(Session::get('delivery_charge')), 'surcharge' => convertPrice(Session::get('surcharge')), 'total_amount_before_tax' => convertPrice(Session::get('total_amount_before_tax')), 'before_convert_total_amount' => Session::get('total_amount'), 'before_convert_total_amount_before_tax' => Session::get('total_amount_before_tax'), 'apply_on' => 'merchandise');
                                }
                            } else {
                                Session::forget('discount');
                                $discountMsg = 'The promotion code has been expired';
                                $returnData = array('success' => false, 'discountMsg' => $discountMsg, 'tax' => convertPrice(Session::get('tax')), 'service_charge' => convertPrice(Session::get('service_charge')), 'total_amount' => convertPrice(Session::get('total_amount')), 'delivery_charge' => convertPrice(Session::get('delivery_charge')), 'surcharge' => convertPrice(Session::get('surcharge')), 'total_amount_before_tax' => convertPrice(Session::get('total_amount_before_tax')), 'before_convert_total_amount' => Session::get('total_amount'), 'before_convert_total_amount_before_tax' => Session::get('total_amount_before_tax'), 'apply_on' => 'merchandise');
                            }
                        }

                        break;

                    default:
                        break;
                }
            } else {
                switch ($discount['discount_apply_on']) {
                    case 1:

                        $product_numbers = explode(',', $discount['product_sku']);

                        $product_exist = 0;
                        $product_code = 0;
                        $varient_id = 0;
                        $product_price = 0;
                        $tax = 0;
                        $total_addon_charge = 0;
                        foreach ($cart_data['default'] as $key => $value) {
                            $data = json_decode($value);
                            $province_id = $data->attributes->province_id;
                            $province_data = Province::where('id', '=', $province_id)->first();
                            $location_tax_percentage = 0;
                            if (isset($province_data) && sizeof($province_data)) {
                                $location_tax_percentage = $province_data['location_tax'];
                            }
                            if ($data->attributes->delivery_method_id == 1) {
                                $service_charge = $methods['delivery_charge'];
                                $delivery_charge = 0;
                            } else {
                                $service_charge = 0;
                                $delivery_charge = $methods['delivery_charge'];
                            }
                            $addons_charge = 0;
                            $extra_charge = $data->attributes->extra_charge;

                            if (isset($data->attributes->addons) && sizeof($data->attributes->addons)) {
                                $addonItems = $data->attributes->addons;

                                foreach ($addonItems as $adnItem) {
                                    $addons_charge += $adnItem->addon_price_value;
                                }
                            }
                            $total_addon_charge += $addons_charge;
                            if (in_array($data->attributes->code, $product_numbers)) {
                                $product_exist = 1;
                                $product_code = $data->attributes->code;
                                $varient_id = $data->attributes->varient_id;
                                $product_price = $data->price;

                                $discount_total = $data->total + $service_charge + $delivery_charge + $extra_charge + $addons_charge;
                                $discount_tax = $location_tax_percentage / 100;
                                //break;
                            } else {
                                $tax = $tax + (($data->total + $service_charge + $delivery_charge + $extra_charge + $addons_charge) * ($location_tax_percentage / 100));
                            }
                        }

                        Session::put('tax', $tax);
                        Session::put('total_amount', ($total_service_charge + $tax + $cartTotal + $total_delivery_charge));
                        Session::put('total_amount_before_tax', ($total_service_charge + $cartTotal + $total_delivery_charge));

                        //Check cart on product number
                        //---------------------------
                        if (!$product_code) {
                            $discountMsg = 'The promotion code is not valid for the selected products.';
                            $discountArray = array(
                                'discount_value' => 0,
                                'discount_value_type' => '',
                                'discount_amount' => 0,
                                'discount_code' => '',
                                'discount_type' => '',
                                'discount_format' => '',
                                'apply_on' => '',
                                'discount_apply_on' => 0
                            );

                            Session::put('discount', $discountArray);
                            $returnData = array('success' => false, 'discountMsg' => $discountMsg, 'tax' => convertPrice(Session::get('tax')), 'service_charge' => convertPrice(Session::get('service_charge')), 'total_amount' => convertPrice(Session::get('total_amount')), 'delivery_charge' => convertPrice(Session::get('delivery_charge')), 'surcharge' => convertPrice(Session::get('surcharge')), 'total_amount_before_tax' => convertPrice(Session::get('total_amount_before_tax')), 'before_convert_total_amount' => Session::get('total_amount'), 'before_convert_total_amount_before_tax' => Session::get('total_amount_before_tax'), 'apply_on' => 'shipping');
                        } else {
                            //Check discount start/end date
                            //-----------------------------
                            if ((date("Y-m-d") >= $discount['start_date']) && (date("Y-m-d") <= $discount['expiry_date'])) {

                                //Check code limit usage
                                //----------------------
                                if ($discount['limit_usage_by'] >= 1) {
                                    $discountValue = $discount['discount_value'];
                                    $discountValueType = $discount['discount_value_type'];
                                    $discountCode = $discount['discount_code'];
                                    $discount_type = $discount['discount_type'];
                                    $discount_format = $discount['discount_format'];
                                    $apply_on = $discount['apply_on'];
                                    $discount_apply_on = $discount['discount_apply_on'];

                                    $product_details = '';
                                    //Check code type
                                    //---------------
                                    if ($discountValueType == '%') {
                                        $discountAmount = (($delivery_charge * $discountValue) / 100);
                                    } else if ($discountValueType == '$') {
                                        if ($delivery_charge > $discountValue) {
                                            $discountAmount = $discountValue;
                                        } else {
                                            $discountAmount = $delivery_charge;
                                        }
                                    } else {
                                        $discountAmount = 0;
                                    }

                                    $discountArray = array(
                                        'discount_value' => $discountValue,
                                        'discount_value_type' => $discountValueType,
                                        'discount_amount' => $discountAmount,
                                        'discount_code' => $discountCode,
                                        'discount_type' => $discount_type,
                                        'discount_format' => $discount_format,
                                        'apply_on' => $apply_on,
                                        'discount_apply_on' => $discount_apply_on
                                    );

                                    $tax = $tax + (($discount_total - $discountAmount) * $discount_tax);
                                    Session::put('tax', $tax);

                                    $total_amount = ($total_service_charge + $tax + $cartTotal + $total_delivery_charge) - $discountAmount;

                                    Session::put('total_amount', $total_amount);
                                    Session::put('total_amount_before_tax', ($total_amount - $tax));

                                    $discountMsg = 'Promo Code Applied Successfully';
                                    Session::put('discount', $discountArray);
                                    
                                    $round99_total_amount = cartAmountToNineNine(Session::get('service_charge')+Session::get('delivery_charge')+Session::get('surcharge')+Session::get('tax'), $discountAmount);
                                    $round99_total_amount_before_tax = cartAmountToNineNine(Session::get('service_charge')+Session::get('delivery_charge')+Session::get('surcharge'), $discountAmount);
                                    
                                    $returnData = array('success' => true, 'discountMsg' => $discountMsg, 'round99_total_amount' => $round99_total_amount, 'round99_total_amount_before_tax' => $round99_total_amount_before_tax, 'actDiscountAmount' => $discountAmount, 'discountAmount' => convertPrice($discountAmount), 'tax' => convertPrice(Session::get('tax')), 'service_charge' => convertPrice(Session::get('service_charge')), 'total_amount' => convertPrice(Session::get('total_amount')), 'delivery_charge' => convertPrice(Session::get('delivery_charge')), 'surcharge' => convertPrice(Session::get('surcharge')), 'total_amount_before_tax' => convertPrice(Session::get('total_amount_before_tax')), 'before_convert_total_amount' => Session::get('total_amount'), 'before_convert_total_amount_before_tax' => Session::get('total_amount_before_tax'), 'apply_on' => 'shipping');
                                } else {
                                    $discountMsg = 'The coupon has been reached to its maximum usage';
                                    $discountArray = array(
                                        'discount_value' => 0,
                                        'discount_value_type' => '',
                                        'discount_amount' => 0,
                                        'discount_code' => '',
                                        'discount_type' => '',
                                        'discount_format' => '',
                                        'apply_on' => '',
                                        'discount_apply_on' => 0
                                    );

                                    Session::put('discount', $discountArray);
                                    $returnData = array('success' => false, 'discountMsg' => $discountMsg, 'tax' => convertPrice(Session::get('tax')), 'service_charge' => convertPrice(Session::get('service_charge')), 'total_amount' => convertPrice(Session::get('total_amount')), 'delivery_charge' => convertPrice(Session::get('delivery_charge')), 'surcharge' => convertPrice(Session::get('surcharge')), 'total_amount_before_tax' => convertPrice(Session::get('total_amount_before_tax')), 'before_convert_total_amount' => Session::get('total_amount'), 'before_convert_total_amount_before_tax' => Session::get('total_amount_before_tax'), 'apply_on' => 'shipping');
                                }
                            } else {
                                Session::forget('discount');

                                $discountMsg = 'The promotion code has been expired';
                                $returnData = array('success' => false, 'discountMsg' => $discountMsg, 'tax' => convertPrice(Session::get('tax')), 'service_charge' => convertPrice(Session::get('service_charge')), 'total_amount' => convertPrice(Session::get('total_amount')), 'delivery_charge' => convertPrice(Session::get('delivery_charge')), 'surcharge' => convertPrice(Session::get('surcharge')), 'total_amount_before_tax' => convertPrice(Session::get('total_amount_before_tax')), 'before_convert_total_amount' => Session::get('total_amount'), 'before_convert_total_amount_before_tax' => Session::get('total_amount_before_tax'), 'apply_on' => 'shipping');
                            }
                        }

                        break;

                    case 2:

                        break;

                    case 3:

                        //Discount Applied On Cart Total Min Amount Only
                        //----------------------------------------------

                        if ($cartTotal <= $discount['fixed_amount']) {
                            $discountMsg = 'The promotion code applies for a minimum order value of $' . $discount['fixed_amount'];
                            $discountArray = array(
                                'discount_value' => 0,
                                'discount_value_type' => '',
                                'discount_amount' => 0,
                                'discount_code' => '',
                                'discount_type' => '',
                                'discount_format' => '',
                                'apply_on' => '',
                                'discount_apply_on' => 0
                            );

                            Session::put('discount', $discountArray);
                            $returnData = array('success' => false, 'discountMsg' => $discountMsg, 'tax' => convertPrice(Session::get('tax')), 'service_charge' => convertPrice(Session::get('service_charge')), 'total_amount' => convertPrice(Session::get('total_amount')), 'delivery_charge' => convertPrice(Session::get('delivery_charge')), 'surcharge' => convertPrice(Session::get('surcharge')), 'total_amount_before_tax' => convertPrice(Session::get('total_amount_before_tax')), 'before_convert_total_amount' => Session::get('total_amount'), 'before_convert_total_amount_before_tax' => Session::get('total_amount_before_tax'), 'apply_on' => 'shipping');
                        } else {
                            //Check discount start/end date
                            //-----------------------------
                            if ((date("Y-m-d") >= $discount['start_date']) && (date("Y-m-d") <= $discount['expiry_date'])) {

                                //Check code limit usage
                                //----------------------
                                if ($discount['limit_usage_by'] >= 1) {
                                    $tax = 0;
                                    $discountValue = $discount['discount_value'];
                                    $discountValueType = $discount['discount_value_type'];
                                    $discountCode = $discount['discount_code'];
                                    $discount_type = $discount['discount_type'];
                                    $discount_format = $discount['discount_format'];
                                    $apply_on = $discount['apply_on'];
                                    $discount_apply_on = $discount['discount_apply_on'];

                                    //Check code type
                                    //---------------
                                    if ($discountValueType == '%') {
                                        $discountAmount = ($delivery_charge * $discountValue) / 100;

                                    } else if ($discountValueType == '$') {
                                        if ($delivery_charge > $discountValue) {
                                            $discountAmount = $discountValue;
                                        } else {
                                            $discountAmount = $delivery_charge;
                                        }

                                    } else {
                                        $discountAmount = 0;

                                    }

                                    $discountArray = array(
                                        'discount_value' => $discountValue,
                                        'discount_value_type' => $discountValueType,
                                        'discount_amount' => $discountAmount,
                                        'discount_code' => $discountCode,
                                        'discount_type' => $discount_type,
                                        'discount_format' => $discount_format,
                                        'apply_on' => $apply_on,
                                        'discount_apply_on' => $discount_apply_on
                                    );

                                    $discountMsg = 'Your Promo Code Has Been Applied Successfully on shipping.';
                                    Session::put('discount', $discountArray);

                                    $tax = (($cartTotal - $discountAmount) * ($location_tax_percentage / 100));
                                    Session::put('tax', $tax);

                                    $total_amount = ($total_service_charge + $tax + $cartTotal + $total_delivery_charge) - $discountAmount;
                                    Session::put('total_amount', $total_amount);
                                    Session::put('total_amount_before_tax', ($total_amount - $tax));
                                    
                                    $round99_total_amount = cartAmountToNineNine(Session::get('service_charge')+Session::get('delivery_charge')+Session::get('surcharge')+Session::get('tax'), $discountAmount);
                                    $round99_total_amount_before_tax = cartAmountToNineNine(Session::get('service_charge')+Session::get('delivery_charge')+Session::get('surcharge'), $discountAmount);
                                    
                                    $returnData = array('success' => true, 'discountMsg' => $discountMsg, 'round99_total_amount' => $round99_total_amount, 'round99_total_amount_before_tax' => $round99_total_amount_before_tax, 'actDiscountAmount' => $discountAmount, 'discountAmount' => convertPrice($discountAmount), 'tax' => convertPrice(Session::get('tax')), 'service_charge' => convertPrice(Session::get('service_charge')), 'total_amount' => convertPrice(Session::get('total_amount')), 'delivery_charge' => convertPrice(Session::get('delivery_charge')), 'surcharge' => convertPrice(Session::get('surcharge')), 'total_amount_before_tax' => convertPrice(Session::get('total_amount_before_tax')), 'before_convert_total_amount' => Session::get('total_amount'), 'before_convert_total_amount_before_tax' => Session::get('total_amount_before_tax'), 'apply_on' => 'shipping');
                                } else {
                                    $discountMsg = 'The coupon has been reached to its maximum usage';
                                    $discountArray = array(
                                        'discount_value' => 0,
                                        'discount_value_type' => '',
                                        'discount_amount' => 0,
                                        'discount_code' => '',
                                        'discount_type' => '',
                                        'discount_format' => '',
                                        'apply_on' => '',
                                        'discount_apply_on' => 0
                                    );

                                    Session::put('discount', $discountArray);
                                    $returnData = array('success' => false, 'discountMsg' => $discountMsg, 'tax' => convertPrice(Session::get('tax')), 'service_charge' => convertPrice(Session::get('service_charge')), 'total_amount' => convertPrice(Session::get('total_amount')), 'delivery_charge' => convertPrice(Session::get('delivery_charge')), 'surcharge' => convertPrice(Session::get('surcharge')), 'total_amount_before_tax' => convertPrice(Session::get('total_amount_before_tax')), 'before_convert_total_amount' => Session::get('total_amount'), 'before_convert_total_amount_before_tax' => Session::get('total_amount_before_tax'), 'apply_on' => 'shipping');
                                }
                            } else {
                                Session::forget('discount');
                                $discountMsg = 'The promotion code has been expired';
                                $returnData = array('success' => false, 'discountMsg' => $discountMsg, 'tax' => convertPrice(Session::get('tax')), 'service_charge' => convertPrice(Session::get('service_charge')), 'total_amount' => convertPrice(Session::get('total_amount')), 'delivery_charge' => convertPrice(Session::get('delivery_charge')), 'surcharge' => convertPrice(Session::get('surcharge')), 'total_amount_before_tax' => convertPrice(Session::get('total_amount_before_tax')), 'before_convert_total_amount' => Session::get('total_amount'), 'before_convert_total_amount_before_tax' => Session::get('total_amount_before_tax'), 'apply_on' => 'shipping');
                            }
                        }

                        break;

                    default:
                        break;
                }
            }
        } else {

            Session::forget('discount');

            $discountMsg = 'The promotion code you entered does not exist';
            $returnData = array('success' => false, 'discountMsg' => $discountMsg, 'tax' => convertPrice(Session::get('tax')), 'service_charge' => convertPrice(Session::get('service_charge')), 'total_amount' => convertPrice(Session::get('total_amount')), 'delivery_charge' => convertPrice(Session::get('delivery_charge')), 'surcharge' => convertPrice(Session::get('surcharge')), 'total_amount_before_tax' => convertPrice(Session::get('total_amount_before_tax')), 'before_convert_total_amount' => Session::get('total_amount'), 'before_convert_total_amount_before_tax' => Session::get('total_amount_before_tax'));
        }
        return $returnData;*/


    }

    
}

function isCartKeyExist(cart_key, callback){

  dbModel.findOne("cart", "cart_key", cart_key, function(error, result){
    if(error){
      callback(error);
    }else{
      if(result.length > 0 && result[0].id > 0){
        callback(null, result);
      }else{
        callback(null, '0');
      }
    }

  });

}

function getUserCart(user_id, callback){

  var sql = "SELECT id,cart_key FROM cart WHERE user_id ="+user_id;
  //console.log(sql);
  dbModel.rawQuery(sql, function(error, result){
    if(error){
      callback(error);
    }else{
      if(result.length > 0 && result[0].id > 0){
        callback(null, result);
      }else{
        callback(null, 0);
      }
    }

  });

}

function isCartProductExist(cart_key, product_id, product_variant_id, delivery_date, callback){

  var sql = "SELECT cp.cart_id FROM cart c INNER JOIN cart_products cp ON(c.id = cp.cart_id)"
  sql += " WHERE c.cart_key = '"+cart_key+"'";
  sql += " AND cp.product_id ="+product_id;
  sql += " AND cp.product_variant_id ="+product_variant_id;

  if(delivery_date != '' && delivery_date != undefined){
    sql += " AND cp.delivery_date = '"+delivery_date+"'";    
  }

  sql += " LIMIT 1";

  //console.log(sql);

  dbModel.rawQuery(sql, function(error, result){

    if(error){
      callback(error);
    } else {

      if(result.length > 0 && result[0].cart_id > 0){
        callback(null, result[0].cart_id);
      }else{
        callback(null, 0);
      }
    }

  });  

}

function updateCartProductQuantity(cart_id, product_id, product_variant_id, delivery_date, callback){

  var sql = "UPDATE cart_products SET quantity = (quantity + 1)"
  sql += " WHERE cart_id = "+cart_id;
  sql += " AND product_id ="+product_id;
  sql += " AND product_variant_id ="+product_variant_id;

  if(delivery_date != '' && delivery_date != undefined){
    sql += " AND delivery_date = '"+delivery_date+"'";
  }

  dbModel.rawQuery(sql, function(error, result){
    
    if(error){
      callback(error);            
    }else{
      if(result.affectedRows > 0){
        callback(null, true);
      }else{
        callback(null, false);
      }            
    }

  });

}

function isCartProductDeleted(cart_id, cart_product_id, product_id, product_variant_id, callback){

  var sql = "SELECT cp.id FROM cart c INNER JOIN cart_products cp ON(c.id = cp.cart_id)"
  sql += " WHERE c.id = '"+cart_id+"'";
  sql += " AND cp.id ="+cart_product_id;
  sql += " AND cp.product_id ="+product_id;
  sql += " AND cp.product_variant_id ="+product_variant_id;

  dbModel.rawQuery(sql, function(error, result){

    if(error){
      callback(error);
    } else {

      if(result.length > 0 && result[0].id > 0){
        callback(null, false);
      }else{
        callback(null, true);
      }
    }

  });

}

function getCartProdcuts(cart_id, language_id, callback){

  var sql = "SELECT lp.product_name, p.product_code, p.vendor_id, CONCAT('"+config.RESOURCE_URL+"',REPLACE(p.product_picture, '+','%2B')) as product_picture, cp.*,pp.price_value FROM cart c INNER JOIN cart_products cp ON(c.id = cp.cart_id)";
  sql += " LEFT JOIN product_prices pp ON(pp.product_id = cp.product_id)";
  sql += " LEFT JOIN products p ON(p.id = pp.product_id)";
  sql += " LEFT JOIN language_product lp ON(lp.product_id = p.id)";
  sql += " WHERE p.product_status = 1";
  sql += " AND p.admin_confirm = 1";
  sql += " AND p.product_status = 1";
  sql += " AND c.id ="+cart_id;
  sql += " AND lp.language_id ="+language_id;

  //console.log(sql);

  dbModel.rawQuery(sql, function(error, result){

    if(error){
      callback(error);
    } else {

      if(result.length > 0){
        callback(null, result);
      }else{
        callback(null, []);
      }
    }

  });

}



/*function isCartProductExist(cart_key, product_id, callback){

  var sql = "SELECT * FROM cart c INNER JOIN cart_products cp ON(c.id = cp.cart_id) WHERE cart_key = '"+cart_key+"' AND cp.product_id ="+product_id;    

  dbModel.rawQuery(sql, function(error, result){

    if(error){
      callback(error);
    } else {

      if(result.length > 0){
        callback(null, "true");
      }else{
        callback(null, "false");
      }
    }

  });  

}*/

module.exports = new CartController();
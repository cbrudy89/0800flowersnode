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
    var prod_delivery_method_id = req.body.prod_delivery_method_id ? req.body.prod_delivery_method_id : 0;
    var location = req.body.location

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
          var isUpdated = updateCartProductColumn.sync(null, cartId, product_id, product_variant_id, delivery_date, null, null);

          // If unable to updated cart product quantity show error.
          if(isUpdated){

            var cartCount = commonHelper.cartCount.sync(null, user_id, cart_key);

            var resp = {
              "cart_key" : cart_key,
              "cartCount" : cartCount
            };    

            res.status(config.HTTP_SUCCESS).send({
                status: config.SUCCESS, 
                code : config.HTTP_SUCCESS, 
                message: 'Product Added to cart!',
                result: resp
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
                  "prod_delivery_method_id": prod_delivery_method_id,
                  "delivery_date": delivery_date
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

  this.updateCartProductColumn = function(req, res){
   
    var cart_key = req.headers['cart_key'] || '';
    var row_id = req.body.row_id;
    var product_id = req.body.product_id;
    var product_variant_id = req.body.product_variant_id;
    var delivery_date = req.body.delivery_date || null;
    var quantity = req.body.quantity || null;  /////to update product quantity

    /*var currentDate = new Date($deldate); 
    var twoDigitMonth=((currentDate.getMonth()+1)>=10)? (currentDate.getMonth()+1) : '0' + (currentDate.getMonth()+1);  
    var twoDigitDate=((currentDate.getDate())>=10)? (currentDate.getDate()) : '0' + (currentDate.getDate());
    var caldate = currentDate.getFullYear() + "-" + twoDigitMonth + "-" + twoDigitDate; */ 

    if(delivery_date == null && quantity == null){

        return res.status(config.HTTP_NOT_FOUND).send({
            status: config.ERROR, 
            code : config.HTTP_NOT_FOUND,          
            message: "Unable to process request, Please try again!"
        });

    }

    Sync(function(){
      
      // Check if cart key exist or not.
      var isCartExist = isCartProductExist.sync(null, cart_key, product_id, product_variant_id, '');
      if(isCartExist){
        // Update product delivery_date in cart
        resp=updateCartProductColumn.sync(null, isCartExist, product_id, product_variant_id, delivery_date,row_id,quantity);
        res.status(config.HTTP_SUCCESS).send({
            status: config.SUCCESS, 
            code : config.HTTP_SUCCESS, 
            message: 'Product delivery date updated'
        });
      }else{
        res.status(config.HTTP_NOT_FOUND).send({
            status: config.ERROR, 
            code : config.HTTP_NOT_FOUND,          
            message: "Unable to process request, Please try again!"
        });

      }

    });

  }

  this.removeCartProduct = function(req, res){

    var return_data = {};
    
    var row_id = req.body.row_id;
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
        var isDeleted = isCartProductDeleted.sync(null, cart_id, row_id, product_id, product_variant_id);
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
              {'id': {'val': row_id, 'cond': '='}},
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
                      message: "Product removed from cart!",
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

    var language_code = req.query.language_code;
    var country_id = req.query.country_id;
    var currency_id = req.query.currency_id;

    var token = req.headers['token'] || '' ;
    var cart_key = req.headers['cart_key'] || '';
    var user_id = cartCount = 0;
    var cart_id = current_currency = '';
    var total = 0.00;

    //var cart_total = {};

    //var cartProducts = [];
    //var total = '';
    
    // var discount = ''; // Promo Discount
    // var surcharge = ''; // Surcharge
    // var service_charge = ''; // Service Charge
    // var delivery_charge = ''; //Shipping Charge
    // var total_amount_before_tax = ''; // Total Amount Before Tax
    // var tax = ''; // Total Tax
    // var total = ''; // In Current Currency if not USD
    // var ordear_total = '' // In USD    

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

          if((cart_id == '' || cart_id == undefined)){

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

        if(cartItems.length > 0 && currency_details.length > 0){

          for(var i=0,j=1; i < cartItems.length; i++){
              //console.log(cartItems);

              var product = commonHelper.getProductDetails.sync(null, cartItems[i].product_id, cartItems[i].product_variant_id);
              cartItems[i].sku = product[0].sku;

              var sub_total = '';

              if(currency_details[0].currency_code == 'INR'){

                sub_total = cartItems[i].price_value * cartItems[i].quantity;              
                total += sub_total;

                 //console.log($variantdetails[i].price_value);
                var actPrice = commonHelper.number_format.sync(null, (cartItems[i].price_value * currency_details[0].exchange_rate), 2, '.', ',');

                //var $current_currency = price_data.currency_result[0].symbol+" "+price_data.currency_result[0].currency_code;
                var current_currency = currency_details[0].currency_code;

                var currentCurrSymbl = currency_details[0].symbol;
                if(current_currency !== "USD"){ 
                    actPrice = commonHelper.roundToNineNine.sync(null, actPrice, current_currency);
                }

              }else{

                var actPrice = commonHelper.number_format.sync(null, (cartItems[i].price_value * currency_details[0].exchange_rate), 2, '.', ',');

                //var $current_currency = price_data.currency_result[0].symbol+" "+price_data.currency_result[0].currency_code;
                var current_currency = currency_details[0].currency_code;

                var currentCurrSymbl = currency_details[0].symbol;
                if(current_currency !== "USD"){ 
                    actPrice = commonHelper.roundToNineNine.sync(null, actPrice, current_currency);
                }

                sub_total = actPrice * cartItems[i].quantity;              
                total += sub_total;                
                
              }
              
              price = currentCurrSymbl + actPrice;
              cartItems[i].price_value = price;

              cartCount += j;
          }

          if(currency_details[0].currency_code == 'INR'){

            total = commonHelper.number_format.sync(null, (total * currency_details[0].exchange_rate), 2, '.', ',');
            if(currency_details[0].currency_code !== "USD"){ 
                actPrice = commonHelper.roundToNineNine.sync(null, total, currency_details[0].currency_code);
            }        

            total = currency_details[0].symbol + total;
            
          }else{
            total = currency_details[0].symbol + total;
          }
        }
        //cart_total.total = current_currency + total;

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
          "cartCount": cartCount,
          "cartItems": cartItems,
          "sub_total": total
        }

        return res.status(config.HTTP_SUCCESS).send({
            status: config.SUCCESS, 
            code : config.HTTP_SUCCESS,          
            message: "Products in cart",
            result: resp
        });      

    });


  }


  this.updateCart = function(req, res){

    var token = req.headers['token'] || '' ;
    var cart_id = '';
    var cart_key = req.headers['cart_key'] || '';
    var user_id = 0;

    var type = req.body.type;
    var cardMessage = req.body.cardMessage;
    var deliveryInformation = req.body.deliveryInformation;

    var calErrors = {};
    var finalErrors = [];

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
                country_id = userCart[0].country_id;

            }else{

              res.status(config.HTTP_SERVER_ERROR).send({
                  status: config.ERROR, 
                  code : config.HTTP_SERVER_ERROR,          
                  message: "Unable to update cart product"
              });

            }

          }else if (cartData[0].id > 0){

            cart_id = cartData[0].id; 
            cart_key = cartData[0].cart_key;
            country_id = cartData[0].country_id;

          }else{

            res.status(config.HTTP_SERVER_ERROR).send({
                status: config.ERROR, 
                code : config.HTTP_SERVER_ERROR,          
                message: "Unable to update cart product"
            }); 

          }
          
        }else{

            res.status(config.HTTP_SERVER_ERROR).send({
                status: config.ERROR, 
                code : config.HTTP_SERVER_ERROR,          
                message: "Unable to update cart product"
            }); 

        }

        // For Gift Message
        if(type == 'card_message'){
  
          //var jsonData = JSON.parse(cardMessage);
          var jsonData = cardMessage;

          for (var i = 0; i < jsonData.length; i++) {
            var cardData = jsonData[i];

            var row_id = product_id = product_variant_id = '';
            var prefer_message = gift_occassion = gift_message = '';

            if(cardData.row_id == '' || 
              cardData.product_id == '' || 
              cardData.product_variant_id == '' || 
              cartData.prefer_message == ''){
              continue;
            }

            row_id = cardData.row_id;
            product_id = cardData.product_id;
            product_variant_id = cardData.product_variant_id;
            prefer_message = cardData.prefer_message;
            gift_occassion = cardData.occasion;
            gift_message = cardData.message;

            var cartId = isCartProductExist.sync(null, cart_key, product_id, product_variant_id, '');
            if(cartId == 0) continue;

            // Check if product can be delivered on selected date
            var product = commonHelper.getProductDetails.sync(null, product_id, product_variant_id);
            var cartProduct = commonHelper.getCartProduct.sync(null, cart_id, row_id);
            var countryDetails = commonHelper.getCountryDetails.sync(null, country_id);
/*
            console.log(product);
            console.log(cartProduct);*/

            if(cartProduct[0].zip_code == "" || cartProduct[0].zip_code == null){
              var zip_code = "00000";
            }else{
              var zip_code = cartProduct[0].zip_code
            }

            $newDt= cartProduct[0].delivery_date;
            //console.log($newDt);

            $dt = $newDt.split('-');
            var monthname=["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
            cartProduct[0].delivery_date = $dt[2]+'-'+monthname[parseInt($dt[1])-1]+'-'+$dt[0]; // Formatting date 27-JUL-2017            

            //console.log(cartProduct[0].delvery_date);
            //console.log(product[0].vendor_id+ ", "+ country_id+ ", "+ product_id);

            //$currencydetails = commonHelper.getCurrencyDetails.sync(null, $currency_id, $currentCountry);
            adminRestictedRates = commonHelper.adminRestictedRates.sync(null, product[0].vendor_id, country_id, product_id); // Get admin restricted dates
            vendorHolidayList= commonHelper.vendorHolidayList.sync(null, product[0].vendor_id, country_id); // Get vendor restricted holidays*/
/*            console.log(adminRestictedRates);
            console.log(vendorHolidayList);
            console.log(cartProduct[0].delivery_date);*/

            if(adminRestictedRates.indexOf(cartProduct[0].delivery_date) >= 0 ){
              calErrors[row_id] = "Unable to deliver the product sku "+ product[0].sku+" choose another date";
                continue; //admin date found
            } 

            if(vendorHolidayList.indexOf(cartProduct[0].delivery_date) >= 0 ){
              calErrors[row_id] = "Unable to deliver the product sku "+ product[0].sku+" choose another date";
                continue; //vendor date found
            }                       

            //console.log(countryDetails[0].iso_code + ", "+ product[0].sku + ", "+cartProduct[0].delivery_date + ", "+cartProduct[0].zip_code);

            var response = commonHelper.checkAvailability.sync(null, countryDetails[0].iso_code, product[0].sku, cartProduct[0].delivery_date, cartProduct[0].zip_code);

            body = JSON.parse(response);
            //console.log(body["getDlvrCalResponse"]["responseStatus"]);

            if(body["getDlvrCalResponse"]["responseStatus"] != 'SUCCESS'){
              calErrors[row_id] = "Unable to deliver the product sku "+ product[0].sku+" choose another date";
            }

            var sql = "UPDATE cart_products SET prefer_message ='"+prefer_message+"', gift_occassion = '"+gift_occassion+"', gift_message = '"+gift_message+"'";
            sql += " WHERE id ="+row_id+" AND product_id = "+product_id+" AND product_variant_id = "+product_variant_id;

            //console.log(sql);
            
            // Update Cart Product
            var response = dbModel.rawQuery.sync(null, sql);

          }

          if(calErrors != undefined && Object.keys(calErrors).length > 0){
            finalErrors.push(calErrors);            
          }

        }

        // For Delivery Info
        if(type == 'delivery_info'){

          //var jsonData = JSON.parse(cardMessage);
          var jsonData = deliveryInformation;
          //console.log(jsonData);

          for (var i = 0; i < jsonData.length; i++) {
            var deliveryData = jsonData[i];

            var row_id = product_id = product_variant_id = '';
            var full_name = address1 = address2 = city = provience_id = country_delivery_id = pincode = phone = '';

            if(deliveryData.row_id == '' 
              || deliveryData.product_id == '' 
              || deliveryData.product_variant_id == '' 
              || deliveryData.full_name == '' 
              || deliveryData.address1 == '' 
              || deliveryData.address2 == '' 
              || deliveryData.city == ''                             
              || deliveryData.provience_id == ''                             
              || deliveryData.country_delivery_id == ''                             
              || deliveryData.pincode == ''                             
              || deliveryData.phone == ''){
              continue;
            }

            row_id = deliveryData.row_id;
            product_id = deliveryData.product_id;
            product_variant_id = deliveryData.product_variant_id;

            var delivery_address = {
              "full_name": deliveryData.full_name,
              "address1": deliveryData.address1,
              "address2": deliveryData.address2,
              "city": deliveryData.city,
              "provience_id": deliveryData.provience_id,
              "country_delivery_id": deliveryData.country_delivery_id,
              "pincode": deliveryData.pincode,
              "phone":deliveryData.phone
            };

            //console.log(delivery_address);

            delivery_address = JSON.stringify(delivery_address);

            var cartId = isCartProductExist.sync(null, cart_key, product_id, product_variant_id, '');
            if(cartId == 0) continue;

            var sql = "UPDATE cart_products SET";
            sql += " delivery_address = '"+delivery_address+"'";
            sql += " WHERE id ="+row_id;
            sql += " AND product_id = "+product_id
            sql += " AND product_variant_id = "+product_variant_id;

            //console.log(sql);
            
            // Update Cart Product
            var response = dbModel.rawQuery.sync(null, sql);

          }          
          
        }

        if(finalErrors.length > 0){
          return res.status(config.HTTP_SUCCESS).send({
              status: config.SUCCESS, 
              code : config.HTTP_SUCCESS,          
              message: "Unable to process request!",
              errors: finalErrors
          });
        }else{

          return res.status(config.HTTP_SUCCESS).send({
              status: config.SUCCESS, 
              code : config.HTTP_SUCCESS,          
              message: "Information saved!"
          });
        }


    });


  }


  this.applyPromoCode = function(req, res){



  }

  this.removePromoCode = function(req, res){

  }

  // Get all saved credit cards for customer
  this.getSavedCards = function(req, res, next){

    var token = req.headers['token'] || '' ;
    var customer_id = 0;
    Sync(function(){

        if(token != '' && token != undefined){
          var decoded = commonHelper.getUserId.sync(null, token);
          //console.log('i am hrere');
          if(decoded != '' && decoded != undefined && decoded.id > 0){
            customer_id = decoded.id;
          }
        }  

        if(customer_id > 0){
            dbModel.find('customer_cards','id,name_on_card,card_last4digits,card_expiry', 'customer_id='+customer_id, '', '', function(error, result) {
              if (error) {              
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status:config.ERROR,
                    code: config.HTTP_SERVER_ERROR,
                    message:'Unable to process result!'
                  });
              }else{
                  res.status(config.HTTP_SUCCESS).send({
                      status: config.SUCCESS,
                      code: config.HTTP_SUCCESS,
                      message: result.length+" customer cards found",
                      result: result
                  });
              }
          });
        } else {
            res.status(config.HTTP_BAD_REQUEST).send({
                status:config.ERROR,
                code: config.HTTP_BAD_REQUEST, 
                message:"Invalid customer id"
            }); 
        }
    }); 
    
  }



}
/*
public function getNextOrderNumber(){
        
    try { 
        $curlData = array(
            "esbSaltaServiceRequest" => array(
                "getOrderNumberRequest" => array(
                "customerId" => $this->_customer_id,
                "customerType" => $this->_customer_type,
                "storeId" => $this->_store_id,
                "siteId" => $this->_site_id,
                "sourceSystem" => $this->_source_system,
                "brandCode" => $this->_brand_code,
                "sourceId" => $this->_sourceId
                )
            )
        );
        $curlData = json_encode($curlData); 

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $this->_get_next_order_number_url); 
        curl_setopt($ch, CURLOPT_HTTPHEADER, array( 
            'Content-Type:application/json',
            'X-IBM-Client-Id:' . $this->_client_id,
            'X-IBM-Client-Secret:' . $this->_client_secret 
        ));
        
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $curlData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $result = curl_exec($ch); 

        $getResult = json_decode($result);
        $arrResult = (array)$getResult;
        
        if (array_key_exists("httpCode",$arrResult)){
            $arrResult['success'] = false;
            return json_encode($arrResult);
        }else{ 
            $flwsErrors = (array)$getResult->esbSaltaServiceResponse->getOrdderNumberResponse->getOrdderNumberResult->flwsErrors;
            $flwsError = (array)$flwsErrors['flwsError'];

            //Check error on the object
            //-------------------------
            if(count($flwsError) > 0 && $flwsError['errorCode'] != ''){ 
                $orderNumber = '';
            }else{
                $orderNumber = $getResult->esbSaltaServiceResponse->getOrdderNumberResponse->getOrdderNumberResult->OrderNumber;
            }

            return json_encode(array('success' => true, 'nextOrderNumber' => $this->_sourceId.$orderNumber));
        }
    } catch (Exception $ex) {
        
        return $ex->getMessage();
        
    }
    
}*/

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

/*public function checkAvailability($data){
    if(is_array($data) && count($data) > 0){
        $curlData = array(
            "getDlvrCalRequest" => array(
                "partnerId" => "",
                "customerId" => $this->_customer_id,
                "customerType" => $this->_customer_type, 
                "country" => $data['country'], //"USA"
                "deliveryDate" => $data['deliveryDate'], //"30-APR-15"
                "locationType" => "1", 
                "productSku" => $data['productSku'], //"1120RD"
                "backupSku" => "",
                "backupSkuBrandCode" => "",
                "siteId" => $this->_site_id,
                "startDate" => "",
                "sourceSystem" => $this->_source_system, 
                "zipCode" => $data['zipCode'], //"11514"
                "brandCode" => $this->_brand_code
            )
        );
        $curlData = json_encode($curlData); 

        $getResult = $this->_executeCommonCurl($this->_check_availability_url, $curlData, 'checkAvailability'); 

        return $getResult;
    }else{
        return false;
    }
}

public function getCheckZipService($zipCode) {
    try {
        $curlData = array(
            "esbSaltaServiceRequest" => array(
                "checkZipRequest" => array(
                    "zipCode" => $zipCode
                )
            )
        );
        $curlData = json_encode($curlData);

        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, $this->_check_zip_service_url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Type:application/json',
            'X-IBM-Client-Id:' . $this->_client_id,
            'X-IBM-Client-Secret:' . $this->_client_secret
        ));
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $curlData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $result = curl_exec($ch);

        $getResult = json_decode($result);

        return $getResult;
    } catch (Exception $ex) {

        return $ex->getMessage();

    }
}*/

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

  var sql = "SELECT id,cart_key,country_id FROM cart WHERE user_id ="+user_id;
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

function updateCartProductColumn(cart_id, product_id, product_variant_id, delivery_date, row_id=null,quantity=null,callback){

  if(row_id != null && row_id != undefined){

    if(delivery_date != null && delivery_date != undefined){
      var sql = "UPDATE cart_products SET delivery_date = '"+delivery_date+"'";
    }else{
      var sql = "UPDATE cart_products SET delivery_date = delivery_date";
    }

    if(quantity != null && quantity != undefined){
      sql += ",quantity = "+quantity;
    }
  }else{
    var sql = "UPDATE cart_products SET quantity = (quantity + 1)";
  }

  sql += " WHERE cart_id = "+cart_id;
  sql += " AND product_id ="+product_id;
  sql += " AND product_variant_id ="+product_variant_id;
  
  if(row_id != null && row_id != undefined){
    sql += " AND id = '"+row_id+"'";
  }else{

    if(delivery_date != '' && delivery_date != undefined){
      sql += " AND delivery_date = '"+delivery_date+"'";
    }
    
  }


  //console.log(sql);

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

function isCartProductDeleted(cart_id, row_id, product_id, product_variant_id, callback){

  var sql = "SELECT cp.id FROM cart c INNER JOIN cart_products cp ON(c.id = cp.cart_id)"
  sql += " WHERE c.id = '"+cart_id+"'";
  sql += " AND cp.id ="+row_id;
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


module.exports = new CartController();
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

  var sql = "SELECT lp.product_name, p.product_code, p.vendor_id, p.product_picture, cp.*,pp.price_value FROM cart c INNER JOIN cart_products cp ON(c.id = cp.cart_id)";
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
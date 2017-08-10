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
    
    var product_id = req.body.product_id;
    var quantity = req.body.quantity;
    var language_id = req.body.langauge_code;
    var user_id = req.body.user_id ? req.body.user_id : 0;
    var delivery_date = req.body.delivery_date;
    var country_id = req.body.country_id;
    var product_variant_id = req.body.product_variant_id;
    var sku = req.body.sku;
    var extra_charge = req.body.extra_charge ? req.body.extra_charge : 0;
    var prod_delivery_method_id = req.body.prod_delivery_method_id ? req.body.prod_delivery_method_id : 0;
    var postalcode = req.body.postalcode ? req.body.postalcode : "00000";

    var cart_key = req.body.cart_key ? req.body.cart_key : 0;

    Sync(function(){

      // Check if cart is exist
          
      

      // Generate Unique cart key 
      var cart_key = crypto.createHash('sha256').update(Math.random().toString()).digest('hex');
      //console.log(cart_key);

      var cart_data = {
        "cart_key": cart_key,
        "user_id" : user_id,
        "country_id" : country_id
      };

      dbModel.save('cart', cart_data, '', function(error, result){
        if(error) {
            res.status(config.HTTP_SERVER_ERROR).send({
                status: config.ERROR, 
                code : config.HTTP_SERVER_ERROR,          
                message: "Unable to process request, Please try again!",
                err: error
            });

        } else{
          //console.log(result);

          if(result.insertId > 0){

            var cart_id = result.insertId;

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

                if(result_cart_product.insertId > 0){
                  // Return cart id to user

                  var resp = {
                    "cart_key" : cart_key
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
      
    });


  }

  this.updateCartProductQuantity = function(req, res){

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

  }

  this.removeCart = function(req, res){

  }

  this.getCart = function(req, res){

    var cart_key = req.body.cart_key;
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

  this.applyPromoCode = function(req, res){

  }

  this.removePromoCode = function(req, res){

  }

  function isCartProductExist(cart_key, product_id, callback){

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

  }

}


module.exports = new CartController();
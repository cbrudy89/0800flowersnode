var jwt=require('jsonwebtoken');
var Joi = require('joi');
var config = require('./../../config');
var connection = require('./../../database');
var dbModel = require('./../models/db-model');

function WishlistController() {

  // Get User Wishlist
  this.getwishlist = function(req, res, next){
    var user_id = req.body.user_id;
    var country_id = req.body.country_id;
    var language_id = req.body.language_id;

    var sql ="SELECT `products`.id, `qty`,`language_product`.product_name,`language_product`.product_description, slug, product_code, product_picture FROM `products` "; 
    sql +=" INNER JOIN `location_product` ON `products`.`id` = `location_product`.`product_id`"; 
    sql +=" INNER JOIN `language_product` ON `language_product`.`product_id` = `products`.`id`"; 
    sql +=" INNER JOIN `wishlist` ON `wishlist`.`product_id` = `products`.`id`"; 
    sql +=" WHERE `product_status` = 1"; 
    sql +=" AND `products`.`admin_confirm` = 1"; 
    sql +=" AND `products`.`frontend_show` = 1"; 
    sql +=" AND `language_product`.`language_id` = "+language_id; 
    sql +=" AND `location_product`.`country_id` = "+country_id; 
    sql +=" AND `wishlist`.`user_id` = "+user_id; 
    sql +=" GROUP BY `products`.`id`";

    dbModel.rawQuery(sql, function(err, results){
      if (err) {
        res.status(config.HTTP_SERVER_ERROR).send({
          status: config.ERROR, 
          code : config.HTTP_SERVER_ERROR, 
          message : "Unable to process request!", 
          errors : err
        });
      }else{
        //console.log(results);return;
        if(results.length > 0 && results[0].id > 0 ){
          res.status(config.HTTP_SUCCESS).send({
            status: config.SUCCESS, 
            code : config.HTTP_SUCCESS, 
            results : results
          });
        }else{
          res.status(config.HTTP_SUCCESS).send({
            status: config.HTTP_SUCCESS, 
            code : config.HTTP_SUCCESS, 
            message : "No products found", 
          });          
        }
      }
    });
  }
    // add wishlist product
  this.addwishlistproduct = function(req, res, next){
    var user_id = req.body.user_id;
    var product_id = req.body.product_id;
    var qty = req.body.qty;
    var sql ="SELECT * FROM wishlist WHERE user_id = "+user_id+" AND product_id = "+product_id;
    dbModel.rawQuery(sql, function(err, results){
      if (err) {
        res.status(config.HTTP_SERVER_ERROR).send({
          status: config.ERROR, 
          code : config.HTTP_SERVER_ERROR, 
          message : "Unable to process request!", 
          errors : err
        });
      }else{
        //console.log(results);return;
        if(results.length > 0 && results[0].id > 0 ){ //////Update qty for old wishlist product
              /*var productqty=results[0].qty;
              productqty=parseInt(productqty)+parseInt(qty);
              var sql="UPDATE wishlist set qty="+productqty+" WHERE user_id = "+user_id+" AND product_id = "+product_id;
              dbModel.rawQuery(sql, function(err, result){
                if (err) {
                    res.status(config.HTTP_SERVER_ERROR).send({
                      status:config.ERROR,
                      code: config.HTTP_SERVER_ERROR,
                      message:'Unable to update wishlist product.'
                    });
                }else{
                    res.status(config.HTTP_SUCCESS).send({
                      status:config.SUCCESS,
                      code: config.HTTP_SUCCESS,
                      message:'wishlist product updated successfully.'
                    });
                  }
              });*/

        }else{ //////Insert wishlist product
              /*var post = {
                user_id: req.body.user_id,
                product_id: req.body.product_id,
                qty: req.body.qty
              };*/
              var sql="INSERT INTO wishlist (user_id, product_id, qty) VALUES ('"+user_id+"', '"+product_id+"', '"+qty+"')";
              //console.log(sql);
              dbModel.rawQuery(sql, function(err, result){
                if (err) {
                    res.status(config.HTTP_SERVER_ERROR).send({
                      status:config.ERROR,
                      code: config.HTTP_SERVER_ERROR,
                      message:'Unable to insert wishlist product.'
                    });
                }
              });          
        }
        res.status(config.HTTP_SUCCESS).send({
          status:config.SUCCESS,
          code: config.HTTP_SUCCESS,
          message:'wishlist product inserted successfully.'
        });
      }
    });
  }

   // delete wishlist product 
  this.deletewishlistproduct = function(req,res){
      var user_id = req.body.user_id;
      var product_id = req.body.product_id;
      var sql="SELECT * FROM wishlist WHERE user_id = "+user_id+" AND product_id = "+product_id;
      dbModel.rawQuery(sql, function(err, results){
          if (err) {
              res.status(config.HTTP_SERVER_ERROR).send({
                status:config.ERROR,
                code: config.HTTP_SERVER_ERROR,
                message:'There are some error with query'
              })
          }else{ 
              if(results.length > 0 && results[0].id > 0 ){
                  var sql="DELETE from wishlist WHERE user_id = "+user_id+" AND product_id = "+product_id;
                  dbModel.rawQuery(sql, function(err, results){           
                    if (err) {
                        res.status(config.HTTP_SERVER_ERROR).send({
                          status:config.ERROR,
                          code: config.HTTP_SERVER_ERROR,
                          message:'Unable to delete wishlist product.'
                        });
                    }else{
                        res.status(config.HTTP_SUCCESS).send({
                          status:config.SUCCESS,
                          code: config.HTTP_SUCCESS,
                          message:'wishlist product deleted.'
                        });
                    }
                  });
              }
              else {
                res.status(config.HTTP_BAD_REQUEST).send({
                  status:config.HTTP_BAD_REQUEST,
                  code: config.HTTP_BAD_REQUEST,
                  message:'wishlist product not found.'
                });
              }
          }
        });
  }




}

module.exports = new WishlistController();
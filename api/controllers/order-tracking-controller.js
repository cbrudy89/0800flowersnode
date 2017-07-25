var Joi = require('joi');
var async = require('async');

var config = require('./../../config');
var orderModel = require('./../models/order-model');
var dbModel = require('./../models/db-model');

function OrderTrackingController() {

  // Track Order by order id
  this.trackOrder = function(req,res,next){   
    
    var order_id=req.body.order_id;
    //var zip_code=req.body.zip_code;

    orderModel.checkOrderIdExist(order_id, function(err, result) {
      if (err) {
        res.status(config.HTTP_SERVER_ERROR).send({
          status: config.ERROR, 
          code : config.HTTP_SERVER_ERROR,          
          message: "Unable to process request, Please try again!",
          err: err
        }); 
      }else{
        if(result.length > 0 && result[0].id > 0){

         // Verify Order exist is atlas API.  
         orderModel.getOrderStatus(order_id, function(err, response){
            if(err){
              //console.log(err);
              res.status(config.HTTP_SERVER_ERROR).send({
                  status: config.ERROR, 
                  code : config.HTTP_SERVER_ERROR, 
                  message: 'Unable to process request, Please try again!',
                  result : err
              });              
            }else{

              if(response.statusCode == 200){
                //console.log(result);
                res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'Record found!',
                    result : response.body
                });
              }else{
                //console.log(result);
                res.status(config.HTTP_SERVER_ERROR).send({
                  status: config.ERROR, 
                  code : config.HTTP_SERVER_ERROR, 
                  message: 'Unable to process request, Please try again!',
                  result: response.body
                });                
              }

            }
         });

        }else{
          res.status(config.HTTP_NOT_FOUND).send({
            status: config.ERROR, 
            code : config.HTTP_NOT_FOUND, 
            message: 'No order can be found with this reference number. Please try again.',
          });
        }
      }
       
       
    });      

    
  }  

    // Track Order by order id
  this.orderHistory = function(req,res,next){   
    
    var user_id=req.body.user_id;
    var cond = [
      { 'user_id' : { 'val': user_id, 'cond': '='} }
    ];

    dbModel.find('orders','',cond,'','', function(err, result) {
      if (err) {
        res.status(config.HTTP_SERVER_ERROR).send({
          status: config.ERROR, 
          code : config.HTTP_SERVER_ERROR,          
          message: "Unable to process request, Please try again!",
          err: err
        }); 
      }else{
        if(result.length > 0 && result[0].id > 0){
         // Verify Order exist is atlas API.         
                //console.log(result);
                res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'Record found!',
                    result : result
                });
      

        }else{
          res.status(config.HTTP_NOT_FOUND).send({
            status: config.ERROR, 
            code : config.HTTP_NOT_FOUND, 
            message: 'No order can be found with this reference number. Please try again.',
          });
        }
      }
    });      
    
  }  

  /*fetch order details*/

  this.fetchOrderDetails = function(req,res,next){   
    
    var user_id=req.body.user_id;
    var id=req.body.order_id;
    var prepare_query = 'SELECT * FROM orders LEFT JOIN order_products ON orders.id = order_products.order_id WHERE orders.user_id = '+user_id+' AND orders.id ='+id;
    dbModel.rawQuery(prepare_query, function(err, result) {
      if (err) {
        res.status(config.HTTP_SERVER_ERROR).send({
          status: config.ERROR, 
          code : config.HTTP_SERVER_ERROR,          
          message: "Unable to process request, Please try again!",
          err: err
        }); 
      }else{
        if(result.length > 0 && result[0].id > 0){
         // Verify Order exist is atlas API.         
                //console.log(result);
                res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'Record found!',
                    result : result
                });
      

        }else{
          res.status(config.HTTP_NOT_FOUND).send({
            status: config.ERROR, 
            code : config.HTTP_NOT_FOUND, 
            message: 'No order can be found with this reference number. Please try again.',
          });
        }
      }
    });      
    
  }  

  /*end*/

}

module.exports = new OrderTrackingController();
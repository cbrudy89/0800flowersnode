var Joi = require('joi');
var async = require('async');

var dbModel = require('./../models/db-model');

function OrderTrackingController() {

  // Track Order by order id
  this.trackOrder = function(req,res,next){   
    
    var order_id=req.body.order_id;
    //var zip_code=req.body.zip_code;

    
  }  

  

}

module.exports = new OrderTrackingController();
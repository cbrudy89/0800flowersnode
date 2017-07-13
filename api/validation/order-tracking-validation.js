'use strict';
var Joi = require('joi');

module.exports = {
  trackOrder : {
	  body: {
	    order_id: Joi.string().required()
	  }  	
  }
};
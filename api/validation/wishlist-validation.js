'use strict';
var Joi = require('joi');

module.exports = {
  getwishlist : {
	  body: {
	  	token: Joi.string().required(),
	    user_id: Joi.string().required(),
	    country_id: Joi.string().required(),
	    language_id: Joi.string().required()
	  }  	
  },
  addwishlistproduct : {
	  body: {
	    token: Joi.string().required(),
	    user_id: Joi.string().required(),
	    product_id: Joi.string().required(),
	    qty: Joi.string().required()
	  }	
  },
  deletewishlistproduct : {
	  body: {
	    token: Joi.string().required(),
	    user_id: Joi.string().required(),
	    product_id: Joi.string().required()
	  }	
  }
};
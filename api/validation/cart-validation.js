'use strict';
var Joi = require('joi');

module.exports = {
  /*getwishlist : {
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
  },*/
  updateCartProductdDate : {
	  body: {
	    row_id: Joi.number().required(),
	    product_id: Joi.number().required(),
	    product_variant_id: Joi.number().required(),
	    delivery_date: Joi.string().required(),
	    quantity: Joi.number()
	  }	
  },
  getSavedCards: {
	  body: {
	    customer_id: Joi.number().required()
	  }	
  }
};
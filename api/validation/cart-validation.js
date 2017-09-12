'use strict';
var Joi = require('joi');

module.exports = {	
  addToCart : {
	  body: {
	    product_id: Joi.number().required(),
	    product_variant_id: Joi.number().required(),
	    langauge_code: Joi.number().required(),
	    country_id: Joi.number().required(),
	    prod_delivery_method_id: Joi.number().required(),
	    location: Joi.string().required(),
	    delivery_date: Joi.string().required()
	  }	
  },	
  getCart : {
	  query: {
	    language_code: Joi.number().required(),
	    country_id: Joi.number().required(),
	    currency_id: Joi.number().required()
	  }	
  },  
  updateCartProductColumn : {
	  body: {
	    row_id: Joi.number().required(),
	    product_id: Joi.number().required(),
	    product_variant_id: Joi.number().required(),
	    delivery_date: Joi.string().required(),
	    quantity: Joi.number()
	  }	
  },
  removeCartProduct : {
	  body: {
	    row_id: Joi.number().required(),
	    product_id: Joi.number().required(),
	    product_variant_id: Joi.number().required()
	  }	
  },    
  getSavedCards: {
	  body: {
	    customer_id: Joi.number().required()
	  }	
  }
};
'use strict';
var Joi = require('joi');

module.exports = {
  productdetails : {
	  body: {
	    slug: Joi.string().required(),
	    language_id: Joi.string().required(),
	    country_id: Joi.string().required(),
<<<<<<< HEAD
	    postalcode: Joi.string().required(),
	    currency_id: Joi.string().required(),
	    recent_products: Joi.string()
=======
	    currency_id: Joi.string().required(),
	    postalcode: Joi.string().required()
>>>>>>> 868455bfd2caa0f9f8391ef309f554c12541522f
	  }  	
  }
};
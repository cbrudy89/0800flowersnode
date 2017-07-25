'use strict';
var Joi = require('joi');

module.exports = {
  productdetails : {
	  body: {
	    slug: Joi.string().required(),
	    language_id: Joi.string().required(),
	    country_id: Joi.string().required(),
	    postalcode: Joi.string().required()
	  }  	
  }
};
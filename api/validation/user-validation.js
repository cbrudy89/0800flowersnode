'use strict';
var Joi = require('joi');

module.exports = {
  create : {
	  body: {
	  	token: Joi.string().required(),
	    name: Joi.string().required(),
	    email: Joi.string().email().required(),
	    password: Joi.string().required(),
	    country_id: Joi.number().integer(),
	    province_id: Joi.number().integer(),
	    address: Joi.string(),
	    phone_no: Joi.string()
	  }  	
  },
  login : {
	  body: {
	    email: Joi.string().email().required(),
	    password: Joi.string().required()
	  }	
  }
};
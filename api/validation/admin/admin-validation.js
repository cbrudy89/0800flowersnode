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
  },
  addcurrency : {
	  body: {
	    token: Joi.string().required(),
	    currency_name: Joi.string().required(),
	    currency_code: Joi.string().required(),
	    currency_numeric_code: Joi.string().required(),
	    symbol: Joi.string().required(),
	    status: Joi.string().required(),
	    exchange_rate: Joi.string().required(),
	    default_currency: Joi.string().required()
	  }	
  },
  getcurrency : {
	  body: {
	    id: Joi.string().required()
	  }	
  },
  editcurrency : {
	  body: {
	    token: Joi.string().required(),
	    id: Joi.string().required(),
	    currency_name: Joi.string().required(),
	    currency_code: Joi.string().required(),
	    currency_numeric_code: Joi.string().required(),
	    symbol: Joi.string().required(),
	    status: Joi.string().required(),
	    exchange_rate: Joi.string().required(),
	    default_currency: Joi.string().required()
	  }	
  },
  deletecurrency: {
	  body: {
	    token: Joi.string().required(),
	    id: Joi.string().required()
	  }	
  }
};
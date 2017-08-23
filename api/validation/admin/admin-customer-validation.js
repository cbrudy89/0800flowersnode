'use strict';
var Joi = require('joi');

module.exports = {
  list : {
    query: {
      customer_name: Joi.string(),
      customer_email: Joi.string().email()
    }
  },
  view : {
    params: {
      id: Joi.number().integer().required()
    }
  },
  create : {
	  body: {
	    first_name: Joi.string().required(),
	    last_name: Joi.string().required(),
	    email: Joi.string().email().required(),
	    address: Joi.string().required(),
	    province_id: Joi.number().integer().required(),
	    country_id: Joi.number().integer().required(),
	    city: Joi.string().required(),
	    postal_code: Joi.string().required(),
	    profile_image: Joi.string(),
	    day_phone: Joi.string(),
	    evening_phone: Joi.string(),
	    status: Joi.number().integer()
	  }
  },
  delete : {
    body: {
      id: Joi.number().integer().required()
    }
  }
};
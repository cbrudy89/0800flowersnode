'use strict';
var Joi = require('joi');

module.exports = {
  add : {
	  body: {
	  	token: Joi.string().required(),
	    parent_id: Joi.number().required(),
	    name: Joi.string().required(),
	    email: Joi.string().email().required(),
	    password: Joi.string().required(),
	    phone_no: Joi.string().required(),
	    country_id: Joi.number().integer().required(),
	    surcharge: Joi.string().required(),
	    status: Joi.number().integer().required(),
	  }
  },
  list : {
	  body: {
	  	token: Joi.string().required(),
	    name: Joi.any().optional(),
	    email: Joi.any().optional()
	  }
  },
  view : {
	  body: {
	  	token: Joi.string().required(),
	  	id: Joi.number().integer().required()
	  }
  },  
  delete : {
	  body: {
	  	token: Joi.string().required(),
	  	id: Joi.number().integer().required()
	  }
  }  
};
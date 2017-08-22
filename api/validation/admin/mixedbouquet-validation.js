'use strict';
var Joi = require('joi');

module.exports = {
  get : {
	  body: {
	  	token: Joi.string().required()
	  }
  },
  create : {
	  body: {
	  	token: Joi.string().required(),
	    status: Joi.number().max(1).integer().required()
	  }
  },
  view : {
	  body: {
	  	token: Joi.string().required(),
	  	id: Joi.number().integer().required()
	  }
  },  
  update : {
	  body: {
	  	token: Joi.string().required(),
	  	id: Joi.number().integer().required(),
	    status: Joi.number().max(1).integer().required()	  	
	  }
  },    
  delete : {
	  body: {
	  	token: Joi.string().required(),
	  	id: Joi.number().integer().required()
	  }
  }  
};
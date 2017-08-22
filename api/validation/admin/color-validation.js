'use strict';
var Joi = require('joi');

module.exports = {
  getcolors : {
	  body: {
	  	token: Joi.string().required()
	  }
  },
  createcolor : {
	  body: {
	  	token: Joi.string().required(),
	  	//colorArray: Joi.array().items(Joi.object().keys({ language_id: Joi.number(), name: Joi.string() }).requiredKeys('language_id','name')),
	    color_code: Joi.string().required(),
	    status: Joi.number().max(1).integer().required()
	  }
  },
  getcolor : {
	  body: {
	  	token: Joi.string().required(),
	  	id: Joi.number().integer().required()
	  }
  },  
  updatecolor : {
	  body: {
	  	token: Joi.string().required(),
	  	id: Joi.number().integer().required(),
	    color_code: Joi.string().required(),
	    status: Joi.number().max(1).integer().required()	  	
	  }
  },    
  deletecolor : {
	  body: {
	  	token: Joi.string().required(),
	  	id: Joi.number().integer().required()
	  }
  }  
};
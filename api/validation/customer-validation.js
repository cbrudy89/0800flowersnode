'use strict';
var Joi = require('joi');

module.exports = {
  register : {
	  body: {
	    first_name: Joi.string().required(),
	    last_name: Joi.string().required(),
	    email: Joi.string().email().required(),
	    confirm_email: Joi.string().email().required(),
	    password: Joi.string().required(),
	    confirm_password: Joi.string().required()
	  }  	
  },
  login : {
	  body: {
	    email: Joi.string().email().required(),
	    password: Joi.string().required()
	  }  	
  },
  forgetPassword: {
	  body: {
	    email: Joi.string().email().required()
	  }  
  },
  verifyCode: {
	  body: {
	    confirmation_code: Joi.string().required()
	  }  
  },
  resetPassword: {
	  body: {
	    confirmation_code: Joi.string().required(),
	    password: Joi.string().required(),
	    confirm_password: Joi.string().required()
	  }  	
  } 
};
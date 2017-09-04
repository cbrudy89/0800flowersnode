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
  updateProfile: {
	  body: {
	    first_name: Joi.string().required(),
	    last_name: Joi.string().required(),
	    user_id: Joi.string().required()
	  }  
  },
  resetPassword: {
	  body: {
	    confirmation_code: Joi.string().required(),
	    password: Joi.string().required(),
	    confirm_password: Joi.string().required()
	  }  	
  },
  feedback : {
	  body: {
	    first_name: Joi.string().required(),
	    last_name: Joi.string().required(),
	    email: Joi.string().email().required(),
	    phone_number: Joi.string().required(),
	    subject: Joi.string().required(),
	    order_confirmation_no: Joi.string().required()
/*	    order_date: Joi.string(),
	    recipient_first_name: Joi.string(),
	    recipient_last_name: Joi.string(),
	    comment: Joi.string()*/
	  }  	
  },
  getSavedCards: {
	  body: {
	    customer_id: Joi.number().required()
	  }	
  }   
};
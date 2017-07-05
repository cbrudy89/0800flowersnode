'use strict';
var Joi = require('joi');

module.exports = {
  subscribe : {
	  body: {
	    email: Joi.string().email().required()
	  }  	
  }
};
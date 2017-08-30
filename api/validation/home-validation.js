'use strict';
var Joi = require('joi');

module.exports = {
  subscribe : {
	  body: {
	    email: Joi.string().email().required()
	  }  	
  },
  home : {
  	headers: {
  		country_shortcode: Joi.string().max(2).required()
  	}
  }
};
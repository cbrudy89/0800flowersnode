'use strict';
var Joi = require('joi');

module.exports = {
  createRestrictCalendarDate : {
	  body: {
	  	token: Joi.string().required(),
                country_id: Joi.number().integer().required(),
                vendor_id: Joi.number().integer().required(),
                title: Joi.string().required(),
                description: Joi.string().required(),
                start_date: Joi.string().required(),                
                status: Joi.number().integer().required(),
                end_date: Joi.string(),   
	  }  	
  },
  
  updateSelectedRestrictCalendarDate : {
	  body: {
	  	token: Joi.string().required(),
                id: Joi.number().integer().required(),
                country_id: Joi.number().integer().required(),
                vendor_id: Joi.number().integer().required(),
                title: Joi.string().required(),
                description: Joi.string().required(),
                start_date: Joi.string().required(),                
                status: Joi.number().integer().required(),
                end_date: Joi.string(),                
	  }  	
  },
  
  
 deleteRestrictCalendarDate : {
	  body: {
	  	token: Joi.string().required(),
                id: Joi.number().integer().required(),                
	  }  	
  },
  
 getSelectedRestrictCalendarDate : {
        body: {
              token: Joi.string().required(),
              id: Joi.number().integer().required(),                
        }  	
},
  

};
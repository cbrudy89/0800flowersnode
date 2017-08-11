'use strict';
var Joi = require('joi');

module.exports = {
  createSurchargeCalendarDate : {
	  body: {
	  	token: Joi.string().required(),
                country_id: Joi.number().integer().required(),
                vendor_id: Joi.number().integer().required(),
                title: Joi.string().required(),
                description: Joi.string().required(),
                start_date: Joi.string().required(),                
                status: Joi.number().integer().required(),
                surcharge:Joi.string().required(),
                end_date: Joi.string(),   
	  }  	
  },
  
  updateSelectedSurchargeCalendarDate : {
	  body: {
	  	token: Joi.string().required(),
                id: Joi.number().integer().required(),
                country_id: Joi.number().integer().required(),
                vendor_id: Joi.number().integer().required(),
                title: Joi.string().required(),
                description: Joi.string().required(),
                start_date: Joi.string().required(),                
                status: Joi.number().integer().required(),
                surcharge:Joi.string().required(),
                end_date: Joi.string(),                
	  }  	
  },
  
  
 deleteSurchargeCalendarDate : {
	  body: {
	  	token: Joi.string().required(),
                id: Joi.number().integer().required(),                
	  }  	
  },
  
 getSelectedSurchargeCalendarDate : {
        body: {
              token: Joi.string().required(),
              id: Joi.number().integer().required(),                
        }  	
},
  

};
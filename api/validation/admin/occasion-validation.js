'use strict';
var Joi = require('joi');

module.exports = {
  
  createOccasion : {
	  body: {
	  	token: Joi.string().required(),
                country_flag: Joi.string().required(), // country ids array "1,2,a11"
                occasion_name: Joi.string().required(),
                occasion_day: Joi.number().integer().required(),
                occasion_month: Joi.number().integer().required(),
                translation_id: Joi.number().integer().required(),
                index_no_follow: Joi.number().integer(),//1
                
                // in this group atleast one required at time
                description:Joi.string(), // 
                description_fr:Joi.string(), //  
                description_de:Joi.string(), // 
                description_es:Joi.string(), // 
                
                meta_title: Joi.string(),
                meta_description: Joi.string(),
                meta_keywords : Joi.string(),
                
                occasion_type : Joi.string(),// occasion_type : occasion,holiday,both
                collection_filter: Joi.number().integer(), // 1 checkbox
                
                i_mark: Joi.number().integer(), //1
                card_message: Joi.number().integer(), //1
                occasion_status: Joi.number().integer(),//1
                banner_id: Joi.number().integer(),
  
	  }
  },
  
  updateOccasion : {
	  body: {
	  	token: Joi.string().required(),
                id:Joi.number().integer().required(),
                country_flag: Joi.string().required(), // country ids array "1,2,a11" 
                occasion_name: Joi.string().required(),
                occasion_day: Joi.number().integer().required(),
                occasion_month: Joi.number().integer().required(),
                translation_id: Joi.number().integer().required(),
                index_no_follow: Joi.number().integer(),//1
                
                // in this group atleast one required at time
                description:Joi.string(), // 
                description_fr:Joi.string(), //  
                description_de:Joi.string(), // 
                description_es:Joi.string(), // 
                
                meta_title: Joi.string(),
                meta_description: Joi.string(),
                meta_keywords : Joi.string(),
                
                occasion_type : Joi.string(),// occasion_type : occasion,holiday,both
                collection_filter: Joi.number().integer(), // 1 checkbox
                
                i_mark: Joi.number().integer(), //1
                card_message: Joi.number().integer(), //1
                occasion_status: Joi.number().integer(),//1
                banner_id: Joi.number().integer(),
  
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
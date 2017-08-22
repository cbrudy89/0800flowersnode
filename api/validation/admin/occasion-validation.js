'use strict';
var Joi = require('joi');

module.exports = {
  
  createOccasion : {
	  body: {
	  	token: Joi.string().required(),
                country_name: Joi.string().required(), // country ids array "1,2,a11"
                name_description_arr: Joi.required(),
                // [{"language_id":"1", "name":"name english","description":"description english"},{ "language_id":"2", "name":"name fr", "description":"description fr"},{ "language_id":"3", "name":"name de", "description":"description de"}]
               
                
                occasion_day: Joi.number().integer().required(),
                occasion_month: Joi.number().integer().required(),
                //translation_id: Joi.number().integer().required(),
                index_no_follow: Joi.number().integer(),//1
                                
                //description_arr:Joi.required(), // [{"language_id":"1", "description":"description english"},{ "language_id":"2", "description":"description fr"},{ "language_id":"3", "description":"description de"}]
                                
                meta_title: Joi.string(),
                meta_description: Joi.string(),
                meta_keywords : Joi.string(),
                
                //occasion_type : Joi.string(),// occasion_type : occasion,holiday,both
                collection_filter: Joi.number().integer(), // 1 checkbox
                
                i_mark: Joi.number().integer(), //1
                card_message: Joi.number().integer(), //1
                occasion_status: Joi.number().integer(),//1
                //banner_id: Joi.number().integer(),
  
	  }
  },
  
  updateOccasion : {
	  body: {
	  	token: Joi.string().required(),
                id:Joi.number().integer().required(),
	  	
                country_name: Joi.string().required(), // country ids array "1,2,a11"
                name_description_arr: Joi.required(),
                // [{"language_id":"1", "name":"name english","description":"description english"},{ "language_id":"2", "name":"name fr", "description":"description fr"},{ "language_id":"3", "name":"name de", "description":"description de"}]
               
                occasion_day: Joi.number().integer().required(),
                occasion_month: Joi.number().integer().required(),
                //translation_id: Joi.number().integer().required(),
                index_no_follow: Joi.number().integer(),//1
                              
                meta_title: Joi.string(),
                meta_description: Joi.string(),
                meta_keywords : Joi.string(),
                
                //occasion_type : Joi.string(),// occasion_type : occasion,holiday,both
                collection_filter: Joi.number().integer(), // 1 checkbox
                
                i_mark: Joi.number().integer(), //1
                card_message: Joi.number().integer(), //1
                occasion_status: Joi.number().integer(),//1
  
	  }
  },
    
  deleteOccasion : {
	  body: {
	  	token: Joi.string().required(),
                id: Joi.number().integer().required(),                
	  }  	
  },
  
  getSelectedOccasion : {
        body: {
              token: Joi.string().required(),
              id: Joi.number().integer().required(),                
        }
  },
  
 getOccasionList : {
        body: {
              token: Joi.string().required(),
              id: Joi.number().integer().required(),
              page: Joi.number().integer(),
              limit: Joi.number().integer(),
              order_by: Joi.string(),
              search_occasion_name:Joi.string()
        }
  },
  
  

};
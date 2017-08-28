'use strict';
var Joi = require('joi');

module.exports = {
  
  createCms : {
	  body: {
	  	token: Joi.string().required(),
                page_name: Joi.string().required(), // stringtext     should be unique
                slug: Joi.string().required(),      // contact-us-test  should be unique
                page_title: Joi.string().required(), // page title test
                canonical_url: Joi.string().required(),// url
                
                h1text_description_arr: Joi.any(),
                // [{"language_id":"1", "h1_text":"H1 Text eng","description":"description english"},{ "language_id":"2", "h1_text":"H1 Tex french", "description":"description french"},{ "language_id":"3", "h1_text":"H1 Text german", "description":"description lllgerman"}]
               
                placement: Joi.number().integer(),// 1 or 0   1 top   0 bottom
                meta_keywords : Joi.string(),
                meta_description: Joi.string(),                                
                status: Joi.number().integer(), //1                
  
	  }
  },
  
  updateCms : {
	  body: {
	  	token: Joi.string().required(),
                id:Joi.number().integer().required(),
	  	
                page_name: Joi.string().required(), // stringtext     should be unique
                slug: Joi.string().required(),      // contact-us-test  should be unique
                page_title: Joi.string().required(), // page title test
                canonical_url: Joi.string().required(),// url
                
                h1text_description_arr: Joi.any(),
                // [{"language_id":"1", "h1_text":"H1 Text eng","description":"description english"},{ "language_id":"2", "h1_text":"H1 Tex french", "description":"description french"},{ "language_id":"3", "h1_text":"H1 Text german", "description":"description lllgerman"}]
               
                placement: Joi.number().integer(),// 1 or 0   1 top   0 bottom
                meta_keywords : Joi.string(),
                meta_description: Joi.string(),                                
                status: Joi.number().integer(), //1   
  
	  }
  },
    
  deleteCms : {
	  body: {
	  	token: Joi.string().required(),
                id: Joi.number().integer().required(),                
	  }  	
  },
  
  getSelectedCms : {
        body: {
              token: Joi.string().required(),
              id: Joi.number().integer().required(),                
        }
  },
  
 getCmsList : {
        body: {
              token: Joi.string().required(),
              id: Joi.number().integer().required(),
              page: Joi.number().integer(),
              limit: Joi.number().integer(),
              order_by: Joi.string(),
              search_page_name:Joi.string(),
              search_slug:Joi.string(),
              search_page_title:Joi.string(),
        }
  },
  
  

};
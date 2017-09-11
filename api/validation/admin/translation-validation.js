'use strict';
var Joi = require('joi');

module.exports = {
  
  createTranslation : {
        body: {
              token: Joi.string().required(),
              language_key: Joi.string().required(), //  must be unique, stringtext    
              translated_text: Joi.any().required(),
              // [{"language_id":"1", "translated_text":"Text eng"},{ "language_id":"2","translated_text":"Text french"},{"language_id":"3","translated_text":"Text german"}]
        }
  },
  
  updateTranslation : {
        body: {
              token: Joi.string().required(),
              id:Joi.number().integer().required(),
              language_key: Joi.string().required(), //  must be unique, stringtext    
              translated_text: Joi.any().required(),
              // [{"language_id":"1", "translated_text":"Text eng"},{ "language_id":"2","translated_text":"Text french"},{"language_id":"3","translated_text":"Text german"}]  
        }
  },
    
  deleteTranslation : {
        body: {
              token: Joi.string().required(),
              id: Joi.number().integer().required(),                
        }  	
  },
  
  viewTranslation : {
    body: {
          token: Joi.string().required(),
          id: Joi.number().integer().required(),                
    }
  },
  
 getTranslationList : {
    body: {
          token: Joi.string().required(),          
          page: Joi.number().integer(),
          limit: Joi.number().integer(),
          order_by: Joi.string(),
          search_language_key:Joi.string()
    }
  },
  
  

};
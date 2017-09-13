'use strict';
var Joi = require('joi');

module.exports = {
  
  updateNewsletter : {
      body: {
         token: Joi.string().required(),
         id:Joi.number().integer().required(),
         subscribe_email: Joi.string().email().required(),            
      }
  },
  
  viewNewsletter : {
    body: {
       token: Joi.string().required(),
       id:Joi.number().integer().required(),                
    }
  },
  
  deleteNewsletter : {
      body: {
         token: Joi.string().required(),
         id: Joi.number().integer().required(),                
      }  	
  },
  
  /*
  getNewsletterList : {
     body: {
        token: Joi.string().required(),          
        //page: Joi.number().integer(),
        //limit: Joi.number().integer(),
        //order_by: Joi.string(),
        //search_email:Joi.string()
     }
   },  */

};
'use strict';
var Joi = require('joi');

module.exports = {
  
 getOrdersList : {
        body: {
              token: Joi.string().required(),
              
              page: Joi.number().integer(),// 1
              limit: Joi.number().integer(), // 30
              order_by: Joi.string(), // created_at-desc
              
              search_day: Joi.string(), // today,yesterday
              search_status: Joi.string(), // 0 for pending, 1 for in-progress, 2 from delivered, 3 for cancelled
              search_start_date: Joi.string(),// 2018-08-22
              search_end_date:Joi.string(),// 2018-08-22
              search_first_name:Joi.string(), //string
              search_last_name:Joi.string(), //string
              search_order_id:Joi.string(), //string invoice_id 18F1458728675
              search_delivery_date:Joi.string(), // 2018-08-22             
              search_email:Joi.string().email(), // string
              search_contact:Joi.string(),  //654464546546             
                 
        }
  },
  
 getAtlasOrdersList : {
        body: {
              token: Joi.string().required(),
              
              page: Joi.number().integer(),// 1
              limit: Joi.number().integer(), // 30
              order_by: Joi.string(), // created_at-desc
              
              search_day: Joi.string(), // today,yesterday
              search_status: Joi.string(), // 0 for pending, 1 for in-progress, 2 from delivered, 3 for cancelled
              search_start_date: Joi.string(),// 2018-08-22
              search_end_date:Joi.string(),// 2018-08-22
              search_first_name:Joi.string(), //string
              search_last_name:Joi.string(), //string
              search_order_id:Joi.string(), //string invoice_id 18F1458728675
              search_delivery_date:Joi.string(), // 2018-08-22             
              search_email:Joi.string(), // //string
              search_contact:Joi.string(),  //string                              
        }
  },  
  

};
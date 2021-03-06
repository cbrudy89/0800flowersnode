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
                product_id: Joi.string().required(),  
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
                product_id: Joi.string().required(),   
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
                product_id: Joi.string().required(),    
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
                product_id: Joi.string().required(),    
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
  createCustomTextCalendarDate : {
      body: {
        token: Joi.string().required(),
                country_id: Joi.number().integer().required(),
                vendor_id: Joi.number().integer().required(),
                title: Joi.string().required(),               
                start_date: Joi.string().required(),                
                status: Joi.number().integer().required(),
                end_date: Joi.string(), 
                product_id: Joi.string().required(),    
      }     
  },
  updateSelectedCustomTextCalendarDate : {
      body: {
        token: Joi.string().required(),
                id: Joi.number().integer().required(),
                country_id: Joi.number().integer().required(),
                vendor_id: Joi.number().integer().required(),
                title: Joi.string().required(),                
                start_date: Joi.string().required(),                
                status: Joi.number().integer().required(),
                end_date: Joi.string(),  
                product_id: Joi.string().required(),    
      }     
  },
  deleteCustomTextCalendarDate : {
      body: {
        token: Joi.string().required(),
                id: Joi.number().integer().required(),                
      }     
  },
  getSelectedCustomTextCalendarDate : {
        body: {
              token: Joi.string().required(),
              id: Joi.number().integer().required(),                
        }   
}, 
  venderListByCountryId : {
    body: {
      token: Joi.string().required(),
                country_id: Joi.number().integer().required(),                
    }   
},
  productListByVendorId : {
        body: {
              token: Joi.string().required(),
              vendor_id: Joi.number().integer().required(),                
        }   
    }      
  

};
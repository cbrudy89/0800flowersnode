'use strict';
var Joi = require('joi');


const adminProductObjectSchema = Joi.object().keys({
    language_id: Joi.string().empty(''),
    product_name: Joi.string().min(1).required(),
    product_description: Joi.string().min(1).required(),
    product_content: Joi.string().empty('')    
  }).required();

const adminProductArraySchema = Joi.array().items(adminProductObjectSchema).min(1).required();

/*
[{"language_id":"1", "product_name":" name english","product_description":"description english","product_content":" content eng","product_specification":" specification english"}, {"language_id":"2", "product_name":" name french","product_description":"description french","product_content":" content french","product_specification":" specification french"},{"language_id":"3", "product_name":" name german","product_description":"description german","product_content":" content german","product_specification":" specification german"}] 
*/

module.exports = {
  search : {
    query: {
      product_name: Joi.string(),
      product_code: Joi.number().integer(),
      search_start_dt: Joi.string(),
      search_end_dt: Joi.string(),
      search_delivery_days: Joi.number().integer(),
      search_admin_status: Joi.number().integer(),
      search_vendor: Joi.number().integer(),
      search_country: Joi.number().integer(),
      search_occasions: Joi.number().integer(),
      search_categories: Joi.number().integer(),
      search_color: Joi.number().integer(),
      search_flower_type: Joi.number().integer(),
      search_mixed_bouquet: Joi.number().integer(),
      search_price_from: Joi.number().integer(),
      search_price_to: Joi.number().integer()
    }
  },
  view : {
    params: {
      id: Joi.number().integer().required()
    }
  },
  update : {
    body: {
      id: Joi.number().integer().required(),
      vendor_id: Joi.number().integer().required(),
      product_code: Joi.string().required(),
      // product_name: Joi.string().required(),
      
      description_arr: Joi.alternatives().try(adminProductObjectSchema, adminProductArraySchema).required(),
      // [{"language_id":"1", "product_name":"product name english","product_description":"description english","product_content":"pprodct content eng","product_specification":"product specification english"},{"language_id":"2", "product_name":"product name french","product_description":"description french","product_content":"pprodct content french","product_specification":"product specification french"},{"language_id":"2", "product_name":"product name german","product_description":"description german","product_content":"prodct content german","product_specification":"product specification german"}]            
      
      atlas_product_name: Joi.string().required(),
      province_id: Joi.array(),
      country_id: Joi.number().integer(),
      delivered_by: Joi.number().integer(),
      //product_description: Joi.string(),
      alternate_text: Joi.string(),
      snip_picture: Joi.string(),
      method: Joi.string(),
      surcharge: Joi.string(),
        varient: Joi.array().items(Joi.string().required()),
        compare_price: Joi.array().items(Joi.number().integer().required()),
        price: Joi.array().items(Joi.number().required()),
        sku: Joi.array().items(Joi.number().integer()),
        old_price_image: Joi.array().items(Joi.string()),
        base64_variant_image: Joi.array().items(Joi.string()),
        categories: Joi.array().items(Joi.number().integer()),
        sentiments: Joi.array().items(Joi.string()),
        'Occasions-chk': Joi.array().items(Joi.number().integer()),
        Sympathy: Joi.array().items(Joi.number().integer()),
        MixedBouquets: Joi.array().items(Joi.number().integer()),
        flowerstypes: Joi.array().items(Joi.number().integer()),
        colors: Joi.array().items(Joi.number().integer()),
        relatedproducts: Joi.array().items(Joi.number().integer()),
      preserve: Joi.string(),
      seasonal: Joi.string(),
      seo_keywords: Joi.string(),
      seo_description: Joi.string(),
      seo_title: Joi.string(),
      delivery_policy: Joi.number().integer(),
      subtitution_policy: Joi.number().integer(),
      status: Joi.number().integer(),
      no_index: Joi.number().integer()
    }
  }
};
'use strict';
var Joi = require('joi');

module.exports = {
  getPromoCodes : {
    query: {
      discount_code: Joi.string(),
      discount_value: Joi.number().integer(),
      limit_usage_by: Joi.number().integer(),
      start_date: Joi.date(),
      expiry_date: Joi.date()
    }
  },
  getPromoCode : {
    params: {
      id: Joi.number().integer().required(),
    }
  },
  createPromoCode : {
    body: {
      country_id: Joi.number().integer().required(),
      discount_code: Joi.string().required(),
      discount_type: Joi.string().required(),
      discount_format: Joi.string().required(),
      discount_value: Joi.number().integer().required(),
      discount_value_type: Joi.string().required(),
      apply_on: Joi.string().required(),
      discount_apply_on: Joi.string().required(),
      product_sku: Joi.string(),
      fixed_amount: Joi.number(),
      limit_usage_by: Joi.number().integer().required(),
      status: Joi.number().integer().required(),
      start_date: Joi.date().required(),
      expiry_date: Joi.date().required()
    }
  },
  updatePromoCode : {
    body: {
      id: Joi.number().integer().required(),
      country_id: Joi.number().integer().required(),
      discount_code: Joi.string().required(),
      discount_type: Joi.string().required(),
      discount_format: Joi.string().required(),
      discount_value: Joi.number().integer().required(),
      discount_value_type: Joi.string().required(),
      apply_on: Joi.string().required(),
      discount_apply_on: Joi.string().required(),
      product_sku: Joi.string(),
      fixed_amount: Joi.number(),
      limit_usage_by: Joi.number().integer().required(),
      status: Joi.number().integer().required(),
      start_date: Joi.date().required(),
      expiry_date: Joi.date().required()
    }
  },
  deletePromoCode : {
    body: {
      id: Joi.number().integer().required(),
    }
  },
  getRestrictPromoCodes : {
    query: {
      country_id: Joi.number().integer(),
      vendor_id: Joi.number().integer(),
      promo_code: Joi.string()
    }
  },
  createRestrictPromoCode : {
    body: {
      country_id: Joi.number().integer().required(),
      vendor_id: Joi.number().integer().required(),
      product_ids: Joi.array().items(Joi.string().required()),
      promo_code: Joi.string().required(),
      description: Joi.string(),
      status: Joi.number().integer().required()
    }
  },
  updateRestrictPromoCode : {
    body: {
      id: Joi.number().integer().required(),
      country_id: Joi.number().integer().required(),
      vendor_id: Joi.number().integer().required(),
      product_ids: Joi.array().items(Joi.string().required()),
      promo_code: Joi.string().required(),
      description: Joi.string(),
      status: Joi.number().integer().required()
    }
  },
  deleteRestrictPromoCode : {
    body: {
      id: Joi.number().integer().required(),
    }
  }
};
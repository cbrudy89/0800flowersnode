'use strict';
var Joi = require('joi');

module.exports = { 
  editmethod : {
    body: {
      id: Joi.number().integer().required(),
      descriptionArr: Joi.required(),
      delivery_method: Joi.required(),
      delivery_within: Joi.required(),
      delivery_charge: Joi.required(),
      delivery_days: Joi.required(),
      delivery_hour: Joi.required(),
      delivery_minute: Joi.required(),
      delivery_policy_id: Joi.required(),
      substitution_policy_id: Joi.required(),
      status: Joi.number().integer().required(),
      atlas_order: Joi.date().required()
    }
  }
};            
'use strict';
var Joi = require('joi');

module.exports = {
  view: {
    params: {
      id: Joi.number().integer().required()
    }
  },
  create: {
    body: {
      name: Joi.string().required(),
      parent_id: Joi.number().integer(),
      banner: Joi.string(),
      description: Joi.string().required(),
      description_fr: Joi.string(),
      description_es: Joi.string(),
      description_de: Joi.string(),
      page_title: Joi.string(),
      meta_keywords: Joi.string(),
      meta_description: Joi.string(),
      active: Joi.number().integer()
    }
  },
  update: {
    body: {
      id: Joi.number().integer().required(),
      name: Joi.string().required(),
      parent_id: Joi.number().integer(),
      banner: Joi.string(),
      description: Joi.string().required(),
      description_fr: Joi.string(),
      description_es: Joi.string(),
      description_de: Joi.string(),
      page_title: Joi.string(),
      meta_keywords: Joi.string(),
      meta_description: Joi.string(),
      active: Joi.number().integer()
    }
  },
  delete: {
    body: {
      id: Joi.number().integer().required()
    }
  }
}
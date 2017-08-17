'use strict';
var Joi = require('joi');

module.exports = { 
  addeditpromobanner : {
    body: {
      descriptionArr: Joi.required(),
      type: Joi.required(),
      status: Joi.number().integer().required()
    }
  }
};            
'use strict';
var Joi = require('joi');

module.exports = { 
  addedittopcountry : {
    body: {
      country_id: Joi.required(),
      status: Joi.required(),
      order_by: Joi.required()
    }
  },
  gettopcountry : {
    body: {
      id: Joi.required()
    }
  },
  deletetopcountry : {
    body: {
      id: Joi.required()
    }
  }
};            
var Joi = require('joi');
var Extend = require('extend');

var options = {
  // return an error if body has an unrecognised property
  allowUnknown: false,
  stripUnknown: true,
  // return all errors a payload contains, not just the first one Joi finds
  abortEarly: false      
};  
  
module.exports = function validate(schema) {

  return function validateRequest(req, res, next) {
    var toValidate = {};
    /* istanbul ignore if */
    if (!schema) {
      return next();
    }

    ['params', 'body', 'query'].forEach(function (key) {
      if (schema[key]) {
        toValidate[key] = req[key];
      }
    });

    
    return Joi.validate(toValidate, schema, options, onValidationComplete);

    function onValidationComplete(err, validated) {
      if (err) {
        return res.status(400).send({
          status: false,
          code : 400, 
          message: "Validation errors!",
          errors: err.details
        });   
        //return next(Boom.badRequest(err.message, err.details));
      }

      // copy the validated data to the req object
      Extend(req, validated);

      return next();
    }
  }
};
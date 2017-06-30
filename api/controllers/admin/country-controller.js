var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var handlebars = require('handlebars');
var fs = require('fs');

var config = require('./../../../config');
var connection = require('./../../../database');
var commonHelper = require('./../../helpers/common-helper');
var confirmed = status = 1;

function CountryController() {
  // Create New Country
  this.create=function(req,res,next){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to create Province!"
      });       
    }else{
      var post = {
        continet_name: req.body.continet_name,
        preferred_currency_id: req.body.preferred_currency_id,
        country_name: req.body.country_name,
        short_code: req.body.short_code,
        country_alias: req.body.country_alias,
        iso_code: req.body.iso_code,
        calling_code: req.body.calling_code,
        phone: req.body.phone,
        surcharge: req.body.surcharge,
        country_flag: 'en.png', // 
        ga_code: req.body.ga_code,
        zipcode_length: req.body.zipcode_length,
        zipcode_type: req.body.zipcode_type,
        required_zipcode: req.body.required_zipcode,
        is_display: req.body.is_display,
        show_state: req.body.show_state,
        status: req.body.status,
        redirect_url: req.body.redirect_url
      };
      connection.acquire(function(err, con) {
        //check if country exist

        /*var query = con.query('INSERT INTO country_list SET ?', post, function(err, result) {
          con.release();
          if (err) {
                      console.log(err);
                      res.status(config.HTTP_ALREADY_EXISTS).send({
                        status: config.ERROR, 
                        code : config.HTTP_ALREADY_EXISTS, 
                        message: 'Country has been not inserted.'
                      });
                    }
        });*/
        
      }); 
    }    
  }

}
module.exports = new CountryController();
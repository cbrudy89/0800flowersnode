var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var handlebars = require('handlebars');
var fs = require('fs');

var config = require('./../../../config');
var connection = require('./../../../database');
var commonHelper = require('./../../helpers/common-helper');
var confirmed = status = 1;

function ProvinceController() {
  // Create New Country
  this.getprovince=function(req,res,next){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to create Province!"
      });       
    }else{
      console.log('hello province');
    }    
  }
}
module.exports = new ProvinceController();
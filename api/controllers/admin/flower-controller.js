var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var config = require('./../../../config');
var connection = require('./../../../database');
//var userHelper = require('./../helpers/user-helper');
var flowerModel = require('./../../models/admin/flower-model');

function FlowerController() {

    // get all flower type
  this.getFlowerTypes = function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to get flower type!"
      });       
    }else{
      var flower_type = req.body.flower_type ? req.body.flower_type : "" ;

      flowerModel.getFlowerTypes(flower_type, function(err, result){
         if(err) {
        
          res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR, 
            message : "Unable to get flower types!",
            errors : err
          });
        
         }else{
            res.status(config.HTTP_SUCCESS).send({
              status: config.SUCCESS, 
              code : config.HTTP_SUCCESS, 
              message: 'All flower type found',
              result : result
            });
         }
      });
    }

  }
  // Create new flower type
  this.createFlowerType=function(req,res){

    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to create flower type!"
      });       
    }else{
      
      // Insert into flower type table
      var curr_date  = new Date();
      var id=0;

      var flower_type = req.body.flower_type ? req.body.flower_type : "" ;
      var status = req.body.status;

      flowerTypeData = {
        'flower_type': flower_type,
        'translation_id': 0,
        'status': status,
        'created_at':curr_date,
        'updated_at':curr_date
      };
      
      flowerModel.checkFlowerType(flower_type,id, function(err, result){
        if(err){
          //console.log(err);
          res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR, 
            message : "Unable to create flower type!",
            errors : err
          });          
        }else {
           if(result.length > 0 && result[0].id > 0){
              res.status(config.HTTP_ALREADY_EXISTS).send({
                status: config.ERROR, 
                code : config.HTTP_ALREADY_EXISTS, 
                message: "The specified flower type already exists."
              });
           }else{
              flowerModel.createFlowerType(flowerTypeData, function(err, result){
                //console.log(err);
                 if(err) {
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR, 
                    message : "Unable to create flower type!",
                    errors : err
                  }); 
                 }else{
                    res.status(config.HTTP_SUCCESS).send({
                      status: config.SUCCESS, 
                      code : config.HTTP_SUCCESS, 
                      message: 'New flower type has been created',
                    });
                 }
              });
           }
        }
      }); 

    }    
  }

 
  // Update flower type
  this.updateFlowerType=function(req,res){

    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to update flower type!"
      });       
    }else{
      var curr_date  = new Date();
      var id =req.body.id;
      flowerTypeData = {
          'flower_type':req.body.flower_type,
          'status':req.body.status,
          'updated_at':curr_date
      };
      flowerModel.checkFlowerType(flowerTypeData, id, function(err, result){
        if(err){
          //console.log(err);
          res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR, 
            message : "Unable to update flower type!",
            errors : err
          });

        }else {

           if(result.length > 0 && result[0].id > 0){
              res.status(config.HTTP_ALREADY_EXISTS).send({
                status: config.ERROR, 
                code : config.HTTP_ALREADY_EXISTS, 
                message: "the specified flower type already exists."
              });
           }else{
              flowerModel.updateFlowerType(flowerTypeData, id, function(err, result){
                //console.log(err);
                 if(err) {
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR, 
                    message : "Unable to update flower type!",
                    errors : err
                  });
                 }else{
                    res.status(config.HTTP_SUCCESS).send({
                      status: config.SUCCESS, 
                      code : config.HTTP_SUCCESS, 
                      message: 'the flower type has been updated',
                    });
                 }
              });
           }
         }
      });

      
    }  
  }

  // delete flower type 
  this.deleteFlowerType = function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to delete flower type!"
      });       
    }else{
      
      var id = req.body.id;
      //console.log("id-"+id);
      flowerModel.checkDeleteFlowerType(id, function(err, result){

        if(err){
          //console.log(err);
          res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR, 
            message : "Unable to delete flower type!",
            errors : err
          });

        }else {

           if(!result.length){
              res.status(config.HTTP_NOT_FOUND).send({
                status: config.ERROR, 
                code : config.HTTP_NOT_FOUND, 
                message: "The specified flower type not found."
              });
           }else{
              flowerModel.deleteFlowerType(id, function(err, result){
                //console.log(err);
                 if(err) {
                    res.status(config.HTTP_SERVER_ERROR).send({
                      status: config.ERROR, 
                      code : config.HTTP_SERVER_ERROR, 
                      message : "Unable to delete flower type!",
                      errors : err
                    });
                 }else{
                    res.status(config.HTTP_SUCCESS).send({
                      status: config.SUCCESS, 
                      code : config.HTTP_SUCCESS, 
                      message: 'the flower type has been deleted',
                    });
                 }
              });
           }
        }
      });

    } // else close    

  }

  // Get flower type Information 
  this.getFlowerType = function(req, res) {
    
    var id=req.body.id;
    //console.log(id);
 
    flowerModel.getFlowerType(id, function(err, result) {
      if (err) {
        res.status(config.HTTP_SERVER_ERROR).send({
          status: config.ERROR, 
          code : config.HTTP_SERVER_ERROR, 
          message : "Unable to get flower type!",
          errors : err
        });
      } else {
        if(result.length > 0){
            res.status(config.HTTP_SUCCESS).send({
              status: config.SUCCESS, 
              code : config.HTTP_SUCCESS, 
              message: 'Flower type found!',
              result: result
            });
        }else{
          res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR, 
            message : "Unable to get flower type!",
            errors : err
          });
        }
      }        
    });    
  
  }

}

module.exports = new FlowerController();
var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var config = require('./../../../config');
var connection = require('./../../../database');
//var userHelper = require('./../helpers/user-helper');
var sympathyModel = require('./../../models/admin/sympathy-model');

function SympathyController() {

    // get all sympathy
  this.getSympathys = function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to get sympathy!"
      });       
    }else{
      var sympathy_type = req.body.sympathy_type ? req.body.sympathy_type : "" ;

      sympathyModel.getSympathys(sympathy_type, function(err, result){
         if(err) {
        
          res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR, 
            message : "Unable to get sympathys!",
            errors : err
          });
        
         }else{
            res.status(config.HTTP_SUCCESS).send({
              status: config.SUCCESS, 
              code : config.HTTP_SUCCESS, 
              message: 'All sympathy found',
              result : result
            });
         }
      });
    } // else close    

  }
  // Create new sympathy
  this.createSympathy=function(req,res){

    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to create sympathy!"
      });       
    }else{
      
      // Insert into sympathy table
      var curr_date  = new Date();
      var id=0;

      var sympathy_type = req.body.sympathy_type ? req.body.sympathy_type : "" ;
      var status = req.body.status;

      sympathyData = {
        'sympathy_type': sympathy_type,
        'translation_id': 0,
        'status': status,
        'created_at':curr_date,
        'updated_at':curr_date
      };
      
      sympathyModel.checkSympathy(sympathy_type,id, function(err, result){
        if(err){
          //console.log(err);
          res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR, 
            message : "Unable to create sympathy!",
            errors : err
          });          
        }else {
           if(result.length > 0 && result[0].id > 0){
              res.status(config.HTTP_ALREADY_EXISTS).send({
                status: config.ERROR, 
                code : config.HTTP_ALREADY_EXISTS, 
                message: "The specified sympathy already exists."
              });
           }else{
              sympathyModel.createSympathy(sympathyData, function(err, result){
                //console.log(err);
                 if(err) {
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR, 
                    message : "Unable to create sympathy!",
                    errors : err
                  }); 
                 }else{
                    res.status(config.HTTP_SUCCESS).send({
                      status: config.SUCCESS, 
                      code : config.HTTP_SUCCESS, 
                      message: 'New sympathy has been created',
                    });
                 }
              });
           }
        }
      }); 

    }    
  }

 
  // Update sympathy
  this.updateSympathy=function(req,res){

    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to update sympathy!"
      });       
    }else{
      var curr_date  = new Date();
      var id =req.body.id;
      sympathyData = {
          'sympathy_type':req.body.sympathy_type,
          'status':req.body.status,
          'updated_at':curr_date
      };
      sympathyModel.checkSympathy(sympathyData,id, function(err, result){
        if(err){
          //console.log(err);
          res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR, 
            message : "Unable to update sympathy!",
            errors : err
          });

        }else {

           if(result.length > 0 && result[0].id > 0){
              res.status(config.HTTP_ALREADY_EXISTS).send({
                status: config.ERROR, 
                code : config.HTTP_ALREADY_EXISTS, 
                message: "the specified sympathy name already exists."
              });
           }else{
              sympathyModel.updateSympathy(sympathyData, id, function(err, result){
                //console.log(err);
                 if(err) {
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR, 
                    message : "Unable to update sympathy!",
                    errors : err
                  });
                 }else{
                    res.status(config.HTTP_SUCCESS).send({
                      status: config.SUCCESS, 
                      code : config.HTTP_SUCCESS, 
                      message: 'the sympathy has been updated',
                    });
                 }
              });
           }
         }
      });

      
    }  
  }

  // delete sympathy 
  this.deleteSympathy = function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to delete sympathy!"
      });       
    }else{
      
      var id = req.body.id;
      //console.log("id-"+id);
      sympathyModel.checkDeleteSympathy(id, function(err, result){

        if(err){
          //console.log(err);
          res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR, 
            message : "Unable to delete sympathy!",
            errors : err
          });

        }else {

           if(!result.length){
              res.status(config.HTTP_NOT_FOUND).send({
                status: config.ERROR, 
                code : config.HTTP_NOT_FOUND, 
                message: "The specified sympathy not found."
              });
           }else{
              sympathyModel.deleteSympathy(id, function(err, result){
                //console.log(err);
                 if(err) {
                    res.status(config.HTTP_SERVER_ERROR).send({
                      status: config.ERROR, 
                      code : config.HTTP_SERVER_ERROR, 
                      message : "Unable to delete sympathy!",
                      errors : err
                    });
                 }else{
                    res.status(config.HTTP_SUCCESS).send({
                      status: config.SUCCESS, 
                      code : config.HTTP_SUCCESS, 
                      message: 'the sympathy has been deleted',
                    });
                 }
              });
           }
        }
      });

    } // else close    

  }

  // Get sympathy Information 
  this.getSympathy = function(req, res) {
    
      var id=req.body.id;
      //console.log(id);
   
      sympathyModel.getSympathy(id, function(err, result) {
        if (err) {
          res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR, 
            message : "Unable to get sympathy!",
            errors : err
          });
        } else {
          if(result.length > 0){
              res.status(config.HTTP_SUCCESS).send({
                status: config.SUCCESS, 
                code : config.HTTP_SUCCESS, 
                message: 'Sympathy found!',
                result: result
              });
          }else{
            res.status(config.HTTP_SERVER_ERROR).send({
              status: config.ERROR, 
              code : config.HTTP_SERVER_ERROR, 
              message : "Unable to get sympathy!",
              errors : err
            });
          }
        }        
      });
    
  };

}

module.exports = new SympathyController();
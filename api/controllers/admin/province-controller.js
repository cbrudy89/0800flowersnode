var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');

var config = require('./../../../config');
var connection = require('./../../../database');
var provinceModel = require('./../../models/admin/province-model');

function ProvinceController() {
  // Create New Country
  this.getprovince=function(req,res,next){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to get Province!"
      });       
    }else{
       var name = req.body.name;
       provinceModel.getprovince(name, function(err, result){
         if(err) {
            console.log(err);
         }else{
            res.status(config.HTTP_SUCCESS).send({
              status: config.SUCCESS, 
              code : config.HTTP_SUCCESS, 
              message: 'all province found',
              data : result
            });
         }
      });
    }//end else    
  }//end getprovince function

  // Create new provinces
  this.createprovince=function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to create province!"
      });       
    }else{
      // Insert into language table
      var curr_date  = new Date();
      var id=0;
      provinceData = {
            'country_id':req.body.country_id,
            'timezone_id':req.body.timezone_id,
            'province_name':req.body.province_name,
            'short_code':req.body.short_code,
            'location_tax':req.body.location_tax,
            'status':req.body.status,
            'created_at':curr_date,
            'updated_at':curr_date
      };
      provinceModel.checkprovince(provinceData,id, function(err, result){
        if(result.length > 0 && result[0].id > 0){
            res.status(config.HTTP_ALREADY_EXISTS).send({
              status: config.ERROR, 
              code : config.HTTP_ALREADY_EXISTS, 
              message: "The specified province already exists."
            });
         }else{
            provinceModel.createprovince(provinceData, function(err, result){
               if(err) {
                  console.log(err);
               }else{
                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'new province has been created',
                  });
               }
            });
         }
      }); 

    }    
  }//end createprovince
  //Edit Province
  this.viewprovince=function(req,res){
      if(req.decoded.role != config.ROLE_ADMIN){
        res.status(config.HTTP_FORBIDDEN).send({
          status: config.ERROR, 
          code : config.HTTP_FORBIDDEN, 
          message: "You dont have permission to edit provinces!"
        });       
      }else{
        var id = req.params.id;
        provinceModel.viewprovince(id, function(err, result){
          console.log(result);
         if(err) {
            console.log(err);
         }else{
            if(result.length > 0){
                  res.status(config.HTTP_SUCCESS).send({
                        status: config.SUCCESS,
                        code: config.HTTP_SUCCESS,
                        message:"Province found",
                        result:result
                  });
                }else{
                  res.status(config.HTTP_BAD_REQUEST).send({
                      status:config.ERROR,
                      code: config.HTTP_BAD_REQUEST, 
                      message:"Failed to get province"
                  }); 
                }
         }
      });
    }
  }
  // Update language
  this.updateprovince=function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to update province!"
      });       
    }else{
      var curr_date  = new Date();
      var id =req.body.id;
      provinceData = {
            'country_id':req.body.country_id,
            'timezone_id':req.body.timezone_id,
            'province_name':req.body.province_name,
            'short_code':req.body.short_code,
            'location_tax':req.body.location_tax,
            'status':req.body.status,
            'updated_at':curr_date
      };
      provinceModel.checkprovince(provinceData,id, function(err, result){
         if(result.length > 0 && result[0].id > 0){
            res.status(config.HTTP_ALREADY_EXISTS).send({
              status: config.ERROR, 
              code : config.HTTP_ALREADY_EXISTS, 
              message: "the specified province name already exists."
            });
         }else{
            provinceModel.updateprovince(provinceData, id, function(err, result){
               if(err) {
                  console.log(err);
               }else{
                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'the province has been updated',
                  });
               }
            });
         }
      });

      
    }  
  } //end update.

  // delete province 
  this.deleteprovince = function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to delete province!"
      });       
    }else{
      
      var id = req.body.id;
      //console.log("id-"+id);
      provinceModel.checkdeleteprovince(id, function(err, result){
       // console.log(result);
         if(!result.length){
            res.status(config.HTTP_NOT_FOUND).send({
              status: config.ERROR, 
              code : config.HTTP_NOT_FOUND, 
              message: "The specified province not found."
            });
         }else{
            provinceModel.deleteprovince(id, function(err, result){
              //console.log(err);
               if(err) {
                  console.log('test'+err);
               }else{
                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'the province has been deleted',
                  });
               }
            });
         }
      });
 
    } // else close    

  } 

}
module.exports = new ProvinceController();
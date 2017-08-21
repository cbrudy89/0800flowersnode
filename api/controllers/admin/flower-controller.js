var jwt=require('jsonwebtoken');
var Sync = require('sync');
var bcrypt = require('bcrypt');
var config = require('./../../../config');
var connection = require('./../../../database');
var dbModel = require('./../../models/db-model');
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

      flowerModel.getFlowerTypes(flower_type, function(err, results){
         if(err) {
        
            res.status(config.HTTP_SERVER_ERROR).send({
              status: config.ERROR, 
              code : config.HTTP_SERVER_ERROR, 
              message : "Unable to get flowers!",
              errors : err
            });
        
         }else{

            Sync(function(){
              for(var i=0; i < results.length; i++) {
                var languagedata = flowerModel.getLanguageData.sync(null,results[i].id);
                results[i].flower_type = languagedata;
              }
              
              res.status(config.HTTP_SUCCESS).send({
                status: config.SUCCESS, 
                code : config.HTTP_SUCCESS, 
                message: 'All flowers found',
                result : results
              });

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
        message: "You dont have permission to perform action!"
      });       
    }else{
      
      // Insert into flower type table
      var curr_date  = new Date();

      //var flower_type = req.body.flower_type ? req.body.flower_type : "" ;
      var flowerArray = req.body.flowerArray;
      var status = req.body.status;

      Sync(function(){

          var found = 0;
          var jsonData = JSON.parse(flowerArray);
          //var jsonData = flowerArray;
          for (var i = 0; i < jsonData.length; i++) {
            var lang = jsonData[i];
            var isExist = isFlowerExist.sync(null, '', lang);
            //console.log(isExist);
            if(isExist == 'true') found++;
          }

          // Check Sympathy already exist.
          if(found > 0){

              res.status(config.HTTP_ALREADY_EXISTS).send({
                status: config.ERROR, 
                code : config.HTTP_ALREADY_EXISTS, 
                message: "The specified flower already exists."
              });

          }else{

            //console.log('asdf');
            var flowerData = {
              'status': status,
              'created_at':curr_date,
              'updated_at':curr_date,
              'flower_type': 'abc',
              'translation_id': 0
            };

            dbModel.save('flower_types', flowerData, "", function(err, result) {
              if (err) {                
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR, 
                    message : "Unable to create flower!",
                  }); 

              }else{

                if(result.insertId > 0){
                  var type_id = result.insertId;

                  if(flowerArray.length > 0){

                     Sync(function(){
                    
                      var jsonData = JSON.parse(flowerArray);
                      //var jsonData = flowerArray;
                      for (var i = 0; i < jsonData.length; i++) {
                        var flower = jsonData[i];
                        var data = {
                          "type": "flower",
                          "type_id": type_id,
                          "language_id": flower.language_id,
                          "name": flower.name,                          
                          "description": "",
                        };

                        flowerModel.createFlowerType.sync(null, data);
                      } 

                    });
                    
                  }

                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'New flower has been created'
                  });
                
                }else{
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR, 
                    message : "Unable to create flower!",
                  }); 

                }

              }              
            });
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

      // Insert into flower table
      var curr_date  = new Date();
      var id= req.body.id;

      var flowerArray= req.body.flowerArray;
      var status = req.body.status;

      Sync(function(){

          var found = 0;
          var jsonData = JSON.parse(flowerArray);
          //var jsonData = flowerArray;
          for (var i = 0; i < jsonData.length; i++) {
            var lang = jsonData[i];
            var isExist = isFlowerExist.sync(null, id, lang);
            //console.log(isExist);
            if(isExist == 'true') found++;
          }

          // Check Flower already exist.
          if(found > 0){

              res.status(config.HTTP_ALREADY_EXISTS).send({
                status: config.ERROR, 
                code : config.HTTP_ALREADY_EXISTS, 
                message: "The specified flower already exists."
              });

          }else{

            //console.log('asdf');
            var flowerData = {
              'status': status,
              'updated_at':curr_date
            };

            dbModel.save('flower_types', flowerData, id, function(err, result) {
              if (err) {                
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR, 
                    message : "Unable to update flower!",
                  }); 

              }else{

                //console.log(result);

                if(result.affectedRows > 0){

                  if(flowerArray.length > 0){

                     Sync(function(){
                    
                      var jsonData = JSON.parse(flowerArray);
                      //var jsonData = flowerArray;
                      for (var i = 0; i < jsonData.length; i++) {
                        var flower = jsonData[i];
                        var data = {
                          "type": "flower",
                          "name": flower.name,                          
                          "description": "",
                        };

                        flowerModel.updateFlowerType.sync(null, data, id, flower.language_id);
                      } 

                    });
                    
                  }

                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'The flower has been updated'
                  });
                
                }else{
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR, 
                    message : "Unable to update flower!",
                  }); 

                }

              }              
            });
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
          Sync(function(){

            var languagedata = flowerModel.getLanguageData.sync(null,result[0].id);
            result[0].flower_type = languagedata;

            res.status(config.HTTP_SUCCESS).send({
              status: config.SUCCESS,
              code : config.HTTP_SUCCESS, 
              message: 'Flower found!',
              result: result
            });

          });
        }else{
          res.status(config.HTTP_NOT_FOUND).send({
            status: config.ERROR, 
            code : config.HTTP_NOT_FOUND, 
            message : "Flower not found.",
            errors : err
          });
        }
      }        
    });  
  }
}

function isFlowerExist(id = '', data, callback){

  var sql = "SELECT id FROM language_types WHERE type='flower' AND language_id ="+data.language_id+" AND name = '"+data.name+"' AND name != ''";
  //console.log(sql);
  if(id != '' && id > 0){
    sql += " AND type_id <> "+id;
  }

  sql += "  LIMIT 1";
  
  dbModel.rawQuery(sql, function(err, result){
    if (err) {
      callback(err);
    }else{
      if(result.length > 0 && result[0].id > 0){
        callback(null, 'true');
      }else{
        callback(null, 'false');
      }
    }
  });

}

module.exports = new FlowerController();
var jwt=require('jsonwebtoken');
var Sync = require('sync');
var bcrypt = require('bcrypt');
var config = require('./../../../config');
var connection = require('./../../../database');
var dbModel = require('./../../models/db-model');
//var userHelper = require('./../helpers/user-helper');
var mixedBouquetModel = require('./../../models/admin/mixedbouquet-model');

function MixedBouquetController() {

    // get all Mixed Bouquets
  this.getMixedBouquets = function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You do not have permission to get mixed bouquet!"
      });       
    }else{
      var mixed_bouquet = req.body.mixed_bouquet ? req.body.mixed_bouquet : "" ;

      mixedBouquetModel.getmixedBouquets(mixed_bouquet, function(err, results){
         if(err) {
        
          res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR, 
            message : "Unable to get mixed bouquets!",
            errors : err
          });
        
         }else{

          Sync(function(){
            for(var i=0; i < results.length; i++) {
              var languagedata = mixedBouquetModel.getLanguageData.sync(null,results[i].id);
              results[i].mixed_bouquet = languagedata;
            }
            
            res.status(config.HTTP_SUCCESS).send({
              status: config.SUCCESS, 
              code : config.HTTP_SUCCESS, 
              message: 'Mixed bouquets found',
              result : results
            });

          });

         }
      });
    } // else close    

  }
  
  // Create mixed bouquet
  this.createMixedBouquet=function(req,res){

    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to perform action!"
      });       
    }else{
      
      // Insert into mixed bouquet table
      var curr_date  = new Date();

      var bouquetArray= req.body.bouquetArray;
      var status = req.body.status;

      Sync(function(){

          var found = 0;
          var jsonData = JSON.parse(bouquetArray);
          //var jsonData = bouquetArray;
          for (var i = 0; i < jsonData.length; i++) {
            var lang = jsonData[i];
            var isExist = isMixedBouquetExist.sync(null, '', lang);
            //console.log(isExist);
            if(isExist == 'true') found++;
          }

          // Check Sympathy already exist.
          if(found > 0){

              res.status(config.HTTP_ALREADY_EXISTS).send({
                status: config.ERROR, 
                code : config.HTTP_ALREADY_EXISTS, 
                message: "The specified mixed bouquet already exists."
              });

          }else{

            //console.log('asdf');
            var bouquetData = {
              'status': status,
              'created_at':curr_date,
              'updated_at':curr_date,
              "bouquet_name": "test"
            };

            dbModel.save('mixed_bouquets', bouquetData, "", function(err, result) {
              if (err) {                
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR, 
                    message : "Unable to create mixed bouquet!",
                  }); 

              }else{

                if(result.insertId > 0){
                  var type_id = result.insertId;

                  if(bouquetArray.length > 0){

                     Sync(function(){
                    
                      var jsonData = JSON.parse(bouquetArray);
                      //var jsonData = bouquetArray;
                      for (var i = 0; i < jsonData.length; i++) {
                        var bouquet = jsonData[i];
                        var data = {
                          "type": "bouquets",
                          "type_id": type_id,
                          "language_id": bouquet.language_id,
                          "name": bouquet.name,                          
                          "description": "",
                        };

                        mixedBouquetModel.createMixedBouquet.sync(null, data);
                      } 

                    });
                    
                  }

                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'New mixed bouquet has been created'
                  });
                
                }else{
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR, 
                    message : "Unable to create mixed bouquet!",
                  }); 

                }

              }              
            });
          }
      });
    }    
  }


  // Update mixed bouquet
  this.updateMixedBouquet=function(req,res){

    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to perform action!"
      });       
    }else{
      
      // Insert into mixed bouquet table
      var curr_date  = new Date();
      var id= req.body.id;

      var bouquetArray = req.body.bouquetArray;
      var status = req.body.status;

      Sync(function(){

          var found = 0;
          var jsonData = JSON.parse(bouquetArray);
          //var jsonData = bouquetArray;
          for (var i = 0; i < jsonData.length; i++) {
            var lang = jsonData[i];
            var isExist = isMixedBouquetExist.sync(null, id, lang);
            //console.log(isExist);
            if(isExist == 'true') found++;
          }

          // Check mixed bouquet already exist.
          if(found > 0){

              res.status(config.HTTP_ALREADY_EXISTS).send({
                status: config.ERROR, 
                code : config.HTTP_ALREADY_EXISTS, 
                message: "The specified mixed bouquet already exists."
              });

          }else{

            //console.log('asdf');
            var bouquetData = {
              'status': status,
              'updated_at':curr_date
            };

            dbModel.save('mixed_bouquets', bouquetData, id, function(err, result) {
              if (err) {                
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR, 
                    message : "Unable to update mixed bouquet!",
                  }); 

              }else{

                //console.log(result);

                if(result.affectedRows > 0){

                  if(bouquetArray.length > 0){

                     Sync(function(){
                    
                      var jsonData = JSON.parse(bouquetArray);
                      //var jsonData = bouquetArray;
                      for (var i = 0; i < jsonData.length; i++) {
                        var bouquet = jsonData[i];
                        var data = {
                          "type": "bouquets",
                          "name": bouquet.name,                          
                          "description": "",
                        };

                        mixedBouquetModel.updateMixedBouquet.sync(null, data, id, bouquet.language_id);
                      } 

                    });
                    
                  }

                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'The mixed bouquet has been updated'
                  });
                
                }else{
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR, 
                    message : "Unable to update mixed bouquet!",
                  }); 

                }

              }              
            });
          }
      });
    }    
  }
 
  // delete mixed bouquet 
  this.deleteMixedBouquet = function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to delete mixed bouquet!"
      });       
    }else{
      
      var id = req.body.id;
      //console.log("id-"+id);
      mixedBouquetModel.checkDeleteBouquet(id, function(err, result){

        if(err){
          //console.log(err);
          res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR, 
            message : "Unable to delete mixed bouquet!",
            errors : err
          });

        }else {

           if(!result.length){
              res.status(config.HTTP_NOT_FOUND).send({
                status: config.ERROR, 
                code : config.HTTP_NOT_FOUND, 
                message: "The specified mixed bouquet not found."
              });
           }else{
              mixedBouquetModel.deleteMixedBouquet(id, function(err, result){
                //console.log(err);
                 if(err) {
                    res.status(config.HTTP_SERVER_ERROR).send({
                      status: config.ERROR, 
                      code : config.HTTP_SERVER_ERROR, 
                      message : "Unable to delete mixed bouquet!",
                      errors : err
                    });
                 }else{
                    res.status(config.HTTP_SUCCESS).send({
                      status: config.SUCCESS, 
                      code : config.HTTP_SUCCESS, 
                      message: 'The mixed bouquet has been deleted',
                    });
                 }
              });
           }
        }
      });
    }
  }

  // Get mixed bouquet Information 
  this.getMixedBouquet = function(req, res) {
    
      var id=req.body.id;
      //console.log(id);
   
      mixedBouquetModel.getMixedBouquet(id, function(err, result) {
        if (err) {
          res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR, 
            message : "Unable to get mixed bouquet!",
            errors : err
          });
        } else {
          if(result.length > 0){

              Sync(function(){

                var languagedata = mixedBouquetModel.getLanguageData.sync(null,result[0].id);
                result[0].mixed_bouquet = languagedata;

                res.status(config.HTTP_SUCCESS).send({
                  status: config.SUCCESS, 
                  code : config.HTTP_SUCCESS, 
                  message: 'Mixed bouquet found!',
                  result: result
                });

              });


          }else{
            res.status(config.HTTP_NOT_FOUND).send({
              status: config.ERROR, 
              code : config.HTTP_NOT_FOUND, 
              message : "Mixed bouquet not found.",
              errors : err
            });
          }
        }        
      });
    
  };

}

function isMixedBouquetExist(id = '', data, callback){

  var sql = "SELECT id FROM language_types WHERE type='bouquets' AND language_id ="+data.language_id+" AND name = '"+data.name+"' AND name != ''";
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


module.exports = new MixedBouquetController();
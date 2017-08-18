var jwt=require('jsonwebtoken');
var Sync = require('sync');
var bcrypt = require('bcrypt');
var config = require('./../../../config');
var connection = require('./../../../database');
var dbModel = require('./../../models/db-model');
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

      sympathyModel.getSympathys(sympathy_type, function(err, results){
         if(err) {
        
          res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR, 
            message : "Unable to get sympathys!",
            errors : err
          });
        
         }else{

          Sync(function(){
            for(var i=0; i < results.length; i++) {
              var languagedata = sympathyModel.getLanguageData.sync(null,results[i].id);
              results[i].sympathy_type = languagedata;
            }
            
            res.status(config.HTTP_SUCCESS).send({
              status: config.SUCCESS, 
              code : config.HTTP_SUCCESS, 
              message: 'All sympathy found',
              result : results
            });

          });

         }
      });
    } // else close    

  }
  
  // Create sympathy
  this.createSympathy=function(req,res){

    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to perform action!"
      });       
    }else{
      
      // Insert into sympathy table
      var curr_date  = new Date();

      //var sympathy_type = req.body.sympathy_type ? req.body.sympathy_type : "" ;
      var sympathyArray= req.body.sympathyArray;
      var status = req.body.status;

      Sync(function(){

          var found = 0;
          //var jsonData = JSON.parse(sympathyArray);
          var jsonData = sympathyArray;
          for (var i = 0; i < jsonData.length; i++) {
            var lang = jsonData[i];
            var isExist = isSympathyExist.sync(null, '', lang);
            //console.log(isExist);
            if(isExist == 'true') found++;
          }

          // Check Sympathy already exist.
          if(found > 0){

              res.status(config.HTTP_ALREADY_EXISTS).send({
                status: config.ERROR, 
                code : config.HTTP_ALREADY_EXISTS, 
                message: "The specified sympathy already exists."
              });

          }else{

            //console.log('asdf');
            var sympathyData = {
              'status': status,
              'created_at':curr_date,
              'updated_at':curr_date
            };

            dbModel.save('sympathy_types', sympathyData, "", function(err, result) {
              if (err) {                
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR, 
                    message : "Unable to create sympathy!",
                  }); 

              }else{

                if(result.insertId > 0){
                  var type_id = result.insertId;

                  if(sympathyArray.length > 0){

                     Sync(function(){
                    
                      //var jsonData = JSON.parse(sympathyArray);
                      var jsonData = sympathyArray;
                      for (var i = 0; i < jsonData.length; i++) {
                        var sympathy = jsonData[i];
                        var data = {
                          "type": "sympathy",
                          "type_id": type_id,
                          "language_id": sympathy.language_id,
                          "name": sympathy.name,                          
                          "description": "",
                        };

                        sympathyModel.createSympathy.sync(null, data);
                      } 

                    });
                    
                  }

                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'New sympathy has been created'
                  });
                
                }else{
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR, 
                    message : "Unable to create sympathy!",
                  }); 

                }

              }              
            });
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
        message: "You dont have permission to perform action!"
      });       
    }else{
      
      // Insert into sympathy table
      var curr_date  = new Date();
      var id= req.body.id;

      //var sympathy_type = req.body.sympathy_type ? req.body.sympathy_type : "" ;
      var sympathyArray= req.body.sympathyArray;
      var status = req.body.status;

      Sync(function(){

          var found = 0;
          //var jsonData = JSON.parse(sympathyArray);
          var jsonData = sympathyArray;
          for (var i = 0; i < jsonData.length; i++) {
            var lang = jsonData[i];
            var isExist = isSympathyExist.sync(null, id, lang);
            //console.log(isExist);
            if(isExist == 'true') found++;
          }

          // Check Sympathy already exist.
          if(found > 0){

              res.status(config.HTTP_ALREADY_EXISTS).send({
                status: config.ERROR, 
                code : config.HTTP_ALREADY_EXISTS, 
                message: "The specified sympathy already exists."
              });

          }else{

            //console.log('asdf');
            var sympathyData = {
              'status': status,
              'updated_at':curr_date
            };

            dbModel.save('sympathy_types', sympathyData, id, function(err, result) {
              if (err) {                
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR, 
                    message : "Unable to update sympathy!",
                  }); 

              }else{

                //console.log(result);

                if(result.affectedRows > 0){

                  if(sympathyArray.length > 0){

                     Sync(function(){
                    
                      //var jsonData = JSON.parse(sympathyArray);
                      var jsonData = sympathyArray;
                      for (var i = 0; i < jsonData.length; i++) {
                        var sympathy = jsonData[i];
                        var data = {
                          "type": "sympathy",
                          "name": sympathy.name,                          
                          "description": "",
                        };

                        sympathyModel.updateSympathy.sync(null, data, id, sympathy.language_id);
                      } 

                    });
                    
                  }

                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'The sympathy has been updated'
                  });
                
                }else{
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR, 
                    message : "Unable to update sympathy!",
                  }); 

                }

              }              
            });
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
                      message: 'The sympathy has been deleted',
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

              Sync(function(){

                var languagedata = sympathyModel.getLanguageData.sync(null,result[0].id);
                result[0].sympathy_type = languagedata;

                res.status(config.HTTP_SUCCESS).send({
                  status: config.SUCCESS, 
                  code : config.HTTP_SUCCESS, 
                  message: 'Sympathy found!',
                  result: result
                });

              });


          }else{
            res.status(config.HTTP_NOT_FOUND).send({
              status: config.ERROR, 
              code : config.HTTP_NOT_FOUND, 
              message : "Sympathy not found.",
              errors : err
            });
          }
        }        
      });
    
  };

}

function isSympathyExist(id = '', data, callback){

  //var sql = "SELECT id FROM language_types WHERE type='sympathy' AND name = '"+data.name+"'";
  var sql = "SELECT id FROM language_types WHERE type='sympathy' AND language_id ="+data.language_id+" AND name = '"+data.name+"' AND name != ''";
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


module.exports = new SympathyController();
var jwt=require('jsonwebtoken');
var Sync = require('sync');
var bcrypt = require('bcrypt');
var config = require('./../../../config');
var connection = require('./../../../database');
var dbModel = require('./../../models/db-model');
//var userHelper = require('./../helpers/user-helper');
var colorModel = require('./../../models/admin/color-model');

function ColorController() {

    // get all colors
  this.getcolors = function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to get color!"
      });       
    }else{

      var color_name = req.body.color_name ? req.body.color_name : "" ;

      colorModel.getcolors(color_name, function(err, results){
         if(err) {
        
          res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR, 
            message : "Unable to get colors!",
            errors : err
          });
        
         }else{

          Sync(function(){
            for(var i=0; i < results.length; i++) {
              var languagedata = colorModel.getLanguageData.sync(null,results[i].id);
              results[i].color = languagedata;
            }
            
            res.status(config.HTTP_SUCCESS).send({
              status: config.SUCCESS, 
              code : config.HTTP_SUCCESS, 
              message: 'All colors found',
              result : results
            });

          });

         }
      });

    } // else close    

  }
  // Create new color
  this.createcolor=function(req,res){

    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to create color!"
      });       
    }else{

      // Insert into color table
      var curr_date  = new Date();

      var colorArray= req.body.colorArray;
      var color_code = req.body.color_code;
      var status = req.body.status;

      Sync(function(){

          var found = 0;
          var jsonData = JSON.parse(colorArray);
          //var jsonData = colorArray;
          for (var i = 0; i < jsonData.length; i++) {
            var lang = jsonData[i];
            var isExist = isColorExist.sync(null, '', lang);
            //console.log(isExist);
            if(isExist == 'true') found++;
          }

          // Check Color already exist.
          if(found > 0){

              res.status(config.HTTP_ALREADY_EXISTS).send({
                status: config.ERROR, 
                code : config.HTTP_ALREADY_EXISTS, 
                message: "The specified color already exists."
              });

          }else{

            //console.log('asdf');
            var colorData = {
              "color_code": color_code,
              'status': status,
              'created_at':curr_date,
              'updated_at':curr_date,
              "color_name": "test"
            };

            dbModel.save('colors', colorData, "", function(err, result) {
              if (err) {                
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR, 
                    message : "Unable to create color!",
                  }); 

              }else{

                if(result.insertId > 0){
                  var type_id = result.insertId;

                  if(colorArray.length > 0){

                     Sync(function(){
                    
                      var jsonData = JSON.parse(colorArray);
                      //var jsonData = colorArray;
                      for (var i = 0; i < jsonData.length; i++) {
                        var color = jsonData[i];
                        var data = {
                          "type": "color",
                          "type_id": type_id,
                          "language_id": color.language_id,
                          "name": color.name,                          
                          "description": "",
                        };

                        colorModel.createcolor.sync(null, data);
                      } 

                    });
                    
                  }

                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'New color has been created'
                  });
                
                }else{
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR, 
                    message : "Unable to create color!",
                  });
                }
              }              
            });
          }
      });
    }    
  }

 
  // Update color
  this.updatecolor=function(req,res){

    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to update color!"
      });       
    }else{

      var curr_date  = new Date();
      var id= req.body.id;

      var colorArray = req.body.colorArray;
      var color_code = req.body.color_code;
      var status = req.body.status;

      Sync(function(){

          var found = 0;
          var jsonData = JSON.parse(colorArray);
          //var jsonData = colorArray;
          for (var i = 0; i < jsonData.length; i++) {
            var lang = jsonData[i];
            var isExist = isColorExist.sync(null, id, lang);
            //console.log(isExist);
            if(isExist == 'true') found++;
          }

          // Check color already exist.
          if(found > 0){

              res.status(config.HTTP_ALREADY_EXISTS).send({
                status: config.ERROR, 
                code : config.HTTP_ALREADY_EXISTS, 
                message: "The specified color already exists."
              });

          }else{

            //console.log('asdf');
            var colorData = {
              'color_code': color_code,
              'status': status,
              'updated_at':curr_date
            };

            dbModel.save('colors', colorData, id, function(err, result) {
              if (err) {                
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR, 
                    message : "Unable to update color!",
                  }); 

              }else{

                //console.log(result);

                if(result.affectedRows > 0){

                  if(colorArray.length > 0){

                     Sync(function(){
                    
                      var jsonData = JSON.parse(colorArray);
                      //var jsonData = colorArray;
                      for (var i = 0; i < jsonData.length; i++) {
                        var color = jsonData[i];
                        var data = {
                          "type": "color",
                          "name": color.name,                          
                          "description": "",
                        };

                        colorModel.updatecolor.sync(null, data, id, color.language_id);
                      } 

                    });
                    
                  }

                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'The color has been updated'
                  });
                
                }else{
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR, 
                    message : "Unable to update color!",
                  }); 

                }

              }              
            });
          }
      });
    }  
  }

  this.deletecolor = function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to delete color!"
      });       
    }else{
      
      var id = req.body.id;
      //console.log("id-"+id);
      colorModel.checkdeletecolor(id, function(err, result){

        if(err){
          //console.log(err);
          res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR, 
            message : "Unable to delete color!",
            errors : err
          });

        }else {

           if(!result.length){
              res.status(config.HTTP_NOT_FOUND).send({
                status: config.ERROR, 
                code : config.HTTP_NOT_FOUND, 
                message: "The specified color not found."
              });
           }else{
              colorModel.deletecolor(id, function(err, result){
                //console.log(err);
                 if(err) {
                    res.status(config.HTTP_SERVER_ERROR).send({
                      status: config.ERROR, 
                      code : config.HTTP_SERVER_ERROR, 
                      message : "Unable to delete color!",
                      errors : err
                    });
                 }else{
                    res.status(config.HTTP_SUCCESS).send({
                      status: config.SUCCESS, 
                      code : config.HTTP_SUCCESS, 
                      message: 'The color has been deleted',
                    });
                 }
              });
           }
        }
      });
    }
  }

  // Get color Information 
  this.getcolor = function(req, res) {
    
    var id=req.body.id;
    //console.log(id);
 
    colorModel.getcolor(id, function(err, result) {
      if (err) {
        res.status(config.HTTP_SERVER_ERROR).send({
          status: config.ERROR, 
          code : config.HTTP_SERVER_ERROR, 
          message : "Unable to get color!",
          errors : err
        });
      } else {
        if(result.length > 0){

            Sync(function(){

              var languagedata = colorModel.getLanguageData.sync(null,result[0].id);
              result[0].color = languagedata;

              res.status(config.HTTP_SUCCESS).send({
                status: config.SUCCESS, 
                code : config.HTTP_SUCCESS, 
                message: 'Color found!',
                result: result
              });

            });


        }else{
          res.status(config.HTTP_NOT_FOUND).send({
            status: config.ERROR, 
            code : config.HTTP_NOT_FOUND, 
            message : "Color not found.",
            errors : err
          });
        }
      }        
    });
    
  }

}

function isColorExist(id = '', data, callback){

  var sql = "SELECT id FROM language_types WHERE type='color' AND language_id ="+data.language_id+" AND name = '"+data.name+"' AND name != ''";
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

module.exports = new ColorController();
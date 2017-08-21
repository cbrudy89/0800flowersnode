var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var config = require('./../../../config');
var connection = require('./../../../database');
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
      var color_name = req.body.color_name;
      colorModel.getcolors(color_name, function(err, result){
         if(err) {
            console.log(err);
         }else{
            res.status(config.HTTP_SUCCESS).send({
              status: config.SUCCESS, 
              code : config.HTTP_SUCCESS, 
              message: 'all colors found',
              data : result
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
        message: "You dont have permission to create user!"
      });       
    }else{
      
      // Insert into color table
      var curr_date  = new Date();
      var id=0;
      colorData = {
            'color_name':req.body.color_name,
            'status':'1',
            'created_at':curr_date,
            'updated_at':curr_date
      };
      colorModel.checkcolor(colorData,id, function(err, result){
        //console.log(err);
         if(result.length > 0 && result[0].id > 0){
            res.status(config.HTTP_ALREADY_EXISTS).send({
              status: config.ERROR, 
              code : config.HTTP_ALREADY_EXISTS, 
              message: "The specified color already exists."
            });
         }else{
            colorModel.createcolor(colorData, function(err, result){
              //console.log(err);
               if(err) {
                  console.log(err);
               }else{
                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'new colors has been created',
                  });
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
      var id =req.body.id;
      colorData = {
            'color_name':req.body.color_name,
            'status':req.body.status,
            'updated_at':curr_date
      };
      colorModel.checkcolor(colorData,id, function(err, result){
        //console.log(err);
         if(result.length > 0 && result[0].id > 0){
            res.status(config.HTTP_ALREADY_EXISTS).send({
              status: config.ERROR, 
              code : config.HTTP_ALREADY_EXISTS, 
              message: "the specified color name already exists."
            });
         }else{
            colorModel.updatecolor(colorData,id, function(err, result){
              //console.log(err);
               if(err) {
                  console.log(err);
               }else{
                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'the colors has been updated',
                  });
               }
            });
         }
      });

      
    }  
  }

  // delete color 
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
       // console.log(result);
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
                  console.log('test'+err);
               }else{
                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'the colors has been deleted',
                  });
               }
            });
         }
      });

    } // else close    

  }

  // Get color Information 
  this.getcolor = function(req, res) {
    var id=req.body.id;
    //console.log(id);
    connection.acquire(function(err, con) {
      if (err) {
        res.send({status: 1, message: err});
      }      
      con.query('select * from colors where id = ?', [id], function(err, result) {
        if (err) {
          res.send({status: 1, message: 'Failed to get'});
        } else {
          if(result.length > 0){
            res.send({status: 0, message: 'color found!', response: result});
          }else{
            res.send({status: 1, message: 'Failed to get color'});
          }
        }        
        con.release();
      });
    });
  };

}

module.exports = new ColorController();
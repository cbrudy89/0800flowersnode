var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var config = require('./../../../config');
var connection = require('./../../../database');
//var userHelper = require('./../helpers/user-helper');
var timezoneModel = require('./../../models/admin/timezone-model');

function TimezoneController() {

    // get all timezones
  this.gettimezones = function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to get timezones!"
      });       
    }else{
      var timezone = req.body.timezone;
      var tz_title = req.body.tz_title;
      timezoneModel.gettimezones(timezone,tz_title, function(err, result){
         if(err) {
            console.log(err);
         }else{
            res.status(config.HTTP_SUCCESS).send({
              status: config.SUCCESS, 
              code : config.HTTP_SUCCESS, 
              message: 'all timezones found',
              data : result
            });
         }
      });
    } // else close    

  }
 
  // Update timezone
  this.updatetimezone=function(req,res){

    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to update timezone!"
      });       
    }else{
      var curr_date  = new Date();
      var id =req.body.id;
      tmData = {
            'timezone':req.body.timezone,
            'tz_title':req.body.tz_title,
            'offset':req.body.offset,
            'stoppage_hour':req.body.stoppage_hour,
            'stoppage_minute':req.body.stoppage_minute,
            'updated_at':curr_date
      };
      timezoneModel.checktimezone(tmData,id, function(err, result){
       // console.log(err);
         if(result.length > 0 && result[0].id > 0){
            res.status(config.HTTP_ALREADY_EXISTS).send({
              status: config.ERROR, 
              code : config.HTTP_ALREADY_EXISTS, 
              message: "the specified timezone name already exists."
            });
         }else{
            timezoneModel.updatetimezone(tmData,id, function(err, result){
              //console.log(err);
               if(err) {
                  console.log(err);
               }else{
                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'the timezones has been updated',
                  });
               }
            });
         }
      });

      
    }  
  }

  // delete timezone 
  this.deletetimezone = function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to delete timezone!"
      });       
    }else{
      
      var id = req.body.id;
      //console.log("id-"+id);
      timezoneModel.checkdeletetimezone(id, function(err, result){
       // console.log(result);
         if(!result.length){
            res.status(config.HTTP_NOT_FOUND).send({
              status: config.ERROR, 
              code : config.HTTP_NOT_FOUND, 
              message: "The specified timezone not found."
            });
         }else{
            timezoneModel.deletetimezone(id, function(err, result){
              //console.log(err);
               if(err) {
                  console.log('test'+err);
               }else{
                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'the timezones has been deleted',
                  });
               }
            });
         }
      });

    } // else close    

  }

  // Get timezone Information 
  this.gettimezone = function(req, res) {
    var id=req.body.id;
    connection.acquire(function(err, con) {
      if (err) {
        res.send({status: 1, message: err});
      }      
      con.query('select * from timezones where id = ?', [id], function(err, result) {
        if (err) {
          res.send({status: 1, message: 'Failed to get'});
        } else {
          if(result.length > 0){
            res.send({status: 0, message: 'timezone found!', response: result});
          }else{
            res.send({status: 1, message: 'Failed to get timezone'});
          }
        }        
        con.release();
      });
    });
  };

}

module.exports = new TimezoneController();
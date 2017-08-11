var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var config = require('./../../../config');
var connection = require('./../../../database');
var commonHelper = require('./../../helpers/common-helper');
var restrictcalendardateModel = require('./../../models/admin/restrictcalendardate-model');

function RestrictCalendarDateController() {

    // get all Restrict Calendar Dates
  this.getRestrictCalendarDates = function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to get restrict calendar dates!"
      });       
    }else{
      
      restrictcalendardateModel.getRestrictCalendarDates( function(err, result){
         if(err) {
            console.log(err);
         }else{
            if(result.length > 0){
              res.status(config.HTTP_SUCCESS).send({
                  status: config.SUCCESS,
                  code: config.HTTP_SUCCESS,
                  message: result.length+" restrict calendar dates found",
                  data:result
              });
            }else{
              res.status(config.HTTP_BAD_REQUEST).send({
                  status:config.ERROR,
                  code: config.HTTP_BAD_REQUEST, 
                  message:"No restrict calendar dates found"
              }); 
            } 
         }
      });
    } // else close    

  }
  // Create new restrict calendar dates
  this.createRestrictCalendarDate=function(req,res){
 
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to create restrict calendar dates!"
      });       
    }else{
      // Insert into language table
      var curr_date  = new Date();
      var id=0;
      
      if(req.body.end_date !='' && req.body.end_date != undefined){
        var end_date = commonHelper.formatDateToMysqlDateTime(req.body.end_date,1);
      }else{
        var  end_date = "0000-00-00";
      }
      
      var restrictCalendarDateData = {
            'vendor_id':req.body.vendor_id,
            'country_id':req.body.country_id,
            'title':req.body.title,
            'description':req.body.description,
            'start_date':commonHelper.formatDateToMysqlDateTime(req.body.start_date,1),
            'end_date':end_date,  
            'status':req.body.status,
            'created_at':commonHelper.formatDateToMysqlDateTime(curr_date,3),
            'updated_at':commonHelper.formatDateToMysqlDateTime(curr_date,3),
      };
      
         
        restrictcalendardateModel.createRestrictCalendarDate(restrictCalendarDateData, function(err, result){
          //console.log(err);
           if(err) {
              console.log(err);
           }else{
              res.status(config.HTTP_SUCCESS).send({
                status: config.SUCCESS, 
                code : config.HTTP_SUCCESS, 
                message: 'new restrict calendar date has been created',
              });
           }
        });
         
    }    
  }


  // delete restrict calendar date 
  this.deleteRestrictCalendarDate = function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to delete restrict calendar date!"
      });       
    }else{
      
      var id = req.body.id;
      //console.log("id-"+id);
      restrictcalendardateModel.checkRestrictCalendarDate(id, function(err, result){
       // console.log(result);
         if(!result.length){
            res.status(config.HTTP_NOT_FOUND).send({
              status: config.ERROR, 
              code : config.HTTP_NOT_FOUND, 
              message: "The specified restrict calendar date not found."
            });
         }else{
            restrictcalendardateModel.deleteRestrictCalendarDate(id, function(err, result){
              //console.log(err);
               if(err) {
                  console.log(err);
               }else{
                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'the restrict calendar date has been deleted',
                  });
               }
            });
         }
      });

    } // else close    

  }
  
  
    // Get selected restrict calendar date  Information 
  this.getSelectedRestrictCalendarDate = function(req, res) {
    var id=req.body.id;
    //console.log(id);
    connection.acquire(function(err, con) {
      if (err) {
        res.send({status: 1, message: err});
      }      
      con.query('select * from restrict_calendar_dates where id = ?', [id], function(err, result) {
        if (err) {
          res.send({status: 1, message: 'Failed to get'});
        } 
        else {
          if(result.length > 0){
            res.send({status: 0, message: 'restrict calendar date found!', response: result});
          }else{
            res.send({status: 1, message: 'Failed to get restrict calendar date'});
          }
        }        
        con.release();
      });
    });
  };
  
 
  // Update restrict calendar date
  this.updateSelectedRestrictCalendarDate=function(req,res){

    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to update restrict calendar date!"
      });       
    }else{
        
      var curr_date  = new Date();
      var id =req.body.id;
            
      var  restrictCalendarDateData = {
            'vendor_id':req.body.vendor_id,
            'country_id':req.body.country_id,
            'title':req.body.title,
            'description':req.body.description,
            'start_date':commonHelper.formatDateToMysqlDateTime(req.body.start_date,1),
            'status':req.body.status,
            'updated_at':commonHelper.formatDateToMysqlDateTime(curr_date,3),
      };
      
      
      if(req.body.end_date !='' && req.body.end_date != undefined){                     
            restrictCalendarDateData.end_date = commonHelper.formatDateToMysqlDateTime(req.body.end_date,1);
      }
      
      restrictcalendardateModel.checkRestrictCalendarDate(id, function(err, result){
          
        // console.log(result);
         if(!result.length){
            res.status(config.HTTP_NOT_FOUND).send({
              status: config.ERROR, 
              code : config.HTTP_NOT_FOUND, 
              message: "The specified restrict calendar date not found."
            });
         }else{
            
              restrictcalendardateModel.updateSelectedRestrictCalendarDate(restrictCalendarDateData,id, function(err, result){
              //console.log(err);
               if(err) {
                  console.log(err);
               }else{
                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'the restrict calendar date has been updated',
                  });
               }
            });
            
         }  

      });
      
    }  
  }
 
}

module.exports = new RestrictCalendarDateController();
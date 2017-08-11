var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var config = require('./../../../config');
var connection = require('./../../../database');
var commonHelper = require('./../../helpers/common-helper');
var surchargecalendardateModel = require('./../../models/admin/surchargecalendardate-model');

function SurchargeCalendarDateController() {

    // get all Surcharge Calendar Dates
  this.getSurchargeCalendarDates = function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to get surcharge calendar dates!"
      });       
    }else{
      
      surchargecalendardateModel.getSurchargeCalendarDates( function(err, result){
         if(err) {
            console.log(err);
         }else{
            if(result.length > 0){
              res.status(config.HTTP_SUCCESS).send({
                  status: config.SUCCESS,
                  code: config.HTTP_SUCCESS,
                  message: result.length+" surcharge calendar dates found",
                  data:result
              });
            }else{
              res.status(config.HTTP_BAD_REQUEST).send({
                  status:config.ERROR,
                  code: config.HTTP_BAD_REQUEST, 
                  message:"No surcharge calendar dates found"
              }); 
            } 
         }
      });
    } // else close    

  }
  // Create new surcharge calendar dates
  this.createSurchargeCalendarDate=function(req,res){
 
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to create surcharge calendar dates!"
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
      
      var surchargeCalendarDateData = {
            'vendor_id':req.body.vendor_id,
            'country_id':req.body.country_id,
            'title':req.body.title,
            'description':req.body.description,
            'start_date':commonHelper.formatDateToMysqlDateTime(req.body.start_date,1),  
            'end_date':end_date,  
            'status':req.body.status,
            'surcharge':req.body.surcharge,
            'created_at':commonHelper.formatDateToMysqlDateTime(curr_date,3),
            'updated_at':commonHelper.formatDateToMysqlDateTime(curr_date,3),
      };
      
         
       surchargecalendardateModel.createSurchargeCalendarDate(surchargeCalendarDateData, function(err, result){
          //console.log(err);
           if(err) {
              console.log(err);
           }else{
              res.status(config.HTTP_SUCCESS).send({
                status: config.SUCCESS, 
                code : config.HTTP_SUCCESS, 
                message: 'new surcharge calendar date has been created',
              });
           }
       });
         
    }    
  }


  // delete surcharge calendar date 
  this.deleteSurchargeCalendarDate = function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to delete surcharge calendar date!"
      });       
    }else{
      
      var id = req.body.id;
      //console.log("id-"+id);
       surchargecalendardateModel.checkSurchargeCalendarDate(id, function(err, result){
       // console.log(result);
         if(!result.length){
            res.status(config.HTTP_NOT_FOUND).send({
              status: config.ERROR, 
              code : config.HTTP_NOT_FOUND, 
              message: "The specified surcharge calendar date not found."
            });
         }else{
            surchargecalendardateModel.deleteSurchargeCalendarDate(id, function(err, result){
              //console.log(err);
               if(err) {
                  console.log(err);
               }else{
                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'the surcharge calendar date has been deleted',
                  });
               }
            });
         }
      });

    } // else close    

  }
  
  
    // Get selected surcharge calendar date  Information 
  this.getSelectedSurchargeCalendarDate = function(req, res) {
    var id=req.body.id;
    //console.log(id);
    connection.acquire(function(err, con) {
      if (err) {
        res.send({status: 1, message: err});
      }      
      con.query('select * from surcharge_calendars where id = ?', [id], function(err, result) {
        if (err) {
          res.send({status: 1, message: 'Failed to get'});
        } 
        else {
          if(result.length > 0){
            res.send({status: 0, message: 'surcharge calendar date found!', response: result});
          }else{
            res.send({status: 1, message: 'Failed to get surcharge calendar date'});
          }
        }        
        con.release();
      });
    });
  };
  
 
  // Update surcharge calendar date
  this.updateSelectedSurchargeCalendarDate=function(req,res){

    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to update surcharge calendar date!"
      });       
    }else{
        
      var curr_date  = new Date();
      var id =req.body.id;
            
      var surchargeCalendarDateData = {
            'vendor_id':req.body.vendor_id,
            'country_id':req.body.country_id,
            'title':req.body.title,
            'description':req.body.description,
            'start_date':commonHelper.formatDateToMysqlDateTime(req.body.start_date,1),
            'status':req.body.status,
            'surcharge':req.body.surcharge,            
            'updated_at':commonHelper.formatDateToMysqlDateTime(curr_date,3),
      };
      
      
      if(req.body.end_date !='' && req.body.end_date != undefined){                     
            surchargeCalendarDateData.end_date = commonHelper.formatDateToMysqlDateTime(req.body.end_date,1);
      }
      
      console.log(surchargeCalendarDateData);
      surchargecalendardateModel.checkSurchargeCalendarDate(id, function(err, result){
          
        // console.log(result);
         if(!result.length){
            res.status(config.HTTP_NOT_FOUND).send({
              status: config.ERROR, 
              code : config.HTTP_NOT_FOUND, 
              message: "The specified surcharge calendar date not found."
            });
         }else{
            
              surchargecalendardateModel.updateSelectedSurchargeCalendarDate(surchargeCalendarDateData,id, function(err, result){
              //console.log(err);
               if(err) {
                  console.log(err);
               }else{
                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'the surcharge calendar date has been updated',
                  });
               }
            });
            
         }  

      });
      
    }  
  }
 
}


module.exports = new SurchargeCalendarDateController();
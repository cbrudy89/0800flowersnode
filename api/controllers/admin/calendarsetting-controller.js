var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var async = require('async');
var Sync = require('sync');
var config = require('./../../../config');
var connection = require('./../../../database');
var commonHelper = require('./../../helpers/common-helper');

var dbModel = require('./../../models/db-model');


function CalendarSettingController() {

    /*********************  Restrict  *****************************/
    // get all Restrict Calendar Dates
    this.getRestrictCalendarDates = function(req,res){

      if(req.decoded.role != config.ROLE_ADMIN){
        res.status(config.HTTP_FORBIDDEN).send({
          status: config.ERROR, 
          code : config.HTTP_FORBIDDEN, 
          message: "You dont have permission to get restrict calendar dates!"
        });       
      }else{

            var return_data = {};
            var reqData = {};

            var page = req.body.page;
            var limit = req.body.limit;
            var order_by = req.body.order_by;

            if(limit == undefined || limit == ''){
              limit = 30;
            }

            if (page == undefined || page == '') {
               page = 1;
            }

            var start = 0;    

          Sync(function(){

            if(page >1){
              start = (page - 1) * limit;
            }       


            reqData = {
                  "start": start,
                  "limit": limit,
                  "order_by":order_by,
            };

            var result        = getRestrictCalendarDatesDetails.sync(null, reqData, false); 
            var total_records = getRestrictCalendarDatesDetails.sync(null, reqData, true); 

            if(result.length <= 0){

                res.status(config.HTTP_NOT_FOUND).send({
                 status:config.ERROR,
                 code: config.HTTP_NOT_FOUND, 
                 message:"No record found."
               });

            }else{
               
                for ( var j=0 ; j < result.length; j++) { 
                  var product_restrict_calendar_date  = getProductRestrictCalendarDateDetails.sync(null, result[j].id);
                      result[j].product_restrict_calendar_date = product_restrict_calendar_date;
                      
                      /*if(result[j].status ==1){
                          result[j].status ='Active';
                      }else{
                          result[j].status ='In-Active';
                      } */
                }

                var final_data  = {
                    "page": page,
                    "limit":limit,
                    "total_records":total_records[0].total_restrict_calendar_dates,
                    "restrict_calendar_date_list": result,
                };

                res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: result.length + " restrict calendar dates found",
                    result : final_data
                });
                
            }
          });
      } 

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
          
        
        var curr_date  = new Date();
        var id=0;

        if(req.body.end_date !='' && req.body.end_date != undefined){
          var end_date = commonHelper.formatDateToMysqlDateTime(req.body.end_date,4);
        }else{
          var  end_date = "0000-00-00";
        }

        var restrictCalendarDateData = {
              'vendor_id':req.body.vendor_id,
              'country_id':req.body.country_id,
              'title':req.body.title,
              'description':req.body.description,
              'start_date':commonHelper.formatDateToMysqlDateTime(req.body.start_date,4),
              'end_date':end_date,  
              'status':req.body.status,
              'created_at':commonHelper.formatDateToMysqlDateTime(curr_date,3),
              'updated_at':commonHelper.formatDateToMysqlDateTime(curr_date,3),
        };


          //console.log(sql);
          dbModel.save('restrict_calendar_dates', restrictCalendarDateData ,'', function(err, result){
          if (err) {
              
                res.status(config.HTTP_SERVER_ERROR).send({
                  status: config.ERROR, 
                  code : config.HTTP_SERVER_ERROR, 
                  message : "Unable to process request!", 
                  errors : err
                });
          } 
          else
          {                 
                var restrict_calendar_date_id = result.insertId;                                
                var selected_products = req.body.product_id.split(',');
                
                if(selected_products.length >0 ){
                    for (i = 0; i < selected_products.length; i++) {

                        var productData= {
                            product_id :selected_products[i],
                            restrict_calendar_date_id :restrict_calendar_date_id
                        };

                         dbModel.save('product_restrict_calendar_date', productData ,'', function(err, result1){

                             if (err) {
                                  res.status(config.HTTP_SERVER_ERROR).send({
                                    status: config.ERROR, 
                                    code : config.HTTP_SERVER_ERROR, 
                                    message : "Unable to process request!", 
                                    errors : err
                                  });
                             }

                         });
                     } 
                }

                res.status(config.HTTP_SUCCESS).send({
                  status:config.SUCCESS,
                  code: config.HTTP_SUCCESS,
                  message:'Restrict calendar date inserted successfully.'
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
            var sql ="SELECT * FROM restrict_calendar_dates WHERE id = "+id;

            // Select vendor based on Id
            dbModel.rawQuery(sql, function (error, restrictCalendarResult) {
              if (error) {
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status:config.ERROR,
                    code: config.HTTP_SERVER_ERROR,
                    message:'Unable to process result!'
                  });
              }else{

                if(restrictCalendarResult.length > 0 && restrictCalendarResult[0].id > 0){

                  // Getting Connection Object
                  dbModel.getConnection(function(error, con){
                    if (error) {
                      res.status(config.HTTP_SERVER_ERROR).send({
                        status:config.ERROR,
                        code: config.HTTP_SERVER_ERROR,
                        message:'Unable to process result!',
                        error : error
                      });
                    }else{

                      // Delete vendor form table if found 
                      dbModel.beginTransaction(con, ' DELETE FROM restrict_calendar_dates WHERE id ='+id, function(error, result){
                        if(error){
                          res.status(config.HTTP_SERVER_ERROR).send({
                            status:config.ERROR,
                            code: config.HTTP_SERVER_ERROR,
                            message:'Unable to delete restrict calendar date.',
                            error: error
                          });                    
                        }else{

                          if(result.affectedRows > 0){

                            
                            var sql = "DELETE FROM product_restrict_calendar_date WHERE restrict_calendar_date_id ="+id+";";                            

                            // Delete vendor specific entries form group_vendor table
                            dbModel.transactionQuery(con, sql, function (error, result) {
                              if (error) {
                                res.status(config.HTTP_SERVER_ERROR).send({
                                  status:config.ERROR,
                                  code: config.HTTP_SERVER_ERROR,
                                  message:'Unable to delete restrict calendar date.',
                                  error: error
                                });
                              }else{

                                dbModel.commit(con, function(err, response){
                                  if (error) {
                                    res.status(config.HTTP_SERVER_ERROR).send({
                                      status:config.ERROR,
                                      code: config.HTTP_SERVER_ERROR,
                                      message:'Unable to delete restrict calendar date.',
                                      error: error
                                    });
                                  }else{
                                    res.status(config.HTTP_SUCCESS).send({
                                      status:config.SUCCESS,
                                      code: config.HTTP_SUCCESS,
                                      message:'Restrict calendar date deleted successfully.'
                                    });                                    
                                  }                                  

                                });

                              }    
                            });

                          }else{
                            res.status(config.HTTP_NOT_FOUND).send({
                              status:config.ERROR,
                              code: config.HTTP_NOT_FOUND,
                              message:'Restrict calendar date not found.'
                            });
                          }

                        }

                      });

                    }

                  });

                }else{
                  res.status(config.HTTP_BAD_REQUEST).send({
                      status:config.ERROR,
                      code: config.HTTP_BAD_REQUEST, 
                      message:"Restrict calendar date not found"
                  });
                }          
              }
            });


      } // else close    

    }
  
  
    // Get selected restrict calendar date  Information 
    this.getSelectedRestrictCalendarDate = function(req, res) {
    
        if(req.decoded.role != config.ROLE_ADMIN){
            
            res.status(config.HTTP_FORBIDDEN).send({
              status: config.ERROR, 
              code : config.HTTP_FORBIDDEN, 
              message: "You dont have permission to get restrict calendar date!"
            });       
            
        }else{
            
            var id=req.body.id;
            
            var restrictCalendarSql ="SELECT restrict_calendar_dates.*,vendor.name vendor_name,country_list.country_name FROM restrict_calendar_dates ";
                restrictCalendarSql += " LEFT JOIN `vendor` ON `vendor`.`id` = `restrict_calendar_dates`.`vendor_id` ";
                restrictCalendarSql += " LEFT JOIN `country_list` ON `country_list`.`id` = `restrict_calendar_dates`.`country_id` "; 
                restrictCalendarSql += " WHERE restrict_calendar_dates.id = "+id;
                
               dbModel.rawQuery(restrictCalendarSql, function(err, restrictCalendarResult){

                if (err) {
                    res.status(config.HTTP_SERVER_ERROR).send({
                      status: config.ERROR, 
                      code : config.HTTP_SERVER_ERROR, 
                      message : "Unable to process request!", 
                      errors : err
                    });

                 }else{

                        if(!restrictCalendarResult.length){
                            
                             res.status(config.HTTP_NOT_FOUND).send({
                                status:config.ERROR,
                                code: config.HTTP_NOT_FOUND, 
                                message:"No restrict calendar date found"
                              });                                  

                       }else{

                             var sql = "SELECT * FROM product_restrict_calendar_date where restrict_calendar_date_id = "+id;

                             dbModel.rawQuery(sql, function(err, productRestrictCalendarResult) {
                              if (err)
                              {
                                  res.status(config.HTTP_SERVER_ERROR).send({
                                    status: config.ERROR, 
                                    code : config.HTTP_SERVER_ERROR, 
                                    message : "Unable to process request!", 
                                    errors : err
                                  });
                              }
                              else 
                              { 
                                    restrictCalendarResult[0].product_restrict_calendar_date = productRestrictCalendarResult;
                                    if(restrictCalendarResult[0].status ==1){
                                        restrictCalendarResult[0].status ='Active';
                                    }else{
                                        restrictCalendarResult[0].status ='In-Active';
                                    } 
                                    
                                    var final_data= {
                                        restrict_calendar_date:restrictCalendarResult,                                        
                                    };

                                    res.status(config.HTTP_SUCCESS).send({
                                         status: config.SUCCESS, 
                                         code : config.HTTP_SUCCESS, 
                                         message:  " restrict calendar date found",
                                         result : final_data
                                    });

                              }

                            });  
                       }
                    }
                });
        }
    
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
                  'start_date':commonHelper.formatDateToMysqlDateTime(req.body.start_date,4),
                  'status':req.body.status,
                  'updated_at':commonHelper.formatDateToMysqlDateTime(curr_date,3),
            };
      
      
            if(req.body.end_date !='' && req.body.end_date != undefined){                     
                  restrictCalendarDateData.end_date = commonHelper.formatDateToMysqlDateTime(req.body.end_date,1);
            }

            var checkSql ="SELECT * FROM restrict_calendar_dates WHERE id = "+id;

            dbModel.rawQuery(checkSql, function(err, checkResult){

                   if (err) {
                      res.status(config.HTTP_SERVER_ERROR).send({
                        status: config.ERROR, 
                        code : config.HTTP_SERVER_ERROR, 
                        message : "Unable to process request!", 
                        errors : err
                      });
                   }else{

                       if(!checkResult.length){

                              res.status(config.HTTP_BAD_REQUEST).send({
                                  status:config.ERROR,
                                  code: config.HTTP_BAD_REQUEST, 
                                  message:"No restrict calendar date found."
                              }); 

                       }else{

                           dbModel.save('restrict_calendar_dates', restrictCalendarDateData ,id, function(err, result){

                                  if (err) {
                                      res.status(config.HTTP_SERVER_ERROR).send({
                                        status:config.ERROR,
                                        code: config.HTTP_SERVER_ERROR,
                                        message:'Unable to update restrict calendar date.'
                                      });

                                  } else {                  

                                      var restrict_calendar_date_id = id;
                                      var selected_products         = req.body.product_id;


                                      // delete existing all and instert new all
                                      var deleteSql="DELETE from product_restrict_calendar_date WHERE restrict_calendar_date_id = "+restrict_calendar_date_id;
                                      dbModel.rawQuery(deleteSql, function(err, deleteResults){}); 


                                      for (i = 0; i < selected_products.length; i++) {

                                          var productData= {
                                              product_id :selected_products[i],
                                              restrict_calendar_date_id :restrict_calendar_date_id
                                          };

                                          dbModel.save('product_restrict_calendar_date', productData ,'', function(err, result1){

                                              if (err) {
                                                 res.status(config.HTTP_SERVER_ERROR).send({
                                                   status:config.ERROR,
                                                   code: config.HTTP_SERVER_ERROR,
                                                   message:'Unable to update product restrict calendar date.'
                                                 });
                                              }

                                          });
                                       } 


                                    res.status(config.HTTP_SUCCESS).send({
                                      status:config.SUCCESS,
                                      code: config.HTTP_SUCCESS,
                                      message:'Restrict calendar date updated successfully.'
                                    });
                              }

                          });                     

                       }
                   }


             });
      
        }  
   }
 
 
 
    /*********************  Surcharge  *****************************/
    
    
    
    // get all Surcharge Calendar Dates
    
        // get all Restrict Calendar Dates
    this.getSurchargeCalendarDates = function(req,res){

      if(req.decoded.role != config.ROLE_ADMIN){
        res.status(config.HTTP_FORBIDDEN).send({
          status: config.ERROR, 
          code : config.HTTP_FORBIDDEN, 
          message: "You dont have permission to get surcharge calendar dates!"
        });       
      }else{

            var return_data = {};
            var reqData = {};

            var page = req.body.page;
            var limit = req.body.limit;
            var order_by = req.body.order_by;

            if(limit == undefined || limit == ''){
              limit = 30;
            }

            if (page == undefined || page == '') {
               page = 1;
            }

            var start = 0;    

          Sync(function(){

            if(page >1){
              start = (page - 1) * limit;
            }       


            reqData = {
                  "start": start,
                  "limit": limit,
                  "order_by":order_by,
            };

            var result        = getSurchargeCalendarDatesDetails.sync(null, reqData, false); 
            var total_records = getSurchargeCalendarDatesDetails.sync(null, reqData, true); 

            if(result.length <= 0){

                res.status(config.HTTP_NOT_FOUND).send({
                 status:config.ERROR,
                 code: config.HTTP_NOT_FOUND, 
                 message:"No record found."
               }); 
                  
                /*
                var final_data  = {
                  "page": 0,
                  "restrict_calendar_date_list": [],
                };

                res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: $result.length + " restrict calendar dates found",
                    result : final_data
                });

                */

            }else{
               
                for ( var j=0 ; j < result.length; j++) { 
                  var product_surcharge_calendar_date  = getProductSurchargeCalendarDateDetails.sync(null, result[j].id);
                      result[j].product_surcharge_calendar_date = product_surcharge_calendar_date;
                 
                      /*if(result[j].status == 1){
                          result[j].status ='Active';
                      }else{
                          result[j].status ='In-Active';
                      }*/ 
                }

                var final_data  = {
                    "page": page,
                    "limit":limit,
                    "total_records":total_records[0].total_surcharge_calendars_dates,
                    "surcharge_calendar_date_list": result,
                };

                res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: result.length + " surcharge calendar dates found.",
                    result : final_data
                });
                
            }
          });
      } 

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
          var end_date = commonHelper.formatDateToMysqlDateTime(req.body.end_date,4);
        }else{
          var  end_date = "0000-00-00";
        }

        var surchargeCalendarDateData = {
              'vendor_id':req.body.vendor_id,
              'country_id':req.body.country_id,
              'title':req.body.title,
              'description':req.body.description,
              'start_date':commonHelper.formatDateToMysqlDateTime(req.body.start_date,4),  
              'end_date':end_date,  
              'status':req.body.status,
              'surcharge':req.body.surcharge,
              'created_at':commonHelper.formatDateToMysqlDateTime(curr_date,3),
              'updated_at':commonHelper.formatDateToMysqlDateTime(curr_date,3),
        };



          //console.log(sql);
          dbModel.save('surcharge_calendars', surchargeCalendarDateData ,'', function(err, result){
          if (err) {
              
                res.status(config.HTTP_SERVER_ERROR).send({
                  status: config.ERROR, 
                  code : config.HTTP_SERVER_ERROR, 
                  message : "Unable to process request!", 
                  errors : err
                });
          } 
          else
          {                 
                var surcharge_calendar_date_id = result.insertId;
                var selected_products = req.body.product_id.split(',');
                
                if(selected_products.length >0 ){
                    for (i = 0; i < selected_products.length; i++) {

                        var productData= {
                            product_id :selected_products[i],
                            surcharge_calendar_id :surcharge_calendar_date_id
                        };

                         dbModel.save('product_surcharge_calendar', productData ,'', function(err, result1){

                             if (err) {
                                  res.status(config.HTTP_SERVER_ERROR).send({
                                    status: config.ERROR, 
                                    code : config.HTTP_SERVER_ERROR, 
                                    message : "Unable to process request!", 
                                    errors : err
                                  });
                             }

                         });
                     } 
                }

                res.status(config.HTTP_SUCCESS).send({
                    status:config.SUCCESS,
                    code: config.HTTP_SUCCESS,
                    message:'Surcharge calendar date inserted successfully.'
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
            var sql ="SELECT * FROM surcharge_calendars WHERE id = "+id;

            // Select vendor based on Id
            dbModel.rawQuery(sql, function (error, result1) {
              if (error) {
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status:config.ERROR,
                    code: config.HTTP_SERVER_ERROR,
                    message:'Unable to process result!'
                  });
              }else{

                if(result1.length > 0 && result1[0].id > 0){

                  // Getting Connection Object
                  dbModel.getConnection(function(error, con){
                    if (error) {
                      res.status(config.HTTP_SERVER_ERROR).send({
                        status:config.ERROR,
                        code: config.HTTP_SERVER_ERROR,
                        message:'Unable to process result!',
                        error : error
                      });
                    }else{

                      // Delete surcharge_calendars form table if found 
                      dbModel.beginTransaction(con, ' DELETE FROM surcharge_calendars WHERE id ='+id, function(error, result2){
                        if(error){
                          res.status(config.HTTP_SERVER_ERROR).send({
                            status:config.ERROR,
                            code: config.HTTP_SERVER_ERROR,
                            message:'Unable to delete surcharge calendar date.',
                            error: error
                          });                    
                        }else{

                          if(result2.affectedRows > 0){

                            
                            var sql = "DELETE FROM product_surcharge_calendar WHERE surcharge_calendar_id ="+id+";";                            

                            // Delete vendor specific entries form product_surcharge_calendar table
                            dbModel.transactionQuery(con, sql, function (error, result3) {
                              if (error) {
                                res.status(config.HTTP_SERVER_ERROR).send({
                                  status:config.ERROR,
                                  code: config.HTTP_SERVER_ERROR,
                                  message:'Unable to delete surcharge calendar date.',
                                  error: error
                                });
                              }else{

                                dbModel.commit(con, function(err, response){
                                  if (error) {
                                    res.status(config.HTTP_SERVER_ERROR).send({
                                      status:config.ERROR,
                                      code: config.HTTP_SERVER_ERROR,
                                      message:'Unable to delete surcharge calendar date.',
                                      error: error
                                    });
                                  }else{
                                    res.status(config.HTTP_SUCCESS).send({
                                      status:config.SUCCESS,
                                      code: config.HTTP_SUCCESS,
                                      message:'Surcharge calendar date deleted successfully.'
                                    });                                    
                                  }                                  

                                });

                              }    
                            });

                          }else{
                            res.status(config.HTTP_NOT_FOUND).send({
                              status:config.ERROR,
                              code: config.HTTP_NOT_FOUND,
                              message:'Surcharge calendar date not found.'
                            });
                          }

                        }

                      });

                    }

                  });

                }else{
                  res.status(config.HTTP_BAD_REQUEST).send({
                      status:config.ERROR,
                      code: config.HTTP_BAD_REQUEST, 
                      message:"Surcharge calendar date not found"
                  });
                }          
              }
            });

          
        

      } // else close    

    }
  
    // Get selected surcharge calendar date  Information 
    this.getSelectedSurchargeCalendarDate = function(req, res) {
    
        if(req.decoded.role != config.ROLE_ADMIN){
            
            res.status(config.HTTP_FORBIDDEN).send({
              status: config.ERROR, 
              code : config.HTTP_FORBIDDEN, 
              message: "You dont have permission to get surcharge calendar date!"
            });       
            
        }else{
            
            var id=req.body.id;
            
            var sql1 ="SELECT surcharge_calendars.*,vendor.name vendor_name,country_list.country_name FROM surcharge_calendars ";
             sql1 += " LEFT JOIN `vendor` ON `vendor`.`id` = `surcharge_calendars`.`vendor_id` ";
             sql1 += " LEFT JOIN `country_list` ON `country_list`.`id` = `surcharge_calendars`.`country_id` "; 
             sql1 += " WHERE surcharge_calendars.id = "+id;
              
            dbModel.rawQuery(sql1, function(err, surchargeCalendarDateResult){

                if (err) {
                    res.status(config.HTTP_SERVER_ERROR).send({
                      status: config.ERROR, 
                      code : config.HTTP_SERVER_ERROR, 
                      message : "Unable to process request!", 
                      errors : err
                    });

                 }else{

                        if(!surchargeCalendarDateResult.length){
                            
                             res.status(config.HTTP_NOT_FOUND).send({
                                status:config.ERROR,
                                code: config.HTTP_NOT_FOUND, 
                                message:"No surcharge calendar date found"
                              });                              

                        }else{

                             var sql2 = "SELECT * from product_surcharge_calendar where surcharge_calendar_id = "+id;

                             dbModel.rawQuery(sql2, function(err, productSurchargeCalendarDateResult) {
                              if (err)
                              {
                                  res.status(config.HTTP_SERVER_ERROR).send({
                                    status: config.ERROR, 
                                    code : config.HTTP_SERVER_ERROR, 
                                    message : "Unable to process request!", 
                                    errors : err
                                  });
                              }
                              else 
                              { 
                                   surchargeCalendarDateResult[0].product_surcharge_calendar= productSurchargeCalendarDateResult;
                                    
                                    if(surchargeCalendarDateResult[0].status ==1){
                                        surchargeCalendarDateResult[0].status ='Active';
                                    }else{
                                        surchargeCalendarDateResult[0].status ='In-Active';
                                    } 
                                    
                                    var final_data= {
                                        surcharge_calendars:surchargeCalendarDateResult,                                        
                                    };

                                    res.status(config.HTTP_SUCCESS).send({
                                         status: config.SUCCESS, 
                                         code : config.HTTP_SUCCESS, 
                                         message:  " Surcharge calendar date found",
                                         result : final_data
                                    });
                              }

                            });  
                       }
                    }
                });
        }
    
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
            var id         = req.body.id;

            var surchargeCalendarDateData = {
              'vendor_id':req.body.vendor_id,
              'country_id':req.body.country_id,
              'title':req.body.title,
              'description':req.body.description,
              'start_date':commonHelper.formatDateToMysqlDateTime(req.body.start_date,4),
              'status':req.body.status,
              'surcharge':req.body.surcharge,            
              'updated_at':commonHelper.formatDateToMysqlDateTime(curr_date,3),
            };

      
            if(req.body.end_date !='' && req.body.end_date != undefined){                     
                  surchargeCalendarDateData.end_date = commonHelper.formatDateToMysqlDateTime(req.body.end_date,4);
            }

            var sql1 ="SELECT * FROM surcharge_calendars WHERE id = "+id;

            dbModel.rawQuery(sql1, function(err, result1){

                   if (err) {
                      res.status(config.HTTP_SERVER_ERROR).send({
                        status: config.ERROR, 
                        code : config.HTTP_SERVER_ERROR, 
                        message : "Unable to process request!", 
                        errors : err
                      });
                   }else{

                       if(!result1.length){

                              res.status(config.HTTP_BAD_REQUEST).send({
                                  status:config.ERROR,
                                  code: config.HTTP_BAD_REQUEST, 
                                  message:"No surcharge calendar date found."
                              }); 

                       }else{

                           dbModel.save('surcharge_calendars', surchargeCalendarDateData ,id, function(err, result2){

                                  if (err) {
                                      res.status(config.HTTP_SERVER_ERROR).send({
                                        status:config.ERROR,
                                        code: config.HTTP_SERVER_ERROR,
                                        message:'Unable to update surcharge calendar date.'
                                      });

                                  } else {                  

                                      var surcharge_calendar_id = id;
                                      var selected_products     = req.body.product_id.split(',');


                                      // delete existing all and instert new all
                                      var sql3="DELETE from product_surcharge_calendar WHERE surcharge_calendar_id = "+surcharge_calendar_id;
                                      dbModel.rawQuery(sql3, function(err, result3){}); 


                                      for (i = 0; i < selected_products.length; i++) {
                                          var productData= {
                                              product_id :selected_products[i],
                                              surcharge_calendar_id :surcharge_calendar_id
                                          };

                                          dbModel.save('product_surcharge_calendar', productData ,'', function(err, result4){

                                              if (err) {
                                                 res.status(config.HTTP_SERVER_ERROR).send({
                                                   status:config.ERROR,
                                                   code: config.HTTP_SERVER_ERROR,
                                                   message:'Unable to update product surcharge calendar date.'
                                                 });
                                              }

                                          });
                                       } 


                                    res.status(config.HTTP_SUCCESS).send({
                                      status:config.SUCCESS,
                                      code: config.HTTP_SUCCESS,
                                      message:'Surcharge calendar date updated successfully.'
                                    });
                              }

                          });                     

                       }
                   }


             });
      
        }  
   }
    
   /*********************  Calender Custom Text Dates  *****************************/
    
        
    // get all Restrict Calendar Custom Text Dates
    this.getCustomTextCalendarDates = function(req,res){

      if(req.decoded.role != config.ROLE_ADMIN){
        res.status(config.HTTP_FORBIDDEN).send({
          status: config.ERROR, 
          code : config.HTTP_FORBIDDEN, 
          message: "You dont have permission!"
        });       
      }else{

            var return_data = {};
            var reqData = {};

            var page = req.body.page;
            var limit = req.body.limit;
            var order_by = req.body.order_by;

            if(limit == undefined || limit == ''){
              limit = 30;
            }

            if (page == undefined || page == '') {
               page = 1;
            }

            var start = 0;    

          Sync(function(){

            if(page >1){
              start = (page - 1) * limit;
            }       


            reqData = {
                  "start": start,
                  "limit": limit,
                  "order_by":order_by,
            };

            var result        = getCustomTextCalendarDatesDetails.sync(null, reqData, false); 
            var total_records = getCustomTextCalendarDatesDetails.sync(null, reqData, true); 
            //console.log(result);
            if(result.length <= 0){

                res.status(config.HTTP_NOT_FOUND).send({
                 status:config.ERROR,
                 code: config.HTTP_NOT_FOUND, 
                 message:"No record found."
               }); 
            }else{
               
                for ( var j=0 ; j < result.length; j++) { 
                  var product_customtext_calendar_date  = getProductCustomTextCalendarDateDetails.sync(null, result[j].id);
                      result[j].product_customtext_calendar_date = product_customtext_calendar_date;
                 
                      /*if(result[j].status == 1){
                          result[j].status ='Active';
                      }else{
                          result[j].status ='In-Active';
                      } */
                }

                var final_data  = {
                    "page": page,
                    "limit":limit,
                    "total_records":total_records[0].total_customtext_calendars_dates,
                    "customtext_calendar_date_list": result,
                };

                res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: result.length + " custom text calendar dates found.",
                    result : final_data
                });
                
            }
          });
      } 

    }
        
    
    // Create new Custom Text calendar dates
    this.createCustomTextCalendarDate=function(req,res){

      if(req.decoded.role != config.ROLE_ADMIN){
        res.status(config.HTTP_FORBIDDEN).send({
          status: config.ERROR, 
          code : config.HTTP_FORBIDDEN, 
          message: "You dont have permission!"

        });       
      }else{
        // Insert into language table
        var curr_date  = new Date();
        var id=0;

        if(req.body.end_date !='' && req.body.end_date != undefined){
          var end_date = commonHelper.formatDateToMysqlDateTime(req.body.end_date,4);
        }else{
          var  end_date = "0000-00-00";
        }

        var customCalendarDateData = {
              'vendor_id':req.body.vendor_id,
              'country_id':req.body.country_id,
              'title':req.body.title,
              'start_date':commonHelper.formatDateToMysqlDateTime(req.body.start_date,4),  
              'end_date':end_date,  
              'status':req.body.status,
              'created_at':commonHelper.formatDateToMysqlDateTime(curr_date,3),
              'updated_at':commonHelper.formatDateToMysqlDateTime(curr_date,3),
        };



          //console.log(sql);
          dbModel.save('customtext_calendars', customCalendarDateData ,'', function(err, result){
          if (err) {
              
                res.status(config.HTTP_SERVER_ERROR).send({
                  status: config.ERROR, 
                  code : config.HTTP_SERVER_ERROR, 
                  message : "Unable to process request!", 
                  errors : err
                });
          } 
          else
          {                 
                var customtext_calendar_date_id = result.insertId;
                var selected_products = req.body.product_id.split(',');
                
                if(selected_products.length >0 ){
                    for (i = 0; i < selected_products.length; i++) {

                        var productData= {
                            product_id :selected_products[i],
                            customtext_calendar_id :customtext_calendar_date_id
                        };

                        dbModel.save('product_customtext_calendar', productData ,'', function(err, result1){

                             if (err) {
                                  res.status(config.HTTP_SERVER_ERROR).send({
                                    status: config.ERROR, 
                                    code : config.HTTP_SERVER_ERROR, 
                                    message : "Unable to process request!", 
                                    errors : err
                                  });
                             }

                         });
                     } 
                }

                res.status(config.HTTP_SUCCESS).send({
                    status:config.SUCCESS,
                    code: config.HTTP_SUCCESS,
                    message:'Custom text calendar date inserted successfully.'
                });
          }
      });          

      }    
    }

    
    // delete Custom Text calendar date 
    this.deleteCustomTextCalendarDate = function(req,res){
        
      if(req.decoded.role != config.ROLE_ADMIN){
          
        res.status(config.HTTP_FORBIDDEN).send({
          status: config.ERROR, 
          code : config.HTTP_FORBIDDEN, 
          message: "You dont have permission!"
        });       
        
      }else{

            var id = req.body.id;
            var sql ="SELECT * FROM customtext_calendars WHERE id = "+id;

            // Select vendor based on Id
            dbModel.rawQuery(sql, function (error, result1) {
              if (error) {
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status:config.ERROR,
                    code: config.HTTP_SERVER_ERROR,
                    message:'Unable to process result!'
                  });
              }else{

                if(result1.length > 0 && result1[0].id > 0){

                  // Getting Connection Object
                  dbModel.getConnection(function(error, con){
                    if (error) {
                      res.status(config.HTTP_SERVER_ERROR).send({
                        status:config.ERROR,
                        code: config.HTTP_SERVER_ERROR,
                        message:'Unable to process result!',
                        error : error
                      });
                    }else{

                      // Delete customtext_calendars form table if found 
                      dbModel.beginTransaction(con, ' DELETE FROM customtext_calendars WHERE id ='+id, function(error, result2){
                        if(error){
                          res.status(config.HTTP_SERVER_ERROR).send({
                            status:config.ERROR,
                            code: config.HTTP_SERVER_ERROR,
                            message:'Unable to delete custom text calendar date.',
                            error: error
                          });                    
                        }else{

                          if(result2.affectedRows > 0){

                            
                            var sql = "DELETE FROM product_customtext_calendar WHERE customtext_calendar_id ="+id+";";                            

                            // Delete vendor specific entries form product_customtext_calendar table
                            dbModel.transactionQuery(con, sql, function (error, result3) {
                              if (error) {
                                res.status(config.HTTP_SERVER_ERROR).send({
                                  status:config.ERROR,
                                  code: config.HTTP_SERVER_ERROR,
                                  message:'Unable to delete customtext calendar date.',
                                  error: error
                                });
                              }else{

                                dbModel.commit(con, function(err, response){
                                  if (error) {
                                    res.status(config.HTTP_SERVER_ERROR).send({
                                      status:config.ERROR,
                                      code: config.HTTP_SERVER_ERROR,
                                      message:'Unable to delete customtext calendar date.',
                                      error: error
                                    });
                                  }else{
                                    res.status(config.HTTP_SUCCESS).send({
                                      status:config.SUCCESS,
                                      code: config.HTTP_SUCCESS,
                                      message:'customtext calendar date deleted successfully.'
                                    });                                    
                                  }                                  

                                });

                              }    
                            });

                          }else{
                            res.status(config.HTTP_NOT_FOUND).send({
                              status:config.ERROR,
                              code: config.HTTP_NOT_FOUND,
                              message:'customtext calendar date not found.'
                            });
                          }

                        }

                      });

                    }

                  });

                }else{
                  res.status(config.HTTP_BAD_REQUEST).send({
                      status:config.ERROR,
                      code: config.HTTP_BAD_REQUEST, 
                      message:"customtext calendar date not found"
                  });
                }          
              }
            });

          
        

      } // else close    

    }
  
    // Get selected Custom Text calendar date  Information 
    this.getSelectedCustomTextCalendarDate = function(req, res) {
    
        if(req.decoded.role != config.ROLE_ADMIN){
            
            res.status(config.HTTP_FORBIDDEN).send({
              status: config.ERROR, 
              code : config.HTTP_FORBIDDEN, 
              message: "You dont have permission!"
            });       
            
        }else{
            
            var id=req.body.id;
            
            var sql1 ="SELECT customtext_calendars.*,vendor.name vendor_name,country_list.country_name FROM customtext_calendars ";
             sql1 += " LEFT JOIN `vendor` ON `vendor`.`id` = `customtext_calendars`.`vendor_id` ";
             sql1 += " LEFT JOIN `country_list` ON `country_list`.`id` = `customtext_calendars`.`country_id` "; 
             sql1 += " WHERE customtext_calendars.id = "+id;
              
            dbModel.rawQuery(sql1, function(err, customtextCalendarDateResult){

                if (err) {
                    res.status(config.HTTP_SERVER_ERROR).send({
                      status: config.ERROR, 
                      code : config.HTTP_SERVER_ERROR, 
                      message : "Unable to process request!", 
                      errors : err
                    });

                 }else{

                        if(!customtextCalendarDateResult.length){
                            
                             res.status(config.HTTP_NOT_FOUND).send({
                                status:config.ERROR,
                                code: config.HTTP_NOT_FOUND, 
                                message:"No surcharge calendar date found"
                              });                              

                        }else{

                             var sql2 = "SELECT * from product_surcharge_calendar where surcharge_calendar_id = "+id;

                             dbModel.rawQuery(sql2, function(err, productCustomtextCalendarDateResult) {
                              if (err)
                              {
                                  res.status(config.HTTP_SERVER_ERROR).send({
                                    status: config.ERROR, 
                                    code : config.HTTP_SERVER_ERROR, 
                                    message : "Unable to process request!", 
                                    errors : err
                                  });
                              }
                              else 
                              { 
                                   customtextCalendarDateResult[0].product_surcharge_calendar= productCustomtextCalendarDateResult;
                                    
                                    if(customtextCalendarDateResult[0].status ==1){
                                        customtextCalendarDateResult[0].status ='Active';
                                    }else{
                                        customtextCalendarDateResult[0].status ='In-Active';
                                    } 
                                    
                                    var final_data= {
                                        customtext_calendars:customtextCalendarDateResult,                                        
                                    };

                                    res.status(config.HTTP_SUCCESS).send({
                                         status: config.SUCCESS, 
                                         code : config.HTTP_SUCCESS, 
                                         message:  " customtext calendar date found",
                                         result : final_data
                                    });
                              }

                            });  
                       }
                    }
                });
        }
    
  };
      

    // Update Custom Text calendar date
    this.updateSelectedCustomTextCalendarDate=function(req,res){

   
        if(req.decoded.role != config.ROLE_ADMIN){
            res.status(config.HTTP_FORBIDDEN).send({
              status: config.ERROR, 
              code : config.HTTP_FORBIDDEN, 
              message: "You dont have permission!"
            });       
        }else{

            var curr_date  = new Date();
            var id         = req.body.id;

            var customTextCalendarDateData = {
              'vendor_id':req.body.vendor_id,
              'country_id':req.body.country_id,
              'title':req.body.title,
              'start_date':commonHelper.formatDateToMysqlDateTime(req.body.start_date,4),
              'status':req.body.status,
              'updated_at':commonHelper.formatDateToMysqlDateTime(curr_date,3),
            };

      
            if(req.body.end_date !='' && req.body.end_date != undefined){                     
                  customText.end_date = commonHelper.formatDateToMysqlDateTime(req.body.end_date,4);
            }

            var sql1 ="SELECT * FROM customtext_calendars WHERE id = "+id;

            dbModel.rawQuery(sql1, function(err, result1){

                   if (err) {
                      res.status(config.HTTP_SERVER_ERROR).send({
                        status: config.ERROR, 
                        code : config.HTTP_SERVER_ERROR, 
                        message : "Unable to process request!", 
                        errors : err
                      });
                   }else{

                       if(!result1.length){

                              res.status(config.HTTP_BAD_REQUEST).send({
                                  status:config.ERROR,
                                  code: config.HTTP_BAD_REQUEST, 
                                  message:"No customtext calendar date found."
                              }); 

                       }else{

                           dbModel.save('customtext_calendars', customTextCalendarDateData ,id, function(err, result2){

                                  if (err) {
                                      res.status(config.HTTP_SERVER_ERROR).send({
                                        status:config.ERROR,
                                        code: config.HTTP_SERVER_ERROR,
                                        message:'Unable to update surcharge calendar date.'
                                      });

                                  } else {                  

                                      var customtext_calendar_id = id;
                                      var selected_products     = req.body.product_id.split(',');


                                      // delete existing all and instert new all
                                      var sql3="DELETE from product_customtext_calendar WHERE customtext_calendar_id = "+customtext_calendar_id;
                                      dbModel.rawQuery(sql3, function(err, result3){}); 


                                      for (i = 0; i < selected_products.length; i++) {
                                          var productData= {
                                              product_id :selected_products[i],
                                              customtext_calendar_id :customtext_calendar_id
                                          };

                                          dbModel.save('product_customtext_calendar', productData ,'', function(err, result4){

                                              if (err) {
                                                 res.status(config.HTTP_SERVER_ERROR).send({
                                                   status:config.ERROR,
                                                   code: config.HTTP_SERVER_ERROR,
                                                   message:'Unable to update product customtext calendar date.'
                                                 });
                                              }

                                          });
                                       } 


                                    res.status(config.HTTP_SUCCESS).send({
                                      status:config.SUCCESS,
                                      code: config.HTTP_SUCCESS,
                                      message:'customtext calendar date updated successfully.'
                                    });
                              }

                          });                     

                       }
                   }


             });
      
        }  
   }


}


function getRestrictCalendarDatesDetails(filters, find_total = false, callback) {

    if(find_total == false){
        var sql = "SELECT restrict_calendar_dates.*,vendor.name vendor_name,country_list.country_name ";
    }else{
        var sql = "SELECT COUNT(*) AS total_restrict_calendar_dates";
    }

    sql += " FROM `restrict_calendar_dates`";
    sql += "LEFT JOIN `vendor` ON `vendor`.`id` = `restrict_calendar_dates`.`vendor_id` ";
    sql += "LEFT JOIN `country_list` ON `country_list`.`id` = `restrict_calendar_dates`.`country_id` ";  
    
    if(find_total == false){
      
      if(filters.order_by != undefined && filters.order_by != ''){
             
             if(filters.order_by=='id-desc'){
                 sql += " ORDER BY restrict_calendar_dates.id DESC";
             }else if(filters.order_by=='title-asc'){
                 sql += " ORDER BY restrict_calendar_dates.title ASC";
             }else{
                 sql += " ORDER BY `restrict_calendar_dates`.`id` ASC";
             }
             
      }

      sql += " LIMIT "+filters.start+","+filters.limit;
    }

    //console.log($sql);
    dbModel.rawQuery(sql, function(err, result) {
      if (err) return callback(err);
      else {
        callback(null, result)
      }

    });

}
function getProductRestrictCalendarDateDetails(restrict_calendar_date_id, callback){

  var sql = "SELECT *";
    sql += " FROM `product_restrict_calendar_date`";  
    sql += " WHERE `product_restrict_calendar_date`.`restrict_calendar_date_id`="+restrict_calendar_date_id; 
 


    dbModel.rawQuery(sql, function(err, product_restrict_calendar_date) {
      if (err) return callback(err);
      else {
        callback(null, product_restrict_calendar_date);                    
      }
    });            
}

function getSurchargeCalendarDatesDetails(filters, find_total = false, callback) {

    if(find_total == false){
        var sql = "SELECT surcharge_calendars.*,vendor.name vendor_name,country_list.country_name ";
    }else{
        var sql = "SELECT COUNT(*) AS total_surcharge_calendars_dates";
    }

    sql += " FROM `surcharge_calendars`";
    sql += "LEFT JOIN `vendor` ON `vendor`.`id` = `surcharge_calendars`.`vendor_id` ";
    sql += "LEFT JOIN `country_list` ON `country_list`.`id` = `surcharge_calendars`.`country_id` ";  
   
    
    if(find_total == false){
      
      if(filters.order_by != undefined && filters.order_by != ''){
             
             if(filters.order_by=='id-desc'){
                 sql += " ORDER BY surcharge_calendars.id DESC";
             }else if(filters.order_by=='title-asc'){
                 sql += " ORDER BY surcharge_calendars.title ASC";
             }else{
                 sql += " ORDER BY `surcharge_calendars`.`id` ASC";
             }             
      }

      sql += " LIMIT "+filters.start+","+filters.limit;
    }

    //console.log($sql);
    dbModel.rawQuery(sql, function(err, result) {
      if (err) return callback(err);
      else {
        callback(null, result)
      }

    });

}
function getProductSurchargeCalendarDateDetails(surcharge_calendar_date_id, callback){

  var sql = "SELECT *";
    sql += " FROM `product_surcharge_calendar`";  
    sql += " WHERE `product_surcharge_calendar`.`surcharge_calendar_id`="+surcharge_calendar_date_id; 
 

    dbModel.rawQuery(sql, function(err, result) {
      if (err) return callback(err);
      else {
        callback(null, result);                    
      }
    });            
}

///custom text calendar dates
function getCustomTextCalendarDatesDetails(filters, find_total = false, callback) {

    if(find_total == false){
        var sql = "SELECT customtext_calendars.*,vendor.name vendor_name,country_list.country_name ";
    }else{
        var sql = "SELECT COUNT(*) AS total_customtext_calendars_dates";
    }

    sql += " FROM `customtext_calendars`";
    sql += "LEFT JOIN `vendor` ON `vendor`.`id` = `customtext_calendars`.`vendor_id` ";
    sql += "LEFT JOIN `country_list` ON `country_list`.`id` = `customtext_calendars`.`country_id` ";  
   
    
    if(find_total == false){
      
      if(filters.order_by != undefined && filters.order_by != ''){
             
             if(filters.order_by=='id-desc'){
                 sql += " ORDER BY customtext_calendars.id DESC";
             }else if(filters.order_by=='title-asc'){
                 sql += " ORDER BY customtext_calendars.title ASC";
             }else{
                 sql += " ORDER BY `customtext_calendars`.`id` ASC";
             }             
      }

      sql += " LIMIT "+filters.start+","+filters.limit;
    }

    //console.log($sql);
    dbModel.rawQuery(sql, function(err, result) {
      if (err) return callback(err);
      else {
        callback(null, result)
      }

    });

}

///custom text calendar date details
function getProductCustomTextCalendarDateDetails(customtext_calendar_id, callback){

  var sql = "SELECT *";
    sql += " FROM `product_customtext_calendar`";  
    sql += " WHERE `product_customtext_calendar`.`customtext_calendar_id`="+customtext_calendar_id; 
 

    dbModel.rawQuery(sql, function(err, result) {
      if (err) return callback(err);
      else {
        callback(null, result);                    
      }
    });            
}

module.exports = new CalendarSettingController();
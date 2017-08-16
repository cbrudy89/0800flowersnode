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
                  
                /*
                var final_data  = {
                  "page": 0,
                  "restrict_calendar_date_list": [],
                };

                res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: result.length + " restrict calendar dates found",
                    result : final_data
                });

                */

            }else{
               
                for ( var j=0 ; j < result.length; j++) { 
                  var product_restrict_calendar_date  = getProductRestrictCalendarDateDetails.sync(null, result[j].id);
                      result[j].product_restrict_calendar_date = product_restrict_calendar_date;
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
                var selected_products         = req.body.product_id;

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
        
            dbModel.rawQuery(sql, function(err,restrictCalendarResult) {
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
                if(!restrictCalendarResult.length){
                     res.status(config.HTTP_NOT_FOUND).send({
                       status: config.ERROR, 
                       code : config.HTTP_NOT_FOUND, 
                       message: "The specified restrict calendar date not found."
                     });
                  }else{
                      
                     
                      dbModel.delete('restrict_calendar_dates '," id="+id, function(err,deleteRestrictCalendarResult) {
                       
                        if(err) {
                            res.status(config.HTTP_SERVER_ERROR).send({
                             status: config.ERROR, 
                             code : config.HTTP_SERVER_ERROR, 
                             message : "Unable to process request!", 
                             errors : err
                           });
                        }else{
                            
                             dbModel.delete('product_restrict_calendar_date '," restrict_calendar_date_id="+id, function(err,deleteProductRestrictCalendarResult) {
                       
                                if(err) {
                                    res.status(config.HTTP_SERVER_ERROR).send({
                                     status: config.ERROR, 
                                     code : config.HTTP_SERVER_ERROR, 
                                     message : "Unable to process request!", 
                                     errors : err
                                   });
                                }else{

                                   res.status(config.HTTP_SUCCESS).send({
                                     status: config.SUCCESS, 
                                     code : config.HTTP_SUCCESS, 
                                     message: 'The restrict calendar date has been deleted',
                                   });
                                }
                             });
                              
                        }
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
            var restrictCalendarSql ="SELECT * FROM restrict_calendar_dates WHERE id = "+id;

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
                  'start_date':commonHelper.formatDateToMysqlDateTime(req.body.start_date,1),
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
                var selected_products          = req.body.product_id;

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
        
            dbModel.rawQuery(sql, function(err,result1) {
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
                if(!result1.length){
                     res.status(config.HTTP_NOT_FOUND).send({
                       status: config.ERROR, 
                       code : config.HTTP_NOT_FOUND, 
                       message: "The specified surcharge calendar date not found."
                     });
                  }else{
                      
                     
                      dbModel.delete('surcharge_calendars '," id="+id, function(err,result2) {
                       
                        if(err) {
                            res.status(config.HTTP_SERVER_ERROR).send({
                             status: config.ERROR, 
                             code : config.HTTP_SERVER_ERROR, 
                             message : "Unable to process request!", 
                             errors : err
                           });
                        }else{
                            
                             dbModel.delete('product_surcharge_calendar '," surcharge_calendar_id="+id, function(err,result3) {
                       
                                if(err) {
                                    res.status(config.HTTP_SERVER_ERROR).send({
                                     status: config.ERROR, 
                                     code : config.HTTP_SERVER_ERROR, 
                                     message : "Unable to process request!", 
                                     errors : err
                                   });
                                }else{

                                   res.status(config.HTTP_SUCCESS).send({
                                     status: config.SUCCESS, 
                                     code : config.HTTP_SUCCESS, 
                                     message: 'The surcharge calendar date has been deleted',
                                   });
                                }
                             });
                              
                        }
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
            var sql1 ="SELECT * FROM surcharge_calendars WHERE id = "+id;

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

                                      var surcharge_calendar_id     = id;
                                      var selected_products         = req.body.product_id;


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
    
}



function getRestrictCalendarDatesDetails(filters, find_total = false, callback) {

    if(find_total == false){
        var sql = "SELECT * ";
    }else{
        var sql = "SELECT COUNT(*) AS total_restrict_calendar_dates";
    }

    sql += " FROM `restrict_calendar_dates`";
    
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
        var sql = "SELECT * ";
    }else{
        var sql = "SELECT COUNT(*) AS total_surcharge_calendars_dates";
    }

    sql += " FROM `surcharge_calendars`";
    
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

module.exports = new CalendarSettingController();
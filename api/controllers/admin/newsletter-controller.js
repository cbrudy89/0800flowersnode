var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var async = require('async');
var Sync = require('sync');
var config = require('./../../../config');
var connection = require('./../../../database');
var commonHelper = require('./../../helpers/common-helper');
var dbModel = require('./../../models/db-model');

function NewsLetterController() {
        
    // get all 
    this.getNewsletterList = function(req,res){

      if(req.decoded.role != config.ROLE_ADMIN){
         res.status(config.HTTP_FORBIDDEN).send({
           status: config.ERROR, 
           code : config.HTTP_FORBIDDEN, 
           message: "You dont have permission to get newsletter subscription list!"
         });       
      }else{

         var return_data = {};
         var reqData = {};

         var page = req.body.page;
         var limit = req.body.limit;
         var order_by = req.body.order_by;

         var search_email = (req.body.search_email) ? (req.body.search_email.trim() !='' ? req.body.search_email :"" ):"";

         if(limit == undefined || limit == ''){
            limit = 30;
         }

         if (page == undefined || page == '') {
            page = 1;
         }

         if(order_by == undefined || order_by == ''){
           order_by = '';
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
                  "search_email":search_email,                
              };

              var result        = getAllSubscription.sync(null, reqData, false); 
              var total_records = getAllSubscription.sync(null, reqData, true); 

              if(result.length > 0){

                  var final_data  = {
                      "search_email":search_email,
                      "page": page,
                      "limit":limit,
                      "total_records":total_records[0].total_count,
                      "newsletter_subscription_list": result,
                  };

                  res.status(config.HTTP_SUCCESS).send({
                      status: config.SUCCESS, 
                      code : config.HTTP_SUCCESS, 
                      message: result.length+" Newsletter subscription found",
                      result : final_data
                  });

              }else{
                  res.status(config.HTTP_NOT_FOUND).send({
                     status:config.ERROR,
                     code: config.HTTP_NOT_FOUND, 
                     message:"No newsletter subscription found."
                 });         
              }
         });
      } 

    }
    
    // Update 
    this.updateNewsletter=function(req,res){

      if(req.decoded.role != config.ROLE_ADMIN){
         res.status(config.HTTP_FORBIDDEN).send({
             status: config.ERROR, 
             code : config.HTTP_FORBIDDEN, 
             message: "You dont have permission to update newsletter subscription!"
         });       
      }else{
        
        Sync(function(){
                                      
            var curr_date  = new Date();
            var id=req.body.id;
            var subscribe_email = (req.body.subscribe_email) ? (req.body.subscribe_email.trim() !='' ? req.body.subscribe_email :"" ):"";                       
            var updated_at = commonHelper.formatDateToMysqlDateTime(curr_date,3);   

            var checkSql ="SELECT id FROM subscribe_newsletter WHERE id = "+id;                        
            dbModel.rawQuery(checkSql, function(err, checkResult){

               if (err) {
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status: config.ERROR, 
                    code : config.HTTP_SERVER_ERROR, 
                    message : "Unable to process request!", 
                    //errors : err
                  });
               }else{
                  if(checkResult.length >0 ){
                       dbModel.getConnection(function(error, con){
                         if (error) {
                           res.status(config.HTTP_SERVER_ERROR).send({
                             status:config.ERROR,
                             code: config.HTTP_SERVER_ERROR,
                             message:'Unable to process request.',
                             //error : error
                           });
                         }else{
                             var checkData= {
                                subscribe_email:subscribe_email
                             };
                             
                             var checkExistingSql = checkExisting(checkData,id); //
                             dbModel.beginTransaction(con, checkExistingSql, function(error, checkExistingResult){
                                 if(error){
                                    res.status(config.HTTP_SERVER_ERROR).send({
                                      status:config.ERROR,
                                      code: config.HTTP_SERVER_ERROR,
                                      message:'Unable to process request!',
                                      //error: error
                                    });                    
                                 }else{  

                                       if(checkExistingResult.length > 0){
                                          res.status(config.HTTP_ALREADY_EXISTS).send({
                                            status: config.ERROR, 
                                            code : config.HTTP_ALREADY_EXISTS, 
                                            message: "The specified subscription email already exists.",
                                            //error: error
                                          });                             
                                       }else{

                                           var newsletter_subscription_id=id;

                                           var updateSql = "UPDATE subscribe_newsletter SET subscribe_email='"+subscribe_email+"', updated_at='"+updated_at+"' WHERE id="+newsletter_subscription_id+";";   
                                           // update into translation.
                                           dbModel.transactionQuery(con, updateSql, function (error, updateResult) {                       
                                             if(error){
                                                res.status(config.HTTP_SERVER_ERROR).send({
                                                  status:config.ERROR,
                                                  code: config.HTTP_SERVER_ERROR,
                                                  message:'Unable to process request!',
                                                  //error: error
                                                });                    
                                             }else{                                                
                                                if(updateResult.affectedRows > 0 ){      
                                                   dbModel.commit(con, function(error, response){
                                                      if (error) {
                                                          res.status(config.HTTP_SERVER_ERROR).send({
                                                              status:config.ERROR,
                                                              code: config.HTTP_SERVER_ERROR,
                                                              message:'Unable to process request!',
                                                              //error: error
                                                          });
                                                      }else{
                                                          res.status(config.HTTP_SUCCESS).send({
                                                              status:config.SUCCESS,
                                                              code: config.HTTP_SUCCESS,
                                                              message:'Newsletter subscription updated successfully.'
                                                          });
                                                      }  
                                                   });                                                

                                                }else{

                                                    res.status(config.HTTP_SERVER_ERROR).send({
                                                        status:config.ERROR,
                                                        code: config.HTTP_SERVER_ERROR,
                                                        message:'Unable to process request!',
                                                        //error: error
                                                    });
                                                }
                                             }

                                           });
                                       }

                                    }

                              });

                         }

                     });

                   }else{                          
                     res.status(config.HTTP_NOT_FOUND).send({
                        status: config.ERROR, 
                        code : config.HTTP_NOT_FOUND, 
                        message: "No newsletter subscription found."
                     });
                  }
               }
            });              
        });
      }    
    }
   
    // delete 
    this.deleteNewsletter = function(req,res){
        
      if(req.decoded.role != config.ROLE_ADMIN){          
         res.status(config.HTTP_FORBIDDEN).send({
             status: config.ERROR, 
             code : config.HTTP_FORBIDDEN, 
             message: "You dont have permission to delete translation!"
         });               
      }else{
         var id = req.body.id;
         var checksql ="SELECT subscribe_newsletter.id FROM subscribe_newsletter WHERE id = "+id;

         // Select subscribe_newsletter based on Id
         dbModel.rawQuery(checksql, function (error, checkResult) {
            if (error) {
               res.status(config.HTTP_SERVER_ERROR).send({
                 status:config.ERROR,
                 code: config.HTTP_SERVER_ERROR,
                 message:'Unable to process result!',
                 //error : error
               });
            
            }else{
               if(checkResult.length > 0 && checkResult[0].id > 0){
                // Getting Connection Object
                dbModel.getConnection(function(error, con){
                   if (error) {
                      res.status(config.HTTP_SERVER_ERROR).send({
                        status:config.ERROR,
                        code: config.HTTP_SERVER_ERROR,
                        message:'Unable to process result!',
                        //error : error
                      });
                   }else{
                      // Delete subscribe_newsletter form table if found 
                      dbModel.beginTransaction(con, ' DELETE FROM subscribe_newsletter WHERE id ='+id, function(error, result){
                         if(error){
                            res.status(config.HTTP_SERVER_ERROR).send({
                              status:config.ERROR,
                              code: config.HTTP_SERVER_ERROR,
                              message:'Unable to process result!',
                              //error: error
                            });                    
                        }else{
                           if(result.affectedRows > 0){

                              dbModel.commit(con, function(err, response){
                                 if (error) {
                                     res.status(config.HTTP_SERVER_ERROR).send({
                                       status:config.ERROR,
                                       code: config.HTTP_SERVER_ERROR,
                                       message:'Unable to process result!',
                                       //error: error
                                    });
                                 }else{
                                    res.status(config.HTTP_SUCCESS).send({
                                       status:config.SUCCESS,
                                       code: config.HTTP_SUCCESS,
                                       message:'Newsletter subscription deleted successfully.'
                                       //error: error
                                    });                                    
                                 }                                  

                              });

                           }else{
                              res.status(config.HTTP_SERVER_ERROR).send({
                                 status:config.ERROR,
                                 code: config.HTTP_SERVER_ERROR,
                                 message:'Unable to process result!',
                                 //error: error
                              });           
                           }

                        }

                      });
                  }

                });
              }else{
                  res.status(config.HTTP_NOT_FOUND).send({
                     status: config.ERROR, 
                     code : config.HTTP_NOT_FOUND, 
                     message: "No newsletter subscription found.",
                     //error: error
                });
              }          
            }
         });
      } 

    }
        
    // Get selected single  
    this.viewNewsletter = function(req, res) {
    
        if(req.decoded.role != config.ROLE_ADMIN){
            
            res.status(config.HTTP_FORBIDDEN).send({
              status: config.ERROR, 
              code : config.HTTP_FORBIDDEN, 
              message: "You dont have permission to get newsletter subscription!",
             // errors : err
            });       
            
        }else{
            
            var id=req.body.id;                           
            var sql ="SELECT subscribe_newsletter.id,subscribe_email,created_at FROM subscribe_newsletter ";                
                sql += " WHERE subscribe_newsletter.id = "+id;
                
               dbModel.rawQuery(sql, function(err, result){
                  if (err) {
                      res.status(config.HTTP_SERVER_ERROR).send({
                        status: config.ERROR, 
                        code : config.HTTP_SERVER_ERROR, 
                        message : "Unable to process request!", 
                        //errors : err
                     });

                 }else{                       
                     if(result.length > 0 && result[0].id > 0){
                         Sync(function(){
                              res.status(config.HTTP_SUCCESS).send({
                                 status: config.SUCCESS, 
                                 code : config.HTTP_SUCCESS, 
                                 message: " Newsletter subscription found",
                                 result : result
                             });
                         });

                     }else{
                         res.status(config.HTTP_NOT_FOUND).send({
                           status:config.ERROR,
                           code: config.HTTP_NOT_FOUND, 
                           message:"No newsletter subscription found."
                         });
                     }
                }
            });
        }
    
  };
      
}


function getAllSubscription(filters, find_total = false, callback) {
    var sql= "";
    var sqlWhere = "";
    
    if(find_total == false){
         sql = "SELECT id,subscribe_email,created_at ";
    }else{
         sql = "SELECT COUNT(*) AS total_count ";
    }

    sql += " FROM subscribe_newsletter ";    
        
    if(filters.search_email != undefined && filters.search_email != ''){
        sqlWhere += " WHERE subscribe_newsletter.subscribe_email ='"+filters.search_email+"'";               
    }
    
    sql +=sqlWhere;
    
    if(find_total == false){
      if(filters.order_by != undefined && filters.order_by != ''){             
        if(filters.order_by=='id-desc'){
            sql += " ORDER BY subscribe_newsletter.id DESC";
        }else{
            sql += " ORDER BY `subscribe_newsletter`.`id` ASC";
        }
      }
      sql += " LIMIT "+filters.start+","+filters.limit;
    }

    //console.log(sql);
    dbModel.rawQuery(sql, function(err, result) {
      if (err) return callback(err);
      else {
        callback(null, result)
      }

    });
}


function checkExisting(checkData,id){
   
   var subscribe_email = checkData.subscribe_email;
   var sql = "SELECT subscribe_newsletter.* ";
       sql += " FROM subscribe_newsletter WHERE ";

   if(id !='' && id != undefined){
       sql += " subscribe_newsletter.id !="+id+" AND ";
   }

   sql += " (subscribe_email = '"+subscribe_email+"' ) ";  
   //console.log(sql);
   return sql;
}


module.exports = new NewsLetterController();
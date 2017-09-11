var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var async = require('async');
var Sync = require('sync');
var config = require('./../../../config');
var connection = require('./../../../database');
var commonHelper = require('./../../helpers/common-helper');

var dbModel = require('./../../models/db-model');

function TranslationController() {
    
    
    // get all 
    this.getTranslationList = function(req,res){

      if(req.decoded.role != config.ROLE_ADMIN){
        res.status(config.HTTP_FORBIDDEN).send({
          status: config.ERROR, 
          code : config.HTTP_FORBIDDEN, 
          message: "You dont have permission to get translation!"
        });       
      }else{

            var return_data = {};
            var reqData = {};

            var page = req.body.page;
            var limit = req.body.limit;
            var order_by = req.body.order_by;
           
            //var search_original_text = (req.body.search_original_text) ? (req.body.search_original_text.trim() !='' ? req.body.search_original_text :"" ):"";
            
            var search_original_text = req.body.search_original_text;             
            if(search_original_text == undefined || search_original_text == ''){
              search_original_text = '';
            }
            
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
                "search_original_text":search_original_text,                
            };

            var result        = getAllTranslation.sync(null, reqData, false); 
            var total_records = getAllTranslation.sync(null, reqData, true); 
            
            if(result.length > 0){
                for ( let j=0 ; j < result.length; j++) { 
                    var language_translation  = getLanguageTranslation.sync(null, result[j].id);                    
                    result[j].language_translation   = language_translation;  
                }

                var final_data  = {
                    "search_original_text":search_original_text,
                    "page": page,
                    "limit":limit,
                    "total_records":total_records[0].total_count,
                    "translation_list": result,
                };

                res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: result.length+" Translation found",
                    result : final_data
                });

            }else{
               
                res.status(config.HTTP_NOT_FOUND).send({
                 status:config.ERROR,
                 code: config.HTTP_NOT_FOUND, 
                 message:"No translation found."
               });         
                
            }
          });
      } 

    }
    
    // Create new  
    this.createTranslation=function(req,res){

      if(req.decoded.role != config.ROLE_ADMIN){
        res.status(config.HTTP_FORBIDDEN).send({
            status: config.ERROR, 
            code : config.HTTP_FORBIDDEN, 
            message: "You dont have permission to create translation!"
        });       
      }else{
        
        Sync(function(){
            
            var curr_date  = new Date();
            var id = 0;
            var original_text = req.body.original_text;              
            var created_at = commonHelper.formatDateToMysqlDateTime(curr_date,3);
            var updated_at = commonHelper.formatDateToMysqlDateTime(curr_date,3);   
           
            dbModel.getConnection(function(error, con){
                if (error) {
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status:config.ERROR,
                    code: config.HTTP_SERVER_ERROR,
                    message:'Unable to process request!',
                    //error : error
                  });
                }else{
                   
                    var checkData = {
                        original_text:original_text,                        
                    };                    
                    var checksql = checkExisting(checkData,''); // check duplicate original_text in translation table                    
                    dbModel.beginTransaction(con, checksql, function(error, checkresult){
                       if(error){
                          res.status(config.HTTP_SERVER_ERROR).send({
                            status:config.ERROR,
                            code: config.HTTP_SERVER_ERROR,
                            message:'Unable to process request!',
                            //error: error
                          });                    
                        }else{  
                            if(checkresult.length > 0){
                                res.status(config.HTTP_ALREADY_EXISTS).send({
                                  status: config.ERROR, 
                                  code : config.HTTP_ALREADY_EXISTS, 
                                  message: "The specified translation already exists.",
                                  //error: error
                                });                             
                            }else{

                               var lkey = removeSpecialCharacterNumber(original_text);// only 15 character saved in db 
                               var sql  = "INSERT INTO translation SET original_text='"+original_text+"',lkey='"+lkey+"',created_at='"+created_at+"', updated_at='"+updated_at+"'; ";  
                               // insert into translation.
                               dbModel.transactionQuery(con, sql, function (error, result) {                       
                                  if(error){
                                     res.status(config.HTTP_SERVER_ERROR).send({
                                       status:config.ERROR,
                                       code: config.HTTP_SERVER_ERROR,
                                       message:'Unable to process request!',
                                       //error: error
                                     });                    
                                   }else{  

                                      if(result.insertId > 0){

                                           var translated_text = JSON.parse(req.body.translated_text);                                     
                                           //var translated_text = req.body.translated_text; 

                                           if(translated_text != undefined ){

                                              if( translated_text !='' && (Array.isArray(translated_text) == true) && translated_text.length > 0 ){

                                                 var translation_id = result.insertId;
                                                 var sql ="";

                                                 for (let j = 0; j < translated_text.length; j++) {
                                                    sql += "INSERT INTO language_translation SET language_id="+translated_text[j].language_id+",translation_id="+translation_id+",translated_text='"+translated_text[j].translated_text+"',created_at='"+created_at+"', updated_at='"+updated_at+"';";
                                                 }

                                                 dbModel.transactionQuery(con, sql, function (error, result) {
                                                    if (error) {
                                                       res.status(config.HTTP_SERVER_ERROR).send({
                                                         status:config.ERROR,
                                                         code: config.HTTP_SERVER_ERROR,
                                                         message:'Unable to process request!',
                                                         //error: error
                                                       });

                                                    }else{

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
                                                                 message:'Translation inserted successfully.'
                                                             });
                                                           }                                  

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

                                           }else{

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
                                                        message:'Translation inserted successfully.'
                                                    });
                                                 }                                  

                                              });                                              

                                           }

                                      }else{
                                         res.status(config.HTTP_SERVER_ERROR).send({
                                           status:config.ERROR,
                                           code: config.HTTP_SERVER_ERROR,
                                           message:'Unable to process request.',
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
                           
        });
      }    
    }
    
    // Update cms
    this.updateTranslation=function(req,res){

      if(req.decoded.role != config.ROLE_ADMIN){
         res.status(config.HTTP_FORBIDDEN).send({
             status: config.ERROR, 
             code : config.HTTP_FORBIDDEN, 
             message: "You dont have permission to update translation!"
         });       
      }else{
        
        Sync(function(){
                                      
            var curr_date  = new Date();
            var id=req.body.id;
            var original_text = req.body.original_text;                       
            var created_at = commonHelper.formatDateToMysqlDateTime(curr_date,3);
            var updated_at = commonHelper.formatDateToMysqlDateTime(curr_date,3);   

            var checkSql ="SELECT * FROM translation WHERE id = "+id;
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

                               var checkData = {
                                   original_text:original_text,                        
                               };

                               var checkExistingTranslationSql = checkExisting(checkData,id); // check duplicate original_text in translation table                    

                               dbModel.beginTransaction(con, checkExistingTranslationSql, function(error, checkExistingTranslationResult){
                               if(error){
                                 res.status(config.HTTP_SERVER_ERROR).send({
                                   status:config.ERROR,
                                   code: config.HTTP_SERVER_ERROR,
                                   message:'Unable to process request!',
                                   //error: error
                                 });                    
                               }else{  

                                   if(checkExistingTranslationResult.length > 0){
                                       res.status(config.HTTP_ALREADY_EXISTS).send({
                                         status: config.ERROR, 
                                         code : config.HTTP_ALREADY_EXISTS, 
                                         message: "The specified translation already exists.",
                                         //error: error
                                       });                             
                                   }else{

                                       var translation_id=id;
                                       var lkey = removeSpecialCharacterNumber(original_text);// only 15 character saved in db 

                                       var updateTranslationSql = "UPDATE translation SET original_text='"+original_text+"',lkey='"+lkey+"', updated_at='"+updated_at+"' WHERE id="+translation_id+";";   
                                       // update into translation.
                                       dbModel.transactionQuery(con, updateTranslationSql, function (error, updateTranslationResult) {                       
                                         if(error){
                                            res.status(config.HTTP_SERVER_ERROR).send({
                                              status:config.ERROR,
                                              code: config.HTTP_SERVER_ERROR,
                                              message:'Unable to process request!',
                                              //error: error
                                            });                    
                                         }else{                                                
                                            if(updateTranslationResult.affectedRows > 0 ){      
                                               var translated_text = JSON.parse(req.body.translated_text); 
                                               //var translated_text = req.body.translated_text; 
                                               if(translated_text != undefined){
                                                  if( translated_text !='' && (Array.isArray(translated_text) == true) && translated_text.length > 0 ){

                                                     var deletesql  ="DELETE FROM language_translation WHERE translation_id = "+translation_id+";";
                                                     dbModel.transactionQuery(con, deletesql, function (error, deleteResult){

                                                         if (error) {
                                                            res.status(config.HTTP_SERVER_ERROR).send({
                                                              status:config.ERROR,
                                                              code: config.HTTP_SERVER_ERROR,
                                                              message:'Unable to process request!',
                                                              //error: error
                                                            });

                                                         }else{

                                                             var sql = ""; 
                                                             for (let j = 0; j < translated_text.length; j++) {
                                                                 sql += "INSERT INTO language_translation SET language_id="+translated_text[j].language_id+",translation_id="+translation_id+",translated_text='"+translated_text[j].translated_text+"',created_at='"+created_at+"', updated_at='"+updated_at+"';";
                                                             }

                                                             dbModel.transactionQuery(con, sql, function (error, result) {
                                                                 if (error) {
                                                                    res.status(config.HTTP_SERVER_ERROR).send({
                                                                      status:config.ERROR,
                                                                      code: config.HTTP_SERVER_ERROR,
                                                                      message:'Unable to process request!',
                                                                      //error: error
                                                                    });
                                                                 }else{
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
                                                                            message:'Translation updated successfully.'
                                                                          });
                                                                       }                                  

                                                                   });
                                                                 }    
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
                                               }else{
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
                                                             message:'Translation updated successfully.'
                                                         });
                                                     }  
                                                  });                                                       
                                               }                                                    

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
                          message: "No translation found."
                       });
                    }
                }
            });
                           
        });
      }    
    }
   
    // delete 
    this.deleteTranslation = function(req,res){
        
      if(req.decoded.role != config.ROLE_ADMIN){
          
         res.status(config.HTTP_FORBIDDEN).send({
             status: config.ERROR, 
             code : config.HTTP_FORBIDDEN, 
             message: "You dont have permission to delete translation!"
         });       
        
      }else{
         var id = req.body.id;
         var checksql ="SELECT translation.id FROM translation WHERE id = "+id;

         // Select Translation based on Id
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
                      // Delete occasions form table if found 
                      dbModel.beginTransaction(con, ' DELETE FROM translation WHERE id ='+id, function(error, result){
                         if(error){
                            res.status(config.HTTP_SERVER_ERROR).send({
                              status:config.ERROR,
                              code: config.HTTP_SERVER_ERROR,
                              message:'Unable to process result!',
                              //error: error
                            });                    
                        }else{
                           if(result.affectedRows > 0){

                             var deleteSql = "DELETE FROM language_translation WHERE translation_id ="+id+";";                                                                  
                             dbModel.transactionQuery(con, deleteSql, function (error, deleteResult) {
                                if (error) {
                                   res.status(config.HTTP_SERVER_ERROR).send({
                                      status:config.ERROR,
                                      code: config.HTTP_SERVER_ERROR,
                                      message:'Unable to process result!',
                                      //error: error
                                   });
                                }else{

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
                                            message:'Translation deleted successfully.'
                                            //error: error
                                         });                                    
                                      }                                  

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
                     message: "No translation found.",
                     //error: error
                });
              }          
            }
         });
      } 

    }
    
    // Get selected single  
    this.viewTranslation = function(req, res) {
    
        if(req.decoded.role != config.ROLE_ADMIN){
            
            res.status(config.HTTP_FORBIDDEN).send({
              status: config.ERROR, 
              code : config.HTTP_FORBIDDEN, 
              message: "You dont have permission to get translation!",
             // errors : err
            });       
            
        }else{
            
            var id=req.body.id;                           
            var sql ="SELECT translation.* FROM translation ";                
                sql += " WHERE translation.id = "+id;
                
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
                          var language_translation  = getLanguageTranslation.sync(null, id);                                                         
                             result[0].language_translation = language_translation;   
                             res.status(config.HTTP_SUCCESS).send({
                                status: config.SUCCESS, 
                                code : config.HTTP_SUCCESS, 
                                message: " Translation found",
                                result : result
                            });
                        });

                    }else{
                        res.status(config.HTTP_NOT_FOUND).send({
                          status:config.ERROR,
                          code: config.HTTP_NOT_FOUND, 
                          message:"No translation found."
                        });
                    }
                 }
            });
        }
    
  };
  
}


function getAllTranslation(filters, find_total = false, callback) {
    var sql= "";
    var sqlWhere = "";
    
    if(find_total == false){
         sql = "SELECT translation.* ";
    }else{
         sql = "SELECT COUNT(*) AS total_count ";
    }

    sql += " FROM translation ";    
        
    if(filters.search_original_text != undefined && filters.search_original_text != ''){
        sqlWhere += " WHERE translation.original_text LIKE '%"+filters.search_original_text+"%' ";               
    }
    
    sql +=sqlWhere;
    
    if(find_total == false){
      if(filters.order_by != undefined && filters.order_by != ''){             
        if(filters.order_by=='id-desc'){
            sql += " ORDER BY translation.id DESC";
        }else{
            sql += " ORDER BY `translation`.`id` ASC";
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


function getLanguageTranslation(translation_id, callback){

  var sql = "SELECT language_translation.language_id,language_translation.translated_text,languages.name ";
      sql += " FROM `language_translation`";  
      sql += " LEFT JOIN `languages` ON languages.id = language_translation.language_id";
      sql += " WHERE language_translation.translation_id="+translation_id; 
 
    dbModel.rawQuery(sql, function(err, result) {
      if (err) return callback(err);
      else {
        callback(null, result);                    
      }
    });            
}

function checkExisting(checkData,id){
    
   var original_text = checkData.original_text;
   var lkey = removeSpecialCharacterNumber(original_text);         
       lkey = lkey.substring(0,15); // only 15 character saved in db 

   var sql = "SELECT translation.* ";
       sql += " FROM translation WHERE ";

       if(id !='' && id != undefined){
           sql += " translation.id !="+id+" AND ";
       }

       sql += " (original_text = '"+original_text+"' OR lkey = '"+lkey+"' ) ";  
       //console.log(sql);
       return sql;
}

function removeSpecialCharacterNumber(stringText){
   //var stringText = "TEST' %&*** - / 666 HHHHabc"; // TESTHHHHabc
   return stringText.replace(/[^a-zA-Z]/g, "").toLowerCase(); // testhhhhabc
}

module.exports = new TranslationController();
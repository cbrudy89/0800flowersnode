var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var async = require('async');
var Sync = require('sync');
var config = require('./../../../config');
var connection = require('./../../../database');
var commonHelper = require('./../../helpers/common-helper');

var dbModel = require('./../../models/db-model');

function OccasionController() {
    
    
    // get all occasion
    this.getOccasionList = function(req,res){

      if(req.decoded.role != config.ROLE_ADMIN){
        res.status(config.HTTP_FORBIDDEN).send({
          status: config.ERROR, 
          code : config.HTTP_FORBIDDEN, 
          message: "You dont have permission to get occasion!"
        });       
      }else{

            var return_data = {};
            var reqData = {};

            var page = req.body.page;
            var limit = req.body.limit;
            var order_by = req.body.order_by;
            var search_occasion_name = req.body.search_occasion_name;

            if(search_occasion_name == undefined || search_occasion_name == ''){
              search_occasion_name = '';
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
                "search_occasion_name":search_occasion_name,
            };

            var result        = getAllOccasions.sync(null, reqData, false); 
            var total_records = getAllOccasions.sync(null, reqData, true); 
            
            if(result.length > 0){
                for ( var j=0 ; j < result.length; j++) { 
                    var occasion_country  = getAllCountryOcassion.sync(null, result[j].id);
                    var language_types    = getAllLanguageTypes.sync(null, result[j].id);                    
                      result[j].name_description   = language_types;  
                      result[j].occasion_country   = occasion_country;
                }

                var final_data  = {
                    "search_occasion_name":search_occasion_name,
                    "page": page,
                    "limit":limit,
                    "total_records":total_records[0].total_occasions,
                    "occasion_list": result,
                };

                res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: result.length+" occasions found",
                    result : final_data
                });

            }else{
               
                res.status(config.HTTP_NOT_FOUND).send({
                 status:config.ERROR,
                 code: config.HTTP_NOT_FOUND, 
                 message:"No occasions found."
               });         
                
            }
          });
      } 

    }
    
    // Create new occasion 
    this.createOccasion=function(req,res){

      if(req.decoded.role != config.ROLE_ADMIN){
        res.status(config.HTTP_FORBIDDEN).send({
            status: config.ERROR, 
            code : config.HTTP_FORBIDDEN, 
            message: "You dont have permission to create occasion !"

        });       
      }else{
        
        Sync(function(){
                                      
            var curr_date  = new Date();
            var id=0;
            var country_flag_arr = req.body.country_name.split(',');
            var country_flag="";
            
            if( country_flag_arr.length > 0 ){
                for(var i=0; i < country_flag_arr.length;i++){
                    if(country_flag_arr[i] == "all"){
                        country_flag = "all";
                        break;

                    }else{
                        country_flag = "";
                    }

                }
            }

            if(country_flag !='' && country_flag =='all'){
                var selected_countries_obj = getCountryListAsArray.sync(null);
                var selected_countries = selected_countries_obj.map(function (item) { return item.id; });
            }else{
                var selected_countries = req.body.country_name.split(',');                
            }
           

            if(req.body.index_no_follow !='' && req.body.index_no_follow != undefined && req.body.index_no_follow == 1){
              var index_no_follow = 1;
            }else{
              var  index_no_follow =0;
            }

            if(req.body.meta_title !='' && req.body.meta_title != undefined ){
                var  meta_title = req.body.meta_title;
            }else{
                var  meta_title= "";
            }  

            if(req.body.meta_description !='' && req.body.meta_description != undefined ){
                var  meta_description = req.body.meta_description;
            }else{
                var  meta_description= "";
            }

            if(req.body.meta_keywords !='' && req.body.meta_keywords != undefined ){
                var  meta_keywords = req.body.meta_keywords;
            }else{
                var  meta_keywords= "";
            }  

            if(req.body.collection_filter !='' && req.body.collection_filter != undefined ){
                var  collection_filter = req.body.collection_filter;
            }else{
                var  collection_filter = 0;
            }            

            if(req.body.i_mark !='' && req.body.i_mark != undefined ){
                var  i_mark = req.body.i_mark;
            }else{
                var  i_mark = 0;
            } 

            if(req.body.occasion_status !='' && req.body.occasion_status != undefined ){
                var  occasion_status = req.body.occasion_status;
            }else{
                var  occasion_status = 0;
            }   

            if(req.body.card_message !='' && req.body.card_message != undefined ){
                var  card_message = req.body.card_message;
            }else{
                var  card_message = 0;
            }     

            var occasion_day = req.body.occasion_day;
            var occasion_month = req.body.occasion_month;
            var created_at = commonHelper.formatDateToMysqlDateTime(curr_date,3);
            var updated_at = commonHelper.formatDateToMysqlDateTime(curr_date,3);

            
            dbModel.getConnection(function(error, con){
                if (error) {
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status:config.ERROR,
                    code: config.HTTP_SERVER_ERROR,
                    message:'Unable to process request.',
                    //error : error
                  });
                }else{
                    
                    var occasion_name_arr = JSON.parse(req.body.name_description_arr);  
                    var checksql=  checkExistOccasionName(occasion_name_arr,'');
                    
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
                              message: "The specified occasion name already exists."
                            });                             
                        }else{
                                                        
                            var sql = "INSERT INTO occasions SET country_flag='"+country_flag+"', occasion_day="+occasion_day+", occasion_month="+occasion_month+", updated_at='"+updated_at+"', index_no_follow="+index_no_follow+",meta_title='"+meta_title+"',meta_description='"+meta_description+"',meta_keywords='"+meta_keywords+"',collection_filter="+collection_filter+",i_mark="+i_mark+",occasion_status="+occasion_status+",card_message="+card_message+" ;";  
                            // Update vendor into table.
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

                                      var occasion_id = result.insertId;
                                      var sql ="";
                                      if( selected_countries.length > 0){
                                          for (i = 0; i < selected_countries.length; i++) {                                                        
                                            sql += "INSERT INTO occasion_country SET country_id="+selected_countries[i]+", occasion_id="+occasion_id+";";
                                          }            
                                      }

                                      var description_arr = JSON.parse(req.body.name_description_arr); 
                                      if(description_arr.length > 0){

                                         for (var j = 0; j < description_arr.length; j++) {
                                            sql += "INSERT INTO language_types SET language_id="+description_arr[j].language_id+", type_id="+occasion_id+",type='occasion',name='"+description_arr[j].occasion_name+"',description='"+description_arr[j].occasion_description+"';";
                                         }
                                      }    

                                      dbModel.transactionQuery(con, sql, function (error, result) {
                                        if (error) {
                                          res.status(config.HTTP_SERVER_ERROR).send({
                                            status:config.ERROR,
                                            code: config.HTTP_SERVER_ERROR,
                                            message:'Unable to process request.',
                                            //error: error
                                          });
                                        }else{

                                          dbModel.commit(con, function(error, response){
                                            if (error) {
                                              res.status(config.HTTP_SERVER_ERROR).send({
                                                status:config.ERROR,
                                                code: config.HTTP_SERVER_ERROR,
                                                message:'Unable to process request.',
                                                error: error
                                              });
                                            }else{
                                               res.status(config.HTTP_SUCCESS).send({
                                                  status:config.SUCCESS,
                                                  code: config.HTTP_SUCCESS,
                                                  message:'Occasion inserted successfully.'
                                              });
                                            }                                  

                                          });

                                        }    
                                      });
                                 }
                                 else{
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
    
    // Update occasion
    this.updateOccasion=function(req,res){
   
        if(req.decoded.role != config.ROLE_ADMIN){
            res.status(config.HTTP_FORBIDDEN).send({
              status: config.ERROR, 
              code : config.HTTP_FORBIDDEN, 
              message: "You dont have permission to update occasion.",
              
            });       
        }else{

            Sync(function(){
                
                var curr_date  = new Date();
                var id= req.body.id;
                var country_flag_arr = req.body.country_name.split(',');
                var country_flag="";
                
                if( country_flag_arr.length > 0 ){
                    for(var i=0; i < country_flag_arr.length;i++){
                        if(country_flag_arr[i] == "all"){
                            country_flag = "all";
                            break;

                        }else{
                            country_flag = "";
                        }

                    }
                }
                
                if(country_flag !='' && country_flag =='all'){
                    var selected_countries_obj = getCountryListAsArray.sync(null);
                    var selected_countries = selected_countries_obj.map(function (item) { return item.id; });

                }else{
                    var selected_countries = req.body.country_name.split(',');
                }
                
                var occasion_day  = req.body.occasion_day;
                var occasion_month = req.body.occasion_month;
                var updated_at = commonHelper.formatDateToMysqlDateTime(curr_date,3);
                

                if(req.body.index_no_follow !='' && req.body.index_no_follow != undefined ){
                  var index_no_follow = 1;                  
                }else{
                  var index_no_follow = 0;
                }
               
                if(req.body.meta_title !='' && req.body.meta_title != undefined ){
                    var meta_title = req.body.meta_title;    
                }
                
                if(req.body.meta_description !='' && req.body.meta_description != undefined ){
                     var meta_description = req.body.meta_description;
                }

                if(req.body.meta_keywords !='' && req.body.meta_keywords != undefined ){
                    var meta_keywords = req.body.meta_keywords;
                }
                            
                if(req.body.collection_filter !='' && req.body.collection_filter != undefined ){
                    var collection_filter = req.body.collection_filter;
                }else{
                    var collection_filter = 0;            
                }         

                if(req.body.i_mark !='' && req.body.i_mark != undefined ){
                    var i_mark =  req.body.i_mark;
                }else{
                    var i_mark = 0;            
                }    

                if(req.body.occasion_status !='' && req.body.occasion_status != undefined ){
                    var occasion_status = req.body.occasion_status;
                }else{
                    var occasion_status = 0;            
                }  

                if(req.body.card_message !='' && req.body.card_message != undefined ){
                    var card_message = req.body.card_message;
                }else{
                    var card_message = 0;            
                }    
                              
                              
                var checkSql ="SELECT * FROM occasions WHERE id = "+id;
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
                                      message:'Unable to process request!',
                                      //error : error
                                    });
                                }else{
                                    var occasion_id = id; 
                                    var occasion_name_arr = JSON.parse(req.body.name_description_arr);  
                                    var allReadyExitOCcasionchecksql=  checkExistOccasionName(occasion_name_arr,occasion_id);
                                    //console.log(allReadyExitOCcasionchecksql);
                                    
                                    dbModel.beginTransaction(con, allReadyExitOCcasionchecksql, function(error, allReadyExitOCcasioncheckResult){
                                        if(error){
                                            res.status(config.HTTP_SERVER_ERROR).send({
                                              status:config.ERROR,
                                              code: config.HTTP_SERVER_ERROR,
                                              message:'Unable to process request!',
                                              //error: error
                                            });                    
                                        }else{  

                                            if(allReadyExitOCcasioncheckResult.length > 0){
                                                res.status(config.HTTP_ALREADY_EXISTS).send({
                                                  status: config.ERROR, 
                                                  code : config.HTTP_ALREADY_EXISTS, 
                                                  message: "The specified occasion name already exists."
                                                });                             
                                            }else{
                                                
                                                 
                                                var sql = "UPDATE occasions SET country_flag='"+country_flag+"', occasion_day="+occasion_day+", occasion_month="+occasion_month+", updated_at='"+updated_at+"', index_no_follow="+index_no_follow+",meta_title='"+meta_title+"',meta_description='"+meta_description+"',meta_keywords='"+meta_keywords+"',collection_filter="+collection_filter+", collection_filter="+collection_filter+",i_mark="+i_mark+",occasion_status="+occasion_status+",card_message="+card_message+"  WHERE id="+occasion_id+";";  
                                                // Update vendor into table.
                                                dbModel.beginTransaction(con, sql, function(error, result){
                                                 if(error){
                                                    res.status(config.HTTP_SERVER_ERROR).send({
                                                      status:config.ERROR,
                                                      code: config.HTTP_SERVER_ERROR,
                                                      message:'Unable to process request!',
                                                     // error: error
                                                    });                    
                                                 }else{  

                                                    var sql  ="DELETE FROM occasion_country WHERE  occasion_id = "+occasion_id+";";
                                                    sql +="DELETE FROM language_types WHERE language_types.type='occasion' AND type_id = "+occasion_id+";";   
                                                    dbModel.transactionQuery(con, sql, function (error, result){
                                                   
                                                        if (error) {    
                                                            res.status(config.HTTP_SERVER_ERROR).send({
                                                              status:config.ERROR,
                                                              code: config.HTTP_SERVER_ERROR,
                                                              message:'Unable to process request!',
                                                              //error: error
                                                            });

                                                        }else{

                                                            var sql ="";
                                                            if( selected_countries.length > 0){
                                                                for (i = 0; i < selected_countries.length; i++) {                                                        
                                                                  sql += "INSERT INTO occasion_country SET country_id="+selected_countries[i]+", occasion_id="+occasion_id+";";
                                                                }            
                                                            }

                                                            var description_arr = JSON.parse(req.body.name_description_arr); 
                                                            if(description_arr.length > 0){

                                                               for (var j = 0; j < description_arr.length; j++) {
                                                                  sql += "INSERT INTO language_types SET language_id="+description_arr[j].language_id+", type_id="+occasion_id+",type='occasion',name='"+description_arr[j].occasion_name+"',description='"+description_arr[j].occasion_description+"';";
                                                               }
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
                                                                     message:'Occasion updated successfully.'
                                                                 });
                                                               }                                  

                                                             });

                                                           }    
                                                         });

                                                       }

                                                    });

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
                              message: "No occasion found."
                            });
                         }
                    }

                 });
                 
             });
        }  
   }
   
    // delete occasion
    this.deleteOccasion = function(req,res){
        
      if(req.decoded.role != config.ROLE_ADMIN){
          
        res.status(config.HTTP_FORBIDDEN).send({
          status: config.ERROR, 
          code : config.HTTP_FORBIDDEN, 
          message: "You dont have permission to delete occasion!"
        });       
        
      }else{

            var id = req.body.id;
            var sql ="SELECT * FROM occasions WHERE id = "+id;

            // Select occasion based on Id
            dbModel.rawQuery(sql, function (error, occasionsResult) {
              if (error) {
                    res.status(config.HTTP_SERVER_ERROR).send({
                      status:config.ERROR,
                      code: config.HTTP_SERVER_ERROR,
                      message:'Unable to process result!',
                      //error : error
                    });
              }
              else{

                if(occasionsResult.length > 0 && occasionsResult[0].id > 0){

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
                      dbModel.beginTransaction(con, ' DELETE FROM occasions WHERE id ='+id, function(error, result){
                        if(error){
                          res.status(config.HTTP_SERVER_ERROR).send({
                            status:config.ERROR,
                            code: config.HTTP_SERVER_ERROR,
                            message:'Unable to process result!',
                            //error: error
                          });                    
                        }else{

                          if(result.affectedRows > 0){
                            
                             var sql1 =  "DELETE FROM occasion_country WHERE occasion_id ="+id+";";
                                 sql1 += "DELETE FROM language_types WHERE language_types.type='occasion' AND type_id ="+id+";";   
                                 
                            dbModel.transactionQuery(con, sql1, function (error, result) {
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
                                      message:'Occasion deleted successfully.'
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
                    message: "No occasion found.",
                    //error: error
                  });
                }          
              }
            });


      } // else close    

    }
    
    // Get selected single occasion 
    this.getSelectedOccasion = function(req, res) {
    
        if(req.decoded.role != config.ROLE_ADMIN){
            
            res.status(config.HTTP_FORBIDDEN).send({
              status: config.ERROR, 
              code : config.HTTP_FORBIDDEN, 
              message: "You dont have permission to get occasion!",
             // errors : err
            });       
            
        }else{
            
            var id=req.body.id;
                           
            var occasionSql ="SELECT id,country_flag,occasion_day,occasion_month,occasion_status,collection_filter,i_mark,card_message,index_no_follow,meta_title,meta_keywords,meta_description,created_at,updated_at FROM occasions ";                
                occasionSql += " WHERE occasions.id = "+id;
                
               dbModel.rawQuery(occasionSql, function(err, occasionResult){

                if (err) {
                    res.status(config.HTTP_SERVER_ERROR).send({
                      status: config.ERROR, 
                      code : config.HTTP_SERVER_ERROR, 
                      message : "Unable to process request!", 
                      //errors : err
                    });

                 }else{                       
                        if(occasionResult.length > 0 && occasionResult[0].id > 0){                            
                            
                            
                             Sync(function(){                                 
                                var occasion_country  = getAllCountryOcassion.sync(null, id);
                                var language_types    = getAllLanguageTypes.sync(null, id);                    
                                   occasionResult[0].name_description   = language_types;  
                                   occasionResult[0].occasion_country   = occasion_country;   

                                   res.status(config.HTTP_SUCCESS).send({
                                        status: config.SUCCESS, 
                                        code : config.HTTP_SUCCESS, 
                                        message: " Occasion found",
                                        result : occasionResult
                                  });
                            
                             });

                       }else{
                               
                             res.status(config.HTTP_NOT_FOUND).send({
                                status:config.ERROR,
                                code: config.HTTP_NOT_FOUND, 
                                message:"No occasion found"
                             });                                  
                       }
                    }
                });
        }
    
  };
  
}

function getCountryListAsArray(callback){

  var sql  = "SELECT id ";
      sql += " FROM `country_list`";  
      sql += " WHERE `country_list`.`status`=1"; 
 

    dbModel.rawQuery(sql, function(err, result) {
      if (err) return callback(err);
      else {
        callback(null, result);                    
      }
    });            
}

function getAllOccasions(filters, find_total = false, callback) {

    if(find_total == false){
        var sql = "SELECT occasions.id,country_flag,occasion_day,occasion_month,occasion_status,collection_filter,i_mark,card_message,index_no_follow,meta_title,meta_keywords,meta_description,occasions.created_at,occasions.updated_at ";
    }else{
        var sql = "SELECT COUNT(*) AS total_occasions ";
    }

    sql += " FROM occasions ";
    sql += " LEFT JOIN language_types ON language_types.type_id = occasions.id ";
    sql += " WHERE language_types.type='occasion' ";
    
    if(filters.search_occasion_name != undefined && filters.search_occasion_name != ''){
        sql += " AND language_types.name LIKE '%"+filters.search_occasion_name+"%' ";               
    }
      
    sql += " GROUP BY occasions.id";
    
    if(find_total == false){
      
      if(filters.order_by != undefined && filters.order_by != ''){
             
             if(filters.order_by=='id-desc'){
                 sql += " ORDER BY occasions.id DESC";
             
             }else{
                 sql += " ORDER BY `occasions`.`id` ASC";
             }
             
      }

      sql += " LIMIT "+filters.start+","+filters.limit;
    }

   // console.log(sql);
    dbModel.rawQuery(sql, function(err, result) {
      if (err) return callback(err);
      else {
        callback(null, result)
      }

    });

}

function getAllCountryOcassion(occasion_id, callback){

  var sql = "SELECT occasion_country.country_id,country_list.country_name";
      sql += " FROM `occasion_country`";  
      sql += " LEFT JOIN `country_list` ON country_list.id =occasion_country.country_id"; 
      sql += " WHERE `occasion_country`.`occasion_id`="+occasion_id; 
 
    dbModel.rawQuery(sql, function(err, result) {
      if (err) return callback(err);
      else {
        callback(null, result);                    
      }
    });            
}

function getAllLanguageTypes(occasion_id, callback){

  var sql = "SELECT language_types.language_id,language_types.name,language_types.description,languages.name as language_name";
      sql += " FROM `language_types`";  
      sql += " LEFT JOIN `languages` ON languages.id =language_types.language_id";
      sql += " WHERE language_types.type='occasion' and `language_types`.`type_id`="+occasion_id; 
 
    dbModel.rawQuery(sql, function(err, result) {
      if (err) return callback(err);
      else {
        callback(null, result);                    
      }
    });            
}

function checkExistOccasionName(description_arr,id){

    var  sqlOccasionName= ""; 
    
    var sql = "SELECT occasions.* ";
        sql += " FROM occasions ";
        sql += " LEFT JOIN language_types ON language_types.type_id = occasions.id ";
        
        if(id !='' && id != undefined){
            sql += "  WHERE (language_types.type='occasion' AND language_types.type_id !="+id+" )  ";
        }else{
            sql += "  WHERE (language_types.type='occasion')  ";
        }
       
        sqlOccasionName += " AND ( ";
        if(description_arr.length > 0){

            for (var j = 0; j < description_arr.length; j++) {
                
                if(j == 0){
                    sqlOccasionName += "  ( language_types.language_id="+description_arr[j].language_id+" AND language_types.name = '"+description_arr[j].occasion_name+"')  "; 
                }else{
                    sqlOccasionName += " OR ( language_types.language_id="+description_arr[j].language_id+" AND language_types.name = '"+description_arr[j].occasion_name+"')  "; 
                }
            }
        }
        
        sqlOccasionName +=" ) ";
        sql += sqlOccasionName;
        
        //console.log(sql);
        return sql;
        
}
module.exports = new OccasionController();
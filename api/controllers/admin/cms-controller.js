var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var async = require('async');
var Sync = require('sync');
var config = require('./../../../config');
var connection = require('./../../../database');
var commonHelper = require('./../../helpers/common-helper');

var dbModel = require('./../../models/db-model');

function CmsController() {
    
    
    // get all cms
    this.getCmsList = function(req,res){

      if(req.decoded.role != config.ROLE_ADMIN){
        res.status(config.HTTP_FORBIDDEN).send({
          status: config.ERROR, 
          code : config.HTTP_FORBIDDEN, 
          message: "You dont have permission to get cms page!"
        });       
      }else{

            var return_data = {};
            var reqData = {};

            var page = req.body.page;
            var limit = req.body.limit;
            var order_by = req.body.order_by;
            var search_page_name = req.body.search_page_name;
            var search_slug = req.body.search_slug;
            var search_page_title = req.body.search_page_title;
            
            if(search_page_name == undefined || search_page_name == ''){
              search_page_name = '';
            }
            
            if(search_slug == undefined || search_slug == ''){
              search_slug = '';
            }
            
            if(search_page_title == undefined || search_page_title == ''){
              search_page_title = '';
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
                "search_page_name":search_page_name,
                "search_slug":search_slug,
                "search_page_title":search_page_title,
            };

            var result        = getAllPages.sync(null, reqData, false); 
            var total_records = getAllPages.sync(null, reqData, true); 
            
            if(result.length > 0){
                for ( var j=0 ; j < result.length; j++) { 
                    var cms_language  = getAllCmsLanguage.sync(null, result[j].id);                    
                    result[j].cms_language   = cms_language;  
                }

                var final_data  = {
                    "search_page_name":search_page_name,
                    "search_slug":search_slug,
                    "search_page_title":search_page_title,
                    "page": page,
                    "limit":limit,
                    "total_records":total_records[0].total_pages,
                    "page_list": result,
                };

                res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: result.length+" cms page found",
                    result : final_data
                });

            }else{
               
                res.status(config.HTTP_NOT_FOUND).send({
                 status:config.ERROR,
                 code: config.HTTP_NOT_FOUND, 
                 message:"No cms page found."
               });         
                
            }
          });
      } 

    }
    
    // Create new cms 
    this.createCms=function(req,res){

      if(req.decoded.role != config.ROLE_ADMIN){
        res.status(config.HTTP_FORBIDDEN).send({
            status: config.ERROR, 
            code : config.HTTP_FORBIDDEN, 
            message: "You dont have permission to create cms page !"

        });       
      }else{
        
        Sync(function(){
                                      
            var curr_date  = new Date();
            var id=0;
            var page_name = req.body.page_name;
            var slug = req.body.slug;
            var page_title = req.body.page_title;
            var canonical_url = req.body.canonical_url;
            
            var created_at = commonHelper.formatDateToMysqlDateTime(curr_date,3);
            var updated_at = commonHelper.formatDateToMysqlDateTime(curr_date,3);                     

            if(req.body.placement !='' && req.body.placement != undefined ){
                var placement    = req.body.placement;
            }else{
                var placement  = 0;
            }
            
            if(req.body.status !='' && req.body.status != undefined ){
              var status = 1;
            }else{
              var  status =0;
            }

            if(req.body.meta_keywords !='' && req.body.meta_keywords != undefined ){
                var  meta_keywords = req.body.meta_keywords;
            }else{
                var  meta_keywords= "";
            }  

            if(req.body.meta_description !='' && req.body.meta_description != undefined ){
                var  meta_description = req.body.meta_description;
            }else{
                var  meta_description= "";
            }            

            
            dbModel.getConnection(function(error, con){
                if (error) {
                  res.status(config.HTTP_SERVER_ERROR).send({
                    status:config.ERROR,
                    code: config.HTTP_SERVER_ERROR,
                    message:'Unable to process request.',
                    //error : error
                  });
                }else{
                    
                    //var occasion_name_arr = JSON.parse(req.body.name_description_arr); 
                    var checkData= {
                        page_name:page_name,
                        slug:slug
                    };
                    var checksql=  checkExistPageNameAndSlug(checkData,''); // check duplicate page name and slug
                    
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
                              message: "The specified cms page name or slug already exists.",
                              //error: error
                            });                             
                        }else{
                                                        
                            var sql = "INSERT INTO cms SET page_name='"+page_name+"', slug='"+slug+"', page_title='"+page_title+"', canonical_url='"+canonical_url+"',placement="+placement+" , meta_keywords='"+meta_keywords+"', meta_description='"+meta_description+"',status="+status+",created_at='"+created_at+"', updated_at='"+updated_at+"' ;";  
                            // insert into cms.
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

                                      var cms_id = result.insertId;
                                      var sql ="";
                                      
                                      var description_arr = JSON.parse(req.body.h1text_description_arr); 
                                      //var description_arr = req.body.h1text_description_arr; 
                                      
                                      if(description_arr.length > 0){

                                         for (var j = 0; j < description_arr.length; j++) {
                                            sql += "INSERT INTO cms_language SET language_id="+description_arr[j].language_id+", cms_id="+cms_id+",h1_text='"+description_arr[j].h1_text+"',description='"+description_arr[j].description+"';";
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
                                                  message:'Cms page inserted successfully.'
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
    
    // Update cms
    this.updateCms=function(req,res){

      if(req.decoded.role != config.ROLE_ADMIN){
        res.status(config.HTTP_FORBIDDEN).send({
            status: config.ERROR, 
            code : config.HTTP_FORBIDDEN, 
            message: "You dont have permission to update cms page !"

        });       
      }else{
        
        Sync(function(){
                                      
            var curr_date  = new Date();
            var id=req.body.id;
            var page_name = req.body.page_name;
            var slug = req.body.slug;
            var page_title = req.body.page_title;
            var canonical_url = req.body.canonical_url;
                       
            var updated_at = commonHelper.formatDateToMysqlDateTime(curr_date,3);                     

            if(req.body.placement !='' && req.body.placement != undefined ){
                var placement    = req.body.placement;
            }else{
                var placement  = 0;
            }
            
            if(req.body.status !='' && req.body.status != undefined ){
              var status = 1;
            }else{
              var  status =0;
            }

            if(req.body.meta_keywords !='' && req.body.meta_keywords != undefined ){
                var  meta_keywords = req.body.meta_keywords;
            }else{
                var  meta_keywords= "";
            }  

            if(req.body.meta_description !='' && req.body.meta_description != undefined ){
                var  meta_description = req.body.meta_description;
            }else{
                var  meta_description= "";
            }            

            var checkSql ="SELECT * FROM cms WHERE id = "+id;
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

                                //var occasion_name_arr = JSON.parse(req.body.name_description_arr); 
                                var checkData= {
                                    page_name:page_name,
                                    slug:slug
                                };
                                
                                var checkExistsSql=  checkExistPageNameAndSlug(checkData,id);

                                dbModel.beginTransaction(con, checkExistsSql, function(error, checkExistsResult){
                                if(error){
                                  res.status(config.HTTP_SERVER_ERROR).send({
                                    status:config.ERROR,
                                    code: config.HTTP_SERVER_ERROR,
                                    message:'Unable to process request!',
                                    //error: error
                                  });                    
                                }else{  

                                    if(checkExistsResult.length > 0){
                                        res.status(config.HTTP_ALREADY_EXISTS).send({
                                          status: config.ERROR, 
                                          code : config.HTTP_ALREADY_EXISTS, 
                                          message: "The specified cms page name or slug already exists.",
                                          //error: error
                                        });                             
                                    }else{
                                        
                                        var cms_id=id;
                                        var updateCmsSql = "UPDATE cms SET page_name='"+page_name+"', slug='"+slug+"', page_title='"+page_title+"', canonical_url='"+canonical_url+"',placement="+placement+" , meta_keywords='"+meta_keywords+"', meta_description='"+meta_description+"',status="+status+", updated_at='"+updated_at+"' WHERE id="+cms_id+";";   
                                        // update into cms.
                                        dbModel.transactionQuery(con, updateCmsSql, function (error, updateCmsResult) {                       
                                          if(error){
                                            res.status(config.HTTP_SERVER_ERROR).send({
                                              status:config.ERROR,
                                              code: config.HTTP_SERVER_ERROR,
                                              message:'Unable to process request!',
                                              //error: error
                                            });                    
                                          }else{  
                                              
                                                if(updateCmsResult.affectedRows > 0 ){
                                                    // console.log(updateCmsResult);
                                                    //process.exit();
                                                    var deletesql  ="DELETE FROM cms_language WHERE  cms_id = "+cms_id+";";

                                                    dbModel.transactionQuery(con, deletesql, function (error, deleteResult){

                                                    if (error) {    
                                                        res.status(config.HTTP_SERVER_ERROR).send({
                                                          status:config.ERROR,
                                                          code: config.HTTP_SERVER_ERROR,
                                                          message:'Unable to process request!',
                                                          //error: error
                                                        });

                                                    }else{

                                                        var sql ="";
                                                        //var description_arr = req.body.h1text_description_arr; 
                                                        var description_arr = JSON.parse(req.body.h1text_description_arr); 

                                                        if(description_arr.length > 0){

                                                           for (var j = 0; j < description_arr.length; j++) {
                                                              sql += "INSERT INTO cms_language SET language_id="+description_arr[j].language_id+", cms_id="+cms_id+",h1_text='"+description_arr[j].h1_text+"',description='"+description_arr[j].description+"';";
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
                                                                 message:'Cms page updated successfully.'
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
                              message: "No cms page found."
                            });
                      }
                }
            });
                
            
                           
        });
      }    
    }
   
    // delete cms
    this.deleteCms = function(req,res){
        
      if(req.decoded.role != config.ROLE_ADMIN){
          
        res.status(config.HTTP_FORBIDDEN).send({
          status: config.ERROR, 
          code : config.HTTP_FORBIDDEN, 
          message: "You dont have permission to delete cms page!"
        });       
        
      }else{

            var id = req.body.id;
            var checksql ="SELECT cms.id FROM cms WHERE id = "+id;

            // Select cms based on Id
            dbModel.rawQuery(checksql, function (error, checkResult) {
              if (error) {
                    res.status(config.HTTP_SERVER_ERROR).send({
                      status:config.ERROR,
                      code: config.HTTP_SERVER_ERROR,
                      message:'Unable to process result!',
                      //error : error
                    });
              }
              else{

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
                      dbModel.beginTransaction(con, ' DELETE FROM cms WHERE id ='+id, function(error, result){
                        if(error){
                          res.status(config.HTTP_SERVER_ERROR).send({
                            status:config.ERROR,
                            code: config.HTTP_SERVER_ERROR,
                            message:'Unable to process result!',
                            //error: error
                          });                    
                        }else{

                          if(result.affectedRows > 0){
                            
                             var deleteSql =  "DELETE FROM cms_language WHERE cms_id ="+id+";";
                                                                  
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
                                      message:'Cms page deleted successfully.'
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
                    message: "No cms page found.",
                    //error: error
                  });
                }          
              }
            });


      } 

    }
    
    // Get selected single page 
    this.getSelectedCms = function(req, res) {
    
        if(req.decoded.role != config.ROLE_ADMIN){
            
            res.status(config.HTTP_FORBIDDEN).send({
              status: config.ERROR, 
              code : config.HTTP_FORBIDDEN, 
              message: "You dont have permission to get cms page!",
             // errors : err
            });       
            
        }else{
            
            var id=req.body.id;
                           
            var sql ="SELECT cms.* FROM cms ";                
                sql += " WHERE cms.id = "+id;
                
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
                                
                                var cms_language    = getAllCmsLanguage.sync(null, id);                    
                                     
                                   result[0].cms_language  = cms_language;   

                                   res.status(config.HTTP_SUCCESS).send({
                                        status: config.SUCCESS, 
                                        code : config.HTTP_SUCCESS, 
                                        message: " Cms page found",
                                        result : result
                                  });
                            
                             });

                       }else{
                               
                             res.status(config.HTTP_NOT_FOUND).send({
                                status:config.ERROR,
                                code: config.HTTP_NOT_FOUND, 
                                message:"No cms page found"
                             });                                  
                       }
                    }
                });
        }
    
  };
  
}


function getAllPages(filters, find_total = false, callback) {

    if(find_total == false){
        var sql = "SELECT cms.* ";
    }else{
        var sql = "SELECT COUNT(*) AS total_pages ";
    }

    sql += " FROM cms ";
    
    var sqlWhere = "";
    
    if(filters.search_page_name != undefined && filters.search_page_name != ''){
        sqlWhere += " WHERE cms.page_name LIKE '%"+filters.search_page_name+"%' ";               
    }

    if(filters.search_slug != undefined && filters.search_slug != ''){
        if(sqlWhere != ''){
            sqlWhere += " AND cms.slug LIKE '%"+filters.search_slug+"%' ";               
        }else{
            sqlWhere += " WHERE cms.slug LIKE '%"+filters.search_slug+"%' ";  
        }
    }
    
    if(filters.search_page_title != undefined && filters.search_page_title != ''){
         if(sqlWhere != ''){
             sqlWhere += " OR cms.page_title LIKE '%"+filters.search_page_title+"%' "; 
         }else{
             sqlWhere += " WHERE cms.page_title LIKE '%"+filters.page_title+"%' ";  
         }
                      
    }
    
    sql +=sqlWhere;
    
    if(find_total == false){
      
      if(filters.order_by != undefined && filters.order_by != ''){
             
             if(filters.order_by=='id-desc'){
                 sql += " ORDER BY cms.id DESC";
             
             }else{
                 sql += " ORDER BY `cms`.`id` ASC";
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


function getAllCmsLanguage(cms_id, callback){

  var sql = "SELECT cms_language.language_id,cms_language.h1_text,cms_language.description ";
      sql += " FROM `cms_language`";  
      sql += " LEFT JOIN `languages` ON languages.id = cms_language.language_id";
      sql += " WHERE cms_language.cms_id="+cms_id; 
 
    dbModel.rawQuery(sql, function(err, result) {
      if (err) return callback(err);
      else {
        callback(null, result);                    
      }
    });            
}

function checkExistPageNameAndSlug(checkData,id){

    var sql = "SELECT cms.* ";
        sql += " FROM cms WHERE ";
        
        
        if(id !='' && id != undefined){
            sql += " cms.id !="+id+" AND ";
        }
       
        sql += " (page_name ='"+checkData.page_name+"' OR slug ='"+checkData.slug+"' )";
        
        return sql;
        
}
module.exports = new CmsController();
var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var async = require('async');
var Sync = require('sync');
var config = require('./../../../config');
var connection = require('./../../../database');
var commonHelper = require('./../../helpers/common-helper');

var dbModel = require('./../../models/db-model');


function OccasionController() {
    
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
                var country_flag_arr = req.body.country_flag.split(',');
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
                    var selected_countries = req.body.country_flag.split(',');
                }
                //console.log(selected_countries);


                if(req.body.index_no_follow !='' && req.body.index_no_follow != undefined && req.body.index_no_follow == 1){
                  var index_no_follow = 1;
                }else{
                  var  index_no_follow =0;
                }


                if(req.body.description !='' && req.body.index_no_follow != undefined ){
                  var description = req.body.description;
                }else{
                  var  description= "";
                }

                if(req.body.description_fr !='' && req.body.description_fr != undefined ){
                    var description_fr = req.body.description_fr;
                }else{
                    var  description_fr= "";
                }


                if(req.body.description_de !='' && req.body.description_de != undefined ){
                    var description_de = req.body.description_de;
                }else{
                    var  description_de= "";
                }       

                if(req.body.description_es !='' && req.body.description_es != undefined ){
                    var  description_es = req.body.description_es;
                }else{
                    var  description_es= "";
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

                if(req.body.occasion_type !='' && req.body.occasion_type != undefined ){
                    var  occasion_type = req.body.occasion_type;
                }else{
                    var  occasion_type = "occasion";
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

                if(req.body.banner_id !='' && req.body.banner_id != undefined ){
                    var  banner_id = req.body.banner_id;
                }else{
                    var  banner_id = 0;
                }         

                var instertOccasionData = {
                      'country_flag':country_flag,
                      'occasion_name':req.body.occasion_name,
                      'occasion_day':req.body.occasion_day,
                      'occasion_month':req.body.occasion_month,
                      'index_no_follow':index_no_follow,
                      'description':description,
                      'description_fr':description_fr,  
                      'description_de':description_de,  
                      'description_es':description_es,  
                      'meta_title':meta_title, 
                      'meta_description':meta_description, 
                      'meta_keywords':meta_keywords, 
                      'occasion_type':occasion_type, 
                      'collection_filter':collection_filter,
                      'i_mark':i_mark,
                      'occasion_status':occasion_status,
                      'card_message':card_message,
                      'banner_id':banner_id,
                      'translation_id':req.body.translation_id,              
                      'created_at':commonHelper.formatDateToMysqlDateTime(curr_date,3),
                      'updated_at':commonHelper.formatDateToMysqlDateTime(curr_date,3),
                };

                  dbModel.save('occasions', instertOccasionData ,'', function(err, result){
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
                      if(result.insertId > 0){

                            var occasion_id = result.insertId;   

                             if(selected_countries.length > 0 ){
                                 for (i = 0; i < selected_countries.length; i++) {

                                     var insertOccasionCountryData= {
                                         country_id :selected_countries[i],
                                         occasion_id :occasion_id
                                     };

                                      dbModel.save('occasion_country', insertOccasionCountryData ,'', function(err, result){

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
                               message:'Occasion inserted successfully.'
                             });
                           
                      }else{

                          res.status(config.HTTP_SERVER_ERROR).send({
                            status: config.ERROR, 
                            code : config.HTTP_SERVER_ERROR, 
                            message : "Unable to process request!", 
                            errors : err
                          });

                      }
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
              message: "You dont have permission to update occasion!"
            });       
        }else{

            Sync(function(){
                
                var curr_date  = new Date();
                var id= req.body.id;
                var country_flag_arr = req.body.country_flag.split(',');
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
                    var selected_countries = req.body.country_flag.split(',');
                }

                var instertOccasionData = {
                      'country_flag':country_flag,
                      'occasion_name':req.body.occasion_name,
                      'occasion_day':req.body.occasion_day,
                      'occasion_month':req.body.occasion_month,
                      'translation_id':req.body.translation_id,                                                                 
                      'updated_at':commonHelper.formatDateToMysqlDateTime(curr_date,3),
                };


                if(req.body.index_no_follow !='' && req.body.index_no_follow != undefined ){
                  instertOccasionData.index_no_follow = 1;                  
                }else{
                    instertOccasionData.index_no_follow = 0;            
                }

                if(req.body.description !='' && req.body.description != undefined ){
                  instertOccasionData.description =req.body.description;
                }

                if(req.body.description_fr !='' && req.body.description_fr != undefined ){                    
                    instertOccasionData.description_fr =req.body.description_fr;
                }


                if(req.body.description_de !='' && req.body.description_de != undefined ){
                    instertOccasionData.description_de =req.body.description_de;
                }      

                if(req.body.description_es !='' && req.body.description_es != undefined ){
                    instertOccasionData.description_es =req.body.description_es;
                }      

                if(req.body.meta_title !='' && req.body.meta_title != undefined ){
                     instertOccasionData.meta_title = req.body.meta_title;                    
                }
                
                if(req.body.meta_description !='' && req.body.meta_description != undefined ){
                     instertOccasionData.meta_description = req.body.meta_description;
                }

                if(req.body.meta_keywords !='' && req.body.meta_keywords != undefined ){
                    instertOccasionData.meta_keywords = req.body.meta_keywords;
                }

                if(req.body.occasion_type !='' && req.body.occasion_type != undefined ){
                    instertOccasionData.occasion_type = req.body.occasion_type;
                }
                
                if(req.body.collection_filter !='' && req.body.collection_filter != undefined ){
                    instertOccasionData.collection_filter = req.body.collection_filter;
                }else{
                    instertOccasionData.collection_filter = 0;            
                }         

                if(req.body.i_mark !='' && req.body.i_mark != undefined ){
                    instertOccasionData.i_mark =  req.body.i_mark;
                }else{
                    instertOccasionData.i_mark = 0;            
                }    

                if(req.body.occasion_status !='' && req.body.occasion_status != undefined ){
                    instertOccasionData.occasion_status = req.body.occasion_status;
                }else{
                    instertOccasionData.occasion_status = 0;            
                }  

                if(req.body.card_message !='' && req.body.card_message != undefined ){
                    instertOccasionData.card_message = req.body.card_message;
                }else{
                    instertOccasionData.card_message = 0;            
                }    

                if(req.body.banner_id !='' && req.body.banner_id != undefined ){
                    instertOccasionData.banner_id = req.body.banner_id;
                }
                
                
                var checkSql ="SELECT * FROM occasions WHERE id = "+id;

                dbModel.rawQuery(checkSql, function(err, checkResult){

                       if (err) {
                          res.status(config.HTTP_SERVER_ERROR).send({
                            status: config.ERROR, 
                            code : config.HTTP_SERVER_ERROR, 
                            message : "Unable to process request!", 
                            errors : err
                          });
                       }else{

                           if(checkResult.length >0 ){
                                 dbModel.save('occasions', instertOccasionData ,id, function(err, result){

                                      if (err) {
                                          res.status(config.HTTP_SERVER_ERROR).send({
                                            status:config.ERROR,
                                            code: config.HTTP_SERVER_ERROR,
                                            message:'Unable to update occasion'
                                          });

                                      } else {                  

                                          var occasion_id = id;

                                          // delete existing all and instert new all
                                          var deleteSql="DELETE from occasion_country WHERE occasion_id = "+occasion_id;
                                          dbModel.rawQuery(deleteSql, function(err, deleteResult){
                                              
                                                if(deleteResult.affectedRows > 0){
                                                    for (i = 0; i < selected_countries.length; i++) {

                                                        var occasionCountryData= {
                                                            country_id :selected_countries[i],
                                                            occasion_id :occasion_id
                                                        };

                                                        dbModel.save('occasion_country', occasionCountryData ,'', function(err, result){

                                                            if (err) {
                                                               res.status(config.HTTP_SERVER_ERROR).send({
                                                                 status:config.ERROR,
                                                                 code: config.HTTP_SERVER_ERROR,
                                                                 message:'Unable to update occasion'
                                                               });
                                                            }

                                                        });
                                                 }
                                                 
                                                res.status(config.HTTP_SUCCESS).send({
                                                    status:config.SUCCESS,
                                                    code: config.HTTP_SUCCESS,
                                                    message:'Occasion updated successfully.'
                                                 });
                                                 
                                                 
                                             }else{
                                                 
                                                  res.status(config.HTTP_BAD_REQUEST).send({
                                                    status:config.ERROR,
                                                    code: config.HTTP_BAD_REQUEST, 
                                                    message:'Unable to update occasion'
                                                }); 

                                             } 
                                              
                                          }); 
                                            
                                  }

                              });                     

                           }else{
                               
                                res.status(config.HTTP_BAD_REQUEST).send({
                                    status:config.ERROR,
                                    code: config.HTTP_BAD_REQUEST, 
                                    message:"No occasion found."
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
                      message:'Unable to process result!'
                    });
              }else{

                if(occasionsResult.length > 0 && occasionsResult[0].id > 0){

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
                      dbModel.beginTransaction(con, ' DELETE FROM occasions WHERE id ='+id, function(error, result){
                        if(error){
                          res.status(config.HTTP_SERVER_ERROR).send({
                            status:config.ERROR,
                            code: config.HTTP_SERVER_ERROR,
                            message:'Unable to delete occasion.',
                            error: error
                          });                    
                        }else{

                          if(result.affectedRows > 0){
                            
                            var sql = "DELETE FROM occasion_country WHERE occasion_id ="+id+";";                            

                            dbModel.transactionQuery(con, sql, function (error, result) {
                              if (error) {
                                res.status(config.HTTP_SERVER_ERROR).send({
                                  status:config.ERROR,
                                  code: config.HTTP_SERVER_ERROR,
                                  message:'Unable to delete occasion.',
                                  error: error
                                });
                              }else{

                                dbModel.commit(con, function(err, response){
                                  if (error) {
                                    res.status(config.HTTP_SERVER_ERROR).send({
                                      status:config.ERROR,
                                      code: config.HTTP_SERVER_ERROR,
                                      message:'Unable to delete occasion.',
                                      error: error
                                    });
                                  }else{
                                    res.status(config.HTTP_SUCCESS).send({
                                      status:config.SUCCESS,
                                      code: config.HTTP_SUCCESS,
                                      message:'Occasion  deleted successfully.'
                                    });                                    
                                  }                                  

                                });

                              }    
                            });

                          }else{
                            res.status(config.HTTP_NOT_FOUND).send({
                              status:config.ERROR,
                              code: config.HTTP_NOT_FOUND,
                              message:'Occasion not found.'
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
                      message:"Occasion not found"
                  });
                }          
              }
            });


      } // else close    

    }
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

module.exports = new OccasionController();
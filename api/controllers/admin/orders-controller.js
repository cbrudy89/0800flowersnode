var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var async = require('async');
var Sync = require('sync');
var config = require('./../../../config');
var connection = require('./../../../database');
var commonHelper = require('./../../helpers/common-helper');

var dbModel = require('./../../models/db-model');

function OrdersController() {
    
    
    // get all orders
    this.getOrdersList = function(req,res){

      if(req.decoded.role != config.ROLE_ADMIN){
        res.status(config.HTTP_FORBIDDEN).send({
          status: config.ERROR, 
          code : config.HTTP_FORBIDDEN, 
          message: "You dont have permission to get orders!"
        });       
      }else{

            var return_data = {};
            var reqData = {};

            var page = req.body.page;
            var limit = req.body.limit;
            var order_by = req.body.order_by;
            
            var search_day = req.body.search_day;
            var search_status = req.body.search_status;
            var search_start_date = req.body.search_start_date;
            var search_end_date = req.body.search_end_date;
            var search_first_name = req.body.search_first_name;
            var search_last_name = req.body.search_last_name;
            var search_order_id = req.body.search_order_id;
            var search_delivery_date = req.body.search_delivery_date;
            var search_email = req.body.search_email;
            var search_contact = req.body.search_contact;
            
            if(search_day == undefined || search_day == ''){
               search_day = '';
            }
            
            if(search_status == undefined || search_status == ''){
              search_status = '';
            }
            
            if(search_start_date == undefined || search_start_date == ''){
              search_start_date = '';
            }            
            
            if(search_end_date == undefined || search_end_date == ''){
              search_end_date = '';
            } 
            
            if(search_first_name == undefined || search_first_name == ''){
              search_first_name = '';
            } 
            
            if(search_last_name == undefined || search_last_name == ''){
              search_last_name = '';
            }             
            
            if(search_order_id == undefined || search_order_id == ''){
              search_order_id = '';
            } 
            
            if(search_delivery_date == undefined || search_delivery_date == ''){
              search_delivery_date = '';
            } 
            
            if(search_email == undefined || search_email == ''){
              search_email = '';
            } 
            
            if(search_contact == undefined || search_contact == ''){
              search_contact = '';
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
                "search_day":search_day,
                "search_status":search_status,
                "search_start_date":search_start_date,
                "search_end_date":search_end_date,
                "search_first_name":search_first_name,
                "search_last_name":search_last_name,
                "search_order_id":search_order_id,
                "search_delivery_date":search_delivery_date,
                "search_email":search_email,
                "search_contact":search_contact,
            };

            var result        = getAllOrders.sync(null, reqData, false); 
            var total_records = getAllOrders.sync(null, reqData, true); 
            
            if(result.length > 0){
                for ( var j= 0; j < result.length; j++) { 
                    var order_status  = getOrderStatus.sync(null, result[j].order_id);                    
                    var order_products  = getOrderProducts.sync(null, result[j].order_id);                    
                        result[j].order_status   = order_status; 
                        result[j].order_products = order_products; 
                }

                var final_data  = {
                    "search_day":search_day,
                    "search_status":search_status,
                    "search_start_date":search_start_date,
                    "search_end_date":search_end_date,
                    "search_first_name":search_first_name,
                    "search_last_name":search_last_name,
                    "search_order_id":search_order_id,
                    "search_delivery_date":search_delivery_date,
                    "search_email":search_email,
                    "search_contact":search_contact,
                    "page": page,
                    "limit":limit,
                    "total_records":total_records[0].total_count,
                    "order_list": result,
                };

                res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: result.length+" order found",
                    result : final_data
                });

            }else{
               
                res.status(config.HTTP_NOT_FOUND).send({
                 status:config.ERROR,
                 code: config.HTTP_NOT_FOUND, 
                 message:"No order found."
               });         
                
            }
          });
      } 

    }

    // get only atlas orders
    this.getAtlasOrdersList = function(req,res){

      if(req.decoded.role != config.ROLE_ADMIN){
        res.status(config.HTTP_FORBIDDEN).send({
          status: config.ERROR, 
          code : config.HTTP_FORBIDDEN, 
          message: "You dont have permission to get orders!"
        });       
      }else{

            var return_data = {};
            var reqData = {};

            var page = req.body.page;
            var limit = req.body.limit;
            var order_by = req.body.order_by;
            
            var search_day = req.body.search_day;
            var search_status = req.body.search_status;
            var search_start_date = req.body.search_start_date;
            var search_end_date = req.body.search_end_date;
            var search_first_name = req.body.search_first_name;
            var search_last_name = req.body.search_last_name;
            var search_order_id = req.body.search_order_id;
            var search_delivery_date = req.body.search_delivery_date;
            var search_email = req.body.search_email;
            var search_contact = req.body.search_contact;
            
            if(search_day == undefined || search_day == ''){
               search_day = '';
            }
            
            if(search_status == undefined || search_status == ''){
              search_status = '';
            }
            
            if(search_start_date == undefined || search_start_date == ''){
              search_start_date = '';
            }            
            
            if(search_end_date == undefined || search_end_date == ''){
              search_end_date = '';
            } 
            
            if(search_first_name == undefined || search_first_name == ''){
              search_first_name = '';
            } 
            
            if(search_last_name == undefined || search_last_name == ''){
              search_last_name = '';
            }             
            
            if(search_order_id == undefined || search_order_id == ''){
              search_order_id = '';
            } 
            
            if(search_delivery_date == undefined || search_delivery_date == ''){
              search_delivery_date = '';
            } 
            
            if(search_email == undefined || search_email == ''){
              search_email = '';
            } 
            
            if(search_contact == undefined || search_contact == ''){
              search_contact = '';
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
                "search_day":search_day,
                "search_status":search_status,
                "search_start_date":search_start_date,
                "search_end_date":search_end_date,
                "search_first_name":search_first_name,
                "search_last_name":search_last_name,
                "search_order_id":search_order_id,
                "search_delivery_date":search_delivery_date,
                "search_email":search_email,
                "search_contact":search_contact,
            };

            var result        = getAllAtlasOrders.sync(null, reqData, false); 
            var total_records = getAllAtlasOrders.sync(null, reqData, true); 
            
            if(result.length > 0){
                for ( var j= 0; j < result.length; j++) { 
                    var order_status    = getOrderStatus.sync(null, result[j].order_id);                    
                    var order_products  = getOrderProducts.sync(null, result[j].order_id);                          
                        result[j].order_status   = order_status;
                        result[j].order_products = order_products; 
                }

                var final_data  = {
                    "search_day":search_day,
                    "search_status":search_status,
                    "search_start_date":search_start_date,
                    "search_end_date":search_end_date,
                    "search_first_name":search_first_name,
                    "search_last_name":search_last_name,
                    "search_order_id":search_order_id,
                    "search_delivery_date":search_delivery_date,
                    "search_email":search_email,
                    "search_contact":search_contact,
                    "page": page,
                    "limit":limit,
                    "total_records":total_records[0].total_count,
                    "order_list": result,
                };

                res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: result.length+" order found.",
                    result : final_data
                });

            }else{
               
                res.status(config.HTTP_NOT_FOUND).send({
                 status:config.ERROR,
                 code: config.HTTP_NOT_FOUND, 
                 message:"No order found."
               });         
                
            }
          });
      } 

    }

}

// get all orders
function getAllOrders(filters, find_total = false, callback) {
    
    var curr_date    = new Date();
    var current_date = commonHelper.formatDateToMysqlDateTime(curr_date,5); //YYYY-MM-DD
    
    var sql ="";
    var sqlWhere ="";
    var sqlInnerJoin ="";  
    var sqlAnd ="";
    
    if(find_total == false){
         sql = "SELECT *, orders.id as order_id ";
    }else{
         sql = "SELECT COUNT(*) AS total_count ";
    }

    sql += " FROM orders ";
    
    sqlWhere += " WHERE orders.created_at <= '"+current_date+"'";
    
    if(filters.search_delivery_date != undefined && filters.search_delivery_date != ''){        
        var delivery_date = commonHelper.formatDateToMysqlDateTime(filters.search_delivery_date,4);        
        sqlInnerJoin  += " INNER JOIN order_products ON order_products.order_id = orders.id ";
        sqlAnd  += " AND  order_products.delivery_date ='"+delivery_date+"'";
    }
    
    if(filters.search_status != undefined && filters.search_status != ''){
        sqlInnerJoin  += " INNER JOIN order_status ON order_status.order_id = orders.id ";
        sqlAnd  += " AND  order_status.current_status ='"+filters.search_status+"'";
    }      
    
    
    if(filters.search_order_id != undefined && filters.search_order_id != ''){
        sqlAnd  += " AND orders.invoice_id = '"+filters.search_order_id+"'";
    }
    
    if(filters.search_first_name != undefined && filters.search_first_name != ''){
        sqlAnd  += " AND orders.first_name = '"+filters.search_first_name+"'";
    }    

    if(filters.search_last_name != undefined && filters.search_last_name != ''){
        sqlAnd  += " AND orders.last_name = '"+filters.search_last_name+"'";
    }
    
    if(filters.search_email != undefined && filters.search_email != ''){
        sqlAnd  += " AND orders.email = '"+filters.search_email+"'";
    }  
    
    if(filters.search_contact != undefined && filters.search_contact != ''){
        sqlAnd  += " AND orders.phone_line = '"+filters.search_contact+"'";
    }     
    
    
    if(filters.search_day != undefined && filters.search_day != ''){         
        if(filters.search_day == 'today'){             
            sqlAnd  += " AND date(orders.created_at) ='"+current_date+"'";

        }else if(filters.search_day == 'yesterday'){
            var get_yesterday_date = commonHelper.getYesterdaysDate();
            get_yesterday_date = commonHelper.formatDateToMysqlDateTime(get_yesterday_date,3);            
            sqlAnd  += " AND date(orders.created_at) ='"+get_yesterday_date+"'";
        }
        
        /*else if($parms['inputDay'] == 'month'){ 
            
           // $preorders->whereBetween('orders.created_at',[Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()]); 
        } */
    } 
      
    if(filters.search_start_date != undefined && filters.search_start_date != ''  && filters.search_end_date != undefined && filters.search_end_date != ''){        
        var start_date = commonHelper.formatDateToMysqlDateTime(filters.search_start_date,4);
        var end_date   = commonHelper.formatDateToMysqlDateTime(filters.search_end_date,4);        
        sqlAnd  += " AND ( orders.order_date BETWEEN '"+start_date+"' AND '"+end_date+"' ) "; //yyyy-mm-dd        
    } 
    
    sql = sql + sqlInnerJoin +  sqlWhere + sqlAnd ;
    
    if(find_total == false){      
       if(filters.order_by != undefined && filters.order_by != ''){             
            if(filters.order_by=='created_at-desc'){
                sql += " ORDER BY orders.created_at DESC";             
            }else{
                sql += " ORDER BY orders.created_at ASC";
            }
       }

      sql += " LIMIT "+filters.start+","+filters.limit;
    }
    
    //console.log(sql);
    //process.exit();
    
    dbModel.rawQuery(sql, function(err, result) {
      if (err) return callback(err);
      else {
        callback(null, result)
      }

    });

}

// get only atlas orders  
function getAllAtlasOrders(filters, find_total = false, callback) {
    
    var curr_date    = new Date();
    var current_date = commonHelper.formatDateToMysqlDateTime(curr_date,5); //YYYY-MM-DD
    
    var sql ="";
    var sqlWhere ="";
    var sqlInnerJoin ="";  
    var sqlAnd ="";
    
    if(find_total == false){
         sql = "SELECT *, orders.id as order_id ";
    }else{
         sql = "SELECT COUNT(*) AS total_count ";
    }

    sql += " FROM orders ";
    
    sqlWhere += " WHERE orders.created_at <= '"+current_date+"' ";
    sqlWhere += " AND orders.is_atlas_order = '1' ";
    
    if(filters.search_delivery_date != undefined && filters.search_delivery_date != ''){        
        var delivery_date = commonHelper.formatDateToMysqlDateTime(filters.search_delivery_date,4);        
        sqlInnerJoin  += " INNER JOIN order_products ON order_products.order_id = orders.id ";
        sqlAnd  += " AND  order_products.delivery_date ='"+delivery_date+"'";
    }
    
    if(filters.search_status != undefined && filters.search_status != ''){
        sqlInnerJoin  += " INNER JOIN order_status ON order_status.order_id = orders.id ";
        sqlAnd  += " AND  order_status.current_status ='"+filters.search_status+"'";
    }      
    
    
    if(filters.search_order_id != undefined && filters.search_order_id != ''){
        sqlAnd  += " AND orders.invoice_id = '"+filters.search_order_id+"'";
    }
    
    if(filters.search_first_name != undefined && filters.search_first_name != ''){
        sqlAnd  += " AND orders.first_name = '"+filters.search_first_name+"'";
    }    

    if(filters.search_last_name != undefined && filters.search_last_name != ''){
        sqlAnd  += " AND orders.last_name = '"+filters.search_last_name+"'";
    }
    
    if(filters.search_email != undefined && filters.search_email != ''){
        sqlAnd  += " AND orders.email = '"+filters.search_email+"'";
    }  
    
    if(filters.search_contact != undefined && filters.search_contact != ''){
        sqlAnd  += " AND orders.phone_line = '"+filters.search_contact+"'";
    }     
    
    
    if(filters.search_day != undefined && filters.search_day != ''){         
        if(filters.search_day == 'today'){             
            sqlAnd  += " AND date(orders.created_at) ='"+current_date+"'";

        }else if(filters.search_day == 'yesterday'){
            var get_yesterday_date = commonHelper.getYesterdaysDate();
                get_yesterday_date = commonHelper.formatDateToMysqlDateTime(get_yesterday_date,3);            
                sqlAnd += " AND date(orders.created_at) ='"+get_yesterday_date+"'";
        }
        
        /*else if($parms['inputDay'] == 'month'){ 
            
           // $preorders->whereBetween('orders.created_at',[Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()]); 
        } */
    } 
      
    if(filters.search_start_date != undefined && filters.search_start_date != ''  && filters.search_end_date != undefined && filters.search_end_date != ''){        
        var start_date = commonHelper.formatDateToMysqlDateTime(filters.search_start_date,4);
        var end_date   = commonHelper.formatDateToMysqlDateTime(filters.search_end_date,4);        
            sqlAnd    += " AND ( orders.order_date BETWEEN '"+start_date+"' AND '"+end_date+"' ) "; //yyyy-mm-dd        
    } 
    
    sql = sql + sqlInnerJoin +  sqlWhere + sqlAnd ;
    
    if(find_total == false){      
       if(filters.order_by != undefined && filters.order_by != ''){             
            if(filters.order_by=='created_at-desc'){
                sql += " ORDER BY orders.created_at DESC";             
            }else{
                sql += " ORDER BY orders.created_at ASC";
            }
       }

      sql += " LIMIT "+filters.start+","+filters.limit;
    }
    
    //console.log(sql);
    //process.exit();
    
    dbModel.rawQuery(sql, function(err, result) {
      if (err) return callback(err);
      else {
        callback(null, result)
      }

    });

}

function getOrderStatus(order_id, callback){

  var sql  = " SELECT order_status.* ";
      sql += " FROM `order_status`";       
      sql += " WHERE order_status.order_id="+order_id; 
 
    dbModel.rawQuery(sql, function(err, result) {
      if (err) return callback(err);
      else {
        callback(null, result);                    
      }
    });            
}

function getOrderProducts(order_id, callback){

  var sql  = " SELECT order_products.* ";
      sql += " FROM order_products";       
      sql += " WHERE order_products.order_id="+order_id; 
 
    dbModel.rawQuery(sql, function(err, result) {
      if (err) return callback(err);
      else {
        callback(null, result);                    
      }
    });            
}

module.exports = new OrdersController();
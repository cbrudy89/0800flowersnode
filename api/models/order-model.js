var config = require('./../../config');
var connection = require('./../../database');
var dbModel = require('./../models/db-model');
var commonHelper = require('./../helpers/common-helper');
var tableName = "orders";

function OrderModel(){
	
	// Check Order Id is exist in system or not.
	this.checkOrderIdExist = function(order_number, callback) {
		//dbModel.find(tableName, 'id', 'atlas_order_number='+order_number,'','',function(err, result){
		var sql = "SELECT id FROM "+tableName+" WHERE atlas_order_number = '"+order_number+"'";
		dbModel.rawQuery(sql,function(err, result){
			if(err) callback(err);
			else{
				callback(null, result);
			}
		});	
	}


	// Get Atalas order Status
	this.getOrderStatus = function(order_number, callback){

		var url  = config.atlas_order.get_order_status_url;

		var data = {
			"orderStatusRequest":{
				"orderDetailRequest":{
					"brandID":"ATLAS",
					"orderType":"",
					"orderNumber": order_number,
					"trackingNumber":"",
					"productType":"",
					"emailId":"",
					"sourceSystem":"MBP"
				}
			}
		};	

		commonHelper.executeCommonCurl(url, data, function(err, result){
			if(err){
			 	return callback(err);
			}
			else{
				return callback(null, result);
			}
		});


	}

	// Get Customers on condintion basis.
	this.query = function(table = '', condintion = '', orderBy = '', limit = '' , callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {

				var sql = "SELECT * FROM "+table;
			
				if(condintion != ''){
					
					var len = condintion.length;
					var i = 1;

					//if(condintion.length > 1){
					if(typeof condintion === 'object' && condintion instanceof Array){

						sql += " WHERE ";
						condintion.forEach(function(item, index){

							for( var key in item ) {
								sql += key + item[key].cond + "'"+item[key].val+"'";

								if(i < len){
									sql += " AND ";
									i++;
								}
							}

						});

					}else{
						sql += 'WHERE '+condintion;
					}
				}

				if(orderBy != ''){
					sql += 'ORDER BY '+orderBy;
				}

				if(limit != ''){
					sql += 'LIMIT '+limit;
				}

				//console.log(sql);
				//callback(null,sql);

				con.query(sql, function (err, result) {
		          	if (err) {
		          		callback(err);
		          	}else{
		          		callback(null, result);
		          	}
		          	con.release();
		      	});
			}
		});		
	}	

	// Insert new record for customer in database
	this.create = function(data, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {					
				con.query('INSERT INTO customers SET ?', data, function (err, results) {
		          	if (err) {
		          		callback(err);
		          	}else{
		          		callback(null, results);
		          	}
		          	con.release();
		      	});
			}
		});
	}

	this.update = function(data, id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {					
				con.query('UPDATE customers SET ? WHERE id = ?', [data, id], function (err, results) {
		          	if (err) {
		          		callback(err);
		          	}else{
		          		callback(null, results);
		          	}
		          	con.release();
		      	});
			}
		});
	}
	this.fetchUserOrders = function(data, id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {		
				//console.log("dfdf");return false;			
				con.query('Select * FROM orders WHERE user_id = ?', [user_id], function (err, results) {
		          	if (err) {
		          		callback(err);
		          	}else{
		          		callback(null, results);
		          	}
		          	con.release();
		      	});
			}
		});
	}	
}

module.exports = new OrderModel();

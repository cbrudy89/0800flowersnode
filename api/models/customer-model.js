var config = require('./../../config');
var connection = require('./../../database');

function CustomerModel(){
	
	// Validate Customer email is already exist or not.
	this.isEmailExist = function(email, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {					
				con.query('SELECT id FROM customers WHERE email = ?', email, function (err, result) {
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

/*	this.update = function(data, callback) {
		callback(err)
	}

	this.delete = function(data, callback) {
		callback(err)
	}	

	this.get = function(data, callback) {
		callback(err)
	}	

	this.getAll = function(data, callback) {
		callback(err)
	}	*/		
}

module.exports = new CustomerModel();

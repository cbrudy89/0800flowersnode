var config = require('./../../config');
var connection = require('./../../database');

function DbModel(){
	
	// Get records on the basis of condintion.
	this.find = function(table = '', field = '', condintion = '', orderBy = '', limit = '' , callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {

				if(table == ''){
					callback('Unable to process query, table name missing!');
				}else{

					var sql = "SELECT ";

					if(field == ''){
						sql += " * FROM "+table;
					}else{
						sql += field+ " FROM "+table;
					}

				
					if(condintion != ''){
						
						var len = condintion.length;
						var i = 1;

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
							sql += " WHERE "+condintion;
						}
					}

					if(orderBy != ''){
						sql += "ORDER BY "+orderBy;
					}

					if(limit != ''){
						sql += "LIMIT "+limit;
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

			}
		});		
	}

	this.rawQuery = function(sql = '', callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {					

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


	// Insert/Update record in table
	this.save = function(table, data, id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {		

				if(table == ''){
					callback('Unable to process query, table name missing!');
				}else{

					// New record insert into table
					if(id == ''){

						con.query('INSERT INTO '+table+' SET ?', data, function (err, results) {
				          	if (err) {
				          		callback(err);
				          	}else{
				          		callback(null, results);
				          	}
				          	con.release();
				      	});

					}else{
						// Existing Record updted table.
						con.query('UPDATE '+table+' SET ? WHERE id = ?', [data, id], function (err, results) {
				          	if (err) {
				          		callback(err);
				          	}else{
				          		callback(null, results);
				          	}
				          	con.release();
				      	});						
					}

				}

			}
		});
	}

	// Delete record in table
	this.delete = function(table, condintion = '', callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {

				if(table == ''){
					callback('Unable to process query, table name missing!');
				}else{

					var sql = "DELETE FROM "+table;
				
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

					con.query(sql, function (err, result) {
			          	if (err) {
			          		callback(err);
			          	}else{
			          		callback(null, result);
			          	}
			          	con.release();
			      	});
				}

			}
		});
	}



}

module.exports = new DbModel();

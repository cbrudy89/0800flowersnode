var config = require('./../../../config');
var connection = require('./../../../database');

function colorModel(){	
	this.getcolors = function(color_name, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
			    var queryString = "SELECT * FROM colors";
			    if(color_name != "" && color_name != undefined){
			        queryString += " WHERE `color_name` like '%"+color_name+"%'";
			    }
				con.query(queryString, function (err, results) {
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

	this.checkcolor = function(data,id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				// Checking if user email already exist in database
            	con.query('SELECT id FROM colors WHERE color_name = ? AND id <> ?', [data.name,id], function(err, result){            	
	              if (err) {
	                callback(err);
	              }else{
	              	callback(null,result);
	              }
	              con.release();
	            });
			    
			}
		});
	}
	this.createcolor = function(data, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				// Checking if user email already exist in database
	        		con.query('INSERT INTO colors SET ?', data, function (err, results) {
			          	if (err) {
			          		callback(err);
			          	}else{
			          		callback(null, results);
			          	}			          	
			      	});
	//////////////////////////////////////////////////////
			    
			}
		});
	}


	this.updatecolor = function(data,id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				// Checking if user email already exist in database
	        		con.query("Update `colors` set `color_name` = '"+data.color_name+"', `status` = '"+data.status+"', `updated_at` = '"+data.updated_at+"' where id='"+id+"'", function (err, results) {
			          	if (err) {
			          		callback(err);
			          	}else{
			          		callback(null, results);
			          	}			          	
			      	});
	//////////////////////////////////////////////////////
			    
			}
		});
	}

	this.checkdeletecolor = function(id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				// Checking if user email already exist in database
            	con.query('SELECT id FROM colors WHERE id = ?', [id], function(err, result){            	
	              if (err) {
	                callback(err);
	              }else{
	              	callback(null,result);
	              }
	              con.release();
	            });
			    
			}
		});
	}

	this.deletecolor = function(id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				// Checking if user email already exist in database
	        		con.query("Delete from `colors` where id=?",[id], function (err, results) {
			          	if (err) {
			          		callback(err);
			          	}else{
			          		callback(null, results);
			          	}			          	
			      	});
	//////////////////////////////////////////////////////
			    
			}
		});
	}	
}

module.exports = new colorModel();

var config = require('./../../../config');
var connection = require('./../../../database');

function timezoneModel(){	
	this.gettimezones = function(timezone,tz_title, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				var string=string1='';
			    var queryString = "SELECT * FROM timezones";
			    if(timezone != "" && timezone != undefined){
			        string += " `timezone` like '%"+timezone+"%'";
			    }
			    if(tz_title != "" && tz_title != undefined){
			        string1 += " `tz_title` like '%"+tz_title+"%'";
			    }
			    if(string != "" || string1 != ""){
			        queryString += " WHERE ";
			    }
			    queryString += string;
			    if(string != "" && string1 != ""){
			        queryString += " AND ";
			    }
			    queryString += string1;
			    console.log(queryString);
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

	this.checktimezone = function(data,id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				// Checking if user email already exist in database
            	con.query('SELECT id FROM timezones WHERE timezone = ? AND id <> ?', [data.timezone,id], function(err, result){            	
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

	this.updatetimezone = function(data,id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				// Checking if user email already exist in database
	        		con.query("Update `timezones` set `timezone` = '"+data.timezone+"', `tz_title` = '"+data.tz_title+"', `offset` = '"+data.offset+"', `stoppage_hour` = '"+data.stoppage_hour+"', `stoppage_minute` = '"+data.stoppage_minute+"', `updated_at` = '"+data.updated_at+"' where id='"+id+"'", function (err, results) {
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

	this.checkdeletetimezone = function(id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				// Checking if user email already exist in database
            	con.query('SELECT id FROM timezones WHERE id = ?', [id], function(err, result){            	
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

	this.deletetimezone = function(id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				// Checking if user email already exist in database
	        		con.query("Delete from `timezones` where id=?",[id], function (err, results) {
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

module.exports = new timezoneModel();

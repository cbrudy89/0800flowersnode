var config = require('./../../../config');
var connection = require('./../../../database');

function RestrictCalendarDateModel(){	
	this.getRestrictCalendarDates = function(callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
                                var queryString = "SELECT * FROM restrict_calendar_dates";
			    
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

	
	this.createRestrictCalendarDate = function(data, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				// Checking if user email already exist in database
	        		con.query('INSERT INTO restrict_calendar_dates SET ?', data, function (err, results) {
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


	this.updateSelectedRestrictCalendarDate = function(data,id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				// Checking if user email already exist in database
	        		con.query("Update `restrict_calendar_dates` set `vendor_id` = '"+data.vendor_id+"', `country_id` = '"+data.country_id+"', `title` = '"+data.title+"', `description` = '"+data.description+"', `status` = '"+data.status+"', `start_date` = '"+data.start_date+"' , `end_date` = '"+data.end_date+"' , `updated_at` = '"+data.updated_at+"' where id='"+id+"'", function (err, results) {
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

	this.checkRestrictCalendarDate = function(id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {
				// Checking if restrct calendar date exist in db
                            con.query('SELECT id FROM restrict_calendar_dates WHERE id = ?', [id], function(err, result){            	
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

	this.deleteRestrictCalendarDate = function(id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				// Checking if user email already exist in database
	        		con.query("Delete from `restrict_calendar_dates` where id=?",[id], function (err, results) {
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

module.exports = new RestrictCalendarDateModel();

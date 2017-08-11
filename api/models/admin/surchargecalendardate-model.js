var config = require('./../../../config');
var connection = require('./../../../database');

function SurchargeCalendarDateModel(){	
	this.getSurchargeCalendarDates = function(callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
                                var queryString = "SELECT * FROM surcharge_calendars";
			    
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

	
	this.createSurchargeCalendarDate = function(data, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				// Checking if user email already exist in database
	        		con.query('INSERT INTO surcharge_calendars SET ?', data, function (err, results) {
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


	this.updateSelectedSurchargeCalendarDate = function(data,id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				
	        		con.query("Update `surcharge_calendars` set `vendor_id` = '"+data.vendor_id+"', `country_id` = '"+data.country_id+"', `title` = '"+data.title+"', `description` = '"+data.description+"', `status` = '"+data.status+"', `start_date` = '"+data.start_date+"' , `end_date` = '"+data.end_date+"' , `surcharge` = '"+data.surcharge+"' , `updated_at` = '"+data.updated_at+"' where id='"+id+"'", function (err, results) {
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

	this.checkSurchargeCalendarDate = function(id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {
				// Checking if surcharge_calendars calendar date exist in db
                            con.query('SELECT id FROM surcharge_calendars WHERE id = ?', [id], function(err, result){            	
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

	this.deleteSurchargeCalendarDate = function(id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				// Checking if user email already exist in database
	        		con.query("Delete from `surcharge_calendars` where id=?",[id], function (err, results) {
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

module.exports = new SurchargeCalendarDateModel();

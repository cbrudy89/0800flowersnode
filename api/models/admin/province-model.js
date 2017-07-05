var config = require('./../../../config');
var connection = require('./../../../database');

function ProvinceModel(){	
	this.getprovince = function(province_name, short_code, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				var string=string1='';
				var queryString = "select provinces.id, provinces.province_name, provinces.short_code, provinces.location_tax,provinces.status,country_list.country_name, timezones.timezone, timezones.tz_title, timezones.stoppage_hour,timezones.stoppage_minute, provinces.shipping_charge, provinces.delivery_charge from `provinces` inner join `country_list` on `country_list`.`id` = `provinces`.`country_id` left join `timezones` on `timezones`.`id` = `provinces`.`timezone_id`";

				if(province_name != "" && province_name != undefined){
			        string += "provinces.province_name LIKE '%"+province_name+"%'";
			    }
			    if(short_code != "" && short_code != undefined){
			        string1 += "provinces.short_code LIKE '%"+short_code+"%'";
			    }
			    if(string != "" || string1 != ""){
			        queryString += " WHERE ";
			    }
			    queryString += string;
			    if(string != "" && string1 != ""){
			        queryString += " AND ";
			    }
			    queryString += string1;
				/*if(province_name != "" && province_name != undefined){
			        queryString += "WHERE provinces.province_name LIKE '%"+province_name+"%'";
			    }*/
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

	this.checkprovince = function(data, id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				// Checking if province already exist in database
				con.query('SELECT id FROM provinces WHERE province_name = ? AND id <> ?', [data.province_name,id], function(err, result){	
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

	this.createprovince = function(data, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
					con.query('INSERT INTO provinces SET ?', data, function (err, results) {
			          	if (err) {
			          		callback(err);
			          	}else{
			          		callback(null, results);
			          	}			          	
			      	});
			}
		});
	}

	this.viewprovince = function(id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				var viewquery = "select id, province_name, short_code, location_tax, status,country_id, timezone_id from `provinces` where id="+id;
					con.query(viewquery, function (err, results) {
						if (err) {
			          		callback(err);
			          	}else{
			          		callback(null, results);
			          	}			          	
			      	});
				}
		});
	}

	this.updateprovince = function(data,id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
	        		con.query("Update `provinces` set `country_id` = '"+data.country_id+"', `timezone_id` = '"+data.timezone_id+"', `province_name` = '"+data.province_name+"', `short_code` = '"+data.short_code+"', `location_tax` = '"+data.location_tax+"', `status` = '"+data.status+"', `updated_at` = '"+data.updated_at+"' where id='"+id+"'", function (err, results) {
			          	if (err) {
			          		callback(err);
			          	}else{
			          		callback(null, results);
			          	}			          	
			      	});
			}
		});
	}

	this.checkdeleteprovince = function(id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				// Checking if user email already exist in database
            	con.query('SELECT id FROM provinces WHERE id = ?', [id], function(err, result){            	
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

	this.deleteprovince = function(id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				// Checking if user email already exist in database
	        		con.query("Delete from `provinces` where id=?",[id], function (err, results) {
			          	if (err) {
			          		callback(err);
			          	}else{
			          		callback(null, results);
			          	}			          	
			      	});
			    
			}
		});
	}
}

module.exports = new ProvinceModel();

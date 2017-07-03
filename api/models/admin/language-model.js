var config = require('./../../../config');
var connection = require('./../../../database');

function LanguageModel(){	
	this.getlanguages = function(name, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
			    var queryString = "SELECT * FROM languages";
			    if(name != "" && name != undefined){
			        queryString += " WHERE `name` like '%"+name+"%'";
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

	this.checklanguage = function(data,id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				// Checking if user email already exist in database
            	con.query('SELECT id FROM languages WHERE name = ? AND id <> ?', [data.name,id], function(err, result){            	
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
	this.createlanguage = function(data, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				// Checking if user email already exist in database
	        		con.query('INSERT INTO languages SET ?', data, function (err, results) {
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


	this.updatelanguage = function(data,id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				// Checking if user email already exist in database
	        		con.query("Update `languages` set `name` = '"+data.name+"', `lang_icon` = '"+data.lang_icon+"', `short_code2` = '"+data.short_code2+"', `short_code3` = '"+data.short_code3+"', `status` = '"+data.status+"', `updated_at` = '"+data.updated_at+"' where id='"+id+"'", function (err, results) {
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

	this.checkdeletelanguage = function(id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				// Checking if user email already exist in database
            	con.query('SELECT id FROM languages WHERE id = ?', [id], function(err, result){            	
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

	this.deletelanguage = function(id, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {	
				// Checking if user email already exist in database
	        		con.query("Delete from `languages` where id=?",[id], function (err, results) {
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

module.exports = new LanguageModel();

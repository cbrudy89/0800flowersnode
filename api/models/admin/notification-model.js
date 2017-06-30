var config = require('./../../../config');
var connection = require('./../../../database');

function NotificationModel(){
	
	this.create = function(data, callback) {
		connection.acquire(function(err, con) {
			if (err) {
				callback(err);
			}
			else {					
				con.query('INSERT INTO notifications SET ?', data, function (err, results) {
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

module.exports = new NotificationModel();

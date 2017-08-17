var config = require('./../../../config');
var connection = require('./../../../database');
var dbModel = require('./../../models/db-model');
var table_name = "sympathy_types";
function sympathyModel(){	
	this.getSympathys = function(sympathy_type, callback) {

	    var sql = "SELECT id,sympathy_type,created_at,updated_at, CASE WHEN status = 1 THEN 'Active' WHEN status = 0 THEN 'In-Active' END AS 'status' FROM sympathy_types";
	    if(sympathy_type != "" && sympathy_type != undefined){
	        sql += " WHERE `sympathy_type` like '%"+sympathy_type+"%'";
	    }
		dbModel.rawQuery(sql, function (err, results) {
	      	if (err) {
	      		callback(err);
	      	}else{
	      		callback(null, results);
	      	}
	  	});
	}

	this.getSympathy = function(id, callback) {

		// Checking if user email already exist in database
    	dbModel.rawQuery("SELECT * FROM sympathy_types WHERE id = "+id, function(err, result){            	
          if (err) {
            callback(err);
          }else{
          	callback(null,result);
          }
        });
			
	}	

	this.checkSympathy = function(sympathy_type, id, callback) {

		var sql = "SELECT id FROM sympathy_types WHERE sympathy_type = '"+sympathy_type+"' AND id <> "+id;
		//console.log(sql);
    	dbModel.rawQuery(sql, function(err, result){
          if (err) {
            callback(err);
          }else{
          	callback(null,result);
          }
        });
			    
	}
	this.createSympathy = function(data, callback) {
		//console.log(data);
		// Checking if user email already exist in database
		dbModel.save(table_name, data, "", function (err, results) {
	      	if (err) {
	      		callback(err);
	      	}else{
	      		callback(null, results);
	      	}			          	
	  	});
	}


	this.updateSympathy = function(data, id, callback) {
		
		// Checking if user email already exist in database
		dbModel.save(table_name, data, id, function (err, results) {
          	if (err) {
          		callback(err);
          	}else{
          		callback(null, results);
          	}			          	
      	});

	}

	this.checkDeleteSympathy = function(id, callback) {

		// Checking if user email already exist in database
    	dbModel.rawQuery("SELECT id FROM sympathy_types WHERE id = "+id, function(err, result){            	
          if (err) {
            callback(err);
          }else{
          	callback(null,result);
          }
        });
			
	}

	this.deleteSympathy = function(id, callback) {

		// Delete sympathy types
		dbModel.delete(table_name, "id="+id, function (err, results) {
          	if (err) {
          		callback(err);
          	}else{
          		callback(null, results);
          	}			          	
      	});
	}	
}

module.exports = new sympathyModel();

var config = require('./../../../config');
var connection = require('./../../../database');
var dbModel = require('./../../models/db-model');
var table_name = "flower_types";
function flowerModel(){	
	this.getFlowerTypes = function(flower_type, callback) {

	    var sql = "SELECT id,flower_type,created_at,updated_at, CASE WHEN status = 1 THEN 'Active' WHEN status = 0 THEN 'In-Active' END AS 'status' FROM "+table_name;
	    if(flower_type != "" && flower_type != undefined){
	        sql += " WHERE `flower_type` like '%"+flower_type+"%'";
	    }
		dbModel.rawQuery(sql, function (err, results) {
	      	if (err) {
	      		callback(err);
	      	}else{
	      		callback(null, results);
	      	}
	  	});
	}

	this.getFlowerType = function(id, callback) {

		// Checking if user email already exist in database
    	dbModel.rawQuery("SELECT * FROM "+table_name+" WHERE id = "+id, function(err, result){            	
          if (err) {
            callback(err);
          }else{
          	callback(null,result);
          }
        });
			
	}	

	this.checkFlowerType = function(flower_type, id, callback) {

		var sql = "SELECT id FROM "+table_name+" WHERE flower_type = '"+flower_type+"' AND id <> "+id;
		//console.log(sql);
    	dbModel.rawQuery(sql, function(err, result){
          if (err) {
            callback(err);
          }else{
          	callback(null,result);
          }
        });
			    
	}
	this.createFlowerType = function(data, callback) {
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


	this.updateFlowerType = function(data, id, callback) {
		
		// Checking if user email already exist in database
		dbModel.save(table_name, data, id, function (err, results) {
          	if (err) {
          		callback(err);
          	}else{
          		callback(null, results);
          	}			          	
      	});

	}

	this.checkDeleteFlowerType = function(id, callback) {

		// Checking if user email already exist in database
    	dbModel.rawQuery("SELECT id FROM "+table_name+" WHERE id = "+id, function(err, result){
          if (err) {
            callback(err);
          }else{
          	callback(null,result);
          }
        });
			
	}

	this.deleteFlowerType = function(id, callback) {

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

module.exports = new flowerModel();

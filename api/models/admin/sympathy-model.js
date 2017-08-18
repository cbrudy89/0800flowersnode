var config = require('./../../../config');
var connection = require('./../../../database');
var dbModel = require('./../../models/db-model');
var table_name = "sympathy_types";

function sympathyModel(){	
	this.getSympathys = function(sympathy_type, callback) {

	    var sql = "SELECT st.id, st.created_at, st.updated_at, CASE WHEN st.status = 1 THEN 'Active' WHEN st.status = 0 THEN 'In-Active' END AS 'status' FROM sympathy_types st INNER JOIN language_types lt ON(st.id = lt.type_id) WHERE lt.type='sympathy'";
	    if(sympathy_type != "" && sympathy_type != undefined){
	        sql += " AND lt.name like '%"+sympathy_type+"%'";
	    }

	    sql += " GROUP BY st.id";

	    //console.log(sql);

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

		dbModel.save("language_types", data, "", function (err, results) {
	      	if (err) {
	      		callback(err);
	      	}else{
	      		callback(null, results);
	      	}			          	
	  	});
	}


	this.updateSympathy = function(data, type_id, language_id, callback) {

		dbModel.getConnection(function(err, con){
			if (err) {
				callback(err);
			}
			else {
				con.query('UPDATE language_types SET ? WHERE type_id = ? AND language_id = ?', [data, type_id, language_id], function (err, results) {
					con.release();
		          	if (err) {
		          		callback(err);
		          	}else{
		          		callback(null, results);
		          	}			          	
		      	});
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
		dbModel.getConnection(function(error, con){
          if (error) {
            callback(error);
          }else{

            // Delete vendor form table if found 
            dbModel.beginTransaction(con, 'DELETE FROM '+table_name+' WHERE id ='+id, function(error, result){
              if(error){
                callback(error);                   
              }else{

                if(result.affectedRows > 0){

                  // Delete vendor specific entries form country vendor,group_vendor,method_vendor and vendor_secondary_contact tables.
                  var sql = "DELETE FROM language_types WHERE type='sympathy' AND type_id="+id;
                  //console.log(sql);

                  // Delete vendor specific entries form group_vendor table
                  dbModel.transactionQuery(con, sql, function (error, result) {
                    if (error) {
                      callback(error);
                    }else{

                      dbModel.commit(con, function(err, response){
                        if (error) {
                          callback(error);
                        }else{
                          callback(null, response);                                   
                        }                                  

                      });

                    }    
                  });
               
                }else{
                  callback(error);
                }

              }

            });

          }

        });

	}	

	this.getLanguageData = function(type_id, callback){

	    $sql = "SELECT language_id,name from `language_types` WHERE type='sympathy' AND type_id="+type_id;
	    dbModel.rawQuery($sql, function(err, $result) {
	        if (err) callback(err);
	        else callback(null,$result);
	    });

	}
}

module.exports = new sympathyModel();

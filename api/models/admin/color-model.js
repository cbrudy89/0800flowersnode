var config = require('./../../../config');
var connection = require('./../../../database');
var dbModel = require('./../../models/db-model');
var table_name = "colors";
var type = "color";

function colorModel(){	
	this.getcolors = function(color_name, callback) {

	    var sql = "SELECT c.id, c.color_code, c.created_at, c.updated_at, CASE WHEN c.status = 1 THEN 'Active' WHEN c.status = 0 THEN 'In-Active' END AS 'status' FROM "+table_name+" c INNER JOIN language_types lt ON(c.id = lt.type_id) WHERE lt.type='"+type+"'";
	    if(color_name != "" && color_name != undefined){
	        sql += " AND lt.name like '%"+color_name+"%'";
	    }

	    sql += " GROUP BY c.id";

	    //console.log(sql);

		dbModel.rawQuery(sql, function (err, results) {
	      	if (err) {
	      		callback(err);
	      	}else{
	      		callback(null, results);
	      	}
	  	});
	}


	this.getcolor = function(id, callback) {

    	dbModel.rawQuery("SELECT id,color_code,status,created_at,updated_at FROM "+table_name+" WHERE id = "+id, function(err, result){            	
          if (err) {
            callback(err);
          }else{
          	callback(null,result);
          }
        });			
	}

	this.createcolor = function(data, callback) {
		dbModel.save("language_types", data, "", function (err, results) {
	      	if (err) {
	      		callback(err);
	      	}else{
	      		callback(null, results);
	      	}			          	
	  	});
	}


	this.updatecolor = function(data, type_id, language_id, callback) {
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

	this.checkdeletecolor = function(id, callback) {

		// Checking if user email already exist in database
    	dbModel.rawQuery("SELECT id FROM "+table_name+" WHERE id = "+id, function(err, result){            	
          if (err) {
            callback(err);
          }else{
          	callback(null,result);
          }
        });

	}

	this.deletecolor = function(id, callback) {

		// Delete color types
		dbModel.getConnection(function(error, con){
          if (error) {
            callback(error);
          }else{

            // Delete colors table if found
            dbModel.beginTransaction(con, 'DELETE FROM '+table_name+' WHERE id ='+id, function(error, result){
              if(error){
                callback(error);                   
              }else{

                if(result.affectedRows > 0){

                  // Delete vendor specific entries form country vendor,group_vendor,method_vendor and vendor_secondary_contact tables.
                  var sql = "DELETE FROM language_types WHERE type='"+type+"' AND type_id="+id;
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

	    $sql = "SELECT language_id,name from `language_types` WHERE type='"+type+"' AND type_id="+type_id;
	    dbModel.rawQuery($sql, function(err, $result) {
	        if (err) callback(err);
	        else callback(null,$result);
	    });

	}	
}

module.exports = new colorModel();

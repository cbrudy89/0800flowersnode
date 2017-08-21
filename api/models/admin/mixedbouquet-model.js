var config = require('./../../../config');
var connection = require('./../../../database');
var dbModel = require('./../../models/db-model');
var table_name = "mixed_bouquets";

function mixedBouquetModel(){	
	this.getmixedBouquets = function(bouquet_name, callback) {

	    var sql = "SELECT mb.id, mb.created_at, mb.updated_at, CASE WHEN mb.status = 1 THEN 'Active' WHEN mb.status = 0 THEN 'In-Active' END AS 'status' FROM mixed_bouquets mb INNER JOIN language_types lt ON(mb.id = lt.type_id) WHERE lt.type='bouquets'";
	    if(bouquet_name != "" && bouquet_name != undefined){
	        sql += " AND lt.name like '%"+bouquet_name+"%'";
	    }

	    sql += " GROUP BY mb.id";

	    //console.log(sql);

		dbModel.rawQuery(sql, function (err, results) {
	      	if (err) {
	      		callback(err);
	      	}else{
	      		callback(null, results);
	      	}
	  	});
	}

	this.getMixedBouquet = function(id, callback) {

		// Checking if user email already exist in database
    	dbModel.rawQuery("SELECT * FROM mixed_bouquets WHERE id = "+id, function(err, result){            	
          if (err) {
            callback(err);
          }else{
          	callback(null,result);
          }
        });			
	}


	this.createMixedBouquet = function(data, callback) {

		dbModel.save("language_types", data, "", function (err, results) {
	      	if (err) {
	      		callback(err);
	      	}else{
	      		callback(null, results);
	      	}			          	
	  	});
	}


	this.updateMixedBouquet = function(data, type_id, language_id, callback) {

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

	this.checkDeleteBouquet = function(id, callback) {

		// Checking if user email already exist in database
    	dbModel.rawQuery("SELECT id FROM mixed_bouquets WHERE id = "+id, function(err, result){            	
          if (err) {
            callback(err);
          }else{
          	callback(null,result);
          }
        });
			
	}

	this.deleteMixedBouquet = function(id, callback) {

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
                  var sql = "DELETE FROM language_types WHERE type='bouquets' AND type_id="+id;
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

	    $sql = "SELECT language_id,name from `language_types` WHERE type='bouquets' AND type_id="+type_id;
	    dbModel.rawQuery($sql, function(err, $result) {
	        if (err) callback(err);
	        else callback(null,$result);
	    });

	}
}

module.exports = new mixedBouquetModel();

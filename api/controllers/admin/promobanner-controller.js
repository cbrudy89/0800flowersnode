var jwt = require('jsonwebtoken');
var Sync = require('sync');
var request = require('request');
var config = require('./../../../config');
var connection = require('./../../../database');
var dbModel = require('./../../models/db-model');

function PromoBannerController() {
//get list of all promo banner
    this.getallpromobanners = function(req, res) {
        if(req.decoded.role != config.ROLE_ADMIN){
            res.status(config.HTTP_FORBIDDEN).send({
              status: config.ERROR, 
              code : config.HTTP_FORBIDDEN, 
              message: "You don't have permission!"
            });       
        }else{

            var search_type = req.body.search_type;
            var description = req.body.description;

            var string='';
            var string1='';
            var queryString = "SELECT snipes.*,snipe_language.description ";
            queryString += "FROM `snipes`  ";
            queryString += "INNER JOIN `snipe_language` ON `snipes`.`id` = `snipe_language`.`snipe_id`  ";
            queryString += "WHERE `snipe_language`.`language_id` = 1 ";

            if(search_type != "" && search_type != undefined){
                string += " AND `type` like '%"+search_type+"%'";
            }
            if(description != "" && description != undefined){
                string1 += " AND `description` like '%"+description+"%'";
            }
            /*if(string != "" || string1 != ""){
                queryString += " WHERE ";
            }*/
            queryString += string+string1;

            /*if(string != "" && string1 != ""){
                queryString += " AND ";
            }
            queryString += string1;*/           
            
            dbModel.rawQuery(queryString, function(err, result) {
              if (err) {
                res.status(config.HTTP_BAD_REQUEST).send({
                  status: config.ERROR, 
                  code : config.HTTP_BAD_REQUEST, 
                  message: err
                });
              }
              else{
                    if(result.length > 0){                      
                      res.status(config.HTTP_SUCCESS).send({
                        status: config.SUCCESS,
                        code: config.HTTP_SUCCESS,
                        message:"banners found",
                        result: result
                      });
                    }
                    else {
                        res.status(config.HTTP_BAD_REQUEST).send({
                          status:config.ERROR,
                          code: config.HTTP_BAD_REQUEST, 
                          message:"Failed to get banners"
                      }); 
                    }
              }
            });
        }
    }
    //add/edit promo banner
    this.addeditpromobanner = function(req, res) {
        if(req.decoded.role != config.ROLE_ADMIN){
            res.status(config.HTTP_FORBIDDEN).send({
              status: config.ERROR, 
              code : config.HTTP_FORBIDDEN, 
              message: "You dont have permission!"
            });       
        }else{              
            if(req.body.id == undefined) var id=0;
            else var id= req.body.id;                                  
            var descriptionArr= req.body.descriptionArr;
            var post = {
                type: req.body.type,
                status: req.body.status
            };  

            dbModel.save('snipes',post,id, function(err, result) {
                  if (err) {
                      res.status(config.HTTP_BAD_REQUEST).send({
                        status: config.ERROR, 
                        code : config.HTTP_BAD_REQUEST, 
                        message: err
                      });
                  }
                  else{
                    if(id == 0) id=result.insertId;
                      if(descriptionArr.length > 0){
                        Sync(function(){
                          var jsonData = JSON.parse(descriptionArr);
                          console.log(jsonData);
                          for (var i = 0; i < jsonData.length; i++) {
                            var lang = jsonData[i];
                            var response='';
                            if(id !=0) response=checkLanguage_entry.sync(null,id,lang.language_id);                            
                            updateLanguage_entry.sync(null,id, lang,response);
                          } 
                        }); 
                      }
                      res.status(config.HTTP_SUCCESS).send({
                            status: config.SUCCESS, 
                            code : config.HTTP_SUCCESS, 
                            message: 'snipes saved'
                      });               
                  }
            });

            
        }
    }
   //delete delete promobanner
    this.deletepromobanner = function(req, res) {
        if(req.decoded.role != config.ROLE_ADMIN){
            res.status(config.HTTP_FORBIDDEN).send({
              status: config.ERROR, 
              code : config.HTTP_FORBIDDEN, 
              message: "You dont have permission."
            });       
        }else{
              var id= req.body.id;
              // Getting Connection Object
            dbModel.getConnection(function(error, con){
              if (error) {
                res.status(config.HTTP_SERVER_ERROR).send({
                  status:config.ERROR,
                  code: config.HTTP_SERVER_ERROR,
                  message:'Unable to process result!',
                  error : error
                });
              }else{

                // Delete methods form table if found 
                dbModel.beginTransaction(con, 'DELETE FROM snipes WHERE id ='+id, function(error, result){
                  if(error){
                    res.status(config.HTTP_SERVER_ERROR).send({
                      status:config.ERROR,
                      code: config.HTTP_SERVER_ERROR,
                      message:'Unable to delete snipes.',
                      error: error
                    });                    
                  }else{

                    if(result.affectedRows > 0){

                      // Delete methods specific entries
                     
                      var sql = "DELETE FROM snipe_language WHERE snipe_id ="+id+";";

                      // Delete methods specific entries
                      dbModel.transactionQuery(con, sql, function (error, result) {
                        if (error) {
                          res.status(config.HTTP_SERVER_ERROR).send({
                            status:config.ERROR,
                            code: config.HTTP_SERVER_ERROR,
                            message:'Unable to delete snipes.',
                            error: error
                          });
                        }else{

                          dbModel.commit(con, function(err, response){
                            if (error) {
                              res.status(config.HTTP_SERVER_ERROR).send({
                                status:config.ERROR,
                                code: config.HTTP_SERVER_ERROR,
                                message:'Unable to delete snipes.',
                                error: error
                              });
                            }else{
                              res.status(config.HTTP_SUCCESS).send({
                                status:config.SUCCESS,
                                code: config.HTTP_SUCCESS,
                                message:'snipes deleted successfully.'
                              });                                    
                            }                                  

                          });

                        }    
                      });
                   
                    }else{
                      res.status(config.HTTP_NOT_FOUND).send({
                        status:config.ERROR,
                        code: config.HTTP_NOT_FOUND,
                        message:'snipes not found.'
                      });
                    }

                  }

                });

              }

            });

        }
    }

}

//check existing snipe language entry
function checkLanguage_entry(snipe_id,language_id,callback){
    $sql = "SELECT id from `snipe_language` WHERE  `language_id`="+language_id+" AND snipe_id="+snipe_id;
    //console.log($sql);
    dbModel.rawQuery($sql, function(err, $result) {
        if (err) callback(err);
        else {
          var id ='';
          if($result.length > 0 && $result != undefined) id=$result[0].id
          callback(null,id);
        } 
    });
}

//update/insert snipe language entry
function updateLanguage_entry(snipe_id,descriptionArr,record_id='',callback){     
      var language_snipeData = {
          "snipe_id": snipe_id,
          "language_id": descriptionArr.language_id,
          "description":descriptionArr.description
      };
      //console.log(language_methodData);
      dbModel.save("snipe_language", language_snipeData, record_id, function (err, $result) {
        if (err) callback(err);
        else callback(null,$result);
      });  

}


module.exports = new PromoBannerController();
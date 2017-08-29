var jwt = require('jsonwebtoken');
var Sync = require('sync');
var request = require('request');
var config = require('./../../../config');
var connection = require('./../../../database');
var fileHelper = require('./../../helpers/file-helper');
var dbModel = require('./../../models/db-model');

function HomeController() {
//get list of all top countries
    this.getalltopcountires = function(req, res) {
        if(req.decoded.role != config.ROLE_ADMIN){
            res.status(config.HTTP_FORBIDDEN).send({
              status: config.ERROR, 
              code : config.HTTP_FORBIDDEN, 
              message: "You don't have permission!"
            });       
        }else{

            var country_name = req.body.country_name;

            var queryString = "SELECT `top_country`.`id`,CONCAT('"+config.RESOURCE_URL+"', REPLACE(top_country.product_image, '+','%2B')) as product_image, `top_country`.`country_id`, `country_list`.`country_name`,`top_country`.`status` ";
            queryString += "FROM `top_country` INNER JOIN `country_list` ON `top_country`.`country_id` = `country_list`.`id`  ";
            queryString += "WHERE `top_country`.`status` = 1  ";
            

            if(country_name != "" && country_name != undefined){
                queryString += " AND `country_name` like '%"+country_name+"%' ";
            }

            queryString += "ORDER BY `top_country`.`order_by` asc  ";
            queryString += "LIMIT 5";       
            
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
                        message:"countries found",
                        result: result
                      });
                    }
                    else {
                        res.status(config.HTTP_BAD_REQUEST).send({
                          status:config.ERROR,
                          code: config.HTTP_BAD_REQUEST, 
                          message:"Failed to get countries"
                      }); 
                    }
              }
            });
        }
    }


    // Get top country
    this.gettopcountry = function(req, res) {
      var id = req.body.id;
      var queryString = "SELECT `top_country`.`id`,CONCAT('"+config.RESOURCE_URL+"', REPLACE(top_country.product_image, '+','%2B')) as product_image, `top_country`.`country_id`, `country_list`.`country_name`,`top_country`.`status` ";
      queryString += "FROM `top_country` INNER JOIN `country_list` ON `top_country`.`country_id` = `country_list`.`id`  ";
      queryString += "WHERE `top_country`.`id` = "+id;

      dbModel.rawQuery(queryString, function(err, result){
        if (err) {
          res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR, 
            message : "Unable to process request!", 
            errors : err
          });
        }else{
          //console.log( result[0].id);return;
          if(result.length > 0 && result[0].id > 0 ){
                res.status(config.HTTP_SUCCESS).send({
                  status: config.SUCCESS, 
                  code : config.HTTP_SUCCESS, 
                  results : result
                });
          }else{
            res.status(config.HTTP_BAD_REQUEST).send({
              status: config.ERROR, 
              code : config.HTTP_BAD_REQUEST, 
              message : "Something went wrong please check again.", 
            });          
          }
        }
      });
    }


    //add/edit top country
    this.addedittopcountry = function(req, res) {
        if(req.decoded.role != config.ROLE_ADMIN){
            res.status(config.HTTP_FORBIDDEN).send({
              status: config.ERROR, 
              code : config.HTTP_FORBIDDEN, 
              message: "You dont have permission!"
            });       
        }else{              
            if(req.body.id == undefined) var id=0;
            else var id= req.body.id;   
            
            var  product_image= req.body.product_image;

            var post = {
                country_id: req.body.country_id,
                status: req.body.status,
                order_by: req.body.order_by
            }; 
             
            if(product_image != "" || product_image != undefined){
              var countryImagePath = "uploads/trending_products";
              fileHelper.uploadImage(product_image, countryImagePath, function(err, result){
                if(err){
                  res.status(config.HTTP_BAD_REQUEST).send({
                    status: config.ERROR, 
                    code : config.HTTP_BAD_REQUEST, 
                    message: err
                  });
                }else{
                  //post.push({ "product_image" : result });
                  post.product_image = result;
                }
              });
            }

            var queryString="SELECT * FROM top_country WHERE country_id='"+req.body.country_id+"' AND id <> "+id;
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
                        message:"The country is already exists.",
                        result: result
                      });
                  }
                  else {
                      dbModel.save('top_country',post,id, function(err, result) {
                            if (err) {
                                res.status(config.HTTP_BAD_REQUEST).send({
                                  status: config.ERROR, 
                                  code : config.HTTP_BAD_REQUEST, 
                                  message: err
                                });
                            }
                            else{
                                res.status(config.HTTP_SUCCESS).send({
                                      status: config.SUCCESS, 
                                      code : config.HTTP_SUCCESS, 
                                      message: 'methods saved'
                                });               
                            }
                      });
                  }
              }
            });

            
        }
    }
   //delete top country
    this.deletetopcountry = function(req, res) {
        if(req.decoded.role != config.ROLE_ADMIN){
            res.status(config.HTTP_FORBIDDEN).send({
              status: config.ERROR, 
              code : config.HTTP_FORBIDDEN, 
              message: "You dont have permission."
            });       
        }else{
            var id= req.body.id;
            dbModel.delete('top_country','id='+id, function(err, result) {
              if (err) {
                res.status(config.HTTP_BAD_REQUEST).send({
                  status: config.ERROR, 
                  code : config.HTTP_BAD_REQUEST, 
                  message: err
                });
              }
              else{
                    res.status(config.HTTP_SUCCESS).send({
                          status: config.SUCCESS, 
                          code : config.HTTP_SUCCESS, 
                          message: 'top country deleted'
                    });            
              }
            });

        }
    }

}


module.exports = new HomeController();
var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var handlebars = require('handlebars');
var fs = require('fs');

var config = require('./../../../config');
var connection = require('./../../../database');
var commonHelper = require('./../../helpers/common-helper');
var fileHelper = require('./../../helpers/file-helper');
var confirmed = status = 1;

function CountryController() {
  // Create New Country
  this.create=function(req,res,next){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to create Province!"
      });       
    }else{
      var post = {
        continet_name: req.body.continet_name,
        preferred_currency_id: req.body.preferred_currency_id,
        country_name: req.body.country_name,
        short_code: req.body.short_code,
        country_alias: req.body.country_alias,
        iso_code: req.body.iso_code,
        calling_code: req.body.calling_code,
        phone: req.body.phone,
        surcharge: req.body.surcharge,
        country_flag: req.body.country_flag, // 
        company_logo: req.body.company_logo,
        ga_code: req.body.ga_code,
        zipcode_length: req.body.zipcode_length,
        zipcode_type: req.body.zipcode_type,
        required_zipcode: req.body.required_zipcode,
        is_display: req.body.is_display,
        show_state: req.body.show_state,
        status: req.body.status,
        redirect_url: req.body.redirect_url
      };
      
      connection.acquire(function(err, con) {
        //check if country exist
        con.query('SELECT id FROM country_list WHERE country_name = ?', [post.country_name], function(err, result){
          if (err) {
                res.status(config.HTTP_SERVER_ERROR).send({
                  status: config.ERROR, 
                  code : config.HTTP_SERVER_ERROR, 
                  message : "Country has been not inserted.", 
                  errors : err
                });
              }else{
                    if(result.length > 0 && result[0].id > 0){
                      res.status(config.HTTP_ALREADY_EXISTS).send({
                        status: config.ERROR, 
                        code : config.HTTP_ALREADY_EXISTS, 
                        message: "The country name has already been taken."
                      });
                    }else{

                      var countryImagePath = "uploads/country_flag";
                      if(post.country_flag != ""){
                        fileHelper.uploadImage(post.country_flag, countryImagePath, function(err, result){
                          if(err){
                            res.status(config.HTTP_BAD_REQUEST).send({
                              status: config.ERROR, 
                              code : config.HTTP_BAD_REQUEST, 
                              message: err
                            });
                          }else{
                            post.country_flag = result;
                          }
                        });
                      }
                      var company_logoPath = "uploads/company_logo";
                      if(post.company_logo != ""){
                        fileHelper.uploadImage(post.company_logo, company_logoPath, function(err, result){
                          if(err){
                            res.status(config.HTTP_BAD_REQUEST).send({
                              status: config.ERROR, 
                              code : config.HTTP_BAD_REQUEST, 
                              message: err
                            });
                          }else{
                            post.company_logo = result;
                          }
                        });
                      }

                      var query = con.query('INSERT INTO country_list SET ?', post, function(err, result) {
                        con.release();
                        if (err) {
                                    res.status(config.HTTP_SERVER_ERROR).send({
                                      status: config.ERROR, 
                                      code : config.HTTP_SERVER_ERROR, 
                                      message: 'Country has been not inserted.'
                                    });
                                  }
                                  else{
                                    res.status(config.HTTP_SUCCESS).send({
                                      status: config.SUCCESS, 
                                      code : config.HTTP_SUCCESS, 
                                      message: 'Country has been inserted successfully.'
                                    });
                                  }
                      });

                    }

              }
          });
      }); 
    }    
  }

  //Edit Country
  this.view=function(req,res){
      if(req.decoded.role != config.ROLE_ADMIN){
        res.status(config.HTTP_FORBIDDEN).send({
          status: config.ERROR, 
          code : config.HTTP_FORBIDDEN, 
          message: "You dont have permission to create Country!"
        });       
      }else{
        var id = req.params.id;
          connection.acquire(function(err, con) {
            if (err) {
              res.send({status: 1, message: err});
            }      
            con.query('select * from country_list where id = ?', [id], function(err, result) {
              if (err) {
                res.status(config.HTTP_NOT_FOUND).send({
                          status:config.ERROR,
                          code: config.HTTP_NOT_FOUND,             
                          message:"No records found"
                         });
              } else {
                if(result.length > 0){
                  result[0].country_flag = '/uploads/country_flag/'+result[0].country_flag;

                  res.status(config.HTTP_SUCCESS).send({
                              status: config.SUCCESS,
                              code: config.HTTP_SUCCESS,
                              message:"Countries found",
                              result: result
                          
                  });
                }else{
                  res.status(config.HTTP_BAD_REQUEST).send({
                      status:config.ERROR,
                      code: config.HTTP_BAD_REQUEST, 
                      message:"Failed to get countries"
                  }); 
                }
              }        
              con.release();
            });
          });

      }
  }
   //Edit Country
  this.update=function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
        res.status(config.HTTP_FORBIDDEN).send({
          status: config.ERROR, 
          code : config.HTTP_FORBIDDEN, 
          message: "You dont have permission to create Province!"
        });       
      }else{
        var id = req.body.id;
        var continet_name = req.body.continet_name;
        var preferred_currency_id = req.body.preferred_currency_id;
        var country_name = req.body.country_name;
        var short_code = req.body.short_code;
        var country_alias = req.body.country_alias;
        var iso_code = req.body.iso_code;
        var calling_code = req.body.calling_code;
        var phone = req.body.phone;
        var surcharge = req.body.surcharge;
        var country_flag = req.body.country_flag; // 
        var ga_code = req.body.ga_code;
        var zipcode_length = req.body.zipcode_length;
        var zipcode_type = req.body.zipcode_type;
        var required_zipcode = req.body.required_zipcode;
        var is_display = req.body.is_display;
        var show_state = req.body.show_state;
        var status = req.body.status;
        var redirect_url = req.body.redirect_url;

        connection.acquire(function(err, con) {
          var countryImagePath = "uploads/country_flag";
          if(country_flag != ""){
            fileHelper.uploadImage(country_flag, countryImagePath, function(err, result){
              if(err){
                res.status(config.HTTP_BAD_REQUEST).send({
                  status: config.ERROR, 
                  code : config.HTTP_BAD_REQUEST, 
                  message: err
                });
              }else{
                country_flag = result;
              }
            });
          }


        var query ="UPDATE `country_list` SET `continet_name`='"+continet_name+"',`country_name`='"+country_name+"',`preferred_currency_id`='"+preferred_currency_id+"',`country_alias`='"+country_alias+"',`short_code`='"+short_code+"',`iso_code`='"+iso_code+"',`zipcode_length`='"+zipcode_length+"',`zipcode_type`='"+zipcode_type+"',`calling_code`='"+calling_code+"',`show_state`='"+show_state+"',`required_zipcode`='"+required_zipcode+"',`country_flag`='"+country_flag+"',`surcharge`='"+surcharge+"',`phone`='"+phone+"',`is_display`='"+is_display+"',`status`='"+status+"',`ga_code`='"+ga_code+"',`redirect_url`='"+redirect_url+"' WHERE `id` = '"+id+"'";
                

        con.query(query, function (error, results, fields) {
          con.release();
          if (error) {
              res.status(config.HTTP_SERVER_ERROR).send({
                status:config.ERROR,
                code: config.HTTP_SERVER_ERROR,
                message:'Unable to update country.'
              });
          }else{
            if(results.affectedRows >0){
               res.status(config.HTTP_SUCCESS).send({
                    status:config.SUCCESS,
                    code: config.HTTP_SUCCESS,
                    message:"Country updated successfully!"
                });
             
            }
            else{
              res.send({
                status:config.ERROR,
                code:config.HTTP_FORBIDDEN,
                message:"Country has not been updated."
              });
            }
          }
        });
      });


      }
  }

  //List Countries
  this.list=function(req,res){
      if(req.decoded.role != config.ROLE_ADMIN){
        res.status(config.HTTP_FORBIDDEN).send({
          status: config.ERROR, 
          code : config.HTTP_FORBIDDEN, 
          message: "You dont have permission to create Province!"
        });       
      }else{
         connection.acquire(function(err, con) {
            if (err) {
              res.send({status: 1, message: err});
            }      
            con.query('select * from country_list', function(err, result) {
              if (err) {
                res.status(config.HTTP_SERVER_ERROR).send({
                          status:config.ERROR,
                          code: config.HTTP_SERVER_ERROR,             
                          message:"No records found"
                         });
              } else {
                if(result.length > 0){
                  res.status(config.HTTP_SUCCESS).send({
                              status: config.SUCCESS,
                              code: config.HTTP_SUCCESS,
                              message:"Countries found",
                              result:result
                  });
                }else{
                  res.status(config.HTTP_BAD_REQUEST).send({
                      status:config.ERROR,
                      code: config.HTTP_BAD_REQUEST, 
                      message:"Failed to get countries"
                  }); 
                }
              }        
              con.release();
            });
          });

      }
  }

   // delete admin users 
  this.delete = function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to delete country!"
      });       
    }else{
      var id = req.body.id;
      connection.acquire(function(err, con) {
        con.query('SELECT * FROM country_list WHERE id = ?',[id], function (error, results, fields) {
          if (error) {
              res.status(config.HTTP_SERVER_ERROR).send({
                status:config.ERROR,
                code: config.HTTP_SERVER_ERROR,
                message:'There are some error with query'
              })
          }else{
            
              con.query('delete from country_list where id = ?',[id], function (error, results, fields) {
                con.release();
                if (error) {
                    res.status(config.HTTP_SERVER_ERROR).send({
                      status:config.ERROR,
                      code: config.HTTP_SERVER_ERROR,
                      message:'Unable to delete Country.'
                    });
                }else{
                  if(results.affectedRows > 0){
                    res.status(config.HTTP_SUCCESS).send({
                      status:config.SUCCESS,
                      code: config.HTTP_SUCCESS,
                      message:'Country deleted successfully.'
                    });
                  }else{
                    res.status(config.HTTP_NOT_FOUND).send({
                      status:config.ERROR,
                      code: config.HTTP_NOT_FOUND,
                      message:'Country not found.'
                    });
                  }
                }
              });
            
          }
        });
      });

    } // else close    

  }

}
module.exports = new CountryController();
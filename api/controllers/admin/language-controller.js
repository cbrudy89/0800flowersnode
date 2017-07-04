var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var config = require('./../../../config');
var connection = require('./../../../database');
//var userHelper = require('./../helpers/user-helper');
var languageModel = require('./../../models/admin/language-model');

function LanguageController() {

    // get all languages
  this.getlanguages = function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to get language!"
      });       
    }else{
      var name = req.body.name;
      languageModel.getlanguages(name, function(err, result){
         if(err) {
            console.log(err);
         }else{
            res.status(config.HTTP_SUCCESS).send({
              status: config.SUCCESS, 
              code : config.HTTP_SUCCESS, 
              message: 'all languages found',
              data : result
            });
         }
      });
    } // else close    

  }
  // Create new language
  this.createlanguage=function(req,res){

    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to create user!"
      });       
    }else{
      // Insert into language table
      var curr_date  = new Date();
      var id=0;
      langData = {
            'name':req.body.name,
            'lang_icon':req.body.lang_icon,
            'short_code2':req.body.short_code2,
            'short_code3':req.body.short_code3,
            'status':'1',
            'created_at':curr_date,
            'updated_at':curr_date
      };
      languageModel.checklanguage(langData,id, function(err, result){
        //console.log(err);
         if(result.length > 0 && result[0].id > 0){
            res.status(config.HTTP_ALREADY_EXISTS).send({
              status: config.ERROR, 
              code : config.HTTP_ALREADY_EXISTS, 
              message: "The specified language already exists."
            });
         }else{
            languageModel.createlanguage(langData, function(err, result){
              //console.log(err);
               if(err) {
                  console.log(err);
               }else{
                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'new language has been created',
                  });
               }
            });
         }
      }); 

    }    
  }

 
  // Update language
  this.updatelanguage=function(req,res){

    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to update language!"
      });       
    }else{
      var curr_date  = new Date();
      var id =req.body.id;
      langData = {
            'name':req.body.name,
            'lang_icon':req.body.lang_icon,
            'short_code2':req.body.short_code2,
            'short_code3':req.body.short_code3,
            'status':req.body.status,
            'updated_at':curr_date
      };
      languageModel.checklanguage(langData,id, function(err, result){
        //console.log(err);
         if(result.length > 0 && result[0].id > 0){
            res.status(config.HTTP_ALREADY_EXISTS).send({
              status: config.ERROR, 
              code : config.HTTP_ALREADY_EXISTS, 
              message: "the specified language name is already exists."
            });
         }else{
            languageModel.updatelanguage(langData,id, function(err, result){
              //console.log(err);
               if(err) {
                  console.log(err);
               }else{
                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'the language has been updated',
                  });
               }
            });
         }
      });

      
    }  
  }

  // delete language 
  this.deletelanguage = function(req,res){
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to delete language!"
      });       
    }else{
      
      var id = req.body.id;
      //console.log("id-"+id);
      languageModel.checkdeletelanguage(id, function(err, result){
       // console.log(result);
         if(!result.length){
            res.status(config.HTTP_NOT_FOUND).send({
              status: config.ERROR, 
              code : config.HTTP_NOT_FOUND, 
              message: "The specified language not found."
            });
         }else{
            languageModel.deletelanguage(id, function(err, result){
              //console.log(err);
               if(err) {
                  console.log('test'+err);
               }else{
                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'the language has been deleted',
                  });
               }
            });
         }
      });

    } // else close    

  }

  // Get language Information 
  this.getlanguage = function(req, res) {
    var id=req.body.id;
    //console.log(id);
    connection.acquire(function(err, con) {
      if (err) {
        res.send({status: 1, message: err});
      }      
      con.query('select * from languages where id = ?', [id], function(err, result) {
        if (err) {
          res.send({status: 1, message: 'Failed to get'});
        } else {
          if(result.length > 0){
            res.send({status: 0, message: 'language found!', response: result});
          }else{
            res.send({status: 1, message: 'Failed to get language'});
          }
        }        
        con.release();
      });
    });
  };

}

module.exports = new LanguageController();
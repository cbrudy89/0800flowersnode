var jwt = require('jsonwebtoken');
var async = require('async');
var Sync = require('sync');
var request = require('request');
var config = require('./../../config');
var connection = require('./../../database');
var dbModel = require('./../models/db-model');
var commonHelper = require('./../helpers/common-helper');
var braintree = require('braintree');

function PaymentController() {

    this.braintreepay = function(req, res) {
        var ordertotal = '5.00';
        var brainTreeCustomerId = '193928871';  ///braintree customer record token
        var brainTreeCardToken = 'gdccg8';  ///braintree customer credit card token

       Sync(function(){
            var gateway = braintree.connect({
                environment:  braintree.Environment.Sandbox,
                merchantId:   'c3cygp5gbg3ggvd9',
                publicKey:    'dwrgpf4v7qv5zq8s',
                privateKey:   '817ea72c2dddc9431c3753056dd0af67'
            });
            /*var data = {
                    number : '3530111333300000',
                    expirationDate : '05/22',
                    cvv : '123',
                    cardholderName : 'JCB Cardholder',
                    token:brainTreeCardToken
                }
            gateway.CreditCard.update(data, function (err, result) {
              console.log(result);
              if(err){
                console.log(err);
                return;
              }else{
                  if (result.success) {   
                      ///code to be dump in database
                      console.log(result);                                               
                  }else {
                      console.log(result.message);
                  }
              }
              
            });
            return;*/
            var response={};
            if(brainTreeCustomerId=='') {  /// for new braintree customers
                var data = {
                    firstName: 'Neeraj',
                    lastName: 'Dang',
                    company: 'Mobikasa',
                    email: 'neeraj@mobikasa.com',
                    creditCard : {
                        number : '2223000048400011',
                        expirationDate : '05/22',
                        cvv : '123',
                        cardholderName : 'Dummy Cardholder',
                        options: {
                            verifyCard: true
                        }
                    }
                }                
                response= createCustomer.sync(null,gateway,data);  ///create customer and card addition
                var paymentToken=response[0].token;
            }else{  ///for old braintree customers
                var data = {
                    customerId: brainTreeCustomerId,
                    number : '3530111333300000',
                    expirationDate : '05/22',
                    cvv : '123',
                    cardholderName : 'JCB Cardholder',
                    options: {
                        verifyCard: true,
                        failOnDuplicatePaymentMethod :true
                    }
                }
                response= addCustomerCard.sync(null,gateway,data);  //add another card for existing braintree customer
                console.error('response--'+response); 
                //var paymentToken=response[0].token;
            }
            //if(paymentToken) res= braintree_transaction.sync(null,gateway,paymentToken,ordertotal); //pay order amount with braintree
            //else res='Payment token not found.'; 

            //console.error(res); 
        });     
    }

}

///create customer and card addition
function createCustomer(gateway, data, callback){
        gateway.customer.create(data, function (err, result) {
              if(err){
                callback(err);
                return;
              }else{
                 //console.log(result);
                 //result.customer.id;// e.g. 494019     
                  if (result.success) {   
                      response= JSON.parse(JSON.stringify(result.customer.paymentMethods, null, 4));  
                      ///code to be dump in database
                      callback(null,response);                                               
                  }else {
                      callback(result.message);
                  }
              }
              
            });
}



//add another card for existing braintree customer
function addCustomerCard(gateway, data, callback){
    //console.log(data);
    gateway.creditcard.create(data, function (err, result) {
      console.log(JSON.stringify(result));
      if(err){
        callback(err);
        return;
      }else{
          if (result.success) {   
              ///code to be dump in database
              callback(null,result);                                               
          }else {
              callback(result.message);
          }
      }
      
    });
}

//pay order amount with braintree
function braintree_transaction(gateway,paymentToken,ordertotal, callback){
    if(!paymentToken) return false;
        gateway.paymentMethodNonce.create(paymentToken, function(err, response) {
            if (err) {
                callback(err);
            }else if (response.success) {
                //console.log('response---'+response);
                   var nonce = response.paymentMethodNonce.nonce;
                   if(nonce){
                      ///console.log('response---'+nonce);
                       gateway.transaction.sale({
                              amount: ordertotal,
                              paymentMethodNonce: nonce,
                              options: {
                                submitForSettlement: true
                              }
                        }, function (err, result) {
                              if (err) {
                                callback(err);
                              }
                              if (result.success) {
                                //console.log(result);
                                //console.log('Transaction ID: ' + result.transaction.id);
                                callback(null,result);
                              } else {
                                callback(null,result.message);
                              }
                        });                    
                   }
                   else callback(null,'Payment nonce not found.');
            }else {
              callback(null,response.message);
            }
        });
}


function updateCustomerCard(gateway, data, callback){
    ///console.log('000-----'+data);
    gateway.creditcard.update(data, function (err, result) {
      console.log(result);
      if(err){
        callback(err);
        return;
      }else{
          if (result.success) {   
              ///code to be dump in database
              callback(null,result);                                               
          }else {
              callback(result.message);
          }
      }
      
    });
}

function deleteCustomerCard(gateway, brainTreeCardToken, callback){
    //console.log('000-----'+brainTreeCardToken);
    gateway.creditcard.delete(brainTreeCardToken, function (err, result) {
      console.log(result);
      if(err){
        callback(err);
        return;
      }else{
          if (result.success) {   
              ///code to be dump in database
              callback(null,result);                                               
          }else {
              callback(result.message);
          }
      }
      
    });
}

function getCard(gateway, brainTreeCardToken, callback){
    console.log('000-----'+brainTreeCardToken);
    gateway.creditcard.find(brainTreeCardToken, function (err, result) {
      console.log(result);
      if(err){
        callback(err);
        return;
      }else{
          if (result.success) {   
              ///code to be dump in database
              callback(null,result);                                               
          }else {
              callback(result.message);
          }
      }
      
    });
}

module.exports = new PaymentController();
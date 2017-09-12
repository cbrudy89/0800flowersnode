//'use strict';
var express = require('express');
var config = require('./config');
var async = require('async');
var Sync = require('sync');
var dbModel = require('./api/models/db-model');
var commonHelper = require('./api/helpers/common-helper');

function cronjobs() {
  // Update currency exchange rate
  this.updateExchangeRate = function(){
        commonHelper.getCurrencyDetails(null,null, function(error, $currencyLists){
        	if(error){
	            callback(error)
	        }else{
	        	Sync(function(){
		        	for (i=0; i < $currencyLists.length; i++) {
			            if ($currencyLists[i].default_currency != 1) {
			                var exchange_rate = commonHelper.getCurrencyConverted.sync(null, $currencyLists[i].currency_code);

			                console.log(exchange_rate);
				          		
				        	var new_exchange_rate = exchange_rate.split(' ');
			                var data = {
			                	'exchange_rate': new_exchange_rate
			                };
			                
			                var resp = dbModel.save.sync(null, 'currency', data, $currencyLists[i].id);
		                	if(!resp){
		                		console.log('Unable to update row '+$currencyLists[i].id);
		                	}else{
		                		console.log('Record updated: '+$currencyLists[i].id+ ' with '+new_exchange_rate+' Old rate '+$currencyLists[i].exchange_rate);
		                	}
                            
					      
			            }
			        }
		    	});
			}
        });

        
  }
  // Submit Order XML
  this.updateSubmitXML = function(){
  	console.log('Running updateSubmitXML ');
  }
}

module.exports = new cronjobs();
//'use strict';

var express = require('express');
var argv = require('minimist')(process.argv.slice(2));
var bodyParser = require('body-parser');
var jwt= require("jsonwebtoken");

var app = express();
var subpath = express();
var router=express.Router();

app.use(bodyParser.urlencoded({extended:true}));

app.use(bodyParser.json());

var swagger = require("swagger-node-express").createNew(subpath);
app.use(express.static('api-docs'));

var db = require('./database');
var routes = require('./routes');

process.env.SECRET_KEY="thisismysecretkey";

db.init();
db.acquire(function(err, con){
	if(err) console.log(err);
	else {
		con.release();

		routes.configure(app, router);

		// Configure the API domain
		var domain = 'localhost';
		if(argv.domain !== undefined)
		    domain = argv.domain;
		else
		    console.log('No --domain=xxx specified, taking default hostname "localhost".')

		// Configure the API port
		var port = 8080;
		if(argv.port !== undefined)
		    port = argv.port;
		else
		    console.log('No --port=xxx specified, taking default port ' + port + '.')

		// Set and display the application URL
		var applicationUrl = 'http://' + domain + ':' + port;

		swagger.configure(applicationUrl, '1.0.0');

		app.listen(port, function(){
			console.log('0800Flowers API running on ' + applicationUrl);
		});
		
	}
});

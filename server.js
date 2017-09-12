//'use strict';
var compression = require('compression');
var express = require('express');
var argv = require('minimist')(process.argv.slice(2));
var bodyParser = require('body-parser');
var jwt= require("jsonwebtoken");
var config = require('./config');
var cron = require('node-cron');
var cronjobs = require('./cron');

var app = express();
var subpath = express();
var router=express.Router();

app.use(compression());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.urlencoded({extended:true}));

//app.use('/',router);

app.use(bodyParser.json());

var swagger = require("swagger-node-express").createNew(subpath);
app.use(express.static('api-docs'));
app.use('/img', express.static('public/uploads/'));

var db = require('./database');
var routes = require('./routes');

process.env.SECRET_KEY=config.SECRET_KEY; // Set secret key to be used for JWT token encryption.
process.env.SITE_LANGUAGE=config.SITE_LANGUAGE; // Setting default language to english

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
		var port = config.PORT;
		if(argv.port !== undefined)
		    port = argv.port;
		else
		    console.log('No --port=xxx specified, taking default port ' + port + '.')

		// Set and display the application URL
		var baseUrl = 'https://' + domain;
		var applicationUrl = baseUrl + ':' + port;

		config.BASE_URL = baseUrl;
		config.APPLICATION_URL = applicationUrl;
		//config.RESOURCE_URL = 'https://d2bk6p38au4j9k.cloudfront.net'+ '/img';
		config.RESOURCE_URL = 'https://dxbh2rxgl5xwb.cloudfront.net/';

		swagger.configure(applicationUrl, '1.0.0');

		app.listen(port, function(){
			console.log('0800Flowers API running on ' + applicationUrl);
			/*cron.schedule('* * * * * *', function(){
				//console.log('running a task every minute');
				cronjobs.updateExchangeRate();
				cronjobs.updateSubmitXML();  
			});*/

		});
		
		
	}
});

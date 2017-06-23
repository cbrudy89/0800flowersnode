var express = require('express');
var bodyParser = require('body-parser');
var jwt= require("jsonwebtoken");
var app = express();
var router=express.Router();

var db = require('./database');
var routes = require('./routes');

process.env.SECRET_KEY="thisismysecretkey";

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

routes.configure(app, router);

db.init();

app.listen(3000, function(){
	console.log('Server started at port *: 3000');
});
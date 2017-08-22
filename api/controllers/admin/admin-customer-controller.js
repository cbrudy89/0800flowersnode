var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var handlebars = require('handlebars');
var fs = require('fs');

var config = require('./../../../config');
var connection = require('./../../../database');
var commonHelper = require('./../../helpers/common-helper');
var fileHelper = require('./../../helpers/file-helper');
var base64Img = require('base64-img');
var notificationModel = require('./../../models/admin/notification-model');
var DbModel = require('./../../models/db-model');


var confirmed = status = 1;

function AdminCustomerController() {

    // List/Search Customers
    this.list = function(req, res) {

        if (req.decoded.role != config.ROLE_ADMIN) {
            res.status(config.HTTP_FORBIDDEN).send({
                status: config.ERROR,
                code: config.HTTP_FORBIDDEN,
                message: "You dont have permission to get all customers!"
            });
        } else {
            var customer_name = req.query.customer_name;
            var customer_email = req.query.customer_email;
        	var string='';
            var string1='';
            var queryString = 'Select email, first_name, last_name, profile_image, address, postal_code, country_id, province_id, city, day_phone, evening_phone, status from customers';

            if(customer_name != "" && customer_name != undefined){
                //string += " `first_name` like '%"+customer_name+"%' OR `last_name` like '%"+customer_name+"%'";
                string += " concat_ws(' ', first_name,last_name) like '%"+customer_name+"%'";
            }
            if(customer_email != "" && customer_email != undefined){
                string1 += " `email` like '%"+customer_email+"%'";
            }
            if(string != "" || string1 != ""){
                queryString += " WHERE ";
            }
            queryString += string;

            if(string != "" && string1 != ""){
                queryString += " AND ";
            }
            queryString += string1;

            DbModel.rawQuery(queryString, function(err, result) {
                if (err) {
                    res.status(config.HTTP_SERVER_ERROR).send({
                        status: config.ERROR,
                        code: config.HTTP_SERVER_ERROR,
                        message: "No records found"
                    });
                } else {
                    if (result.length > 0) {
                        res.status(config.HTTP_SUCCESS).send({
                            status: config.SUCCESS,
                            code: config.HTTP_SUCCESS,
                            message: "Customers found",
                            result: result
                        });
                    } else {
                        res.status(config.HTTP_BAD_REQUEST).send({
                            status: config.ERROR,
                            code: config.HTTP_BAD_REQUEST,
                            message: "Failed to get customers"
                        });
                    }
                }
            });
        }
    }

    // View Customer
    this.view = function(req, res) {
        if (req.decoded.role != config.ROLE_ADMIN) {
            res.status(config.HTTP_FORBIDDEN).send({
                status: config.ERROR,
                code: config.HTTP_FORBIDDEN,
                message: "You dont have permission to view Category!"
            });
        } else {
            var id = req.params.id;
            DbModel.findOne('customers', 'id', id, function(err, result) {
                if (err) {
                    res.status(config.HTTP_NOT_FOUND).send({
                        status: config.ERROR,
                        code: config.HTTP_NOT_FOUND,
                        message: "No records found"
                    });
                } else {
                    if (result.length > 0) {
                        res.status(config.HTTP_SUCCESS).send({
                            status: config.SUCCESS,
                            code: config.HTTP_SUCCESS,
                            message: "Categories found",
                            result: result
                        });
                    } else {
                        res.status(config.HTTP_BAD_REQUEST).send({
                            status: config.ERROR,
                            code: config.HTTP_BAD_REQUEST,
                            message: "Failed to get categories"
                        });
                    }
                }
            });
        }
    }

    // Add Customer
    this.create = function(req, res) {
        var data = req.body;

        if (req.decoded.role != config.ROLE_ADMIN) {
            res.status(config.HTTP_FORBIDDEN).send({
                status: config.ERROR,
                code: config.HTTP_FORBIDDEN,
                message: "You dont have permission to create customer!"
            });
        } else {

        	var confirmation_code = crypto.createHash('sha512').update(data.email).digest('hex');

            var currDate = new Date();
            var post = {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                password: '',
                address: data.address,
                profile_image: data.profile_image,
                country_id: data.country_id,
                province_id: data.province_id,
                city: data.city,
                postal_code: data.postal_code,
                confirmation_code: confirmation_code,
                created_at: currDate,
                updated_at: currDate
            };

            if(data.day_phone){
            	post.day_phone = data.day_phone;
            }
            if(data.evening_phone){
            	post.evening_phone = data.evening_phone;
            }

            if(!data.status){
            	post.status = 0;
            }

            DbModel.findOne('customers', 'email', post.email, function(err, result) {
                if (err) {
                    res.status(config.HTTP_SERVER_ERROR).send({
                        status: config.ERROR,
                        code: config.HTTP_SERVER_ERROR,
                        message: "Customer has been not inserted.",
                        errors: err
                    });
                } else {
                    if (result.length > 0 && result[0].id > 0) {
                        res.status(config.HTTP_ALREADY_EXISTS).send({
                            status: config.ERROR,
                            code: config.HTTP_ALREADY_EXISTS,
                            message: "The customer name has already been taken."
                        });
                    } else {
                        var customerImagePath = "public/uploads/customers";
                        if (post.profile_image) {
                            fileHelper.uploadImage(post.profile_image, customerImagePath, function(err, image) {
                                if (err) {
                                    res.status(config.HTTP_BAD_REQUEST).send({
                                        status: config.ERROR,
                                        code: config.HTTP_BAD_REQUEST,
                                        message: err
                                    });
                                } else {
                                    post.profile_image = image;
                                }
                            });
                        }

                        DbModel.save('customers', post, '', function(err, result) {
                            console.log(err)
                            console.log(result)
                            if (err) {
                                res.status(config.HTTP_SERVER_ERROR).send({
                                    status: config.ERROR,
                                    code: config.HTTP_SERVER_ERROR,
                                    message: 'Customer has been not register.'
                                });
                            } else {
                                if (err) {
                                    res.status(config.HTTP_SERVER_ERROR).send({
                                        status: config.ERROR,
                                        code: config.HTTP_SERVER_ERROR,
                                        message: 'Customer has been not register.'
                                    });
                                } else {

                                    notifyData = {
                                        'from_id': result.insertId,
                                        'to_id': 1,
                                        'type': 'Customer',
                                        'action': 'Register',
                                        'msg': 'New user (<i>' + post.first_name + ' ' + post.last_name + '</i>) has been registered',
                                        'status': '0',
                                        'details': "{'first_name': '" + post.first_name + "','last_name':'" + post.last_name + "','email':'" + post.email + "','user_id':'" + result.insertId + "'}",
                                        'created_at': currDate,
                                        'updated_at': currDate
                                    };

                                    // Save notification to table
                                    notificationModel.create(notifyData, function(err, result) {
                                        if (err) {
                                            res.status(config.HTTP_SERVER_ERROR).send({
                                                status: config.ERROR,
                                                code: config.HTTP_SERVER_ERROR,
                                                message: "Due to some error, customer is not registered yet. Please try again!"
                                            });
                                        } else {

                                            // Send on email
                                            fs.readFile(config.PROJECT_DIR + '/templates/invitation.html', {
                                                encoding: 'utf-8'
                                            }, function(err, html) {
                                                if (err) {
                                                    console.log(err);
                                                } else {

                                                    var template = handlebars.compile(html);
                                                    var replacements = {
                                                        first_name: post.first_name,
                                                        last_name: post.last_name,
                                                        site_url: config.SITE_URL+"/confirm?activation_code="+confirmation_code
                                                    };

                                                    var htmlToSend = template(replacements);
                                                    var mailOptions = {
                                                        from: config.ADMIN_FROM_EMAIL,
                                                        to: post.email,
                                                        subject: 'Invitation to join 1800flowers',
                                                        html: htmlToSend
                                                    };

                                                    smtpTransport = config.SMTP_TRANSPORT;
                                                    smtpTransport.sendMail(mailOptions, function(error, response) {
                                                        if (error) {
                                                            console.log(error);
                                                        } else {
                                                        	res.status(config.HTTP_SUCCESS).send({
                                                        	    status: config.SUCCESS,
                                                        	    code: config.HTTP_SUCCESS,
                                                        	    message: 'Customer register successfully.'
                                                        	});
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });
        }
    }

    // Update Customer
    this.update = function(req, res) {
        var data = req.body;

        if (req.decoded.role != config.ROLE_ADMIN) {
            res.status(config.HTTP_FORBIDDEN).send({
                status: config.ERROR,
                code: config.HTTP_FORBIDDEN,
                message: "You dont have permission to create customer!"
            });
        } else {
            var currDate = new Date();
            var id = req.body.id;
            var post = {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                address: data.address,
                profile_image: data.profile_image,
                country_id: data.country_id,
                province_id: data.province_id,
                city: data.city,
                postal_code: data.postal_code,
                updated_at: currDate
            };

            if(data.day_phone){
            	post.day_phone = data.day_phone;
            }
            if(data.evening_phone){
            	post.evening_phone = data.evening_phone;
            }

            if(data.status){
            	post.status = data.status;
            }

            DbModel.findOne('customers', 'id', id, function(err, result) {
                if (err) {
                    res.status(config.HTTP_SERVER_ERROR).send({
                        status: config.ERROR,
                        code: config.HTTP_SERVER_ERROR,
                        message: "Customer has been not updated.",
                        errors: err
                    });
                } else {
                    if (!result.length) {
                        res.status(config.HTTP_ALREADY_EXISTS).send({
                            status: config.ERROR,
                            code: config.HTTP_ALREADY_EXISTS,
                            message: "The customer not found."
                        });
                    } else {
                        var customerImagePath = "public/uploads/customers";
                        if (post.profile_image) {
                            fileHelper.uploadImage(post.profile_image, customerImagePath, function(err, image) {
                                if (err) {
                                    res.status(config.HTTP_BAD_REQUEST).send({
                                        status: config.ERROR,
                                        code: config.HTTP_BAD_REQUEST,
                                        message: err
                                    });
                                } else {
                                    post.profile_image = image;
                                }
                            });
                        } else {
                            if(result[0].profile_image) {
                                post.profile_image = result[0].profile_image;
                            }
                        }

                        DbModel.save('customers', post, id, function(err, result) {
                            console.log(err)
                            if (err) {
                                res.status(config.HTTP_SERVER_ERROR).send({
                                    status: config.ERROR,
                                    code: config.HTTP_SERVER_ERROR,
                                    message: 'Customer has been not updated.'
                                });
                            } else {
                                res.status(config.HTTP_SUCCESS).send({
                                    status: config.SUCCESS,
                                    code: config.HTTP_SUCCESS,
                                    message: 'Customer has been updated successfully.'
                                });
                            }
                        });
                    }
                }
            });
        }
    }

    //Delete Customer
    this.delete = function(req, res) {

        if (req.decoded.role != config.ROLE_ADMIN) {
            res.status(config.HTTP_FORBIDDEN).send({
                status: config.ERROR,
                code: config.HTTP_FORBIDDEN,
                message: "You dont have permission to delete customer!"
            });
        } else {
            var id = req.body.id;
            DbModel.findOne('customers', 'id', id, function(err, result) {
                if (err) {
                    res.status(config.HTTP_SERVER_ERROR).send({
                        status: config.ERROR,
                        code: config.HTTP_SERVER_ERROR,
                        message: 'There are some error with query'
                    })
                } else {
                    if (!result.length) {
                        res.status(config.HTTP_ALREADY_EXISTS).send({
                            status: config.ERROR,
                            code: config.HTTP_ALREADY_EXISTS,
                            message: "The customer not found."
                        });
                    } else {
                        var cond = [
                          { 'id' : { 'val': id, 'cond': '='} }
                        ];
                        DbModel.delete('customers', cond, function(error, result) {
                            if (error) {
                                res.status(config.HTTP_SERVER_ERROR).send({
                                    status: config.ERROR,
                                    code: config.HTTP_SERVER_ERROR,
                                    message: 'Unable to delete customer.'
                                });
                            } else {
                                res.status(config.HTTP_SUCCESS).send({
                                    status: config.SUCCESS,
                                    code: config.HTTP_SUCCESS,
                                    message: 'Customer deleted successfully.'
                                });
                            }
                        });
                    }
                }
            });
        }
    }
}

module.exports = new AdminCustomerController();
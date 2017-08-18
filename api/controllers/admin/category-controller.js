var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var config = require('./../../../config');
var connection = require('./../../../database');
var DbModel = require('./../../models/db-model');
var fs = require('fs');
var commonHelper = require('./../../helpers/common-helper');
var fileHelper = require('./../../helpers/file-helper');

function CategoryController() {

    //List Category
    this.list = function(req,res){

        if(req.decoded.role != config.ROLE_ADMIN){
          res.status(config.HTTP_FORBIDDEN).send({
            status: config.ERROR,
            code : config.HTTP_FORBIDDEN,
            message: "You dont have permission to get all categories!"
          });
        } else {
            DbModel.find('categories', '', '', '', '', function(err, result) {
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
                            message:"Categories found",
                            result:result
                        });
                    }else{
                        res.status(config.HTTP_BAD_REQUEST).send({
                            status:config.ERROR,
                            code: config.HTTP_BAD_REQUEST,
                            message:"Failed to get categories"
                        });
                    }
                }
            });
        }
    }

    // View Main Category
    this.view = function(req, res) {
        if (req.decoded.role != config.ROLE_ADMIN) {
            res.status(config.HTTP_FORBIDDEN).send({
                status: config.ERROR,
                code: config.HTTP_FORBIDDEN,
                message: "You dont have permission to view Category!"
            });
        } else {
            var id = req.params.id;
            DbModel.findOne('categories', 'id', id, function(err, result) {
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

    // Add Main Category
    this.create = function(req, res) {
        var data = req.body;

        if (req.decoded.role != config.ROLE_ADMIN) {
            res.status(config.HTTP_FORBIDDEN).send({
                status: config.ERROR,
                code: config.HTTP_FORBIDDEN,
                message: "You dont have permission to create category!"
            });
        } else {
            var currDate = new Date();
            var post = {
                name: data.name,
                description: data.description,
                description_fr: data.description_fr,
                description_es: data.description_es,
                description_de: data.description_de,
                banner: data.banner,
                page_title: data.page_title,
                meta_keywords: data.meta_keywords,
                meta_description: data.meta_description,
                parent_id: data.parent_id,
                active: data.active,
                created_at: currDate,
                updated_at: currDate
            };

            Object.keys(post).forEach(function(key) {
                if(!post[key]){
                    if(key == 'active' || key == 'parent_id'){
                        post[key] = 0;
                    } else {
                        post[key] = '';
                    }
                }
            });

            DbModel.findOne('categories', 'name', post.name, function(err, result) {
                if (err) {
                    res.status(config.HTTP_SERVER_ERROR).send({
                        status: config.ERROR,
                        code: config.HTTP_SERVER_ERROR,
                        message: "Category has been not inserted.",
                        errors: err
                    });
                } else {
                    if (result.length > 0 && result[0].id > 0) {
                        res.status(config.HTTP_ALREADY_EXISTS).send({
                            status: config.ERROR,
                            code: config.HTTP_ALREADY_EXISTS,
                            message: "The category name has already been taken."
                        });
                    } else {
                        var categoryImagePath = "public/uploads/category";
                        if (post.banner) {
                            fileHelper.uploadImage(post.banner, categoryImagePath, function(err, image) {
                                if (err) {
                                    res.status(config.HTTP_BAD_REQUEST).send({
                                        status: config.ERROR,
                                        code: config.HTTP_BAD_REQUEST,
                                        message: err
                                    });
                                } else {
                                    post.banner = image;
                                }
                            });
                        }

                        DbModel.save('categories', post, '', function(err, result) {
                            console.log(err)
                            if (err) {
                                res.status(config.HTTP_SERVER_ERROR).send({
                                    status: config.ERROR,
                                    code: config.HTTP_SERVER_ERROR,
                                    message: 'Category has been not inserted.'
                                });
                            } else {
                                res.status(config.HTTP_SUCCESS).send({
                                    status: config.SUCCESS,
                                    code: config.HTTP_SUCCESS,
                                    message: 'Category has been inserted successfully.'
                                });
                            }
                        });
                    }
                }
            });
        }
    }

    // Update Main Category
    this.update = function(req, res) {
        var data = req.body;

        if (req.decoded.role != config.ROLE_ADMIN) {
            res.status(config.HTTP_FORBIDDEN).send({
                status: config.ERROR,
                code: config.HTTP_FORBIDDEN,
                message: "You dont have permission to create category!"
            });
        } else {
            var currDate = new Date();
            var id = req.body.id;
            var post = {
                name: data.name,
                description: data.description,
                description_fr: data.description_fr,
                description_es: data.description_es,
                description_de: data.description_de,
                banner: data.banner,
                page_title: data.page_title,
                meta_keywords: data.meta_keywords,
                meta_description: data.meta_description,
                parent_id: data.parent_id,
                active: data.active,
                updated_at: currDate
            };

            Object.keys(post).forEach(function(key) {
                if(!post[key]){
                    if(key == 'active' || key == 'parent_id'){
                        post[key] = 0;
                    } else {
                        post[key] = '';
                    }
                }
            });
            DbModel.findOne('categories', 'id', id, function(err, result) {
                if (err) {
                    res.status(config.HTTP_SERVER_ERROR).send({
                        status: config.ERROR,
                        code: config.HTTP_SERVER_ERROR,
                        message: "Category has been not updated.",
                        errors: err
                    });
                } else {
                    if (!result.length) {
                        res.status(config.HTTP_ALREADY_EXISTS).send({
                            status: config.ERROR,
                            code: config.HTTP_ALREADY_EXISTS,
                            message: "The category not found."
                        });
                    } else {
                        var categoryImagePath = "public/uploads/category";
                        if (post.banner) {
                            fileHelper.uploadImage(post.banner, categoryImagePath, function(err, image) {
                                if (err) {
                                    res.status(config.HTTP_BAD_REQUEST).send({
                                        status: config.ERROR,
                                        code: config.HTTP_BAD_REQUEST,
                                        message: err
                                    });
                                } else {
                                    post.banner = image;
                                }
                            });
                        } else {
                            if(result[0].banner) {
                                post.banner = result[0].banner;
                            }
                        }

                        DbModel.save('categories', post, id, function(err, result) {
                            console.log(err)
                            if (err) {
                                res.status(config.HTTP_SERVER_ERROR).send({
                                    status: config.ERROR,
                                    code: config.HTTP_SERVER_ERROR,
                                    message: 'Category has been not updated.'
                                });
                            } else {
                                res.status(config.HTTP_SUCCESS).send({
                                    status: config.SUCCESS,
                                    code: config.HTTP_SUCCESS,
                                    message: 'Category has been updated successfully.'
                                });
                            }
                        });
                    }
                }
            });
        }
    }

    // Delete Main Category
    this.delete = function(req, res) {

        if (req.decoded.role != config.ROLE_ADMIN) {
            res.status(config.HTTP_FORBIDDEN).send({
                status: config.ERROR,
                code: config.HTTP_FORBIDDEN,
                message: "You dont have permission to delete category!"
            });
        } else {
            var id = req.body.id;
            DbModel.findOne('categories', 'id', id, function(err, result) {
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
                            message: "The category not found."
                        });
                    } else {
                        var cond = [
                          { 'id' : { 'val': id, 'cond': '='} }
                        ];
                        DbModel.delete('categories', cond, function(error, result) {
                            if (error) {
                                res.status(config.HTTP_SERVER_ERROR).send({
                                    status: config.ERROR,
                                    code: config.HTTP_SERVER_ERROR,
                                    message: 'Unable to delete category.'
                                });
                            } else {
                                res.status(config.HTTP_SUCCESS).send({
                                    status: config.SUCCESS,
                                    code: config.HTTP_SUCCESS,
                                    message: 'Category deleted successfully.'
                                });
                            }
                        });
                    }
                }
            });
        }
    }

};

module.exports = new CategoryController();
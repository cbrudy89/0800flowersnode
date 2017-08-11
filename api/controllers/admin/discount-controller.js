var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var config = require('./../../../config');
var connection = require('./../../../database');
//var userHelper = require('./../helpers/user-helper');
var DiscountModel = require('./../../models/admin/discount-model');

function DiscountsController() {

    // get all promo-codes
    this.getPromoCodes = function(req, res) {
        if (req.decoded.role != config.ROLE_ADMIN) {
            res.status(config.HTTP_FORBIDDEN).send({
                status: config.ERROR,
                code: config.HTTP_FORBIDDEN,
                message: "You dont have permission to get promo code!"
            });
        } else {

            var query = req.query;
            var cond = [];

            if (query.discount_code != "" && query.discount_code != undefined) {
                cond.push({
                    'discount_code': query.discount_code
                });
            }
            if (query.discount_value != "" && query.discount_value != undefined) {
                cond.push({
                    'discount_value': query.discount_value
                });
            }
            if (query.limit_usage_by != "" && query.limit_usage_by != undefined) {
                cond.push({
                    'limit_usage_by': query.limit_usage_by
                });
            }
            if (query.start_date != "" && query.start_date != undefined) {
                cond.push({
                    'start_date': query.start_date
                });
            }
            if (query.expiry_date != "" && query.expiry_date != undefined) {
                cond.push({
                    'expiry_date': query.expiry_date
                });
            }

            DiscountModel.getPromoCodes(cond, function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    res.status(config.HTTP_SUCCESS).send({
                        status: config.SUCCESS,
                        code: config.HTTP_SUCCESS,
                        message: 'all promo codes found',
                        data: result
                    });
                }
            });
        } // else close
    }

    // Create new promo-code
    this.createPromoCode = function(req, res) {
        var data = req.body;
        var curr_date = new Date();

        if (req.decoded.role != config.ROLE_ADMIN) {
            res.status(config.HTTP_FORBIDDEN).send({
                status: config.ERROR,
                code: config.HTTP_FORBIDDEN,
                message: "You dont have permission to create promo code!"
            });
        } else {
            // Insert into promo code table
            var promoCodeData = {
                'country_id': data.country_id,
                'discount_code': data.discount_code,
                'discount_type': data.discount_type,
                'discount_format': data.discount_format,
                'discount_value': data.discount_value,
                'discount_value_type': data.discount_value_type,
                'limit_usage_by': data.limit_usage_by,
                'apply_on': data.apply_on,
                'discount_apply_on': data.discount_apply_on,
                'status': data.status,
                'start_date': data.start_date,
                'expiry_date': data.expiry_date,
                'created_at': curr_date,
                'updated_at': curr_date,
            };

            if (data.discount_apply_on == '1') {
                promoCodeData.product_sku = data.product_sku;
            }

            if (data.discount_apply_on == '3') {
                promoCodeData.fixed_amount = data.fixed_amount;
            }

            DiscountModel.createPromoCode(promoCodeData, function(err, result) {
                //console.log(err);
                if (err) {
                    console.log(err);
                } else {
                    res.status(config.HTTP_SUCCESS).send({
                        status: config.SUCCESS,
                        code: config.HTTP_SUCCESS,
                        message: 'Promo Code has been created',
                    });
                }
            });

        }
    }


    // Update Promo Code
    this.updatePromoCode = function(req, res) {
        var data = req.body;
        if (req.decoded.role != config.ROLE_ADMIN) {
            res.status(config.HTTP_FORBIDDEN).send({
                status: config.ERROR,
                code: config.HTTP_FORBIDDEN,
                message: "You dont have permission to update promo code!"
            });
        } else {
            var id = data.id;

            var curr_date = new Date();

            var promoCodeData = {
                'country_id': data.country_id,
                'discount_code': data.discount_code,
                'discount_type': data.discount_type,
                'discount_format': data.discount_format,
                'discount_value': data.discount_value,
                'discount_value_type': data.discount_value_type,
                'limit_usage_by': data.limit_usage_by,
                'apply_on': data.apply_on,
                'discount_apply_on': data.discount_apply_on,
                'status': data.status,
                'start_date': data.start_date,
                'expiry_date': data.expiry_date,
                'updated_at': curr_date
            };

            if (data.discount_apply_on == '1') {
                promoCodeData.product_sku = data.product_sku;
            }

            if (data.discount_apply_on == '3') {
                promoCodeData.fixed_amount = data.fixed_amount;
            }

            DiscountModel.checkPromoCode(promoCodeData, id, function(err, result) {
                //console.log(err);
                if (result.length > 0 && result[0].id > 0) {
                    res.status(config.HTTP_ALREADY_EXISTS).send({
                        status: config.ERROR,
                        code: config.HTTP_ALREADY_EXISTS,
                        message: "The specified promo code already exists."
                    });
                } else {
                    DiscountModel.updatePromoCode(promoCodeData, id, function(err, result) {
                        //console.log(err);
                        if (err) {
                            console.log(err);
                        } else {
                            res.status(config.HTTP_SUCCESS).send({
                                status: config.SUCCESS,
                                code: config.HTTP_SUCCESS,
                                message: 'Promo Code has been updated',
                            });
                        }
                    });
                }
            });
        }
    }

    // Delete promo code
    this.deletePromoCode = function(req, res) {

        if (req.decoded.role != config.ROLE_ADMIN) {
            res.status(config.HTTP_FORBIDDEN).send({
                status: config.ERROR,
                code: config.HTTP_FORBIDDEN,
                message: "You dont have permission to delete promo code!"
            });
        } else {

            var id = req.body.id;
            //console.log("id-"+id);
            DiscountModel.checkDeletePromoCode(id, function(err, result) {
                // console.log(result);
                if (!result.length) {
                    res.status(config.HTTP_NOT_FOUND).send({
                        status: config.ERROR,
                        code: config.HTTP_NOT_FOUND,
                        message: "The specified promo code not found."
                    });
                } else {
                    DiscountModel.deletePromoCode(id, function(err, result) {
                        //console.log(err);
                        if (err) {
                            console.log('test' + err);
                        } else {
                            res.status(config.HTTP_SUCCESS).send({
                                status: config.SUCCESS,
                                code: config.HTTP_SUCCESS,
                                message: 'Promo Code has been deleted',
                            });
                        }
                    });
                }
            });

        } // else close

    }

    // Get Promo Code Information
    this.getPromoCode = function(req, res) {
        var id = req.params.id;

        connection.acquire(function(err, con) {
            if (err) {
                res.send({
                    status: 1,
                    message: err
                });
            }

            con.query('select * from discounts where id = ?', [id], function(err, result) {
                if (err) {
                    res.send({
                        status: 1,
                        message: 'Failed to get'
                    });
                } else {
                    if (result.length > 0) {
                        res.send({
                            status: 0,
                            message: 'promo code found!',
                            response: result
                        });
                    } else {
                        res.send({
                            status: 1,
                            message: 'Failed to get promo code'
                        });
                    }
                }
                con.release();
            });
        });
    };

    //get all restrict promo-codes
    this.getRestrictPromoCodes = function(req, res) {
        if (req.decoded.role != config.ROLE_ADMIN) {
            res.status(config.HTTP_FORBIDDEN).send({
                status: config.ERROR,
                code: config.HTTP_FORBIDDEN,
                message: "You dont have permission to get resticted promo codes!"
            });
        } else {

            var query = req.query;
            var cond = [];

            if (query.promo_code != "" && query.promo_code != undefined) {
                cond.push({
                    'promo_code': query.promo_code
                });
            }
            if (query.country_id != "" && query.country_id != undefined) {
                cond.push({
                    'country_id': query.country_id
                });
            }
            if (query.vendor_id != "" && query.vendor_id != undefined) {
                cond.push({
                    'vendor_id': query.vendor_id
                });
            }


            DiscountModel.getRestrictPromoCodes(cond, function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    res.status(config.HTTP_SUCCESS).send({
                        status: config.SUCCESS,
                        code: config.HTTP_SUCCESS,
                        message: 'all restricted promo codes found',
                        data: result
                    });
                }
            });
        } // else close
    }

    // Create new restrict promo-code
    this.createRestrictPromoCode = function(req, res) {
        var data = req.body;

        if (req.decoded.role != config.ROLE_ADMIN) {
            res.status(config.HTTP_FORBIDDEN).send({
                status: config.ERROR,
                code: config.HTTP_FORBIDDEN,
                message: "You dont have permission to create promo code!"
            });
        } else {
            var curr_date = new Date();
            // Insert into restricted promo codes table
            var restrictPromoCodeData = {
                'country_id': data.country_id,
                'vendor_id': data.vendor_id,
                'promo_code': data.promo_code,
                'status': data.status,
                'created_at': curr_date,
                'updated_at': curr_date,
            };

            if(data.description) {
              restrictPromoCodeData.description = data.description;
            } else {
              restrictPromoCodeData.description = '';
            }

            var productIds = data.product_ids;

            if (!productIds.isArray) {
                productIds = productIds.split(',');
            }

            DiscountModel.createRestrictPromoCode(restrictPromoCodeData, function(err, result) {
                //console.log(err);
                if (result.length > 0 && result[0].id > 0) {
                    res.status(config.HTTP_ALREADY_EXISTS).send({
                        status: config.ERROR,
                        code: config.HTTP_ALREADY_EXISTS,
                        message: "The specified promo code already exists."
                    });
                } else {
                    var id = result.insertId;
                    DiscountModel.createRestrictProducts(productIds, id, function(err, result) {
                        //console.log(err);
                        if (err) {
                            console.log(err);
                        } else {
                            res.status(config.HTTP_SUCCESS).send({
                                status: config.SUCCESS,
                                code: config.HTTP_SUCCESS,
                                message: 'Restricted Promo Code has been created',
                            });
                        }
                    });
                }
            });

        }
    }

     // Update Promo Code
    this.updateRestrictPromoCode = function(req, res) {
        var data = req.body;

        if (req.decoded.role != config.ROLE_ADMIN) {
            res.status(config.HTTP_FORBIDDEN).send({
                status: config.ERROR,
                code: config.HTTP_FORBIDDEN,
                message: "You dont have permission to update promo code!"
            });
        } else {

            var id = data.id;
            // Insert into restricted promo codes table
            var restrictPromoCodeData = {
                'country_id': data.country_id,
                'vendor_id': data.vendor_id,
                'promo_code': data.promo_code,
                'status': data.status,
            };

            if(data.description) {
              restrictPromoCodeData.description = data.description;
            } else {
              restrictPromoCodeData.description = '';
            }

            var productIds = data.product_ids;

            if (!productIds.isArray) {
                productIds = productIds.split(',');
            }

            DiscountModel.checkRestrictedPromoCode(id, function(err, result) {
                //console.log(err);
                if (!result.length) {
                    res.status(config.HTTP_NOT_FOUND).send({
                        status: config.ERROR,
                        code: config.HTTP_NOT_FOUND,
                        message: "The specified restrict promo code not found."
                    });
                } else {
                    DiscountModel.updateRestrictPromoCode(restrictPromoCodeData, id, function(err, result) {
                        //console.log(err);
                        if (err) {
                            console.log(err);
                        } else {
                          DiscountModel.updateRestrictProducts(productIds, id, function(err, result) {
                              //console.log(err);
                              if (err) {
                                  console.log(err);
                              } else {
                                  res.status(config.HTTP_SUCCESS).send({
                                      status: config.SUCCESS,
                                      code: config.HTTP_SUCCESS,
                                      message: 'Restricted Promo Code has been updated',
                                  });
                              }
                          });
                        }
                    });
                }
            });
        }
    }

    // Delete promo code
    this.deleteRestrictPromoCode = function(req, res) {

        if (req.decoded.role != config.ROLE_ADMIN) {
            res.status(config.HTTP_FORBIDDEN).send({
                status: config.ERROR,
                code: config.HTTP_FORBIDDEN,
                message: "You dont have permission to delete promo code!"
            });
        } else {

            var id = req.body.id;
            //console.log("id-"+id);
            DiscountModel.checkRestrictedPromoCode(id, function(err, result) {
                // console.log(result);
                if (!result.length) {
                    res.status(config.HTTP_NOT_FOUND).send({
                        status: config.ERROR,
                        code: config.HTTP_NOT_FOUND,
                        message: "The specified promo code not found."
                    });
                } else {
                    DiscountModel.deleteRestrictPromoCode(id, function(err, result) {
                        //console.log(err);
                        if (err) {
                            console.log('test' + err);
                        } else {
                              DiscountModel.deleteRestrictProducts(id, function(err, result) {
                                  //console.log(err);
                                  if (err) {
                                      console.log('test' + err);
                                  } else {
                                      res.status(config.HTTP_SUCCESS).send({
                                          status: config.SUCCESS,
                                          code: config.HTTP_SUCCESS,
                                          message: 'Promo Code has been deleted',
                                      });
                                  }
                              });
                        }
                    });

                }
            });
        } // else close
    }
}

module.exports = new DiscountsController();
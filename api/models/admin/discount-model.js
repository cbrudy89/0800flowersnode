var config = require('./../../../config');
var connection = require('./../../../database');
var async = require('async');

function discountModel() {

    this.getPromoCodes = function(conditions, callback) {
        connection.acquire(function(err, con) {
            if (err) {
                callback(err);
            } else {
                var queryString = "SELECT * FROM discounts";

                if (conditions.length) {
                    var len = conditions.length;
                    var i = 1;

                    queryString += " WHERE ";

                    conditions.forEach(function(item, index) {
                        for (var key in item) {
                            if (key == 'discount_code') {
                                queryString += "`discount_code` like '%" + item[key] + "%'";
                            } else {
                                queryString += "`" + key + "` = '" + item[key] + "'";
                            }
                            if (i < len) {
                                queryString += " AND ";
                                i++;
                            }
                        }
                    });
                }

                con.query(queryString, function(err, results) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, results);
                    }
                    con.release();
                });
            }
        });
    }

    this.checkPromoCode = function(data, id, callback) {
        connection.acquire(function(err, con) {
            if (err) {
                callback(err);
            } else {
                // Checking if promo code already exist in database
                con.query('SELECT id FROM discounts WHERE discount_code = ? AND id <> ?', [data.discount_code, id], function(err, result) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, result);
                    }
                    con.release();
                });

            }
        });
    }

    this.createPromoCode = function(data, callback) {
        connection.acquire(function(err, con) {
            if (err) {
                callback(err);
            } else {
                //Create promo code
                con.query('INSERT INTO discounts SET ?', data, function(err, results) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, results);
                    }
                });
            }
        });
    }

    this.updatePromoCode = function(data, id, callback) {
        connection.acquire(function(err, con) {
            if (err) {
                callback(err);
            } else {
                var discountApplyOn = '';
                if (data.discount_apply_on == '1') {
                    discountApplyOn += "`product_sku` = '" + data.product_sku + "'";
                }

                if (data.discount_apply_on == '3') {
                    discountApplyOn += "`fixed_amount` = '" + data.fixed_amount + "'";
                }
                // updating promo code.
                con.query("Update `discounts` set `discount_code` = '" + data.discount_code + "', `discount_type` = '" + data.discount_type + "', `discount_format` = '" + data.discount_format + "', `discount_value` = '" + data.discount_value + "', `discount_value_type` = '" + data.discount_value_type + "', `apply_on` = '" + data.apply_on + "', `discount_apply_on` = '" + data.discount_apply_on + "', " + discountApplyOn + ", `limit_usage_by` = '" + data.limit_usage_by + "', `status` = '" + data.status + "', `start_date` = '" + data.start_date + "', `expiry_date` = '" + data.expiry_date + "' where id='" + id + "'", function(err, results) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, results);
                    }
                });
            }
        });
    }

    this.checkDeletePromoCode = function(id, callback) {
        connection.acquire(function(err, con) {
            if (err) {
                callback(err);
            } else {
                // Checking if promo code already exist in database
                con.query('SELECT id FROM discounts WHERE id = ?', [id], function(err, result) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, result);
                    }
                    con.release();
                });

            }
        });
    }

    this.deletePromoCode = function(id, callback) {
        connection.acquire(function(err, con) {
            if (err) {
                callback(err);
            } else {
                // Deleting promo code
                con.query("Delete from `discounts` where id=?", [id], function(err, results) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, results);
                    }
                });
            }
        });
    }

    this.getRestrictPromoCodes = function(conditions, callback) {
        connection.acquire(function(err, con) {
            if (err) {
                callback(err);
            } else {
                var queryString = "SELECT * FROM restrict_promo_codes";

                if (conditions.length) {
                    var len = conditions.length;
                    var i = 1;

                    queryString += " WHERE ";

                    conditions.forEach(function(item, index) {
                        for (var key in item) {
                            queryString += "`" + key + "` = '" + item[key] + "'";

                            if (i < len) {
                                queryString += " AND ";
                                i++;
                            }
                        }
                    });
                }

               // console.log(queryString);

                con.query(queryString, function(err, results) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, results);
                    }
                    con.release();
                });
            }
        });
    }

    this.createRestrictPromoCode = function(data, callback) {
        connection.acquire(function(err, con) {
            if (err) {
                callback(err);
            } else {
                //Create promo code
                con.query('INSERT INTO restrict_promo_codes SET ?', data, function(err, results) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, results);
                    }
                });
            }
        });
    }

    this.createRestrictProducts = function(productIds, id, callback) {
        //console.log(productIds);
        connection.acquire(function(err, con) {
            if (err) {
                callback(err);
            } else {

                var records = [];

                async.each(productIds, function(product_id, productCallback){
                    var data = [id, product_id];
                    records.push(data);
                    productCallback();
                }, function(){
                  var sql = "INSERT INTO restrict_product_list (restrict_id, product_id) VALUES ?";
                  //Create promo code
                  con.query(sql, [records], function(err, results) {
                      if (err) {
                          callback(err);
                      } else {
                          callback(null, results);
                      }
                  });
                });
            }
        });
    }

    this.checkRestrictedPromoCode = function(id, callback) {
        connection.acquire(function(err, con) {
            if (err) {
                callback(err);
            } else {
                // Checking if promo code already exist in database
                con.query('SELECT id FROM restrict_promo_codes WHERE id = ?', [id], function(err, result) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, result);
                    }
                    con.release();
                });

            }
        });
    }

    this.updateRestrictPromoCode = function(data, id, callback) {
        connection.acquire(function(err, con) {
            if (err) {
                callback(err);
            } else {
                // updating promo code.
                con.query("Update `restrict_promo_codes` set `promo_code` = '" + data.promo_code + "', `country_id` = '" + data.country_id + "', `vendor_id` = '" + data.vendor_id + "', `description` = '" + data.description + "', `status` = '" + data.status + "' where id='" + id + "'", function(err, results) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, results);
                    }
                    con.release();
                });
            }
        });
    }

    this.updateRestrictProducts = function(productIds, id, callback) {
        var that = this;
        connection.acquire(function(err, con) {
            if (err) {
                callback(err);
            } else {
                // Checking if promo code already exist in database
                con.query('SELECT product_id FROM restrict_product_list WHERE restrict_id = ?', [id], function(err, result) {
                    if (err) {
                        callback(err);
                    } else {
                        var restrictProductList = result;
                    async.each(restrictProductList, function(product, productCallback){
                           if(productIds.indexOf(product.product_id) > -1){
                                delete productIds[productIds.indexOf(product.product_id)];
                           } else {
                                var query = "Delete from `restrict_product_list` WHERE restrict_id = '" + id + "' AND product_id = '" + product.product_id + "'";
                              con.query(query);
                           }
                           productCallback();
                    }, function(){
                            that.createRestrictProducts(productIds, id, function(err, results){
                              callback(null, results);
                            });
                            con.release();
                    });
                    }
                });
            }
        });
    }

    this.deleteRestrictPromoCode = function(id, callback) {
        connection.acquire(function(err, con) {
            if (err) {
                callback(err);
            } else {
                // Deleting promo code
                con.query("Delete from `restrict_promo_codes` where id=?", [id], function(err, results) {
                    if (err) {
                        callback(err);
                    } else {
                     // console.log("results")
                     // console.log(results)
                        callback(null, results);
                    }
                });
            }
        });
    }

    this.deleteRestrictProducts = function(id, callback) {
        connection.acquire(function(err, con) {
            if (err) {
                callback(err);
            } else {
                // Deleting restrict product
                con.query("Delete from `restrict_product_list` where restrict_id=?", [id], function(err, results) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, results);
                    }
                });
            }
        });
    }
}

module.exports = new discountModel();
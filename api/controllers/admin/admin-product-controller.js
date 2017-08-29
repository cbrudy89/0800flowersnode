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
var DbModel = require('./../../models/db-model');
var async = require('async');

var confirmed = status = 1;

function adminProductController() {

    // List Products
    this.list = function(req, res) {

        if (req.decoded.role != config.ROLE_ADMIN) {
            res.status(config.HTTP_FORBIDDEN).send({
                status: config.ERROR,
                code: config.HTTP_FORBIDDEN,
                message: "You dont have permission to get all products!"
            });
        } else {
            var queryString = 'SELECT * FROM products'
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
                            message: "Products found",
                            result: result
                        });
                    } else {
                        res.status(config.HTTP_BAD_REQUEST).send({
                            status: config.ERROR,
                            code: config.HTTP_BAD_REQUEST,
                            message: "Failed to get products"
                        });
                    }
                }
            });
        }
    }

    //Search Products
    this.search = function(req, res) {
        var query = req.query;
        console.log(query)
        if (req.decoded.role != config.ROLE_ADMIN) {
            res.status(config.HTTP_FORBIDDEN).send({
                status: config.ERROR,
                code: config.HTTP_FORBIDDEN,
                message: "You dont have permission to get all products!"
            });
        } else {
            //var currDate = new Date().toISOString().split('T')[0];
            var joinClause = '';
            var whereClause = "where 1=1 ";

            if (query.product_name) {
                joinClause += "inner join `language_product` on `language_product`.`product_id` = `products`.`id` ";
                whereClause += "and `language_product`.`product_name` LIKE '%" + query.product_name + "%' ";
            }

            if (query.product_code) {
                whereClause += "and `products`.`product_code` = " + query.product_code + " ";
            }

            if (query.search_start_dt && query.search_end_dt) {
                var startDate = new Date(query.search_start_dt).toISOString().split('T')[0];
                var endDate = new Date(query.search_end_dt).toISOString().split('T')[0];
                whereClause += "and `products`.`created_at` between " + startDate + " and " + endDate + " ";
            }

            if (query.search_delivery_days) {
                whereClause += "and `products`.`delivery_method_id` = " + query.search_delivery_days + " ";
            }

            if (query.search_admin_status) {
                whereClause += "and `products`.`admin_confirm` = " + query.search_admin_status + " ";
            }

            if (query.search_vendor) {
                joinClause += "inner join `vendor` on `vendor`.`id` = `products`.`vendor_id` ";
                whereClause += "and `products`.`vendor_id` = " + query.search_vendor + " ";
            }

            if (query.search_categories) {
                joinClause += "inner join `category_product` on `category_product`.`product_id` = `products`.`id` ";
                whereClause += "and `category_product`.`category_id` = " + query.search_categories + " ";
            }

            if (query.search_country) {
                joinClause += "inner join `location_product` on `location_product`.`product_id` = `products`.`id` ";
                whereClause += "and `location_product`.`country_id` = " + query.search_country + " ";
            }

            if (query.search_occasions) {
                joinClause += "inner join `occasion_product` on `occasion_product`.`product_id` = `products`.`id` ";
                whereClause += "and `occasion_product`.`occasion_id` = " + query.search_occasions + " ";
            }

            if (query.search_color) {
                joinClause += "left join `color_product` on `color_product`.`product_id` = `products`.`id` ";
                joinClause += "left join `colors` on `colors`.`id` = `color_product`.`color_id` ";
                whereClause += "and `colors`.`id` = " + query.search_color + " ";
            }

            if (query.search_sympathy_type) {
                joinClause += "left join `sympathy_type_product` on `sympathy_type_product`.`product_id` = `products`.`id` ";
                joinClause += "left join `sympathy_types` on `sympathy_types`.`id` = `sympathy_type_product`.`sympathy_type_id` ";
                whereClause += "and `sympathy_types`.`id` = " + query.search_sympathy_type + " ";
            }

            if (query.search_flower_type) {
                joinClause += "left join `flower_type_product` on `flower_type_product`.`product_id` = `products`.`id` ";
                joinClause += "left join `flower_types` on `flower_types`.`id` = `flower_type_product`.`flower_type_id` ";
                whereClause += "and `flower_types`.`id` = " + query.search_flower_type + " ";
            }

            if (query.search_mixed_bouquet) {
                joinClause += "left join `mixed_bouquet_product` on `mixed_bouquet_product`.`product_id` = `products`.`id` ";
                joinClause += "left join `mixed_bouquets` on `mixed_bouquets`.`id` = `mixed_bouquet_product`.`mixed_bouquet_id` ";
                whereClause += "and `mixed_bouquets`.`id` = " + query.search_mixed_bouquet + " ";
            }

            if (query.search_price_from && query.search_price_to) {
                joinClause += "inner join `product_prices` on `product_prices`.`product_id` = `products`.`id` ";
                whereClause += "and `product_prices`.`price_value` between " + query.search_price_from + " and " + query.search_price_to + " ";
            }

            whereClause += "group by `products`.`id`";

            var queryString = "select products.* from `products` " + joinClause + "" + whereClause;
            console.log(queryString)
            DbModel.rawQuery(queryString, function(err, result) {
                console.log(err)
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
                            message: "Products found",
                            result: result
                        });
                    } else {
                        res.status(config.HTTP_BAD_REQUEST).send({
                            status: config.ERROR,
                            code: config.HTTP_BAD_REQUEST,
                            message: "Failed to get products"
                        });
                    }
                }
            });
        }
    }

    // View Product
    this.view = function(req, res) {
        if (req.decoded.role != config.ROLE_ADMIN) {
            res.status(config.HTTP_FORBIDDEN).send({
                status: config.ERROR,
                code: config.HTTP_FORBIDDEN,
                message: "You dont have permission to view Product!"
            });
        } else {
            var id = req.params.id;
            DbModel.findOne('products', 'id', id, function(err, result) {
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
                            message: "Products found",
                            result: result
                        });
                    } else {
                        res.status(config.HTTP_BAD_REQUEST).send({
                            status: config.ERROR,
                            code: config.HTTP_BAD_REQUEST,
                            message: "Failed to get products"
                        });
                    }
                }
            });
        }
    }

    // Update Product
    this.update = function(req, res) {
        var data = req.body;

        if (req.decoded.role != config.ROLE_ADMIN) {
            res.status(config.HTTP_FORBIDDEN).send({
                status: config.ERROR,
                code: config.HTTP_FORBIDDEN,
                message: "You dont have permission to create product!"
            });
        } else {
            var currDate = new Date();
            var id = req.body.id;
            DbModel.findOne('products', 'id', id, function(err, result) {
                if (err) {
                    res.status(config.HTTP_SERVER_ERROR).send({
                        status: config.ERROR,
                        code: config.HTTP_SERVER_ERROR,
                        message: "Product has been not updated.",
                        errors: err
                    });
                } else {
                    if (!result.length) {
                        res.status(config.HTTP_ALREADY_EXISTS).send({
                            status: config.ERROR,
                            code: config.HTTP_ALREADY_EXISTS,
                            message: "The product not found."
                        });
                    } else {

                        var post = {
                            vendor_id: data.vendor_id,
                            product_code: data.product_code,
                            atlas_product_name: data.atlas_product_name,
                            seo_description: data.seo_description,
                            seo_title: data.seo_title,
                            seo_keywords: data.seo_keywords,
                            delivery_policy_id: data.delivery_policy,
                            substitution_policy_id: data.subtitution_policy,
                            preserved_item: data.preserve,
                            seasonal_item: data.seasonal,
                            index_no_follow: data.no_index,
                            delivery_method_id: data.method,
                            delivered_by: data.delivered_by,
                            surcharge: data.surcharge,
                        };

                        var status = 0;
                        if (data.status) {
                            post.admin_confirm = data.status;
                        } else {
                            post.admin_confirm = status;
                        }

                        if (data.sentiments) {
                            var Sentiments = [];
                            data.sentiments.forEach(function(item, index) {
                                Sentiments.push(item);
                            });
                            post.sentiments = JSON.stringify(Sentiments);
                        }

                        if (data.province_id.indexOf('all') > -1) {
                            post.all_province_flag = 1;
                        } else {
                            post.all_province_flag = 0;
                        }

                        var productImagePath = "public/uploads/products";
                        if (post.snip_picture) {
                            fileHelper.uploadImage(post.snip_picture, productImagePath, function(err, image) {
                                if (err) {
                                    res.status(config.HTTP_BAD_REQUEST).send({
                                        status: config.ERROR,
                                        code: config.HTTP_BAD_REQUEST,
                                        message: err
                                    });
                                } else {
                                    post.product_picture = image;
                                }
                            });
                        } else {
                            if (result[0].product_picture) {
                                post.product_picture = result[0].product_picture;
                            }
                        }

                        DbModel.save('products', post, id, function(err, result) {
                            console.log(err)
                            if (err) {
                                res.status(config.HTTP_SERVER_ERROR).send({
                                    status: config.ERROR,
                                    code: config.HTTP_SERVER_ERROR,
                                    message: 'Product has been not updated.'
                                });
                            } else {

                                if (data.colors) {
                                    DbModel.checkAndAddRecord('color_product', data.colors, id, 'color_id', function(err, color) {});
                                } else {
                                    let cond1 = [{
                                        'product_id': {
                                            'val': id,
                                            'cond': '='
                                        }
                                    }];
                                    DbModel.delete('color_product', cond1, function(error, result) {})
                                }

                                if (data['Occasions-chk']) {
                                    DbModel.checkAndAddRecord('occasion_product', data['Occasions-chk'], id, 'occasion_id', function(err, color) {});
                                } else {
                                    let cond1 = [{
                                        'product_id': {
                                            'val': id,
                                            'cond': '='
                                        }
                                    }];
                                    DbModel.delete('occasion_product', cond1, function(error, result) {})
                                }

                                if (data.Sympathy) {
                                    DbModel.checkAndAddRecord('sympathy_type_product', data.Sympathy, id, 'sympathy_type_id', function(err, color) {});
                                } else {
                                    let cond1 = [{
                                        'product_id': {
                                            'val': id,
                                            'cond': '='
                                        }
                                    }];
                                    DbModel.delete('sympathy_type_product', cond1, function(error, result) {})
                                }

                                if (data.MixedBouquets) {
                                    DbModel.checkAndAddRecord('sympathy_type_product', data.MixedBouquets, id, 'mixed_bouquet_id', function(err, color) {});
                                } else {
                                    let cond1 = [{
                                        'product_id': {
                                            'val': id,
                                            'cond': '='
                                        }
                                    }];
                                    DbModel.delete('sympathy_type_product', cond1, function(error, result) {})
                                }

                                if (data.flowerstypes) {
                                    DbModel.checkAndAddRecord('flower_type_product', data.flowerstypes, id, 'flower_type_id', function(err, color) {});
                                } else {
                                    let cond1 = [{
                                        'product_id': {
                                            'val': id,
                                            'cond': '='
                                        }
                                    }];
                                    DbModel.delete('flower_type_product', cond1, function(error, result) {})
                                }

                                if (data.categories) {
                                    DbModel.checkAndAddRecord('category_product', data.categories, id, 'category_id', function(err, color) {});
                                } else {
                                    let cond1 = [{
                                        'product_id': {
                                            'val': id,
                                            'cond': '='
                                        }
                                    }];
                                    DbModel.delete('category_product', cond1, function(error, result) {})
                                }

                                if (data.addons) {
                                    DbModel.checkAndAddRecord('addon_product', data.addons, id, 'addon_id', function(err, color) {});
                                } else {
                                    let cond1 = [{
                                        'product_id': {
                                            'val': id,
                                            'cond': '='
                                        }
                                    }];
                                    DbModel.delete('addon_product', cond1, function(error, result) {})
                                }

                                if (data.relatedproducts) {
                                    var cond1 = [{
                                        'product_id': {
                                            'val': id,
                                            'cond': '='
                                        }
                                    }];
                                    DbModel.delete('related_product', cond1, function(error, result) {
                                        DbModel.checkAndAddRecord('related_product', data.Sympathy, id, 'related_product_id', function(err, color) {});
                                    })
                                }

                                if (data.country_id && data.province_id) {
                                    let cond1 = [{
                                        'product_id': {
                                            'val': id,
                                            'cond': '='
                                        }
                                    }];
                                    DbModel.delete('location_product', cond1, function(error, result) {
                                        let records = [];
                                        if (data.province_id.indexOf('all') > -1) {
                                            var sqlQuery = 'SELECT id, province_name, country_id FROM provinces WHERE country_id =' + data.country_id;
                                            DbModel.rawQuery(sqlQuery, function(err, provinces) {
                                                if (provinces.length) {
                                                    async.each(provinces, function(province, provinceCallback) {
                                                        var data = [province.id, id, province.country_id];
                                                        records.push(data);
                                                        provinceCallback();
                                                    }, function() {
                                                        var sql = "INSERT INTO location_product (province_id, product_id, country_id) VALUES ?";
                                                        DbModel.insertMultiplRecords(sql, records, function(err, results) {});
                                                    });
                                                }
                                            });
                                        } else {
                                            let countryId = data.country_id;
                                            if (data.province_id.length) {
                                                async.each(data.province_id, function(province, pCallback) {
                                                    var data = [province, id, countryId];
                                                    records.push(data);
                                                    pCallback();
                                                }, function() {
                                                    var sql = "INSERT INTO location_product (province_id, product_id, country_id) VALUES ?";
                                                    DbModel.insertMultiplRecords(sql, records, function(err, results) {});
                                                });
                                            }
                                        }
                                    })
                                }

                                if (data.varient && data.compare_price && data.price) {
                                    let cond1 = [{
                                        'product_id': {
                                            'val': id,
                                            'cond': '='
                                        }
                                    }];
                                    DbModel.delete('product_prices', cond1, function(error, result) {
                                        let records = [];
                                        let oldImages = data.old_price_image || [];
                                        let newImages = data.base64_variant_image || [];
                                        let prices = data.price;
                                        let comparePrices = data.compare_price;
                                        let skuList = data.sku;
                                        let sku = '';
                                        async.forEachOf(data.varient, function(productPriceName, index,  productPriceCallback) {
                                            if(skuList[index]) {
                                              sku = skuList[index];
                                            }
                                            var productPriceImage = '';
                                            var productPriceImagePath = "public/uploads/product_temp/varient_product";
                                            if (newImages[index]) {
                                                fileHelper.uploadImage(newImages[index], productPriceImagePath, function(err, image) {
                                                    if (err) {
                                                        res.status(config.HTTP_BAD_REQUEST).send({
                                                            status: config.ERROR,
                                                            code: config.HTTP_BAD_REQUEST,
                                                            message: err
                                                        });
                                                    } else {
                                                        productPriceImage  = image;
                                                    }
                                                });
                                            } else {
                                                if (oldImages[index]) {
                                                    productPriceImage = oldImages[index];
                                                }
                                            }

                                            var data = [productPriceName, id, prices[index], sku, comparePrices[index], productPriceImage];
                                            records.push(data);
                                            productPriceCallback();
                                        }, function() {
                                            var sql = "INSERT INTO product_prices (price_name, product_id, price_value, sku, compare_price, image) VALUES ?";
                                            DbModel.insertMultiplRecords(sql, records, function(err, results) {
                                                console.log(err)
                                            });
                                        });
                                    })
                                }

                                DbModel.findOne('language_product', 'product_id', id, function(err, result) {
                                    var languageProduct = {
                                        product_name: data.product_name,
                                        product_description: data.product_description,
                                        product_specification: data.product_specification
                                    }
                                    DbModel.save('language_product', languageProduct, result[0].id, function(err, result) {
                                        console.log(err)
                                        if (err) {
                                            res.status(config.HTTP_SERVER_ERROR).send({
                                                status: config.ERROR,
                                                code: config.HTTP_SERVER_ERROR,
                                                message: 'Product has been not updated.'
                                            });
                                        } else {
                                            res.status(config.HTTP_SUCCESS).send({
                                                status: config.SUCCESS,
                                                code: config.HTTP_SUCCESS,
                                                message: 'Product has been updated successfully.'
                                            });
                                        }
                                    });
                                })
                            }
                        });
                    }
                }
            });
        }
    }
}

module.exports = new adminProductController();
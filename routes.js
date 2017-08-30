var authenticateController = require('./api/controllers/authenticate-controller');

// For Backend Controllers
var adminController = require('./api/controllers/admin/admin-controller');
var adminCustomerController = require('./api/controllers/admin/admin-customer-controller');
var adminVendorController = require('./api/controllers/admin/vendor-controller');
var categoryController = require('./api/controllers/admin/category-controller');
var calendarsettingController = require('./api/controllers/admin/calendarsetting-controller');
var colorController = require('./api/controllers/admin/color-controller');
var countryController = require('./api/controllers/admin/country-controller');
var currencyController = require('./api/controllers/admin/currency-controller');
var deliveryMethodsController = require('./api/controllers/admin/deliverymethods-controller');
var discountController = require('./api/controllers/admin/discount-controller');
var flowerController = require('./api/controllers/admin/flower-controller');
var languageController = require('./api/controllers/admin/language-controller');
var mixedBouquetController = require('./api/controllers/admin/mixedbouquet-controller');
var occasionController = require('./api/controllers/admin/occasion-controller');

var promobannerController = require('./api/controllers/admin/promobanner-controller');
var categoryController = require('./api/controllers/admin/category-controller');
var adminhomeController = require('./api/controllers/admin/home-controller');
var provinceController = require('./api/controllers/admin/province-controller');
var sympathyController = require('./api/controllers/admin/sympathy-controller');
var timezoneController = require('./api/controllers/admin/timezone-controller');
var adminProductController = require('./api/controllers/admin/admin-product-controller');


// For Vendor Controllers
var vendorController = require('./api/controllers/vendor/vendor-controller');
var cmsController = require('./api/controllers/admin/cms-controller');


// For Frontend Controllers
var homeController = require('./api/controllers/home-controller');
var customerController = require('./api/controllers/customer-controller');
var commonController = require('./api/controllers/common-controller');
var collectionController = require('./api/controllers/collection-controller');
var productController = require('./api/controllers/product-controller');
var orderTrackingController = require('./api/controllers/order-tracking-controller');
var wishlistController = require('./api/controllers/wishlist-controller');
var cartController = require('./api/controllers/cart-controller');

// Validation Helper used for validation
var validate = require('./api/helpers/validation-helper');

// Validation Configuration for Admin 
var adminCustomerValidation = require('./api/validation/admin/admin-customer-validation');
var adminValidation = require('./api/validation/admin/admin-validation');
var adminVendorValidation = require('./api/validation/admin/vendor-validation');
var calendarsettingValidation = require('./api/validation/admin/calendarsetting-validation');
var colorValidation = require('./api/validation/admin/color-validation');
var categoryValidation = require('./api/validation/admin/category-validation');
var customerValidation = require('./api/validation/customer-validation');
var deliveryMethodsValidation = require('./api/validation/admin/deliverymethods-validation');
var discountValidation = require('./api/validation/admin/discount-validation');
var flowerValidation = require('./api/validation/admin/flower-validation');
var homeValidation = require('./api/validation/home-validation');
var mixedbouquetValidation = require('./api/validation/admin/mixedbouquet-validation');
var occasionValidation = require('./api/validation/admin/occasion-validation');
var orderTrackingValidation = require('./api/validation/order-tracking-validation');
var productValidation = require('./api/validation/product-validation');
var promobannerValidation = require('./api/validation/admin/promobanner-validation');
var sympathyValidation = require('./api/validation/admin/sympathy-validation');
var flowerValidation = require('./api/validation/admin/flower-validation');
var mixedbouquetValidation = require('./api/validation/admin/mixedbouquet-validation');
var adminhomeValidation = require('./api/validation/admin/adminhome-validation');
var wishlistValidation = require('./api/validation/wishlist-validation');
var adminProductValidation = require('./api/validation/admin/admin-product-validation');


// Validation Configuration for Vendor
var vendorValidation = require('./api/validation/vendor/vendor-validation');


var adminValidation = require('./api/validation/admin/admin-validation');
var calendarsettingValidation = require('./api/validation/admin/calendarsetting-validation');
var occasionValidation = require('./api/validation/admin/occasion-validation');
var cmsValidation = require('./api/validation/admin/cms-validation');


module.exports = {
  configure: function(app, router) {

    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/api-docs/index.html');
    });

    app.post('/admin/create', authenticateController.isAuthenticated, validate(adminValidation.create), function(req, res) {
        adminController.create(req, res);
    });

    app.post('/admin/login', validate(adminValidation.login), function(req, res) {
        adminController.login(req, res);
    });

    app.get('/admin/getUser/:id', authenticateController.isAuthenticated, function(req, res) {
        adminController.getUser(req, res);
    });

    app.put('/admin/updateProfile', authenticateController.isAuthenticated, function(req, res) {
        adminController.updateProfile(req, res);
    });

    app.post('/admin/changePassword', authenticateController.isAuthenticated, function(req, res) {
        adminController.changePassword(req, res);
    });

    app.delete('/admin/deleteUser', authenticateController.isAuthenticated, function(req, res) {
        adminController.deleteUser(req, res);
    });

    app.post('/admin/getAllUsers', authenticateController.isAuthenticated, function(req, res) {
        adminController.getAllUsers(req, res);
    });

    app.post('/admin/forget', function(req, res) {
        adminController.forgetPassword(req, res);
    });

    app.post('/admin/reset/:key', function(req, res) {
        adminController.resetPassword(req, res);
    });

    app.get('/common/countries', function(req, res) {
        commonController.countries(req, res);
    });

    app.get('/common/province/:country_id', function(req, res) {
        commonController.province(req, res);
    });

    app.get('/common/allprovince', function(req, res) {
        commonController.allprovince(req, res);
    });

    app.get('/common/countrieslist/:limit', function(req, res) {
        commonController.countrieslist(req, res);
    });

    app.get('/common/countrylanguage/:langauge_code', function(req, res) {
        commonController.countrylanguage(req, res);
    });

    app.get('/common/header/:langauge_code/:country_shortcode/:country_slug', function(req, res) {
        commonController.header(req, res);
    });

    // Get CMS page data based on id
    app.get('/common/page/:langauge_code/:slug', function(req, res) {
        commonController.page(req, res);
    });

    /************** Country **********/

    app.post('/admin/country/list', authenticateController.isAuthenticated, function(req, res) {
        countryController.list(req, res);
    });

    app.post('/admin/country/create', authenticateController.isAuthenticated, function(req, res) {
        countryController.create(req, res);
    });

    app.get('/admin/country/view/:id', authenticateController.isAuthenticated, function(req, res) {
        countryController.view(req, res);
    });

    app.put('/admin/country/update', authenticateController.isAuthenticated, function(req, res) {
        countryController.update(req, res);
    });

    app.delete('/admin/country/delete', authenticateController.isAuthenticated, function(req, res) {
        countryController.delete(req, res);
    });

    /************** Country End **********/

    /************************* START language *****************/

    app.post('/admin/getlanguages', authenticateController.isAuthenticated, function(req, res) {
        languageController.getlanguages(req, res);
    });

    app.post('/admin/createlanguage', authenticateController.isAuthenticated, function(req, res) {
        languageController.createlanguage(req, res);
    });

    app.post('/admin/getlanguage', authenticateController.isAuthenticated, function(req, res) {
        languageController.getlanguage(req, res);
    });

    app.post('/admin/updatelanguage', authenticateController.isAuthenticated, function(req, res) {
        languageController.updatelanguage(req, res);
    });

    app.delete('/admin/deletelanguage', authenticateController.isAuthenticated, function(req, res) {
        languageController.deletelanguage(req, res);
    });

    /************************* END of language *****************/

    /************************* START timezone *****************/

    app.post('/admin/gettimezones', authenticateController.isAuthenticated, function(req, res) {
        timezoneController.gettimezones(req, res);
    });

    app.post('/admin/gettimezone', authenticateController.isAuthenticated, function(req, res) {
        timezoneController.gettimezone(req, res);
    });

    app.post('/admin/updatetimezone', authenticateController.isAuthenticated, function(req, res) {
        timezoneController.updatetimezone(req, res);
    });

    app.delete('/admin/deletetimezone', authenticateController.isAuthenticated, function(req, res) {
        timezoneController.deletetimezone(req, res);
    });

    /************************* END of timezone *****************/
    /************************* START currency *****************/

    app.post('/admin/getallcurrencies', authenticateController.isAuthenticated, function(req, res) {
        currencyController.getallcurrencies(req, res);
    });

    app.post('/admin/getcurrency', authenticateController.isAuthenticated,validate(adminValidation.getcurrency), function(req, res) {
        currencyController.getcurrency(req, res);
    });

    app.post('/admin/editcurrency', authenticateController.isAuthenticated,validate(adminValidation.editcurrency), function(req, res) {
        currencyController.editcurrency(req, res);
    });

    app.delete('/admin/deletecurrency', authenticateController.isAuthenticated,validate(adminValidation.deletecurrency), function(req, res) {
        currencyController.deletecurrency(req, res);
    });

    app.post('/admin/addcurrency', authenticateController.isAuthenticated,validate(adminValidation.addcurrency), function(req, res) {
        currencyController.addcurrency(req, res);
    });


    /************************* END of currency *****************/

    /************************* START colors *****************/

    app.post('/admin/getcolors', authenticateController.isAuthenticated, validate(colorValidation.getcolors), function(req, res) {
        colorController.getcolors(req, res);
    });

    app.post('/admin/createcolor', authenticateController.isAuthenticated, validate(colorValidation.createcolor), function(req, res) {
        colorController.createcolor(req, res);
    });

    app.post('/admin/getcolor', authenticateController.isAuthenticated, validate(colorValidation.getcolor), function(req, res) {
        colorController.getcolor(req, res);
    });

    app.post('/admin/updatecolor', authenticateController.isAuthenticated, validate(colorValidation.updatecolor), function(req, res) {
        colorController.updatecolor(req, res);
    });

    app.delete('/admin/deletecolor', authenticateController.isAuthenticated, validate(colorValidation.deletecolor), function(req, res) {
        colorController.deletecolor(req, res);
    });

    /************************* END of colors *****************/

    /************************* START Sympathy Types *****************/

    app.post('/admin/getSympathys', authenticateController.isAuthenticated, validate(sympathyValidation.get), function(req, res) {
        sympathyController.getSympathys(req, res);
    });

    app.post('/admin/createSympathy', authenticateController.isAuthenticated, validate(sympathyValidation.create), function(req, res) {
        sympathyController.createSympathy(req, res);
    });

    app.post('/admin/getSympathy', authenticateController.isAuthenticated, validate(sympathyValidation.view), function(req, res) {
        sympathyController.getSympathy(req, res);
    });

    app.put('/admin/updateSympathy', authenticateController.isAuthenticated, validate(sympathyValidation.update), function(req, res) {
        sympathyController.updateSympathy(req, res);
    });

    app.delete('/admin/deleteSympathy', authenticateController.isAuthenticated, validate(sympathyValidation.delete), function(req, res) {
        sympathyController.deleteSympathy(req, res);
    });

    /************************* END of Sympathy *****************/

    /************************* START Flowers Types *****************/

    app.post('/admin/getFlowerTypes', authenticateController.isAuthenticated, validate(flowerValidation.get), function(req, res) {
        flowerController.getFlowerTypes(req, res);
    });

    app.post('/admin/createFlowerType', authenticateController.isAuthenticated, validate(flowerValidation.create), function(req, res) {
        flowerController.createFlowerType(req, res);
    });

    app.post('/admin/getFlowerType', authenticateController.isAuthenticated, validate(flowerValidation.view), function(req, res) {
        flowerController.getFlowerType(req, res);
    });

    app.put('/admin/updateFlowerType', authenticateController.isAuthenticated, validate(flowerValidation.update), function(req, res) {
        flowerController.updateFlowerType(req, res);
    });

    app.delete('/admin/deleteFlowerType', authenticateController.isAuthenticated, validate(flowerValidation.delete), function(req, res) {
        flowerController.deleteFlowerType(req, res);
    });

    /************************* END of Flowers *****************/

    /************************* START Mixed Bouquets *****************/

    app.post('/admin/getMixedBouquets', authenticateController.isAuthenticated, validate(mixedbouquetValidation.get), function(req, res) {
        mixedBouquetController.getMixedBouquets(req, res);
    });

    app.post('/admin/createMixedBouquet', authenticateController.isAuthenticated, validate(mixedbouquetValidation.create), function(req, res) {
        mixedBouquetController.createMixedBouquet(req, res);
    });

    app.post('/admin/getMixedBouquet', authenticateController.isAuthenticated, validate(mixedbouquetValidation.view), function(req, res) {
        mixedBouquetController.getMixedBouquet(req, res);
    });

    app.put('/admin/updateMixedBouquet', authenticateController.isAuthenticated, validate(mixedbouquetValidation.update), function(req, res) {
        mixedBouquetController.updateMixedBouquet(req, res);
    });

    app.delete('/admin/deleteMixedBouquet', authenticateController.isAuthenticated, validate(mixedbouquetValidation.delete), function(req, res) {
        mixedBouquetController.deleteMixedBouquet(req, res);
    });

    /************************* END of Mixed Bouquets *****************/


     /************************* START Promo Code API's *****************/

    app.get('/admin/discounts/list', authenticateController.isAuthenticated, validate(discountValidation.getPromoCodes), function(req, res) {
        discountController.getPromoCodes(req, res);
    });

    app.post('/admin/discounts/create',  authenticateController.isAuthenticated, validate(discountValidation.createPromoCode), function(req, res) {
        discountController.createPromoCode(req, res);
    });

    app.get('/admin/discounts/view/:id',  authenticateController.isAuthenticated, validate(discountValidation.getPromoCode), function(req, res) {
        discountController.getPromoCode(req, res);
    });

    app.put('/admin/discounts/update',  authenticateController.isAuthenticated, validate(discountValidation.updatePromoCode), function(req, res) {
        discountController.updatePromoCode(req, res);
    });

    app.delete('/admin/discounts/remove',  authenticateController.isAuthenticated, validate(discountValidation.deletePromoCode), function(req, res) {
        discountController.deletePromoCode(req, res);
    });

    app.get('/admin/restrictpromocodes/list', authenticateController.isAuthenticated, validate(discountValidation.getRestrictPromoCodes), function(req, res) {
        discountController.getRestrictPromoCodes(req, res);
    });

    app.post('/admin/restrictpromocodes/create', authenticateController.isAuthenticated, validate(discountValidation.createRestrictPromoCode), function(req, res) {
        discountController.createRestrictPromoCode(req, res);
    });

    app.put('/admin/restrictpromocodes/update', authenticateController.isAuthenticated, validate(discountValidation.updateRestrictPromoCode), function(req, res) {
        discountController.updateRestrictPromoCode(req, res);
    });

    app.delete('/admin/restrictpromocodes/remove',  authenticateController.isAuthenticated, validate(discountValidation.deleteRestrictPromoCode), function(req, res) {
        discountController.deleteRestrictPromoCode(req, res);
    });
    /************************* END of colors *****************/

    /************************  START Restrict Calendar Date  ****************************/

    // listing
    app.post('/admin/getRestrictCalendarDates', authenticateController.isAuthenticated, function(req, res) {
        calendarsettingController.getRestrictCalendarDates(req, res);
    });

    // create new
    app.post('/admin/createRestrictCalendarDate', authenticateController.isAuthenticated, validate(calendarsettingValidation.createRestrictCalendarDate),function(req, res) {
        calendarsettingController.createRestrictCalendarDate(req, res);
    });

    // delete
    app.delete('/admin/deleteRestrictCalendarDate', authenticateController.isAuthenticated, validate(calendarsettingValidation.deleteRestrictCalendarDate),function(req, res) {
        calendarsettingController.deleteRestrictCalendarDate(req, res);
    });

    // get selected one
    app.post('/admin/getSelectedRestrictCalendarDate', authenticateController.isAuthenticated,validate(calendarsettingValidation.getSelectedRestrictCalendarDate) ,function(req, res) {
        calendarsettingController.getSelectedRestrictCalendarDate(req, res);
    });

    // update one
    app.post('/admin/updateSelectedRestrictCalendarDate', authenticateController.isAuthenticated,validate(calendarsettingValidation.updateSelectedRestrictCalendarDate), function(req, res) {
        calendarsettingController.updateSelectedRestrictCalendarDate(req, res);
    });


    /************************  END Restrict Calendar Date  ****************************/

     /************************  START Surcharge Calendar Date  ****************************/

    // listing
    app.post('/admin/getSurchargeCalendarDates', authenticateController.isAuthenticated, function(req, res) {
        calendarsettingController.getSurchargeCalendarDates(req, res);
    });

    // create new
    app.post('/admin/createSurchargeCalendarDate', authenticateController.isAuthenticated, validate(calendarsettingValidation.createSurchargeCalendarDate),function(req, res) {
        calendarsettingController.createSurchargeCalendarDate(req, res);
    });

     // update one
    app.post('/admin/updateSelectedSurchargeCalendarDate', authenticateController.isAuthenticated,validate(calendarsettingValidation.updateSelectedSurchargeCalendarDate), function(req, res) {
        calendarsettingController.updateSelectedSurchargeCalendarDate(req, res);
    });


    // get selected one
    app.post('/admin/getSelectedSurchargeCalendarDate', authenticateController.isAuthenticated,validate(calendarsettingValidation.getSelectedSurchargeCalendarDate) ,function(req, res) {
        calendarsettingController.getSelectedSurchargeCalendarDate(req, res);
    });

    // delete
    app.delete('/admin/deleteSurchargeCalendarDate', authenticateController.isAuthenticated, validate(calendarsettingValidation.deleteSurchargeCalendarDate),function(req, res) {
        calendarsettingController.deleteSurchargeCalendarDate(req, res);
    });


    /************************  END Surcharge Calendar Date  ****************************/
    
    /************************  START Custom Text Calendar Date  ****************************/
   
    // listing
    app.post('/admin/getCustomTextCalendarDates', authenticateController.isAuthenticated, function(req, res) {
        calendarsettingController.getCustomTextCalendarDates(req, res);
    });
    
    // create new
    app.post('/admin/createCustomTextCalendarDate', authenticateController.isAuthenticated, validate(calendarsettingValidation.createCustomTextCalendarDate),function(req, res) {
        calendarsettingController.createCustomTextCalendarDate(req, res);
    });
    
     // update one
    app.post('/admin/updateSelectedCustomTextCalendarDate', authenticateController.isAuthenticated,validate(calendarsettingValidation.updateSelectedCustomTextCalendarDate), function(req, res) {
        calendarsettingController.updateSelectedCustomTextCalendarDate(req, res);
    });
    
    
    // get selected one
    app.post('/admin/getSelectedCustomTextCalendarDate', authenticateController.isAuthenticated,validate(calendarsettingValidation.getSelectedCustomTextCalendarDate) ,function(req, res) {
        calendarsettingController.getSelectedCustomTextCalendarDate(req, res);
    });
    
    // delete
    app.delete('/admin/deleteCustomTextCalendarDate', authenticateController.isAuthenticated, validate(calendarsettingValidation.deleteCustomTextCalendarDate),function(req, res) {
        calendarsettingController.deleteCustomTextCalendarDate(req, res);
    });
    
    
    /************************  END Custom Text Calendar Date  ****************************/

   /************************* START Get vendors and prodcts lists for calendar setting  Routes ************************/

    // get vendors list by country id  (restrict calendar date and surcharge calendar date section)
    app.post('/admin/venderListByCountryId', authenticateController.isAuthenticated,validate(calendarsettingValidation.venderListByCountryId) ,function(req, res) {
        commonController.venderListByCountryId(req, res);
    });
     // get products list by vendor id
    app.post('/admin/productListByVendorId', authenticateController.isAuthenticated,validate(calendarsettingValidation.productListByVendorId), function(req, res) {
        commonController.productListByVendorId(req, res);
    });

    /************************* END Get vendors and prodcts lists for calendar setting  Routes ************************/


    /************************  START Occasion  ****************************/

    // listing
    app.post('/admin/getOccasionList', authenticateController.isAuthenticated, function(req, res) {
        occasionController.getOccasionList(req, res);
    });

    // create new
    app.post('/admin/createOccasion', authenticateController.isAuthenticated, validate(occasionValidation.createOccasion),function(req, res) {
        occasionController.createOccasion(req, res);
    });

    // update
    app.post('/admin/updateOccasion', authenticateController.isAuthenticated,validate(occasionValidation.updateOccasion), function(req, res) {
        occasionController.updateOccasion(req, res);
    });

    // delete
    app.delete('/admin/deleteOccasion', authenticateController.isAuthenticated, validate(occasionValidation.deleteOccasion),function(req, res) {
        occasionController.deleteOccasion(req, res);
    });

    // get selected one
    app.post('/admin/getSelectedOccasion', authenticateController.isAuthenticated,validate(occasionValidation.getSelectedOccasion) ,function(req, res) {
        occasionController.getSelectedOccasion(req, res);
    });

    /************************  END Occasion  ****************************/

    /************************  START CMS  ****************************/

    // listing
    app.post('/admin/getCmsList', authenticateController.isAuthenticated, function(req, res) {
        cmsController.getCmsList(req, res);
    });
    
    // create new
    app.post('/admin/createCms', authenticateController.isAuthenticated, validate(cmsValidation.createCms),function(req, res) {
        cmsController.createCms(req, res);
    });
        
    // update 
    app.post('/admin/updateCms', authenticateController.isAuthenticated,validate(cmsValidation.updateCms), function(req, res) {
        cmsController.updateCms(req, res);
    });
    
    // delete
    app.delete('/admin/deleteCms', authenticateController.isAuthenticated, validate(cmsValidation.deleteCms),function(req, res) {
        cmsController.deleteCms(req, res);
    });
        
    // get selected one
    app.post('/admin/getSelectedCms', authenticateController.isAuthenticated,validate(cmsValidation.getSelectedCms) ,function(req, res) {
        cmsController.getSelectedCms(req, res);
    }); 
    
    /************************  END Occasion  ****************************/      

    /************************* Home Page Routes ************************/

    app.get('/curriencies', function(req, res) {
        homeController.curriencies(req, res);
    });

    app.get('/languages', function(req, res) {
        homeController.languages(req, res);
    });

    app.post('/subscribe/newsletter', validate(homeValidation.subscribe), function(req, res) {
        homeController.subscribe(req, res);
    });

/*    app.get('/homeoffer', function(req, res) {
        homeController.homeoffer(req, res);
    });*/

    // Load all home page data.
    app.get('/home/:langauge_code/:country_shortcode', validate(homeValidation.home), function(req, res){
        homeController.home(req, res);
    });


    /************************* END of Home Page *****************/

    /************************* Product Details Page Routes ************************/
    // Load all home page data.

    app.post('/productdetails', validate(productValidation.productdetails), function(req, res){
        productController.productdetails(req, res);
    });
    app.post('/productdeliverycalender', validate(productValidation.productdeliverycalender), function(req, res){
        productController.productdeliverycalender(req, res);
    });
    /************************* END of Collection Page ************************/

    /************************* Collection Page Routes ************************/
    // Load all home page data.
    app.get('/collection_promotion/:langauge_code/:delivery_country_id', function(req, res){
        collectionController.collection_promotion(req, res);
    });

    app.post('/collections', function(req, res){
        collectionController.collections(req, res);
    });

    /************************* END of Collection Page ************************/

    /********************* Customer Routes ************************/

    app.post('/customer/register', validate(customerValidation.register), function(req, res) {
        customerController.register(req, res);
    });

    app.post('/customer/login', validate(customerValidation.login), function(req, res) {
        customerController.login(req, res);
    });

    // Use to send forget password link to customer.
    app.post('/customer/forgetPassword', validate(customerValidation.forgetPassword), function(req, res) {
        customerController.forgetPassword(req, res);
    });

    // Use to validate verification code for forget password sent by customer.
    app.post('/customer/verifyCode', validate(customerValidation.verifyCode), function(req, res) {
        customerController.verifyCode(req, res);
    });

    // Use to reset password send by customer and send confirmation email.
    app.put('/customer/resetPassword', validate(customerValidation.resetPassword), function(req, res) {
        customerController.resetPassword(req, res);
    });

    // Customer Feedback
    app.post('/feedback', validate(customerValidation.feedback), function(req, res) {
        customerController.feedback(req, res);
    });

     // Update Profile
    app.post('/customer/updateProfile', validate(customerValidation.updateProfile), function(req, res) {
        customerController.updateProfile(req, res);
    });

    // Customer fetch all Addresses
    app.post('/customer/fetchAllAddresses', authenticateController.isAuthenticated, function(req, res) {
        customerController.fetchAllAddresses(req, res);
    });

    // Customer update address
    app.post('/customer/updateAddress', authenticateController.isAuthenticated,  function(req, res) {
        customerController.updateAddress(req, res);
    });
     // edit customer address
    app.post('/customer/editAddress', authenticateController.isAuthenticated,  function(req, res) {
        customerController.editAddress(req, res);
    });

    /************************* END of Customer *****************/

    /************************* Wishlist Start******************/
    app.post('/getwishlist', authenticateController.isAuthenticated, validate(wishlistValidation.getwishlist), function(req, res) {
        wishlistController.getwishlist(req, res);
    });

    app.post('/addwishlistproduct', authenticateController.isAuthenticated, validate(wishlistValidation.addwishlistproduct), function(req, res) {
        wishlistController.addwishlistproduct(req, res);
    });

    app.delete('/deletewishlistproduct', authenticateController.isAuthenticated, validate(wishlistValidation.deletewishlistproduct), function(req, res) {
        wishlistController.deletewishlistproduct(req, res);
    });
    /************************* END of Wishlist *****************/

    /************************* Order Tracking ******************/

    app.post('/trackOrder', validate(orderTrackingValidation.trackOrder), function(req, res) {
        orderTrackingController.trackOrder(req, res);
    });
    /*fetch order history for the specific user*/
    app.post('/orderhistory', authenticateController.isAuthenticated,  function(req, res) {
        orderTrackingController.orderHistory(req, res);
    });
     /*fetch order history for the specific user*/
    app.post('/fetchOrderDetails/', authenticateController.isAuthenticated,  function(req, res) {
        orderTrackingController.fetchOrderDetails(req, res);
    });
     /*end for the user realted data*/

    /************************* Order Tracking End ***************/

    /************************ START Admin Provinces/States ************************/
    app.post('/admin/province/getprovince', authenticateController.isAuthenticated, function(req, res) {
        provinceController.getprovince(req, res);
    });

    app.post('/admin/province/createprovince', authenticateController.isAuthenticated, function(req, res) {
        provinceController.createprovince(req, res);
    });

    app.get('/admin/province/viewprovince/:id', authenticateController.isAuthenticated, function(req, res) {
        provinceController.viewprovince(req, res);
    });

    app.put('/admin/province/updateprovince', authenticateController.isAuthenticated, function(req, res) {
        provinceController.updateprovince(req, res);
    });

    app.delete('/admin/province/deleteprovince', authenticateController.isAuthenticated, function(req, res) {
        provinceController.deleteprovince(req, res);
    });
    /************************ END Admin Provinces/States ************************/

    /************************ Cart Functionality ********************************/

    app.post('/addToCart', function(req, res){
        cartController.addToCart(req, res);
    });

    app.put('/updateCartProductQuantity', function(req, res){
        cartController.updateCartProductQuantity(req, res);
    });

    app.put('/updateCart', function(req, res){
        cartController.updateCart(req, res);
    });

    app.delete('/removeCartProduct', function(req, res){
        cartController.removeCartProduct(req, res);
    });

    app.get('/getCart', function(req, res){
        cartController.getCart(req, res);
    });

    /*********************** Cart Functionality Ends Here ************************/

    /************************ Vendor Functionality ********************************/

    app.post('/admin/vendor/list', authenticateController.isAuthenticated, validate(adminVendorValidation.list), function(req, res){
        adminVendorController.list(req, res);
    });

    app.post('/admin/vendor/view', authenticateController.isAuthenticated, validate(adminVendorValidation.view), function(req, res){
        adminVendorController.view(req, res);
    });

    app.post('/admin/vendor/add', authenticateController.isAuthenticated, validate(adminVendorValidation.add), function(req, res){
        adminVendorController.add(req, res);
    });

    app.put('/admin/vendor/update', authenticateController.isAuthenticated, validate(adminVendorValidation.update), function(req, res){
        adminVendorController.update(req, res);
    });

    app.delete('/admin/vendor/delete', authenticateController.isAuthenticated, validate(adminVendorValidation.delete), function(req, res){
        adminVendorController.delete(req, res);
    });

    /*********************** Vendor Functionality Ends Here ************************/

    /************************ Delivery Methods Functionality ********************************/

    app.post('/admin/getalldeliverymethods', authenticateController.isAuthenticated, function(req, res){
        deliveryMethodsController.getalldeliverymethods(req, res);
    });

    app.post('/admin/getmethod', authenticateController.isAuthenticated, validate(deliveryMethodsValidation.getmethod), function(req, res){
        deliveryMethodsController.getmethod(req, res);
    });

    app.post('/admin/addeditmethod', authenticateController.isAuthenticated, validate(deliveryMethodsValidation.editmethod), function(req, res){
        deliveryMethodsController.addeditmethod(req, res);
    });

    app.delete('/admin/deletemethod', authenticateController.isAuthenticated, validate(deliveryMethodsValidation.deletemethod), function(req, res){
        deliveryMethodsController.deletemethod(req, res);
    });    
    /*********************** Delivery Methods Functionality Ends Here ************************/  
    /************************ Admin Home Functionality ********************************/

    app.post('/admin/getalltopcountires', authenticateController.isAuthenticated, function(req, res){
        adminhomeController.getalltopcountires(req, res);
    });

    app.post('/admin/gettopcountry', authenticateController.isAuthenticated, validate(adminhomeValidation.gettopcountry), function(req, res){
        adminhomeController.gettopcountry(req, res);
    }); 

    app.post('/admin/addedittopcountry', authenticateController.isAuthenticated, validate(adminhomeValidation.addedittopcountry), function(req, res){
        adminhomeController.addedittopcountry(req, res);
    });

    app.delete('/admin/deletetopcountry', authenticateController.isAuthenticated, validate(adminhomeValidation.deletetopcountry), function(req, res){
        adminhomeController.deletetopcountry(req, res);
    });    
    /*********************** Admin Home Functionality Ends Here ************************/ 

    /************************ Promo Banner Functionality ********************************/

    app.post('/admin/getallpromobanners', authenticateController.isAuthenticated, function(req, res){
        promobannerController.getallpromobanners(req, res);
    });

    app.post('/admin/addeditpromobanner', authenticateController.isAuthenticated, validate(promobannerValidation.addeditpromobanner), function(req, res){
        promobannerController.addeditpromobanner(req, res);
    });

    app.delete('/admin/deletepromobanner', authenticateController.isAuthenticated, function(req, res){
        promobannerController.deletepromobanner(req, res);
    });
    /*********************** Promo Banner Functionality Ends Here ************************/

    /************** Category **********/

    app.get('/admin/category/list', authenticateController.isAuthenticated, function(req, res) {
        categoryController.list(req, res);
    });

    app.post('/admin/category/create', authenticateController.isAuthenticated, validate(categoryValidation.create), function(req, res) {
        categoryController.create(req, res);
    });

    app.get('/admin/category/view/:id', authenticateController.isAuthenticated, validate(categoryValidation.view), function(req, res) {
        categoryController.view(req, res);
    });

    app.put('/admin/category/update', authenticateController.isAuthenticated, validate(categoryValidation.update), function(req, res) {
        categoryController.update(req, res);
    });

    app.delete('/admin/category/delete', authenticateController.isAuthenticated, validate(categoryValidation.delete), function(req, res) {
        categoryController.delete(req, res);
    });

    /************** Category End **********/


    /************** Admin Customer **********/

    app.get('/admin/customer/list', authenticateController.isAuthenticated, validate(adminCustomerValidation.list), function(req, res) {
        adminCustomerController.list(req, res);
    });

    app.post('/admin/customer/create', authenticateController.isAuthenticated, validate(adminCustomerValidation.create), function(req, res) {
        adminCustomerController.create(req, res);
    });

    app.get('/admin/customer/view/:id', authenticateController.isAuthenticated, validate(adminCustomerValidation.view), function(req, res) {
        adminCustomerController.view(req, res);
    });

    app.put('/admin/customer/update', authenticateController.isAuthenticated, validate(adminCustomerValidation.update), function(req, res) {
        adminCustomerController.update(req, res);
    });

    app.delete('/admin/customer/delete', authenticateController.isAuthenticated, validate(adminCustomerValidation.delete), function(req, res) {
        adminCustomerController.delete(req, res);
    });

    /************** Admin Customer End **********/

    /************** Admin Product **********/

    app.get('/admin/product/list', authenticateController.isAuthenticated, function(req, res) {
        adminProductController.list(req, res);
    });

    app.get('/admin/product/search', authenticateController.isAuthenticated, validate(adminProductValidation.search), function(req, res) {
        adminProductController.search(req, res);
    });

    app.get('/admin/product/view/:id', authenticateController.isAuthenticated, validate(adminProductValidation.view), function(req, res) {
        adminProductController.view(req, res);
    });

    app.put('/admin/product/update', authenticateController.isAuthenticated, validate(adminProductValidation.update), function(req, res) {
        adminProductController.update(req, res);
    });
    /************** Admin Product End **********/

    /************************** Vendor Section *****************************/
    
    /**************** Vendor Login Section Start Here ****************/

    app.post('/vendor/login', validate(vendorValidation.login), function(req, res) {
        vendorController.login(req, res);
    });

    app.get('/vendor/view', authenticateController.isAuthenticated, function(req, res) {
        vendorController.view(req, res);
    });

    app.put('/vendor/update', authenticateController.isAuthenticated, function(req, res) {
        vendorController.update(req, res);
    });

    app.put('/vendor/changePassword', authenticateController.isAuthenticated, validate(vendorValidation.changePassword), function(req, res) {
        vendorController.changePassword(req, res);
    });      

    /**************** Vendor Login End Here ****************/ 





    /*************************** Vendor Section End *****************************/

   }


}
var authenticateController = require('./api/controllers/authenticate-controller');
var adminController = require('./api/controllers/admin/admin-controller');
var countryController = require('./api/controllers/admin/country-controller');

// For Backend Controllers
var provinceController = require('./api/controllers/admin/province-controller');
var languageController = require('./api/controllers/admin/language-controller');
var timezoneController = require('./api/controllers/admin/timezone-controller');
var colorController = require('./api/controllers/admin/color-controller');
var calendarsettingController = require('./api/controllers/admin/calendarsetting-controller');
var occasionController = require('./api/controllers/admin/occasion-controller');
var cmsController = require('./api/controllers/admin/cms-controller');

// For Frontend Controllers
var homeController = require('./api/controllers/home-controller');
var customerController = require('./api/controllers/customer-controller');
var commonController = require('./api/controllers/common-controller');
var collectionController = require('./api/controllers/collection-controller');
var productController = require('./api/controllers/product-controller');
var orderTrackingController = require('./api/controllers/order-tracking-controller');
var wishlistController = require('./api/controllers/wishlist-controller');

// Validation Helper used for validation
var validate = require('./api/helpers/validation-helper');

// Validation Configuration for controller
var customerValidation = require('./api/validation/customer-validation');
var homeValidation = require('./api/validation/home-validation');
var orderTrackingValidation = require('./api/validation/order-tracking-validation');
var productValidation = require('./api/validation/product-validation');
var wishlistValidation = require('./api/validation/wishlist-validation');


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

    app.get('/common/header/:langauge_code', function(req, res) {
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
    
    /************************* START colors *****************/

    app.post('/admin/getcolors', authenticateController.isAuthenticated, function(req, res) {
        colorController.getcolors(req, res);
    });
    
    app.post('/admin/createcolor', authenticateController.isAuthenticated, function(req, res) {
        colorController.createcolor(req, res);
    });
    
    app.post('/admin/getcolor', authenticateController.isAuthenticated, function(req, res) {
        colorController.getcolor(req, res);
    });
    
    app.post('/admin/updatecolor', authenticateController.isAuthenticated, function(req, res) {
        colorController.updatecolor(req, res);
    });
    
    app.delete('/admin/deletecolor', authenticateController.isAuthenticated, function(req, res) {
        colorController.deletecolor(req, res);
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
    app.get('/home/:langauge_code', function(req, res){
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
    
   }
}
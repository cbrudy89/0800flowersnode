var authenticateController = require('./api/controllers/authenticate-controller');
var adminController = require('./api/controllers/admin/admin-controller');
var countryController = require('./api/controllers/admin/country-controller');
var customerController = require('./api/controllers/customer-controller');
var commonController = require('./api/controllers/common-controller');
var homeController = require('./api/controllers/home-controller');

module.exports = {
  configure: function(app, router) {

    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/api-docs/index.html');
    });    

    app.post('/admin/create', authenticateController.isAuthenticated, function(req, res) {
        adminController.create(req, res);
    });

    app.post('/admin/login', function(req, res) {
        adminController.login(req, res);
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

/*    app.get('/admin/:id[0-9]/', authenticateController.isAuthenticated, function(req, res) {
        userController.getUser(req.params.id, res);
    });

    app.get('/dashboard', authenticateController.isAuthenticated, function(req, res){
        console.log(req.decoded.id);
        res.send(req.decoded);
        //res.send('Token Verified');
    });*/

    app.get('/common/countries/', function(req, res) {
        commonController.countries(req, res);
    });
    app.post('/common/province/', function(req, res) {
        commonController.province(req, res);
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

    /************************* Home Page Routes ************************/

    app.get('/curriencies/', function(req, res) {
        homeController.curriencies(req, res);
    });

    app.get('/languages/', function(req, res) {
        homeController.languages(req, res);
    });

    app.post('/subscribe/newsletter', function(req, res) {
        homeController.subscribe(req, res);
    });    

        /********************* Customer Routes ************************/

        app.post('/customer/register', function(req, res) {
            customerController.register(req, res);
        });
        
        app.post('/customer/login', function(req, res) {
            customerController.login(req, res);
        });

        // Use to send forget password link to customer.
        app.post('/customer/forgetPassword', function(req, res) {
            customerController.forgetPassword(req, res);
        });    

        // Use to validate verification code for forget password sent by customer.
        app.post('/customer/verifyCode', function(req, res) {
            customerController.verifyCode(req, res);
        });

        // Use to reset password send by customer and send confirmation email.
        app.put('/customer/resetPassword', function(req, res) {
            customerController.resetPassword(req, res);
        });

        /************************* END of Customer *****************/

    /************************* END of Home Page *****************/    
  }
};
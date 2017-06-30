var authenticateController = require('./api/controllers/authenticate-controller');
var adminController = require('./api/controllers/admin/admin-controller');
var userController = require('./api/controllers/user-controller');
var commonController = require('./api/controllers/common-controller');

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


    /*app.post('/api/vendor/login', function(req, res) {
        userController.login(req, res);
    });

    app.post('/api/vendor/create', authenticateController.isAuthenticated,  function(req, res) {
        vendorController.create(req, res);
    });    

    app.post('/api/user/login', function(req, res) {
        userController.login(req, res);
    });*/

    app.get('/admin/:id[0-9]/', authenticateController.isAuthenticated, function(req, res) {
        userController.getUser(req.params.id, res);
    });

    app.get('/dashboard', authenticateController.isAuthenticated, function(req, res){
        console.log(req.decoded.id);
        res.send(req.decoded);
        //res.send('Token Verified');
    });
    app.get('/common/countries/', function(req, res) {
        commonController.countries(req, res);
    });
    app.post('/common/province/', function(req, res) {
        commonController.province(req, res);
    });


  }
};
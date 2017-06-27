var authenticateController = require('./api/controllers/authenticate-controller');
var adminController = require('./api/controllers/admin/admin-controller');
var userController = require('./api/controllers/user-controller');

module.exports = {
  configure: function(app, router) {

    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/api-docs/index.html');
    });    

    app.post('/api/admin/create', authenticateController.isAuthenticated, function(req, res) {
        adminController.create(req, res);
    });

    app.post('/api/admin/login', function(req, res) {
        adminController.login(req, res);
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

    app.get('/api/admin/:id[0-9]/', authenticateController.isAuthenticated, function(req, res) {
        userController.getUser(req.params.id, res);
    });

    app.get('/api/dashboard', authenticateController.isAuthenticated, function(req, res){
        console.log(req.decoded.id);
        res.send(req.decoded);
        //res.send('Token Verified');
    });

  }
};
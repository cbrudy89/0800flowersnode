var authenticateController = require('./api/controllers/authenticate-controller');
var userController = require('./api/controllers/user-controller');

module.exports = {
  configure: function(app, router) {

    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/api-docs/index.html');
    });    

    app.post('/api/user/register', function(req, res) {
        userController.register(req, res);
    });

    app.post('/api/user/login', function(req, res) {
        userController.login(req, res);
    });

    app.get('/api/user/:id[0-9]/', authenticateController.isAuthenticated, function(req, res) {
      userController.getUser(req.params.id, res);
    });

    app.get('/api/dashboard', authenticateController.isAuthenticated, function(req,res){
        res.send('Token Verified')
    });

  }
};
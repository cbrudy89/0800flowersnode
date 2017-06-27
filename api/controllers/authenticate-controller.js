var jwt=require('jsonwebtoken');

function AuthenticateController() {

  this.isAuthenticated = function(req,res,next){

    var token=req.body.token || req.query.token || req.headers['token'];
    if(token){
        jwt.verify(token,process.env.SECRET_KEY,function(err,decoded){
            if(err){
                //res.status(500).send('Token Invalid');
                res.status(401).send({
                    status:false, 
                    message: 'Token Invalid'
                });
            }else{
                req.decoded = decoded;
                next();
            }
        })
    }else{
        res.status(403).send({
            status:false, 
            message: 'Please send a token'
        });
        //res.send('Please send a token')
    }

  }

}

module.exports = new AuthenticateController();
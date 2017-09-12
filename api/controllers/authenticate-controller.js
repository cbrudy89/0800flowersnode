var jwt=require('jsonwebtoken');
var config = require('./../../config');

function AuthenticateController() {

  this.isAuthenticated = function(req,res,next){
    var newToken;
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

                //Refresh: If the token needs to be refreshed gets the new refreshed token
                newToken = refreshToken(decoded);
                if(newToken) {

                    res.set('token', newToken);
                } 
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

function refreshToken(decoded) {
    var token_exp,
        now,
        newToken;

    token_exp = decoded.exp;
    now = (Date.now()/1000).toFixed();
    /*console.log(token_exp);
    console.log(now);
    console.log('asdf');
    console.log(token_exp - now);
    console.log('asdf');
    console.log(config.JWT_REFRESH_TIME);*/
    if((token_exp - now) < config.JWT_REFRESH_TIME) {
        newToken = createToken(decoded);
        if(newToken) {
            return newToken;
        }
    } else {
       return null;
    }
}

function createToken(decoded){

    if(decoded.parent_id && decoded.parent_id != undefined){
        var data = {id: decoded.id, parent_id: decoded.parent_id, role : decoded.role};
    }else{
        var data = {id: decoded.id, role : decoded.role};
    }

    var token=jwt.sign(data,process.env.SECRET_KEY,{
      expiresIn:config.JWT_EXPIRATION_TIME
    });

    return token;

}

module.exports = new AuthenticateController();
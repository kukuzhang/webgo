var persistence = require('./persistence');

exports.logout = function (req,res,next) {

  req.logout();
  if (req.query.redirect) {
    
    res.redirect(req.query.redirect);
    
  } else {
    
    res.json({'ok':'ok'});
    
  }
  
};

exports.googleSignInPrepare = function (req, res) {

  req.session.authRedirect = req.query.redirect;
  console.log('prepare', req.query.redirect);
  
};

exports.googleSignInCallback = function (req, res, next) {

  console.log('here',req.session);
  if (req.session.authRedirect) {
    
    res.redirect(req.session.authRedirect);
    
  } else {
  
    res.json(req.user);
    
  }

};

function serializeUser(user, done) {

    done(null, persistence.getUserSerialization(user))

}

function deserializeUser (s, done) {

    return persistence.findUserBySerialization(s,done);    

}

exports.serializeUser = serializeUser;
exports.deserializeUser = deserializeUser;

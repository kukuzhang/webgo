var persistence = require('./persistence');

exports.googleSignInCallback = function (req, res, next) {

  console.log('cb');
  console.log(req.user);
  res.json(req.user);

};

function serializeUser(user, done) {

    done(null, persistence.getUserSerialization(user))

}

function deserializeUser (s, done) {

    return persistence.findUserBySerialization(s,done);    

}

exports.serializeUser = serializeUser;
exports.deserializeUser = deserializeUser;

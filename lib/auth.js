var User = require('./persistence').User;

exports.googleSignInCallback = function (req, res, next) {

  console.log('cb');
  console.log(req.user);
  res.json(req.user);

};

function syncSerializeUser(user) {

    return user.provider + '-' + user.id;

}

function serializeUser(user, done) {

    done(null, syncSerializeUser(user));

}

function deserializeUser (s, done) {

    var parts = s.split('-');
    User.findOne({'provider':parts[0],'id':parts[1]},  function (err, user) {
      done(err, user);
    });

}

exports.syncSerializeUser = syncSerializeUser;
exports.serializeUser = serializeUser;
exports.deserializeUser = deserializeUser;

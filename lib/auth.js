var User = require('./persistence').User;

exports.googleSignInCallback = function (req, res, next) {

  console.log('cb');
  console.log(req.user);
  res.json(req.user);

};


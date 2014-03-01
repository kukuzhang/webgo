
/**
 * Module dependencies.
 */

var express = require('express')
  , user = require('./lib/user')
  , game = require('./lib/game')
  , auth = require('./lib/auth')
  , http = require('http')
  , cors = require('cors')
  , SessionStore = require('connect-mongo-store')(express)
  , passportSocketIo = require("passport.socketio")
  , passport = require("passport")
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
  , path = require('path');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var conf = require('./conf');
var sessionStore = new SessionStore(conf.sessionStoreURL,conf.sessionStoreOptions);

// all environments
var User = require('./lib/persistence').User;
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(cors({origin: '*'}));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret:conf.cookieSecret,store: sessionStore, cookie: {httpOnly: false}}));

app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

passport.use(new GoogleStrategy(conf.googleOAuth,
  function(accessToken, refreshToken, profile, done) {
    User.findOne({'provider':profile.provider,'id':profile.id},  function (err, user) {

      console.log('found',profile._json.email);
      if (!user) {
        user = new User(profile);
        console.log('created',user);
      }

      user.provider = profile.provider
      user.id = profile.id;
      user.verified_email = profile._json.verified_email;
      user.name = profile._json.name;
      user.family_name = profile._json.family_name;
      user.given_name = profile._json.given_name;
      user.middle_name = profile._json.middle_name;
      user.email = profile._json.email;
      user.picture = profile._json.picture;
      user.gender = profile._json.gender;
      user.locale = profile._json.locale;
      user.token = accessToken;
      user.lastActive = new Date().getTime();
      user.save( function (err, user, num)  {
        if (err) {
          console.log('error saving token.');
        } else {
          console.log('updated user',user);
        }
      });
      process.nextTick(function () { return done(null,profile); });

    });
  }
  ));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var authParams = {scope: [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
]};
var googlePrepare = passport.authenticate('google', authParams);

function myPrepare (req,res,next) {
  
  req.session.authRedirect = req.query.redirect;
  console.log('prepare', req.query.redirect);
  
  return googlePrepare (req,res,next);
};

app.get('/auth/logout', auth.logout);
app.get('/api/users', user.list);
app.get('/api/game/:id', game.get);
app.post('/api/game', game.createGame);
app.get('/api/game', game.list);
app.get('/auth', function (req,res) { res.json(req.user);} );
app.get('/auth/google', myPrepare);
app.get('/auth/google/callback', passport.authenticate('google'),
  auth.googleSignInCallback);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', game.setupConnection);
io.set('log level', 2);
var utils = require ('./node_modules/express/node_modules/connect/lib/utils');
// set authorization for socket.io
io.set('authorization', myAuthorizer(passportSocketIo.authorize({
  cookieParser: express.cookieParser,
  passport:    passport, // user serialization fails without this, mystical?
  key:         'connect.sid',
  secret:      conf.cookieSecret,
  store:       sessionStore,
  success:     onAuthorizeSuccess,
  fail:        onAuthorizeFail,
})));

function myAuthorizer (fn) {
  
    // We need to manually parse signed cookie in query because of CORS.

    return function(data, accept) {
      
      // There is a bug in connect that make + int ' ' in cookies.
      // var sid = query.session_id;
      // workaround:
      "/socket.io/1/?session_id=s:9watfbDjRha_IkJG0EpWBuOe.SrbK3r7IG+Yvg/pCmGu2RGoWKs5O9HftSehugmkg3uA&t=1393450474684"
      var sid = (data.url.split('session_id=')[1]).split('&t=')[0];

      if (sid && sid.substring(0,2) == 's:') {

        
        data.query.session_id = utils.parseSignedCookie(sid,conf.cookieSecret);

      }
      console.log('socket io auth',sid);
      console.log('=>',data.query.session_id);


      return fn(data, accept);

    }

}


function onAuthorizeSuccess(data, accept) {

  console.log('successful connection to socket.io');
  // The accept-callback still allows us to decide whether to
  // accept the connection or not.
  accept(null, true);

}

function onAuthorizeFail(data, message, error, accept) {

  console.log('failed connection to socket.io:', message);
  if (error) { throw new Error(message); }

  // We use this callback to log all of our failed connections.
  accept(null, false);

}

passport.serializeUser(auth.serializeUser);
passport.deserializeUser(auth.deserializeUser);


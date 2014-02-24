
/**
 * Module dependencies.
 */

var express = require('express')
  , user = require('./lib/user')
  , game = require('./lib/game')
  , http = require('http')
  , cors = require('cors')
//  , sessionStore = require('connect-socket-store')
//  , passportSocketIo = require("passport.socketio")
  , path = require('path');

var app = express();
var server = http.createServer(app)
var io = require('socket.io').listen(server)

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(cors({origin: '*'}));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/users', user.list);
app.get('/api/game/:id', game.get);
app.post('/api/game', game.createGame);
app.get('/api/game', game.list);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.configure(function() {
  io.set('authorization', socketAuth);
  io.set('log level', 2);
});
io.sockets.on('connection', game.setupConnection);

function socketAuth(data, accept) {

  var token = data.query.auth;
  var parts = token.split(/:/);
  var username = parts[0];
  var password = parts[1];
  data.username = null;
  console.log('auth',username,"...",password);
  /* var auth = new Buffer(token||"", 'base64').toString(); */

  if (!username) {

    accept("No username",false);
    console.log('bad u',username);

  }

  else if (password !== '123') {
    
    accept("Wrong password", false);
    console.log('bad p',password);

  } else {

    data.username = username;
    console.log('ok');
    accept(null, true);

  }

}
/*
// set authorization for socket.io
io.set('authorization', passportSocketIo.authorize({
  cookieParser: express.cookieParser,
  key:         'express.sid',       // the name of the cookie where express/connect stores its session_id
  secret:      'session_secret',    // the session_secret to parse the cookie
  store:       sessionStore,        // we NEED to use a sessionstore. no memorystore please
  success:     onAuthorizeSuccess,  // *optional* callback on success - read more below
  fail:        onAuthorizeFail,     // *optional* callback on fail/error - read more below
}));

function onAuthorizeSuccess(data, accept){
  console.log('successful connection to socket.io');

  // The accept-callback still allows us to decide whether to
  // accept the connection or not.
  accept(null, true);
}

function onAuthorizeFail(data, message, error, accept){
  if(error)
    throw new Error(message);
  console.log('failed connection to socket.io:', message);

  // We use this callback to log all of our failed connections.
  accept(null, false);
}

*/

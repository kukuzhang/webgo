
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , game = require('./routes/game')
  , http = require('http')
  , cors = require('cors')
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

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/api/game/:id', game.get);
app.post('/api/game', game.newGame);
app.get('/api/game', game.list);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.configure(function() {
  io.set('authorization', socketAuth);
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

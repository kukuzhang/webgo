
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
app.post('/api/game/:id', game.play);
app.get('/api/game', game.list);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.configure(function() {
  io.set('transports', [ 'websocket' , 'flashsocket' , 'htmlfile' ,
                        'xhr-polling' , 'jsonp-polling' ]);

});
io.sockets.on('connection', game.setupConnection);



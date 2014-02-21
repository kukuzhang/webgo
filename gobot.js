'use strict';


/**
 * Module dependencies.
 */

var io = require('socket.io-client'),
  libgo = require('./lib/libgo'),
  fs = require('fs'),
  gameId, myColor, socket, game, q;


function main() {

  var cmd = process.argv[2];

  console.log(cmd);

  if (cmd === 'new') {

    newGame();

  } else if (cmd === 'sgf') {

    sgf = readFileSync(process.args[3]);
    q = 'auth=' + process.argv[6];
    gameId = process.argv[4];
    myColor = process.argv[5];
    playGame();

  } else {

    q = 'auth=' + process.argv[5];
    gameId = process.argv[3];
    myColor = process.argv[4];
    playGame();

  }

}

function newGame() {

  var http = require('http');
  var options = {
      host: 'localhost',
      port: 3000,
      method: 'POST',
      path: '/api/game'
  };

  var req = http.request(options, function(resp){
      resp.on('data', function(chunk){
        console.log(chunk.toString());
      });
  }).on("error", function(e){
      console.log("Got error: " + e.message);
  });
  req.end();

}

function playGame() {

  console.log('gobot: Start playing');
  socket = io.connect('localhost', { port: 3000,query:q }),
  game = libgo.newGame();
  socket.emit('private message', { user: 'me', msg: 'whazzzup?' });
  socket.on('game', updateGame);
  socket.on('event',updateByEvent);
  socket.on('error',updateByError);
  socket.on('connect_failed',setConnectionStatus);
  socket.on('connect',setConnectionStatus);
  socket.on('disconnect',setConnectionStatus);
  socket.on('connecting', setConnectionStatus);
  socket.on('reconnect_failed', setConnectionStatus);
  socket.on('reconnect', setConnectionStatus);
  socket.on('reconnecting', setConnectionStatus);
  //socket.on('error', function () {}) - "error" is emitted when an error occurs and it cannot be handled by the other event types.
  //socket.on('message', function (message, callback) {}) - "message" is emitted when a message sent with socket.send is received. message is the sent message, and callback is an optional acknowledgement function.

}

function setConnectionStatus() {

  /* jshint validthis:true */
  console.log( connectionStatus(this.socket) );

  if (this.socket.connected === true) {

    console.log('=> refresh game', gameId);
    this.emit('game', gameId);

  }

}

function connectionStatus(s) {

  if (!s.connected) { return 'disconnected'; }

  if (s.connecting) { return 'connecting'; }

  return s.transport.name;

}

function end() {

  console.log('Ending in state:', game.getState());
  socket.disconnect();

}

function updateGame (data) {

  console.log('gobot: received game'); //, data);
  game = libgo.newGame(data);
  playIfPossible();

}

function updateByError (data) {

  console.log('gobot: error from server',data);
  end();

}

function updateByEvent (data) {

  console.log('received move', data);
  if (data.index === game.moves.length) {

    var move = libgo.newMove(data.move);
    game.play(move);

  } else {

    console.log(game.moves);
    console.log('Moves not in sync???');
    socket.emit('game', gameId);

  }
  playIfPossible();

}

function randomCoord () { return Math.floor(Math.random() * game.boardSize); }

function randomMove (tries) {

  var now = new Date().getTime();

  for (var i = 0; i < tries; i++) {

    var move = libgo.newMove({
      type: 'stone',
      stone: myColor,
      timestamp: now,
      row: randomCoord(),
      column: randomCoord()
    });

    if (game.isMoveOk(move)) { return move; }

  }

  return libgo.newMove({ type:'pass', stone:myColor });

}

function playIfPossible(data) {


  var state = game.getState();
  console.log('state now',state);

  if (state.state == 'end') {

    end();

  } else if (state.state == 'playing') {
    
    if (state.turn === myColor) {

      var move = randomMove(5);
      var msg = {gameId: gameId, move: move};
      console.log('playing', state);
      socket.emit('move',msg);

    } else {

      console.log('waiting for ' + state.turn + ' to play');

    }


  } else {

    console.log('Cannot handle state.'); end();

  }

};

main();

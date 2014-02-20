'use strict';


/**
 * Module dependencies.
 */

var io = require('socket.io-client'),
  libgo = require('./lib/libgo'),
  gameId = process.argv[2],
  myColor = process.argv[3],
  q = 'auth=' + process.argv[4],
  socket = io.connect('localhost', { port: 3000,query:q }),
  game = libgo.newGame();

console.log(process.argv);
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

  console.log(game.getState());
  socket.disconnect();

}

function updateGame (data) {

  console.log('received game'); //, data);
  game = libgo.newGame(data);
  playIfPossible();

}

function updateByError (data) {

  console.log('error from server',data);
  end();

}

function updateByEvent (data) {

  console.log('received move', data);
  if (data.index === game.moves.length) {

    var move = libgo.json2Move(data.move);
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

  for (var i = 0; i < tries; i++) {

    var move = libgo.json2Move({
      type: 'stone',
      stone: myColor,
      row: randomCoord(),
      column: randomCoord()
    });

    if (game.isMoveOk(move)) { return move; }

  }

  return libgo.json2Move({ type:'pass', stone:myColor });

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


'use strict';


/**
 * Module dependencies.
 */

var io = require('socket.io-client'),
  libgo = require('./lib/libgo'),
  fs = require('fs'),
  sgf, gameId, myColor, socket, game, q,
  pickAMove;


var sgfMoves = [];

function sgfMove () {

  var i = game.moves.length;

  var now = new Date().getTime();

  for (; i < sgfMoves.length; i ++) {

    var ob = sgfMoves[i];
    ob.timestamp = now;
    var move = libgo.newMove(ob);
    var e = game.getMoveError(move);

    if (!e) return move;

    console.log(e);

  }

  console.log('out of moves => pass');

  return {type: 'pass', stone: myColor};

}

function sgfParse(buf) {

  var s = buf.toString();
  var lines = s.split('\n');
  var base = 'a'.charCodeAt(0);

  for (var i = 0; i < lines.length; i++) {

    var line = lines[i], move;

    if (line[0] !== ';') continue

    var color = line[1].toLowerCase();

    if (line[3] == ']') {

      move = { type: 'pass', stone: color }; 

    } else {

      var row = line[3].toLowerCase().charCodeAt(0)-base;
      var column = line[4].toLowerCase().charCodeAt(0)-base;
      move = { type: 'stone', stone: color, row: row, column: column };

    }

    sgfMoves.push(move);

  }

}

function main() {

  var cmd = process.argv[2];

  if (cmd === 'new') {

    console.log('new game');
    newGame();

  } else if (cmd === 'pair') {

    console.log('launch a pair of random bots');
    throw 'not done yet';

  } else if (cmd === 'sgf') {

    console.log('sgf bot');
    sgf = sgfParse(fs.readFileSync(process.argv[3]));
    q = 'auth=' + process.argv[6];
    gameId = process.argv[4];
    myColor = process.argv[5];
    pickAMove = sgfMove;
    playGame();

  } else if (cmd === 'play') {

    console.log('random bot');
    q = 'auth=' + process.argv[5];
    gameId = process.argv[3];
    myColor = process.argv[4];
    pickAMove = function () { return randomMove(3); };
    playGame();

  } else {
    console.log('invalid command', cmd);
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

  } else if (state.state == 'configuring') {

    var attr = myColor == libgo.BLACK ?
      'configurationOkBlack' :
      'configurationOkWhite'

    if (game[attr] === true) {

      console.log('waiting for opponent to accept configuration.');

    } else {

      console.log('accepting configuration.');
      var data = {
        'white':game.white,
        'black':game.black,
        'boardSize':game.boardSize,
        'komi':game.komi,
        'handicaps':game.handicaps,
        'timeMain':game.timeMain,
        'timeExtraPeriods':game.timeExtraPeriods,
        'timeStonesPerPeriod':game.timeStonesPerPeriod,
        'timePeriodLength':game.timePeriodLength,
        'accept':true,
        'type':'configure',
        'gameId':gameId
      };
      socket.emit('configure',data);


    }
    
  } else if (state.state == 'playing') {
    
    if (state.turn === myColor) {

      var move = pickAMove();
      var msg = {gameId: gameId, move: move};
      console.log('playing', state);
      socket.emit('move',msg);

    } else {

      console.log('waiting for ' + state.turn + ' to play');

    }

  } else if (state.state == 'scoring') {

    var attr = myColor == libgo.BLACK ?
      'scoreOkBlack' :
      'scoreOkWhite';

    if (game[attr] === true) {

      console.log('waiting for opponent to accept score.');

    } else {

      console.log('accepting score.');
      var data = {
        'scoreBoard':game.scoreBoard,
        'scoreOkBlack':game.scoreOkBlack,
        'scoreOkWhite':game.scoreOkWhite,
        'gameId':gameId
      };
      data[attr] = true;
      socket.emit('score',data);

    }
    

  } else {

    console.log('Cannot handle state.'); end();

  }

};

main();

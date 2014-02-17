
/*
 * GET game
 */

var _ = require('underscore');
var uuid = require('node-uuid');
var libgo = require('../../lib/libgo');
var games = {}
var io;

games[0] = libgo.newGame({black:'juho',white:'pekka'}); // debug

function getGameIds() {

  return Object.keys(games).map(function(id) {
    return {id:id};  
  });

}

function newGame (options) {

    var id = uuid.v1();
    var game = libgo.newGame(options);

    if (games[id] !== undefined) throw new Error('Collision!');

    games[id] = game;

    return {id: id};

}

function getGameById(id) {

    var game = games[id];

    //return game.getBoard();
    return game;

}

function socketMove(socket,data) {

  var username = socket.handshake.username;
  var gameId = data.gameId;
  console.log('data', data);
  console.log('username',username);
  console.log('gameId',gameId);
  var moveJson = data.move;
  var ev = { index: games[gameId].moves.length, move: moveJson };
  var game = games[gameId];
  var player = moveJson.stone == libgo.BLACK ? 'black' :
               moveJson.stone == libgo.WHITE ? 'white' : null;

  if (player === null) throw new Error('Invalid stone.');
  
  var expectedUsername = game[player].name;
  
  if (username != expectedUsername) {
    
    var msg = username + ' is not allowed to play moves of '
      + expectedUsername;
    socket.emit('error', msg);

  } else {

    var move = libgo.json2Move(moveJson);

    try {

      game.play(move);

    } catch (e) {

      socket.emit('error',e.message);

      return;

    }

    socket.broadcast.to(gameId).emit('event',ev);
    socket.emit('event',ev);

  }

}

function socketDisconnect(socket,id) {

  console.log('disconnect');
  /*
  for (var gameId in socket.get('joined')) {
    joiners[gameId][so
  */

}

function socketGetGame(socket,gameId) {

  var game = getGameById(gameId);
  var out = _.extend({},game,{boards:[]});
  socket.join(gameId);
  socket.emit('game',out);

}

function setupConnection(socket, x) {

  function bindToSocket(f) { return function (data) { f(socket,data); }; }

  socket.on('move', bindToSocket(socketMove));
  socket.on('game', bindToSocket(socketGetGame));
  socket.on('disconnect', bindToSocket(socketDisconnect));

}

exports.setupConnection = setupConnection;

exports.get = function(req, res){
    res.send(JSON.stringify(getGameById(req.params.id)));
};
exports.newGame = function(req, res){
    res.send(newGame());
};
exports.list = function(req, res){
    res.send(JSON.stringify(getGameIds()));
};


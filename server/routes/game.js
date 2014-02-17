
/*
 * GET game
 */

var _ = require('underscore');
var uuid = require('node-uuid');
var libgo = require('../../lib/libgo');
var games = {}
var BLACK = 'b';
var WHITE = 'w';
var EMPTY = '_';

games[0] = libgo.newGame({black:'juho'}); // debug

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

  console.log('data', data);
  console.log('username',socket.handshake.username);
  var username = socket.handshake.username;
  var gameId = data.gameId;
  var moveJson = data.move;
  var ev = { index: games[gameId].moves.length, move: moveJson };
  var game = games[gameId];
  var player = moveJson.stone == BLACK ? 'black' :
               moveJson.stone == WHITE ? 'white' : null;

  if (player === null) throw new Error('Invalid stone.');
  
  var expectedUsername = game[player].name;
  
  if (username != expectedUsername) throw new Error(
    username + ' is not allowed to play moves of ' + expectedUsername);

  var move = libgo.json2Move(moveJson);
  game.play(move);
  socket.emit('event',ev);

}

function socketGetGame(socket,id) {

  var game = getGameById(id);
  var out = _.extend({},game,{boards:[]});
  socket.emit('game',out);

}

function setupConnection(socket,x) {
  console.log('here',socket.handshake.username);

  function bindToSocket(f) { return function (data) { f(socket,data); }; }

  socket.on('move', bindToSocket(socketMove));
  socket.on('game', bindToSocket(socketGetGame));

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



/*
 * GET game
 */

var uuid = require('node-uuid');
var libgo = require('../../lib/libgo');
var games = {}
var BLACK = 'b';
var WHITE = 'w';
var EMPTY = '_';


function getGameIds() {

  return Object.keys(games).map(function(id) {
    return {id:id};  
  });

}

function newGame () {

    var id = uuid.v1();
    var game = libgo.newGame();

    if (games[id] !== undefined) throw new Error('Collision!');

    games[id] = game;

    return {id: id};

}

function getGameById(id) {

    var game = games[id];

    //return game.getBoard();
    return game;

}

function playTo(id,moveJson) {

  var game = games[id];
  var move = libgo.json2Move(moveJson);

  var newBoard = game.play(move);

  //return newBoard;
  return game;

}

exports.get = function(req, res){
    res.send(JSON.stringify(getGameById(req.params.id)));
};
exports.newGame = function(req, res){
    res.send(newGame());
};
exports.play = function(req, res){
    res.send(JSON.stringify(playTo(req.params.id,req.body)));
};
exports.list = function(req, res){
    res.send(JSON.stringify(getGameIds()));
};


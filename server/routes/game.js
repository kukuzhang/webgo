
/*
 * GET game
 */


var libgo = require('../../libgo');
var games = {}
var BLACK = 'b';
var WHITE = 'w';
var EMPTY = '_';


function getGameIds() {

  return Object.keys(games).map(function(id) {
    return {id:id};  
  });

}

function getGameById(id) {

    var game = games[id];

    if (game === undefined) {

      game = libgo.newGame();
      games[id] = game;

    }

    //return game.getBoard();
    return game;

}

function playTo(id,moveJson) {

  var game = games[id];
  var move = libgo.json2Move(moveJson);

  // for debugging
  if (game === undefined) {

    game = libgo.newGame();
    games[id] = game;

  }

  var newBoard = game.play(move);

  //return newBoard;
  return game;

}

exports.get = function(req, res){
    res.send(JSON.stringify(getGameById(req.params.id)));
};
exports.play = function(req, res){
    res.send(JSON.stringify(playTo(req.params.id,req.body)));
};
exports.list = function(req, res){
    res.send(JSON.stringify(getGameIds()));
};


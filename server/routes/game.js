
/*
 * GET game
 */

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

      game = getInitialBoard();
      games[id] = game;

    }

    return game;

}

function getInitialBoard() {

  var mySize = 19;
  var board = [];

  for (var i=0;i<mySize;i++) {

    board[i] = [];

    for (var j=0;j<mySize;j++) {

      board[i][j] = EMPTY;

    }

  }

  board[3][4] = BLACK;
  board[5][3] = WHITE;
  board[4][6] = BLACK;
  board[3][2] = WHITE;
  board[2][3] = BLACK;
  board[8][3] = WHITE;

  return board; 

}

function playTo(id,move) {
  var game = games[id];
  game[move.row][move.col] = move.stone;
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


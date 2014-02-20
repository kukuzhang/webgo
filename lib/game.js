
/*
 * GET game
 */

var _ = require('underscore');
var libgo = require('./libgo');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var MoveSchema = new mongoose.Schema({
  type: 'String',
  stone: 'String',
  row: 'String',
  column: 'String'
});
var GameSchema = new mongoose.Schema({
  //gameId: 'String',
  black: 'String',
  white: 'String',
  timing: 'String',
  boardSize: 'Number',
  handicaps: 'Number',
  komi: 'Number',
  started: 'Number',
  board: 'String',
  scoring: 'String',
  moves: [MoveSchema]
});
var db = mongoose.createConnection('localhost', 'webgo');
var GameModel = db.model('games', GameSchema);
var games = {}
var io;

function listGames(req,res) {

  GameModel.find().limit(20).exec(function (err,docs) {
    
    res.json(docs);

  })

}

function model2Game(model) {

  var s = model.boardSize;
  var t = model.board && JSON.parse(model.board);
  var scoring = model.scoring && JSON.parse(model.scoring);
  var timing = model.timing && JSON.parse(model.timing);
  //model.board = undefined;
  model.timing = undefined;
  model.scoring = undefined;
  var game = libgo.newGame(model);
  game.timing = timing;
  game.scoring = scoring;

  if (t) {
    var board = libgo.newBoard(s,t.stones);
    game.boards[game.moves.length] = board;
  }
  else {console.log('wrong',model);}

  return game;

}

function game2Model(game) {

  var board = game.getBoard();
  var model = new GameModel({
    black: game.black.name,
    white: game.white.name,
    boardSize: game.boardSize,
    handicaps: game.handicaps,
    komi: game.komi,
    started: game.started,
    timing: JSON.stringify(game.timing),
    board: JSON.stringify(board),
    scoring: JSON.stringify(game.scoring),
    moves: game.moves
  });
  console.log('created model',model);

  return model;

}

function createGame (req,res) {

    var game = libgo.newGame({started:new Date().getTime()});
    var gameModel = game2Model(game);

    gameModel.save(function (err, doc) {

      if(err || !doc) {

        throw 'Error';

      } else {

        console.log(doc);
        game.gameId = doc._id;
        games[game.gameId] = game;
        res.json({id: doc._id});

      }

    });

}

function socketMove(socket,data) {

  var username = socket.handshake.username;
  var gameId = data.gameId;
  var moveObj = data.move;
  console.log('received move:', gameId,username,moveObj);

  getGameAndSocketErrors(gameId,socket, function (game,model) {

    var ev = { type: 'move', index: game.moves.length, move: moveObj };

    if (game.myColor(username) !== moveObj.stone) {

      var color = libgo.longColor(game.getTurn());
      console.log(game.getTurn(), color);
      var player = game[color] || {};
      var expected = player.name;
      var msg = username + ' is not allowed to play moves of ' + expected;
      socket.emit('error', msg);

      return;

    }

    moveObj.timestamp = new Date().getTime();
    var move = libgo.newMove(moveObj);

    try {

      game.play(move);

    } catch (e) {

      socket.emit('error',e.message);

      return;

    }

    model.moves=game.moves.map(function (move) {return move;});
    model.board = JSON.stringify(game.getBoard());
    model.save( function (err,numAffected) {

      socket.broadcast.to(gameId).emit('event',ev);
      socket.emit('event',ev);

    });

  });

}

function getGameById(id,cb) {

  try {

    var oId = ObjectId(id);

  } catch (e) {

    cb(e,null);

    return

  }       

  GameModel.find({_id:oId}, cb);

}

function getGameAndHandleErrors(id,res,cb) {

  getGameById(id, function (err, docs) {

    if (err) {

      res.status(500).send(err);
      
    } else if (!docs) {

      res.status(404).send('Not found');

    } else {

      var doc = docs[0];
      var game = model2Game(doc);
      cb(game,doc);

    }

  });

}

function getGameAndSocketErrors(id,socket,cb) {

  getGameById(id, function (err, docs) {

    if (err) {

      socket.emit('error',err);
      
    } else if (!docs) {

      socket.emit('error','Not found');

    } else {

      var doc = docs[0];
      var game = model2Game(doc);;
      cb(game,doc);

    }

  });

}

function retrieveGame(req, res){

  getGameAndHandleErrors(req.params.id,res, function (game) {

    res.json(game);

  });

};

function socketGetGame(socket,gameId) {

  console.log('received game will emit soon');
  getGameAndSocketErrors(gameId,socket, function (game) {

    var out = _.extend({},game,{boards:[]});
    socket.join(gameId);
    console.log('emitting game');
    socket.emit('game',out);

  });

}

function socketConfigure(socket,configuration) {

}

function socketScore(socket,scoring) {

  var gameId = scoring.gameId;
  var points = scoring.points;

  getGameAndSocketErrors(gameId, socket, function (game,model) {

    var state = game.getState();

    if (state.state !== 'scoring') {
      
      var msg = 'Scoring is not allowed in state ' + state.state;
      socket.emit('error', msg);

      return;

    }

    // TODO: authenticate
    game.scoring.blackAgree = scoring.blackAgree === undefined ?
      game.scoring.blackAgree : scoring.blackAgree;
    game.scoring.whiteAgree = scoring.whiteAgree === undefined ?
      game.scoring.whiteAgree : scoring.whiteAgree;
    game.scoring.points = points;

    model.scoring = JSON.stringify(game.scoring);
    var ev = _.extend({ type: 'score'}, game.scoring);
    model.save( function (err,numAffected) {

      socket.broadcast.to(gameId).emit('event',ev);
      socket.emit('event',ev);

    });

  });

}

function socketDisconnect(socket,id) {

  console.log('disconnect');
  /*
  for (var gameId in socket.get('joined')) {
    joiners[gameId][so
  */

}

function setupConnection(socket, x) {

  function bindToSocket(f) { return function (data) { f(socket,data); }; }

  socket.on('move', bindToSocket(socketMove));
  socket.on('game', bindToSocket(socketGetGame));
  socket.on('score', bindToSocket(socketScore));
  socket.on('configure', bindToSocket(socketConfigure));
  socket.on('disconnect', bindToSocket(socketDisconnect));

}

exports.setupConnection = setupConnection;
exports.get = retrieveGame;
exports.createGame = createGame;
exports.list = listGames;


var libgo = require('./libgo');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var MoveSchema = new mongoose.Schema({
  type: 'String',
  stone: 'String',
  row: 'String',
  timestamp: 'Number',
  column: 'String'
});
var GameSchema = new mongoose.Schema({
  //gameId: 'String',
  black: 'String',
  white: 'String',
  timing: 'String',
  blackPrisoners: 'Number',
  whitePrisoners: 'Number',
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

function PersistentGame(game,oid,cb) {

  var self = this;

  if (game) {

    var obj = {};
    setObjFromGame(obj,game);
    var model = new GameModel(obj);
    this.model = model;
    this.game = game;
    model.save( function (err) { cb(err,self);} );

  } else if (oid) {

    try {

      var oId = ObjectId(oid);

    } catch (e) {

      cb(e,null);

      return

    }       

    GameModel.find({_id:oId}, function (err,docs) {

      if (docs && docs.length == 1) {

        self.model = docs[0];
        self.game = model2Game(self.model);
        cb(err,self);

      } else {

        if (err) {

          cb(err,null);

        } else {

          err = new Error ('Not found');
          err.status = 404;
          cb(err,null);

        }

      }

    });

  } else {

    throw new Error('Either game or oid must be specified');

  }

}

PersistentGame.prototype.getId = function() {

  return this.model._id.toString();

};

PersistentGame.prototype.save = function(cb) {

  setObjFromGame(this.model,this.game);
  this.model.save(cb);

}

PersistentGame.listGames = function (limit,skip,cb) {

  GameModel.find().limit(20).exec(cb);

};

PersistentGame.fromGame = function (game,cb) {

  return new PersistentGame(game,null,cb);

};

PersistentGame.fromId = function (id,cb) {

  return new PersistentGame(null,id,cb);

};

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

  game._id = model._id;

  return game;

}

function setObjFromGame(obj,game) {

  obj.black = game.black.name;
  obj.white = game.white.name;
  obj.boardSize = game.boardSize;
  obj.handicaps = game.handicaps;
  obj.komi = game.komi;
  obj.started = game.started;
  obj.timing = JSON.stringify(game.timing);
  obj.board = JSON.stringify(game.getBoard());
  obj.scoring = JSON.stringify(game.scoring);
  obj.moves = game.moves;

  return obj;

}

exports.PersistentGame = PersistentGame;


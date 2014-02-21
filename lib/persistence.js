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
  blackPrisoners: 'Number',
  whitePrisoners: 'Number',
  boardSize: 'Number',
  handicaps: 'Number',
  komi: 'Number',
  started: 'Number',
  timeMain: 'Number',
  timeExtraPeriods: 'Number',
  timePeriodLength: 'Number',
  timeStonesPerPeriod: 'Number',
  scoreBoard: 'String',
  scoreOkBlack: 'Boolean',
  scoreOkWhite: 'Boolean',
  configurationOkBlack: 'Boolean',
  configurationOkWhite: 'Boolean',
  boards: ['String'],
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

  var game = libgo.newGame(model);

  game.boards = model.boards.map(function (stoneString) {
    return libgo.newBoard(model.boardSize,function (i) {
      return stoneString[i];
    });
  });
  game.scoreBoard = model.scoreBoard.split("");

  return game;

}

function setObjFromGame(obj,game) {

  obj.black = game.black;
  obj.white = game.white;
  obj.boardSize = game.boardSize;
  obj.handicaps = game.handicaps;
  obj.komi = game.komi;
  obj.started = game.started;
  obj.timeMain = game.timeMain;
  obj.timeExtraPeriods = game.timeExtraPeriods;
  obj.timePeriodLength = game.timePeriodLength;
  obj.timeStonesPerPeriod = game.timeStonesPerPeriod;
  obj.scoreOkBlack = game.scoreOkBlack;
  obj.scoreOkWhite = game.scoreOkWhite;
  obj.configurationOkBlack = game.configurationOkBlack;
  obj.configurationOkWhite = game.configurationOkWhite;
  obj.moves = game.moves;
  obj.scoreBoard = game.scoreBoard.join();
  obj.boards = [];

  for (var i = 0; i < game.boards.length; i++) {

    obj.boards[i] = game.boards[i].stones.join("");

  }

  return obj;

}

exports.PersistentGame = PersistentGame;


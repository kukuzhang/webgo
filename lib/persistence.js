var libgo = require('./libgo');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var async = require('async');
var db = mongoose.createConnection('localhost', 'webgo');

var UserSchema = new mongoose.Schema({
  provider:'String',
  id:'String',
  lastActive:'String',
  verified_email: 'Boolean',
  name:'String',
  family_name:'String',
  given_name:'String',
  middle_name:'String',
  email: 'String',
  picture: 'String',
  gender: 'String',
  locale: 'String',
  token: 'String'
});

var MoveSchema = new mongoose.Schema({
  type: 'String',
  stone: 'String',
  row: 'String',
  timestamp: 'Number',
  column: 'String'
});
var GameSchema = new mongoose.Schema({
  //gameId: 'String',
  black: {type:'ObjectId',ref:'account'},
  white: {type:'ObjectId',ref:'account'},
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
var GameModel = db.model('games', GameSchema);
var UserModel = db.model('account', UserSchema, 'accounts');


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
        model2Game(self.model, function (game) {
          self.game = game;
          cb(err,self);
        });

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

PersistentGame.listGames = function (user,limit,skip,cb) {

  if(!user) { return cb(new Error('No user'),null); }

  var oId = user._id;
  var q = {$or:[{white:oId},{black:oId}]};
  console.log(q);

  return GameModel
    .find(q)
    .limit(20)
    .populate('white')
    .populate('black')
    .exec(cb);
  
};

PersistentGame.fromGame = function (game,cb) {

  return new PersistentGame(game,null,cb);

};
PersistentGame.fromId = function (id,cb) {

  return new PersistentGame(null,id,cb);

};

function userIds2User(id1,id2,cb) {

  UserModel.findById(id1,function (err1, u1) {

    UserModel.findById(id2, function (err2, u2) {
      
       cb(err1 || err2 || null, u1, u2);

    });

  });

}

function model2Game(model,cb) {

  var game = libgo.newGame(model);

  game.boards = model.boards.map(function (stoneString) {
    return libgo.newBoard(model.boardSize,function (i) {
      return stoneString[i];
    });
  });
  game.scoreBoard = (model.scoreBoard||"").split("");
  userIds2User(game.black,game.white, function (err, black, white) {
    game.black = black;
    game.white = white;
    cb(game);
  });

  return cb;

}

function getOidFor(user) {

  if (!user) { return null; }
  
  if (user._id instanceof ObjectId) { return user._id; }

  return ObjectId(user._id);

}

function setObjFromGame(obj,game) {

  obj.black = getOidFor(game.black);
  obj.white = getOidFor(game.white);
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
  obj.scoreBoard = game.scoreBoard.join("");
  obj.boards = [];

  for (var i = 0; i < game.boards.length; i++) {

    obj.boards[i] = game.boards[i].stones.join("");

  }

  return obj;

}

function getUserSerialization(user) {

    return user.provider + '-' + user.id;

}

function findUserBySerialization(s,done) {

    var parts = s.split('-');
    UserModel.findOne({'provider':parts[0],'id':parts[1]},  function (err, user) {
      done(err, user);
    });

}

exports.getUserSerialization = getUserSerialization;
exports.findUserBySerialization = findUserBySerialization;
exports.PersistentGame = PersistentGame;
exports.User = UserModel;

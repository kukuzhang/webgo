
/*
 * GET game
 */

var _ = require('underscore');
var libgo = require('./libgo');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var GameSchema = new mongoose.Schema({
  //gameId: 'String',
  black: 'String',
  white: 'String',
  boardSize: 'Number',
  handicaps: 'Number',
  moves: ['String']
});
var db = mongoose.createConnection('localhost', 'webgo');
var GameModel = db.model('games', GameSchema);
var games = {}
var io;

function listGames(req,res) {

  GameModel.find().limit(20).exec(function (err,docs) {
    
    res.json(docs);

  })

/*
GameModel.findById(pollId, '', { lean: true }, function(err, poll) {
*/

}

function createGame (req,res) {

    var game = libgo.newGame({});
    var gameModel = new GameModel({
      black: game.black.name,
      white: game.white.name,
      boardSize: game.boardSize,
      handicaps: game.handicaps,
      moves: game.moves
    });

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
  console.log('data', data);
  console.log('username',username);
  console.log('gameId',gameId);
  var moveJson = data.move;

  getGameAndSocketErrors(gameId,socket, function (game,model) {

    var ev = { index: game.moves.length, move: moveJson };

    if (game.myColor(username) !== moveJson.stone) {

      var color = libgo.longColor(game.getTurn());
      console.log(scope);
      console.log(game.getTurn(), color);
      var player = game[color] || {};
      var expected = player.name;
      var msg = username + ' is not allowed to play moves of ' + expected;
      socket.emit('error', msg);

      return;

    }

    var move = libgo.json2Move(moveJson);

    try {

      console.log(move);
      console.log(game.moves);
      game.play(move);
      console.log(typeof(move));
      console.log(typeof(game.moves[0]));

    } catch (e) {

      socket.emit('error',e.message);

      return;

    }

    console.log(model instanceof GameModel, model);

    var oId = ObjectId(game._id);
    var spec = {_id:oId};
    model.moves=game.moves.map(function (move) {return move.toString();});
    model.save( function (err,numAffected) {
    //var update = {$set:{moves:_.map(game.moves,function (x) {return JSON.stringify(x);})}};
    //console.log('update',spec,update);
    //GameModel.update(spec,update,function (err,numAffected) {

      console.log('saved',err,numAffected);
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
      var game = libgo.newGame(doc);
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
      var game = libgo.newGame(doc);
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

  getGameAndSocketErrors(gameId,socket, function (game) {

    var out = _.extend({},game,{boards:[]});
    socket.join(gameId);
    socket.emit('game',out);

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
  socket.on('disconnect', bindToSocket(socketDisconnect));

}

exports.setupConnection = setupConnection;
exports.get = retrieveGame;
exports.createGame = createGame;
exports.list = listGames;


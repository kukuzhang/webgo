
/*
 * GET game
 */

var _ = require('underscore');
var libgo = require('./libgo');
var PersistentGame = require('./persistence').PersistentGame;
var io;

function listGames(req,res) {

  PersistentGame.listGames(20,0,function (err,docs) {
    
    res.json(docs);

  })

}

function createGame (req,res) {

  var game = libgo.newGame({started:new Date().getTime()});

  PersistentGame.fromGame(game, function (err, pGame) {

    if (err) {

      throw new Error(err);

    } else {

      res.json({id: pGame.getId()});

    }

  });

}

function realMoveFromData(data) {

  return libgo.newMove(_.extend({},data,{timestamp:new Date().getTime()}));

}

function socketMove(socket,data) {

  var username = socket.handshake.username;
  var gameId = data.gameId;
  var move = realMoveFromData(data.move);
  console.log('received',move);

  PersistentGame.fromId(gameId,socketErrorHandlerFactory(socket,
        function (pGame) {

    var ev = { type: 'move', index: pGame.game.moves.length, move: move };

    if (pGame.game.myColor(username) !== move.stone) {

      var color = libgo.longColor(pGame.game.getTurn());
      var player = pGame.game[color] || {};
      var expected = player.name;
      var msg = username + ' is not allowed to play moves of ' + expected;
      socket.emit('error', msg);

      return;

    }

    try {

      pGame.game.play(move);

    } catch (e) {

      socket.emit('error',e.message);

      return;

    }

    pGame.save( function (err,numAffected) {


      if (err) {

        console.log(err,err[0],Object.keys(err));
        socket.emit('error',err);

      } else {

        socket.broadcast.to(gameId).emit('event',ev);
        socket.emit('event',ev);

      }

    } );

  }));

}

function retrieveGame(req, res){

  PersistentGame.fromId(req.params.id, httpErrorHandlerFactory(res,
        function (pGame) { res.json(pGame.game); }));

};

function socketGetGame(socket,gameId) {

  console.log('received game will emit soon');
  PersistentGame.fromId(gameId, socketErrorHandlerFactory(socket,
        function (pGame) {

    //var out = _.extend({},pGame.game,{boards:[]});
    socket.join(gameId);
    console.log('emitting game');
    socket.emit('game',pGame.game);

  }));

}

function socketConfigure(socket,configuration) {

}

function socketScore(socket,scoring) {

  var gameId = scoring.gameId;
  var points = scoring.points;

  PersistentGame.fromId(gameId, socketErrorHandlerFactory(socket,
        function (pGame) {

    var state = pGame.game.getState();

    if (state.state !== 'scoring') {
      
      var msg = 'Scoring is not allowed in state ' + state.state;
      socket.emit('error', msg);

      return;

    }

    // TODO: authenticate
    pGame.game.scoring.blackAgree = scoring.blackAgree === undefined ?
      pGame.game.scoring.blackAgree : scoring.blackAgree;
    pGame.game.scoring.whiteAgree = scoring.whiteAgree === undefined ?
      pGame.game.scoring.whiteAgree : scoring.whiteAgree;
    pGame.game.scoring.points = points;
    pGame.save(function (err) {

      if (err) {

        socket.emit('error',err);

      } else {

        var ev = _.extend({ type: 'score'}, game.scoring);
        socket.broadcast.to(gameId).emit('event',ev);
        socket.emit('event',ev);

      }

    });

  }));

}

function httpErrorHandlerFactory(res,cb) {

  return function (err, pGame) {

    if (err) {

      res.status(err.status||500).send(err);
      
    } else {

      cb(pGame);

    }

  }

}

function socketErrorHandlerFactory(socket,cb) {

  return function (err, pGame) {

    if (err) {

      socket.emit('error',err);
      
    } else {

      cb(pGame);

    }

  }

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


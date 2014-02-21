
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

  var game = libgo.newGame();

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

      throw e;
      console.log(e);
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

  PersistentGame.fromId(gameId, socketErrorHandlerFactory(socket,
        function (pGame) {

    //var out = _.extend({},pGame.game,{boards:[]});
    socket.join(gameId);
    console.log('emitting game ',gameId);
    socket.emit('game',pGame.game);

  }));

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

        console.log('auth error');
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

      if (typeof err === 'string') { err = {msg:err}; }
      socket.emit('error',err);
      
    } else {

      cb(pGame);

    }

  }

}

function socketConfigure(socket,configuration) {

  var gameId = configuration.gameId;
  var username = socket.handshake.username;
  var configurationAttributes = {
    'white':1,
    'black':1,
    'boardSize':1,
    'komi':1,
    'handicaps':1,
    'timeMain':1,
    'timeExtraPeriods':1,
    'timeStonesPerPeriod':1,
    'timePeriodLength':1,
    'accept':1
  };

  console.log('got configuration from ' + username + '.',configuration);
  PersistentGame.fromId(gameId, socketErrorHandlerFactory(socket,
        function (pGame) {

          var changed = false;
          var accept = configuration.accept;
          delete configuration.accept;

          for (var attr in configurationAttributes) {

            if (pGame.game[attr] != configuration[attr]) {

              changed = true;

            }

            pGame.game[attr] = configuration[attr];

          }

          if (configuration.black === username) {

            pGame.game.configurationOkBlack = accept;

            if (changed) pGame.game.configurationOkWhite = false;

          } else if (configuration.white === username) {

            pGame.game.configurationOkWhite = accept;

            if (changed) pGame.game.configurationOkBlack = false;

          } else {

            var msg = username + ' cannot configure game of ' +
              configuration.black + ' and ' + configuration.white + '.';
            socket.emit('error',{message:msg});

            return;

          }

          if (pGame.game.configurationOkBlack === true &&
              pGame.game.configurationOkWhite === true) {
            pGame.game.started = new Date().getTime();
          }
          pGame.save( function (err,numAffected) {

            if (err) {

              socket.emit('error',err);

            } else {

              socket.broadcast.to(gameId).emit('game',pGame.game);
              socket.emit('game',pGame.game);

            }
          })

        }));

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


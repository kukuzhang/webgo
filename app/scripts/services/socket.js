'use strict';

angular.module('aApp')
  .service('GameSocket', ['socketio', 'libgo', '$location', 'underscore',
      '$http', '$rootScope',
      function Socket(io, libgo, $location, _, $http, $rootScope) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    var mySocket;
    var myGameId;
    var game;
    var self = this;

    function updateByError (data) {

      $rootScope.$apply(function() { $rootScope.error = data; });

    }

    function receiveGame(data) {
      
      game = libgo.newGame(data);
      routeByGameState(game.getState());
      
    }
    function setConnectionStatus() {

      $rootScope.$apply(internalSetConnectionStatus);

    }

    function internalSetConnectionStatus () {

      $rootScope.connection = self.getConnectionStatus();

      if (self.isConnected()) { self.requestGame(); }

    }

    function routeByGameState(state) {

      console.log('game state now',state.state);

      var url = null;
      
      if (state.state === 'configuring') {

        url = '/game/' + myGameId + '/configure';

      }  else if (state.state === 'playing') {

        url = '/game/' + myGameId;

      }  else if (state.state === 'scoring') {

        url = '/game/' + myGameId + '/score';

      }  else if (state.state === 'end') {

        url = '/game/' + myGameId + '/score';

      }

      console.log('route to',url);
      $location.path(url);

    }

    this.setGameId = function (gameId) {

      console.log('set gameId', gameId);
      this.gameId = gameId;

    };

    this.getConnectionStatus = function () {

      if (!mySocket) { return 'no socket'; }

      if (!mySocket.socket.connected) { return 'disconnected'; }

      if (mySocket.socket.connecting) { return 'connecting'; }

      return mySocket.socket.transport.name;

    };

    this.isConnected = function () {
      return mySocket && mySocket.socket.connected;
    };


    this.on = function (ev,cb) {

      console.log('listening to', ev);
      return mySocket.on(ev,cb);

    };

    this.off = function (ev,cb) {

      console.log('unlistening to', ev);
      return mySocket.removeListener(ev,cb);

    };

    this.emit = function (ev,data) {

      console.log('emiting', ev);
      $rootScope.$apply(function() { $rootScope.error = data; });
      return mySocket.emit(ev,data);

    };

    this.score = function (options) {

      var dflt = { type : 'configure', gameId : myGameId };
      var data = _.extend(dflt,options);
      console.log('emitting',data);
      mySocket.emit('score',data);

    };

    this.requestGame = function () {
      console.log('=> refresh game', myGameId);
      mySocket.emit('game', myGameId);
    };

    this.configure = function (options) {

      var dflt = { type : 'configure', gameId : myGameId };
      var config = _.extend(dflt,options);
      console.log('configure', config);
      mySocket.emit('configure', config);

    };

    this.move = function (move) {

      var msg = { gameId: myGameId, move: move };
      console.log('emit move',move);
      mySocket.emit('move',msg);

    };

    this.getGame = function () {

      return game;

    };

    this.connect = function (gameId) {

      console.log(gameId);

    };

    this.retrieve = function (gameId,cb) {

      if (game) {

        cb(game);

      } else {

        var url = 'http://localhost:3000/api/game/'+gameId;

        return $http.get(url,{cache:true})
          .success(function (data) {
            game = libgo.newGame(data);
            cb(game);
          })
          .error(function (data) { console.log('error',data); });

      }

    };

    this.connectTo = function (gameId, user, pwd) {

      var auth = user + ":" + pwd;
      console.log('connecting websocket:', gameId,user);

      if (myGameId) {

        if (myGameId == gameId) { return; }

        throw new Error('Already connected to ' + myGameId + '.');

      }

      myGameId = gameId;
      mySocket = io.connect('http://localhost:3000/', {query:'auth=' + auth});

      var listeners = {
        'error':updateByError,
        'game':receiveGame,
        'connect_failed':setConnectionStatus,
        'connect':setConnectionStatus,
        'disconnect':setConnectionStatus,
        'connecting': setConnectionStatus,
        'reconnect_failed': setConnectionStatus,
        'reconnect': setConnectionStatus,
        'reconnecting': setConnectionStatus
      };

      for (var ev in listeners) { mySocket.on(ev,listeners[ev]); }

    }

    internalSetConnectionStatus();

  }]);

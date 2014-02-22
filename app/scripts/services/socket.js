'use strict';

angular.module('aApp')
  .service('GameSocket', ['socketio', '$routeParams', 'libgo', '$location', 'underscore',
      function Socket(io,$routeParams, libgo, $location,_) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    function routeByGameState(state) {

      console.log('game state now',state.state);

      var url = null;
      
      if (state.state === 'configuring') {

        url = '/game/' + $routeParams.gameId + '/configure';

      }  else if (state.state === 'playing') {

        url = '/game/' + $routeParams.gameId;

      }  else if (state.state === 'scoring') {

        url = '/game/' + $routeParams.gameId + '/score';

      }  else if (state.state === 'end') {

        url = '/game/' + $routeParams.gameId + '/score';

      }

      console.log('route to',url);
      $location.path(url);

    }

    this.setGameId = function (gameId) {

      console.log('set gameId', gameId);
      this.gameId = gameId;

    }

    this.getConnectionStatus = function () {

      if (!mySocket.socket.connected) { return 'disconnected'; }

      if (mySocket.socket.connecting) { return 'connecting'; }

      return mySocket.socket.transport.name;

    }

    this.isConnected = function () { return mySocket.socket.connected; };


    this.on = function (ev,cb) {

      console.log('listening to', ev);
      return mySocket.on(ev,cb);

    }

    this.off = function (ev,cb) {

      console.log('unlistening to', ev);
      return mySocket.removeListener(ev,cb);

    }

    this.emit = function (ev,data) {

      console.log('emiting', ev);
      return mySocket.emit(ev,data);

    }

    this.score = function (options) {

      var dflt = { type : 'configure', gameId : $routeParams.gameId };
      var data = _.extend(dflt,options);
      console.log('emitting',data);
      mySocket.emit('score',data);

    };

    this.requestGame = function () {
      console.log('=> refresh game', $routeParams.gameId);
      mySocket.emit('game', $routeParams.gameId);
    };

    this.configure = function (options) {

      var dflt = { type : 'configure', gameId : $routeParams.gameId };
      var config = _.extend(dflt,options);
      console.log('configure', config);
      mySocket.emit('configure', config);

    };

    this.move = function (move) {

      var msg = { gameId: $routeParams.gameId, move: move };
      console.log('emit move',move);
      mySocket.emit('move',msg);

    };

    this.getGame = function () {

      return game;

    }
    this.getUserName = function (usename) { return this.userName; };
    var auth = $routeParams.auth || 'black:123';
    this.userName = auth.split(':')[0];
    var mySocket = io.connect('http://localhost:3000/', {query:'auth=' + auth});
    var game;

    console.log('connecting websocket:', this.userName);

    mySocket.on('game', function (data) {
      
      console.log('received game', data);
      game = libgo.newGame(data);
      routeByGameState(game.getState());
      
    });

  }]);

'use strict';

angular.module('aApp')
  .service('Socket', ['socketio', '$routeParams', function Socket(io,$routeParams) {
    // AngularJS will instantiate a singleton by calling "new" on this function

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

    this.getUserName = function (usename) { return this.userName; };

    var auth = $routeParams.auth || 'black:123';
    this.userName = auth.split(':')[0];
    var mySocket = io.connect('http://localhost:3000/', {query:'auth=' + auth});
    console.log('connecting websocket:', this.userName);

  }]);

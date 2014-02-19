'use strict';

angular.module('aApp')
  .controller('GameCtrl', ['$scope', '$routeParams', 'libgo',
          'underscore','socketio',
  function ($scope, $routeParams, libgo, _, io) {

    function initSocketIO() {

      var auth = $routeParams.auth || 'juho:123';
      $scope.username = auth.split(':')[0];
      var q = 'auth=' + auth;
      var s = io.connect('http://localhost:3000/', {query:q});
      s.on('game', updateGame);
      s.on('event',updateByEvent);
      s.on('error',updateByError);
      s.on('connect_failed',setConnectionStatus);
      s.on('connect',setConnectionStatus);
      s.on('disconnect',setConnectionStatus);
      s.on('connecting', setConnectionStatus);
      s.on('reconnect_failed', setConnectionStatus);
      s.on('reconnect', setConnectionStatus);
      s.on('reconnecting', setConnectionStatus);

      //socket.on('error', function () {}) - "error" is emitted when an error occurs and it cannot be handled by the other event types.
      //socket.on('message', function (message, callback) {}) - "message" is emitted when a message sent with socket.send is received. message is the sent message, and callback is an optional acknowledgement function.

      return s;

    }

    function setConnectionStatus() {

      /* jshint validthis:true */
      $scope.$apply(function () { $scope.connection = connectionStatus(); });
      setTurn(null);

      if (this.socket.connected === true) {

        console.log('=> game', $routeParams.gameId);
        this.emit('game', $routeParams.gameId);

      }

    }

    function connectionStatus() {

      var s = socket.socket;

      if (!s.connected) { return 'disconnected'; }

      if (s.connecting) { return 'connecting'; }

      return s.transport.name;

    }

    function setTurn(turn) {

      console.log(turn);
      $scope.turn = turn;
      $scope.black = {
        name: game.black.name,
        timing: game.black.timing,
        color: 'black',
        turn: turn === libgo.BLACK
      };
      $scope.white = {
        name: game.white.name,
        timing: game.white.timing,
        color: 'white',
        turn: turn === libgo.WHITE
      };

    }

    function game2Scope () {

      $scope.stones = game.getBoard().stones;
      setTurn(game.getTurn());
      console.log('Last move: ', game.moves[game.moves.length - 1]);
      console.log('Turn: ', $scope.turn);
      var board = game.getBoard();
      $scope.stones = board.stones.map(function (row) {
        return row.map(function(col) { return col; });
      });

    }

    function updateGame (data) {

      $scope.error = null;
      console.log('received game', data);
      game = libgo.newGame(data);
      $scope.$apply(game2Scope);

    }

    function updateByError (data) {

      $scope.$apply(function() {

        $scope.error = data;
        game2Scope();
        
      });

    }

    function updateByEvent (data) {

      $scope.error = null;
      console.log('received move', data);
      if (data.index === game.moves.length) {

        var move = libgo.json2Move(data.move);
        game.play(move);
        $scope.$apply(game2Scope);

      } else {

        console.log(game.moves);
        console.log('Moves not in sync???');
        socket.emit('game', $routeParams.gameId);

      }

    }

    function apiPlay(options) {

      var move = _.extend({
        stone: $scope.turn,
        type: 'stone'
      },options);
      var msg = { gameId: $routeParams.gameId, move: move };
      if (!move.stone) { throw new Error('Invalid stone',move.stone); }
      console.log('move',msg);
      socket.emit('move',msg);
      setTurn(null);

    }

    function hoverIn (row,column) {

      console.log ($scope.turn, game.myColor($scope.username), $scope.turn);
      if (!$scope.turn ||
        (game.myColor($scope.username) !== $scope.turn)) { return; }

      var json = {type:'stone',stone:$scope.turn,row:row,column:column};
      var move = libgo.json2Move(json);
      var canPlay = game.isMoveOk(move);
      
      if (canPlay) {

        $scope.stones[row][column] = ($scope.turn === libgo.WHITE) ?
          libgo.WHITE_HOVER: libgo.BLACK_HOVER;

      }

    }

    function hoverOut(row,column) {

      if (!$scope.turn ||
        (game.myColor($scope.username) !== $scope.turn)) { return; }

      $scope.stones[row][column] = game.getBoard().stones[row][column];

    }

    //var newGameStream = Bacon.fromPromise(wre);
    var game = libgo.newGame();
    game2Scope();
    $scope.showCoords = true;
    $scope.connection = 'disconnected';
    var socket = initSocketIO();
    $scope.hover = hoverIn;
    $scope.hoverOut = hoverOut;
    $scope.action = function (action) { apiPlay({type:action}); };
    $scope.play = function (row,column) { apiPlay({row:row,column:column}); };
    $scope.actions = [
      {name:'pass',label:'Pass'},
      {name:'resign',label:'Resign'}
    ];

  }]);

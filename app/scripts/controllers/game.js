'use strict';

angular.module('aApp')
  .controller('GameCtrl', ['$scope', '$routeParams', 'libgo',
          'underscore','socketio',
  function ($scope, $routeParams, libgo, _, io) {

    function action (actionId) {

      if (actionId === 'done') { emitScoring(true); }

      else if (actionId === 'back-to-game') { backToGame(); }

      else { apiPlay({type:actionId}); }

    }

    function backToGame() {

    }

    function emitScoring(agree) {
      
      var myColor = game.myColor($scope.username);
      var myAttr = libgo.longColor(myColor) + 'Agree';
      var data = {
        gameId:$routeParams.gameId,
        points:game.scorePoints
      };
      data[myAttr] = agree;
      console.log('emitting',data);
      socket.emit('score',data);

    }

    function togglePrisoner(row,column) {

      var g = game.markOrUnmarkAsPrisoner(row,column);
      stones2Scope();
      emitScoring(false);

    }


    function setTimings() {

      var remBlack = game.remainingMilliSeconds(libgo.BLACK);
      var remWhite = game.remainingMilliSeconds(libgo.WHITE);
      var interval = (game.getTurn() === libgo.BLACK ?  remBlack : remWhite) % 1000;
      $scope.blackTime = Math.floor(remBlack / 1000);
      $scope.whiteTime = Math.floor(remWhite / 1000);

      if (!interval) {interval = 1000;}

      setTimeout(function () {$scope.$apply(function() {setTimings();});}, interval);

    }

    function initSocketIO() {

      var auth = $routeParams.auth || 'black:123';
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

      var s = this.socket;
      $scope.$apply(function () { $scope.connection = connectionStatus(s); });
      setTurn(null);

      if (s.connected === true) {

        console.log('=> refresh game', $routeParams.gameId);
        this.emit('game', $routeParams.gameId);

      }

    }

    function connectionStatus(s) {

      if (!s.connected) { return 'disconnected'; }

      if (s.connecting) { return 'connecting'; }

      return s.transport.name;

    }

    function setTurn(turn) {

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

    function play2Point(row,column) { apiPlay({row:row,column:column}); }

    function game2Scope () {

      var state = game.getState();
      console.log('state now',state);
      setTurn(state.turn);

      if (state.state === 'scoring') {

        $scope.clickAction = togglePrisoner;

        if (!game.scoring.points) {
          game.scoring.points = game.getInitialScoring();
        }

        $scope.actions = [
          {name:'done',label:'Done'},
          {name:'back-to-game',label:'Back to game'}
        ];

      } else if (state.state === 'end') {

        var how = state.reason == 'resign' ? 'resignation' :
          state.reason == 'time' ? 'time' :
          state.reason == 'points' ? state.points + " points (" + state.black + " - "
                                     + state.white + ")":
          state.reason;

        $scope.clickAction = function () {};
        $scope.actions = [ ];
        $scope.error = "Game over. " + libgo.longColor(state.winner) + " won by " + how;

      } else {

        $scope.clickAction = play2Point;
        $scope.actions = [
          {name:'pass',label:'Pass'},
          {name:'resign',label:'Resign'}
        ];

      }

      $scope.blackPrisoners = game.blackPrisoners;
      $scope.whitePrisoners = game.whitePrisoners;
      stones2Scope();
      console.log($scope.blackPrisoners, game.blackPrisoners);
      console.log($scope.whitePrisoners, game.whitePrisoners);

    }

    function stones2Scope() {

      var board = game.getBoard();
      $scope.stones = [];

      for (var row=0; row < board.boardSize; row++) {

        $scope.stones[row] = [];

        for (var column=0; column < board.boardSize; column++) {

            var score = game.scorePoint(board.point2Index(row,column));
            var stone = board.getStone(row,column);
            $scope.stones[row][column] = score || stone;

        }

      }

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

      console.log('received event', data);

      if (data.type === 'move') {

        if (data.index === game.moves.length) {

          var move = libgo.newMove(data.move);
          game.play(move);
          $scope.$apply(game2Scope);

        } else {

          console.log(game.moves);
          console.log('Moves not in sync???');
          socket.emit('game', $routeParams.gameId);

        }

      } else if (data.type == 'score') {

        console.log('got scoring', data);
        game.scoring.points = data.points;
        game.scoring.blackAgree = data.blackAgree;
        game.scoring.whiteAgree = data.whiteAgree;
        $scope.$apply(game2Scope);

      }

    }

    function apiPlay(options) {

      var move = _.extend({
        stone: $scope.turn,
        type: 'stone'
      },options);
      var msg = { gameId: $routeParams.gameId, move: move };
      if (!move.stone) { throw new Error('Invalid stone',move.stone); }
      socket.emit('move',msg);
      setTurn(null);

    }

    function hoverIn (row,column) {

      if (!$scope.turn ||
        (game.myColor($scope.username) !== $scope.turn)) { return; }

      var obj = {timestamp: new Date().getTime(), type:'stone',stone:$scope.turn,row:row,column:column};
      var move = libgo.newMove(obj);
      var canPlay = game.isMoveOk(move);
      
      if (canPlay) {

        $scope.stones[row][column] = ($scope.turn === libgo.WHITE) ?
          libgo.WHITE_HOVER: libgo.BLACK_HOVER;

      }

    }

    function hoverOut(row,column) {

      if (!$scope.turn ||
        (game.myColor($scope.username) !== $scope.turn)) { return; }

      $scope.stones[row][column] = game.getBoard().getStone(row,column);

    }

    //var newGameStream = Bacon.fromPromise(wre);
    var game = libgo.newGame();
    game2Scope();
    setTimings();
    $scope.showCoords = true;
    $scope.connection = 'disconnected';
    var socket = initSocketIO();
    $scope.hover = hoverIn;
    $scope.hoverOut = hoverOut;
    $scope.action = action;
    $scope.actions = [];

  }]);

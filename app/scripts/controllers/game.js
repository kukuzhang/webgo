'use strict';

angular.module('aApp')
  .controller('GameCtrl', ['$scope', '$routeParams', 'libgo',
          'underscore', 'GameSocket',
  function ($scope, $routeParams, libgo, _, socket) {

    function action (actionId) { apiPlay({type:actionId}); }

    function setTimings() {

      var interval;
      var game = socket.getGame();

      if (game) {

        var remBlack = game.remainingMilliSeconds(libgo.BLACK);
        var remWhite = game.remainingMilliSeconds(libgo.WHITE);
        interval = (game.getTurn() === libgo.BLACK ? remBlack : remWhite) % 1000;
        $scope.blackTime = Math.floor(remBlack / 1000);
        $scope.whiteTime = Math.floor(remWhite / 1000);

      }

      if (!interval) {interval = 1000;}

      setTimeout(function () {$scope.$apply(function() {setTimings();});}, interval);

    }

    function setTurn(turn) {

      $scope.turn = turn;
      console.log('turn',turn);
      $scope.blackTurn = turn === libgo.BLACK;
      $scope.whiteTurn = turn === libgo.WHITE;

    }

    function play2Point(row,column) { apiPlay({row:row,column:column}); }

    function game2Scope () {

      var state = game.getState();
      setTurn(state.turn);
      $scope.white = game.white;
      $scope.black = game.black;
      $scope.boardSize = game.boardSize;
      $scope.komi = game.komi;
      $scope.handicaps = game.handicaps;
      $scope.timeMain = game.timeMain;
      $scope.timeExtraPeriods = game.timeExtraPeriods;
      $scope.timeStonesPerPeriod = game.timeStonesPerPeriod;
      $scope.timePeriodLength = game.timePeriodLength;
      $scope.blackPrisoners = game.blackPrisoners;
      $scope.whitePrisoners = game.whitePrisoners;
      stones2Scope();

    }

    function stones2Scope() {

      var board = game.getBoard();
      $scope.stones = [];

      for (var row=0; row < board.boardSize; row++) {

        $scope.stones[row] = [];

        for (var column=0; column < board.boardSize; column++) {

          $scope.stones[row][column] = board.getStone(row,column);

        }

      }

    }

    function updateGame () {

      $scope.error = null;
      game = socket.getGame();
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

      if (data.type !== 'move') {

        console.log('not handling event', data.type);

        return;

      }

      if (data.index === game.moves.length) {

        var move = libgo.newMove(data.move);
        game.play(move);
        $scope.$apply(game2Scope);

      } else {

        console.log(game.moves);
        console.log('Moves not in sync???');
        socket.requestGame();

      }

    }

    function apiPlay(options) {

      var move = _.extend({
        stone: $scope.turn,
        type: 'stone'
      },options);
      if (!move.stone) { throw new Error('Invalid stone',move.stone); }
      socket.move(move);
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

    var listeners = {
      'game': updateGame,
      'event':updateByEvent,
      'error':updateByError,
      //'message': null.
    };
    var game = null;
    var auth = $routeParams.auth || 'black:123';
    var parts = auth.split(':');
    $scope.username = parts[0];
    socket.connectTo($routeParams.gameId,parts[0],parts[1]);
    for (var ev in listeners) { socket.on(ev,listeners[ev]); }

    $scope.$on('destroy', function() {
      for (var ev in listeners) { socket.off(ev,listeners[ev]); }
    });

    setTurn(null);
    setTimings();
    $scope.showCoords = true;
    $scope.hover = hoverIn;
    $scope.hoverOut = hoverOut;
    $scope.action = action;
    $scope.clickAction = play2Point;
    $scope.actions = [
      {name:'pass',label:'Pass'},
      {name:'resign',label:'Resign'}
    ];

  }]);

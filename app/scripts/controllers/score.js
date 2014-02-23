'use strict';

angular.module('aApp')
  .controller('ScoreCtrl', ['$scope', '$routeParams', 'libgo',
          'underscore', 'GameSocket', 'stones2Scope',
  function ($scope, $routeParams, libgo, _, socket, stones2Scope) {

    function action (actionId) {

      if (actionId === 'done') { emitScoring(true); }

      else if (actionId === 'back-to-game') { backToGame(); }

      else { console.log(actionId); }

    }

    function backToGame() {

      console.log('should go back to game.');

    }

    function emitScoring(agree) {
      
      var game = socket.getGame();
      var myColor = game.myColor($scope.username);
      var myAttr = libgo.longColor(myColor) + 'Agree';
      var data = { scoreBoard:game.scoreBoard };
      data[myAttr] = agree;
      socket.score(data);

    }

    function togglePrisoner(row,column) {

      var game = socket.getGame();
      console.log('marking',row,column);
      game.markOrUnmarkAsPrisoner(row,column);
      console.log('new sb',game.scoreBoard);
      var board = game.getBoard();
      stones2Scope($scope,board,game.scoreBoard);
      emitScoring(false);

    }

    function game2Scope () {

      var game = socket.getGame();
      var state = game.getState();
      $scope.white = game.white;
      $scope.black = game.black;
      $scope.boardSize = game.boardSize;
      $scope.komi = game.komi;
      $scope.handicaps = game.handicaps;
      $scope.timeMain = game.timeMain;
      $scope.timeExtraPeriods = game.timeExtraPeriods;
      $scope.timeStonesPerPeriod = game.timeStonesPerPeriod;
      $scope.timePeriodLength = game.timePeriodLength;

      if (state.state === 'scoring') {

        $scope.clickAction = togglePrisoner;

        $scope.actions = [
          {name:'done',label:'Done'},
          {name:'back-to-game',label:'Back to game'}
        ];

      } else if (state.state === 'end') {

        var how = state.reason === 'resign' ? 'resignation' :
          state.reason === 'time' ? 'time' :
          state.reason === 'points' ? state.points + ' points (' +
              state.black + ' - ' + state.white + ')': state.reason;

        $scope.clickAction = function () {};
        $scope.actions = [ ];
        $scope.error = 'Game over. ' + libgo.longColor(state.winner) + ' won by ' + how;

      }

      $scope.blackPrisoners = game.blackPrisoners;
      $scope.whitePrisoners = game.whitePrisoners;
      stones2Scope($scope.game.getBoard(),game.scoreBoard);

    }

    function updateGame () {

      $scope.$apply(game2Scope);

    }

    function hoverIn (row,column) {

      var game = socket.getGame();

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

      var game = socket.getGame();

      if (!$scope.turn ||
        (game.myColor($scope.username) !== $scope.turn)) { return; }

      $scope.stones[row][column] = game.getBoard().getStone(row,column);

    }

    var listeners = {
      'game': updateGame,
      //'message': null.
    };

    var auth = $routeParams.auth || 'black:123';
    var parts = auth.split(':');
    $scope.username = parts[0];
    socket.connectTo($routeParams.gameId,parts[0],parts[1]);
    socket.routeByGameState();

    for (var ev in listeners) { socket.on(ev,listeners[ev]); }

    $scope.$on('destroy', function() {
      for (var ev in listeners) { socket.off(ev,listeners[ev]); }
    });

    $scope.showCoords = true;
    $scope.hover = hoverIn;
    $scope.hoverOut = hoverOut;
    $scope.action = action;
    $scope.actions = [];
    game2Scope();

  }]);

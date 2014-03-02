'use strict';

angular.module('aApp')
  .controller('ScoreCtrl', ['$scope', '$routeParams', 'libgo',
          'underscore', 'GameSocket','Geometry', 'stones2Scope', 'identity',
  function ($scope, $routeParams, libgo, _, socket, Geometry, stones2Scope, identity) {

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
      var data = { scoreBoard:game.scoreBoard, accept:agree };
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
      if (!game) return;
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
      $scope.blackPrisoners = game.blackPrisoners;
      $scope.whitePrisoners = game.whitePrisoners;

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
      stones2Scope($scope,game.getBoard(),game.scoreBoard);

    }

    function updateGame () {

      console.log('je');
      $scope.$apply(game2Scope);

    }

    var listeners = {
      'game': updateGame,
      //'message': null.
    };
    $scope.$watch('boardPixels', function () {

      var cells = ($scope.boardSize || 19) + 2;
      $scope.stoneSize = Math.floor($scope.boardPixels / cells);
      console.log('newSize',$scope.boardPixels, $scope.boardSize, $scope.stoneSize);
      
    });

    socket.connectTo($routeParams.gameId);
    socket.routeByGameState();

    for (var ev in listeners) { socket.on(ev,listeners[ev]); }

    $scope.$on('destroy', function() {
      for (var ev in listeners) { socket.off(ev,listeners[ev]); }
    });
    $scope.error = null;
    $scope.showCoords = true;
    $scope.action = action;
    $scope.actions = [];
    game2Scope();

  }]);

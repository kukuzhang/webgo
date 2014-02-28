'use strict';

angular.module('aApp')
  .controller('BrowserCtrl', ['$scope', '$routeParams', 'libgo', '$location', 'GameSocket', 'Geometry', 'stones2Scope',
  function ($scope, $routeParams, libgo, $location, socket, stones2Scope) {

    function setTurn(turn) {

      $scope.turn = turn;
      $scope.blackTurn = turn === libgo.BLACK;
      $scope.whiteTurn = turn === libgo.WHITE;

    }

    function game2Scope () {

      var game = socket.getGame();

      if (!game) { return; }

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
      var board;
      var i = $routeParams.moveIndex;

      if (i>=0 && i<game.moves.length) {
        
        board = game.getBoard(i);

      } else {

        board = game.getBoard();

      }
      stones2Scope($scope,board);

    }

    socket.retrieve($routeParams.gameId,game2Scope);
    $scope.showCoords = true;
    $scope.connection = 'disconnected';
    $scope.action = function (a) {
      var i = $routeParams.moveIndex;
      if (a === 'prev') {
        i--;
      } else if (a === 'next') {
        i++;
      } else {
        console.log(a);
      }
      $location.path('/game/' + $routeParams.gameId + '/browse/' + i);
    };
    $scope.actions = [
      {name:'prev',label:'<'},
      {name:'next',label:'>'}
    ];

  }]);

'use strict';

angular.module('aApp')
  .controller('BrowserCtrl', ['$scope', '$routeParams', '$http', 'libgo',
  function ($scope, $routeParams, $http, libgo) {

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

    $http.get('http://localhost:3000/game/'+$routeParams.gameId)
      .success(function (data) { console.log('ok',data); })
      .error(function (data) { console.log('error',data); });
    var game = libgo.newGame();
    game2Scope();
    $scope.showCoords = true;
    $scope.connection = 'disconnected';
    $scope.action = function () {  };
    $scope.actions = [
      {name:'prev',label:'<'},
      {name:'next',label:'>'}
    ];

  }]);

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

      stones2Scope();
      setTurn(game.getTurn());
      console.log('Last move: ', game.moves[game.moves.length - 1]);
      console.log('Turn: ', $scope.turn);
      var board = game.getBoard();
      $scope.stones = board.stones.map(function (row) {
        return row.map(function(col) { return col; });
      });

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

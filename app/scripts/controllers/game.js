'use strict';

angular.module('aApp')
  .controller('GameCtrl', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {

    var serverUrl = '/api';
    var gameUrl = serverUrl + '/game/' + $routeParams.gameId;
    var turn = libgo.BLACK;
    console.log(libgo);
    $scope.game = libgo.newGame();
    $scope.stones = $scope.game.getBoard().stones;
    $scope.showCoords = false;

    $http.get(gameUrl)
      .success(function (data) { updateGame(data); })
      .error(function (data, status) { console.log('error ' + status); });

    $scope.hover = function (row,column) {

      $scope.stones[row][column] = (turn === libgo.WHITE) ?
                                    libgo.WHITE_HOVER:
                                    libgo.BLACK_HOVER;

    };

    $scope.hoverOut = function (row,column) {

      $scope.stones[row][column] = $scope.game.getBoard().stones[row][column];

    };

    $scope.play = function (row,column) {

      var data = {stone:turn,row:row,column:column};
      turn = (turn === libgo.WHITE) ? libgo.BLACK : libgo.WHITE;
      $http.post(gameUrl,data)
        .success(function (data) { updateGame(data); })
        .error(function (data, status) { console.log('error ' + status); });

    };

    function updateGame (data) {

      var game = libgo.newGame(data);
      var board = game.getBoard();
      $scope.game = game;
      $scope.stones = board.stones.map(function (row) {
        return row.map(function(col) { return col; });
      });

    }

  }]);

'use strict';

angular.module('aApp')
  .controller('GameCtrl', ['$scope', '$http', '$routeParams', 'libgo',
  function ($scope, $http, $routeParams, libgo) {

    function ajaxError(data, status) { console.log('error ' + status); }

    function updateGame (data) {

      game = libgo.newGame(data);
      var board = game.getBoard();
      $scope.stones = board.stones.map(function (row) {
        return row.map(function(col) { return col; });
      });

    }

    var serverUrl = '/api';
    var gameUrl = serverUrl + '/game/' + $routeParams.gameId;
    var turn = libgo.BLACK;
    //var newGameStream = Bacon.fromPromise(wre);
    var game = libgo.newGame();
    $scope.moves = game.getBoard().moves;
    $scope.stones = game.getBoard().stones;
    $scope.showCoords = false;
    var moveStream = $scope.$watchAsProperty('moves');

    $http.get(gameUrl)
      .success(updateGame)
      .error(ajaxError);
    
    $scope.hover = function (row,column) {

      var canPlay = game.isMoveOk({stone:turn,row:row,column:column});
      
      if (canPlay) {

        $scope.stones[row][column] = (turn === libgo.WHITE) ?
          libgo.WHITE_HOVER: libgo.BLACK_HOVER;

      }

    };

    $scope.hoverOut = function (row,column) {

      $scope.stones[row][column] = game.getBoard().stones[row][column];

    };

    $scope.play = function (row,column) {

      var data = {stone:turn,row:row,column:column};
      turn = (turn === libgo.WHITE) ? libgo.BLACK : libgo.WHITE;
      $http.post(gameUrl,data)
        .success(updateGame)
        .error(ajaxError);

    };

  }]);

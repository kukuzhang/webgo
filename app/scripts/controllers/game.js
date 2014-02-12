'use strict';

angular.module('aApp')
  .controller('GameCtrl', ['$scope', '$http', '$routeParams', 'libgo',
  function ($scope, $http, $routeParams, libgo) {

    function ajaxError(data, status) { console.log('error ' + status); }

    function updateGame (data) {

      game = libgo.newGame(data);
      turn = game.getTurn();
      var board = game.getBoard();
      $scope.stones = board.stones.map(function (row) {
        return row.map(function(col) { return col; });
      });

    }

    function apiPlay(move) {

      console.log('play',move);
      $http.post(apiUrl,move)
        .success(updateGame)
        .error(ajaxError);

    };

    var apiUrl = '/api/game/' + $routeParams.gameId;
    var turn = libgo.BLACK;
    //var newGameStream = Bacon.fromPromise(wre);
    var game = libgo.newGame();
    $scope.stones = game.getBoard().stones;
    $scope.showCoords = false;

    $http.get(apiUrl)
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

    $scope.pass = function () {

      apiPlay({stone:turn,type:'pass'});

    };

    $scope.resign = function () {

      apiPlay({stone:turn,type:'resign'});

    };

    $scope.play = function (row,column) {

      apiPlay({stone:turn,type:'stone',row:row,column:column});

    }

  }]);

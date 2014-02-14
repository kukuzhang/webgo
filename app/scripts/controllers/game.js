'use strict';

angular.module('aApp')
  .controller('GameCtrl', ['$scope', '$http', '$routeParams', 'libgo',
  function ($scope, $http, $routeParams, libgo) {

    function ajaxError(data, status) { console.log('error ' + status); }

    function updateGame (data) {

      if (data !== undefined) game = libgo.newGame(data);
      turn = game.getTurn();
      $scope.stones = game.getBoard().stones;
      $scope.black = game.black;
      $scope.white = game.white;
      console.log(game);
      console.log('Last move: ', game.moves[game.moves.length - 1]);
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
    updateGame();
    $scope.showCoords = false;

    $http.get(apiUrl)
      .success(updateGame)
      .error(ajaxError);
    
    $scope.hover = function (row,column) {

      var json = {type:'stone',stone:turn,row:row,column:column};
      var move = libgo.json2Move(json);
      var canPlay = game.isMoveOk(move);
      
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

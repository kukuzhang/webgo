'use strict';

angular.module('aApp')
  .controller('GameCtrl', ['$scope', '$http', '$routeParams', 'libgo',
  function ($scope, $http, $routeParams, libgo) {

    function ajaxError(data, status) { console.log('error ' + status); }

    function game2Scope () {

      $scope.turn = game.getTurn();
      $scope.stones = game.getBoard().stones;
      $scope.black = {
        name: game.black.name,
        timing: game.black.timing,
        color: 'black',
        turn: $scope.turn === libgo.BLACK
      }
      $scope.white = {
        name: game.white.name,
        timing: game.white.timing,
        color: 'white',
        turn: $scope.turn === libgo.WHITE
      }
      console.log('Last move: ', game.moves[game.moves.length - 1]);
      console.log('Turn: ', $scope.turn);
      var board = game.getBoard();
      $scope.stones = board.stones.map(function (row) {
        return row.map(function(col) { return col; });
      });

    }

    function updateGame (data) {

      game = libgo.newGame(data);
      //$scope.$apply(game2Scope);
      game2Scope();

    }

    function apiPlay(move) {

      console.log('play',move);
      $http.post(apiUrl,move)
        .success(updateGame)
        .error(ajaxError);

    };

    var apiUrl = '/api/game/' + $routeParams.gameId;
    //var newGameStream = Bacon.fromPromise(wre);
    var game = libgo.newGame();
    game2Scope();
    $scope.showCoords = true;
    $http.get(apiUrl)
      .success(updateGame)
      .error(ajaxError);
    
    $scope.hover = function (row,column) {

      var json = {type:'stone',stone:$scope.turn,row:row,column:column};
      var move = libgo.json2Move(json);
      var canPlay = game.isMoveOk(move);
      
      if (canPlay) {

        $scope.stones[row][column] = ($scope.turn === libgo.WHITE) ?
          libgo.WHITE_HOVER: libgo.BLACK_HOVER;

      }

    };

    $scope.hoverOut = function (row,column) {

      $scope.stones[row][column] = game.getBoard().stones[row][column];

    };

    $scope.pass = function () {

      apiPlay({stone:$scope.turn,type:'pass'});

    };

    $scope.resign = function () {

      apiPlay({stone:$scope.turn,type:'resign'});

    };

    $scope.play = function (row,column) {

      apiPlay({stone:$scope.turn,type:'stone',row:row,column:column});

    }

  }]);

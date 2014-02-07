'use strict';

angular.module('aApp')
  .controller('GameCtrl', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {

    var BLACK = 'b';
    var WHITE = 'w';
    //var EMPTY = '_';
    var serverUrl = '/api';
    var gameUrl = serverUrl + '/game/' + $routeParams.gameId;
    var turn = BLACK;
    $scope.game = {};
    $scope.myboard = [];
    $scope.showCoords = false;

    $http.get(gameUrl)
      .success(function (data) {
        setNewGame(data);
      })
      .error(function (data, status) {
        console.log('error ' + status);
      });

    $scope.play = function (row,column) {

      var data = {stone:turn,row:row,column:column};
      turn = (turn === WHITE) ? BLACK : WHITE;
      $http.post(gameUrl,data)
        .success(function (data) {
          setNewGame(data);
        })
        .error(function (data, status) {
          console.log('error ' + status);
        });

    };

    function setNewGame (game) {

      $scope.game = game;
      console.log(game);
      $scope.myboard = game.boards[game.boards.length-1].stones;

    }

  }]);

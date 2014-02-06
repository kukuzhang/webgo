'use strict';

angular.module('aApp')
  .controller('GameCtrl', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {

    var BLACK = 'b';
    var WHITE = 'w';
    var EMPTY = '_';
    var serverUrl = '/api';
    var gameUrl = serverUrl + '/game/' + $routeParams.gameId;
    var turn = WHITE;
    $scope.myboard = [];
    $scope.showCoords = false;

    $http.get(gameUrl)
    .success(function (data, status, headers, config) {
      $scope.myboard = data;
    })
    .error(function (data, status, headers, config) {
      console.log('error ' + status);
    });

    $scope.play = function (row,col) {

      var data = {stone:turn,row:row,col:col};
      turn = (turn === WHITE) ? BLACK : WHITE;
      $http.post(gameUrl,data)
      .success(function (data, status, headers, config) {
        $scope.myboard = data;
      })
      .error(function (data, status, headers, config) {
        console.log('error ' + status);
      });

    };

  }]);

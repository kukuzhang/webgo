'use strict';

//angular.module('aApp', ['webgoFilters']);
angular.module('aApp')
.controller('MainCtrl', function ($scope) {

  function getInitialBoard() {

    var board = [];

    for (var i=0;i<19;i++) {

      board[i] = [];

      for (var j=0;j<19;j++) {

        board[i][j] = EMPTY;

      }

    }

    board[3][4] = BLACK;
    board[5][3] = WHITE;
    board[4][6] = BLACK;
    board[3][2] = WHITE;
    board[2][3] = BLACK;
    board[8][3] = WHITE;

    return board;

  }

  var BLACK = 'b';
  var WHITE = 'w';
  var EMPTY = '_';
  $scope.myboard = getInitialBoard();
  $scope.showCoords = false;

});

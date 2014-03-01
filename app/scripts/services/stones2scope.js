'use strict';

angular.module('aApp')
  .factory('stones2Scope', ['libgo', function Stones2scope(libgo) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return function ($scope, board, scoreBoard) {

      if (!$scope.stones) { $scope.stones = []; }

      for (var row=0; row < board.boardSize; row++) {

        if (!$scope.stones[row]) { $scope.stones[row] = []; }

        for (var column=0; column < board.boardSize; column++) {

          var score = scoreBoard && scoreBoard(board.point2Index(row,column));
          var stone = board.getStone(row,column);
          var newContent = (score && score !== libgo.EMPTY) ? score : stone;

          if ($scope.stones[row][column] !== newContent) {

            $scope.stones[row][column] = newContent;

          }


        }

      }

    };

  }]);


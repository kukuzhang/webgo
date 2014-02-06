'use strict';

(function () {
  var BLACK = 'b';
  var WHITE = 'w';
  var EMPTY = '_';
  angular.module('aApp')
  .filter('stoneUrl', function () {
    return function (content) {
      if (content === EMPTY) { return 'images/empty.png'; }
      else if (content === BLACK) { return 'images/black.png'; }
      else if (content === WHITE) { return 'images/white.png'; }
    };
  })
  .filter('stoneCount', function () {
    return function (board) {
      var sum = 0;
      for (var i=0; i<19;i++) {
        for (var j=0; j<19;j++) {
          sum += (board[i][j] !== EMPTY) ? 1 : 0;
        }
      }
      return sum;
    };
  });
})();

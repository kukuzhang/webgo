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
    });
})();

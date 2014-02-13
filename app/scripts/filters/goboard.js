'use strict';

angular.module('aApp')
  .filter('stoneClass', ['libgo',function (libgo) {

    var map = {};
    map[libgo.EMPTY] = 'empty';
    map[libgo.BLACK] = 'black';
    map[libgo.WHITE] = 'white';
    map[libgo.BLACK_HOVER] = 'black-hover';
    map[libgo.WHITE_HOVER] = 'white-hover';

    return function (content) { return 'webgo-stone-' + map[content]; };

  }])
  .filter('stoneUrl', ['libgo',function (libgo) {

    var map = {};
    map[libgo.EMPTY] = 'images/empty.png';
    map[libgo.BLACK] = 'images/black.png';
    map[libgo.WHITE] = 'images/white.png';
    map[libgo.BLACK_HOVER] = 'images/black-hover.png';
    map[libgo.WHITE_HOVER] = 'images/white-hover.png';

    return function (content) { return map[content]; };

  }])
  .filter('stoneCount', ['libgo',function (libgo) {

    return function (stones) {

      var sum = 0;
      var boardSize = stones.length;

      for (var i=0; i<boardSize;i++) {

        for (var j=0; j<boardSize;j++) {

          sum += (stones[i][j] !== libgo.EMPTY) ? 1 : 0;

        }

      }

      return sum;

    };

  }]);

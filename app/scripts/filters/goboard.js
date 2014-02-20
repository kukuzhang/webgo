'use strict';

angular.module('aApp')
  .filter('stoneClass', ['libgo',function (libgo) {

    var map = {};
    map[libgo.EMPTY] = 'empty';
    map[libgo.BLACK] = 'black';
    map[libgo.WHITE] = 'white';
    map[libgo.BLACK_HOVER] = 'black-hover';
    map[libgo.WHITE_HOVER] = 'white-hover';
    map[libgo.BLACK_POINT] = 'black-point';
    map[libgo.WHITE_POINT] = 'white-point';
    map[libgo.BLACK_DEAD] = 'black-dead';
    map[libgo.WHITE_DEAD] = 'white-dead';

    return function (content) { return 'webgo-stone-' + map[content]; };

  }])
  .filter('stoneCount', ['libgo',function (libgo) {

    var occupied = {};
    occupied[libgo.BLACK]= true;
    occupied[libgo.WHITE]= true;

    return function (stones) {

      var sum = 0;
      var boardSize = stones.length;

      for (var i=0; i<boardSize;i++) {

        for (var j=0; j<boardSize;j++) {

          sum += occupied[stones[i][j]] ? 1 : 0;

        }

      }

      return sum;

    };

  }]);

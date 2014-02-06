'use strict';

angular.module('aApp')
  .directive('goboard', function () {

    return {
      templateUrl: 'views/goboard.html',
      restrict: 'E',
      //require: '^board',
      scope: {
        board: '=',
        coords: '=',
        stoneSize: '=',
        cbPlay: '&'
      },

      link: function (scope,elem,attrs) {
        
        var board = scope.board;
        var boardSize = scope.board.length;
        scope.play = function (r,c) {
            console.log(r,c);
            scope.playcb({row:r,col:c});
        };
        console.log(scope,elem,attrs);
        elem.find('img')
          .css('width',attrs.stoneSize)
          .css('height',attrs.stoneSize);

        scope.cellClass = function (row,col) {

          var classes = [];
          if (row === 0) { classes.push('top'); }
          if (col === 0) { classes.push('left'); }
          if (row === boardSize-1) { classes.push('bottom'); }
          if (col === boardSize-1) { classes.push('right'); }
          return classes;

        };

      },

    };

  });

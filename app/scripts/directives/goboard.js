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

      link: function (scope,elem) {
        
        scope.play = function (r,c) {
          console.log(r,c);
          scope.playcb({row:r,col:c});
        };

        console.log(elem.find('img'));
        scope.cellClass = function (row,col) {

          var boardSize = scope.board.length;
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

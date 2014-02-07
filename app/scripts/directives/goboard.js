'use strict';

angular.module('aApp')
  .directive('goboard', function () {

    return {
      templateUrl: 'views/goboard.html',
      restrict: 'E',
      //require: '^stones',
      scope: {
        stones: '=',
        coords: '=',
        stoneSize: '=',
        cbPlay: '&',
        cbHover: '&',
        cbHoverOut: '&'
      },

      link: function (scope,elem) {
        
        console.log(scope);
        scope.cellClass = function (row,col) {

          var boardSize = scope.stones.length;
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

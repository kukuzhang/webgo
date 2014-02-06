'use strict';

angular.module('aApp')
  .directive('goboard', function () {
    var BLACK = 'b';
    var WHITE = 'w';
    var EMPTY = '_';

    return {
      templateUrl: 'views/goboard.html',
      restrict: 'E',
      //require: '^board',
      scope: {
        board: '=',
        coords: '=',
        stoneSize: '='
      },

      link: function (scope,elem,attrs) {
        
        var size = attrs.stoneSize;
        var board = scope.board;
        console.log(scope,elem,attrs);
        elem.find('img').css('width',size).css('height',size);

        scope.cellClass = function (row,col) {

          var classes = [];
          if (row == 0) { classes.push('top'); }
          if (col == 0) { classes.push('left'); }
          if (row == 18) { classes.push('bottom'); }
          if (col == 18) { classes.push('right'); }
          return classes;

        };

        scope.play = function (row,col) {

          var content = board[row][col];
          board[row][col] = (content === EMPTY) ? BLACK:
            (content === BLACK) ? WHITE :
            EMPTY;

        };

      },

    };

  });

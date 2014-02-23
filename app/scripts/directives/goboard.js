'use strict';

angular.module('aApp')
  .directive('coord', ['jquery', function ($) {
    return {
      scope: {
        coord: '=',
        size: '=',
        display: '='
      },

      restrict: 'A',

      link: function (scope,elem, attrs) {
        
        var coord = scope.coord + 1;
        var size = scope.size || 32;
        var $d = $('<div/>')
          .css('width',size)
          .css('height',size);
        elem.html($d);
        elem.addClass('webgo-coord');
        $d.html(coord);


        scope.$watch('display', function (val) {
          $d.css('visibility',val ? 'visible' : 'hidden');
        });

        if (isNaN(coord)) {coord = '';}

      },

    };
  }])
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

      link: function (scope) {
        
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
